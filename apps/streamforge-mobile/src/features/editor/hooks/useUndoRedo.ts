import { useEditorStore } from '../store/editorStore'

export function useUndoRedo() {
  const canUndo = useEditorStore((state) => state.history.canUndo)
  const canRedo = useEditorStore((state) => state.history.canRedo)
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)

  return { canUndo, canRedo, undo, redo }
}

