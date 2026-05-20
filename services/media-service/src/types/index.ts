// ============================================================
//  Media Service — Local domain types
// ============================================================

export type ExportFormat  = 'MP4' | 'MOV' | 'WEBM' | 'MKV' | 'GIF' | 'MP3'
export type JobStatus     = 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED' | 'CANCELLED'
export type ProjectStatus = 'DRAFT' | 'PROCESSING' | 'READY' | 'ARCHIVED'

export interface VideoMetadata {
  duration:   number       // seconds
  width:      number
  height:     number
  fps:        number
  bitrate:    number       // kbps
  codec:      string
  audioCodec: string | null
  size:       number       // bytes
}

export interface TimelineTrack {
  index:   number          // 0 = primary video, 1+ = overlays
  clips:   TimelineClip[]
}

export interface TimelineClip {
  id:         string
  assetUrl:   string
  startTime:  number       // position on timeline
  endTime:    number
  trimIn:     number
  trimOut:    number | null
  trackIndex: number
  volume:     number
  opacity:    number
  speed:      number
}

export interface ExportJobPayload {
  projectId:    string
  exportId:     string
  userId:       string
  format:       ExportFormat
  resolution:   string
  fps:          number
  videoBitrate?: number
  audioBitrate?: number
}

export interface TranscodeJobPayload {
  type:    'trim' | 'color-grade' | 'extract-audio' | 'merge'
  clipId?: string
  userId:  string
  params:  Record<string, unknown>
}

export interface UploadCompletePayload {
  assetId:  string
  userId:   string
  mimeType: string
  url:      string
}
