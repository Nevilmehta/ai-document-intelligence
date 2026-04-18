from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.embedding import DocumentEmbeddingResponse, SimilarDocumentResponse
from app.services.embedding_service import generate_embedding
from app.services.retrieval_service import (
    create_embedding_for_source_document,
    create_embedding_for_target_document,
    find_similar_source_documents
)

router = APIRouter(prefix="/retrieval", tags=["Retrieval"])

@router.post("/embed/source/{source_document_id}", response_model=DocumentEmbeddingResponse)
def embed_source_document(
    source_document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_embedding_for_source_document(
        db,
        user_id=current_user.id,
        source_document_id=source_document_id
    )

@router.post("/embed/target/{target_document_id}", response_model=DocumentEmbeddingResponse)
def embed_target_document(
    target_document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_embedding_for_target_document(
        db,
        user_id=current_user.id,
        target_document_id=target_document_id
    )

@router.post("/similar/source", response_model=list[SimilarDocumentResponse])
def similar_source_documents(
    text: str = Query(..., min_length=1),
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query_embedding = generate_embedding(text)
    return find_similar_source_documents(
        db,
        user_id=current_user.id,
        query_embeddings=query_embedding,
        limit=limit
    )