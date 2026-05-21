import type { InspectorMode, PropertyTab, TransformGestureState } from '../types/property.types'

export type PropertySlice = {
  inspectorOpen: boolean
  inspectorMode: InspectorMode
  selectedPropertyTab: PropertyTab
  activeTransformGesture: TransformGestureState
  previewOverlayEnabled: boolean
  safeAreaEnabled: boolean
}

export const initialPropertySlice: PropertySlice = {
  inspectorOpen: false,
  inspectorMode: 'none',
  selectedPropertyTab: 'transform',
  activeTransformGesture: 'none',
  previewOverlayEnabled: true,
  safeAreaEnabled: true,
}

export function defaultInspectorModeForClip(type?: string): InspectorMode {
  if (type === 'text') return 'text'
  if (type === 'audio') return 'audio'
  if (type === 'video' || type === 'image' || type === 'sticker') return 'visual'
  if (type === 'effect') return 'clip'
  return 'none'
}
