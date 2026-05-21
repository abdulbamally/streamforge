import type { ExportSettings } from './export.types'
import type { MediaAsset } from './media.types'
import type { TimelineTrack } from './track.types'
import type { ProjectSettings } from './editor.types'

export type ProjectSnapshot = {
  id: string
  projectId: string
  version: string
  title: string
  duration: number
  width: number
  height: number
  fps: number
  tracks: TimelineTrack[]
  mediaAssets: Record<string, MediaAsset>
  settings: ProjectSettings
  exportSettings: ExportSettings
  createdAt: string
}

export type SerializedProject = {
  snapshot: ProjectSnapshot
  json: string
}
