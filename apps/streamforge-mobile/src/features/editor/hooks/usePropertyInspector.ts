import { useEditorStore } from '../store/editorStore'

export function usePropertyInspector() {
  const property = useEditorStore((state) => state.property)
  const openInspector = useEditorStore((state) => state.openInspector)
  const closeInspector = useEditorStore((state) => state.closeInspector)
  const setSelectedPropertyTab = useEditorStore((state) => state.setSelectedPropertyTab)

  return {
    ...property,
    openInspector,
    closeInspector,
    setSelectedPropertyTab,
  }
}
