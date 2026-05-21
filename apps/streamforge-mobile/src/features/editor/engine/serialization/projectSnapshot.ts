import type { EditorProject } from '../../types/editor.types'
import type { ExportSettings } from '../../types/export.types'
import type { MediaAsset } from '../../types/media.types'
import type { TimelineTrack } from '../../types/track.types'
import type { ProjectSnapshot } from '../../types/serialization.types'
import { CURRENT_PROJECT_SCHEMA_VERSION } from './projectVersioning'

type SnapshotInput = {
  project: EditorProject
  tracks: TimelineTrack[]
  mediaAssets: Record<string, MediaAsset>
  exportSettings: ExportSettings
}

function jsonClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function createProjectSnapshot({
  project,
  tracks,
  mediaAssets,
  exportSettings,
}: SnapshotInput): ProjectSnapshot {
  const createdAt = new Date().toISOString()
  return jsonClone({
    id: `snapshot-${project.id}-${Date.now()}`,
    projectId: project.id,
    version: CURRENT_PROJECT_SCHEMA_VERSION,
    title: project.title,
    duration: project.duration,
    width: project.width,
    height: project.height,
    fps: project.fps,
    tracks,
    mediaAssets,
    settings: project.projectSettings,
    exportSettings,
    createdAt,
  })
}

export function assertSnapshotSerializable(snapshot: ProjectSnapshot): boolean {
  JSON.stringify(snapshot)
  return true
}
