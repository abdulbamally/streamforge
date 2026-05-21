import type { TimelineTrack } from './track.types'

export type ProjectSettings = {
  aspectRatio: string
  resolution: {
    width: number
    height: number
  }
  fps: number
  backgroundColor: string
}

export type RenderSettings = {
  format: string
  bitrate?: number
  quality?: 'draft' | 'standard' | 'high'
}

export type EditorProject = {
  id: string
  title: string
  duration: number
  width: number
  height: number
  fps: number
  tracks: TimelineTrack[]
  mediaAssetIds: string[]
  projectSettings: ProjectSettings
  renderSettings?: RenderSettings
  createdAt: string
  updatedAt: string
}

export type EditorTool =
  | 'select'
  | 'split'
  | 'trim'
  | 'text'
  | 'audio'
  | 'effects'
  | 'cut'
  | 'speed'
