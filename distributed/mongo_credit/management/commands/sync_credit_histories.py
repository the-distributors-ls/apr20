# Create this file at mongo_credit/management/commands/sync_credit_histories.py

from django.core.management.base import BaseCommand
from mongo_credit.credit_utils import get_letsema_credit_data, init_mongo_connection
from mongo_credit.models import CreditHistory
from users.models import BorrowerProfile
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Sync credit histories from Letsema database to MongoDB'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force update all credit histories',
        )

    def handle(self, *args, **options):
        try:
            self.stdout.write(self.style.SUCCESS('Starting credit history sync...'))
            
            # Initialize MongoDB connection
            init_mongo_connection()
            
            # Get all borrowers
            borrowers = BorrowerProfile.objects.all()
            success_count = 0
            error_count = 0
            
            for borrower in borrowers:
                try:
                    credit_data = get_letsema_credit_data(borrower.national_id)
                    if credit_data:
                        # Save directly to MongoDB
                        try:
                            # Check if record exists
                            existing = CreditHistory.objects.filter(national_id=borrower.national_id).first()
                            if existing:
                                # Update existing record
                                for key, value in credit_data.items():
                                    setattr(existing, key, value)
                                existing.save()
                            else:
                                # Create new record
                                credit_obj = CreditHistory(**credit_data)
                                credit_obj.save()
                                
                            success_count += 1
                            self.stdout.write(self.style.SUCCESS(f"Synced credit history for {borrower.national_id}"))
                        except Exception as e:
                            error_count += 1
                            self.stdout.write(self.style.ERROR(f"MongoDB error for {borrower.national_id}: {str(e)}"))
                except Exception as e:
                    error_count += 1
                    self.stdout.write(self.style.ERROR(f"Failed to sync {borrower.national_id}: {str(e)}"))
            
            self.stdout.write(self.style.SUCCESS(f'Sync completed: {success_count} records synced, {error_count} errors.'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error during sync: {str(e)}'))
            logger.error(f"Command error: {str(e)}")