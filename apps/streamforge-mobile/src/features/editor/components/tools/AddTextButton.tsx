import React from 'react'
import { Type } from 'lucide-react-native'
import { EditorControlButton } from '../controls'

type Props = {
  onPress: () => void
}

export function AddTextButton({ onPress }: Props) {
  return <EditorControlButton Icon={Type} label="Text" onPress={onPress} variant="filled" />
}
