import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Grid3X3, SlidersHorizontal } from 'lucide-react-native'
import { useCreativeTools } from '../../hooks/useCreativeTools'
import { EditorColors, EditorRadius, EditorShadows, EditorSpacing, EditorTypography } from '../../theme/editorTokens'
import { EditorControlButton } from '../controls'
import { AddStickerButton } from './AddStickerButton'
import { AddTextButton } from './AddTextButton'
import { FilterToolButton } from './FilterToolButton'
import { TransitionToolButton } from './TransitionToolButton'

export function CreativeToolDock() {
  const {
    addTextClip,
    addStickerClip,
    openInspector,
    safeAreaEnabled,
    setSafeAreaEnabled,
  } = useCreativeTools()

  return (
    <View style={styles.root}>
      <Text style={styles.label}>Creative</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <AddTextButton onPress={addTextClip} />
        <AddStickerButton onPress={addStickerClip} />
        <FilterToolButton onPress={() => openInspector('filter')} />
        <TransitionToolButton onPress={() => openInspector('transition')} />
        <EditorControlButton Icon={SlidersHorizontal} label="Inspector" onPress={() => openInspector('clip')} variant="filled" />
        <EditorControlButton Icon={Grid3X3} label="Safe" active={safeAreaEnabled} onPress={() => setSafeAreaEnabled(!safeAreaEnabled)} variant="filled" />
      </ScrollView>
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
  label: {
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.sm,
    fontWeight: '900',
    marginBottom: EditorSpacing.sm,
  },
  row: {
    gap: EditorSpacing.sm,
    paddingRight: EditorSpacing.md,
  },
})
