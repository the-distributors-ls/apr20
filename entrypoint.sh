#!/bin/sh

# Apply database migrations with a timeout to handle potential remote connection issues
python manage.py migrate --noinput || echo "Migration issues, please check your database connection"

# Collect static files
python manage.py collectstatic --noinput

# Start server
exec "$@"
