export type TextAlignment = 'left' | 'center' | 'right'

export type TextClipProperties = {
  content: string
  fontFamily?: string
  fontSize: number
  fontWeight?: 'regular' | 'medium' | 'bold'
  color: string
  backgroundColor?: string
  alignment: TextAlignment
  outlineColor?: string
  outlineWidth?: number
  shadowEnabled?: boolean
}

export const DEFAULT_TEXT_PROPERTIES: TextClipProperties = {
  content: 'New Text',
  fontSize: 32,
  color: '#FFFFFF',
  alignment: 'center',
  shadowEnabled: true,
}
