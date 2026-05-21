export type MediaAssetType = 'video' | 'audio' | 'image'

export type MediaMetadataStatus = 'pending' | 'loading' | 'ready' | 'error'

export type WaveformStatus = 'placeholder' | 'generated' | 'error'

export type WaveformData = {
  assetId: string
  samples: number[]
  sampleRate?: number
  duration: number
  resolution: number
  status: WaveformStatus
}

export type MediaAsset = {
  id: string
  type: MediaAssetType
  uri: string
  name: string
  fileName?: string
  mimeType?: string
  duration?: number
  width?: number
  height?: number
  fileSize?: number
  thumbnailUri?: string
  waveformData?: WaveformData
  createdAt: string
  metadataStatus: MediaMetadataStatus
}

export type PickedMediaFile = {
  uri?: string
  name?: string | null
  fileName?: string | null
  type?: string | null
  mimeType?: string | null
  duration?: number | null
  width?: number | null
  height?: number | null
  size?: number | null
  fileSize?: number | null
  thumbnailUri?: string | null
}
