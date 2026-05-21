export type SeekRequest = {
  time: number
  requestedAt: number
}

export type ScrubSession = {
  startTime: number
  currentTime: number
  startX: number
  currentX: number
}
