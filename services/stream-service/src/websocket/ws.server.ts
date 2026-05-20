// ============================================================
//  WebSocket Server — Real-time stream control & stats relay
//
//  Client connects: ws://host/ws?token=<jwt>
//  Messages:
//    Client → Server: SCENE_SWITCH, SOURCE_UPDATE, PING
//    Server → Client: STREAM_STATE, STREAM_STATS, DESTINATION_STATUS, VIEWER_COUNT, PONG
// ============================================================

import type { FastifyInstance } from 'fastify'
import type { WebSocket } from 'ws'
import { streamRedis, redisSub } from '../utils/redis'
import { SceneService } from '../services/scene.service'
import { StatsService } from '../services/stats.service'
import { logger } from '../utils/logger'
import type { WsMessage, WsMessageType } from '../types'

// Track connections: streamId → Set<WebSocket>
const connections = new Map<string, Set<WebSocket>>()

const sceneService = new SceneService()
const statsService = new StatsService()

export function registerWebSocket(app: FastifyInstance): void {

  app.get('/ws', { websocket: true }, async (socket: WebSocket, request) => {
    // ── Auth: validate JWT from query param ─────────────────
    const token    = (request.query as any).token as string | undefined
    const streamId = (request.query as any).streamId as string | undefined

    if (!token || !streamId) {
      sendMessage(socket, 'ERROR', { message: 'Missing token or streamId' })
      socket.close(1008, 'Missing auth')
      return
    }

    let userId: string
    try {
      const payload = app.jwt.verify(token) as { sub: string }
      userId = payload.sub
    } catch {
      sendMessage(socket, 'ERROR', { message: 'Invalid token' })
      socket.close(1008, 'Auth failed')
      return
    }

    logger.debug({ userId, streamId }, 'WebSocket client connected')

    // ── Register connection ──────────────────────────────────
    if (!connections.has(streamId)) {
      connections.set(streamId, new Set())
      // Subscribe to Redis stats channel for this stream
      subscribeToStreamStats(streamId)
    }
    connections.get(streamId)!.add(socket)

    // Send current stream state immediately on connect
    const state = await streamRedis.getLiveState(streamId)
    if (state) {
      sendMessage(socket, 'STREAM_STATE', state)
    }

    // Start stats tracking if stream is live
    if (state?.status === 'LIVE') {
      statsService.startTracking(streamId)
    }

    // ── Message handler ──────────────────────────────────────
    socket.on('message', async (raw: Buffer) => {
      let msg: WsMessage
      try {
        msg = JSON.parse(raw.toString())
      } catch {
        sendMessage(socket, 'ERROR', { message: 'Invalid JSON' })
        return
      }

      await handleClientMessage(socket, userId, streamId, msg)
    })

    // ── Disconnect ───────────────────────────────────────────
    socket.on('close', async () => {
      logger.debug({ userId, streamId }, 'WebSocket client disconnected')
      connections.get(streamId)?.delete(socket)

      if (connections.get(streamId)?.size === 0) {
        connections.delete(streamId)
        statsService.stopTracking(streamId)
        await redisSub.unsubscribe(`stream:stats:${streamId}`)
      }
    })

    socket.on('error', (err) => {
      logger.error({ err, userId, streamId }, 'WebSocket error')
    })
  })
}

// ─── Handle incoming client messages ──────────────────────────
async function handleClientMessage(
  socket:   WebSocket,
  userId:   string,
  streamId: string,
  msg:      WsMessage
): Promise<void> {
  switch (msg.type) {
    case 'PING':
      sendMessage(socket, 'PONG', { ts: Date.now() })
      break

    case 'SCENE_SWITCH': {
      const { sceneId } = msg.payload as { sceneId: string }
      try {
        await sceneService.switchActiveScene(streamId, userId, sceneId)
        // Broadcast new scene to all clients watching this stream
        broadcastToStream(streamId, 'SCENE_SWITCH', { sceneId, switchedBy: userId })
      } catch (err: any) {
        sendMessage(socket, 'ERROR', { message: err.message })
      }
      break
    }

    case 'SOURCE_UPDATE': {
      const { sourceId, update } = msg.payload as { sourceId: string; update: object }
      try {
        const updated = await sceneService.updateSource(sourceId, userId, update)
        broadcastToStream(streamId, 'SOURCE_UPDATE', updated)
      } catch (err: any) {
        sendMessage(socket, 'ERROR', { message: err.message })
      }
      break
    }

    default:
      sendMessage(socket, 'ERROR', { message: `Unknown message type: ${msg.type}` })
  }
}

// ─── Subscribe to Redis stats and relay to WebSocket clients ──
function subscribeToStreamStats(streamId: string): void {
  redisSub.subscribe(`stream:stats:${streamId}`, (err) => {
    if (err) logger.error({ err, streamId }, 'Redis subscribe error')
  })

  redisSub.on('message', (channel: string, message: string) => {
    if (channel !== `stream:stats:${streamId}`) return

    const stats = JSON.parse(message)
    broadcastToStream(streamId, 'STREAM_STATS', stats)
  })
}

// ─── Helpers ──────────────────────────────────────────────────
function sendMessage(socket: WebSocket, type: WsMessageType, payload: unknown): void {
  if (socket.readyState !== socket.OPEN) return
  socket.send(JSON.stringify({ type, payload, ts: Date.now() }))
}

export function broadcastToStream(
  streamId: string,
  type:     WsMessageType,
  payload:  unknown
): void {
  const clients = connections.get(streamId)
  if (!clients) return

  const msg = JSON.stringify({ type, payload, ts: Date.now() })
  for (const client of clients) {
    if (client.readyState === client.OPEN) {
      client.send(msg)
    }
  }
}

export function getActiveConnectionCount(streamId: string): number {
  return connections.get(streamId)?.size ?? 0
}
