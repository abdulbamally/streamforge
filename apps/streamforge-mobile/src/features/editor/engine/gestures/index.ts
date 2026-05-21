export type EditorGesture =
  | 'none'
  | 'timeline-pan'
  | 'timeline-pinch'
  | 'clip-drag'
  | 'preview-transform'

export type GestureEngineState = {
  activeGesture: EditorGesture
  velocity: number
}

export const idleGestureState: GestureEngineState = {
  activeGesture: 'none',
  velocity: 0,
}
