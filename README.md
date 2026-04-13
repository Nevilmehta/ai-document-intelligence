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

----------------------------------------
Test cases
Logging
Exception handling globally

----------------------------------------
Redis for caching (to cache repeated analysis results)

Redis TTL (Time to live) mechanism that sets expiration time

--------------------------------------------------------------
If u have docker installed then, 

docker run --name redis-cache -p 6379:6379 -d redis