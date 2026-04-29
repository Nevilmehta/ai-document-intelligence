# AWS Deployment plan - AI Document Intelligence Engine

## Goal 
Design a production-ready AWS deployment without running paid infrastructure continuously.

## Target Architecture

Client
-> EC2 instance running docker compose
-> FastAPI API Container
-> Celery worker Container
-> Redis Container or ElasticCache later
-> RDS PostgreSQL with pgvector
-> S3 for uploaded PDF storage

## AWS Services

### EC2
Runs Docker Compose for:
- FastAPI API
- Celery worker
- Redis

Security Group:
- 22 only from my IP
- 80/443 for web traffic
- 8000 only for temporary testing

### RDS PostgreSQL
Used as production database
Should be private inside the same VPC as EC2.
Only EC2 security group should access port 5432.

### S3
Stores uploaded PDF documents.
Block Public Access should stay ON.
Files are accessed through backend-generated presigned URLs.

### Redis
Development/simple deployment:
- Redis container in Docker Compose

Production upgrade:
- AWS ElastiCache Redis

## Deployment Steps
1. Create S3 bucket
2. Keep Block Public Access ON
3. Create RDS PostgreSQL database
4. Create EC2 Ubuntu instance
5. Install Docker and Docker Compose
6. Clone project repository
7. Create `.env.production`
8. Run Docker Compose
9. Run Alembic migrations
10. Test API health, auth, upload, analysis, worker jobs

