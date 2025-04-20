from django.urls import path
from . import views

urlpatterns = [
    path('history/', views.CreditHistoryView.as_view(), name='credit-history'),
]