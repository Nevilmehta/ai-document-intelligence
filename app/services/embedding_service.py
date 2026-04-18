import logging
from google import genai

from tenacity import retry, stop_after_attempt, wait_random_exponential
from app.core.config import settings
from app.core.exceptions import AppException

logger = logging.getLogger(__name__)

client = genai.Client(api_key=settings.GOOGLE_API_KEY)

@retry(stop=stop_after_attempt(5), wait=wait_random_exponential(multiplier=1, max=20))
def generate_embedding(text: str) -> list[float]:
    cleaned = text.strip()
    if not cleaned:
        raise AppException("Cannot generate embedding for empty text", status_code=400)

    # temporary safety cap for long documents
    cleaned = cleaned[:12000]

    try:
        response = client.models.embed_content(
            model=settings.GOOGLE_EMBEDDING_MODEL,
            contents=cleaned,
        )

        # SDK/docs examples expose embeddings on the response
        if not response.embeddings:
            raise AppException("Embedding response was empty", status_code=500)

        first = response.embeddings[0]

        # values is the vector field in current SDK responses
        if not first.values:
            raise AppException("Embedding vector was empty", status_code=500)

        return list(first.values)

    except AppException:
        raise
    except Exception as e:
        logger.exception("Embedding generation failed: %s", e)
        raise AppException(f"Failed to generate embedding: {e}", status_code=500) from e