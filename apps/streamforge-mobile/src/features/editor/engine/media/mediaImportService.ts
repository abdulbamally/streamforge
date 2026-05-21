import DocumentPicker, {
  isCancel,
  types,
  type DocumentPickerResponse,
} from 'react-native-document-picker'
import type { MediaAsset } from '../../types/media.types'
import { createMediaAssetFromPickedFile } from './mediaMetadata'

export async function pickMediaFiles(): Promise<MediaAsset[]> {
  try {
    const files = await DocumentPicker.pick({
      allowMultiSelection: true,
      type: [types.images, types.video, types.audio],
    })
    return files.map(createMediaAssetFromDocument)
  } catch (error) {
    if (isCancel(error)) return []
    throw error
  }
}

export function createMediaAssetFromDocument(file: DocumentPickerResponse): MediaAsset {
  return createMediaAssetFromPickedFile({
    uri: file.uri,
    name: file.name,
    type: file.type,
    mimeType: file.type,
    size: file.size,
    fileSize: file.size,
  })
}
