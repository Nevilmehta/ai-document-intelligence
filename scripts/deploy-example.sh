#!/bin/bash

# Pull latest code
git pull origin main

# Build and run production compose
docker compose -f docker-compose.prod.example.yml --env-file .env.production up --build -d

# Run migrations
docker compose -f docker-compose.prod.example.yml exec api alembic upgrade head

# Show logs
docker compose -f docker-compose.prod.example.yml logs -f api