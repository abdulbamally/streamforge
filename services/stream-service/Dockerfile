# ============================================================
#  StreamForge Stream Service — Dockerfile
#  Multi-stage build: deps → builder → runner
#  Includes FFmpeg for RTMP relay and recording
# ============================================================

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache python3 make g++
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services/stream-service/package.json ./services/stream-service/
COPY services/shared/package.json          ./services/shared/

RUN pnpm install --frozen-lockfile --ignore-scripts

# Stage 2: Build
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

COPY --from=deps /app/node_modules                          ./node_modules
COPY --from=deps /app/services/stream-service/node_modules  ./services/stream-service/node_modules
COPY --from=deps /app/services/shared/node_modules          ./services/shared/node_modules
COPY . .

# Generate Prisma client
RUN cd services/stream-service && pnpm exec prisma generate

# Build shared first, then stream service
RUN cd services/shared        && pnpm build
RUN cd services/stream-service && pnpm build

# Stage 3: Production runner
# Use full node image (not alpine) so FFmpeg binary installs cleanly
FROM node:20-slim AS runner

# Install FFmpeg + dumb-init
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    dumb-init \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV FFPROBE_PATH=/usr/bin/ffprobe

# Create non-root user
RUN groupadd --system --gid 1001 nodejs \
 && useradd  --system --uid 1001 --gid nodejs fastify

# Create recording temp directory
RUN mkdir -p /tmp/recordings /tmp/media /tmp/sf_media \
 && chown -R fastify:nodejs /tmp/recordings /tmp/media /tmp/sf_media

COPY --from=builder --chown=fastify:nodejs /app/services/stream-service/dist        ./dist
COPY --from=builder --chown=fastify:nodejs /app/services/stream-service/node_modules ./node_modules
COPY --from=builder --chown=fastify:nodejs /app/services/stream-service/prisma       ./prisma
COPY --from=builder --chown=fastify:nodejs /app/node_modules/.prisma                 ./node_modules/.prisma

USER fastify

# HTTP API port
EXPOSE 3002
# RTMP ingest port
EXPOSE 1935
# HLS/HTTP-FLV port
EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3002/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
