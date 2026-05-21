export type RenderSurface = 'preview' | 'timeline' | 'overlay'

export type RenderReadiness = Record<RenderSurface, boolean>

export const initialRenderReadiness: RenderReadiness = {
  preview: false,
  timeline: false,
  overlay: false,
}
