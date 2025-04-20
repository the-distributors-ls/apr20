from rest_framework import serializers

class CreditHistorySerializer(serializers.Serializer):
    national_id = serializers.CharField()
    credit_score = serializers.IntegerField()
    active_loans = serializers.IntegerField()
    total_debt = serializers.DecimalField(max_digits=12, decimal_places=2)
    payment_history = serializers.ListField(child=serializers.DictField())
    inquiries = serializers.ListField(child=serializers.DictField())
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()