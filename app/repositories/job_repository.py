from sqlalchemy.orm import Session
from app.models.job import AnalysisJob

def create_analysis_job(
    db: Session,
    *,
    user_id: int,
    celery_task_id: str,
    source_document_id: int,
    target_document_id: int,
    status: str = "PENDING"
):
    job = AnalysisJob(
        user_id = user_id,
        celery_task_id = celery_task_id,
        source_document_id = source_document_id,
        target_document_id = target_document_id,
        status = status
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

def get_job_by_id(db:Session, *, job_id: int, user_id: int):
    return(
        db.query(AnalysisJob)
        .filter(AnalysisJob.id == job_id, AnalysisJob.user_id == user_id)
        .first()
    )

def get_job_by_task_id(db:Session, *, celery_task_id: str):
    return db.query(AnalysisJob).filter(AnalysisJob.celery_task_id == celery_task_id).first()

def update_job_status(
    db: Session,
    *,
    job: AnalysisJob,
    status: str,
    analysis_result_id: int | None = None
):
    job.status = status
    if analysis_result_id is not None:
        job.analysis_result_id = analysis_result_id
    db.commit()
    db.refresh(job)
    return job