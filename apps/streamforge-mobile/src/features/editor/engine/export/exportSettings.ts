import type {
  ExportFormat,
  ExportQuality,
  ExportResolution,
  ExportSettings,
} from '../../types/export.types'
import { DEFAULT_EXPORT_SETTINGS } from '../../types/export.types'

export const EXPORT_RESOLUTION_DIMENSIONS: Record<
  Exclude<ExportResolution, 'source'>,
  { width: number; height: number }
> = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '1440p': { width: 2560, height: 1440 },
  '4k': { width: 3840, height: 2160 },
}

export const EXPORT_FPS_OPTIONS = [24, 30, 60]

export const EXPORT_FORMATS: ExportFormat[] = ['mp4', 'mov']

export const EXPORT_QUALITIES: ExportQuality[] = [
  'draft',
  'standard',
  'high',
  'maximum',
]

export function mergeExportSettings(
  current: ExportSettings,
  patch: Partial<ExportSettings>,
): ExportSettings {
  return {
    ...DEFAULT_EXPORT_SETTINGS,
    ...current,
    ...patch,
  }
}

export function getExportDimensions(
  settings: ExportSettings,
  source: { width: number; height: number },
) {
  if (settings.resolution === 'source') return source
  return EXPORT_RESOLUTION_DIMENSIONS[settings.resolution]
}
