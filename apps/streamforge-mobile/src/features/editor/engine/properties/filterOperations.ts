import type { FilterAssignment, FilterType } from '../../types/filter.types'

export function createFilterAssignment(type: FilterType): FilterAssignment {
  return {
    id: `filter-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    enabled: true,
    intensity: 0.5,
  }
}

export function clampFilterIntensity(intensity: number): number {
  return Math.max(0, Math.min(1, intensity))
}
