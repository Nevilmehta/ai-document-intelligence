import os
import uuid
from pathlib import Path

from fastapi import UploadFile
from app.core.config import settings

ALLOWED_EXTENSIONS = {".pdf"}
ALLOWED_CONTENT_TYPES = {"application/pdf"}

def validate_pdf_file(file: UploadFile) -> None:
    extension = Path(file.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Invalid file extension: {extension} Only PDF files are allowed.")

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise ValueError(f"Invalid content type: {file.content_type} Only PDF files are allowed.")

def ensure_upload_dir() -> None:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

def generate_stored_filename(original_filename: str) -> str:
    extension = Path(original_filename).suffix.lower()
    unique_id = uuid.uuid4().hex
    return f"{unique_id}{extension}"

def build_file_path(stored_filename:str) -> str:
    return str(Path(settings.UPLOAD_DIR) / stored_filename)