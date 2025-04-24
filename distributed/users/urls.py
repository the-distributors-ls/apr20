from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CustomTokenObtainPairView, UserRegistrationView, validate_token

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', UserRegistrationView.as_view(), name='register'),
   path('validate-token/', validate_token, name='validate_token'),
    path('user/', validate_token, name='get_user'),  # Added user endpoint that maps to validate_token

]