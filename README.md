# AI Document Intelligence & Personalization Engine

## Overview

AI Document Intelligence & Personalization Engine is a production-style AI backend system designed for intelligent document ingestion, semantic retrieval, asynchronous analysis, and personalized content generation.

The system processes uploaded PDF documents, generates vector embeddings, performs chunk-based semantic retrieval, and uses retrieval-aware LLM prompting to generate contextual analysis, suggestions, and personalized outputs.

Although inspired by resume/job matching workflows, the platform was intentionally designed as a broader AI document intelligence system capable of handling multiple document analysis and personalization use cases.

---

# Key Features

## Document Ingestion

* PDF upload pipeline
* Secure upload validation
* PDF text extraction and cleaning
* Chunk-based document processing
* Automatic embedding generation

## AI / Retrieval Features

* Semantic similarity scoring
* Retrieval-Augmented Generation (RAG)
* Chunk-level vector retrieval
* Embedding-based contextual analysis
* Retrieval-aware prompting
* Personalized content generation

## Asynchronous Processing

* Background embedding generation
* Celery-powered async workflows
* Redis-backed task queue
* Async analysis jobs with polling

## Observability & Monitoring

* Prometheus metrics integration
* Grafana dashboards
* Structured JSON logging
* Request tracing
* API performance monitoring

## Security Features

* Redis-backed rate limiting
* Upload hardening
* PDF signature validation
* MIME type validation
* Security middleware and headers
* Trusted host validation
* JWT authentication

## Infrastructure & DevOps

* Dockerized backend services
* Docker Compose orchestration
* AWS-ready architecture
* S3-ready storage abstraction
* Production deployment templates
* Nginx reverse proxy configuration (for template learning)

---

# Architecture Overview

```
Frontend (React + TypeScript)
        ↓
FastAPI Backend
        ↓
Authentication Layer (JWT)
        ↓
Document Ingestion Pipeline
        ↓
PDF Extraction + Chunking
        ↓
Embedding Generation
        ↓
PostgreSQL + pgvector
        ↓
Retrieval Layer
        ↓
LLM Analysis Engine
        ↓
Async Processing (Celery + Redis)
        ↓
Monitoring / Logging / Metrics
```

---

# Tech Stack

## Backend

* Python
* FastAPI
* SQLAlchemy
* Alembic
* Pydantic

## AI / Retrieval

* Gemini API
* Vector Embeddings
* pgvector
* Semantic Retrieval
* Chunk-Based RAG

## Database

* PostgreSQL
* pgvector Extension

## Async Processing

* Celery
* Redis

## Monitoring & Observability

* Prometheus
* Grafana
* Structured JSON Logging

## Security

* JWT Authentication
* Rate Limiting
* Upload Validation
* Security Middleware

## DevOps / Infrastructure

* Docker
* Docker Compose
* Nginx
* AWS S3-ready storage
* EC2/RDS deployment templates

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* Framer Motion
* Recharts

---

# Core System Design Concepts

## Retrieval-Augmented Generation (RAG)

Instead of sending entire documents directly to the LLM, the system:

1. Chunks uploaded documents
2. Generates embeddings for each chunk
3. Retrieves semantically relevant chunks
4. Uses only relevant context during analysis

This improves:

* contextual relevance
* scalability
* token efficiency
* analysis quality

---

## Chunk-Based Semantic Retrieval

The retrieval layer uses vector similarity search to identify the most relevant document chunks for a given target document.

This enables:

* semantic search
* contextual retrieval
* retrieval-aware prompting
* similarity analysis

---

## Asynchronous Architecture

Heavy AI operations are processed asynchronously using Celery workers.

Examples:

* embedding generation
* document chunk processing
* analysis execution

This prevents API blocking and improves responsiveness.

---

## Monitoring & Observability

The system exposes Prometheus metrics through a `/metrics` endpoint and visualizes:

* API request throughput
* request latency
* endpoint usage
* error rates
* active requests

Grafana dashboards provide runtime visibility into backend behavior.

---

## Security Design

The backend includes:

* JWT authentication
* Redis-backed rate limiting
* upload validation
* security middleware
* CSP headers
* trusted host validation
* request tracing

This helps protect:

* expensive AI endpoints
* upload pipelines
* async workflows
* authentication routes

---

# Demo Mode Architecture

The frontend supports a recruiter-friendly public demo experience.

Guest users can explore the system UI without signup friction.

Internally:

* demo actions authenticate using a seeded demo account
* backend JWT architecture remains intact
* protected routes remain protected
* async workflows still require authentication

This preserves production-style backend design while improving portfolio usability.

---

# Local Development Setup

## Clone Repository

```bash
git clone <repo-url>
cd ai-document-intelligence
```

## Create Environment

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Run Docker Services

```bash
docker compose up --build
```

## Apply Migrations

```bash
alembic upgrade head
```

## Run FastAPI

```bash
uvicorn app.main:app --reload
```

## Run Celery Worker

```bash
celery -A app.workers.tasks worker --loglevel=info --pool=solo
```

---

# Monitoring Services

## Prometheus

```text
http://localhost:9090
```

## Grafana

```text
http://localhost:3001
```

---

# API Features

## Authentication

* Signup
* Login
* JWT-based auth
* Protected routes

## Documents

* Upload source document
* Create target document
* Chunk generation
* Embedding generation

## Analysis

* Semantic similarity scoring
* Retrieval-aware analysis
* Async analysis jobs
* Analysis history

## Retrieval

* Chunk retrieval
* Similarity endpoints
* Vector search

---

# Future Improvements

Potential future upgrades:

* Multi-model support
* Streaming responses
* OCR ingestion
* Direct S3 uploads
* Elasticsearch hybrid retrieval
* Kubernetes deployment
* Distributed workers
* Multi-tenant architecture
* Real-time analytics
* SaaS billing system

---

# Portfolio Highlights

This project demonstrates:

* Backend engineering
* AI systems design
* Retrieval-Augmented Generation
* Vector databases
* Asynchronous architectures
* Monitoring and observability
* Security hardening
* DevOps and containerization
* Production-style system design

---
