from datetime import datetime
from pydantic import BaseModel

class AnalysisJobCreateResponse(BaseModel):
    job_id: int
    celery_task_id: str
    status: str

class AnalysisJobStatusResponse(BaseModel):
    job_id: int
    celery_task_id: str
    status: str
    analysis_result_id: int | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }