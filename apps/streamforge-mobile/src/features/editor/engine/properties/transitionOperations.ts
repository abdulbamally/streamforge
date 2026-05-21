import type { TransitionAssignment, TransitionSide, TransitionType } from '../../types/transition.types'

export function createTransitionAssignment(
  type: TransitionType,
  side: TransitionSide,
): TransitionAssignment {
  return {
    id: `transition-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    side,
    duration: 0.5,
    enabled: true,
  }
}

export function clampTransitionDuration(duration: number): number {
  return Math.max(0.1, Math.min(3, duration))
}
