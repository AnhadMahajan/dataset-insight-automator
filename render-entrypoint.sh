#!/bin/sh
set -e

# Start Celery worker in the background
celery -A worker_app.tasks worker --loglevel=info -Q sales-insight &
CELERY_PID=$!

# Start Uvicorn in the foreground (keeps the container alive and serves HTTP)
uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" &
UVICORN_PID=$!

# If either process exits, kill the other and exit
wait -n 2>/dev/null || true
kill "$CELERY_PID" "$UVICORN_PID" 2>/dev/null || true
wait
