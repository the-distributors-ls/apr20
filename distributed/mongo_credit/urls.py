# urls.py - Add these new routes

from django.urls import path
from .views import CreditHistoryView, BorrowerCreditHistoryView

urlpatterns = [
    # ... existing routes ...
    path('credit-history/<str:national_id>/', CreditHistoryView.as_view(), name='credit-history'),
    path('my-credit-history/', BorrowerCreditHistoryView.as_view(), name='borrower-credit-history'),
]