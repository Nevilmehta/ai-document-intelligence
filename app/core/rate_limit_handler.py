import logging
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

async def custom_rate_limit_handler(request, exc: RateLimitExceeded):

    logger = logging.getLogger("security")

    logger.warning(
        "Rate Limit exceeded",
        extra={
            "request_id": getattr(request.state, "request_id", "-"),
            "path": request.url.path,
            "client": request.client.host if request.client else "unknown"
        }
    )

    return JSONResponse(
        status_code=429,
        content={
            "success": False,
            "error": "Rate Limit exceeded",
            "detail": str(exc.detail)
        }
    )