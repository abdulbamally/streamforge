import type { EditorTool } from '../types/editor.types'

export type SelectionSlice = {
  selectedClipId: string | null
  selectedTrackId: string | null
  selectedClipIds: string[]
  selectedElements: string[]
  activeTool: EditorTool
}

export const initialSelectionSlice: SelectionSlice = {
  selectedClipId: null,
  selectedTrackId: null,
  selectedClipIds: [],
  selectedElements: [],
  activeTool: 'select',
}
