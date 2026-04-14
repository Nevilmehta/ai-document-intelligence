def build_analysis_cache_key(
    *,
    user_id: int,
    source_document_id: int,
    target_document_id: int,
    model_name: str
):
    return f"analysis: {user_id}:{source_document_id}:{target_document_id}:{model_name}"

# this key is deterministic and easy to reason about