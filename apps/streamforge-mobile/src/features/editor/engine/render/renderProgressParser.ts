export function calculateProgressFromTime(renderedSeconds: number, totalDuration: number): number {
  if (totalDuration <= 0) return 0
  return Math.max(0, Math.min(renderedSeconds / totalDuration, 1))
}

export function parseFFmpegProgressTime(logLine: string): number | null {
  const match = logLine.match(/time=(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)/)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  const seconds = Number(match[3])
  return hours * 3600 + minutes * 60 + seconds
}
