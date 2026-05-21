import type { ExportFormat } from '../../types/export.types'
import { createOutputFileName } from '../export/exportOutput'

export function resolveMediaAssetPath(uri: string): string {
  return uri.replace(/^file:\/\//, '')
}

export function createOutputUri(projectTitle: string, format: ExportFormat): {
  uri: string
  fileName: string
} {
  const fileName = createOutputFileName(projectTitle, format)
  return {
    fileName,
    uri: `file:///tmp/${fileName}`,
  }
}

export async function checkOutputDirectoryAvailable(): Promise<boolean> {
  return true
}
