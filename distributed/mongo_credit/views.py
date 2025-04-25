from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound, PermissionDenied
from django.http import Http404
from .models import CreditHistory
from .serializers import CreditHistorySerializer
from .permissions import IsBorrower, IsAdminOrMFIEmployee
from .credit_utils import get_letsema_credit_data, get_combined_credit_data, init_mongo_connection
import logging

logger = logging.getLogger(__name__)

class CreditHistoryView(generics.RetrieveAPIView):
    serializer_class = CreditHistorySerializer
    permission_classes = [IsAuthenticated, IsAdminOrMFIEmployee]
    
    def get_object(self):
        national_id = self.kwargs['national_id']
        
        # Try to get from MongoDB first
        try:
            init_mongo_connection()
            return CreditHistory.objects.get(national_id=national_id)
        except CreditHistory.DoesNotExist:
            logger.info(f"Credit history not found in MongoDB for {national_id}, generating from Letsema")
            
            # Generate data from Letsema (and MFIs if available)
            try:
                # First try combined data (Letsema + MFIs)
                credit_data = get_combined_credit_data(national_id)
                if not credit_data:
                    # Fallback to just Letsema data
                    credit_data = get_letsema_credit_data(national_id)
                
                if not credit_data:
                    logger.error(f"No credit data found for {national_id}")
                    raise Http404("Credit history not found")
                    
                # Save to MongoDB and return
                credit_history = CreditHistory(**credit_data)
                credit_history.save()
                return credit_history
                
            except Exception as e:
                logger.error(f"Failed to generate credit history: {str(e)}")
                raise Http404("Credit history not found or could not be generated")

class BorrowerCreditHistoryView(generics.RetrieveAPIView):
    serializer_class = CreditHistorySerializer
    permission_classes = [IsAuthenticated, IsBorrower]
    
    def get_object(self):
        user = self.request.user
        national_id = user.borrower_profile.national_id
        
        # Try to get from MongoDB first
        try:
            init_mongo_connection()
            return CreditHistory.objects.get(national_id=national_id)
        except CreditHistory.DoesNotExist:
            logger.info(f"Credit history not found in MongoDB for user {user.id}, generating from Letsema")
            
            # Generate data from Letsema (and MFIs if available)
            try:
                # First try combined data (Letsema + MFIs)
                credit_data = get_combined_credit_data(national_id)
                if not credit_data:
                    # Fallback to just Letsema data
                    credit_data = get_letsema_credit_data(national_id)
                
                if not credit_data:
                    logger.error(f"No credit data found for {national_id}")
                    raise Http404("Credit history not found")
                    
                # Save to MongoDB and return
                credit_history = CreditHistory(**credit_data)
                credit_history.save()
                return credit_history
                
            except Exception as e:
                logger.error(f"Failed to generate credit history: {str(e)}")
                raise Http404("Credit history not found or could not be generated")