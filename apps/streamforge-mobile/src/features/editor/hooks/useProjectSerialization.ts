import { useMemo } from 'react'
import { serializeProject } from '../engine/serialization/projectSerializer'
import { useEditorStore } from '../store/editorStore'

export function useProjectSerialization() {
  const editorProject = useEditorStore((state) => state.editorProject)
  const tracks = useEditorStore((state) => state.tracks)
  const mediaAssets = useEditorStore((state) => state.media.mediaAssets)
  const exportSettings = useEditorStore((state) => state.export.exportSettings)

  return useMemo(
    () =>
      serializeProject({
        project: {
          ...editorProject,
          tracks,
        },
        tracks,
        mediaAssets,
        exportSettings,
      }),
    [editorProject, exportSettings, mediaAssets, tracks],
  )
}
