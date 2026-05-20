import { create } from 'zustand'

export type EditorTool = 'cut' | 'audio' | 'text' | 'effects' | 'speed'

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

const initial = {
  zoom: 1,
  scrollOffsetPx: 0,
  activeTool: 'cut' as EditorTool,
  exportProgress: 0,
  isExporting: false,
}

export const useUiStore = create<UiState>((set) => ({
  ...initial,
  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(zoom, 10)) }),
  setScrollOffsetPx: (scrollOffsetPx) => set({ scrollOffsetPx: Math.max(0, scrollOffsetPx) }),
  setActiveTool: (activeTool) => set({ activeTool }),
  setExportProgress: (exportProgress) => set({ exportProgress }),
  setIsExporting: (isExporting) => set({ isExporting }),
  reset: () => set({ ...initial }),
}))
