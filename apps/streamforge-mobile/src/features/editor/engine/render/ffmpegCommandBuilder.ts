import type { ExportSettings } from '../../types/export.types'
import type { FFmpegCommandPlan, RenderPlan, TrimInstruction } from '../../types/render.types'
import { createOutputUri, resolveMediaAssetPath } from '../media/filePathResolver'

function trimInstructions(plan: RenderPlan): TrimInstruction[] {
  return plan.instructions.filter((instruction): instruction is TrimInstruction => instruction.type === 'trim')
}

function qualityArgs(settings: ExportSettings): string {
  if (settings.quality === 'draft') return '-preset ultrafast -crf 30'
  if (settings.quality === 'high') return '-preset medium -crf 20'
  if (settings.quality === 'maximum') return '-preset slow -crf 16'
  return '-preset fast -crf 23'
}

export function buildFFmpegCommand(
  renderPlan: RenderPlan,
  settings: ExportSettings,
  projectTitle = 'Project',
): FFmpegCommandPlan {
  const trims = trimInstructions(renderPlan)
  const { uri } = createOutputUri(projectTitle, settings.format)
  const outputFile = resolveMediaAssetPath(uri)
  const warnings = renderPlan.unsupportedFeatures.map((feature) => feature.message)

  if (trims.length === 0) {
    return {
      command: '',
      inputFiles: [],
      outputFile: uri,
      estimatedDuration: renderPlan.duration,
      warnings: ['No supported video instructions were generated.'],
      settings,
    }
  }

  if (trims.length === 1) {
    const clip = trims[0]
    const input = resolveMediaAssetPath(clip.inputUri)
    const command = [
      `-ss ${clip.sourceStart}`,
      `-to ${clip.sourceEnd}`,
      `-i "${input}"`,
      `-vf "scale=${renderPlan.width}:${renderPlan.height},fps=${renderPlan.fps}"`,
      qualityArgs(settings),
      settings.includeAudio ? '-c:a aac' : '-an',
      `-y "${outputFile}"`,
    ].join(' ')
    return {
      command,
      inputFiles: [clip.inputUri],
      outputFile: uri,
      estimatedDuration: clip.duration,
      warnings,
      settings,
    }
  }

  const inputs = trims.map((clip) => `-i "${resolveMediaAssetPath(clip.inputUri)}"`).join(' ')
  const concatInputs = trims
    .map((_, index) => (settings.includeAudio ? `[${index}:v][${index}:a]` : `[${index}:v]`))
    .join('')
  const outputLabels = settings.includeAudio ? '[outv][outa]' : '[outv]'
  const concat = `${concatInputs}concat=n=${trims.length}:v=1:a=${settings.includeAudio ? 1 : 0}${outputLabels}`
  const maps = settings.includeAudio ? '-map "[outv]" -map "[outa]"' : '-map "[outv]"'
  const command = [
    inputs,
    `-filter_complex "${concat}"`,
    maps,
    `-vf "scale=${renderPlan.width}:${renderPlan.height},fps=${renderPlan.fps}"`,
    qualityArgs(settings),
    settings.includeAudio ? '-c:a aac' : '-an',
    `-y "${outputFile}"`,
  ].join(' ')

  return {
    command,
    inputFiles: trims.map((clip) => clip.inputUri),
    outputFile: uri,
    estimatedDuration: renderPlan.duration,
    warnings,
    settings,
  }
}
