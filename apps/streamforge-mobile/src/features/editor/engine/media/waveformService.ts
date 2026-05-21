import type { WaveformData } from '../../types/media.types'

const DEFAULT_SAMPLE_COUNT = 96

export function normalizeWaveformSamples(samples: number[]): number[] {
  const max = Math.max(0.01, ...samples.map((sample) => Math.abs(sample)))
  return samples.map((sample) => Math.max(0, Math.min(1, Math.abs(sample) / max)))
}

export function generatePlaceholderWaveform(
  assetId: string,
  duration = 10,
  resolution = DEFAULT_SAMPLE_COUNT,
): WaveformData {
  const safeResolution = Math.max(24, Math.min(240, Math.floor(resolution)))
  const samples = Array.from({ length: safeResolution }, (_, index) => {
    const progress = index / Math.max(1, safeResolution - 1)
    const pulse = Math.sin(progress * Math.PI * 12) * 0.34
    const swell = Math.sin(progress * Math.PI * 3) * 0.24
    const texture = Math.sin(index * 1.73) * 0.14
    return Math.max(0.08, Math.min(1, 0.42 + pulse + swell + texture))
  })

  return {
    assetId,
    samples: normalizeWaveformSamples(samples),
    duration,
    resolution: safeResolution,
    status: 'placeholder',
  }
}

export function getWaveformSamplesForVisibleRange(
  waveformData: WaveformData,
  visibleStart: number,
  visibleEnd: number,
): number[] {
  const duration = Math.max(0.01, waveformData.duration)
  const startRatio = Math.max(0, Math.min(1, visibleStart / duration))
  const endRatio = Math.max(startRatio, Math.min(1, visibleEnd / duration))
  const startIndex = Math.floor(startRatio * waveformData.samples.length)
  const endIndex = Math.ceil(endRatio * waveformData.samples.length)
  return waveformData.samples.slice(startIndex, Math.max(startIndex + 1, endIndex))
}
