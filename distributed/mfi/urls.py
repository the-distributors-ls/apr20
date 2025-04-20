# urls.py - Add new endpoints
from django.urls import path
from . import views

urlpatterns = [
    path('', views.MFIListView.as_view(), name='mfi-list'),
    path('<int:pk>/', views.MFIDetailView.as_view(), name='mfi-detail'),
    path('test-connection/<str:cluster>/', views.TestConnectionView.as_view(), name='test-connection'),
]