import json
import google.generativeai as genai
from app.core.config import settings

genai.configure(api_key=settings.GOOGLE_API_KEY)
model = genai.GenerativeModel(settings.GOOGLE_AI_MODEL)

def generate_response(source_text: str, target_text: str, prompt: str):
    full_prompt = f"""
    {prompt}

    SOURCE TEXT:
    {source_text}

    TARGET TEXT:
    {target_text}

    IMPORTANT:
    Return ONLY valid JSON.
    """

    response = model.generate_content(
        full_prompt,
        generation_config={
            "temperature": 0.2
        }
    )

    content = response.text

    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        raise ValueError("Failed to parse response as JSON. Response content: " + content)

    return{
        "fit_score": int(data.get("fit_score", 0)),
        "summary": data.get("summary", ""),
        "strengths": data.get("strengths", []),
        "gaps": data.get("gaps", []),
        "suggestions": data.get("suggestions", []),
        "improved_bullets": data.get("improved_bullets", []),
        "cover_letter": data.get("cover_letter", ""),
        "model_name": settings.GOOGLE_AI_MODEL
    }