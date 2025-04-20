from django.db import models
from users.models import User
from mfi.models import MicroFinanceInstitution

class LoanApplication(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        DISBURSED = 'DISBURSED', 'Disbursed'
        REPAID = 'REPAID', 'Repaid'
        DEFAULTED = 'DEFAULTED', 'Defaulted'
    
    borrower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='loan_applications')
    mfi = models.ForeignKey(MicroFinanceInstitution, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    purpose = models.TextField()
    term_months = models.PositiveIntegerField()
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    application_date = models.DateTimeField(auto_now_add=True)
    decision_date = models.DateTimeField(null=True, blank=True)
    decision_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='decided_loans')
    notes = models.TextField(blank=True)
    external_loan_id = models.CharField(max_length=50, blank=True, null=True)  # ID in MFI's system
    
    class Meta:
        ordering = ['-application_date']
    
    def save(self, *args, **kwargs):
        # Ensure MFI cluster is properly set
        if not self.mfi.cluster_name:
            raise ValueError("MFI must have a cluster_name assigned")
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Loan #{self.id} - {self.borrower.get_full_name()} - {self.get_status_display()}"

class LoanStatusUpdate(models.Model):
    loan = models.ForeignKey(LoanApplication, on_delete=models.CASCADE, related_name='status_updates')
    old_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"Status update for Loan #{self.loan.id}"