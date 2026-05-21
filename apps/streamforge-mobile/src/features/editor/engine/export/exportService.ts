import type { EditorProject } from '../../types/editor.types'
import type {
  ExportOutput,
  ExportSettings,
  ExportValidationResult,
  RenderJob,
} from '../../types/export.types'
import type { MediaAsset } from '../../types/media.types'
import type { FFmpegCommandPlan, RenderPlan } from '../../types/render.types'
import type { TimelineTrack } from '../../types/track.types'
import type { ProjectSnapshot } from '../../types/serialization.types'
import { serializeProject } from '../serialization/projectSerializer'
import { validateProjectForExport } from './exportValidation'
import { createRenderPlan } from '../render/renderPlanner'
import { buildFFmpegCommand } from '../render/ffmpegCommandBuilder'
import { executeFFmpegCommand, cancelFFmpegExecution } from '../render/ffmpegExecutor'
import { createExportOutput } from './exportOutput'
import { createRenderError } from './exportErrors'

export type ExportProjectState = {
  project: EditorProject
  tracks: TimelineTrack[]
  mediaAssets: Record<string, MediaAsset>
}

export type PreparedExportJob = {
  snapshot: ProjectSnapshot
  validation: ExportValidationResult
  renderPlan: RenderPlan
  commandPlan: FFmpegCommandPlan
  job: RenderJob
}

export type ExportRunCallbacks = {
  onJobUpdate?: (jobId: string, updates: Partial<RenderJob>) => void
  onOutput?: (output: ExportOutput) => void
}

export function createExportJob(
  projectState: ExportProjectState,
  settings: ExportSettings,
): PreparedExportJob {
  const serialized = serializeProject({
    project: projectState.project,
    tracks: projectState.tracks,
    mediaAssets: projectState.mediaAssets,
    exportSettings: settings,
  })
  const validation = validateProjectForExport(serialized.snapshot, settings)
  const renderPlan = createRenderPlan(serialized.snapshot, settings)
  const commandPlan = buildFFmpegCommand(renderPlan, settings, serialized.snapshot.title)
  const job: RenderJob = {
    id: `render-job-${Date.now()}`,
    projectId: serialized.snapshot.projectId,
    snapshotId: serialized.snapshot.id,
    status: validation.valid ? 'queued' : 'failed',
    settings,
    renderPlan,
    progress: 0,
    currentStep: validation.valid ? 'Queued for export' : 'Validation failed',
    error: validation.valid
      ? undefined
      : createRenderError(
          'VALIDATION_FAILED',
          validation.errors.map((item) => item.message).join(' '),
          true,
        ),
    createdAt: new Date().toISOString(),
  }

  return {
    snapshot: serialized.snapshot,
    validation,
    renderPlan,
    commandPlan,
    job,
  }
}

export async function startExportJob(
  job: RenderJob,
  commandPlan: FFmpegCommandPlan,
  callbacks: ExportRunCallbacks = {},
): Promise<RenderJob> {
  callbacks.onJobUpdate?.(job.id, {
    status: 'preparing',
    progress: 0.04,
    currentStep: 'Preparing project',
    startedAt: new Date().toISOString(),
  })

  const result = await executeFFmpegCommand(job.id, commandPlan, {
    onStart: () => {
      callbacks.onJobUpdate?.(job.id, {
        status: 'rendering',
        progress: 0.08,
        currentStep: 'Rendering video',
      })
    },
    onProgress: (progress, step) => {
      callbacks.onJobUpdate?.(job.id, {
        status: progress >= 1 ? 'saving' : 'rendering',
        progress,
        currentStep: step ?? 'Rendering video',
      })
    },
    onCancel: () => {
      callbacks.onJobUpdate?.(job.id, {
        status: 'cancelled',
        progress: 0,
        currentStep: 'Export cancelled',
        completedAt: new Date().toISOString(),
      })
    },
  })

  if (!result.success) {
    const failedJob: RenderJob = {
      ...job,
      status: result.error === 'Export cancelled' ? 'cancelled' : 'failed',
      progress: 0,
      currentStep: result.error ?? 'Export failed',
      error: createRenderError(
        result.error === 'Export cancelled' ? 'EXPORT_CANCELLED' : 'EXPORT_FAILED',
        result.error ?? 'Export failed',
        true,
      ),
      completedAt: new Date().toISOString(),
    }
    callbacks.onJobUpdate?.(job.id, failedJob)
    return failedJob
  }

  const output = createExportOutput(job, result.outputUri ?? commandPlan.outputFile, commandPlan.outputFile.split('/').at(-1) ?? 'export.mp4')
  const completedJob: RenderJob = {
    ...job,
    status: 'completed',
    progress: 1,
    currentStep: result.mocked ? 'Mock export complete' : 'Export complete',
    output,
    completedAt: new Date().toISOString(),
  }
  callbacks.onOutput?.(output)
  callbacks.onJobUpdate?.(job.id, completedJob)
  return completedJob
}

export function cancelExportJob(jobId: string): void {
  cancelFFmpegExecution(jobId)
}

export function retryExportJob(job: RenderJob): RenderJob {
  return {
    ...job,
    id: `render-job-${Date.now()}`,
    status: 'queued',
    progress: 0,
    currentStep: 'Queued for retry',
    error: undefined,
    createdAt: new Date().toISOString(),
    startedAt: undefined,
    completedAt: undefined,
  }
}

export function getExportOutput(job: RenderJob): ExportOutput | undefined {
  return job.output
}
