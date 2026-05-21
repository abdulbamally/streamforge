import { Platform } from 'react-native'
import type { MediaAsset, MediaAssetType, PickedMediaFile } from '../../types/media.types'
import { generatePlaceholderWaveform } from './waveformService'

function normalizeUri(uri: string): string {
  if (Platform.OS === 'ios' && !uri.startsWith('file://') && !uri.startsWith('ph://')) {
    return `file://${uri}`
  }
  return uri
}

export function getFileNameFromUri(uri: string): string {
  const clean = uri.split('?')[0] ?? uri
  const tail = clean.split('/').filter(Boolean).at(-1)
  return decodeURIComponent(tail || 'Untitled media')
}

export function inferMediaType(mimeType?: string | null, uri?: string): MediaAssetType {
  const normalizedMime = mimeType?.toLowerCase() ?? ''
  const normalizedUri = uri?.toLowerCase() ?? ''

  if (normalizedMime.startsWith('audio/')) return 'audio'
  if (normalizedMime.startsWith('image/')) return 'image'
  if (normalizedMime.startsWith('video/')) return 'video'

  if (/\.(mp3|aac|wav|m4a|ogg|flac)$/i.test(normalizedUri)) return 'audio'
  if (/\.(png|jpe?g|webp|heic|gif)$/i.test(normalizedUri)) return 'image'
  return 'video'
}

export async function extractMediaMetadata(uri: string): Promise<{
  duration?: number
  width?: number
  height?: number
  fileSize?: number
}> {
  if (!uri) return {}
  return {}
}

export function createMediaAssetFromPickedFile(file: PickedMediaFile): MediaAsset {
  const rawUri = file.uri ?? ''
  const uri = normalizeUri(rawUri)
  const mimeType = file.mimeType ?? file.type ?? undefined
  const type = inferMediaType(mimeType, uri)
  const fileName = file.fileName ?? file.name ?? getFileNameFromUri(uri)
  const duration =
    file.duration ?? (type === 'image' ? 5 : undefined)
  const assetId = `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const waveformData =
    type === 'audio' ? generatePlaceholderWaveform(assetId, duration ?? 10) : undefined

  return {
    id: assetId,
    type,
    uri,
    name: fileName?.replace(/\.[^.]+$/, '') || 'Untitled media',
    fileName: fileName ?? undefined,
    mimeType,
    duration: duration ?? undefined,
    width: file.width ?? undefined,
    height: file.height ?? undefined,
    fileSize: file.fileSize ?? file.size ?? undefined,
    thumbnailUri: file.thumbnailUri ?? undefined,
    waveformData,
    createdAt: new Date().toISOString(),
    metadataStatus: 'ready',
  }
}
