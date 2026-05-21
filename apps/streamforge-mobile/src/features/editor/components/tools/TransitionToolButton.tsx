import React from 'react'
import { BetweenHorizontalStart } from 'lucide-react-native'
import { EditorControlButton } from '../controls'

type Props = {
  onPress: () => void
}

export function TransitionToolButton({ onPress }: Props) {
  return <EditorControlButton Icon={BetweenHorizontalStart} label="Transitions" onPress={onPress} variant="filled" />
}
