from datetime import datetime
from pydantic import BaseModel

class AnalysisCreate(BaseModel):
    source_document_id: int
    target_document_id: int

class AnalysisResponse(BaseModel):
    id: int
    source_document_id: int
    target_document_id: int
    fit_score: int
    semantic_similarity: float | None = None
    summary: str
    strengths: list[str]
    gaps: list[str]
    suggestions: list[str]
    improved_bullets: list[str]
    cover_letter: str
    model_name: str | None = None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

# Pydantic will parse ISO datetime strings back into datetime objects for the response.