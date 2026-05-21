import type { TimelineClip } from './clip.types'

export type PreviewOverlayState = {
  clip: TimelineClip | null
  visible: boolean
  showSafeArea: boolean
  showTransform: boolean
}
