import json
import logging
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import AppException
from app.models.user import User
from app.repositories.analysis_repository import (
    create_analysis_result,
    get_analysis_result_by_id,
    list_analysis_results
)
from app.repositories.document_repository import (
    get_source_document_by_id,
    get_target_document_by_id
)
from app.services.retrieval_service import compute_source_target_similarity

from app.services.llm_service import generate_response
from app.services.cache_service import get_cache, set_cache
from app.utils.cache_keys import build_analysis_cache_key

logger = logging.getLogger(__name__)


def _deserialize_analysis_record(record):
    return {
        "id": record.id,
        "source_document_id": record.source_document_id,
        "target_document_id": record.target_document_id,
        "fit_score": record.fit_score,
        "semantic_similarity": record.semantic_similarity,
        "summary": record.summary,
        "strengths": json.loads(record.strengths),
        "gaps": json.loads(record.gaps),
        "suggestions": json.loads(record.suggestions),
        "improved_bullets": json.loads(record.improved_bullets),
        "cover_letter": record.cover_letter,
        "model_name": record.model_name,
        "created_at": record.created_at
    }

def perform_analysis_and_store(
    db: Session,
    *,
    user_id: int,
    source_document_id: int,
    target_document_id: int
):
    source_document = get_source_document_by_id(
        db,
        document_id=source_document_id,
        user_id=user_id
    )
    if not source_document:
        raise AppException("Source document not found.", status_code=404)

    target_document = get_target_document_by_id(
        db,
        document_id=target_document_id,
        user_id=user_id,
    )
    if not target_document:
        raise AppException("Target document not found.", status_code=404)

    cache_key = build_analysis_cache_key(
        user_id=user_id,
        source_document_id=source_document.id,
        target_document_id=target_document.id,
        model_name=settings.GOOGLE_AI_MODEL
    )

    cached_result = get_cache(cache_key)
    if cached_result:
        logger.info("Cache hit for key %s", cache_key)
        return cached_result

    logger.info("Cache miss for key %s", cache_key)

    similarity_result = compute_source_target_similarity(
        db,
        user_id=user_id,
        source_document_id=source_document.id,
        target_document_id=target_document.id
    )
    semantic_similarity = similarity_result["similarity_score"]

    llm_result = generate_response(
        source_text=source_document.cleaned_text,
        target_text=target_document.cleaned_text,
        semantic_similarity=semantic_similarity
    )

    saved_result = create_analysis_result(
        db,
        user_id=user_id,
        source_document_id=source_document.id,
        target_document_id=target_document.id,
        fit_score=llm_result["fit_score"],
        semantic_similarity=semantic_similarity,
        summary=llm_result["summary"],
        strengths=llm_result["strengths"],
        gaps=llm_result["gaps"],
        suggestions=llm_result["suggestions"],
        improved_bullets=llm_result["improved_bullets"],
        cover_letter=llm_result["cover_letter"],
        model_name=llm_result["model_name"]
    )

    response_data = _deserialize_analysis_record(saved_result)

    cached_data = {
        **response_data,
        "created_at": response_data["created_at"].isoformat()
    }

    set_cache(cache_key, cached_data)

    return {"cached": False, "result": response_data}

def run_analysis(
    db: Session,
    *,
    current_user: User,
    source_document_id: int,
    target_document_id: int
):
    output = perform_analysis_and_store(
        db,
        user_id= current_user.id,
        source_document_id= source_document_id,
        target_document_id= target_document_id
    )
    return output["result"]


def get_analysis_result(db: Session, *, analysis_id: int, current_user: User):
    record = get_analysis_result_by_id(
        db,
        analysis_id=analysis_id,
        user_id=current_user.id
    )

    if not record:
        raise AppException("Analysis result not found", status_code=404)

    return _deserialize_analysis_record(record)


def get_all_analysis_results(db: Session, *, current_user: User):
    records = list_analysis_results(db, user_id=current_user.id)
    return [_deserialize_analysis_record(record) for record in records]