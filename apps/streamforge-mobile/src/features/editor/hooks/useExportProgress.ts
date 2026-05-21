import { useMemo } from 'react'
import { useEditorStore } from '../store/editorStore'

export function useExportProgress() {
  const activeJobId = useEditorStore((state) => state.export.activeJobId)
  const renderJobs = useEditorStore((state) => state.export.renderJobs)
  const activeJob = useMemo(
    () => (activeJobId ? renderJobs[activeJobId] ?? null : null),
    [activeJobId, renderJobs],
  )

  return {
    activeJob,
    progress: activeJob?.progress ?? 0,
    status: activeJob?.status ?? 'idle',
    currentStep: activeJob?.currentStep ?? 'Idle',
  }
}
