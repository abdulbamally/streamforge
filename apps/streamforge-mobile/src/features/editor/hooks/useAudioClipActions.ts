import { useEditorStore } from '../store/editorStore'

export function useAudioClipActions() {
  return {
    updateSelectedClipVolume: useEditorStore((state) => state.updateSelectedClipVolume),
  }
}
