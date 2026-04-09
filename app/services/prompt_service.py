def build_analysis_prompt(source_text: str, target_text: str) -> str:
    return f"""
You are an expert document intelligence assistant.

Your task is to compare a source document with a target document and return a strict JSON response.

Rules:
- Return valid JSON only
- Do not include markdown
- Do not include extra explanation outside JSON
- fit_score must be an integer from 0 to 100
- strengths, gaps, suggestions, improved_bullets must each be arrays of strings
- improved_bullets should contain 3 to 5 tailored bullet points
- cover_letter should be professional, concise, and tailored to the target document

Expected JSON format:
{{
  "fit_score": 0,
  "summary": "string",
  "strengths": ["string"],
  "gaps": ["string"],
  "suggestions": ["string"],
  "improved_bullets": ["string"],
  "cover_letter": "string"
}}

Source Document:
\"\"\"
{source_text}
\"\"\"

Target Document:
\"\"\"
{target_text}
\"\"\"
""".strip()