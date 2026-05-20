import { getMediaDuration } from '../native/ffmpegKit'

export type VideoMetadata = {
  duration: number
  width?: number
  height?: number
  fps?: number
}

/** Probe duration; falls back to 0 if FFmpeg native layer is not linked. */
export async function probeVideoMetadata(
  uri: string,
  fallbackDuration?: number,
): Promise<VideoMetadata> {
  const duration = await getMediaDuration(uri)
  if (duration > 0) {
    return { duration }
  }
  if (fallbackDuration != null && fallbackDuration > 0) {
    return { duration: fallbackDuration }
  }
  return { duration: 0 }
}
