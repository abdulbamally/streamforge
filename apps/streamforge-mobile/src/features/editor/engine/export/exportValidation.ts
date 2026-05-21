import type { ExportSettings, ExportValidationIssue, ExportValidationResult } from '../../types/export.types'
import type { ProjectSnapshot } from '../../types/serialization.types'
import { EXPORT_FORMATS, EXPORT_FPS_OPTIONS } from './exportSettings'

function issue(
  severity: ExportValidationIssue['severity'],
  code: string,
  message: string,
  extra: Partial<ExportValidationIssue> = {},
): ExportValidationIssue {
  return { severity, code, message, ...extra }
}

export function validateExportSettings(settings: ExportSettings): ExportValidationIssue[] {
  const errors: ExportValidationIssue[] = []
  if (!EXPORT_FORMATS.includes(settings.format)) {
    errors.push(issue('error', 'UNSUPPORTED_FORMAT', 'Choose a supported export format.'))
  }
  if (!EXPORT_FPS_OPTIONS.includes(settings.fps)) {
    errors.push(issue('error', 'UNSUPPORTED_FPS', 'Choose a supported frame rate.'))
  }
  return errors
}

export function validateProjectForExport(
  snapshot: ProjectSnapshot,
  settings: ExportSettings,
): ExportValidationResult {
  const errors: ExportValidationIssue[] = []
  const warnings: ExportValidationIssue[] = []

  errors.push(...validateExportSettings(settings))

  if (!snapshot.projectId) {
    errors.push(issue('error', 'MISSING_PROJECT', 'Project metadata is missing.'))
  }
  if (snapshot.duration <= 0) {
    errors.push(issue('error', 'EMPTY_DURATION', 'Project duration must be greater than zero.'))
  }

  let hasVisibleVisualClip = false
  snapshot.tracks.forEach((track) => {
    track.clips.forEach((clip) => {
      if (clip.startTime < 0) {
        errors.push(issue('error', 'NEGATIVE_CLIP_TIME', 'Timeline clips cannot start before zero.', {
          clipId: clip.id,
          trackId: track.id,
        }))
      }
      if (clip.duration <= 0 || clip.trimEnd < clip.trimStart) {
        errors.push(issue('error', 'INVALID_CLIP_DURATION', 'Timeline clips must have valid durations.', {
          clipId: clip.id,
          trackId: track.id,
        }))
      }
      if (clip.assetId && !snapshot.mediaAssets[clip.assetId]) {
        errors.push(issue('error', 'MISSING_MEDIA_ASSET', 'A timeline clip references missing media.', {
          clipId: clip.id,
          trackId: track.id,
          assetId: clip.assetId,
        }))
      }
      const uri = clip.assetId ? snapshot.mediaAssets[clip.assetId]?.uri : clip.sourceUri
      if ((clip.type === 'video' || clip.type === 'audio' || clip.type === 'image') && !uri) {
        errors.push(issue('error', 'MISSING_MEDIA_URI', 'A media clip has no usable source URI.', {
          clipId: clip.id,
          trackId: track.id,
          assetId: clip.assetId,
        }))
      }
      if (track.isVisible && (clip.type === 'video' || clip.type === 'image')) {
        hasVisibleVisualClip = true
      }
      if (clip.type === 'text' || clip.type === 'sticker' || clip.filters?.length || clip.transitions?.length) {
        warnings.push(issue('warning', 'LIMITED_CREATIVE_RENDERING', 'Some creative features are not included in Phase 7 exports yet.', {
          clipId: clip.id,
          trackId: track.id,
        }))
      }
    })
  })

  if (!hasVisibleVisualClip) {
    errors.push(issue('error', 'NO_VISIBLE_MEDIA', 'Add at least one visible video or image clip before exporting.'))
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}
