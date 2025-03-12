from django.shortcuts import render, redirect
from django.views import View
from django.views.generic import TemplateView
from django.db import OperationalError
from django.db.models import Q, Count
from datetime import datetime, timedelta
from .models import (
    OptimizationParameters, OptimizationResult, Worker, 
    Shift, ShiftAssignment, ProductionLine, LineAssignment
)
from .forms import OptimizationForm, ProductionLineForm
import json
import numpy as np
from pulp import *

def check_shift_gap_rule(worker, shift):
    """
    Check if assigning this shift would violate the 2-shift gap rule.
    Returns True if the assignment is allowed, False otherwise.
    """
    # Get all shifts assigned to this worker within 2 shifts before and after
    shift_date = shift.date
    shift_type = shift.shift_type
    
    # Define shift order
    shift_order = {'morning': 0, 'afternoon': 1, 'night': 2}
    current_shift_index = shift_order[shift_type]
    
    # Calculate date range to check (2 days before and after)
    start_date = shift_date - timedelta(days=2)
    end_date = shift_date + timedelta(days=2)
    
    # Get existing assignments in this range
    existing_assignments = ShiftAssignment.objects.filter(
        worker=worker,
        shift__date__range=(start_date, end_date)
    ).select_related('shift')
    
    for assignment in existing_assignments:
        assigned_date = assignment.shift.date
        assigned_type = assignment.shift.shift_type
        assigned_index = shift_order[assigned_type]
        
        # Calculate shift difference
        date_diff = (shift_date - assigned_date).days
        shift_diff = current_shift_index - assigned_index
        total_shifts_between = date_diff * 3 + shift_diff
        
        # If less than 2 shifts between assignments, rule is violated
        if abs(total_shifts_between) < 2:
            return False
    
    return True

def balance_production_lines(shift, assigned_workers):
    """
    Optimize the assignment of workers to production lines for a given shift.
    Uses linear programming to maximize production while respecting line constraints.
    """
    # Get all production lines
    production_lines = ProductionLine.objects.all().order_by('-priority')
    
    # If no production lines exist, return empty assignments
    if not production_lines.exists():
        return []
    
    # Create optimization problem
    prob = LpProblem("ProductionLineBalancing", LpMaximize)
    
    # Create variables for worker assignments to lines
    assignments = {}
    for worker in assigned_workers:
        for line in production_lines:
            assignments[(worker.id, line.id)] = LpVariable(
                f"worker_{worker.id}_line_{line.id}",
                0, 1, LpBinary
            )
    
    # Objective: Maximize weighted production across all lines
    prob += lpSum([
        assignments[(w.id, l.id)] * l.production_rate * l.priority
        for w in assigned_workers
        for l in production_lines
    ])
    
    # Constraint 1: Each worker can only be assigned to one line
    for worker in assigned_workers:
        prob += lpSum([
            assignments[(worker.id, line.id)]
            for line in production_lines
        ]) == 1
    
    # Constraint 2: Minimum and maximum workers per line
    for line in production_lines:
        worker_count = lpSum([
            assignments[(w.id, line.id)]
            for w in assigned_workers
        ])
        prob += worker_count >= line.min_workers_required
        prob += worker_count <= line.max_workers
    
    # Constraint 3: Skilled worker ratio requirement
    for line in production_lines:
        skilled_workers = lpSum([
            assignments[(w.id, line.id)]
            for w in assigned_workers
            if w.skill_level == 'skilled'
        ])
        total_workers = lpSum([
            assignments[(w.id, line.id)]
            for w in assigned_workers
        ])
        prob += skilled_workers >= line.skilled_ratio_required * total_workers
    
    # Solve the problem
    prob.solve()
    
    # Create assignments based on solution
    line_assignments = []
    if LpStatus[prob.status] == 'Optimal':
        for worker in assigned_workers:
            for line in production_lines:
                if value(assignments[(worker.id, line.id)]) == 1:
                    # Get the shift assignment for this worker
                    shift_assignment = ShiftAssignment.objects.get(
                        worker=worker,
                        shift=shift
                    )
                    # Create line assignment
                    line_assignments.append(
                        LineAssignment(
                            shift_assignment=shift_assignment,
                            production_line=line
                        )
                    )
    
    return line_assignments

def assign_workers_to_shifts(shift, available_workers):
    """
    Assign workers to a shift while respecting the 2-shift gap rule and then
    balance them across production lines.
    """
    assignments = []
    skilled_needed = shift.required_skilled
    semi_skilled_needed = shift.required_semi_skilled
    
    # Sort workers by number of assigned shifts (to balance workload)
    available_workers = sorted(
        available_workers,
        key=lambda w: ShiftAssignment.objects.filter(worker=w).count()
    )
    
    for worker in available_workers:
        # Skip if worker already has maximum weekly shifts
        week_start = shift.date - timedelta(days=shift.date.weekday())
        week_end = week_start + timedelta(days=6)
        weekly_shifts = ShiftAssignment.objects.filter(
            worker=worker,
            shift__date__range=(week_start, week_end)
        ).count()
        
        if weekly_shifts >= worker.max_shifts_per_week:
            continue
        
        # Check if worker can be assigned according to 2-shift gap rule
        if not check_shift_gap_rule(worker, shift):
            continue
        
        # Assign worker based on their skill level and remaining need
        if worker.skill_level == 'skilled' and skilled_needed > 0:
            assignments.append(ShiftAssignment(worker=worker, shift=shift))
            skilled_needed -= 1
        elif worker.skill_level == 'semi_skilled' and semi_skilled_needed > 0:
            assignments.append(ShiftAssignment(worker=worker, shift=shift))
            semi_skilled_needed -= 1
        
        # Break if all positions are filled
        if skilled_needed == 0 and semi_skilled_needed == 0:
            break
    
    # Bulk create all assignments
    if assignments:
        ShiftAssignment.objects.bulk_create(assignments)
        
        # Get all workers assigned to this shift
        assigned_workers = Worker.objects.filter(
            shiftassignment__shift=shift
        )
        
        # Balance workers across production lines
        line_assignments = balance_production_lines(shift, assigned_workers)
        
        # Save line assignments
        if line_assignments:
            LineAssignment.objects.bulk_create(line_assignments)
    
    return len(assignments)

class OptimizationView(TemplateView):
    template_name = 'index.html'
    
    def get(self, request):
        try:
            # Get or create default parameters
            params, created = OptimizationParameters.objects.get_or_create(id=1)
            form = OptimizationForm(instance=params)
            
            # Get the latest result if it exists
            latest_result = OptimizationResult.objects.filter(parameters=params).last()
            
            # Get upcoming shifts and their assignments
            upcoming_shifts = Shift.objects.filter(
                date__gte=datetime.now().date()
            ).order_by('date', 'shift_type')
            
            # Get shift assignments and line assignments
            shift_data = {}
            for shift in upcoming_shifts:
                assignments = ShiftAssignment.objects.filter(shift=shift).select_related('worker')
                line_assignments = LineAssignment.objects.filter(
                    shift_assignment__shift=shift
                ).select_related('production_line', 'shift_assignment__worker')
                
                shift_data[shift.id] = {
                    'assignments': assignments,
                    'line_assignments': line_assignments
                }
            
            # Get production lines
            production_lines = ProductionLine.objects.all().order_by('-priority')
            
            context = {
                'form': form,
                'result': latest_result,
                'upcoming_shifts': upcoming_shifts,
                'shift_data': shift_data,
                'production_lines': production_lines,
            }
            
            return render(request, self.template_name, context)
            
        except OperationalError:
            return render(request, self.template_name)
    
    def post(self, request):
        try:
            # Get or create default parameters
            params, created = OptimizationParameters.objects.get_or_create(id=1)
            
            # Update parameters with form data
            form = OptimizationForm(request.POST, instance=params)
            if form.is_valid():
                params = form.save()
                
                # Solve the optimization problem
                solution = self.solve_workforce_optimization(params)
                
                # Create a new result object
                OptimizationResult.objects.create(
                    parameters=params,
                    skilled_workers=solution['skilled_workers'],
                    semi_skilled_workers=solution['semi_skilled_workers'],
                    total_production=solution['total_production'],
                    budget_used=solution['budget_used'],
                )
                
                return redirect('optimize')
            
            context = {
                'form': form,
            }
            
            return render(request, 'workforce/optimize.html', context)
        except OperationalError:
            # Database is not ready yet, just render the template
            return render(request, self.template_name)
    
    def solve_workforce_optimization(self, params):
        """
        Solve the workforce optimization problem using the provided parameters.
        Uses a linear programming approach to maximize production subject to constraints.
        """
        # Define all possible corner points of the feasible region
        corner_points = []
        
        # Origin
        corner_points.append((0, 0))
        
        # Budget constraint line: skilled_cost*x + semi_skilled_cost*y = budget
        # Intersections with axes
        if params.skilled_cost > 0:
            corner_points.append((params.budget / params.skilled_cost, 0))
        if params.semi_skilled_cost > 0:
            corner_points.append((0, params.budget / params.semi_skilled_cost))
        
        # Budget constraint intersections with availability constraints
        if params.skilled_cost > 0 and params.semi_skilled_cost > 0:
            # Intersection with x = max_skilled_workers
            y = (params.budget - params.skilled_cost * params.max_skilled_workers) / params.semi_skilled_cost
            if y >= 0:
                corner_points.append((params.max_skilled_workers, y))
            
            # Intersection with y = max_semi_skilled_workers
            x = (params.budget - params.semi_skilled_cost * params.max_semi_skilled_workers) / params.skilled_cost
            if x >= 0:
                corner_points.append((x, params.max_semi_skilled_workers))
        
        # Production constraint line: skilled_production*x + semi_skilled_production*y = min_production
        # Intersections with axes
        if params.skilled_production > 0:
            corner_points.append((params.min_production / params.skilled_production, 0))
        if params.semi_skilled_production > 0:
            corner_points.append((0, params.min_production / params.semi_skilled_production))
        
        # Production constraint intersections with availability constraints
        if params.skilled_production > 0 and params.semi_skilled_production > 0:
            # Intersection with x = max_skilled_workers
            y = (params.min_production - params.skilled_production * params.max_skilled_workers) / params.semi_skilled_production
            if y >= 0:
                corner_points.append((params.max_skilled_workers, y))
            
            # Intersection with y = max_semi_skilled_workers
            x = (params.min_production - params.semi_skilled_production * params.max_semi_skilled_workers) / params.skilled_production
            if x >= 0:
                corner_points.append((x, params.max_semi_skilled_workers))
        
        # Add max skilled/semi-skilled workers point
        corner_points.append((params.max_skilled_workers, params.max_semi_skilled_workers))
        
        # Filter valid corners that satisfy all constraints
        valid_corners = []
        for x, y in corner_points:
            # Non-negativity constraint
            if x < 0 or y < 0:
                continue
                
            # Maximum availability constraint
            if x > params.max_skilled_workers or y > params.max_semi_skilled_workers:
                continue
                
            # Budget constraint
            if params.skilled_cost * x + params.semi_skilled_cost * y > params.budget:
                continue
                
            # Minimum production constraint
            if params.skilled_production * x + params.semi_skilled_production * y < params.min_production:
                continue
                
            valid_corners.append((x, y))
        
        # Find corner with maximum production
        best_x = 0
        best_y = 0
        max_production_value = 0
        
        for x, y in valid_corners:
            production = params.skilled_production * x + params.semi_skilled_production * y
            if production > max_production_value:
                max_production_value = production
                best_x = x
                best_y = y
        
        # Round to nearest integer (workforce must be whole numbers)
        best_x = int(round(best_x))
        best_y = int(round(best_y))
        
        # Handle case when no valid corners were found (infeasible problem)
        if not valid_corners:
            # Try to find a solution that minimizes the constraint violations
            # For simplicity, we'll just use the maximum possible workforce
            best_x = params.max_skilled_workers
            best_y = params.max_semi_skilled_workers
        
        # Recalculate with rounded values
        actual_production = params.skilled_production * best_x + params.semi_skilled_production * best_y
        actual_budget_used = params.skilled_cost * best_x + params.semi_skilled_cost * best_y
        
        return {
            'skilled_workers': best_x,
            'semi_skilled_workers': best_y,
            'total_workers': best_x + best_y,
            'total_production': actual_production,
            'budget_used': actual_budget_used,
            'budget_remaining': params.budget - actual_budget_used,
        }
    
    def solve_with_budget(self, params, test_budget):
        """
        Perform sensitivity analysis by solving with a test budget.
        Returns the optimal solution for the given budget.
        """
        # We'll use a simpler approach for sensitivity analysis
        # Determine ratios of production/cost for each worker type
        skilled_efficiency = params.skilled_production / params.skilled_cost
        semi_skilled_efficiency = params.semi_skilled_production / params.semi_skilled_cost
        
        # Allocate budget to more efficient worker type first
        skilled_workers = 0
        semi_skilled_workers = 0
        
        if skilled_efficiency >= semi_skilled_efficiency:
            # Skilled workers are more efficient, prioritize them
            skilled_workers = min(params.max_skilled_workers, test_budget // params.skilled_cost)
            remaining_budget = test_budget - skilled_workers * params.skilled_cost
            semi_skilled_workers = min(params.max_semi_skilled_workers, remaining_budget // params.semi_skilled_cost)
        else:
            # Semi-skilled workers are more efficient, prioritize them
            semi_skilled_workers = min(params.max_semi_skilled_workers, test_budget // params.semi_skilled_cost)
            remaining_budget = test_budget - semi_skilled_workers * params.semi_skilled_cost
            skilled_workers = min(params.max_skilled_workers, remaining_budget // params.skilled_cost)
        
        # Calculate production
        production = params.skilled_production * skilled_workers + params.semi_skilled_production * semi_skilled_workers
        
        # Check if minimum production constraint is met
        if production < params.min_production:
            # If not, try to find a feasible solution
            # This is a simplification - a real solver would use a more sophisticated approach
            
            # Try various combinations until we find one that meets the minimum production
            best_production = 0
            best_skilled = 0
            best_semi = 0
            
            for s in range(min(params.max_skilled_workers + 1, (test_budget // params.skilled_cost) + 1)):
                remaining = test_budget - s * params.skilled_cost
                sm = min(params.max_semi_skilled_workers, remaining // params.semi_skilled_cost)
                
                prod = s * params.skilled_production + sm * params.semi_skilled_production
                
                if prod >= params.min_production and prod > best_production:
                    best_production = prod
                    best_skilled = s
                    best_semi = sm
            
            return {
                'skilled': best_skilled,
                'semi_skilled': best_semi,
                'production': best_production if best_production > 0 else 0
            }
        
        return {
            'skilled': skilled_workers,
            'semi_skilled': semi_skilled_workers,
            'production': production
        }

class ProductionLineView(View):
    template_name = 'workforce/production_lines.html'
    
    def get(self, request):
        production_lines = ProductionLine.objects.all().order_by('-priority')
        form = ProductionLineForm()
        
        context = {
            'production_lines': production_lines,
            'form': form
        }
        return render(request, self.template_name, context)
    
    def post(self, request):
        form = ProductionLineForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('production_lines')
        
        production_lines = ProductionLine.objects.all().order_by('-priority')
        context = {
            'production_lines': production_lines,
            'form': form
        }
        return render(request, self.template_name, context)
