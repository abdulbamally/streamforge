// ============================================================
//  AI Service — Domain Types
// ============================================================

// ─── Object Detection ─────────────────────────────────────────
export interface DetectedObject {
  name:        string
  confidence:  number        // 0-1
  boundingBox: BoundingBox
  category:    string
}

export interface BoundingBox {
  x:      number             // normalized 0-1
  y:      number
  width:  number
  height: number
}

export interface DetectionResult {
  objects:    DetectedObject[]
  labels:     DetectedLabel[]
  faces:      DetectedFace[]
  safeSearch: SafeSearchResult
  processedAt: string
}

export interface DetectedLabel {
  name:        string
  confidence:  number
  topicality:  number
}

export interface DetectedFace {
  confidence:     number
  boundingBox:    BoundingBox
  joyLikelihood:  string
  sorrowLikelihood: string
  angerLikelihood: string
  surpriseLikelihood: string
}

export interface SafeSearchResult {
  adult:    string
  violence: string
  racy:     string
}

// ─── OCR / Text Extraction ────────────────────────────────────
export interface OcrResult {
  fullText:    string
  blocks:      TextBlock[]
  confidence:  number
  language:    string | null
  processedAt: string
}

export interface TextBlock {
  text:        string
  confidence:  number
  boundingBox: BoundingBox
  language:    string | null
}

// ─── Translation ──────────────────────────────────────────────
export interface TranslationResult {
  originalText:   string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  confidence:     number
  processedAt:    string
}

export interface BatchTranslationResult {
  results:        TranslationResult[]
  totalCharacters: number
  processedAt:    string
}

// ─── Scene Description (OpenAI) ───────────────────────────────
export interface SceneDescriptionResult {
  description:   string
  tags:          string[]
  mood:          string
  suggestedTitle: string | null
  processedAt:   string
}

// ─── BullMQ Job Payloads ──────────────────────────────────────
export interface DetectionJobData {
  jobId:    string
  userId:   string
  imageUrl: string
  features: Array<'OBJECT_DETECTION' | 'LABEL_DETECTION' | 'FACE_DETECTION' | 'SAFE_SEARCH'>
}

export interface OcrJobData {
  jobId:    string
  userId:   string
  imageUrl: string
  language?: string
}

export interface TranslationJobData {
  jobId:          string
  userId:         string
  text:           string | string[]
  targetLanguage: string
  sourceLanguage?: string
}

export interface SceneDescriptionJobData {
  jobId:    string
  userId:   string
  imageUrl: string
  context?: string
}

// ─── Cached job result stored in Redis ───────────────────────
export interface AiJobResult<T = unknown> {
  status:  'pending' | 'done' | 'failed'
  data?:   T
  error?:  string
  cached?: boolean
}
