export type PlaybackSyncSource = 'player-progress' | 'user-scrub' | 'tap-seek' | 'control'

export type PlaybackSyncEvent = {
  source: PlaybackSyncSource
  time: number
}
