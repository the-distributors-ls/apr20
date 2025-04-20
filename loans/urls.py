from django.urls import path
from .views import (
    LoanApplicationListCreateView,
    LoanApplicationDetailView,
    LoanDecisionView,
    LoanStatusUpdatesView,
    MFILoansView,
)

urlpatterns = [
    path('', LoanApplicationListCreateView.as_view(), name='loan-list-create'),
    path('<int:pk>/', LoanApplicationDetailView.as_view(), name='loan-detail'),
    path('<int:pk>/decision/', LoanDecisionView.as_view(), name='loan-decision'),
    path('<int:loan_id>/status-updates/', LoanStatusUpdatesView.as_view(), name='loan-status-updates'),
    path('mfi-loans/<str:cluster>/', MFILoansView.as_view(), name='mfi-loans'),
]