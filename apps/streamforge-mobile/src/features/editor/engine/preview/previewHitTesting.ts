import type { NormalizedPoint, PreviewBounds } from '../../types/transform.types'
import { isPointInsideTransformBox } from './previewCoordinateUtils'

export type PreviewHitResult = {
  type: 'inside' | 'corner' | 'edge' | 'rotation' | 'outside'
  handle?: string
}

export function hitTestPreviewTransform(
  point: NormalizedPoint,
  box: PreviewBounds,
): PreviewHitResult {
  if (!isPointInsideTransformBox(point, box)) return { type: 'outside' }

  const edge = 18
  const nearLeft = Math.abs(point.x - box.x) <= edge
  const nearRight = Math.abs(point.x - (box.x + box.width)) <= edge
  const nearTop = Math.abs(point.y - box.y) <= edge
  const nearBottom = Math.abs(point.y - (box.y + box.height)) <= edge

  if ((nearLeft || nearRight) && (nearTop || nearBottom)) {
    return {
      type: 'corner',
      handle: `${nearTop ? 'top' : 'bottom'}-${nearLeft ? 'left' : 'right'}`,
    }
  }
  if (nearLeft || nearRight || nearTop || nearBottom) {
    return { type: 'edge', handle: nearLeft ? 'left' : nearRight ? 'right' : nearTop ? 'top' : 'bottom' }
  }
  return { type: 'inside' }
}
