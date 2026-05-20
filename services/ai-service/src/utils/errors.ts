export interface AppError extends Error {
  statusCode: number
  code:       string
}

export function createAppError(statusCode: number, code: string, message: string): AppError {
  const err      = new Error(message) as AppError
  err.statusCode = statusCode
  err.code       = code
  return err
}

export const AiErrors = {
  unauthorized:    () => createAppError(401, 'AUTHZ_001', 'Authentication required'),
  planNotAllowed:  () => createAppError(403, 'AUTHZ_003', 'AI features require PRO plan or higher'),
  rateLimited:     () => createAppError(429, 'SRV_003',   'AI rate limit exceeded for your plan'),
  invalidImage:    () => createAppError(400, 'AI_001',    'Invalid or unreadable image'),
  visionFailed:    (msg: string) => createAppError(502, 'AI_002', `Vision API error: ${msg}`),
  translateFailed: (msg: string) => createAppError(502, 'AI_003', `Translation error: ${msg}`),
  ocrFailed:       (msg: string) => createAppError(502, 'AI_004', `OCR error: ${msg}`),
  notFound:        () => createAppError(404, 'SRV_002',   'Resource not found'),
  internalError:   () => createAppError(500, 'SRV_001',   'Internal AI service error'),
}
