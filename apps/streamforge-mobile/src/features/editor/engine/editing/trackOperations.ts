import type { TimelineTrack } from '../../types/track.types'

export function updateTrackById(
  tracks: TimelineTrack[],
  trackId: string,
  patch: Partial<TimelineTrack>,
) {
  return tracks.map((track) =>
    track.id === trackId ? { ...track, ...patch } : track,
  )
}

