from pydantic import BaseModel, Field, conint

class LLMAnalysisOutput(BaseModel):
    fit_score: conint(ge=0, le=100)
    summary: str
    strengths: list[str] = Field(min_length=1)
    gaps: list[str] = Field(min_length=1)
    suggestions: list[str] = Field(min_length=1)
    impoved_bullets: list[str] = Field(min_length=3, max_length=5)
    cover_letter: str