from sqlalchemy.orm import Session
from app.models.user import User
from app.repositories.job_repository import create_analysis_job, get_job_by_id
from app.workers.tasks import run_document_analysis_task

def enqueue_analysis_job(
    db: Session,
    *,
    current_user: User,
    source_document_id: int,
    target_document_id: int
):
    task = run_document_analysis_task.delay(
        user_id = current_user.id,
        source_document_id = source_document_id,
        target_document_id = target_document_id
    )

    job = create_analysis_job(
        db,
        user_id= current_user.id,
        celery_task_id= task.id,
        source_document_id= source_document_id,
        target_document_id= target_document_id,
        status= "PENDING"
    )

    return job

def get_analysis_job(
    db: Session,
    *,
    current_user: User,
    job_id: int
):
    return get_job_by_id(db, job_id=job_id, user_id=current_user.id)