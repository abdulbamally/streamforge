import type { WaveformData } from './media.types'
import type { BlendMode } from './property.types'
import type { FilterAssignment } from './filter.types'
import type { TextClipProperties } from './text.types'
import type { TransitionAssignment } from './transition.types'

export type TimelineClipType = 'video' | 'audio' | 'text' | 'effect' | 'image' | 'sticker'

export type ClipVisualStatus = 'loading' | 'ready' | 'error' | 'placeholder'

export type ClipTransform = {
  x: number
  y: number
  scale: number
  rotation: number
  width?: number
  height?: number
  anchorX?: number
  anchorY?: number
}

export const DEFAULT_CLIP_TRANSFORM: ClipTransform = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
  anchorX: 0.5,
  anchorY: 0.5,
}

export type TimelineClip = {
  id: string
  trackId: string
  assetId?: string
  type: TimelineClipType
  name: string
  startTime: number
  duration: number
  trimStart: number
  trimEnd: number
  mediaStartTime?: number
  mediaEndTime?: number
  color?: string
  sourceUri?: string
  thumbnailUri?: string
  thumbnailUris?: string[]
  waveformData?: WaveformData
  opacity?: number
  volume?: number
  transform?: ClipTransform
  text?: TextClipProperties
  filters?: FilterAssignment[]
  transitions?: TransitionAssignment[]
  blendMode?: BlendMode
  layerIndex?: number
  isSelected?: boolean
  visualStatus?: ClipVisualStatus
  textContent?: string
  fontFamily?: string
  fontSize?: number
  textColor?: string
  effectType?: string
}
