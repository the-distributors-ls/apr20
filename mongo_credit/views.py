from rest_framework import generics, permissions
from rest_framework.exceptions import NotFound
from .models import CreditHistory
from .serializers import CreditHistorySerializer
from users.models import BorrowerProfile

from rest_framework.exceptions import PermissionDenied
class CreditHistoryView(generics.RetrieveAPIView):
    serializer_class = CreditHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        
        if user.is_borrower():
            national_id = user.borrower_profile.national_id
        elif 'national_id' in self.request.query_params and (user.is_mfi_employee() or user.is_admin()):
            national_id = self.request.query_params['national_id']
        else:
            raise PermissionDenied("You don't have permission to view this credit history.")
        
        try:
            credit_history = CreditHistory.objects.get(national_id=national_id)
            return credit_history
        except CreditHistory.DoesNotExist:
            raise NotFound("Credit history not found for this borrower.")