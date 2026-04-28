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

==============================================================
What the flow is now

Your current retrieval flow is:

upload source document
source document cleaned
source document embedded
source document chunked
source chunks embedded
create target document
target embedded
target embedding used to search source chunk embeddings
top relevant source chunks returned
those chunks are passed to LLM analysis

That is correct.

Instead of sending the full source document every time, retrieve the most relevant chunks and send those to the LLM.

--------------------------------------------------
Alembic autogenerate + custom type problem-------error------
pgvector defined while doing alembic upgrade head

Right after:
alembic revision --autogenerate -m "..."
open the file before running upgrade head.
Check for:
missing imports

from pgvector.sqlalchemy import Vector
sa.Column("embedding", Vector(dim=1536), nullable=False)

-----------------------------------------------------------
👉 alembic revision --autogenerate = CREATE the blueprint
👉 alembic upgrade head = APPLY the blueprint

1. alembic revision --autogenerate -m "message"
What it does

👉 Generates a migration file based on your models
It compares:
SQLAlchemy models  vs  current database schema

2. alembic upgrade head
What it does

👉 Applies migrations to the database
Runs all pending migration files
Updates DB schema

-------------------------------------------------------------------
If something break,
Check in this order:

auth working?
source upload working?
target creation working?
source embedding created?
target embedding created?
source chunks created?
source chunk embeddings created?
similarity endpoint working?
chunk retrieval endpoint returning chunks?
analysis using chunks?

test till phase 4 retrieval target query :
Upload source → extract text → auto embed whole doc + chunks → create target → auto embed target → retrieve top-k chunks → compute semantic similarity → run LLM analysis → cache/store result

---------------------------------------------------------------------------------------
Dockerization:

1. env.docker
2. .dockerignore
3. Dockerfile
4. docker-compose.yml(writing all scripts for all service we r using)
commands---
code changes only                           docker compose up
To run:                                     docker compose up --build   (rebuilds container and service)
To detach model:                            docker compose up --build -d
check containers:                           docker compose ps
stop and remove containers + networks       docker compose down
delete postgreSQL data + redis data         docker compose down -v
To check logs:                              docker compose logs -f api/worker/db/redis
then run:                                   localhost:8000/docs

Use migrations:
alembic revision --autogenerate -m "add something"
alembic upgrade head

Database schema change:
docker compose exec api alembic revision --autogenerate -m "add something"
docker compose exec api alembic upgrade head

read upload bytes → save temp local file → extract text → upload original PDF to S3 → delete temp file
do not extract directly from s3 yet, keep it simple
===========================================================================

EC2 → runs Docker Compose
RDS PostgreSQL → database
S3 → uploaded PDFs
Redis → Docker container first, ElastiCache later

AWS recommends RDS DB instances run inside a VPC, and their getting-started PostgreSQL guide uses EC2 + private RDS in the same VPC. S3 buckets should keep Block Public Access enabled for private files.