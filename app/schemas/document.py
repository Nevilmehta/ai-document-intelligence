from datetime import datetime
from pydantic import BaseModel

class SourceDocumentResponse(BaseModel):
    id: int
    file_name: str
    original_file_name: str
    file_type: str
    document_category: str
    extracted_text: str | None = None
    cleaned_text: str | None = None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class TargetDocumentCreate(BaseModel):
    title: str
    raw_text: str 
    target_category: str = "role_description"

class TargetDocumentResponse(BaseModel):
    id: int
    title: str
    target_category: str
    raw_text: str | None = None
    cleaned_text: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }