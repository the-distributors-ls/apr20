from django.conf import settings

def get_database_config():
    return {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': settings.DB_DEFAULT_NAME,
            'USER': settings.DB_DEFAULT_USER,
            'PASSWORD': settings.DB_DEFAULT_PASSWORD,
            'HOST': settings.DB_DEFAULT_HOST,
            'PORT': settings.DB_DEFAULT_PORT,
            'OPTIONS': {
                'options': f'-c search_path={settings.DB_DEFAULT_SCHEMA}'
            },
        },
        'mfi_a': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': settings.DB_MFI_A_NAME,
            'USER': settings.DB_MFI_A_USER,
            'PASSWORD': settings.DB_MFI_A_PASSWORD,
            'HOST': settings.DB_MFI_A_HOST,
            'PORT': settings.DB_MFI_A_PORT,
            'OPTIONS': {
                'options': f'-c search_path={settings.DB_MFI_A_SCHEMA}'
            },
        },
        'mfi_b': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': settings.DB_MFI_B_NAME,
            'USER': settings.DB_MFI_B_USER,
            'PASSWORD': settings.DB_MFI_B_PASSWORD,
            'HOST': settings.DB_MFI_B_HOST,
            'PORT': settings.DB_MFI_B_PORT,
            'OPTIONS': {
                'options': f'-c search_path={settings.DB_MFI_B_SCHEMA}'
            },
        }
    }