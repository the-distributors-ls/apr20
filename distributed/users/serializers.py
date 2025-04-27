from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, BorrowerProfile, MFIEmployeeProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'mfi', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
            'id': {'read_only': True}
        }

class BorrowerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BorrowerProfile
        fields = ['national_id', 'phone_number', 'address', 'date_of_birth']
        read_only_fields = ['user']

class MFIEmployeeProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MFIEmployeeProfile
        fields = ['employee_id', 'department']
        read_only_fields = ['user']

class UserProfileSerializer(serializers.ModelSerializer):
    borrower_profile = BorrowerProfileSerializer(read_only=True)
    mfi_employee_profile = MFIEmployeeProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'email', 
            'first_name', 
            'last_name', 
            'role', 
            'mfi',
            'borrower_profile', 
            'mfi_employee_profile'
        ]
        read_only_fields = fields  # All fields are read-only for profile display

class BorrowerProfileCreateSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    
    class Meta:
        model = BorrowerProfile
        fields = '__all__'
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(**user_data, role=User.Role.BORROWER)
        return BorrowerProfile.objects.create(user=user, **validated_data)

class MFIEmployeeProfileCreateSerializer(serializers.ModelSerializer):
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
        token['username'] = user.username
        token['email'] = user.email
        return token