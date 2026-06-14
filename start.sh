#!/bin/bash

# Start the required infrastructure (Postgres, Redis, Minio)
echo "Starting infrastructure services..."
docker compose up -d

# Start the application in development mode
# This uses 'turbo run dev', which automatically watches for codebase changes
# and restarts the Next.js frontend and NestJS backend automatically.
echo "Starting application..."
pnpm dev
