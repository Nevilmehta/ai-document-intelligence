from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import AppException
from app.repositories.chunk_repository import (
    create_source_document_chunk,
    create_source_document_chunk_embedding,
    get_source_chunks,
    get_source_chunk_embedding
)
from app.repositories.document_repository import get_source_document_by_id
from app.services.embedding_service import generate_embedding
from app.utils.chunker import chunk_text

def create_chunks_and_embeddings_for_source_document(
    db: Session,
    *,
    user_id: int,
    source_document_id: int
):
    source_document = get_source_document_by_id(db, document_id=source_document_id, user_id=user_id)
    if not source_document:
        raise AppException(status_code=404, detail="Source document not found")

    existing_chunks = get_source_chunks(db, user_id=user_id, source_document_id=source_document_id)
    if existing_chunks:
        return existing_chunks

    chunks = chunk_text(source_document.cleaned_text, chunk_size=settings.CHUNK_SIZE, chunk_overlap=settings.CHUNK_OVERLAP)

    created_chunks = []

    for index, chunk in enumerate(chunks):
        chunk_record = create_source_document_chunk(
            db,
            user_id=user_id,
            source_document_id=source_document_id,
            chunk_index=index,
            chunk_text=chunk
        )

        embedding = generate_embedding(chunk)

        create_source_document_chunk_embedding(
            db,
            user_id=user_id,
            source_document_id=source_document_id,
            chunk_id=chunk_record.id,
            model_name=settings.GOOGLE_EMBEDDING_MODEL,
            embedding=embedding
        )

        created_chunks.append(chunk_record)

    return created_chunks