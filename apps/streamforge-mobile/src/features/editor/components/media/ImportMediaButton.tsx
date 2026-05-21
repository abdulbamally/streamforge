import React from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import { Upload } from 'lucide-react-native'
import { EditorColors, EditorRadius, EditorSpacing, EditorTypography } from '../../theme/editorTokens'

type ImportMediaButtonProps = {
  importing: boolean
  onPress: () => void
}

export function ImportMediaButton({ importing, onPress }: ImportMediaButtonProps) {
  return (
    <Pressable style={styles.root} onPress={onPress} disabled={importing}>
      {importing ? (
        <ActivityIndicator size="small" color={EditorColors.white} />
      ) : (
        <Upload size={15} color={EditorColors.white} />
      )}
      <Text style={styles.label}>{importing ? 'Importing' : 'Import'}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: {
    minHeight: 34,
    borderRadius: EditorRadius.full,
    backgroundColor: EditorColors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: EditorSpacing.xs,
    paddingHorizontal: EditorSpacing.md,
  },
  label: {
    color: EditorColors.white,
    fontSize: EditorTypography.xs,
    fontWeight: '900',
  },
})
