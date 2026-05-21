import type { EditCommand } from '../../types/editCommand.types'

export function pushUndoEntry(
  undoStack: EditCommand[],
  command: EditCommand,
  maxHistorySize: number,
) {
  return [...undoStack, command].slice(-maxHistorySize)
}

