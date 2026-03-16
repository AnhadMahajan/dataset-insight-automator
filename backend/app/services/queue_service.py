from celery import Celery

from app.config import get_settings

settings = get_settings()
celery_client = Celery(
    "sales_insight_api",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)


def enqueue_processing_job(
    job_id: str,
    file_bytes: bytes,
    filename: str,
    recipient_email: str,
) -> str:
    task = celery_client.send_task(
        "worker.tasks.process_dataset",
        kwargs={
            "job_id": job_id,
            "file_bytes": file_bytes,
            "filename": filename,
            "recipient_email": recipient_email,
        },
        queue="sales-insight",
    )
    return str(task.id)
