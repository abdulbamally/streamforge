import { Platform } from 'react-native'
import type { EditProject } from '../engine/types'
import { isFfmpegAvailable, runFfmpeg } from '../native/ffmpegKit'

export type ExportProgressCallback = (progress: number) => void

export async function exportProject(
  project: EditProject,
  onProgress?: ExportProgressCallback,
): Promise<{ success: boolean; outputUri: string; error?: string }> {
  if (!project.clips.length) {
    return { success: false, outputUri: '', error: 'No clips to export' }
  }

  const sorted = [...project.clips].sort((a, b) => a.timelineStart - b.timelineStart)

  onProgress?.(5)

  if (!isFfmpegAvailable) {
    if (sorted.length === 1) {
      onProgress?.(100)
      const clip = sorted[0]
      return {
        success: true,
        outputUri: clip.sourceUri,
        error:
          'Exported source file without re-encoding (trim/split not baked in). Link FFmpeg for full export.',
      }
    }
    return {
      success: false,
      outputUri: '',
      error:
        'Multi-clip export needs FFmpeg native binaries. See android/README-ffmpeg.md or use a cloud project.',
    }
  }

  const out =
    Platform.OS === 'android'
      ? `/tmp/sf_export_${project.id}.mp4`
      : `file:///tmp/sf_export_${project.id}.mp4`

  if (sorted.length === 1) {
    const c = sorted[0]
    const cmd = `-ss ${c.sourceStart} -to ${c.sourceEnd} -i "${c.sourceUri}" -c copy -y "${out}"`
    const { success, output } = await runFfmpeg(cmd, () => onProgress?.(50))
    onProgress?.(100)
    return success
      ? { success: true, outputUri: out }
      : { success: false, outputUri: '', error: output }
  }

  const segmentPaths: string[] = []
  let i = 0
  for (const clip of sorted) {
    const seg = `/tmp/sf_seg_${project.id}_${i}.mp4`
    const trimCmd = `-ss ${clip.sourceStart} -to ${clip.sourceEnd} -i "${clip.sourceUri}" -c copy -y "${seg}"`
    const { success } = await runFfmpeg(trimCmd)
    if (!success) {
      return { success: false, outputUri: '', error: `Failed trimming segment ${i}` }
    }
    segmentPaths.push(seg)
    i += 1
    onProgress?.(10 + (i / sorted.length) * 60)
  }

  const inputs = segmentPaths.map((p) => `-i "${p}"`).join(' ')
  const n = segmentPaths.length
  const filter =
    Array.from({ length: n }, (_, idx) => `[${idx}:v][${idx}:a]`).join('') +
    `concat=n=${n}:v=1:a=1[outv][outa]`

  const concatCmd = `${inputs} -filter_complex "${filter}" -map "[outv]" -map "[outa]" -c:v libx264 -preset fast -c:a aac -y "${out}"`
  const result = await runFfmpeg(concatCmd)
  onProgress?.(100)

  return result.success
    ? { success: true, outputUri: out }
    : { success: false, outputUri: '', error: result.output }
}
