from pulp import *
import numpy as np

def solve_knapsack(values, weights, capacity):
    """
    Solve the 0/1 Knapsack problem using integer programming.
    
    Args:
        values (list): List of item values
        weights (list): List of item weights
        capacity (float): Maximum capacity of the knapsack
        
    Returns:
        tuple: (selected_items, total_value, total_weight)
    """
    n = len(values)
    
    # Create the optimization problem
    prob = LpProblem("Knapsack_Problem", LpMaximize)
    
    # Create binary variables for each item
    x = LpVariable.dicts("item", range(n), 0, 1, LpBinary)
    
    # Objective function: maximize total value
    prob += lpSum([values[i] * x[i] for i in range(n)])
    
    # Constraint: total weight must be less than or equal to capacity
    prob += lpSum([weights[i] * x[i] for i in range(n)]) <= capacity
    
    # Solve the problem
    prob.solve()
    
    # Get the results
    selected_items = [i for i in range(n) if x[i].value() == 1]
    total_value = value(prob.objective)
    total_weight = sum(weights[i] for i in selected_items)
    
    return selected_items, total_value, total_weight

def format_solution(selected_items, total_value, total_weight, values, weights):
    """
    Format the solution for display.
    """
    return {
        'selected_items': selected_items,
        'total_value': round(total_value, 2),
        'total_weight': round(total_weight, 2),
        'item_details': [
            {
                'index': i,
                'value': values[i],
                'weight': weights[i],
                'selected': i in selected_items
            }
            for i in range(len(values))
        ]
    } 