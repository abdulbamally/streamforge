import type { RenderError } from '../../types/export.types'

export function createRenderError(
  code: string,
  message: string,
  recoverable = true,
): RenderError {
  return { code, message, recoverable }
}

export function getExportErrorMessage(error?: RenderError | null): string {
  if (!error) return 'Export failed. Please try again.'
  if (error.code === 'VALIDATION_FAILED') return error.message
  if (error.code === 'EXPORT_CANCELLED') return 'Export was cancelled.'
  if (error.code === 'FFMPEG_UNAVAILABLE') {
    return 'On-device rendering is not available in this build, so StreamForge used the mock export path.'
  }
  return error.message
}
