# ============================================================
#  StreamForge Media Service — Dockerfile
#  Multi-stage: deps → builder → runner
#  Includes FFmpeg for transcoding, color grading, export
# ============================================================

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache python3 make g++
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services/media-service/package.json ./services/media-service/
COPY services/shared/package.json        ./services/shared/

RUN pnpm install --frozen-lockfile --ignore-scripts

# Stage 2: Build
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

COPY --from=deps /app/node_modules                        ./node_modules
COPY --from=deps /app/services/media-service/node_modules  ./services/media-service/node_modules
COPY --from=deps /app/services/shared/node_modules         ./services/shared/node_modules
COPY . .

RUN cd services/media-service && pnpm exec prisma generate
RUN cd services/shared        && pnpm build
RUN cd services/media-service  && pnpm build

# Stage 3: Production runner
# Use slim (not alpine) for reliable FFmpeg installation
FROM node:20-slim AS runner

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    dumb-init \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV FFPROBE_PATH=/usr/bin/ffprobe

# Non-root user
RUN groupadd --system --gid 1001 nodejs \
 && useradd  --system --uid 1001 --gid nodejs fastify

# Temp directories for FFmpeg processing
RUN mkdir -p /tmp/sf_media \
 && chown -R fastify:nodejs /tmp/sf_media

COPY --from=builder --chown=fastify:nodejs /app/services/media-service/dist        ./dist
COPY --from=builder --chown=fastify:nodejs /app/services/media-service/node_modules ./node_modules
COPY --from=builder --chown=fastify:nodejs /app/services/media-service/prisma       ./prisma
COPY --from=builder --chown=fastify:nodejs /app/node_modules/.prisma                ./node_modules/.prisma

USER fastify

EXPOSE 3003

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3003/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
