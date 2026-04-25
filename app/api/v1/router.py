from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.documents import router as documents_router
from app.api.v1.analysis import router as analysis_router
from app.api.v1.system import router as system_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.retrieval import router as retrieval_router
from app.api.v1.chunk_retrieval import router as chunk_retrieval_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["Health"])
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(documents_router)
api_router.include_router(analysis_router)
api_router.include_router(system_router)
api_router.include_router(jobs_router)
api_router.include_router(retrieval_router)
api_router.include_router(chunk_retrieval_router)