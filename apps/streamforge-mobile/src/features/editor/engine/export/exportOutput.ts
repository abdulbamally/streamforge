import type { ExportFormat, ExportOutput, RenderJob } from '../../types/export.types'

export function sanitizeFileNamePart(value: string): string {
  return value
    .trim()
    .replace(/[^a-z0-9_-]+/gi, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 48) || 'Project'
}

export function createOutputFileName(
  projectTitle: string,
  format: ExportFormat,
  date = new Date(),
): string {
  const stamp = date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace('T', '_')
    .slice(0, 15)
  return `StreamForge_${sanitizeFileNamePart(projectTitle)}_${stamp}.${format}`
}

export function createExportOutput(job: RenderJob, uri: string, fileName: string): ExportOutput {
  return {
    id: `output-${job.id}`,
    jobId: job.id,
    uri,
    fileName,
    duration: job.renderPlan?.duration,
    width: job.renderPlan?.width,
    height: job.renderPlan?.height,
    fps: job.renderPlan?.fps,
    format: job.settings.format,
    createdAt: new Date().toISOString(),
  }
}
