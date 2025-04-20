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
from django.db import connection
from django.conf import settings

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
        """Create the loan in the respective MFI's database via FDW"""
        try:
            if loan.mfi.cluster_name == 'mfi_a':  # Match your cluster name exactly
                with connection.cursor() as cursor:
                    # Insert into MFI's loans table via FDW
                    cursor.execute(f"""
                        INSERT INTO mfi_a.loans (
                            borrower_id, amount, interest_rate, 
                            status, purpose, application_date,
                            approval_date, term_months, external_reference
                        )
                        VALUES (
                            %s, %s, %s, 
                            %s, %s, %s,
                            %s, %s, %s
                        )
                        RETURNING id
                    """, [
                        loan.borrower.borrower_profile.national_id,  # Assuming you store MFI borrower ID
                        float(loan.amount),
                        float(loan.interest_rate),
                        'approved',  # Initial status in MFI system
                        loan.purpose,
                        loan.application_date,
                        timezone.now(),
                        loan.term_months,
                        f"LETSEMA-{loan.id}"  # External reference back to your system
                    ])
                    
                    # Get the inserted loan ID from MFI system
                    mfi_loan_id = cursor.fetchone()[0]
                    loan.external_loan_id = mfi_loan_id
                    loan.save()
                    
        except Exception as e:
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
    
# views.py
class MFILoansView(generics.ListAPIView):
    """View loans in MFI systems via FDW"""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def get(self, request, *args, **kwargs):
        cluster = kwargs.get('cluster', 'mfi_a')
        
        if cluster not in ['mfi_a', 'mfi_b']:
            return Response({"error": "Invalid cluster"}, status=400)
            
        with connection.cursor() as cursor:
            cursor.execute(f"""
                SELECT l.id, b.name, l.amount, l.status, l.application_date
                FROM {cluster}.loans l
                JOIN {cluster}.borrowers b ON l.borrower_id = b.id
                ORDER BY l.application_date DESC
                LIMIT 100
            """)
            
            columns = [col[0] for col in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
        return Response(results)