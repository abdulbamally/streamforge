import { useCallback } from 'react'
import { useEditorStore } from '../store/editorStore'

export function useExport() {
  const exportState = useEditorStore((state) => state.export)
  const openExportSettings = useEditorStore((state) => state.openExportSettings)
  const closeExportSettings = useEditorStore((state) => state.closeExportSettings)
  const prepareExport = useEditorStore((state) => state.prepareExport)
  const startActiveExport = useEditorStore((state) => state.startActiveExport)
  const cancelActiveExport = useEditorStore((state) => state.cancelActiveExport)
  const retryActiveExport = useEditorStore((state) => state.retryActiveExport)
  const dismissExportComplete = useEditorStore((state) => state.dismissExportComplete)

  const startExport = useCallback(async () => {
    const valid = prepareExport()
    if (!valid) return false
    return startActiveExport()
  }, [prepareExport, startActiveExport])

  return {
    exportState,
    openExportSettings,
    closeExportSettings,
    startExport,
    cancelActiveExport,
    retryActiveExport,
    dismissExportComplete,
  }
}
