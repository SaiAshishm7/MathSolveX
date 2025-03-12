from django.urls import path
from .views import OptimizationView, ProductionLineView

urlpatterns = [
    path('', OptimizationView.as_view(), name='optimize'),
    path('production-lines/', ProductionLineView.as_view(), name='production_lines'),
]
