from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import AppException
from app.models.embedding import DocumentEmbedding
from app.repositories.embedding_repository import (
    create_document_embedding,
    get_source_document_embeddings,
    get_target_document_embeddings
)
from app.repositories.document_repository import (
    get_target_document_by_id,
    get_source_document_by_id
)
from app.services.embedding_service import generate_embedding

def create_embedding_for_source_document(
    db: Session,
    *,
    user_id: int,
    source_document_id: int
):
    source_document = get_source_document_by_id(db, document_id=source_document_id, user_id=user_id)
    if not source_document:
        raise AppException(status_code=404, detail="Source document not found")

    existing_embedding = get_source_document_embeddings(db, user_id=user_id, source_document_id=source_document_id)
    if existing_embedding:
        return existing_embedding

    embedding = generate_embedding(source_document.cleaned_text)
    return create_document_embedding(
        db,
        user_id=user_id,
        source_document_id=source_document_id,
        target_document_id=None,
        content_type="source_document",
        model_name=settings.GOOGLE_EMBEDDING_MODEL,
        embedding=embedding
    )

def create_embedding_for_target_document(
    db: Session,
    *,
    user_id: int,
    target_document_id: int
):
    target_document = get_target_document_by_id(db, document_id=target_document_id, user_id=user_id)
    if not target_document:
        raise AppException(status_code=404, detail="Target document not found")

    existing_embedding = get_target_document_embeddings(db, user_id=user_id, target_document_id=target_document_id)
    if existing_embedding:
        return existing_embedding

    embedding = generate_embedding(target_document.cleaned_text)
    return create_document_embedding(
        db,
        user_id=user_id,
        source_document_id=None,
        target_document_id=target_document_id,
        content_type="target_document",
        model_name="text-embedding-3-small",
        embedding=embedding
    )

def find_similar_source_documents(
    db: Session,
    *,
    user_id: int,
    query_embeddings: list[float],
    limit: int = 5
):
    return (
        db.query(DocumentEmbedding)
        .filter(
            DocumentEmbedding.user_id == user_id,
            DocumentEmbedding.content_type == "source_document"
        )
        .order_by(DocumentEmbedding.embedding.cosine_distance(query_embeddings))
        .limit(limit)
        .all()
    )
