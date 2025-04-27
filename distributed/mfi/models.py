from django.db import models

class MicroFinanceInstitution(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField()
    cluster_name = models.CharField(max_length=20)  # 'mfi_a' or 'mfi_b'
    api_endpoint = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.code})"