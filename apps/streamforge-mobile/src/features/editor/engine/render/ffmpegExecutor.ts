import { isFfmpegAvailable, runFfmpeg } from '../../native/ffmpegKit'
import type { FFmpegCommandPlan } from '../../types/render.types'

export type FFmpegExecutionCallbacks = {
  onStart?: () => void
  onProgress?: (progress: number, step?: string) => void
  onComplete?: (outputUri: string) => void
  onError?: (message: string) => void
  onCancel?: () => void
}

const cancelledJobs = new Set<string>()

export function isFFmpegAvailable(): boolean {
  return isFfmpegAvailable
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export async function executeFFmpegCommand(
  jobId: string,
  commandPlan: FFmpegCommandPlan,
  callbacks: FFmpegExecutionCallbacks = {},
): Promise<{ success: boolean; outputUri?: string; error?: string; mocked: boolean }> {
  cancelledJobs.delete(jobId)
  callbacks.onStart?.()

  if (!isFFmpegAvailable()) {
    for (const progress of [0.12, 0.28, 0.46, 0.64, 0.82, 1]) {
      if (cancelledJobs.has(jobId)) {
        callbacks.onCancel?.()
        return { success: false, error: 'Export cancelled', mocked: true }
      }
      await delay(220)
      callbacks.onProgress?.(progress, progress >= 1 ? 'Saving output' : 'Mock rendering video')
    }
    callbacks.onComplete?.(commandPlan.outputFile)
    return { success: true, outputUri: commandPlan.outputFile, mocked: true }
  }

  const result = await runFfmpeg(commandPlan.command, (logLine) => {
    callbacks.onProgress?.(0.5, logLine)
  })
  if (cancelledJobs.has(jobId)) {
    callbacks.onCancel?.()
    return { success: false, error: 'Export cancelled', mocked: false }
  }
  if (!result.success) {
    callbacks.onError?.(result.output)
    return { success: false, error: result.output, mocked: false }
  }
  callbacks.onProgress?.(1, 'Saving output')
  callbacks.onComplete?.(commandPlan.outputFile)
  return { success: true, outputUri: commandPlan.outputFile, mocked: false }
}

export function cancelFFmpegExecution(jobId: string): void {
  cancelledJobs.add(jobId)
}
