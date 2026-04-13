import json
import logging

import google.generativeai as genai
from tenacity import retry, stop_after_attempt, wait_random_exponential

from app.core.config import settings
from app.core.exceptions import AppException
from app.schemas.llm import LLMAnalysisOutput
from app.services.prompt_service import build_analysis_prompt

logger = logging.getLogger(__name__)

genai.configure(api_key=settings.GOOGLE_API_KEY)
model = genai.GenerativeModel(settings.GOOGLE_AI_MODEL)

@retry(stop=stop_after_attempt(3), wait=wait_random_exponential(multiplier=1, max=10))
def generate_response(source_text: str, target_text: str):

    prompt = build_analysis_prompt(source_text= source_text, target_text= target_text)
    
    try:
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.2,
                "response_mime_type": "application/json"
            }
        )

        content = response.text.strip()
        data = json.loads(content)
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

    except json.JSONDecodeError as e:
        logger.execution("Failed to parse Gemini response as JSON")
        raise AppException("Failed to parse analysis output from Gemini", status_code=500) from e

    except Exception as e:
        logger.exception("Gemini analysis failed")
        raise AppException("Failed to generate analysis output", status_code=500) from e