from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.analysis import AnalysisCreate, AnalysisResponse
from app.services.analysis_service import run_analysis, get_all_analysis_results, get_analysis_result

router = APIRouter(prefix="/analysis", tags=["Analysis"])

@router.post("/run", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
def create_analysis(
    payload: AnalysisCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return run_analysis(
        db,
        current_user=current_user,
        source_document_id=payload.source_document_id,
        target_document_id=payload.target_document_id
    )

@router.get("", response_model=list[AnalysisResponse])
def list_analysis_results(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_all_analysis_results(db, current_user=current_user)

@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis_result_by_id(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = get_analysis_result(db, current_user=current_user, analysis_id=analysis_id)
    if not result:
        from app.core.exceptions import AppException
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis result not found")
    return result