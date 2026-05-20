// ============================================================
//  Stream Config Store — Local streaming setup gate (MMKV)
// ============================================================

import { getStorage } from '@core/storage/mmkvStorage'

const STORAGE_ID = 'streamforge-stream-config'

const KEYS = {
  CONFIGURED: 'configured',
  STREAM_ID: 'stream_id',
  STREAM_TITLE: 'stream_title',
} as const

function storage() {
  return getStorage(STORAGE_ID)
}

export function isStreamConfigured(): boolean {
  return storage().getString(KEYS.CONFIGURED) === 'true'
}

export function getConfiguredStreamId(): string | null {
  return storage().getString(KEYS.STREAM_ID) ?? null
}

export function getConfiguredStreamTitle(): string | null {
  return storage().getString(KEYS.STREAM_TITLE) ?? null
}

export function markStreamConfigured(streamId: string, title?: string): void {
  const s = storage()
  s.set(KEYS.CONFIGURED, 'true')
  s.set(KEYS.STREAM_ID, streamId)
  if (title) {
    s.set(KEYS.STREAM_TITLE, title)
  }
}

export function clearStreamConfig(): void {
  const s = storage()
  s.delete(KEYS.CONFIGURED)
  s.delete(KEYS.STREAM_ID)
  s.delete(KEYS.STREAM_TITLE)
}
