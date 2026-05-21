import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { FileAudio2, FileImage, FileVideo2 } from 'lucide-react-native'
import type { MediaAsset } from '../../types/media.types'
import { EditorColors, EditorRadius } from '../../theme/editorTokens'

type MediaAssetPreviewProps = {
  asset: MediaAsset
}

export function MediaAssetPreview({ asset }: MediaAssetPreviewProps) {
  const thumbnailUri = asset.thumbnailUri ?? (asset.type === 'image' ? asset.uri : undefined)
  const Icon = asset.type === 'audio' ? FileAudio2 : asset.type === 'image' ? FileImage : FileVideo2

  return (
    <View style={styles.root}>
      {thumbnailUri ? (
        <Image source={{ uri: thumbnailUri }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder}>
          <Icon size={22} color={EditorColors.textSecondary} />
          <Text style={styles.placeholderText}>{asset.type}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    width: 74,
    height: 54,
    borderRadius: EditorRadius.sm,
    overflow: 'hidden',
    backgroundColor: EditorColors.surfaceSoft,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#edf2f7',
  },
  placeholderText: {
    marginTop: 2,
    color: EditorColors.textTertiary,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
})
