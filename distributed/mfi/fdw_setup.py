from django.db import connection
from django.conf import settings
from mongo_credit.models import CreditHistory

def setup_fdw_servers():
    """Set up foreign data wrappers for all configured MFI clusters."""
    try:
        with connection.cursor() as cursor:
            # Install the extension if not exists
            cursor.execute("CREATE EXTENSION IF NOT EXISTS postgres_fdw")
            
            # Set up servers for each MFI cluster
            for mfi_name, config in settings.FDW_SETTINGS.items():
                print(f"Setting up FDW for {mfi_name} cluster...")
                
                # Drop existing server if exists (clean setup)
                cursor.execute(f"DROP SERVER IF EXISTS {config['server_name']} CASCADE")
                
                # Create server
                cursor.execute(f"""
                    CREATE SERVER {config['server_name']}
                    FOREIGN DATA WRAPPER {config['wrapper']}
                    OPTIONS (
                        host '{config['options']['host']}',
                        dbname '{config['options']['dbname']}',
                        port '{config['options']['port']}'
                    )
                """)
                
                # Create user mapping
                cursor.execute(f"""
                    CREATE USER MAPPING IF NOT EXISTS FOR {config['user_mapping']['local_user']}
                    SERVER {config['server_name']}
                    OPTIONS (
                        user '{config['user_mapping']['remote_user']}',
                        password '{config['user_mapping']['remote_password']}'
                    )
                """)
                
                # Create schema for foreign tables if not exists
                cursor.execute(f"CREATE SCHEMA IF NOT EXISTS {mfi_name}")
                
                # Import foreign schema for specific tables
                tables_to_import = ['borrowers', 'loans', 'repayments']  # Add all your tables here
                cursor.execute(f"""
                    IMPORT FOREIGN SCHEMA public
                    LIMIT TO ({', '.join(tables_to_import)})
                    FROM SERVER {config['server_name']} 
                    INTO {mfi_name}
                """)
                
                print(f"Successfully set up FDW for {mfi_name} cluster")
            
            print("FDW servers setup completed successfully")
            return True
            
    except Exception as e:
        print(f"Error setting up FDW servers: {str(e)}")
        return False

def check_foreign_tables(cluster_name='mfi-A'):
    """Check available tables and sample data in a specific cluster."""
    with connection.cursor() as cursor:
        try:
            # List all tables in the specified schema
            cursor.execute(f"""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = %s
            """, [cluster_name])
            tables = cursor.fetchall()
            print(f"Tables in {cluster_name} schema:")
            for table in tables:
                print(f"- {table[0]}")
            
            # Query sample data from each table
            for table in tables:
                table_name = table[0]
                print(f"\nSample data from {table_name}:")
                cursor.execute(f"SELECT * FROM {cluster_name}.{table_name} LIMIT 3")
                for row in cursor.fetchall():
                    print(row)
                    
            return True
                    
        except Exception as e:
            print(f"Error checking foreign tables: {str(e)}")
            return False

# Example usage from Django shell or management command:
def query_mfi_data():
    """Example functions showing how to query foreign data."""
    with connection.cursor() as cursor:
        try:
            # Example 1: Get borrowers with their loans
            cursor.execute("""
                SELECT b.id, b.name, b.email, 
                       l.id AS loan_id, l.amount, l.status
                FROM mfi_a.borrowers b
                LEFT JOIN mfi_a.loans l ON b.id = l.borrower_id
                LIMIT 5
            """)
            print("\nBorrowers with their loans:")
            for row in cursor.fetchall():
                print(row)
            
            # Example 2: Get loan statistics
            cursor.execute("""
                SELECT 
                    status,
                    COUNT(*) AS loan_count,
                    SUM(amount) AS total_amount,
                    AVG(amount) AS avg_amount
                FROM mfi_a.loans
                GROUP BY status
            """)
            print("\nLoan statistics:")
            for row in cursor.fetchall():
                print(row)
            
            # Example 3: Get repayment schedule for a specific loan
            cursor.execute("""
                SELECT l.id AS loan_id, l.amount, l.due_date,
                       r.payment_date, r.amount AS repayment_amount
                FROM mfi_a.loans l
                LEFT JOIN mfi_a.repayments r ON l.id = r.loan_id
                WHERE l.id = 1
                ORDER BY r.payment_date
            """)
            print("\nRepayment schedule for loan ID 1:")
            for row in cursor.fetchall():
                print(row)
                
        except Exception as e:
            print(f"Error querying data: {str(e)}")

def sync_credit_histories(cluster='default'):
    """Sync credit histories from MFI to MongoDB"""
    from mongo_credit.credit_utils import get_mfi_credit_data, init_mongo_connection
    
    init_mongo_connection()
    
    with connection.cursor() as cursor:
        cursor.execute(f"SELECT national_id FROM {cluster}.borrowers LIMIT 100")
        borrowers = cursor.fetchall()
        
        for borrower in borrowers:
            national_id = borrower[0]
            try:
                credit_data = get_mfi_credit_data(cluster, national_id)
                CreditHistory.objects.update_or_create(
                    national_id=national_id,
                    defaults=credit_data
                )
                print(f"Synced credit history for {national_id}")
            except Exception as e:
                print(f"Failed to sync {national_id}: {str(e)}")
            

def test_fdw_connection(cluster_name='default'):
    """Test FDW connection to a specific cluster"""
    with connection.cursor() as cursor:
        try:
            cursor.execute(f"""
                SELECT 1 FROM {cluster_name}.borrowers LIMIT 1
            """)
            result = cursor.fetchone()
            if result:
                print(f"FDW connection to {cluster_name} successful!")
                return True
            return False
        except Exception as e:
            print(f"FDW connection test failed: {str(e)}")
            return False

def pull_sample_loans(cluster_name='default', limit=5):
    """Pull sample loan data from specified cluster"""
    with connection.cursor() as cursor:
        try:
            cursor.execute(f"""
                SELECT 
                    b.national_id, 
                    b.name, 
                    l.id AS loan_id,
                    l.amount,
                    l.status,
                    l.application_date,
                    l.approval_date
                FROM {cluster_name}.borrowers b
                JOIN {cluster_name}.loans l ON b.id = l.borrower_id
                LIMIT %s
            """, [limit])
            
            loans = cursor.fetchall()
            print(f"\nSample loans from {cluster_name}:")
            for loan in loans:
                print(loan)
            
            return loans
        except Exception as e:
            print(f"Error pulling loans: {str(e)}")
            return None