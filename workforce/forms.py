from django import forms
from .models import OptimizationParameters, ProductionLine

class OptimizationForm(forms.ModelForm):
    class Meta:
        model = OptimizationParameters
        fields = '__all__'

class ProductionLineForm(forms.ModelForm):
    class Meta:
        model = ProductionLine
        fields = [
            'name',
            'min_workers_required',
            'optimal_workers',
            'max_workers',
            'skilled_ratio_required',
            'production_rate',
            'priority'
        ]
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm'}),
            'min_workers_required': forms.NumberInput(attrs={'class': 'form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm'}),
            'optimal_workers': forms.NumberInput(attrs={'class': 'form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm'}),
            'max_workers': forms.NumberInput(attrs={'class': 'form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm'}),
            'skilled_ratio_required': forms.NumberInput(attrs={'class': 'form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm', 'step': '0.01'}),
            'production_rate': forms.NumberInput(attrs={'class': 'form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm', 'step': '0.1'}),
            'priority': forms.NumberInput(attrs={'class': 'form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm'}),
        }
