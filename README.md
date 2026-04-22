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
To run redis:
docker run --name redis-cache -p 6379:6379 -d redis

error marking plugins:
netstat -ano | findstr :8000
taskkill /PID 13888 /F
----------------------------------------------------------------
Celery is built for distributed task queues and background processing, 
Redis is a common broker/backend choice with Celery.

Client → FastAPI → Redis (cache check)
                ↓
          Celery Queue (Redis broker)
                ↓
           Celery Worker
                ↓
        LLM + Processing Logic
                ↓
          PostgreSQL (store result)
                ↓
           Redis (cache result)
                ↓
            API returns result

pgvector adds vector similarity search directly inside Postgres, 
including cosine distance and nearest-neighbor search, 
and the Python integration supports SQLAlchemy.

I added vector embeddings stored in PostgreSQL with pgvector to support semantic similarity search and retrieval-aware document comparison.

----------------------------------------------------------------------------------------------
pgvector has 2 parts, 
python package
postgresql extension

Run Postgres + pgvector together:
docker run -d \
  --name pgvector-db \
  -p 5433:5432 \
  -e POSTGRES_PASSWORD=postgres \
  ankane/pgvector
change database_url and do alembic upgrade head for update

for checking,
docker exec -it pgvector-db psql -U postgres -d postgres
and inside psql, 
SELECT version();
SELECT current_database();
CREATE EXTENSION IF NOT EXISTS vector;
\dx
[ this is all to enable pgvector in PostgreSQL]

----------------------------------------------------------------------------------------------
pgvector supports storing vectors directly in Postgres with a vector column type.

Start a pgvector-enabled PostgreSQL docker container,
docker run --name docintel-pgvector `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=doc_intelligence_db `
  -p 5432:5432 `
  -d pgvector/pgvector:pg17

enable the extension inside the container:
docker exec -it docintel-pgvector psql -U postgres -d doc_intelligence_db -c "CREATE EXTENSION IF NOT EXISTS vector;"

verify it worked:
docker exec -it docintel-pgvector psql -U postgres -d doc_intelligence_db -c "\dx"

------------------------------------------------------------------------------------------------------------

Embedding Similarity Score:
tells u how semantically close the two texts are in vector space

LLM Fit score:
how well the source aligns with the target based on reasoning, gaps, suggestions, and contextual understanding

embedding score = retrieval / semantic closeness
LLM score = reasoned evaluation

