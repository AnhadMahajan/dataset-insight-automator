import json
from datetime import datetime, timezone
from typing import Any

import redis

from worker_app.settings import get_settings

settings = get_settings()
redis_client = redis.Redis.from_url(settings.redis_url, decode_responses=True)

JOB_KEY_PREFIX = "job:"


def _job_key(job_id: str) -> str:
    return f"{JOB_KEY_PREFIX}{job_id}"


def _timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def update_job(
    job_id: str,
    status: str,
    metrics: dict[str, Any] | None = None,
    summary: str | None = None,
    error: str | None = None,
) -> None:
    payload: dict[str, str] = {
        "status": status,
        "updated_at": _timestamp(),
    }

    if metrics is not None:
        payload["metrics"] = json.dumps(metrics)
    if summary is not None:
        payload["summary"] = summary
    if error is not None:
        payload["error"] = error

    redis_client.hset(_job_key(job_id), mapping=payload)
