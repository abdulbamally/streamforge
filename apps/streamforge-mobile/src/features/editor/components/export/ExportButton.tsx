import React from 'react'
import { Download } from 'lucide-react-native'
import { EditorControlButton } from '../controls/EditorControlButton'

type ExportButtonProps = {
  disabled?: boolean
  onPress: () => void
}

export function ExportButton({ disabled = false, onPress }: ExportButtonProps) {
  return (
    <EditorControlButton
      Icon={Download}
      label="Export"
      onPress={onPress}
      disabled={disabled}
      variant="accent"
    />
  )
}
