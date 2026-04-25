from sqlalchemy.orm import Session
from app.models.chunk import SourceDocumentChunk, SourceDocumentChunkEmbedding

def create_source_document_chunk(
    db: Session,
    *,
    user_id: int,
    source_document_id: int,
    chunk_index: int,
    chunk_text: str
):
    chunk = SourceDocumentChunk(
        user_id=user_id,
        source_document_id=source_document_id,
        chunk_index=chunk_index,
        chunk_text=chunk_text
    )
    db.add(chunk)
    db.commit()
    db.refresh(chunk)
    return chunk

def create_source_document_chunk_embedding(
    db: Session,
    *,
    user_id: int,
    source_document_id: int,
    chunk_id: int,
    model_name: str,
    embedding: list[float]
):
    record = SourceDocumentChunkEmbedding(
        user_id=user_id,
        source_document_id=source_document_id,
        chunk_id=chunk_id,
        model_name=model_name,
        embedding=embedding
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def get_source_chunks(db: Session, *, user_id: int, source_document_id: int):
    return (
        db.query(SourceDocumentChunk)
        .filter(
            SourceDocumentChunk.user_id == user_id,
            SourceDocumentChunk.source_document_id == source_document_id
        )
        .order_by(SourceDocumentChunk.chunk_index.asc())
        .all()
    )

def get_source_chunk_embedding(db: Session, *, user_id: int, source_document_id: int):
    return (
        db.query(SourceDocumentChunkEmbedding)
        .filter(
            SourceDocumentChunkEmbedding.user_id == user_id,
            SourceDocumentChunkEmbedding.source_document_id == source_document_id
        )
        .all()
    )