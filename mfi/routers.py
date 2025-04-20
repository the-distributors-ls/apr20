class MFIRouter:
    """
    A router to control all database operations on models in the mfi application.
    This routes queries to the appropriate MFI cluster based on the model.
    """
    def db_for_read(self, model, **hints):
        if model._meta.app_label == 'mfi':
            return 'default'
        return None
    
    def db_for_write(self, model, **hints):
        if model._meta.app_label == 'mfi':
            return 'default'
        return None
    
    def allow_relation(self, obj1, obj2, **hints):
        if obj1._meta.app_label == 'mfi' or obj2._meta.app_label == 'mfi':
            return True
        return None
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label == 'mfi':
            return db == 'default'
        return None