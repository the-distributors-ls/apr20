from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import LoanApplication, LoanStatusUpdate
from .serializers import (
    LoanApplicationSerializer,
    LoanApplicationCreateSerializer,
    LoanDecisionSerializer,
    LoanStatusUpdateSerializer
)
from users.models import User
import requests
from django.utils import timezone
from django.conf import settings
import logging
from rest_framework.exceptions import PermissionDenied

logger = logging.getLogger(__name__)

class LoanApplicationListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return LoanApplicationCreateSerializer
        return LoanApplicationSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_borrower():
            return LoanApplication.objects.filter(borrower=user)
        elif user.is_mfi_employee():
            return LoanApplication.objects.filter(mfi=user.mfi)
        elif user.is_admin():
            return LoanApplication.objects.all()
        return LoanApplication.objects.none()
    
    def perform_create(self, serializer):
        loan = serializer.save(borrower=self.request.user)
        # Create initial status update
        LoanStatusUpdate.objects.create(
            loan=loan,
            old_status='',
            new_status=loan.status,
            updated_by=self.request.user,
            notes='Loan application submitted'
        )

class LoanApplicationDetailView(generics.RetrieveAPIView):
    queryset = LoanApplication.objects.all()
    serializer_class = LoanApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_borrower():
            return LoanApplication.objects.filter(borrower=user)
        elif user.is_mfi_employee():
            return LoanApplication.objects.filter(mfi=user.mfi)
        elif user.is_admin():
            return LoanApplication.objects.all()
        return LoanApplication.objects.none()

class LoanDecisionView(generics.UpdateAPIView):
    queryset = LoanApplication.objects.filter(status=LoanApplication.Status.PENDING)
    serializer_class = LoanDecisionSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def update(self, request, *args, **kwargs):
        loan = self.get_object()
        old_status = loan.status
        serializer = self.get_serializer(loan, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # Update loan status
        loan = serializer.save(
            decision_by=request.user,
            decision_date=timezone.now()
        )
        
        # Create status update record
        LoanStatusUpdate.objects.create(
            loan=loan,
            old_status=old_status,
            new_status=loan.status,
            updated_by=request.user,
            notes=serializer.validated_data.get('notes', '')
        )
        
        # If approved, create loan in MFI's system
        if loan.status == LoanApplication.Status.APPROVED:
            self._create_loan_in_mfi_system(loan)
        
        return Response(serializer.data)
    
    def _create_loan_in_mfi_system(self, loan):
        """Create the loan in the respective MFI's system via API or FDW"""
        try:
            # For simplicity, we'll assume MFIs expose a REST API
            if loan.mfi.api_endpoint:
                payload = {
                    'borrower_id': loan.borrower.borrower_profile.national_id,
                    'amount': str(loan.amount),
                    'term_months': loan.term_months,
                    'interest_rate': str(loan.interest_rate),
                    'purpose': loan.purpose,
                    'letsema_loan_id': loan.id
                }
                
                response = requests.post(
                    f"{loan.mfi.api_endpoint}/loans",
                    json=payload,
                    headers={'Authorization': f"Bearer {settings.MFI_API_KEY}"}
                )
                response.raise_for_status()
                
                # Update with external loan ID
                loan.external_loan_id = response.json().get('loan_id')
                loan.save()
        except Exception as e:
            # Log error and handle appropriately
            logger.error(f"Failed to create loan in MFI system: {str(e)}")
            raise

class LoanStatusUpdatesView(generics.ListAPIView):
    serializer_class = LoanStatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        loan_id = self.kwargs['loan_id']
        user = self.request.user
        
        # Verify user has permission to view this loan's status updates
        loan = LoanApplication.objects.get(pk=loan_id)
        if user.is_borrower() and loan.borrower != user:
            raise PermissionDenied()
        if user.is_mfi_employee() and loan.mfi != user.mfi:
            raise PermissionDenied()
        
        return LoanStatusUpdate.objects.filter(loan_id=loan_id)