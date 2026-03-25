#!/bin/sh
set -e

PORT="${PORT:-8000}"
CELERY_CONCURRENCY="${CELERY_CONCURRENCY:-2}"

# Start API first so Render health checks pass quickly and consistently.
uvicorn app.main:app --host 0.0.0.0 --port "$PORT" &
UVICORN_PID=$!

cleanup() {
	if kill -0 "$UVICORN_PID" 2>/dev/null; then
		kill "$UVICORN_PID" 2>/dev/null || true
	fi
	if [ -n "${CELERY_PID:-}" ] && kill -0 "$CELERY_PID" 2>/dev/null; then
		kill "$CELERY_PID" 2>/dev/null || true
	fi
}

trap cleanup INT TERM EXIT

# Wait until local health endpoint responds before launching Celery.
ATTEMPTS=0
until python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:${PORT}/health', timeout=2)" >/dev/null 2>&1; do
	ATTEMPTS=$((ATTEMPTS + 1))
	if [ "$ATTEMPTS" -ge 30 ]; then
		echo "API failed to become healthy in time."
		exit 1
	fi
	sleep 1
done

celery -A worker_app.tasks worker \
	--loglevel=info \
	--concurrency="$CELERY_CONCURRENCY" \
	--without-gossip \
	--without-mingle \
	-Q sales-insight &
CELERY_PID=$!

wait "$UVICORN_PID"
UVICORN_EXIT=$?

if kill -0 "$CELERY_PID" 2>/dev/null; then
	kill "$CELERY_PID" 2>/dev/null || true
	wait "$CELERY_PID" || true
fi

exit "$UVICORN_EXIT"
