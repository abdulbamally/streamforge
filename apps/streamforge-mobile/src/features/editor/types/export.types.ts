import type { RenderPlan } from './render.types'

export type ExportResolution = '720p' | '1080p' | '1440p' | '4k' | 'source'

export type ExportFormat = 'mp4' | 'mov'

export type ExportQuality = 'draft' | 'standard' | 'high' | 'maximum'

export type ExportSettings = {
  resolution: ExportResolution
  fps: number
  format: ExportFormat
  quality: ExportQuality
  bitrate?: number
  includeAudio: boolean
  includeWatermark?: boolean
}

export type RenderJobStatus =
  | 'idle'
  | 'queued'
  | 'preparing'
  | 'rendering'
  | 'saving'
  | 'completed'
  | 'failed'
  | 'cancelled'

export type RenderError = {
  code: string
  message: string
  recoverable?: boolean
}

export type ExportOutput = {
  id: string
  jobId: string
  uri: string
  fileName: string
  fileSize?: number
  duration?: number
  width?: number
  height?: number
  fps?: number
  format: ExportFormat
  createdAt: string
}

export type RenderJob = {
  id: string
  projectId: string
  snapshotId: string
  status: RenderJobStatus
  settings: ExportSettings
  renderPlan?: RenderPlan
  progress: number
  currentStep?: string
  output?: ExportOutput
  error?: RenderError
  createdAt: string
  startedAt?: string
  completedAt?: string
}

export type ExportValidationIssue = {
  code: string
  message: string
  severity: 'error' | 'warning'
  clipId?: string
  trackId?: string
  assetId?: string
}

export type ExportValidationResult = {
  valid: boolean
  errors: ExportValidationIssue[]
  warnings: ExportValidationIssue[]
}

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  resolution: '1080p',
  fps: 30,
  format: 'mp4',
  quality: 'standard',
  includeAudio: true,
}
