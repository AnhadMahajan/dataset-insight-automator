import json
from datetime import datetime, timezone
from typing import Any

from app.schemas.job import JobStatus
from app.services.redis_client import get_redis_client

JOB_KEY_PREFIX = "job:"
JOB_INDEX_KEY = "jobs:index"


def _timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def _job_key(job_id: str) -> str:
    return f"{JOB_KEY_PREFIX}{job_id}"


def create_job(job_id: str, recipient_email: str, filename: str) -> None:
    now = _timestamp()
    redis_client = get_redis_client()
    mapping: dict[str, str] = {
        "id": job_id,
        "status": JobStatus.QUEUED.value,
        "recipient_email": recipient_email,
        "filename": filename,
        "created_at": now,
        "updated_at": now,
    }

    pipeline = redis_client.pipeline()
    pipeline.hset(_job_key(job_id), mapping=mapping)
    pipeline.zadd(JOB_INDEX_KEY, {job_id: datetime.now(timezone.utc).timestamp()})
    pipeline.execute()


def update_job(
    job_id: str,
    status: JobStatus,
    metrics: dict[str, Any] | None = None,
    summary: str | None = None,
    error: str | None = None,
) -> None:
    redis_client = get_redis_client()
    payload: dict[str, str] = {
        "status": status.value,
        "updated_at": _timestamp(),
    }

    if metrics is not None:
        payload["metrics"] = json.dumps(metrics)
    if summary is not None:
        payload["summary"] = summary
    if error is not None:
        payload["error"] = error

    redis_client.hset(_job_key(job_id), mapping=payload)


def _deserialize(job_data: dict[str, str]) -> dict[str, Any]:
    deserialized: dict[str, Any] = dict(job_data)
    metrics_value = deserialized.get("metrics")
    if metrics_value:
        try:
            deserialized["metrics"] = json.loads(metrics_value)
        except json.JSONDecodeError:
            deserialized["metrics"] = None
    else:
        deserialized["metrics"] = None

    if "summary" not in deserialized:
        deserialized["summary"] = None
    if "error" not in deserialized:
        deserialized["error"] = None

    return deserialized


def get_job(job_id: str) -> dict[str, Any] | None:
    redis_client = get_redis_client()
    data = redis_client.hgetall(_job_key(job_id))
    if not data:
        return None
    return _deserialize(data)


def list_jobs(limit: int = 50) -> list[dict[str, Any]]:
    redis_client = get_redis_client()
    job_ids = redis_client.zrevrange(JOB_INDEX_KEY, 0, max(limit - 1, 0))
    if not job_ids:
        return []

    pipeline = redis_client.pipeline()
    for job_id in job_ids:
        pipeline.hgetall(_job_key(job_id))
    records = pipeline.execute()

    jobs: list[dict[str, Any]] = []
    for record in records:
        if record:
            jobs.append(_deserialize(record))
    return jobs
