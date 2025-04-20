# loans/management/commands/sync_borrowers.py
from django.core.management.base import BaseCommand
from django.db import connection
from users.models import User

class Command(BaseCommand):
    help = 'Sync borrowers with MFI clusters'

    def handle(self, *args, **options):
        # Get all borrowers (users with role='borrower')
        borrowers = User.objects.filter(role='borrower')
        
        for borrower in borrowers:
            try:
                if not hasattr(borrower, 'borrower_profile'):
                    self.stdout.write(f"Skipping borrower {borrower.email} - no profile")
                    continue
                    
                with connection.cursor() as cursor:
                    # Check if borrower exists in MFI A
                    cursor.execute("""
                        SELECT id FROM mfi_a.borrowers 
                        WHERE email = %s OR national_id = %s
                        LIMIT 1
                    """, [
                        borrower.email, 
                        borrower.borrower_profile.national_id
                    ])
                    
                    if not cursor.fetchone():
                        # Create borrower in MFI A
                        cursor.execute("""
                            INSERT INTO mfi_a.borrowers (
                                name, email, phone, 
                                national_id, credit_score,
                                created_at, updated_at
                            )
                            VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
                            RETURNING id
                        """, [
                            borrower.get_full_name(),
                            borrower.email,
                            borrower.phone or '',
                            borrower.borrower_profile.national_id,
                            getattr(borrower.borrower_profile, 'credit_score', 650)
                        ])
                        mfi_borrower_id = cursor.fetchone()[0]
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"Created borrower {borrower.email} in mfi_a (ID: {mfi_borrower_id})"
                            )
                        )
                    else:
                        self.stdout.write(
                            f"Borrower {borrower.email} already exists in mfi_a"
                        )
            except Exception as e:
                self.stderr.write(
                    self.style.ERROR(
                        f"Error syncing borrower {borrower.email}: {str(e)}"
                    )
                )
