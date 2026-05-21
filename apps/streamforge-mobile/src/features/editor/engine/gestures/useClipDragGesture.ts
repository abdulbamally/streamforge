import { useMemo, useRef } from 'react'
import { Gesture } from 'react-native-gesture-handler'
import { useSharedValue } from 'react-native-reanimated'
import { createEditCommand } from '../editing/editCommands'
import { useEditorStore } from '../../store/editorStore'
import { useScrubbingSync } from '../synchronization/useScrubbingSync'
import { RULER_HEIGHT } from '../timeline/timelineConstants'
import { findClipAtPoint } from '../timeline/timelineHitTesting'
import { timeToX, xToTime } from '../timeline/timelineMath'
import type { TimelineMetrics } from '../../types/timeline.types'
import type { EditCommandSnapshot } from '../../types/editCommand.types'

export function useClipDragGesture(metrics: TimelineMetrics) {
  const scrub = useScrubbingSync(metrics)
  const dragClipId = useRef<string | null>(null)
  const mode = useRef<'clip' | 'trim-left' | 'trim-right' | 'scrub' | 'pan' | null>(null)
  const beforeState = useRef<EditCommandSnapshot | null>(null)
  const finalTime = useRef(0)
  const startClipTime = useSharedValue(0)
  const startClipEndTime = useSharedValue(0)
  const startScrollX = useSharedValue(0)

  return useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .onBegin((event) => {
          const state = useEditorStore.getState()
          const hit = findClipAtPoint(event.x, event.y, state.tracks, metrics)
          const playheadX = timeToX(
            state.playback.currentTime,
            state.timeline.pixelsPerSecond,
            state.timeline.scrollOffsetX,
          )
          const hitPlayhead = Math.abs(event.x - playheadX) <= 18
          const hitRuler = event.y <= RULER_HEIGHT

          if (hitRuler || hitPlayhead) {
            mode.current = 'scrub'
            dragClipId.current = null
            scrub.beginScrub(event.x)
            return
          }

          if ((hit.type === 'trim-left' || hit.type === 'trim-right') && !hit.track.isLocked) {
            mode.current = hit.type
            dragClipId.current = hit.clip.id
            startClipTime.value = hit.clip.startTime
            startClipEndTime.value = hit.clip.startTime + hit.clip.duration
            finalTime.current = hit.type === 'trim-left' ? hit.clip.startTime : hit.clip.startTime + hit.clip.duration
            beforeState.current = {
              tracks: state.tracks,
              selectedClipId: state.selection.selectedClipId,
              selectedTrackId: state.selection.selectedTrackId,
              duration: state.playback.duration,
            }
            state.selectClip(hit.clip.id)
            state.setDragClipId(hit.clip.id)
            state.setActiveGesture(hit.type === 'trim-left' ? 'trim-start' : 'trim-end')
            return
          }

          if (hit.type === 'clip' && !hit.track.isLocked) {
            mode.current = 'clip'
            dragClipId.current = hit.clip.id
            startClipTime.value = hit.clip.startTime
            finalTime.current = hit.clip.startTime
            beforeState.current = {
              tracks: state.tracks,
              selectedClipId: state.selection.selectedClipId,
              selectedTrackId: state.selection.selectedTrackId,
              duration: state.playback.duration,
            }
            state.selectClip(hit.clip.id)
            state.setDragClipId(hit.clip.id)
            state.setIsDraggingClip(true)
            state.setActiveGesture('clip-drag')
            return
          }

          mode.current = 'pan'
          dragClipId.current = null
          startScrollX.value = state.timeline.scrollOffsetX
          state.setActiveGesture('timeline-pan')
        })
        .onUpdate((event) => {
          const state = useEditorStore.getState()
          if (mode.current === 'scrub') {
            scrub.updateScrub(event.x)
            return
          }
          if (mode.current === 'clip' && dragClipId.current) {
            const deltaTime = event.translationX / state.timeline.pixelsPerSecond
            const targetTime = startClipTime.value + deltaTime
            const applied = state.previewEditCommand('MOVE_CLIP', {
              clipId: dragClipId.current,
              startTime: targetTime,
            })
            if (applied) finalTime.current = targetTime
            return
          }
          if (mode.current === 'trim-left' && dragClipId.current) {
            const deltaTime = event.translationX / state.timeline.pixelsPerSecond
            const targetTime = startClipTime.value + deltaTime
            const applied = state.previewEditCommand('TRIM_CLIP_START', {
              clipId: dragClipId.current,
              time: targetTime,
            })
            if (applied) finalTime.current = targetTime
            return
          }
          if (mode.current === 'trim-right' && dragClipId.current) {
            const deltaTime = event.translationX / state.timeline.pixelsPerSecond
            const targetTime = startClipEndTime.value + deltaTime
            const applied = state.previewEditCommand('TRIM_CLIP_END', {
              clipId: dragClipId.current,
              time: targetTime,
            })
            if (applied) finalTime.current = targetTime
            return
          }
          state.setScrollOffsetX(startScrollX.value - event.translationX)
        })
        .onFinalize(() => {
          const state = useEditorStore.getState()
          if (mode.current === 'scrub') {
            scrub.endScrub()
          }
          if (mode.current === 'clip' && dragClipId.current && beforeState.current) {
            state.executeCommand({
              ...createEditCommand('MOVE_CLIP', {
                clipId: dragClipId.current,
                startTime: finalTime.current,
              }),
              beforeState: beforeState.current,
            })
          }
          if (mode.current === 'trim-left' && dragClipId.current && beforeState.current) {
            state.executeCommand({
              ...createEditCommand('TRIM_CLIP_START', {
                clipId: dragClipId.current,
                time: finalTime.current,
              }),
              beforeState: beforeState.current,
            })
          }
          if (mode.current === 'trim-right' && dragClipId.current && beforeState.current) {
            state.executeCommand({
              ...createEditCommand('TRIM_CLIP_END', {
                clipId: dragClipId.current,
                time: finalTime.current,
              }),
              beforeState: beforeState.current,
            })
          }
          dragClipId.current = null
          mode.current = null
          beforeState.current = null
          state.clearActiveSnapGuide()
          state.setDragClipId(null)
          state.setIsDraggingClip(false)
          if (!state.gestures.isScrubbingPlayhead) {
            state.setActiveGesture('none')
          }
        }),
    [metrics, scrub, startClipEndTime, startClipTime, startScrollX],
  )
}

export function selectAtTimelinePoint(x: number, y: number, metrics: TimelineMetrics) {
  const state = useEditorStore.getState()
  const hit = findClipAtPoint(x, y, state.tracks, metrics)

  if (hit.type === 'clip' || hit.type === 'trim-left' || hit.type === 'trim-right') {
    state.selectClip(hit.clip.id)
    state.selectTrack(hit.track.id)
    return
  }

  if (hit.type === 'track' || hit.type === 'track-control') {
    state.clearSelection()
    state.selectTrack(hit.track.id)
    state.seekTo(xToTime(x, metrics.pixelsPerSecond, metrics.scrollOffsetX))
    return
  }

  if (hit.type === 'ruler') {
    state.clearSelection()
    state.seekTo(hit.time)
    return
  }

  state.clearSelection()
  state.seekTo(hit.time)
}
