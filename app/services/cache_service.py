import logging
import json
from app.core.config import settings
from app.core.redis_client import redis_client

logger = logging.getLogger(__name__)

def get_cache(key: str):
    try:
        cached = redis_client.get(key)
        if not cached:
            return None
        return json.loads(cached)
    except Exception as e:
        logger.exception("Failed to read cache for key %s: %s", key)
        return None

def set_cache(key: str, value: dict, ttl: int | None = None):
    try:
        redis_client.set(
            key,
            json.dumps(value),
            ex=ttl or settings.REDIS_TTL_SECONDS
        )
    except Exception as e:
        logger.exception("Failed to set cache for key %s", key)

def delete_cache(key: str):
    try:
        redis_client.delete(key)
    except Exception as e:
        logger.exception("Failed to delete cache for key %s", key)