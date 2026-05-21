import type { EditCommand } from '../types/editCommand.types'

export type HistorySlice = {
  undoStack: EditCommand[]
  redoStack: EditCommand[]
  canUndo: boolean
  canRedo: boolean
  maxHistorySize: number
  lastEditCommand: EditCommand | null
  validationError: string | null
}

export const initialHistorySlice: HistorySlice = {
  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,
  maxHistorySize: 50,
  lastEditCommand: null,
  validationError: null,
}

