# Nginx Production Gateway Notes

## Purpose
Nginx acts as the public-facing reverse proxy in front of the FastAPI backend

## Responsibilities
- Accept public HTTP/HTTPS traffic
- Forward requests to FastAPI
- Hide Internal service ports
- Control upload size limits
- Prepare the system for domain and SSL configuration

## Request Flow

Client
-> Nginx on port 80/443
-> FastAPI container on port 8000
-> PostgreSQL / Redis / Celery worker

## Future HTTPS Setup

Use Certbot with Let's Encrypt:
1. Point domain DNS A record to server IP
2. Install Certbot
3. Generate SSL certificate
4. Update Nginx to listen on 443
5. Redirect HTTP to HTTPS

## Cost Note
This config is prepared for production learning and future deployment.
The project can still run locally without paid cloud hosting.