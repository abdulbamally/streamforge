import { useEditorStore } from '../store/editorStore'

export function useCreativeTools() {
  return {
    addTextClip: useEditorStore((state) => state.addTextClip),
    addStickerClip: useEditorStore((state) => state.addStickerClip),
    openInspector: useEditorStore((state) => state.openInspector),
    setSafeAreaEnabled: useEditorStore((state) => state.setSafeAreaEnabled),
    safeAreaEnabled: useEditorStore((state) => state.property.safeAreaEnabled),
  }
}
