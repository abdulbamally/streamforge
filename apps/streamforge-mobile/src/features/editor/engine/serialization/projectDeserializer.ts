import type { ProjectSnapshot } from '../../types/serialization.types'
import { migrateProjectSnapshot } from './projectVersioning'

export function deserializeProjectSnapshot(json: string): ProjectSnapshot {
  const parsed = JSON.parse(json) as ProjectSnapshot
  return migrateProjectSnapshot(parsed)
}
