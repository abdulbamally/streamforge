import React from 'react'
import { Line } from '@shopify/react-native-skia'
import type { TimelineClip } from '../types/clip.types'
import { generatePlaceholderWaveform } from '../engine/media/waveformService'

export function drawWaveforms(
  clip: TimelineClip,
  x: number,
  y: number,
  width: number,
  height: number,
): React.ReactNode[] {
  const waveform = clip.waveformData ?? generatePlaceholderWaveform(clip.assetId ?? clip.id, clip.duration)
  const targetBars = Math.max(8, Math.min(96, Math.floor(width / 4)))
  const step = Math.max(1, Math.floor(waveform.samples.length / targetBars))
  const samples = waveform.samples.filter((_, index) => index % step === 0).slice(0, targetBars)
  const centerY = y + height / 2
  const maxBar = Math.max(4, height * 0.38)

  return samples.map((sample, index) => {
    const barX = x + 8 + (index / Math.max(1, samples.length - 1)) * Math.max(0, width - 16)
    const barHeight = Math.max(3, sample * maxBar)
    return React.createElement(Line, {
      key: `${clip.id}-wave-${index}`,
      p1: { x: barX, y: centerY - barHeight },
      p2: { x: barX, y: centerY + barHeight },
      color: waveform.status === 'error' ? 'rgba(220,38,38,0.6)' : 'rgba(22,101,52,0.58)',
      strokeWidth: width > 140 ? 2 : 1.5,
    })
  })
}
