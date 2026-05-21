import React, { useCallback } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Plus } from 'lucide-react-native'
import { useMediaAssets } from '../../hooks/useMediaAssets'
import { useMediaImport } from '../../hooks/useMediaImport'
import { useEditorStore } from '../../store/editorStore'
import { EditorColors, EditorRadius, EditorSpacing, EditorTypography } from '../../theme/editorTokens'
import { EmptyMediaState } from './EmptyMediaState'
import { ImportMediaButton } from './ImportMediaButton'
import { MediaAssetCard } from './MediaAssetCard'

export function MediaBin() {
  const { assets, selectedAssetId, selectedAsset, isImporting, importError } = useMediaAssets()
  const selectMediaAsset = useEditorStore((state) => state.selectMediaAsset)
  const addMediaAssetToTimeline = useEditorStore((state) => state.addMediaAssetToTimeline)
  const currentTime = useEditorStore((state) => state.playback.currentTime)
  const { importMedia } = useMediaImport()

  const handleAdd = useCallback(() => {
    if (!selectedAsset) return
    addMediaAssetToTimeline(selectedAsset.id, { startTime: currentTime })
  }, [addMediaAssetToTimeline, currentTime, selectedAsset])

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Media Bin</Text>
          <Text style={styles.subtitle}>{assets.length} assets</Text>
        </View>
        <View style={styles.actions}>
          <ImportMediaButton importing={isImporting} onPress={importMedia} />
          <Pressable
            style={[styles.addButton, !selectedAsset && styles.disabled]}
            disabled={!selectedAsset}
            onPress={handleAdd}
          >
            <Plus size={14} color={selectedAsset ? EditorColors.accent : EditorColors.textTertiary} />
            <Text style={[styles.addLabel, !selectedAsset && styles.disabledText]}>Add to Timeline</Text>
          </Pressable>
        </View>
      </View>

      {importError ? <Text style={styles.error}>{importError}</Text> : null}

      {assets.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {assets.map((asset) => (
            <MediaAssetCard
              key={asset.id}
              asset={asset}
              selected={asset.id === selectedAssetId}
              onPress={() => selectMediaAsset(asset.id)}
            />
          ))}
        </ScrollView>
      ) : (
        <EmptyMediaState />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    borderRadius: EditorRadius.lg,
    borderWidth: 1,
    borderColor: EditorColors.border,
    backgroundColor: EditorColors.surface,
    padding: EditorSpacing.md,
    gap: EditorSpacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: EditorSpacing.md,
  },
  title: {
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.md,
    fontWeight: '900',
  },
  subtitle: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.micro,
    fontWeight: '800',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EditorSpacing.xs,
  },
  addButton: {
    minHeight: 34,
    borderRadius: EditorRadius.full,
    borderWidth: 1,
    borderColor: EditorColors.border,
    backgroundColor: EditorColors.surfaceSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: EditorSpacing.xs,
    paddingHorizontal: EditorSpacing.md,
  },
  disabled: {
    opacity: 0.48,
  },
  addLabel: {
    color: EditorColors.accent,
    fontSize: EditorTypography.xs,
    fontWeight: '900',
  },
  disabledText: {
    color: EditorColors.textTertiary,
  },
  list: {
    gap: EditorSpacing.sm,
    paddingRight: EditorSpacing.md,
  },
  error: {
    color: EditorColors.danger,
    fontSize: EditorTypography.xs,
    fontWeight: '800',
  },
})
