from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    celery_task_id = Column(String(255), unique=True, nullable=False, index=True)
    source_document_id = Column(Integer, ForeignKey("source_documents.id", ondelete="CASCADE"), nullable=False)
    target_document_id = Column(Integer, ForeignKey("target_documents.id", ondelete="CASCADE"), nullable=False)

    status = Column(String(50), nullable=False, default="PENDING")
    analysis_result_id = Column(Integer, ForeignKey("analysis_results.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User")