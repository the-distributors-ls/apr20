from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, BorrowerProfile, MFIEmployeeProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'mfi']
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
    username_field = User.USERNAME_FIELD

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")
        email = self.context['request'].data.get('email')
        role = self.context['request'].data.get('role')

        if not username or not password or not email or not role:
            raise serializers.ValidationError("Username, password, email, and role are required.")

        try:
            user = User.objects.get(username=username, email=email, role=role)
        except User.DoesNotExist:
            raise serializers.ValidationError("User with provided credentials does not exist.")

        if not user.check_password(password):
            raise serializers.ValidationError("Incorrect password.")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")

        data = super().validate(attrs)
        data['role'] = user.role
        data['username'] = user.username
        data['email'] = user.email
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        return token

    
class UserRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    role = serializers.ChoiceField(choices=User.Role.choices)
    date_of_birth = serializers.DateField(required=False)
    mfi = serializers.PrimaryKeyRelatedField(
        queryset=User._meta.get_field('mfi').related_model.objects.all(),
        required=False
    )

    # Borrower-only
    national_id = serializers.CharField(required=False)
    phone_number = serializers.CharField(required=False)
    address = serializers.CharField(required=False)

    # MFI employee-only
    employee_id = serializers.CharField(required=False)
    department = serializers.CharField(required=False)

    def validate(self, data):
        role = data.get('role')

        # DOB must be present for borrower
        if role == User.Role.BORROWER:
            missing = [f for f in ['date_of_birth', 'national_id', 'phone_number', 'address'] if not data.get(f)]
            if missing:
                raise serializers.ValidationError({f: 'This field is required for borrowers.' for f in missing})
            if data['date_of_birth'] >= timezone.now().date():
                raise serializers.ValidationError({'date_of_birth': 'Date of birth must be in the past.'})

        if role == User.Role.MFI_EMPLOYEE:
            missing = [f for f in ['employee_id', 'department'] if not data.get(f)]
            if missing:
                raise serializers.ValidationError({f: 'This field is required for MFI employees.' for f in missing})
            if not data.get('mfi'):
                raise serializers.ValidationError({'mfi': 'This field is required for MFI employees.'})

        return data

    def create(self, validated_data):
        role = validated_data.pop('role')
        password = validated_data.pop('password')
        mfi = validated_data.pop('mfi', None)

        # Extract shared and profile data
        user_data = {
            'username': validated_data.pop('username'),
            'email': validated_data.pop('email'),
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'role': role,
            'mfi': mfi
        }
        user = User.objects.create_user(**user_data, password=password)

        if role == User.Role.BORROWER:
            BorrowerProfile.objects.create(
                user=user,
                date_of_birth=validated_data.pop('date_of_birth'),
                national_id=validated_data.pop('national_id'),
                phone_number=validated_data.pop('phone_number'),
                address=validated_data.pop('address')
            )
        elif role == User.Role.MFI_EMPLOYEE:
            MFIEmployeeProfile.objects.create(
                user=user,
                employee_id=validated_data.pop('employee_id'),
                department=validated_data.pop('department')
            )

        return user
