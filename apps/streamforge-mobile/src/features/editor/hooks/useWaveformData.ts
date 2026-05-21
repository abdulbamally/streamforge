import { useMemo } from 'react'
import type { TimelineClip } from '../types/clip.types'
import { generatePlaceholderWaveform } from '../engine/media/waveformService'

export function useWaveformData(clip: TimelineClip | null) {
  return useMemo(() => {
    if (!clip || clip.type !== 'audio') return null
    return clip.waveformData ?? generatePlaceholderWaveform(clip.assetId ?? clip.id, clip.duration)
  }, [clip])
}
