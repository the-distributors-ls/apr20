# Create this file in loans/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import LoanApplication, LoanStatusUpdate
from mongo_credit.credit_utils import get_letsema_credit_data, init_mongo_connection
from mongo_credit.models import CreditHistory
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=LoanApplication)
def update_credit_history_on_loan_change(sender, instance, created, **kwargs):
    """
    Update credit history whenever a loan application changes
    """
    try:
        # Skip if this is a new loan and not a status update
        if created:
            return
            
        # Get the borrower's national ID
        national_id = instance.borrower.borrower_profile.national_id
        
        # Generate fresh credit data
        credit_data = get_letsema_credit_data(national_id)
        if not credit_data:
            logger.warning(f"Could not generate credit data for {national_id}")
            return
            
        # Update MongoDB
        init_mongo_connection()
        # Create the credit history object directly 
        # (either new or replacing an existing one)
        try:
            credit_obj = CreditHistory.objects.get(national_id=national_id)
            # Update each field
            for key, value in credit_data.items():
                setattr(credit_obj, key, value)
            credit_obj.save()
        except CreditHistory.DoesNotExist:
            credit_obj = CreditHistory(**credit_data)
            credit_obj.save()
            
        logger.info(f"Updated credit history for {national_id} after loan status change")
        
    except Exception as e:
        logger.error(f"Failed to update credit history: {str(e)}")

@receiver(post_save, sender=LoanStatusUpdate)
def update_credit_history_on_status_update(sender, instance, created, **kwargs):
    """
    Update credit history whenever a loan status update is created
    """
    try:
        # Only proceed if this is a new status update
        if not created:
            return
            
        # Get the borrower's national ID
        national_id = instance.loan.borrower.borrower_profile.national_id
        
        # Generate fresh credit data
        credit_data = get_letsema_credit_data(national_id)
        if not credit_data:
            logger.warning(f"Could not generate credit data for {national_id}")
            return
            
        # Update MongoDB
        init_mongo_connection()
        # Create the credit history object directly 
        # (either new or replacing an existing one)
        try:
            credit_obj = CreditHistory.objects.get(national_id=national_id)
            # Update each field
            for key, value in credit_data.items():
                setattr(credit_obj, key, value)
            credit_obj.save()
        except CreditHistory.DoesNotExist:
            credit_obj = CreditHistory(**credit_data)
            credit_obj.save()
            
        logger.info(f"Updated credit history for {national_id} after status update")
        
    except Exception as e:
        logger.error(f"Failed to update credit history: {str(e)}")