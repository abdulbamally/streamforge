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
  const property = useEditorStore((state) => state.property)
  const exportState = useEditorStore((state) => state.export)
  const tracks = useEditorStore((state) => state.tracks)
  const playheadX =
    playback.currentTime * timeline.pixelsPerSecond - timeline.scrollOffsetX
  const selectedClip = tracks
    .flatMap((track) => track.clips)
    .find((clip) => clip.id === selection.selectedClipId)
  const visibleTracks = getVisibleTracks(tracks, timeline.scrollOffsetY, timeline.viewportHeight)
  const visibleClips = getVisibleClips(tracks, timeline.visibleStartTime, timeline.visibleEndTime)
  const activeExportJob = exportState.activeJobId
    ? exportState.renderJobs[exportState.activeJobId] ?? null
    : null
  const activeCommandPlan = exportState.activeJobId
    ? exportState.commandPlans[exportState.activeJobId] ?? null
    : null

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
      <Text style={styles.item}>type {selectedClip?.type ?? 'none'}</Text>
      <Text style={styles.item}>tx {selectedClip?.transform?.x.toFixed(2) ?? 'n/a'}</Text>
      <Text style={styles.item}>ty {selectedClip?.transform?.y.toFixed(2) ?? 'n/a'}</Text>
      <Text style={styles.item}>scale {selectedClip?.transform?.scale.toFixed(2) ?? 'n/a'}</Text>
      <Text style={styles.item}>rot {selectedClip?.transform?.rotation.toFixed(0) ?? 'n/a'}</Text>
      <Text style={styles.item}>opacity {selectedClip?.opacity?.toFixed(2) ?? 'n/a'}</Text>
      <Text style={styles.item}>volume {selectedClip?.volume?.toFixed(2) ?? 'n/a'}</Text>
      <Text style={styles.item}>text {selectedClip?.text?.content?.slice(0, 12) ?? 'none'}</Text>
      <Text style={styles.item}>filters {selectedClip?.filters?.length ?? 0}</Text>
      <Text style={styles.item}>transitions {selectedClip?.transitions?.length ?? 0}</Text>
      <Text style={styles.item}>inspector {property.inspectorOpen ? property.inspectorMode : 'closed'}</Text>
      <Text style={styles.item}>tab {property.selectedPropertyTab}</Text>
      <Text style={styles.item}>safe {property.safeAreaEnabled ? 'on' : 'off'}</Text>
      <Text style={styles.item}>transformGesture {property.activeTransformGesture}</Text>
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
      <Text style={styles.item}>export {exportState.exportSettings.resolution}/{exportState.exportSettings.fps}/{exportState.exportSettings.quality}</Text>
      <Text style={styles.item}>job {exportState.activeJobId ?? 'none'}</Text>
      <Text style={styles.item}>jobStatus {activeExportJob?.status ?? 'none'}</Text>
      <Text style={styles.item}>jobProgress {Math.round((activeExportJob?.progress ?? 0) * 100)}%</Text>
      <Text style={styles.item}>instructions {activeExportJob?.renderPlan?.instructions.length ?? 0}</Text>
      <Text style={styles.item}>unsupported {activeExportJob?.renderPlan?.unsupportedFeatures.length ?? 0}</Text>
      <Text style={styles.item}>ffmpeg {activeCommandPlan?.command ? activeCommandPlan.command.slice(0, 32) : 'none'}</Text>
      <Text style={styles.item}>exportErrors {exportState.lastValidation?.errors.length ?? 0}</Text>
      <Text style={styles.item}>exportWarnings {exportState.lastValidation?.warnings.length ?? 0}</Text>
      <Text style={styles.item}>output {activeExportJob?.output?.uri ?? 'none'}</Text>
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
