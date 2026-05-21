import { useMemo } from 'react'
import { useEditorStore } from '../store/editorStore'

export function useSelectedClipProperties() {
  const tracks = useEditorStore((state) => state.tracks)
  const selectedClipId = useEditorStore((state) => state.selection.selectedClipId)

  return useMemo(() => {
    if (!selectedClipId) return { clip: null, track: null }
    for (const track of tracks) {
      const clip = track.clips.find((item) => item.id === selectedClipId)
      if (clip) return { clip, track }
    }
    return { clip: null, track: null }
  }, [selectedClipId, tracks])
}
