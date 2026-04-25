from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services.chunk_retrieval_service import find_relevant_chunks_for_target_document

router = APIRouter(prefix="/chunk-retrieval", tags=["Chunk Retrieval"])

@router.get("/source-target")
def retrieve_relevant_chunks(
    source_document_id: int = Query(..., ge=1),
    target_document_id: int = Query(..., ge=1),
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return find_relevant_chunks_for_target_document(
        db,
        user_id=current_user.id,
        source_document_id=source_document_id,
        target_document_id=target_document_id,
        limit=limit
    )
