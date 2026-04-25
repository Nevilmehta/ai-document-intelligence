from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.chunk import SourceDocumentChunk, SourceDocumentChunkEmbedding
from app.repositories.embedding_repository import get_target_document_embeddings
from app.services.embedding_service import generate_embedding

def find_relevant_chunks_for_target_document(
    db: Session,
    *,
    user_id: int,
    source_document_id: int,
    target_document_id: int,
    limit: int | None = None
):
    target_embedding = get_target_document_embeddings(db, user_id=user_id, target_document_id=target_document_id)
    if target_embedding:
        query_embedding = target_embedding.embedding
    else:
        return []

    top_k = limit or settings.RETRIEVAL_TOP_K

    results = (
        db.query(SourceDocumentChunk, SourceDocumentChunkEmbedding)
        .join(
            SourceDocumentChunkEmbedding,
            SourceDocumentChunk.id == SourceDocumentChunkEmbedding.chunk_id
        )
        .filter(
            SourceDocumentChunk.user_id == user_id,
            SourceDocumentChunk.source_document_id == source_document_id,
            SourceDocumentChunkEmbedding.user_id == user_id,
            SourceDocumentChunkEmbedding.source_document_id == source_document_id
        )
        .order_by(SourceDocumentChunkEmbedding.embedding.cosine_distance(query_embedding))
        .limit(top_k)
        .all()
    )

    return [
        {
            "chunk_id": chunk.id,
            "chunk_index": chunk.chunk_index,
            "chunk_text": chunk.chunk_text
        }
        for chunk, _embedding in results
    ]