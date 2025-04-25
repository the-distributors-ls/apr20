import os
import sys
from dotenv import load_dotenv
from mongoengine import connect
from pymongo.errors import ConnectionFailure

# Load environment variables from .env file
load_dotenv()

def test_mongo_connection():
    try:
        # Get MongoDB connection details from environment variables
        db_name = os.getenv("MONGO_DBNAME", "")
        host = os.getenv("MONGO_HOST", "")

        # Print connection details (obscuring sensitive parts)
        print("=== MongoDB Connection Test ===")
        print(f"Database Name: {db_name}")
        print(f"Host: {'Set' if host else 'Not set'}")

        # Attempt connection with timeout
        print("\nAttempting connection...")
        connect(
            db=db_name,
            host=host,
            connectTimeoutMS=5000,
            serverSelectionTimeoutMS=5000
        )

        # Test the connection
        from mongoengine.connection import get_connection
        conn = get_connection()
        conn.server_info()  # Will raise an exception if connection fails

        print("\n✅ Connection SUCCESSFUL!")
        return True

    except ConnectionFailure as e:
        print(f"\n❌ Connection FAILED: {str(e)}")

        # Provide troubleshooting suggestions
        print("\nTroubleshooting tips:")
        print("1. Check if your MongoDB Atlas service is running")
        print("2. Verify your IP address is in the MongoDB Atlas whitelist")
        print("3. Confirm your database credentials are correct")
        print("4. Ensure your connection string format is correct")
        print("5. Check your network connectivity")

        if "timeout" in str(e).lower():
            print("6. Connection timeout - this often indicates network issues or incorrect host")
        if "authentication" in str(e).lower():
            print("6. Authentication failed - check username and password")

        return False

    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        return False

if __name__ == "__main__":
    test_mongo_connection()
