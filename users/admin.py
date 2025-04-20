from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, BorrowerProfile, MFIEmployeeProfile

# Register your custom User model with the admin
admin.site.register(User, UserAdmin)

# Register your other models
@admin.register(BorrowerProfile)
class BorrowerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'national_id', 'phone_number')
    search_fields = ('user__username', 'user__email', 'national_id')

@admin.register(MFIEmployeeProfile)
class MFIEmployeeProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'employee_id', 'department')
    search_fields = ('user__username', 'user__email', 'employee_id')