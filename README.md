AI Document Intelligence
----------------------------------

uvicorn app.main:app --reload

create first migration:
alembic revision --autogenerate -m "create users table"

Then apply:
alembic upgrade head

---------------------------
SourceDocument
TargetDocument
AnalysisResult

PostgreSQL JSONB Columns - next things