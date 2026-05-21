import { useEditorStore } from '../store/editorStore'

export function useEditorPlayback() {
  const isPlaying = useEditorStore((state) => state.playback.isPlaying)
  const currentTime = useEditorStore((state) => state.playback.currentTime)
  const duration = useEditorStore((state) => state.playback.duration)
  const playbackRate = useEditorStore((state) => state.playback.playbackRate)
  const playbackStatus = useEditorStore((state) => state.playback.playbackStatus)
  const togglePlayback = useEditorStore((state) => state.togglePlayback)
  const seekTo = useEditorStore((state) => state.seekTo)

  return {
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    playbackStatus,
    togglePlayback,
    seekTo,
  }
}
