from rest_framework.permissions import BasePermission

class IsBorrower(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'is_borrower') and request.user.is_borrower()

class IsAdminOrMFIEmployee(BasePermission):
    def has_permission(self, request, view):
        return (hasattr(request.user, 'is_admin') and request.user.is_admin()) or \
               (hasattr(request.user, 'is_mfi_employee') and request.user.is_mfi_employee())