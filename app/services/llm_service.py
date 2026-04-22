import json
import logging

import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted
from tenacity import retry, stop_after_attempt, wait_random_exponential

from app.core.config import settings
from app.core.exceptions import AppException
from app.schemas.llm import LLMAnalysisOutput
from app.services.prompt_service import build_analysis_prompt

logger = logging.getLogger(__name__)

genai.configure(api_key=settings.GOOGLE_API_KEY)
model = genai.GenerativeModel(settings.GOOGLE_AI_MODEL)

@retry(stop=stop_after_attempt(3), wait=wait_random_exponential(multiplier=1, max=10), reraise=True)
def generate_response(source_text: str, target_text: str, semantic_similarity: float | None = None):

    prompt = build_analysis_prompt(source_text= source_text, target_text= target_text, semantic_similarity= semantic_similarity)
    
    try:
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.2,
                "response_mime_type": "application/json"
            }
        )

        content = (response.text or "").strip()

        if not content:
            raise AppException("Model returned an empty response.", status_code=500)

        # remove accidental markdown fences if model returns them
        if content.startswith("```json"):
            content = content.removeprefix("```json").removesuffix("```").strip()
        elif content.startswith("```"):
            content = content.removeprefix("```").removesuffix("```").strip()

        parsed = json.loads(content)

        # fix common model key typos
        if "improved_bullets" in parsed and "improved_bullets" not in parsed:
            parsed["improved_bullets"] = parsed.pop("improved_bullets")

        validated = LLMAnalysisOutput.model_validate(parsed)

        return {
            "fit_score": validated.fit_score,
            "summary": validated.summary,
            "strengths": validated.strengths,
            "gaps": validated.gaps,
            "suggestions": validated.suggestions,
            "improved_bullets": validated.improved_bullets,
            "cover_letter": validated.cover_letter,
            "model_name": settings.GOOGLE_AI_MODEL,
        }

    except ResourceExhausted as e:
        logger.warning("Gemini quota exceeded: %s", str(e))
        raise AppException(
            "Gemini API quota exceeded. Please wait a little and try again.",
            status_code=429,
        ) from e

    except json.JSONDecodeError as e:
        logger.exception("Invalid JSON returned by model")
        raise AppException(
            "Model returned invalid JSON output.",
            status_code=500,
        ) from e

    except AppException:
        raise

    except Exception as e:
        logger.exception("Unexpected LLM error: %s", str(e))
        raise AppException(
            f"Failed to generate analysis output: {str(e)}",
            status_code=500,
        ) from e