import type { ExportFormat, ExportSettings } from './export.types'

export type UnsupportedRenderFeatureType =
  | 'text'
  | 'sticker'
  | 'filter'
  | 'transition'
  | 'transform'
  | 'opacity'
  | 'multi-track'
  | 'advanced-audio'

export type UnsupportedRenderFeature = {
  type: UnsupportedRenderFeatureType
  clipId?: string
  trackId?: string
  message: string
}

export type TrimInstruction = {
  id: string
  type: 'trim'
  clipId: string
  trackId: string
  assetId?: string
  inputUri: string
  timelineStart: number
  sourceStart: number
  sourceEnd: number
  duration: number
}

export type ConcatenateInstruction = {
  id: string
  type: 'concatenate'
  clipIds: string[]
  inputUris: string[]
}

export type AudioInstruction = {
  id: string
  type: 'audio'
  clipId: string
  trackId: string
  assetId?: string
  inputUri: string
  timelineStart: number
  sourceStart: number
  sourceEnd: number
  volume: number
  muted: boolean
}

export type OverlayInstruction = {
  id: string
  type: 'overlay'
  clipId: string
  trackId: string
  supported: false
}

export type TextInstruction = {
  id: string
  type: 'text'
  clipId: string
  trackId: string
  supported: false
}

export type FilterInstruction = {
  id: string
  type: 'filter'
  clipId: string
  supported: false
}

export type TransitionInstruction = {
  id: string
  type: 'transition'
  clipId: string
  supported: false
}

export type RenderInstruction =
  | TrimInstruction
  | ConcatenateInstruction
  | AudioInstruction
  | OverlayInstruction
  | TextInstruction
  | FilterInstruction
  | TransitionInstruction

export type RenderPlan = {
  id: string
  projectId: string
  duration: number
  width: number
  height: number
  fps: number
  format: ExportFormat
  instructions: RenderInstruction[]
  unsupportedFeatures: UnsupportedRenderFeature[]
  createdAt: string
}

export type FFmpegCommandPlan = {
  command: string
  inputFiles: string[]
  outputFile: string
  estimatedDuration: number
  warnings: string[]
  settings: ExportSettings
}
