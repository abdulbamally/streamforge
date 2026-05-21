import { useCallback } from 'react'
import { pickMediaFiles } from '../engine/media/mediaImportService'
import { useEditorStore } from '../store/editorStore'

export function useMediaImport() {
  const addMediaAssets = useEditorStore((state) => state.addMediaAssets)
  const setIsImporting = useEditorStore((state) => state.setIsImporting)
  const setImportError = useEditorStore((state) => state.setImportError)

  const importMedia = useCallback(async () => {
    setIsImporting(true)
    setImportError(null)
    try {
      const assets = await pickMediaFiles()
      if (assets.length) addMediaAssets(assets)
      return assets
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to import media'
      setImportError(message)
      return []
    } finally {
      setIsImporting(false)
    }
  }, [addMediaAssets, setImportError, setIsImporting])

  return { importMedia }
}
