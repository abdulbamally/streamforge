import type { TimelineClip } from '../../types/clip.types'
import type { TimelineTrack } from '../../types/track.types'
import { getClipEndTime } from './overlapDetection'

export type ClipLookup = {
  clip: TimelineClip
  track: TimelineTrack
  trackIndex: number
  clipIndex: number
}

export function findClipById(tracks: TimelineTrack[], clipId: string): ClipLookup | null {
  for (let trackIndex = 0; trackIndex < tracks.length; trackIndex += 1) {
    const track = tracks[trackIndex]
    const clipIndex = track.clips.findIndex((clip) => clip.id === clipId)
    if (clipIndex >= 0) {
      return {
        clip: track.clips[clipIndex],
        track,
        trackIndex,
        clipIndex,
      }
    }
  }
  return null
}

export function updateClipInTracks(
  tracks: TimelineTrack[],
  clipId: string,
  patch: Partial<TimelineClip>,
) {
  return tracks.map((track) => ({
    ...track,
    clips: track.clips.map((clip) =>
      clip.id === clipId ? { ...clip, ...patch } : clip,
    ),
  }))
}

export function removeClipFromTracks(tracks: TimelineTrack[], clipId: string) {
  return tracks.map((track) => ({
    ...track,
    clips: track.clips.filter((clip) => clip.id !== clipId),
  }))
}

export function replaceClipWithClips(
  tracks: TimelineTrack[],
  clipId: string,
  replacementClips: TimelineClip[],
) {
  return tracks.map((track) => ({
    ...track,
    clips: track.clips.flatMap((clip) =>
      clip.id === clipId ? replacementClips : [clip],
    ),
  }))
}

export function calculateProjectDuration(tracks: TimelineTrack[]) {
  return Math.max(
    0,
    ...tracks.flatMap((track) => track.clips.map(getClipEndTime)),
  )
}

export function sortTrackClips(tracks: TimelineTrack[]) {
  return tracks.map((track) => ({
    ...track,
    clips: [...track.clips].sort((a, b) => a.startTime - b.startTime),
  }))
}

