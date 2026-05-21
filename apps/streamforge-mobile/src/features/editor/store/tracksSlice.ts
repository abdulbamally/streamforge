import type { TimelineTrack } from '../types/track.types'

export type TracksSlice = {
  tracks: TimelineTrack[]
}

export const initialTracksSlice: TracksSlice = {
  tracks: [],
}
