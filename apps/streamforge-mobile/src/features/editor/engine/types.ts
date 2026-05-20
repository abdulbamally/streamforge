// ============================================================
//  Editor engine — canonical non-destructive models
// ============================================================

export type TimelineClip = {
  id: string
  sourceUri: string
  sourceStart: number
  sourceEnd: number
  timelineStart: number
  duration: number
  trackIndex: number
  muted?: boolean
  speed?: number
  label?: string
}

export type EditProject = {
  id: string
  title: string
  clips: TimelineClip[]
  createdAt: number
  updatedAt: number
  fps?: number
  resolution?: { width: number; height: number }
  aspectRatio?: string
}

export type ClipLayout = {
  clip: TimelineClip
  left: number
  width: number
}

export const SNAP_GRID_SEC = 1 / 30
