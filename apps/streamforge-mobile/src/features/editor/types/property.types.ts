export type InspectorMode =
  | 'none'
  | 'clip'
  | 'text'
  | 'audio'
  | 'visual'
  | 'filter'
  | 'transition'

export type PropertyTab =
  | 'transform'
  | 'text'
  | 'audio'
  | 'visual'
  | 'filters'
  | 'transitions'

export type TransformGestureState = 'none' | 'drag' | 'scale' | 'rotate'

export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay'
