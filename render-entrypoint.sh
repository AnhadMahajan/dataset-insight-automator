#!/bin/sh
set -e

# Start Celery worker in the background
celery -A worker_app.tasks worker --loglevel=info -Q sales-insight &

# Start Uvicorn in the foreground (keeps the container alive)
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
