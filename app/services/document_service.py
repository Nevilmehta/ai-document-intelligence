from pathlib import Path
from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import AppException
from app.repositories.document_repository import (
    create_source_document, 
    get_source_document_by_id, 
    list_source_documents, 
    create_target_document,
    get_target_document_by_id,
    list_target_documents
)
from app.models.user import User
from app.services.extraction_service import extract_and_clean_text_from_pdf
from app.utils.file_handler import (
    validate_pdf_file, 
    ensure_upload_dir, 
    generate_stored_filename, 
    build_file_path
)
from app.utils.text_cleaner import clean_input_text
from app.workers.tasks import create_source_embedding_task, create_target_embedding_task

def upload_source_document(db: Session, *, current_user: User, file: UploadFile, document_category: str = "resume"):
    validate_pdf_file(file)
    ensure_upload_dir()

    contents = file.file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    if len(contents) > max_bytes:
        raise AppException(
            f"File size exceeds the maximum limit of {settings.MAX_UPLOAD_SIZE_MB} MB.",
            status_code=400
        )

    stored_filename = generate_stored_filename(file.filename)
    file_path = build_file_path(stored_filename)

    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    extracted_text, cleaned_text = extract_and_clean_text_from_pdf(file_path)

    if not cleaned_text:
        Path(file_path).unlink(missing_ok=True)
        raise AppException("No readable text could be extracted from this pdf", status_code=400)

    saved_document = create_source_document(
        db,
        user_id=current_user.id,
        file_name=stored_filename,
        original_file_name=file.filename,
        file_type=file.content_type or "application/pdf",
        file_path=file_path,
        document_category=document_category,
        extracted_text=extracted_text,
        cleaned_text=cleaned_text
    )

    create_source_embedding_task.delay(
        user_id = current_user.id,
        source_document_id = saved_document.id
    )

    return saved_document

def get_source_document(db: Session, *, current_user: User, document_id: int):
    return get_source_document_by_id(db, document_id=document_id, user_id=current_user.id)

def get_all_source_documents(db: Session, *, current_user: User):
    return list_source_documents(db, user_id=current_user.id)

def create_target_document_service(db: Session, *, current_user: User, title: str, target_category: str = "role_description", raw_text: str):
    cleaned_text = clean_input_text(raw_text)

    if not title.strip():
        raise AppException("Title cannot be empty.", status_code=400)

    if not cleaned_text:
        raise AppException("Target document text cannot be empty.", status_code=400)

    saved_document = create_target_document(
        db,
        user_id=current_user.id,
        title=title.strip(),
        target_category=target_category,
        raw_text=raw_text,
        cleaned_text=cleaned_text,
    )

    create_target_embedding_task.delay(
        user_id = current_user.id,
        target_document_id = saved_document.id
    )

    return saved_document

def get_target_document(db: Session, *, current_user: User, document_id: int):
    return get_target_document_by_id(db, document_id=document_id, user_id=current_user.id)

def get_all_target_documents(db: Session, *, current_user: User):
    return list_target_documents(db, user_id=current_user.id)