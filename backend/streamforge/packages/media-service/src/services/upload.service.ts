// ============================================================
//  UploadService — R2 presigned URL management
//  Separates all S3/R2 concerns from the route layer
// ============================================================

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { nanoid }  from 'nanoid'
import { config }  from '../utils/config'
import { logger }  from '../utils/logger'

export interface PresignedUploadResult {
  presignedUrl: string
  publicUrl:    string
  r2Key:        string
  expiresIn:    number
}

export class UploadService {
  private s3: S3Client

  constructor() {
    this.s3 = new S3Client({
      region:   'auto',
      endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId:     config.R2_ACCESS_KEY_ID,
        secretAccessKey: config.R2_SECRET_ACCESS_KEY,
      },
    })
  }

  // ─── Generate presigned PUT URL ───────────────────────────────
  async createPresignedUpload(
    userId:      string,
    filename:    string,
    contentType: string,
    expiresIn = 900  // 15 minutes
  ): Promise<PresignedUploadResult> {
    const ext    = filename.split('.').pop()?.toLowerCase() ?? 'bin'
    const r2Key  = `uploads/${userId}/${nanoid()}.${ext}`

    const presignedUrl = await getSignedUrl(
      this.s3,
      new PutObjectCommand({
        Bucket:      config.R2_BUCKET_NAME,
        Key:         r2Key,
        ContentType: contentType,
      }),
      { expiresIn }
    )

    const publicUrl = `${config.R2_PUBLIC_URL}/${r2Key}`

    logger.debug({ userId, r2Key }, 'Presigned upload URL created')

    return { presignedUrl, publicUrl, r2Key, expiresIn }
  }

  // ─── Delete a file from R2 ────────────────────────────────────
  async deleteFile(publicUrl: string): Promise<void> {
    const r2Key = publicUrl.replace(`${config.R2_PUBLIC_URL}/`, '')

    try {
      await this.s3.send(new DeleteObjectCommand({
        Bucket: config.R2_BUCKET_NAME,
        Key:    r2Key,
      }))
      logger.debug({ r2Key }, 'File deleted from R2')
    } catch (err) {
      logger.warn({ err, r2Key }, 'Failed to delete file from R2')
    }
  }

  // ─── Check if a file exists in R2 ────────────────────────────
  async fileExists(publicUrl: string): Promise<boolean> {
    const r2Key = publicUrl.replace(`${config.R2_PUBLIC_URL}/`, '')

    try {
      await this.s3.send(new HeadObjectCommand({
        Bucket: config.R2_BUCKET_NAME,
        Key:    r2Key,
      }))
      return true
    } catch {
      return false
    }
  }

  // ─── Build R2 key from userId and filename ────────────────────
  buildKey(prefix: string, userId: string, filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() ?? 'bin'
    return `${prefix}/${userId}/${nanoid()}.${ext}`
  }

  // ─── Get public URL from R2 key ───────────────────────────────
  getPublicUrl(r2Key: string): string {
    return `${config.R2_PUBLIC_URL}/${r2Key}`
  }
}
