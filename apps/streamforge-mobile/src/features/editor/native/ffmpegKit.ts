// ============================================================
//  FFmpeg bridge — optional native layer
//
//  arthenica/ffmpeg-kit was retired; Maven artifacts for 6.0-2 are
//  no longer published. This module stubs the API so the app builds.
//  To restore on-device export, vendor an .aar module (see android/README-ffmpeg.md).
// ============================================================

export async function runFfmpeg(
  _command: string,
  onLog?: (msg: string) => void,
): Promise<{ success: boolean; output: string }> {
  onLog?.('FFmpegKit native binaries not linked')
  return {
    success: false,
    output:
      'On-device FFmpeg is not available in this build. Use a single-clip export or cloud export.',
  }
}

export async function getMediaDuration(_uri: string): Promise<number> {
  return 0
}

export const isFfmpegAvailable = false
