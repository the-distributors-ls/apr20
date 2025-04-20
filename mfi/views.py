from rest_framework import generics
from .models import MicroFinanceInstitution
from .serializers import MicroFinanceInstitutionSerializer

class MFIListView(generics.ListAPIView):
    queryset = MicroFinanceInstitution.objects.all()
    serializer_class = MicroFinanceInstitutionSerializer