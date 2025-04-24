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

# views.py - Update LoanDecisionView permissions and logic
class LoanDecisionView(generics.UpdateAPIView):
    queryset = LoanApplication.objects.filter(status=LoanApplication.Status.PENDING)
    serializer_class = LoanDecisionSerializer
    permission_classes = [permissions.IsAuthenticated]  # Removed IsAdminUser
    
    def check_permissions(self, request):
        super().check_permissions(request)
        if not (request.user.is_admin() or request.user.is_mfi_employee()):
            self.permission_denied(request)
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin():
            return super().get_queryset()
        elif user.is_mfi_employee():
            return super().get_queryset().filter(mfi=user.mfi)
        return super().get_queryset().none()
    
    def update(self, request, *args, **kwargs):
        loan = self.get_object()
        
        # Additional permission check for MFI employees
        if request.user.is_mfi_employee() and loan.mfi != request.user.mfi:
            raise PermissionDenied("You can only process loans for your MFI")
            
        old_status = loan.status
        serializer = self.get_serializer(loan, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        loan = serializer.save(
            decision_by=request.user,
            decision_date=timezone.now()
        )
        
        LoanStatusUpdate.objects.create(
            loan=loan,
            old_status=old_status,
            new_status=loan.status,
            updated_by=request.user,
            notes=serializer.validated_data.get('notes', '')
        )
        
        if loan.status == LoanApplication.Status.APPROVED:
            self._create_loan_in_mfi_system(loan)
        
        return Response(serializer.data)
    
    def _create_loan_in_mfi_system(self, loan):
        """Cluster-specific loan creation"""
        try:
            logger.debug(f"Attempting to create loan in MFI system for loan ID: {loan.id}")
            cluster = loan.mfi.cluster_name
            if not cluster:
                logger.error("MFI has no cluster assigned")
                raise ValueError("MFI has no cluster assigned")
            national_id = loan.borrower.borrower_profile.national_id
            logger.debug(f"Looking for borrower with national_id: {national_id}")


            with connection.cursor() as cursor:
                # Get borrower's external ID from correct cluster
                cursor.execute(f"""
                    SELECT id FROM {cluster}.borrowers 
                    WHERE national_id = %s LIMIT 1
                """, [loan.borrower.borrower_profile.national_id])
                
                borrower_id = cursor.fetchone()

                if not borrower_id:
                    logger.error(f"No borrower found in {cluster} with national_id: {national_id}")
                    raise ValueError(f"Borrower not found in {cluster} system")
                
                logger.debug(f"Found borrower ID: {borrower_id[0]} in {cluster}")
                # Insert loan into correct cluster
                cursor.execute(f"""
                    INSERT INTO {cluster}.loans (
                        borrower_id, amount, interest_rate, status,
                        purpose, application_date, approval_date,
                        term_months, external_reference
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, [
                    borrower_id[0],
                    float(loan.amount),
                    float(loan.interest_rate),
                    'approved',
                    loan.purpose,
                    loan.application_date,
                    timezone.now(),
                    loan.term_months,
                    f"LETSEMA-{loan.id}"
                ])
                
                mfi_loan_id = cursor.fetchone()[0]
                logger.debug(f"Created loan in {cluster} with ID: {mfi_loan_id}")
                
                loan.external_loan_id = mfi_loan_id
                loan.save()
                
                logger.info(f"Successfully created loan in {cluster} with ID {mfi_loan_id}")
                
        except Exception as e:
            logger.error(f"Failed to create loan in MFI system ({cluster}): {str(e)}")
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