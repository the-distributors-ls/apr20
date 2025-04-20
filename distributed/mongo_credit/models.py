from mongoengine import Document, fields
from django.conf import settings

class CreditHistory(Document):
    national_id = fields.StringField(required=True, unique=True)
    credit_score = fields.IntField(min_value=300, max_value=850)
    active_loans = fields.IntField(min_value=0)
    total_debt = fields.FloatField(min_value=0)
    payment_history = fields.ListField(fields.DictField())
    inquiries = fields.ListField(fields.DictField())
    created_at = fields.DateTimeField()
    updated_at = fields.DateTimeField()
    
    meta = {
        'collection': 'borrower_credit_history',
        'indexes': ['national_id'],
        'db_alias': 'mongo'
    }