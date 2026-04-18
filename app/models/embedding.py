from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector

from app.core.config import settings
from app.core.database import Base

class DocumentEmbedding(Base):
    __tablename__ = "document_embeddings"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    source_document_id = Column(Integer, ForeignKey("source_documents.id", ondelete="CASCADE"), nullable=True, index=True)
    target_document_id = Column(Integer, ForeignKey("target_documents.id", ondelete="CASCADE"), nullable=True, index=True)

    content_type = Column(String(50), nullable=False)
    model_name = Column(String(100), nullable=False)

    embedding = Column(Vector(settings.EMBEDDING_DIMENSION), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    source_document = relationship("SourceDocument")
    target_document = relationship("TargetDocument")
    
