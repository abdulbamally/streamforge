import React from 'react'
import { StyleSheet, View } from 'react-native'
import {
  EditorColors,
  EditorRadius,
  EditorShadows,
  EditorSpacing,
} from '../../theme/editorTokens'
import { PlaybackControls } from '../controls'
import { NativeVideoSurface } from './NativeVideoSurface'
import { PreviewOverlay } from './PreviewOverlay'

type PreviewContainerProps = {
  sourceUri: string | null
}

export function PreviewContainer({ sourceUri }: PreviewContainerProps) {
  return (
    <View style={styles.root}>
      <View style={styles.stage}>
        <NativeVideoSurface sourceUri={sourceUri} />
        <PreviewOverlay />
        <PlaybackControls />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: EditorSpacing.lg,
  },
  stage: {
    height: '100%',
    borderRadius: EditorRadius.xl,
    backgroundColor: EditorColors.stage,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#232734',
    ...EditorShadows.panel,
  },
})
