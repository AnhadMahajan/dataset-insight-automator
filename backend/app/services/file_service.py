import re
from pathlib import Path

from fastapi import HTTPException, UploadFile, status


def sanitize_filename(filename: str) -> str:
    safe_name = re.sub(r"[^A-Za-z0-9._-]", "_", filename)
    safe_name = Path(safe_name).name
    return safe_name or "dataset.csv"


def file_extension(filename: str) -> str:
    return Path(filename).suffix.replace(".", "").lower()


async def read_upload_file(
    file: UploadFile,
    allowed_extensions: set[str],
    max_size_bytes: int,
) -> tuple[bytes, str]:
    """Read and validate an uploaded file, returning its bytes and sanitized name."""
    original_name = sanitize_filename(file.filename or "dataset.csv")
    extension = file_extension(original_name)

    if extension not in allowed_extensions:
        allowed = ", ".join(sorted(allowed_extensions))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed extensions: {allowed}.",
        )

    chunks: list[bytes] = []
    written_bytes = 0
    chunk_size = 1024 * 1024

    try:
        while True:
            chunk = await file.read(chunk_size)
            if not chunk:
                break
            written_bytes += len(chunk)
            if written_bytes > max_size_bytes:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="File too large. Maximum size is 10MB.",
                )
            chunks.append(chunk)
    finally:
        await file.close()

    if written_bytes == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    return b"".join(chunks), original_name
