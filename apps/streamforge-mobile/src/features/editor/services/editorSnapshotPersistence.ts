import { getStorage } from '@core/storage/mmkvStorage'
import type { ProjectSnapshot } from '../types/serialization.types'

const STORAGE_ID = 'streamforge-editor-snapshots'
const RECOVERY_INDEX_KEY = 'recovery_index'
const MAX_RECOVERY_SNAPSHOTS = 5

export type EditorRecoveryEntry = {
  projectId: string
  snapshotId: string
  savedAt: string
  reason: 'autosave' | 'manual' | 'recovery'
}

function storage() {
  return getStorage(STORAGE_ID)
}

function snapshotKey(snapshotId: string) {
  return `snapshot:${snapshotId}`
}

function recoveryKey(projectId: string) {
  return `recovery:${projectId}`
}

function readIndex(): EditorRecoveryEntry[] {
  const raw = storage().getString(RECOVERY_INDEX_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as EditorRecoveryEntry[]
  } catch {
    return []
  }
}

function writeIndex(entries: EditorRecoveryEntry[]) {
  storage().set(RECOVERY_INDEX_KEY, JSON.stringify(entries))
}

export function saveEditorSnapshot(
  snapshot: ProjectSnapshot,
  reason: EditorRecoveryEntry['reason'] = 'autosave',
): EditorRecoveryEntry {
  const entry: EditorRecoveryEntry = {
    projectId: snapshot.projectId,
    snapshotId: snapshot.id,
    savedAt: new Date().toISOString(),
    reason,
  }
  const s = storage()
  s.set(snapshotKey(snapshot.id), JSON.stringify(snapshot))
  s.set(recoveryKey(snapshot.projectId), JSON.stringify(entry))

  const nextIndex = [
    entry,
    ...readIndex().filter((item) => item.snapshotId !== snapshot.id),
  ].slice(0, MAX_RECOVERY_SNAPSHOTS)
  writeIndex(nextIndex)
  return entry
}

export function loadEditorSnapshot(snapshotId: string): ProjectSnapshot | null {
  const raw = storage().getString(snapshotKey(snapshotId))
  if (!raw) return null
  try {
    return JSON.parse(raw) as ProjectSnapshot
  } catch {
    return null
  }
}

export function getLatestRecoveryEntry(projectId: string): EditorRecoveryEntry | null {
  const raw = storage().getString(recoveryKey(projectId))
  if (!raw) return null
  try {
    return JSON.parse(raw) as EditorRecoveryEntry
  } catch {
    return null
  }
}

export function loadLatestRecoverySnapshot(projectId: string): ProjectSnapshot | null {
  const entry = getLatestRecoveryEntry(projectId)
  return entry ? loadEditorSnapshot(entry.snapshotId) : null
}

export function listRecoveryEntries(): EditorRecoveryEntry[] {
  return readIndex()
}

export function clearRecoverySnapshot(projectId: string): void {
  const s = storage()
  const entry = getLatestRecoveryEntry(projectId)
  if (entry) {
    s.delete(snapshotKey(entry.snapshotId))
  }
  s.delete(recoveryKey(projectId))
  writeIndex(readIndex().filter((item) => item.projectId !== projectId))
}
