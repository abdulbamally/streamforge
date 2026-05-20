// ============================================================
//  Media Service — Error factory
// ============================================================

export interface AppError extends Error {
  statusCode: number;
  code: string;
}

export function createAppError(
  statusCode: number,
  code: string,
  message: string,
): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

export const MediaErrors = {
  assetNotFound: () => createAppError(404, "SRV_002", "Asset not found"),
  projectNotFound: () => createAppError(404, "SRV_002", "Project not found"),
  clipNotFound: () => createAppError(404, "SRV_002", "Clip not found"),
  exportNotFound: () => createAppError(404, "SRV_002", "Export not found"),
  unauthorized: () =>
    createAppError(401, "AUTHZ_001", "Authentication required"),
  forbidden: () => createAppError(403, "AUTHZ_002", "Access denied"),
  planLimit: (msg: string) => createAppError(403, "AUTHZ_003", msg),
  uploadFailed: (msg: string) =>
    createAppError(502, "MEDIA_001", `Upload failed: ${msg}`),
  transcodeFailed: (msg: string) =>
    createAppError(502, "MEDIA_002", `Transcode failed: ${msg}`),
  invalidFormat: (fmt: string) =>
    createAppError(400, "MEDIA_003", `Unsupported format: ${fmt}`),
  fileTooLarge: (max: string) =>
    createAppError(413, "MEDIA_004", `File exceeds max size of ${max}`),
};
