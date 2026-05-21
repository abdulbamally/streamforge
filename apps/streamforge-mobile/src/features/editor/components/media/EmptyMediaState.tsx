import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { FolderPlus } from 'lucide-react-native'
import { EditorColors, EditorRadius, EditorSpacing, EditorTypography } from '../../theme/editorTokens'

export function EmptyMediaState() {
  return (
    <View style={styles.root}>
      <FolderPlus size={22} color={EditorColors.textTertiary} />
      <Text style={styles.title}>No media yet</Text>
      <Text style={styles.copy}>Import video, audio, or image assets to start building the timeline.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: EditorSpacing.xs,
    minHeight: 112,
    borderRadius: EditorRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: EditorColors.borderStrong,
    backgroundColor: EditorColors.surfaceSoft,
    padding: EditorSpacing.md,
  },
  title: {
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.sm,
    fontWeight: '800',
  },
  copy: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
})
