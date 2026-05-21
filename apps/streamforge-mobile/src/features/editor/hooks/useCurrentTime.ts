import { useEditorStore } from '../store/editorStore'

export function useCurrentTime() {
  return useEditorStore((state) => state.playback.currentTime)
}
