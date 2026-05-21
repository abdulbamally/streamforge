import type {
  ExportOutput,
  ExportSettings,
  ExportValidationResult,
  RenderJob,
} from '../types/export.types'
import { DEFAULT_EXPORT_SETTINGS } from '../types/export.types'
import type { FFmpegCommandPlan } from '../types/render.types'
import type { ProjectSnapshot } from '../types/serialization.types'

export type ExportSlice = {
  exportSettings: ExportSettings
  activeJobId: string | null
  renderJobs: Record<string, RenderJob>
  exportOutputs: Record<string, ExportOutput>
  commandPlans: Record<string, FFmpegCommandPlan>
  projectSnapshots: Record<string, ProjectSnapshot>
  lastValidation: ExportValidationResult | null
  isExportSettingsOpen: boolean
  isExporting: boolean
  exportCompleteOpen: boolean
  lastExportError: string | null
}

export const initialExportSlice: ExportSlice = {
  exportSettings: DEFAULT_EXPORT_SETTINGS,
  activeJobId: null,
  renderJobs: {},
  exportOutputs: {},
  commandPlans: {},
  projectSnapshots: {},
  lastValidation: null,
  isExportSettingsOpen: false,
  isExporting: false,
  exportCompleteOpen: false,
  lastExportError: null,
}
