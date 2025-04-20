from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class Role(models.TextChoices):
        BORROWER = 'BORROWER', _('Borrower')
        MFI_EMPLOYEE = 'MFI_EMPLOYEE', _('MFI Employee')
        ADMIN = 'ADMIN', _('Admin')
    
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.BORROWER
    )
    mfi = models.ForeignKey('mfi.MicroFinanceInstitution', on_delete=models.SET_NULL, null=True, blank=True)
    
    def is_borrower(self):
        return self.role == self.Role.BORROWER
    
    def is_mfi_employee(self):
        return self.role == self.Role.MFI_EMPLOYEE
    
    def is_admin(self):
        return self.role == self.Role.ADMIN

class BorrowerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='borrower_profile')
    national_id = models.CharField(max_length=20, unique=True)
    phone_number = models.CharField(max_length=15)
    address = models.TextField()
    date_of_birth = models.DateField()
    
    def __str__(self):
        return f"{self.user.get_full_name()} ({self.national_id})"

class MFIEmployeeProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mfi_employee_profile')
    employee_id = models.CharField(max_length=20)
    department = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.user.get_full_name()} ({self.employee_id})"