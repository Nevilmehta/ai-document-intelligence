from datetime import datetime
from pydantic import BaseModel

class DocumentEmbeddingResponse(BaseModel):
    id: int
    user_id: int
    source_document_id: int | None = None
    target_document_id: int | None = None
    content_type: str
    model_name: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class SimilarDocumentResponse(BaseModel):
    id: int
    source_document_id: int | None = None
    target_document_id: int | None = None
    content_type: str
    model_name: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class SemanticSimilarityResponse(BaseModel):
    source_document_id: int
    target_document_id: int
    similarity_score: float
    similarity_percentage: float