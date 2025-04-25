import mongoengine
from datetime import datetime

class CreditHistory(mongoengine.Document):
    """
    MongoDB model for credit history data
    """
    national_id = mongoengine.StringField(required=True, unique=True)
    credit_score = mongoengine.IntField(min_value=300, max_value=850)
    active_loans = mongoengine.IntField(default=0)
    total_debt = mongoengine.FloatField(default=0)
    payment_history = mongoengine.ListField(mongoengine.DictField())
    inquiries = mongoengine.ListField(mongoengine.DictField())
    created_at = mongoengine.DateTimeField(default=datetime.now)
    updated_at = mongoengine.DateTimeField(default=datetime.now)
    
    meta = {
        'collection': 'credit_histories',
        'indexes': ['national_id']
    }
    
    @classmethod
    def update_or_create(cls, national_id, defaults=None):
        """
        Update existing document or create a new one
        """
        defaults = defaults or {}
        defaults['updated_at'] = datetime.now()
        
        # Try to get the existing document
        try:
            obj = cls.objects.get(national_id=national_id)
            # Update fields
            for key, value in defaults.items():
                setattr(obj, key, value)
            obj.save()
            return obj, False  # False indicates it was updated, not created
        except cls.DoesNotExist:
            # Create new document
            defaults['national_id'] = national_id
            obj = cls(**defaults)
            obj.save()
            return obj, True  # True indicates it was created, not updated