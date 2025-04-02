from django.urls import path
from . import views

urlpatterns = [
    path('', views.OptimizationView.as_view(), name='optimization'),
    path('production-lines/', views.ProductionLineView.as_view(), name='production_lines'),
    path('knapsack/', views.KnapsackView.as_view(), name='knapsack'),
]
