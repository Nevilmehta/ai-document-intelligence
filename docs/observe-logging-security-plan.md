# Phase 4 — Observability, Logging & Security Summary

## Overview

Phase 4 focused on transforming the backend from a functional AI/RAG API into a more production-oriented backend system.

This phase introduced:

* Monitoring and observability
* Structured logging
* Request tracing
* Rate limiting
* Upload security hardening
* HTTP security middleware

The purpose of this phase was not to build a fully enterprise-grade infrastructure platform, but to understand and implement core backend engineering concepts commonly used in real production systems.

---

# Phase 4A — Monitoring & Observability

## Goal

Gain visibility into runtime system behavior.

Instead of only relying on:

* console output
* manual debugging
* "the app feels slow"

we added metrics collection and visualization.

---

## Stack

### Prometheus

Used for:

* collecting metrics
* scraping `/metrics`
* storing time-series data

Prometheus periodically queries the FastAPI application and stores runtime metrics.

---

### Grafana

Used for:

* visualizing metrics
* dashboards
* observing request behavior
* latency monitoring

Grafana connects to Prometheus as a datasource.

---

## FastAPI Metrics Integration

Package used:

```txt
prometheus-fastapi-instrumentator
```

Added metrics endpoint:

```txt
/metrics
```

---

## Metrics Observed

### Request Rate

```promql
rate(http_requests_total[1m])
```

Purpose:

* traffic volume
* endpoint activity
* throughput observation

---

### API Latency (95th Percentile)

```promql
histogram_quantile(
  0.95,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
)
```

Purpose:

* request duration monitoring
* performance analysis
* bottleneck detection

---

### Error Rate

```promql
rate(http_requests_total{status=~"5.."}[5m])
```

Purpose:

* detecting API failures
* identifying instability

---

### Requests by Endpoint

```promql
sum(rate(http_requests_total[5m])) by (handler)
```

Purpose:

* endpoint popularity
* traffic distribution

---

## Dockerized Monitoring Stack

Added services:

* Prometheus
* Grafana

Ports:

```txt
Prometheus → 9090
Grafana → 3001
```

---

## Key Learnings

Monitoring is not just "graphs".

It provides:

* runtime visibility
* performance observation
* operational debugging
* latency tracking
* usage analysis

---

# Phase 4B — Structured Logging & Request Tracing

## Goal

Improve debugging and observability using structured logs.

---

## Stack

### python-json-logger

Used for:

* structured JSON logs
* machine-readable logs
* searchable logging format

---

## Structured Logging

Instead of plain logs:

```txt
User logged in
```

the system now generates structured logs:

```json
{
  "level": "INFO",
  "request_id": "abc123",
  "path": "/api/v1/analysis/run",
  "message": "Request completed"
}
```

---

## Request Logging Middleware

Implemented middleware to:

* generate request IDs
* measure request duration
* log request completion
* log failures

Middleware responsibilities:

* request tracing
* latency observation
* debugging support

---

## Rotating Log Files

Added:

```txt
logs/app.log
logs/error.log
```

Purpose:

* persistent logs
* easier debugging
* production-style logging behavior

---

## Celery Logging

Added logging for:

* task start
* task success
* task failure
* task IDs

Purpose:

* async workflow debugging
* background task visibility

---

## Key Learnings

Monitoring answers:

```txt
Something is wrong
```

Logging answers:

```txt
What exactly went wrong?
```

Both are used together in production systems.

---

# Phase 4C — Security & API Hardening

## Goal

Protect the backend from:

* abuse
* excessive requests
* unsafe uploads
* browser-side attacks
* insecure HTTP behavior

---

# Phase 4C.1 — Rate Limiting

## Stack

### slowapi

Used for:

* FastAPI rate limiting
* endpoint throttling
* abuse prevention

---

## Implemented Limits

### Authentication

```txt
Signup → 5/minute
Login → 10/minute
```

Purpose:

* brute force protection
* abuse reduction

---

### Upload Endpoints

```txt
10 uploads/minute
```

Purpose:

* upload spam prevention
* resource protection

---

### Analysis Endpoints

```txt
5 analysis requests/minute
```

Purpose:

* protect expensive LLM operations
* worker protection
* cost protection

---

## Custom Rate Limit Responses

Added custom JSON responses for:

```txt
HTTP 429 Too Many Requests
```

---

## Security Logging

Rate limit violations are logged using structured logs.

---

# Phase 4C.2 — Secure Upload Validation

## Goal

Harden the document ingestion pipeline.

---

## Upload Security Features

### MIME Type Validation

Only allowed:

```txt
application/pdf
```

Purpose:

* block obvious invalid uploads

---

### PDF Signature Validation

Validated file signature:

```txt
%PDF
```

Purpose:

* detect fake PDF files
* prevent renamed executable uploads

---

### Filename Sanitization

Purpose:

* prevent path traversal
* remove unsafe characters
* safer file handling

---

### Upload Size Enforcement

Purpose:

* prevent oversized uploads
* reduce abuse risk
* protect memory/resources

---

## Key Learnings

File extensions alone are not secure.

Real systems validate:

* MIME types
* file signatures
* upload size
* sanitized filenames

---

# Phase 4C.3 — HTTP Security Middleware

## Goal

Improve browser and HTTP-level security.

---

## Security Headers Added

### X-Content-Type-Options

```txt
nosniff
```

Purpose:

* prevent MIME sniffing

---

### X-Frame-Options

```txt
DENY
```

Purpose:

* clickjacking protection

---

### Content-Security-Policy (CSP)

Purpose:

* reduce XSS risks
* restrict resource loading

---

### Referrer-Policy

Purpose:

* control referrer leakage

---

### Permissions-Policy

Purpose:

* restrict browser capabilities

---

## Trusted Host Middleware

Purpose:

* prevent host header attacks

---

## Secure CORS Configuration

Restricted allowed origins.

Purpose:

* reduce unsafe cross-origin access

---

## Proxy-Aware Middleware

Added support for:

* reverse proxies
* Nginx
* Cloudflare
* forwarded headers

---

# Final Outcome of Phase 4

After Phase 4, the project evolved from a standard AI backend into a much more production-oriented backend system.

The system now includes:

## Observability

* Prometheus
* Grafana
* metrics dashboards
* latency monitoring

---

## Logging

* structured JSON logs
* request tracing
* rotating log files
* Celery task logging

---

## Security

* rate limiting
* upload validation
* HTTP security headers
* trusted hosts
* hardened CORS

---

## Infrastructure

* Dockerized services
* Redis caching
* Celery workers
* PostgreSQL + pgvector

---

# Important Reflection

Phase 4 introduced many concepts that are normally handled by separate backend, DevOps, observability, or security teams in real companies.

The goal was not to perfectly replicate enterprise infrastructure, but to:

* understand the concepts
* implement practical versions
* demonstrate engineering understanding
* gain production-oriented backend experience

This phase established a strong backend engineering foundation without requiring full-scale enterprise deployment.

