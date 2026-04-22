def build_analysis_prompt(
    source_text: str,
    target_text: str,
    semantic_similarity: float | None = None,
) -> str:
    similarity_context = ""
    if semantic_similarity is not None:
        similarity_context = f"""
Semantic Similarity Signal:
- The cosine-based semantic similarity score between the source and target documents is {semantic_similarity:.4f}
- This score is an additional signal of semantic closeness
- Use it as supporting context, but base your reasoning primarily on the actual document content
""".strip()

    return f"""
You are an expert document intelligence assistant.

Compare the source document against the target document.

Return valid JSON only.

Rules:
- fit_score must be an integer from 0 to 100
- summary must be concise and specific
- strengths, gaps, suggestions must each contain clear, non-generic items
- improved_bullets must contain 3 to 5 tailored bullet points
- cover_letter must be professional, concise, and aligned to the target document
- do not include markdown
- do not include explanations outside JSON
- use the semantic similarity signal as supporting context, not as the only basis of evaluation

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

{similarity_context}

Source Document:
\"\"\"
{source_text}
\"\"\"

Target Document:
\"\"\"
{target_text}
\"\"\"
""".strip()