import { useMemo } from 'react'
import { createRenderPlan } from '../engine/render/renderPlanner'
import { useProjectSerialization } from './useProjectSerialization'
import { useEditorStore } from '../store/editorStore'

export function useRenderPlan() {
  const serialized = useProjectSerialization()
  const settings = useEditorStore((state) => state.export.exportSettings)

  return useMemo(
    () => createRenderPlan(serialized.snapshot, settings),
    [serialized.snapshot, settings],
  )
}
