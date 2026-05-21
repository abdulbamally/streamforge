import { useEditorStore } from '../store/editorStore'

export function useVisibleTimelineRange() {
  return useEditorStore((state) => ({
    visibleStartTime: state.timeline.visibleStartTime,
    visibleEndTime: state.timeline.visibleEndTime,
  }))
}
