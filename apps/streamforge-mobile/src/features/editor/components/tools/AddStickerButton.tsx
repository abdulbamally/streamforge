import React from 'react'
import { Sticker } from 'lucide-react-native'
import { EditorControlButton } from '../controls'

type Props = {
  onPress: () => void
}

export function AddStickerButton({ onPress }: Props) {
  return <EditorControlButton Icon={Sticker} label="Sticker" onPress={onPress} variant="filled" />
}
