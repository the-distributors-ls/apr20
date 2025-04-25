import logging
from datetime import datetime, timedelta
from random import randint
from django.db import connection
from mongoengine import connect
from .models import CreditHistory
from django.conf import settings
from loans.models import LoanApplication, LoanStatusUpdate

logger = logging.getLogger(__name__)

def test_mongo_connection():
    """Test MongoDB connection and return status"""
    try:
        init_mongo_connection()
        # Try a simple operation to verify connection
        count = CreditHistory.objects.count()
        logger.info(f"MongoDB connection successful. Found {count} credit history records.")
        return True, f"Connected successfully. Found {count} records."
    except Exception as e:
        logger.error(f"MongoDB connection failed: {str(e)}")
        return False, str(e)

def init_mongo_connection():
    """Initialize MongoDB connection with better error handling"""
    try:
        
        print(f"Connecting to MongoDB with: host={settings.MONGO_HOST}, db={settings.MONGO_DBNAME}")
        
        connect(
            db=settings.MONGO_DBNAME,
            host=settings.MONGO_HOST,
            username=settings.MONGO_USER,
            password=settings.MONGO_PASS,
            alias='default',  # Using default instead of 'mongo'
            connectTimeoutMS=5000,  
            serverSelectionTimeoutMS=5000,
            retryWrites=True,
        )
        logger.info("MongoDB connection initialized successfully")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        raise

def generate_test_credit_history(national_id):
    """Generate random test data for development"""
    return {
        'national_id': national_id,
        'credit_score': randint(300, 850),
        'active_loans': randint(0, 5),
        'total_debt': randint(0, 50000),
        'payment_history': generate_payment_history(),
        'inquiries': generate_inquiries(),
        'created_at': datetime.now(),
        'updated_at': datetime.now()
    }

def generate_payment_history():
    return [{
        'date': (datetime.now() - timedelta(days=i*30)).isoformat(),
        'amount': randint(100, 1000),
        'status': 'paid' if i % 4 else 'late'
    } for i in range(1, 13)]

def generate_inquiries():
    return [{
        'date': (datetime.now() - timedelta(days=i*90)).isoformat(),
        'inquirer': f'Bank_{i}',
        'purpose': 'loan' if i % 2 else 'credit'
    } for i in range(1, 6)]

def get_mfi_credit_data(cluster, national_id):
    """Pull real credit data from MFI via FDW"""
    with connection.cursor() as cursor:
        try:
            # Get loan history from MFI cluster
            cursor.execute(f"""
                SELECT 
                    l.id, l.amount, l.status, 
                    l.application_date, l.approval_date,
                    COUNT(r.id) as repayments_count,
                    SUM(CASE WHEN r.status = 'late' THEN 1 ELSE 0 END) as late_count
                FROM {cluster}.loans l
                LEFT JOIN {cluster}.repayments r ON l.id = r.loan_id
                WHERE l.borrower_id IN (
                    SELECT id FROM {cluster}.borrowers 
                    WHERE national_id = %s
                )
                GROUP BY l.id
            """, [national_id])
            
            loans = cursor.fetchall()
            
            # Transform into credit history format
            payment_history = []
            active_loans = 0
            total_debt = 0
            
            for loan in loans:
                if loan[2] == 'active':
                    active_loans += 1
                    total_debt += float(loan[1])
                
                payment_history.append({
                    'loan_id': loan[0],
                    'amount': float(loan[1]),
                    'status': loan[2],
                    'application_date': loan[3].isoformat() if loan[3] else None,
                    'approval_date': loan[4].isoformat() if loan[4] else None,
                    'repayments_count': loan[5],
                    'late_payments': loan[6]
                })
            
            # Simple credit score calculation (simplified)
            credit_score = max(300, min(850, 750 - (sum(l[6] for l in loans) * 20)))
            
            return {
                'national_id': national_id,
                'credit_score': credit_score,
                'active_loans': active_loans,
                'total_debt': total_debt,
                'payment_history': payment_history,
                'inquiries': [],  # MFI systems typically don't store inquiries
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            }
            
        except Exception as e:
            logger.error(f"Error fetching MFI credit data: {str(e)}")
            raise

def get_letsema_credit_data(national_id):
    """Pull credit data from Letsema database (default)"""
    try:
        from users.models import BorrowerProfile
        
        # Get borrower profile
        try:
            borrower = BorrowerProfile.objects.get(national_id=national_id)
        except BorrowerProfile.DoesNotExist:
            logger.error(f"Borrower with national_id {national_id} not found")
            return None
            
        # Get loan applications for this borrower
        loan_applications = LoanApplication.objects.filter(borrower=borrower.user)
        
        # Transform into credit history format
        payment_history = []
        active_loans = 0
        total_debt = 0
        late_payments_count = 0
        
        for loan in loan_applications:
            # Count active loans and total debt
            if loan.status == LoanApplication.Status.APPROVED:
                # Check if loan is closed based on status rather than an attribute
                is_closed = loan.status in [LoanApplication.Status.REPAID, LoanApplication.Status.DEFAULTED]
                
                if not is_closed:
                    active_loans += 1
                    total_debt += loan.amount
            
            # Get status updates to track payment history
            status_updates = LoanStatusUpdate.objects.filter(loan=loan)
            late_updates = status_updates.filter(status='PAYMENT_LATE').count()
            late_payments_count += late_updates
            
            payment_history.append({
                'loan_id': loan.id,
                'amount': float(loan.amount),
                'status': loan.status,
                'application_date': loan.application_date.isoformat() if loan.application_date else None,
                'approval_date': loan.decision_date.isoformat() if loan.decision_date else None,
                'repayments_count': status_updates.filter(status='PAYMENT_RECEIVED').count(),
                'late_payments': late_updates
            })
        
        # Simple credit score calculation (modified for Letsema)
        # Higher score for more approved loans, lower for rejections and late payments
        base_score = 600
        approved_bonus = sum(30 for la in loan_applications if la.status == LoanApplication.Status.APPROVED)
        rejected_penalty = sum(50 for la in loan_applications if la.status == LoanApplication.Status.REJECTED)
        late_penalty = late_payments_count * 20
        
        credit_score = max(300, min(850, base_score + approved_bonus - rejected_penalty - late_penalty))
        
        # Gather inquiries - when other MFI employees viewed this credit record
        inquiries = []
        
        return {
            'national_id': national_id,
            'credit_score': credit_score,
            'active_loans': active_loans, 
            'total_debt': total_debt,
            'payment_history': payment_history,
            'inquiries': inquiries,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
            
    except Exception as e:
        logger.error(f"Error fetching Letsema credit data: {str(e)}")
        raise

def sync_letsema_credit_histories():
    """Sync credit histories from Letsema database to MongoDB"""
    from users.models import BorrowerProfile
    
    init_mongo_connection()
    
    try:
        # Get all borrowers
        borrowers = BorrowerProfile.objects.all()
        success_count = 0
        error_count = 0
        
        for borrower in borrowers:
            try:
                credit_data = get_letsema_credit_data(borrower.national_id)
                if credit_data:
                    # Create a new CreditHistory object and save it
                    credit_history = CreditHistory(**credit_data)
                    credit_history.save()
                    success_count += 1
                    logger.info(f"Synced credit history for {borrower.national_id}")
            except Exception as e:
                error_count += 1
                logger.error(f"Failed to sync {borrower.national_id}: {str(e)}")
        
        return f"Sync completed. {success_count} records synced, {error_count} errors."
    except Exception as e:
        logger.error(f"Error in sync_letsema_credit_histories: {str(e)}")
        return f"Sync failed: {str(e)}"

def get_combined_credit_data(national_id):
    """Get combined credit data from Letsema and MFI sources"""
    try:
        # First get Letsema data
        credit_data = get_letsema_credit_data(national_id)
        if not credit_data:
            return None
            
        # Try to get MFI data from each cluster
        try:
            mfi_a_data = get_mfi_credit_data('mfi_a', national_id)
            if mfi_a_data:
                # Combine payment histories
                credit_data['payment_history'].extend(mfi_a_data['payment_history'])
                # Update counts
                credit_data['active_loans'] += mfi_a_data['active_loans']
                credit_data['total_debt'] += mfi_a_data['total_debt']
                # Adjust credit score (simple average)
                credit_data['credit_score'] = (credit_data['credit_score'] + mfi_a_data['credit_score']) // 2
        except Exception as e:
            logger.warning(f"Could not get MFI-A data for {national_id}: {str(e)}")
        
        try:
            mfi_b_data = get_mfi_credit_data('mfi_b', national_id)
            if mfi_b_data:
                # Combine payment histories
                credit_data['payment_history'].extend(mfi_b_data['payment_history'])
                # Update counts
                credit_data['active_loans'] += mfi_b_data['active_loans']
                credit_data['total_debt'] += mfi_b_data['total_debt']
                # Adjust credit score (simple average)
                credit_data['credit_score'] = (credit_data['credit_score'] + mfi_b_data['credit_score']) // 2
        except Exception as e:
            logger.warning(f"Could not get MFI-B data for {national_id}: {str(e)}")
            
        return credit_data
    except Exception as e:
        logger.error(f"Error in get_combined_credit_data: {str(e)}")
        return None