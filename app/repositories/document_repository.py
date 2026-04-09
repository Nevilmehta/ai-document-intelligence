from sqlalchemy.orm import Session 
from app.models.document import SourceDocument, TargetDocument

def create_source_document(
    db: Session,
    *,
    user_id: int,
    file_name: str,
    original_file_name: str,
    file_type: str,
    file_path: str,
    document_category: str,
    extracted_text: str,
    cleaned_text: str
):
    document = SourceDocument(
        user_id=user_id,
        file_name=file_name,
        original_file_name=original_file_name,
        file_type=file_type,
        file_path=file_path,
        document_category=document_category,
        extracted_text=extracted_text,
        cleaned_text=cleaned_text
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document

def get_source_document_by_id(db: Session, document_id: int, user_id: int):
    return (
        db.query(SourceDocument)
        .filter(SourceDocument.id == document_id, SourceDocument.user_id == user_id)
        .first()
    )

def list_source_documents(db: Session, user_id: int):
    return (
        db.query(SourceDocument)
        .filter(SourceDocument.user_id == user_id)
        .order_by(SourceDocument.created_at.desc())
        .all()
    )

def create_target_document(
    db: Session,
    *,
    user_id: int,
    title: str,
    target_category: str,
    raw_text: str,
    cleaned_text: str
):
    document = TargetDocument(
        user_id=user_id,
        title=title,
        target_category=target_category,
        raw_text=raw_text,
        cleaned_text=cleaned_text
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document

def get_target_document_by_id(db: Session, document_id: int, user_id: int):
    return (
        db.query(TargetDocument)
        .filter(TargetDocument.id == document_id, TargetDocument.user_id == user_id)
        .first()
    )

def list_target_documents(db: Session, user_id: int):
    return (
        db.query(TargetDocument)
        .filter(TargetDocument.user_id == user_id)
        .order_by(TargetDocument.created_at.desc())
        .all()
    )