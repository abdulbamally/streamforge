export type SyncPhase = 'idle' | 'scrubbing' | 'playback' | 'seeking'

export type SynchronizationState = {
  phase: SyncPhase
  lastCommittedTime: number
}

export const initialSynchronizationState: SynchronizationState = {
  phase: 'idle',
  lastCommittedTime: 0,
}
