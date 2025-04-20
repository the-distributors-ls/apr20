from rest_framework import serializers
from .models import LoanApplication, LoanStatusUpdate
from users.serializers import UserSerializer
from mfi.serializers import MicroFinanceInstitutionSerializer

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

class LoanApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanApplication
        fields = ['mfi', 'amount', 'purpose', 'term_months', 'interest_rate']
    
    def validate(self, data):
        user = self.context['request'].user
        if not user.is_borrower():
            raise serializers.ValidationError("Only borrowers can apply for loans.")
        return data

class LoanDecisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanApplication
        fields = ['status', 'notes']
    
    def validate_status(self, value):
        if value not in [LoanApplication.Status.APPROVED, LoanApplication.Status.REJECTED]:
            raise serializers.ValidationError("Invalid decision status. Must be either APPROVED or REJECTED.")
        return value