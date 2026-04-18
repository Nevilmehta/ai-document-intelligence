from sqlalchemy.orm import Session
from app.models.embedding import DocumentEmbedding

def create_document_embedding(
    db: Session,
    *,
    user_id: int,
    source_document_id: int | None,
    target_document_id: int | None,
    content_type: str,
    model_name: str,
    embedding: list[float]
):
    record = DocumentEmbedding(
        user_id=user_id,
        source_document_id=source_document_id,
        target_document_id=target_document_id,
        content_type=content_type,
        model_name=model_name,
        embedding=embedding
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def get_source_document_embeddings(db: Session, *, user_id: int, source_document_id: int):
    return (
        db.query(DocumentEmbedding)
        .filter(
            DocumentEmbedding.user_id == user_id,
            DocumentEmbedding.source_document_id == source_document_id
        )
        .first()
    )

def get_target_document_embeddings(db: Session, *, user_id: int, target_document_id: int):
    return (
        db.query(DocumentEmbedding)
        .filter(
            DocumentEmbedding.user_id == user_id,
            DocumentEmbedding.target_document_id == target_document_id
        )
        .first()
    )