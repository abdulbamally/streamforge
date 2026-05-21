import type { NormalizedPoint, PreviewBounds } from '../../types/transform.types'

export function clampNormalizedPosition(position: NormalizedPoint): NormalizedPoint {
  return {
    x: Math.max(-1, Math.min(1, position.x)),
    y: Math.max(-1, Math.min(1, position.y)),
  }
}

export function screenPointToNormalizedPreview(
  point: NormalizedPoint,
  previewBounds: PreviewBounds,
): NormalizedPoint {
  if (previewBounds.width <= 0 || previewBounds.height <= 0) return { x: 0, y: 0 }
  return clampNormalizedPosition({
    x: ((point.x - previewBounds.x) / previewBounds.width) * 2 - 1,
    y: ((point.y - previewBounds.y) / previewBounds.height) * 2 - 1,
  })
}

export function normalizedPreviewToScreenPoint(
  position: NormalizedPoint,
  previewBounds: PreviewBounds,
): NormalizedPoint {
  return {
    x: previewBounds.x + ((position.x + 1) / 2) * previewBounds.width,
    y: previewBounds.y + ((position.y + 1) / 2) * previewBounds.height,
  }
}

export function getPreviewContentBounds(
  videoAspectRatio: number,
  containerBounds: PreviewBounds,
): PreviewBounds {
  const containerRatio = containerBounds.width / Math.max(1, containerBounds.height)
  if (containerRatio > videoAspectRatio) {
    const width = containerBounds.height * videoAspectRatio
    return {
      x: containerBounds.x + (containerBounds.width - width) / 2,
      y: containerBounds.y,
      width,
      height: containerBounds.height,
    }
  }
  const height = containerBounds.width / Math.max(0.1, videoAspectRatio)
  return {
    x: containerBounds.x,
    y: containerBounds.y + (containerBounds.height - height) / 2,
    width: containerBounds.width,
    height,
  }
}

export function isPointInsideTransformBox(
  point: NormalizedPoint,
  box: PreviewBounds,
): boolean {
  return (
    point.x >= box.x &&
    point.x <= box.x + box.width &&
    point.y >= box.y &&
    point.y <= box.y + box.height
  )
}
