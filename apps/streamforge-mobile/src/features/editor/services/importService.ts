import { launchImageLibrary, type Asset } from 'react-native-image-picker'
import { Platform } from 'react-native'
import type { TimelineClip } from '../engine/types'
import { generateId } from '../engine/timelineEngine'
import { probeVideoMetadata } from './metadataService'

export type ImportResult = {
  clip: TimelineClip
  metadata: {
    duration: number
    width?: number
    height?: number
    fps?: number
    fileSize?: number
  }
}

function normalizeUri(uri: string): string {
  if (Platform.OS === 'ios' && !uri.startsWith('file://')) {
    return `file://${uri}`
  }
  return uri
}

export async function pickVideoFromGallery(): Promise<ImportResult | null> {
  const result = await launchImageLibrary({
    mediaType: 'video',
    selectionLimit: 1,
  })

  if (result.didCancel || !result.assets?.[0]) return null
  return buildImportFromAsset(result.assets[0])
}

export async function buildImportFromAsset(asset: Asset): Promise<ImportResult | null> {
  const uri = asset.uri
  if (!uri) return null

  const sourceUri = normalizeUri(uri)
  const meta = await probeVideoMetadata(sourceUri, asset.duration)
  const duration = meta.duration || asset.duration || 10

  const clip: TimelineClip = {
    id: generateId(),
    sourceUri,
    sourceStart: 0,
    sourceEnd: duration,
    timelineStart: 0,
    duration,
    trackIndex: 0,
    label: asset.fileName ?? 'Clip',
  }

  return {
    clip,
    metadata: {
      duration,
      width: meta.width ?? asset.width,
      height: meta.height ?? asset.height,
      fps: meta.fps,
      fileSize: asset.fileSize,
    },
  }
}
