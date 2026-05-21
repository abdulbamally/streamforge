import { useEditorStore } from '../store/editorStore'

export function useExportSettings() {
  const settings = useEditorStore((state) => state.export.exportSettings)
  const updateExportSetting = useEditorStore((state) => state.updateExportSetting)
  const setExportSettings = useEditorStore((state) => state.setExportSettings)

  return {
    settings,
    updateExportSetting,
    setExportSettings,
  }
}
