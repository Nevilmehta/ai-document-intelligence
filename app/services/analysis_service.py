import json
from sqlalchemy.orm import Session

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
from app.services.llm_service import generate_response
from app.services.prompt_service import build_analysis_prompt

def _deserialize_analysis_record(record):
    return {
        "id": record.id,
        "source_document_id": record.source_document_id,
        "target_document_id": record.target_document_id,
        "fit_score": record.fit_score,
        "summary": record.summary,
        "strengths": json.loads(record.strengths),
        "gaps": json.loads(record.gaps),
        "suggestions": json.loads(record.suggestions),
        "improved_bullets": json.loads(record.improved_bullets),
        "cover_letter": record.cover_letter,
        "model_name": record.model_name,
        "created_at": record.created_at
    }

def run_analysis(
    db: Session,
    *,
    current_user: User,
    source_document_id: int,
    target_document_id: int
):
    source_document = get_source_document_by_id(
        db, document_id=source_document_id, user_id=current_user.id
    )

    if not source_document:
        raise ValueError("Source document not found")

    target_document = get_target_document_by_id(
        db, document_id=target_document_id, user_id=current_user.id
    )

    if not target_document:
        raise ValueError("Target document not found")

    prompt = build_analysis_prompt(source_text=source_document.cleaned_text, 
    target_text=target_document.cleaned_text)

    llm_result = generate_response(source_text=source_document.cleaned_text, 
    target_text=target_document.cleaned_text, 
    prompt=prompt)

    saved_result = create_analysis_result(
        db,
        user_id=current_user.id,
        source_document_id=source_document_id,
        target_document_id=target_document_id,
        fit_score=llm_result["fit_score"],
        summary=llm_result["summary"],
        strengths=llm_result["strengths"],
        gaps=llm_result["gaps"],
        suggestions=llm_result["suggestions"],
        improved_bullets=llm_result["improved_bullets"],
        cover_letter=llm_result["cover_letter"],
        model_name=llm_result.get("model_name")
    )

    return _deserialize_analysis_record(saved_result)

def get_analysis_result(db: Session, *, analysis_id: int, current_user: User):
    record = get_analysis_result_by_id(db, analysis_id=analysis_id, user_id=current_user.id)

    if not record:
        raise ValueError("Analysis result not found")

    return _deserialize_analysis_record(record)

def get_all_analysis_results(db: Session, *, current_user: User):
    records = list_analysis_results(db, user_id=current_user.id)
    return [_deserialize_analysis_record(record) for record in records]