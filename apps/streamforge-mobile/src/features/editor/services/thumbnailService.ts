import { getStorage } from '@core/storage/mmkvStorage'
import { runFfmpeg } from '../native/ffmpegKit'
import { Platform } from 'react-native'

const THUMB_STORAGE = 'streamforge-thumbnails'

function cacheKey(uri: string, time: number): string {
  return `${uri}@${time.toFixed(2)}`
}

export async function getThumbnailUri(
  sourceUri: string,
  timeSec: number,
): Promise<string | null> {
  const key = cacheKey(sourceUri, timeSec)
  const cached = getStorage(THUMB_STORAGE).getString(key)
  if (cached) return cached

  const outPath =
    Platform.OS === 'ios'
      ? `${sourceUri.replace(/\.[^.]+$/, '')}_thumb_${Math.floor(timeSec * 100)}.jpg`
      : `/tmp/sf_thumb_${Date.now()}.jpg`

  const cmd = `-ss ${timeSec} -i "${sourceUri}" -frames:v 1 -q:v 4 -y "${outPath}"`
  const { success } = await runFfmpeg(cmd)
  if (!success) return null

  getStorage(THUMB_STORAGE).set(key, outPath)
  return outPath
}
