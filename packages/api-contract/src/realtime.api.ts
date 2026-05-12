// ============================================================
//  StreamForge API Contract — Realtime (chat, presence, WS)
// ============================================================

import { apiFetch, getConfig } from './client'

export interface LiveChatMessageDto {
  id: string
  roomId: string
  userId: string
  message: string
  createdAt: string
}

export interface PresenceSessionDto {
  streamId: string
  userId: string
  approxViewers: number
  joinedAt?: string
  leftAt?: string
}

export interface LiveRoomWsHandlers {
  /** When set, sends `stream:join` automatically after the socket opens. */
  autoJoinStreamId?: string
  onChatReceive?: (payload: {
    id: string
    streamId: string
    userId: string
    username: string
    text: string
    createdAt: string
  }) => void
  onReactionReceive?: (payload: {
    streamId: string
    userId: string
    username: string
    reaction: string
    createdAt: string
  }) => void
  onError?: (message: string, code?: string) => void
  onOpen?: () => void
  onClose?: () => void
}

export const realtimeApi = {
  sendChatMessage: (body: { roomId: string; message: string }) =>
    apiFetch<LiveChatMessageDto>('/api/v1/chat', {
      method: 'POST',
      body: JSON.stringify(body),
      service: 'realtime',
    }),

  listChatMessages: (roomId: string) =>
    apiFetch<LiveChatMessageDto[]>(`/api/v1/chat/${encodeURIComponent(roomId)}`, {
      method: 'GET',
      service: 'realtime',
    }),

  presenceJoin: (body: { streamId: string }) =>
    apiFetch<PresenceSessionDto>('/api/v1/presence/join', {
      method: 'POST',
      body: JSON.stringify(body),
      service: 'realtime',
    }),

  presenceLeave: (body: { streamId: string }) =>
    apiFetch<PresenceSessionDto>('/api/v1/presence/leave', {
      method: 'POST',
      body: JSON.stringify(body),
      service: 'realtime',
    }),
}

/**
 * WebSocket for live room: chat + reactions. URL uses realtimeWsUrl from client config.
 * Send `{"type":"stream:join","streamId":"..."}` after connect before chat.
 */
export function connectLiveRoomWs(handlers: LiveRoomWsHandlers) {
  const cfg = getConfig()
  const token = cfg.getAccessToken()
  if (!token) {
    handlers.onError?.('Not authenticated')
    return {
      join: (_streamId: string) => {},
      sendChat: (_streamId: string, _text: string) => {},
      sendReaction: (_streamId: string, _reaction: string) => {},
      close: () => {},
    }
  }

  const base = cfg.realtimeWsUrl ?? ''
  if (!base) {
    handlers.onError?.('realtimeWsUrl not configured')
    return {
      join: (_streamId: string) => {},
      sendChat: (_streamId: string, _text: string) => {},
      sendReaction: (_streamId: string, _reaction: string) => {},
      close: () => {},
    }
  }

  const url = `${base.replace(/\/$/, '')}/api/v1/rt/stream?token=${encodeURIComponent(token)}`
  const ws = new WebSocket(url)

  const send = (obj: object) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(obj))
    }
  }

  ws.onopen = () => {
    handlers.onOpen?.()
    if (handlers.autoJoinStreamId) {
      send({ type: 'stream:join', streamId: handlers.autoJoinStreamId })
    }
  }
  ws.onclose = () => handlers.onClose?.()
  ws.onerror = () => handlers.onError?.('WebSocket error')

  ws.onmessage = (ev: MessageEvent) => {
    try {
      const msg = JSON.parse(String(ev.data)) as {
        type?: string
        payload?: Record<string, unknown>
        message?: string
        code?: string
      }
      if (msg.type === 'chat:receive' && msg.payload) {
        handlers.onChatReceive?.(msg.payload as never)
        return
      }
      if (msg.type === 'reaction:receive' && msg.payload) {
        handlers.onReactionReceive?.(msg.payload as never)
        return
      }
      if (msg.type === 'error') {
        handlers.onError?.(msg.message ?? 'error', msg.code)
      }
    } catch {
      handlers.onError?.('Malformed WebSocket message')
    }
  }

  return {
    join: (streamId: string) => send({ type: 'stream:join', streamId }),
    sendChat: (streamId: string, text: string) =>
      send({ type: 'chat:send', streamId, text }),
    sendReaction: (streamId: string, reaction: string) =>
      send({ type: 'reaction:send', streamId, reaction }),
    leave: () => send({ type: 'stream:leave' }),
    close: () => ws.close(),
    get readyState() {
      return ws.readyState
    },
  }
}
