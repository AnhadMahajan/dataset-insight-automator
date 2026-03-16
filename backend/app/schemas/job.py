from enum import Enum
from typing import Any

from pydantic import BaseModel, EmailStr


class JobStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class UploadResponse(BaseModel):
    job_id: str
    status: JobStatus
    message: str


class JobStatusResponse(BaseModel):
    id: str
    status: JobStatus
    created_at: str
    updated_at: str
    recipient_email: EmailStr
    filename: str
    metrics: dict[str, Any] | None = None
    summary: str | None = None
    error: str | None = None


class JobListResponse(BaseModel):
    jobs: list[JobStatusResponse]
