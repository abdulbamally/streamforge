# social-service — build from monorepo root (docker-compose context: backend/streamforge)
FROM node:20-bookworm-slim
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages

RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm -C packages/auth-service exec prisma generate
RUN pnpm -C packages/social-service run build

ENV NODE_ENV=production
EXPOSE 3005
CMD ["node", "packages/social-service/dist/server.js"]
