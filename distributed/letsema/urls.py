from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from django.http import HttpResponse

def home(request):
    return HttpResponse("Welcome to Letsema API")

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('api/users/', include('users.urls')),
    path('api/mfi/', include('mfi.urls')),
    path('api/loans/', include('loans.urls')),
    path('api/credit/', include('mongo_credit.urls')),
    path('', home),
]
