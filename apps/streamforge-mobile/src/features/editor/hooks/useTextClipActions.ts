import { useEditorStore } from '../store/editorStore'

export function useTextClipActions() {
  return {
    addTextClip: useEditorStore((state) => state.addTextClip),
    updateSelectedTextProperties: useEditorStore((state) => state.updateSelectedTextProperties),
  }
}
