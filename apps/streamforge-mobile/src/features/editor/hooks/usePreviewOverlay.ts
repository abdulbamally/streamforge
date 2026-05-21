import { useMemo } from 'react'
import { getPreviewOverlayState } from '../engine/preview/previewOverlayEngine'
import { useEditorStore } from '../store/editorStore'

export function usePreviewOverlay() {
  const tracks = useEditorStore((state) => state.tracks)
  const selectedClipId = useEditorStore((state) => state.selection.selectedClipId)
  const currentTime = useEditorStore((state) => state.playback.currentTime)
  const overlays = useEditorStore((state) => state.overlays)
  const property = useEditorStore((state) => state.property)

  return useMemo(
    () =>
      getPreviewOverlayState({
        tracks,
        selectedClipId,
        currentTime,
        showSafeArea: property.safeAreaEnabled,
        showTransform: property.previewOverlayEnabled || overlays.showTransformHandles,
      }),
    [currentTime, overlays.showTransformHandles, property.previewOverlayEnabled, property.safeAreaEnabled, selectedClipId, tracks],
  )
}
