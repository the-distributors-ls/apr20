import os
import sys
from pathlib import Path
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# ======================
# CORE SECURITY SETTINGS
# ======================
SECRET_KEY = os.getenv('SECRET_KEY')
if not SECRET_KEY:
    sys.exit('SECRET_KEY must be set in environment variables')

DEBUG = os.getenv('DEBUG', 'False') == 'True'
#ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')
ALLOWED_HOSTS = ['*']

# =================
# DATABASE SETTINGS
# =================


USE_SQLITE = False  # Toggle this to switch back to Postgres later

if USE_SQLITE:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_LETSEMA_NAME'),
            'USER': os.getenv('DB_LETSEMA_USER'),
            'PASSWORD': os.getenv('DB_LETSEMA_PASSWORD'),
            'HOST': os.getenv('DB_LETSEMA_HOST'),
            'PORT': os.getenv('DB_LETSEMA_PORT', '5432'),
            'OPTIONS': {
                'options': f"-c search_path={os.getenv('DB_LETSEMA_SCHEMA', 'public')}"
            },
        },
        'mfi_a': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_MFI_A_NAME'),
            'USER': os.getenv('DB_MFI_A_USER'),
            'PASSWORD': os.getenv('DB_MFI_A_PASSWORD'),
            'HOST': os.getenv('DB_MFI_A_HOST'),
            'PORT': os.getenv('DB_MFI_A_PORT', '5432'),
            'OPTIONS': {
                'sslmode': 'require',
            },
        },
        'mfi_b': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_MFI_B_NAME'),
            'USER': os.getenv('DB_MFI_B_USER'),
            'PASSWORD': os.getenv('DB_MFI_B_PASSWORD'),
            'HOST': os.getenv('DB_MFI_B_HOST'),
            'PORT': os.getenv('DB_MFI_B_PORT', '5432'),
            'OPTIONS': {
                'options': f"-c search_path={os.getenv('DB_MFI_B_SCHEMA', 'public')}"
            },
        }
    }

    # Optional: Enforce environment checks only if not using SQLite
    required_db_vars = [
        'DB_LETSEMA_NAME', 'DB_LETSEMA_USER', 'DB_LETSEMA_PASSWORD', 'DB_LETSEMA_HOST',
        'DB_MFI_A_NAME', 'DB_MFI_A_USER', 'DB_MFI_A_PASSWORD', 'DB_MFI_A_HOST',
        'DB_MFI_B_NAME', 'DB_MFI_B_USER', 'DB_MFI_B_PASSWORD', 'DB_MFI_B_HOST'
    ]

    missing_vars = [var for var in required_db_vars if not os.getenv(var)]
    if missing_vars:
        sys.exit(f"Missing required database environment variables: {', '.join(missing_vars)}")



# Database router configuration
DATABASE_ROUTERS = ['mfi.routers.MFIRouter']

# MongoDB Configuration (Atlas)
MONGO_DBNAME = os.getenv('MONGO_DBNAME')
MONGO_HOST = os.getenv('MONGO_HOST')
MONGO_USER = os.getenv('MONGO_USER')
MONGO_PASS = os.getenv('MONGO_PASS')

if not all([MONGO_DBNAME, MONGO_HOST]):
    sys.exit('MongoDB configuration incomplete in environment variables')

# ========================
# APPLICATION DEFINITION
# ========================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'mongoengine',
    
    # Local apps
    'users.apps.UsersConfig',
    'loans.apps.LoansConfig',
    'mfi.apps.MfiConfig',
    'mongo_credit.apps.MongoCreditConfig',
    'corsheaders',
]

# =================
# MIDDLEWARE
# =================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', 
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    
]

# ================
# URL & TEMPLATES
# ================
ROOT_URLCONF = 'letsema.urls'
WSGI_APPLICATION = 'letsema.wsgi.application'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# =====================
# AUTH & INTERNATIONAL
# =====================
AUTH_USER_MODEL = 'users.User'
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# =============
# STATIC FILES
# =============
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ====================
# REST FRAMEWORK & JWT
# ====================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    )
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# =====================
# FOREIGN DATA WRAPPERS
# =====================
FDW_SETTINGS = {
    'mfi_a': {
        'server_name': 'mfi_a_server',
        'wrapper': 'postgres_fdw',
        'options': {
            'host': os.getenv('DB_MFI_A_HOST'),
            'dbname': os.getenv('DB_MFI_A_NAME'),
            'port': os.getenv('DB_MFI_A_PORT', '5432'),
        },
        'user_mapping': {
            'local_user': 'postgres',
            'remote_user': os.getenv('DB_MFI_A_USER'),
            'remote_password': os.getenv('DB_MFI_A_PASSWORD')
        }
    },
    'mfi_b': {
        'server_name': 'mfi_b_server',
        'wrapper': 'postgres_fdw',
        'options': {
            'host': os.getenv('DB_MFI_B_HOST'),
            'dbname': os.getenv('DB_MFI_B_NAME'),
            'port': os.getenv('DB_MFI_B_PORT', '5432'),
        },
        'user_mapping': {
            'local_user': 'postgres',
            'remote_user': os.getenv('DB_MFI_B_USER'),
            'remote_password': os.getenv('DB_MFI_B_PASSWORD')
        }
    }
}

# =====================
# REQUIRED ENV VARS CHECK
# =====================
required_db_vars = [
    'DB_LETSEMA_NAME', 'DB_LETSEMA_USER', 'DB_LETSEMA_PASSWORD', 'DB_LETSEMA_HOST',
    'DB_MFI_A_NAME', 'DB_MFI_A_USER', 'DB_MFI_A_PASSWORD', 'DB_MFI_A_HOST',
    'DB_MFI_B_NAME', 'DB_MFI_B_USER', 'DB_MFI_B_PASSWORD', 'DB_MFI_B_HOST'
]

missing_vars = [var for var in required_db_vars if not os.getenv(var)]
if missing_vars:
    sys.exit(f"Missing required database environment variables: {', '.join(missing_vars)}")


# CORS settings
CORS_ALLOW_ALL_ORIGINS = True  # For development only

# For production, specify allowed origins:
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:5173",
#     "https://yourdomain.com",
# ]

# Additional CORS settings if needed
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]