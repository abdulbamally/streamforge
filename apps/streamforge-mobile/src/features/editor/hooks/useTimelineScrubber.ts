import { useScrubbingSync } from '../engine/synchronization/useScrubbingSync'
import type { TimelineMetrics } from '../types/timeline.types'

export function useTimelineScrubber(metrics: TimelineMetrics) {
  return useScrubbingSync(metrics)
}
