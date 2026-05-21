import { DEFAULT_CLIP_TRANSFORM, type ClipTransform } from '../../types/clip.types'

export function clampTransform(transform: ClipTransform): ClipTransform {
  return {
    ...transform,
    x: Math.max(-1, Math.min(1, transform.x)),
    y: Math.max(-1, Math.min(1, transform.y)),
    scale: Math.max(0.1, Math.min(5, transform.scale)),
    rotation: Math.max(-180, Math.min(180, transform.rotation)),
    anchorX: Math.max(0, Math.min(1, transform.anchorX ?? 0.5)),
    anchorY: Math.max(0, Math.min(1, transform.anchorY ?? 0.5)),
  }
}

export function mergeTransform(
  current: ClipTransform | undefined,
  patch: Partial<ClipTransform>,
): ClipTransform {
  return clampTransform({
    ...DEFAULT_CLIP_TRANSFORM,
    ...current,
    ...patch,
  })
}

export function resetTransform(): ClipTransform {
  return { ...DEFAULT_CLIP_TRANSFORM }
}
