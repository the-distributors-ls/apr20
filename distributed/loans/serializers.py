from rest_framework import serializers
from .models import LoanApplication, LoanStatusUpdate
from users.serializers import UserSerializer
from mfi.serializers import MicroFinanceInstitutionSerializer
import logging
logger = logging.getLogger(__name__)

class LoanStatusUpdateSerializer(serializers.ModelSerializer):
    updated_by = UserSerializer(read_only=True)
    
    class Meta:
        model = LoanStatusUpdate
        fields = '__all__'
        read_only_fields = ['timestamp']

class LoanApplicationSerializer(serializers.ModelSerializer):
    borrower = UserSerializer(read_only=True)
    mfi = MicroFinanceInstitutionSerializer(read_only=True)
    decision_by = UserSerializer(read_only=True)
    status_updates = LoanStatusUpdateSerializer(many=True, read_only=True)
    
    class Meta:
        model = LoanApplication
        fields = '__all__'
        read_only_fields = ['application_date', 'decision_date', 'decision_by', 'external_loan_id']

# serializers.py - Update LoanApplicationCreateSerializer
class LoanApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanApplication
        fields = ['mfi', 'amount', 'purpose', 'term_months', 'interest_rate']
    
    def create(self, validated_data):
        try:
            logger.debug(f"Creating loan application with data: {validated_data}")
            loan = super().create(validated_data)
            logger.debug(f"Created loan ID: {loan.id}")
            return loan
        except Exception as e:
            logger.error(f"Loan creation failed: {str(e)}")
            raise
    
    def validate(self, data):
        user = self.context['request'].user
        if not user.is_borrower():
            raise serializers.ValidationError("Only borrowers can apply for loans.")
        
        # Validate selected MFI is active and has a cluster
        mfi = data.get('mfi')
        if not mfi.is_active or not mfi.cluster_name:
            raise serializers.ValidationError("Selected MFI is not available for loan applications")
            
        return data

class LoanDecisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanApplication
        fields = ['status', 'notes']
    
    def validate_status(self, value):
        if value not in [LoanApplication.Status.APPROVED, LoanApplication.Status.REJECTED]:
            raise serializers.ValidationError("Invalid decision status. Must be either APPROVED or REJECTED.")
        return value