import logging
import time

from app.core.database import create_db_session
from app.repositories.job_repository import get_job_by_task_id, update_job_status
from app.services.analysis_service import perform_analysis_and_store
from app.services.retrieval_service import (
    create_embedding_for_source_document,
    create_embedding_for_target_document,
)
from app.services.chunk_service import create_chunks_and_embeddings_for_source_document
from app.workers.celery_app import celery_app


logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="app.workers.tasks.run_document_analysis")
def run_document_analysis_task(
    self,
    user_id: int,
    source_document_id: int,
    target_document_id: int,
):
    db = create_db_session()
    start_time = time.perf_counter()

    logger.info(
        "Celery analysis task started",
        extra={
            "request_id": "-",
            "task_id": self.request.id,
            "user_id": user_id,
            "source_document_id": source_document_id,
            "target_document_id": target_document_id,
        },
    )

    try:
        job = get_job_by_task_id(db, celery_task_id=self.request.id)
        if job:
            update_job_status(db, job=job, status="STARTED")

        output = perform_analysis_and_store(
            db,
            user_id=user_id,
            source_document_id=source_document_id,
            target_document_id=target_document_id,
        )

        analysis_result_id = output["result"]["id"]

        job = get_job_by_task_id(db, celery_task_id=self.request.id)
        if job:
            update_job_status(
                db,
                job=job,
                status="SUCCESS",
                analysis_result_id=analysis_result_id,
            )

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        logger.info(
            "Celery analysis task completed",
            extra={
                "request_id": "-",
                "task_id": self.request.id,
                "user_id": user_id,
                "analysis_result_id": analysis_result_id,
                "cached": output["cached"],
                "duration_ms": duration_ms,
            },
        )

        return {
            "status": "SUCCESS",
            "analysis_result_id": analysis_result_id,
            "cached": output["cached"],
        }

    except Exception:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        logger.exception(
            "Celery analysis task failed",
            extra={
                "request_id": "-",
                "task_id": self.request.id,
                "user_id": user_id,
                "source_document_id": source_document_id,
                "target_document_id": target_document_id,
                "duration_ms": duration_ms,
            },
        )

        job = get_job_by_task_id(db, celery_task_id=self.request.id)
        if job:
            update_job_status(db, job=job, status="FAILURE")

        raise

    finally:
        db.close()


@celery_app.task(bind=True, name="app.workers.tasks.create_source_embedding")
def create_source_embedding_task(
    self,
    user_id: int,
    source_document_id: int,
):
    db = create_db_session()
    start_time = time.perf_counter()

    logger.info(
        "Celery source embedding task started",
        extra={
            "request_id": "-",
            "task_id": self.request.id,
            "user_id": user_id,
            "source_document_id": source_document_id,
        },
    )

    try:
        record = create_embedding_for_source_document(
            db,
            user_id=user_id,
            source_document_id=source_document_id,
        )

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        logger.info(
            "Celery source embedding task completed",
            extra={
                "request_id": "-",
                "task_id": self.request.id,
                "user_id": user_id,
                "embedding_id": record.id,
                "source_document_id": record.source_document_id,
                "duration_ms": duration_ms,
            },
        )

        return {
            "status": "SUCCESS",
            "embedding_id": record.id,
            "source_document_id": record.source_document_id,
        }

    except Exception:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        logger.exception(
            "Celery source embedding task failed",
            extra={
                "request_id": "-",
                "task_id": self.request.id,
                "user_id": user_id,
                "source_document_id": source_document_id,
                "duration_ms": duration_ms,
            },
        )

        raise

    finally:
        db.close()


@celery_app.task(bind=True, name="app.workers.tasks.create_target_embedding")
def create_target_embedding_task(
    self,
    user_id: int,
    target_document_id: int,
):
    db = create_db_session()
    start_time = time.perf_counter()

    logger.info(
        "Celery target embedding task started",
        extra={
            "request_id": "-",
            "task_id": self.request.id,
            "user_id": user_id,
            "target_document_id": target_document_id,
        },
    )

    try:
        record = create_embedding_for_target_document(
            db,
            user_id=user_id,
            target_document_id=target_document_id,
        )

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        logger.info(
            "Celery target embedding task completed",
            extra={
                "request_id": "-",
                "task_id": self.request.id,
                "user_id": user_id,
                "embedding_id": record.id,
                "target_document_id": record.target_document_id,
                "duration_ms": duration_ms,
            },
        )

        return {
            "status": "SUCCESS",
            "embedding_id": record.id,
            "target_document_id": record.target_document_id,
        }

    except Exception:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        logger.exception(
            "Celery target embedding task failed",
            extra={
                "request_id": "-",
                "task_id": self.request.id,
                "user_id": user_id,
                "target_document_id": target_document_id,
                "duration_ms": duration_ms,
            },
        )

        raise

    finally:
        db.close()


@celery_app.task(bind=True, name="app.workers.tasks.create_chunks_and_embeddings")
def create_source_chunks_and_embeddings_task(
    self,
    user_id: int,
    source_document_id: int,
):
    db = create_db_session()
    start_time = time.perf_counter()

    logger.info(
        "Celery chunking and embedding task started",
        extra={
            "request_id": "-",
            "task_id": self.request.id,
            "user_id": user_id,
            "source_document_id": source_document_id,
        },
    )

    try:
        chunks = create_chunks_and_embeddings_for_source_document(
            db,
            user_id=user_id,
            source_document_id=source_document_id,
        )

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        logger.info(
            "Celery chunking and embedding task completed",
            extra={
                "request_id": "-",
                "task_id": self.request.id,
                "user_id": user_id,
                "source_document_id": source_document_id,
                "chunk_count": len(chunks),
                "duration_ms": duration_ms,
            },
        )

        return {
            "status": "SUCCESS",
            "source_document_id": source_document_id,
            "chunk_count": len(chunks),
        }

    except Exception:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        logger.exception(
            "Celery chunking and embedding task failed",
            extra={
                "request_id": "-",
                "task_id": self.request.id,
                "user_id": user_id,
                "source_document_id": source_document_id,
                "duration_ms": duration_ms,
            },
        )

        raise

    finally:
        db.close()