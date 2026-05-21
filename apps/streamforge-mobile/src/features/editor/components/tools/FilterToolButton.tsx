import React from 'react'
import { SlidersHorizontal } from 'lucide-react-native'
import { EditorControlButton } from '../controls'

type Props = {
  onPress: () => void
}

export function FilterToolButton({ onPress }: Props) {
  return <EditorControlButton Icon={SlidersHorizontal} label="Filters" onPress={onPress} variant="filled" />
}
