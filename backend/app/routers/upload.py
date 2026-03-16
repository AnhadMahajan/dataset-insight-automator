from uuid import uuid4

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile, status
from pydantic import EmailStr

from app.config import get_settings
from app.rate_limiter import limiter
from app.schemas.job import JobStatus, UploadResponse
from app.services.file_service import read_upload_file
from app.services.job_store import create_job, update_job
from app.services.queue_service import enqueue_processing_job

router = APIRouter(tags=["jobs"])
settings = get_settings()


@router.post("/upload", response_model=UploadResponse, status_code=status.HTTP_202_ACCEPTED)
@limiter.limit(settings.upload_rate_limit)
async def upload_dataset(
    request: Request,
    email: EmailStr = Form(...),
    file: UploadFile = File(...),
) -> UploadResponse:
    del request
    file_bytes, original_name = await read_upload_file(
        file=file,
        allowed_extensions=settings.allowed_extension_set,
        max_size_bytes=settings.max_upload_size_bytes,
    )

    job_id = str(uuid4())
    create_job(job_id=job_id, recipient_email=str(email), filename=original_name)

    try:
        enqueue_processing_job(
            job_id=job_id,
            file_bytes=file_bytes,
            filename=original_name,
            recipient_email=str(email),
        )
    except Exception as exc:
        update_job(job_id=job_id, status=JobStatus.FAILED, error="Queue submission failed.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to queue processing task.",
        ) from exc

    return UploadResponse(
        job_id=job_id,
        status=JobStatus.QUEUED,
        message="Dataset uploaded and queued for processing.",
    )
