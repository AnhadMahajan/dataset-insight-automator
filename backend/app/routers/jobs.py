from fastapi import APIRouter, HTTPException, Request, status

from app.config import get_settings
from app.rate_limiter import limiter
from app.schemas.job import JobListResponse, JobStatusResponse
from app.services.job_store import get_job, list_jobs

router = APIRouter(tags=["jobs"])
settings = get_settings()


@router.get("/job/{job_id}", response_model=JobStatusResponse)
@limiter.limit(settings.status_rate_limit)
def get_job_status(request: Request, job_id: str) -> JobStatusResponse:
    del request
    job_data = get_job(job_id)
    if not job_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")
    return JobStatusResponse.model_validate(job_data)


@router.get("/jobs", response_model=JobListResponse)
@limiter.limit(settings.status_rate_limit)
def get_jobs(request: Request, limit: int = 25) -> JobListResponse:
    del request
    jobs = list_jobs(limit=min(max(limit, 1), 100))
    return JobListResponse(jobs=[JobStatusResponse.model_validate(item) for item in jobs])
