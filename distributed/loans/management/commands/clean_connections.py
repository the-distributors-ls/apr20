# Create a management command to clean up connections
# management/commands/clean_connections.py
from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Clean up database connections'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT pg_terminate_backend(pg_stat_activity.pid) 
                FROM pg_stat_activity 
                WHERE pg_stat_activity.datname = 'test_postgres' 
                AND pid <> pg_backend_pid()
            """)
            self.stdout.write(self.style.SUCCESS("Terminated all connections to test_postgres"))