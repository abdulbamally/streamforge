export type FilterType =
  | 'brightness'
  | 'contrast'
  | 'saturation'
  | 'blur'
  | 'vignette'
  | 'custom'

export type FilterAssignment = {
  id: string
  type: FilterType
  enabled: boolean
  intensity: number
}
