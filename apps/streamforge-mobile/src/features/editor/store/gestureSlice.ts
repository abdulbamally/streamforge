export type TimelineGesture =
  | 'none'
  | 'timeline-pan'
  | 'timeline-pinch'
  | 'clip-drag'
  | 'trim-start'
  | 'trim-end'
  | 'playhead-drag'

export type GestureSlice = {
  activeGesture: TimelineGesture
  isDraggingClip: boolean
  isDraggingPlayhead: boolean
  isPinching: boolean
  dragClipId: string | null
  isScrubbingPlayhead: boolean
  scrubStartTime: number
  scrubCurrentTime: number
  scrubStartX: number
  scrubCurrentX: number
}

export const initialGestureSlice: GestureSlice = {
  activeGesture: 'none',
  isDraggingClip: false,
  isDraggingPlayhead: false,
  isPinching: false,
  dragClipId: null,
  isScrubbingPlayhead: false,
  scrubStartTime: 0,
  scrubCurrentTime: 0,
  scrubStartX: 0,
  scrubCurrentX: 0,
}
