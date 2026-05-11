# Realtime Service

The realtime-service handles all websocket-based systems for StreamForge Live, including chat, presence, live reactions, and room events.

## Responsibilities

- WebSocket connection management
- Live chat
- Presence tracking
- Realtime reactions
- Notifications delivery hooks

## Structure

- `src/app.ts` — Fastify setup with websocket plugin
- `src/server.ts` — Service bootstrap
- `src/websocket/` — Socket handlers and adapters
- `src/modules/` — Domain modules for chat and presence
- `src/services/` — Realtime business services
- `src/adapters/` — Pub/sub adapters
