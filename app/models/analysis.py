from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    source_document_id = Column(Integer, ForeignKey("source_documents.id", ondelete="CASCADE"), nullable=False, index=True)
    target_document_id = Column(Integer, ForeignKey("target_documents.id", ondelete="CASCADE"), nullable=False, index=True)

    fit_score = Column(Integer, nullable=False)
    summary = Column(Text, nullable=False)

    strengths = Column(Text, nullable=False)
    gaps = Column(Text, nullable=False)
    suggestions = Column(Text, nullable=False)
    improved_bullets = Column(Text, nullable=False)
    cover_letter = Column(Text, nullable=False)

    model_name = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="analysis_results")
    source_document = relationship("SourceDocument")
    target_document = relationship("TargetDocument")