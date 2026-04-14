import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import AppException
from app.core.logging import setup_logging

setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    logger.warning("App exception on %s: %s", request.url.path, exc.message)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception on %s", request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"}
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    logger.info("Root endpoint accessed")
    return {
        "message": f"Welcome to {settings.APP_NAME}"
    }