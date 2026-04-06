from app.core.database import Base
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import relationship

class SourceDocument(Base):
    __tablename__ = 'source_documents'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    file_name = Column(String(255), nullable=False)
    original_file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_path = Column(String(500), nullable=False)

    document_category = Column(String(100), nullable=False, default="resume")
    extracted_text = Column(Text, nullable=True)
    cleaned_text = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="source_documents")