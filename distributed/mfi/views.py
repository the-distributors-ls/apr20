# views.py - Add filtering by cluster and more endpoints
from rest_framework import generics, status
from rest_framework.response import Response
from .models import MicroFinanceInstitution
from .serializers import MicroFinanceInstitutionSerializer

class MFIListView(generics.ListCreateAPIView):
    queryset = MicroFinanceInstitution.objects.all()
    serializer_class = MicroFinanceInstitutionSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        cluster = self.request.query_params.get('cluster')
        if cluster:
            queryset = queryset.filter(cluster_name=cluster)
        return queryset

class MFIDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MicroFinanceInstitution.objects.all()
    serializer_class = MicroFinanceInstitutionSerializer

class TestConnectionView(generics.GenericAPIView):
    def get(self, request, *args, **kwargs):
        cluster = kwargs.get('cluster')
        # Here you would implement actual connection testing logic
        return Response({
            'status': 'success',
            'message': f'Connection test for {cluster} cluster',
            'cluster': cluster
        }, status=status.HTTP_200_OK)