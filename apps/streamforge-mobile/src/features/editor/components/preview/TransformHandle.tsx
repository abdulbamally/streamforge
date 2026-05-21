import React from 'react'
import { StyleSheet, View } from 'react-native'

type TransformHandleProps = {
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'rotate'
}

export function TransformHandle({ position }: TransformHandleProps) {
  return <View style={[styles.handle, styles[position]]} />
}

const styles = StyleSheet.create({
  handle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(79,70,229,0.86)',
  },
  topLeft: {
    top: -6,
    left: -6,
  },
  topRight: {
    top: -6,
    right: -6,
  },
  bottomLeft: {
    bottom: -6,
    left: -6,
  },
  bottomRight: {
    bottom: -6,
    right: -6,
  },
  rotate: {
    top: -34,
    left: '50%',
    marginLeft: -6,
  },
})
