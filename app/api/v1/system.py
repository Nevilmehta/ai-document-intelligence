from fastapi import APIRouter
from app.core.redis_client import redis_client

router = APIRouter(prefix="/system", tags=["system"])

@router.get("/redis-health")
def redis_health():
    try:
        pong = redis_client.ping()
        return {"status": "ok", "redis": pong}
    except Exception as e:
        return {"status": "error", "redis": False}