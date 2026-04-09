from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.document_service import (
    upload_source_document, 
    get_source_document, 
    get_all_source_documents,
    create_target_document_service,
    get_all_target_documents,
    get_target_document
)
from app.schemas.document import (
    SourceDocumentResponse,
    TargetDocumentCreate,
    TargetDocumentResponse
)

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload-source", response_model=SourceDocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_source(
    file: UploadFile = File(...),
    document_category: str = Form("resume"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return upload_source_document(
            db,
            current_user=current_user,
            file=file,
            document_category=document_category
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/source", response_model=list[SourceDocumentResponse])
def list_source_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_all_source_documents(db, current_user=current_user)

@router.get("/source/{document_id}", response_model=SourceDocumentResponse)
def get_source_document_by_id(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = get_source_document(db, current_user=current_user, document_id=document_id)
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return document

@router.post("/create-target", response_model=TargetDocumentResponse, status_code=status.HTTP_201_CREATED)
def create_target_document(
    payload: TargetDocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return create_target_document_service(
            db,
            current_user=current_user,
            title=payload.title,
            target_category=payload.target_category,
            raw_text=payload.raw_text
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/target", response_model=list[TargetDocumentResponse])
def list_target_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_all_target_documents(db, current_user=current_user)

@router.get("/target/{document_id}", response_model=TargetDocumentResponse)
def get_target_document_by_id(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = get_target_document(db, current_user=current_user, document_id=document_id)
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return document