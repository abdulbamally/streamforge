#!/bin/bash

set -e

export ENVIRONMENT=prod

COMPOSE_FILES="-f docker/docker-compose.base.yml -f docker/docker-compose.prod.yml"

echo "Pulling latest containers..."
docker compose $COMPOSE_FILES pull

echo "Starting containers..."
docker compose $COMPOSE_FILES up -d --build

echo "Deployment completed."
