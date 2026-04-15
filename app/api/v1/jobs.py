from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.exceptions import AppException
from app.models.user import User
from app.schemas.analysis import AnalysisCreate
from app.schemas.job import AnalysisJobCreateResponse, AnalysisJobStatusResponse
from app.services.job_service import enqueue_analysis_job, get_analysis_job

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.post("/analysis", response_model=AnalysisJobCreateResponse, status_code=status.HTTP_202_ACCEPTED)
def create_analysis_job(
    payload: AnalysisCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = enqueue_analysis_job(
        db,
        current_user=current_user,
        source_document_id=payload.source_document_id,
        target_document_id=payload.target_document_id
    )
    return {
        "job_id": job.id,
        "celery_task_id": job.celery_task_id,
        "status": job.status
    }

@router.get("/analysis/{job_id}", response_model=AnalysisJobStatusResponse)
def read_analysis_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = get_analysis_job(db, current_user=current_user, job_id=job_id)
    if not job:
        raise AppException("Analysis job not found", status_code= 404)
    return {
        "job_id": job.id,
        "celery_task_id": job.celery_task_id,
        "status": job.status,
        "analysis_result_id": job.analysis_result_id,
        "created_at": job.created_at,
        "updated_at": job.updated_at
    }