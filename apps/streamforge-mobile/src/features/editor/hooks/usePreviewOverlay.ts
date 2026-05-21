import { useMemo } from 'react'
import { getPreviewOverlayState } from '../engine/preview/previewOverlayEngine'
import { useEditorStore } from '../store/editorStore'

export function usePreviewOverlay() {
  const tracks = useEditorStore((state) => state.tracks)
  const selectedClipId = useEditorStore((state) => state.selection.selectedClipId)
  const currentTime = useEditorStore((state) => state.playback.currentTime)
  const overlays = useEditorStore((state) => state.overlays)

  return useMemo(
    () =>
      getPreviewOverlayState({
        tracks,
        selectedClipId,
        currentTime,
        showSafeArea: overlays.showSafeAreaGuides,
        showTransform: overlays.showTransformHandles,
      }),
    [currentTime, overlays.showSafeAreaGuides, overlays.showTransformHandles, selectedClipId, tracks],
  )
}
