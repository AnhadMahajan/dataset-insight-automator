from __future__ import annotations

import tempfile
from pathlib import Path

from worker_app.celery_app import celery_app
from worker_app.email_service import send_summary_email
from worker_app.job_store import update_job
from worker_app.llm_service import generate_insight_summary
from worker_app.metrics import analyze_dataset, load_dataset

celery = celery_app


@celery_app.task(name="worker.tasks.process_dataset")
def process_dataset(
    job_id: str,
    file_bytes: bytes,
    filename: str,
    recipient_email: str,
) -> dict[str, str]:
    update_job(job_id=job_id, status="processing")

    suffix = Path(filename).suffix or ".csv"
    tmp_path: Path | None = None

    try:
        with tempfile.NamedTemporaryFile(
            suffix=suffix, delete=False
        ) as tmp:
            tmp.write(file_bytes)
            tmp_path = Path(tmp.name)

        dataset = load_dataset(str(tmp_path))
        analysis = analyze_dataset(dataset)
        summary = generate_insight_summary(analysis)
        send_summary_email(
            recipient_email=recipient_email,
            summary=summary,
            metrics=analysis,
        )

        update_job(
            job_id=job_id,
            status="completed",
            metrics=analysis,
            summary=summary,
            error=None,
        )

        return {"job_id": job_id, "status": "completed"}
    except Exception as exc:
        update_job(job_id=job_id, status="failed", error=str(exc))
        raise
    finally:
        if tmp_path is not None:
            tmp_path.unlink(missing_ok=True)
