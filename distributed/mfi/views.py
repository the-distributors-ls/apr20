from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import MicroFinanceInstitution
from .serializers import MicroFinanceInstitutionSerializer

class MFIListView(generics.ListAPIView):
    serializer_class = MicroFinanceInstitutionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = MicroFinanceInstitution.objects.filter(is_active=True)
        
        # Filter by cluster if provided
        cluster = self.request.query_params.get('cluster')
        if cluster:
            queryset = queryset.filter(cluster_name=cluster)
            
        # Additional filters can be added here (e.g., location-based)
        # Example: Filter by borrower's location if needed
        # if self.request.user.role == 'BORROWER':
        #     queryset = queryset.filter(locations__contains=self.request.user.location)
            
        return queryset

class MFIDetailView(generics.RetrieveAPIView):
    queryset = MicroFinanceInstitution.objects.filter(is_active=True)
    serializer_class = MicroFinanceInstitutionSerializer
    permission_classes = [IsAuthenticated]

class TestConnectionView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        cluster = kwargs.get('cluster')
        # Implement actual connection testing logic here
        return Response({
            'status': 'success',
            'message': f'Connection test for {cluster} cluster',
            'cluster': cluster
        }, status=status.HTTP_200_OK)