// ============================================================
//  Stream Service — Error factory
// ============================================================

export interface AppError extends Error {
  statusCode: number
  code:       string
}

export function createAppError(
  statusCode: number,
  code:       string,
  message:    string
): AppError {
  const err    = new Error(message) as AppError
  err.statusCode = statusCode
  err.code       = code
  return err
}

export const StreamErrors = {
  notFound:        () => createAppError(404, 'SRV_002',   'Stream not found'),
  unauthorized:    () => createAppError(401, 'AUTHZ_001', 'Authentication required'),
  forbidden:       () => createAppError(403, 'AUTHZ_002', 'Access denied'),
  planLimit:       (msg: string) => createAppError(403, 'AUTHZ_003', msg),
  alreadyLive:     () => createAppError(409, 'STREAM_001', 'A stream is already active'),
  invalidSceneId:  () => createAppError(400, 'STREAM_002', 'Scene not found in this stream'),
  destinationFail: (platform: string) => createAppError(502, 'STREAM_003', `Failed to connect to ${platform}`),
}
