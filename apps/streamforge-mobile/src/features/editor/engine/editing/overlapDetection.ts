import type { TimelineClip } from '../../types/clip.types'
import type { TimelineTrack } from '../../types/track.types'

export function getClipEndTime(clip: Pick<TimelineClip, 'startTime' | 'duration'>) {
  return clip.startTime + clip.duration
}

export function doClipsOverlap(
  clipA: Pick<TimelineClip, 'startTime' | 'duration'>,
  clipB: Pick<TimelineClip, 'startTime' | 'duration'>,
) {
  return clipA.startTime < getClipEndTime(clipB) && getClipEndTime(clipA) > clipB.startTime
}

export function findOverlappingClips(targetClip: TimelineClip, clips: TimelineClip[]) {
  return clips.filter(
    (clip) => clip.id !== targetClip.id && doClipsOverlap(targetClip, clip),
  )
}

export function canPlaceClipAtTime(
  clipId: string,
  trackId: string,
  startTime: number,
  duration: number,
  tracks: TimelineTrack[],
) {
  const track = tracks.find((item) => item.id === trackId)
  if (!track) return false

  const targetClip = {
    id: clipId,
    startTime,
    duration,
  } as TimelineClip

  return findOverlappingClips(targetClip, track.clips).length === 0
}

