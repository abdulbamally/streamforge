import { useEditorStore, type EditorState, type EditorTool } from './editorStore'

interface UiState {
  zoom: number
  scrollOffsetPx: number
  activeTool: EditorTool
  exportProgress: number
  isExporting: boolean
  setZoom: (zoom: number) => void
  setScrollOffsetPx: (px: number) => void
  setActiveTool: (tool: EditorTool) => void
  setExportProgress: (p: number) => void
  setIsExporting: (v: boolean) => void
  reset: () => void
}

function uiFacade(state: EditorState): UiState {
  return {
    zoom: state.timeline.zoomLevel,
    scrollOffsetPx: state.timeline.scrollOffsetX,
    activeTool: state.selection.activeTool,
    exportProgress: state.ui.exportProgress,
    isExporting: state.ui.isExporting,
    setZoom: state.setZoomLevel,
    setScrollOffsetPx: state.setScrollOffset,
    setActiveTool: state.setActiveTool,
    setExportProgress: state.setExportProgress,
    setIsExporting: state.setIsExporting,
    reset: state.reset,
  }
}

type UiStoreHook = {
  <T>(selector: (state: UiState) => T): T
  getState: () => UiState
}

export const useUiStore = ((selector) =>
  useEditorStore((state) => selector(uiFacade(state)))) as UiStoreHook

useUiStore.getState = () => uiFacade(useEditorStore.getState())

export type { EditorTool }
