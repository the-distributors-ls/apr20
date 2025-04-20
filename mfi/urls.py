from django.urls import path
from . import views

urlpatterns = [
    # Add your MFI-related endpoints here
    path('', views.MFIListView.as_view(), name='mfi-list'),
]