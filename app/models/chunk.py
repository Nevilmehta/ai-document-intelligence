from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime, func
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector

from app.core.config import settings
from app.core.database import Base

class SourceDocumentChunk(Base):
    __tablename__ = "source_document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    source_document_id = Column(Integer, ForeignKey("source_documents.id", ondelete="CASCADE"), nullable=False, index=True)

    chunk_index = Column(Integer, nullable=False)
    chunk_text = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    source_document = relationship("SourceDocument")

class SourceDocumentChunkEmbedding(Base):
    __tablename__ = "source_document_chunk_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    source_document_id = Column(Integer, ForeignKey("source_documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_id = Column(Integer, ForeignKey("source_document_chunks.id", ondelete="CASCADE"), nullable=False, index=True)

    model_name = Column(String(100), nullable=False)
    embedding = Column(Vector(settings.EMBEDDING_DIMENSION), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    source_document = relationship("SourceDocument")
    chunk = relationship("SourceDocumentChunk")