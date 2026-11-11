
from django.urls import path

from .cost_cutoff_views import (
    CalculatorInstitutionListView,
    CalculatorInstitutionOptionsView,
    CostCalculationView,
    CutoffTrendsView,
    CutoffHistoryCreateView,
)

urlpatterns = [
    path(
        "cost-calculator/institutions/",
        CalculatorInstitutionListView.as_view(),
        name="calculator-institutions"
    ),

    path(
        "cost-calculator/institutions/<int:institution_id>/",
        CalculatorInstitutionOptionsView.as_view(),
        name="calculator-institution-options"
    ),

    path(
        "cost-calculator/estimate/",
        CostCalculationView.as_view(),
        name="cost-calculation"
    ),

    path(
        "cutoff-trends/",
        CutoffTrendsView.as_view(),
        name="cutoff-trends"
    ),

    path(
        "cutoffs/",
        CutoffHistoryCreateView.as_view(),
        name="create-cutoff"
    ),
]
