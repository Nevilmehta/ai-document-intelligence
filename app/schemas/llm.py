from pydantic import BaseModel, Field, field_validator


class LLMAnalysisOutput(BaseModel):
    fit_score: int = Field(ge=0, le=100)
    summary: str
    strengths: list[str] = Field(min_length=1)
    gaps: list[str] = Field(min_length=1)
    suggestions: list[str] = Field(min_length=1)
    improved_bullets: list[str] = Field(
        min_length=3,
        max_length=5,
        validation_alias="improved_bullets",
    )
    cover_letter: str

    @field_validator("fit_score", mode="before")
    @classmethod
    def normalize_fit_score(cls, value):
        if isinstance(value, float):
            # Gemini returned 0.8, convert to 80
            if 0 <= value <= 1:
                return round(value * 100)
            return round(value)

        if isinstance(value, str):
            value = value.strip().replace("%", "")
            try:
                num = float(value)
                if 0 <= num <= 1:
                    return round(num * 100)
                return round(num)
            except ValueError:
                pass

        return value