import type { MediaAsset } from '../../types/media.types'

export function getAssetDuration(asset: MediaAsset, fallback = 5): number {
  if (asset.type === 'image') return asset.duration ?? fallback
  return Math.max(0.25, asset.duration ?? fallback)
}

export function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return ''
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
