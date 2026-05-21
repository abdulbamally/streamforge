export type TransitionType = 'fade' | 'slide' | 'zoom' | 'wipe' | 'custom'

export type TransitionSide = 'in' | 'out'

export type TransitionAssignment = {
  id: string
  type: TransitionType
  side: TransitionSide
  duration: number
  enabled: boolean
}
