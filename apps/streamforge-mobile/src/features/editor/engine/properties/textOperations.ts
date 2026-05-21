import type { TextClipProperties } from '../../types/text.types'
import { DEFAULT_TEXT_PROPERTIES } from '../../types/text.types'

export function mergeTextProperties(
  current: TextClipProperties | undefined,
  patch: Partial<TextClipProperties>,
): TextClipProperties {
  const next = {
    ...DEFAULT_TEXT_PROPERTIES,
    ...current,
    ...patch,
  }
  return {
    ...next,
    content: next.content || DEFAULT_TEXT_PROPERTIES.content,
    fontSize: Math.max(8, Math.min(160, next.fontSize)),
  }
}
