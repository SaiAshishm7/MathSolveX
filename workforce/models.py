from django.db import models

class OptimizationParameters(models.Model):
    skilled_cost = models.FloatField(default=300)
    semi_skilled_cost = models.FloatField(default=150)
    skilled_production = models.FloatField(default=10)
    semi_skilled_production = models.FloatField(default=4)
    budget = models.FloatField(default=6000)
    min_production = models.FloatField(default=100)
    max_skilled_workers = models.IntegerField(default=30)
    max_semi_skilled_workers = models.IntegerField(default=60)
    
    def __str__(self):
        return f"Optimization Parameters (ID: {self.id})"

class Worker(models.Model):
    SKILL_CHOICES = [
        ('skilled', 'Skilled'),
        ('semi_skilled', 'Semi-Skilled'),
    ]
    
    name = models.CharField(max_length=100)
    skill_level = models.CharField(max_length=20, choices=SKILL_CHOICES)
    max_shifts_per_week = models.IntegerField(default=5)
    
    def __str__(self):
        return f"{self.name} ({self.skill_level})"

class Shift(models.Model):
    SHIFT_TYPES = [
        ('morning', 'Morning'),
        ('afternoon', 'Afternoon'),
        ('night', 'Night'),
    ]
    
    date = models.DateField()
    shift_type = models.CharField(max_length=20, choices=SHIFT_TYPES)
    required_skilled = models.IntegerField()
    required_semi_skilled = models.IntegerField()
    
    class Meta:
        unique_together = ['date', 'shift_type']
    
    def __str__(self):
        return f"{self.date} - {self.shift_type}"

class ShiftAssignment(models.Model):
    worker = models.ForeignKey(Worker, on_delete=models.CASCADE)
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ['worker', 'shift']
    
    def __str__(self):
        return f"{self.worker} assigned to {self.shift}"

class OptimizationResult(models.Model):
    parameters = models.ForeignKey(OptimizationParameters, on_delete=models.CASCADE)
    skilled_workers = models.IntegerField()
    semi_skilled_workers = models.IntegerField()
    total_production = models.FloatField()
    budget_used = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Result: {self.skilled_workers} skilled, {self.semi_skilled_workers} semi-skilled"
