from celery import Celery

from worker_app.settings import get_settings

settings = get_settings()

celery_app = Celery(
    "sales_insight_worker",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)

celery_app.conf.task_default_queue = "sales-insight"
celery_app.conf.broker_connection_retry_on_startup = True
