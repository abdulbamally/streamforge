import type { RenderJob } from '../../types/export.types'

export function getQueuedJobs(renderJobs: Record<string, RenderJob>): RenderJob[] {
  return Object.values(renderJobs)
    .filter((job) => job.status === 'queued')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export function getActiveRenderJob(renderJobs: Record<string, RenderJob>, activeJobId: string | null) {
  return activeJobId ? renderJobs[activeJobId] ?? null : null
}
