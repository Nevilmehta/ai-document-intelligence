import os 
import re
from pathlib import Path
import logging

from fastapi import UploadFile
from app.core.config import settings
from app.core.exceptions import AppException

ALLOWED_MIME_TYPES = {
    "application/pdf"
}

PDF_SIGNATURE = b"%PDF"

def sanitize_filename(filename: str):
    filename = Path(filename).name

    filename = re.sub(r"[^a-zA-Z0-9._-]", "_", filename)

    return filename

def validate_file_size(contents: bytes) -> None:
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    if len(contents) > max_bytes:
        raise AppException(
            f"File exceeds {settings.MAX_UPLOAD_SIZE_MB} MB limit.",
            status_code=400,
        )

def validate_mime_type(file: UploadFile) -> None:
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise AppException(
            "Only PDF uploads are allowed.",
            status_code=400,
        )

def validate_pdf_signature(contents: bytes, filename: str) -> None:
    if not contents.startswith(PDF_SIGNATURE):
        logger = logging.getLogger("security")
        logger.warning(
            "Invalid PDF signature detected",
            extra={
                "upload_filename": filename,
            },
        )
        raise AppException(
            "Invalid PDF file signature.",
            status_code=400,
        )

def validate_upload(file: UploadFile, contents: bytes) -> str:
    if not file.filename:
        raise AppException(
            "Filename is missing.",
            status_code=400,
        )

    sanitized_filename = sanitize_filename(file.filename)

    validate_mime_type(file)
    validate_file_size(contents)
    validate_pdf_signature(contents, sanitized_filename)

    return sanitized_filename
