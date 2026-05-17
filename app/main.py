import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import AppException
from app.core.logging import setup_logging
from app.middleware.request_logging import RequestLoggingMiddleware

from prometheus_fastapi_instrumentator import Instrumentator

from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

from app.core.rate_limiter import limiter
from app.core.rate_limit_handler import custom_rate_limit_handler

from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.middleware.security_headers import SecurityHeadersMiddleware

setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

app.state.limiter = limiter

app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(RequestLoggingMiddleware)

app.add_middleware(SlowAPIMiddleware)

app.add_exception_handler(
    RateLimitExceeded,
    custom_rate_limit_handler
)

Instrumentator().instrument(app).expose(app, endpoint="/metrics")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=[
        "localhost",
        "127.0.0.1",
        "*.localhost",
        "api",
        "api:8000"
    ],
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