from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, BorrowerProfile, MFIEmployeeProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'mfi', 'password']
        read_only_fields = ['id']

class BorrowerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    
    class Meta:
        model = BorrowerProfile
        fields = '__all__'
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(**user_data, role=User.Role.BORROWER)
        return BorrowerProfile.objects.create(user=user, **validated_data)

class MFIEmployeeProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    
    class Meta:
        model = MFIEmployeeProfile
        fields = '__all__'
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(
            **user_data, 
            role=User.Role.MFI_EMPLOYEE, 
            mfi=validated_data.get('mfi'))
        return MFIEmployeeProfile.objects.create(user=user, **validated_data)
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        return token