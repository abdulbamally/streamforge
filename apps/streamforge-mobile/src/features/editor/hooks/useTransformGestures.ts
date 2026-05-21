import { useEditorStore } from '../store/editorStore'

export function useTransformGestures() {
  return {
    updateSelectedClipTransform: useEditorStore((state) => state.updateSelectedClipTransform),
    setActiveTransformGesture: useEditorStore((state) => state.setActiveTransformGesture),
    activeTransformGesture: useEditorStore((state) => state.property.activeTransformGesture),
  }
}
