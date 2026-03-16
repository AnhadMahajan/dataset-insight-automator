# Architecture Overview

## Runtime Services

- `frontend`: Next.js dashboard and upload interface
- `backend`: FastAPI ingress API and job/status management
- `worker`: Celery consumer for dataset processing + AI + email
- `redis`: queue broker and job metadata storage

## Request Flow

1. User uploads file and email from frontend.
2. Backend validates file extension, size, and request limits.
3. Backend stores file temporarily and records job metadata in Redis.
4. Backend publishes Celery task to Redis queue.
5. Worker processes dataset with pandas and computes metrics.
6. Worker generates summary with Gemini (or fallback summary if key absent).
7. Worker sends report email with Resend (if configured).
8. Worker updates Redis job status; frontend polls status endpoint.

## Security Controls

- file upload extension and size validation
- filename sanitization
- CORS allowlist
- endpoint rate limiting
- temporary upload cleanup in worker finalizer
