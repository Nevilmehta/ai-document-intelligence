def build_analysis_prompt(source_text: str, target_text: str) -> str:
    return f"""
You are an expert document intelligence assistant.

Your task is to compare a SOURCE document with a TARGET document.

⚠️ CRITICAL RULES:
- Return ONLY valid JSON
- Do NOT include markdown
- Do NOT include any explanation or text outside JSON
- If unsure, still return valid JSON with best guess
- fit_score must be an integer from 0 to 100
- All lists must contain only strings
- Do not return null values

JSON FORMAT (STRICT):
{{
  "fit_score": 0,
  "summary": "string",
  "strengths": ["string"],
  "gaps": ["string"],
  "suggestions": ["string"],
  "improved_bullets": ["string"],
  "cover_letter": "string"
}}

CONTENT RULES:
- strengths: what matches well with TARGET
- gaps: what is missing compared to TARGET
- suggestions: actionable improvements
- improved_bullets: 3–5 strong resume bullet points tailored to TARGET
- cover_letter: short, professional, personalized

SOURCE DOCUMENT:
\"\"\"
{source_text}
\"\"\"

TARGET DOCUMENT:
\"\"\"
{target_text}
\"\"\"

RETURN JSON ONLY.
""".strip()