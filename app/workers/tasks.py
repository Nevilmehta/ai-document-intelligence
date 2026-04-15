import logging

from app.core.database import create_db_session
from app.repositories.analysis_repository import get_analysis_result_by_id
from app.repositories.job_repository import get_job_by_task_id, update_job_status
from app.services.analysis_service import perform_analysis_and_store
from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, name="app.workers.tasks.run_document_analysis")
def run_document_analysis_task(self, user_id: int, source_document_id: int, target_document_id: int):
    db = create_db_session()
    try:
        job = get_job_by_task_id(db, celery_task_id=self.request.id)
        if job:
            update_job_status(db, job=job, status="STARTED")

        output = perform_analysis_and_store(
            db,
            user_id= user_id,
            source_document_id= source_document_id,
            target_document_id= target_document_id
        )

        analysis_result_id = output["result"]["id"]

        job = get_job_by_task_id(db, celery_task_id=self.request.id)
        if job:
            update_job_status(
                db,
                job= job,
                status= "SUCCESS",
                analysis_result_id=analysis_result_id
            )

        return {
            "status": "SUCCESS",
            "analysis_result_id": analysis_result_id,
            "cached": output["cached"]
        }

    except Exception:
        logger.exception("celery analysis task failed")
        job = get_job_by_task_id(db, celery_task_id=self.request.id)
        if job:
            update_job_status(db, job=job, status="FAILURE")
        raise
    finally:
        db.close()