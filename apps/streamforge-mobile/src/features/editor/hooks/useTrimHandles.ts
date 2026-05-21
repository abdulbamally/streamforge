import { useSelectedClip } from './useSelectedClip'

export function useTrimHandles() {
  const { clip, track } = useSelectedClip()
  return {
    showTrimHandles: !!clip && !!track && !track.isLocked,
    clip,
    track,
  }
}

