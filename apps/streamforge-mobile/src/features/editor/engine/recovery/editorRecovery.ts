import type { EditorProject } from '../../types/editor.types'
import type { MediaAsset } from '../../types/media.types'
import type { ProjectSnapshot } from '../../types/serialization.types'
import type { TimelineTrack } from '../../types/track.types'

export type RecoveredEditorState = {
  editorProject: EditorProject
  tracks: TimelineTrack[]
  mediaAssets: Record<string, MediaAsset>
  assetOrder: string[]
}

export function recoverEditorStateFromSnapshot(snapshot: ProjectSnapshot): RecoveredEditorState {
  const assetOrder = Object.keys(snapshot.mediaAssets)
  return {
    editorProject: {
      id: snapshot.projectId,
      title: snapshot.title,
      duration: snapshot.duration,
      width: snapshot.width,
      height: snapshot.height,
      fps: snapshot.fps,
      tracks: snapshot.tracks,
      mediaAssetIds: assetOrder,
      projectSettings: snapshot.settings,
      renderSettings: {
        format: snapshot.exportSettings.format,
        quality: snapshot.exportSettings.quality,
        bitrate: snapshot.exportSettings.bitrate,
      },
      createdAt: snapshot.createdAt,
      updatedAt: new Date().toISOString(),
    },
    tracks: snapshot.tracks,
    mediaAssets: snapshot.mediaAssets,
    assetOrder,
  }
}
