import json
from sqlalchemy.orm import Session
from app.models.analysis import AnalysisResult

def create_analysis_result(
    db: Session,
    *,
    user_id: int,
    source_document_id: int,
    target_document_id: int,
    fit_score: int,
    summary: str,
    strengths: list[str],
    gaps: list[str],
    suggestions: list[str],
    improved_bullets: list[str],
    cover_letter: str,
    model_name: str | None = None
):
    result = AnalysisResult(
        user_id=user_id,
        source_document_id=source_document_id,
        target_document_id=target_document_id,
        fit_score=fit_score,
        summary=summary,
        strengths=json.dumps(strengths),
        gaps=json.dumps(gaps),
        suggestions=json.dumps(suggestions),
        improved_bullets=json.dumps(improved_bullets),
        cover_letter=cover_letter,
        model_name=model_name
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result

def get_analysis_result_by_id(db: Session, *, analysis_id: int, user_id: int):
    return (
        db.query(AnalysisResult)
        .filter(AnalysisResult.id == analysis_id, AnalysisResult.user_id == user_id)
        .first()
    )

def list_analysis_results(db: Session, *, user_id: int):
    return (
        db.query(AnalysisResult)
        .filter(AnalysisResult.user_id == user_id)
        .order_by(AnalysisResult.created_at.desc())
        .all()
    )