from django.test import TestCase
from mongo_credit.credit_utils import generate_test_credit_history
from loans.models import CreditHistory

class CreditHistoryTests(TestCase):
    def test_credit_history_creation(self):
        test_data = generate_test_credit_history("TEST123")
        record = CreditHistory(**test_data)
        record.save()
        
        self.assertEqual(CreditHistory.objects.count(), 1)
        self.assertTrue(300 <= record.credit_score <= 850)