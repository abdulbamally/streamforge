import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { ArrowLeft, FolderUp } from 'lucide-react-native'
import { ExportButton } from '../export/ExportButton'
import {
  EditorColors,
  EditorSpacing,
  EditorTypography,
} from '../../theme/editorTokens'
import { EditorControlButton } from './EditorControlButton'

type TopToolbarProps = {
  title: string
  clipCount: number
  canExport: boolean
  onBack: () => void
  onImport: () => void
  onExport: () => void
}

export function TopToolbar({
  title,
  clipCount,
  canExport,
  onBack,
  onImport,
  onExport,
}: TopToolbarProps) {
  return (
    <View style={styles.root}>
      <EditorControlButton Icon={ArrowLeft} onPress={onBack} />
      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {clipCount} clip{clipCount === 1 ? '' : 's'}
        </Text>
      </View>
      <View style={styles.actions}>
        <EditorControlButton Icon={FolderUp} label="Import" onPress={onImport} />
        <ExportButton onPress={onExport} disabled={!canExport} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EditorSpacing.sm,
    paddingHorizontal: EditorSpacing.lg,
    paddingBottom: EditorSpacing.md,
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.lg,
    fontWeight: '800',
  },
  subtitle: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.xs,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EditorSpacing.sm,
  },
})
