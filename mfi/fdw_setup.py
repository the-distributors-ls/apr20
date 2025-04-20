from django.db import connection
from django.conf import settings

def setup_fdw_servers():
    with connection.cursor() as cursor:
        # Install the extension if not exists
        cursor.execute("CREATE EXTENSION IF NOT EXISTS postgres_fdw")
        
        # Set up servers for each MFI cluster
        for mfi_name, config in settings.FDW_SETTINGS.items():
            # Create server
            cursor.execute(f"""
                CREATE SERVER IF NOT EXISTS {config['server_name']}
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
            
            # Import foreign schema (adjust tables as needed)
            cursor.execute(f"""
                IMPORT FOREIGN SCHEMA public
                LIMIT TO (loans, borrowers)
                FROM SERVER {config['server_name']} 
                INTO {mfi_name}
            """)
        
        print("FDW servers setup completed successfully")