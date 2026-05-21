import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { MediaAsset } from '../../types/media.types'
import { formatDuration, formatFileSize } from '../../engine/media/mediaAssetManager'
import { EditorColors, EditorRadius, EditorSpacing, EditorTypography } from '../../theme/editorTokens'
import { MediaAssetPreview } from './MediaAssetPreview'

type MediaAssetCardProps = {
  asset: MediaAsset
  selected: boolean
  onPress: () => void
}

export function MediaAssetCard({ asset, selected, onPress }: MediaAssetCardProps) {
  return (
    <Pressable style={[styles.root, selected && styles.selected]} onPress={onPress}>
      <MediaAssetPreview asset={asset} />
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>{asset.name}</Text>
          <Text style={styles.badge}>{asset.type}</Text>
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {formatDuration(asset.duration)} {formatFileSize(asset.fileSize)}
        </Text>
        <Text style={styles.status}>{asset.metadataStatus}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: {
    width: 220,
    borderRadius: EditorRadius.md,
    borderWidth: 1,
    borderColor: EditorColors.border,
    backgroundColor: EditorColors.surfaceSoft,
    flexDirection: 'row',
    gap: EditorSpacing.sm,
    padding: EditorSpacing.sm,
  },
  selected: {
    borderColor: EditorColors.accent,
    backgroundColor: EditorColors.accentSoft,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EditorSpacing.xs,
  },
  name: {
    flex: 1,
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.xs,
    fontWeight: '900',
  },
  badge: {
    color: EditorColors.accent,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  meta: {
    marginTop: EditorSpacing.xxs,
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.micro,
    fontWeight: '700',
  },
  status: {
    marginTop: EditorSpacing.xxs,
    color: EditorColors.textTertiary,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
})
