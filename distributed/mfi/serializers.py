from rest_framework import serializers
from .models import MicroFinanceInstitution

class MicroFinanceInstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MicroFinanceInstitution
        fields = '__all__'
        read_only_fields = ['created_at']