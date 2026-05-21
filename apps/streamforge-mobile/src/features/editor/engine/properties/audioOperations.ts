export function clampVolume(volume: number): number {
  return Math.max(0, Math.min(2, volume))
}

export function clampOpacity(opacity: number): number {
  return Math.max(0, Math.min(1, opacity))
}
