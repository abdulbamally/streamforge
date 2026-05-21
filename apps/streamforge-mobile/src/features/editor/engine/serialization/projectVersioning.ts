import type { ProjectSnapshot } from '../../types/serialization.types'

export const CURRENT_PROJECT_SCHEMA_VERSION = '1.0.0'

export function validateProjectVersion(snapshot: ProjectSnapshot) {
  return {
    valid: snapshot.version === CURRENT_PROJECT_SCHEMA_VERSION,
    version: snapshot.version,
    currentVersion: CURRENT_PROJECT_SCHEMA_VERSION,
  }
}

export function migrateProjectSnapshot(snapshot: ProjectSnapshot): ProjectSnapshot {
  if (snapshot.version === CURRENT_PROJECT_SCHEMA_VERSION) return snapshot
  return {
    ...snapshot,
    version: CURRENT_PROJECT_SCHEMA_VERSION,
  }
}
