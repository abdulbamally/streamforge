import { useMemo } from 'react'
import { useEditorStore } from '../store/editorStore'
import { useSelectedClip } from './useSelectedClip'
import { canSplitClip } from '../engine/editing/editValidation'

export function useEditCommands() {
  const { clip, track } = useSelectedClip()
  const currentTime = useEditorStore((state) => state.playback.currentTime)
  const snappingEnabled = useEditorStore((state) => state.timeline.isSnappingEnabled)
  const executeEditCommand = useEditorStore((state) => state.executeEditCommand)
  const setSnappingEnabled = useEditorStore((state) => state.setSnappingEnabled)

  const canSplit = useMemo(() => {
    if (!clip || !track) return false
    return canSplitClip(clip, track, currentTime).valid
  }, [clip, currentTime, track])

  const canDelete = !!clip && !!track && !track.isLocked

  return {
    selectedClip: clip,
    selectedTrack: track,
    snappingEnabled,
    canSplit,
    canDelete,
    split: () => {
      if (!clip) return false
      return executeEditCommand('SPLIT_CLIP', { clipId: clip.id, time: currentTime })
    },
    deleteSelected: () => {
      if (!clip) return false
      return executeEditCommand('DELETE_CLIP', { clipId: clip.id })
    },
    toggleSnapping: () => setSnappingEnabled(!snappingEnabled),
  }
}

