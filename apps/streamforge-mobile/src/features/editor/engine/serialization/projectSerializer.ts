import type { EditorProject } from '../../types/editor.types'
import type { ExportSettings } from '../../types/export.types'
import type { MediaAsset } from '../../types/media.types'
import type { TimelineTrack } from '../../types/track.types'
import type { SerializedProject } from '../../types/serialization.types'
import { assertSnapshotSerializable, createProjectSnapshot } from './projectSnapshot'

type SerializeProjectInput = {
  project: EditorProject
  tracks: TimelineTrack[]
  mediaAssets: Record<string, MediaAsset>
  exportSettings: ExportSettings
}

export function serializeProject(input: SerializeProjectInput): SerializedProject {
  const snapshot = createProjectSnapshot(input)
  assertSnapshotSerializable(snapshot)
  return {
    snapshot,
    json: JSON.stringify(snapshot),
  }
}
