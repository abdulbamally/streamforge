import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useEditorStore } from '../../store/editorStore'
import { getVisibleClips, getVisibleTracks } from '../../engine/timeline/timelineVirtualization'
import { EditorColors, EditorRadius, EditorSpacing, EditorTypography } from '../../theme/editorTokens'

export function TimelineDebugPanel() {
  const playback = useEditorStore((state) => state.playback)
  const timeline = useEditorStore((state) => state.timeline)
  const selection = useEditorStore((state) => state.selection)
  const activeGesture = useEditorStore((state) => state.gestures.activeGesture)
  const history = useEditorStore((state) => state.history)
  const media = useEditorStore((state) => state.media)
  const tracks = useEditorStore((state) => state.tracks)
  const playheadX =
    playback.currentTime * timeline.pixelsPerSecond - timeline.scrollOffsetX
  const selectedClip = tracks
    .flatMap((track) => track.clips)
    .find((clip) => clip.id === selection.selectedClipId)
  const visibleTracks = getVisibleTracks(tracks, timeline.scrollOffsetY, timeline.viewportHeight)
  const visibleClips = getVisibleClips(tracks, timeline.visibleStartTime, timeline.visibleEndTime)

  return (
    <View style={styles.root}>
      <Text style={styles.item}>time {playback.currentTime.toFixed(2)}</Text>
      <Text style={styles.item}>duration {playback.duration.toFixed(1)}</Text>
      <Text style={styles.item}>playing {playback.isPlaying ? 'yes' : 'no'}</Text>
      <Text style={styles.item}>seeking {playback.isSeeking ? 'yes' : 'no'}</Text>
      <Text style={styles.item}>scrub {playback.isScrubbing ? 'yes' : 'no'}</Text>
      <Text style={styles.item}>status {playback.playbackStatus}</Text>
      <Text style={styles.item}>zoom {timeline.zoomLevel.toFixed(2)}</Text>
      <Text style={styles.item}>pps {timeline.pixelsPerSecond.toFixed(1)}</Text>
      <Text style={styles.item}>scroll {timeline.scrollOffsetX.toFixed(0)}</Text>
      <Text style={styles.item}>
        visible {timeline.visibleStartTime.toFixed(1)}-{timeline.visibleEndTime.toFixed(1)}
      </Text>
      <Text style={styles.item}>playheadX {playheadX.toFixed(0)}</Text>
      <Text style={styles.item}>auto {timeline.autoScrollEnabled ? 'on' : 'off'}</Text>
      <Text style={styles.item}>clip {selection.selectedClipId ?? 'none'}</Text>
      <Text style={styles.item}>asset {media.selectedAssetId ?? 'none'}</Text>
      <Text style={styles.item}>assets {media.assetOrder.length}</Text>
      <Text style={styles.item}>clipAsset {selectedClip?.assetId ?? 'none'}</Text>
      <Text style={styles.item}>visual {selectedClip?.visualStatus ?? 'none'}</Text>
      <Text style={styles.item}>thumbs {selectedClip?.thumbnailUris?.length ?? 0}</Text>
      <Text style={styles.item}>wave {selectedClip?.waveformData?.samples.length ?? 0}</Text>
      <Text style={styles.item}>visibleClips {visibleClips.length}</Text>
      <Text style={styles.item}>visibleTracks {visibleTracks.length}</Text>
      <Text style={styles.item}>track {selection.selectedTrackId ?? 'none'}</Text>
      <Text style={styles.item}>tool {selection.activeTool}</Text>
      <Text style={styles.item}>gesture {activeGesture}</Text>
      <Text style={styles.item}>snap {timeline.activeSnapGuide?.type ?? 'none'}</Text>
      <Text style={styles.item}>snapping {timeline.isSnappingEnabled ? 'on' : 'off'}</Text>
      <Text style={styles.item}>undo {history.undoStack.length}</Text>
      <Text style={styles.item}>redo {history.redoStack.length}</Text>
      <Text style={styles.item}>canUndo {history.canUndo ? 'yes' : 'no'}</Text>
      <Text style={styles.item}>canRedo {history.canRedo ? 'yes' : 'no'}</Text>
      <Text style={styles.item}>last {history.lastEditCommand?.type ?? 'none'}</Text>
      <Text style={styles.item}>error {history.validationError ?? 'none'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: EditorSpacing.xs,
    borderRadius: EditorRadius.md,
    borderWidth: 1,
    borderColor: EditorColors.border,
    backgroundColor: EditorColors.surfaceSoft,
    padding: EditorSpacing.sm,
    marginTop: EditorSpacing.sm,
  },
  item: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.micro,
    fontWeight: '700',
  },
})
