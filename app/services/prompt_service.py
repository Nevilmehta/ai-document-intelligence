def build_analysis_prompt(source_text: str, target_text: str) -> str:
    return f"""
You are an expert document intelligence assistant.

Compare the source document against the target document.

Return valid JSON only.

Rules:
- fit_score must be an integer from 0 to 100
- do NOT return decimals like 0.8 or 0.75
- improved_bullets must be spelled exactly as: improved_bullets
- improved_bullets must contain 3 to 5 bullet points
- strengths, gaps, suggestions must each be arrays of strings
- cover_letter must be professional and concise
- do not include markdown
- do not include explanations outside JSON

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