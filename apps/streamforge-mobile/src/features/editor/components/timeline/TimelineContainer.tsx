import React from 'react'
import { StyleSheet, View } from 'react-native'
import {
  EditorColors,
  EditorRadius,
  EditorShadows,
  EditorSpacing,
} from '../../theme/editorTokens'
import { EditToolbar } from '../controls'
import { ClipActionToolbar } from './ClipActionToolbar'
import { TimelineCanvas } from './TimelineCanvas'
import { TimelineControls } from './TimelineControls'
import { TimelineDebugPanel } from './TimelineDebugPanel'
import { TimelineHeader } from './TimelineHeader'
import { TimelineTrackControls } from './TimelineTrackControls'

export function TimelineContainer() {
  return (
    <View style={styles.root}>
      <TimelineHeader />
      <EditToolbar />
      <ClipActionToolbar />
      <TimelineControls />
      <TimelineTrackControls />
      <TimelineCanvas />
      <TimelineDebugPanel />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: EditorColors.surface,
    borderRadius: EditorRadius.lg,
    borderWidth: 1,
    borderColor: EditorColors.border,
    padding: EditorSpacing.md,
    ...EditorShadows.panel,
  },
})
