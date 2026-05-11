// ============================================================
//  EditorService — FFmpeg-powered video editing operations
//
//  All operations work on R2 URLs. Files are:
//    1. Streamed from R2 to temp dir
//    2. Processed by FFmpeg
//    3. Uploaded back to R2
//    4. Temp files deleted
// ============================================================

import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";
import { nanoid } from "nanoid";
import { config } from "../utils/config";
import { prisma } from "../utils/prisma";
import { logger } from "../utils/logger";

// ─── Job types matching what BullMQ workers process ──────────
export interface TrimJob {
  clipId: string;
  projectId: string;
  userId: string;
  start: number;
  end: number;
}
export interface MergeJob {
  projectId: string;
  userId: string;
  clipIds: string[];
  outputName: string;
}
export interface ExtractAudioJob {
  assetId: string;
  userId: string;
  format: "mp3" | "aac" | "wav";
}
export interface ColorGradeJob {
  clipId: string;
  userId: string;
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  lutUrl?: string;
}
export interface ExportJob {
  projectId: string;
  exportId: string;
  userId: string;
  format: string;
  resolution: string;
  fps: number;
  videoBitrate?: number;
  audioBitrate?: number;
}
export interface ThumbnailJob {
  assetId: string;
  userId: string;
  timestamp?: number;
}

const TMP = "/tmp/sf_media";
fs.mkdirSync(TMP, { recursive: true });

export class EditorService {
  private s3: S3Client;

  constructor() {
    ffmpeg.setFfmpegPath(config.FFMPEG_PATH);
    ffmpeg.setFfprobePath(config.FFPROBE_PATH);

    this.s3 = new S3Client({
      region: "auto",
      endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.R2_ACCESS_KEY_ID,
        secretAccessKey: config.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  // ─── Trim a clip ─────────────────────────────────────────────
  async trimClip(job: TrimJob): Promise<string> {
    const clip = await prisma.clip.findUnique({ where: { id: job.clipId } });
    if (!clip) throw new Error("Clip not found");

    const duration = job.end - job.start;
    const inputPath = await this.downloadToTemp(clip.assetUrl);
    const outputPath = path.join(TMP, `${nanoid()}_trimmed.mp4`);

    await this.runFfmpeg(
      ffmpeg(inputPath)
        .seekInput(job.start)
        .duration(duration)
        .videoCodec("libx264")
        .audioCodec("aac")
        .outputOptions(["-preset fast", "-crf 23", "-movflags +faststart"])
        .output(outputPath),
    );

    const url = await this.uploadToR2(
      outputPath,
      `clips/${job.userId}/${nanoid()}_trimmed.mp4`,
      "video/mp4",
    );
    this.cleanup(inputPath, outputPath);

    // Update clip in DB
    await prisma.clip.update({
      where: { id: job.clipId },
      data: { assetUrl: url, trimIn: job.start, trimOut: job.end },
    });

    logger.info({ clipId: job.clipId, duration }, "Clip trimmed");
    return url;
  }

  // ─── Merge clips from a project ──────────────────────────────
  async mergeClips(job: MergeJob): Promise<string> {
    const clips = await prisma.clip.findMany({
      where: { id: { in: job.clipIds }, projectId: job.projectId },
      orderBy: { startTime: "asc" },
    });

    const inputPaths: string[] = [];
    for (const clip of clips) {
      inputPaths.push(await this.downloadToTemp(clip.assetUrl));
    }

    // Build concat file
    const concatFile = path.join(TMP, `${nanoid()}_concat.txt`);
    const concatContent = inputPaths.map((p) => `file '${p}'`).join("\n");
    fs.writeFileSync(concatFile, concatContent);

    const outputPath = path.join(TMP, `${nanoid()}_merged.mp4`);

    await this.runFfmpeg(
      ffmpeg()
        .input(concatFile)
        .inputOptions(["-f concat", "-safe 0"])
        .videoCodec("libx264")
        .audioCodec("aac")
        .outputOptions(["-preset fast", "-crf 23", "-movflags +faststart"])
        .output(outputPath),
    );

    const r2Key = `projects/${job.userId}/${job.projectId}/${nanoid()}_merged.mp4`;
    const url = await this.uploadToR2(outputPath, r2Key, "video/mp4");

    this.cleanup(concatFile, outputPath, ...inputPaths);

    logger.info(
      { projectId: job.projectId, clipCount: clips.length },
      "Clips merged",
    );
    return url;
  }

  // ─── Extract audio from video ─────────────────────────────────
  async extractAudio(job: ExtractAudioJob): Promise<string> {
    const asset = await prisma.mediaAsset.findUnique({
      where: { id: job.assetId },
    });
    if (!asset) throw new Error("Asset not found");

    const inputPath = await this.downloadToTemp(asset.url);
    const ext = job.format;
    const outputPath = path.join(TMP, `${nanoid()}_audio.${ext}`);

    const codecMap = { mp3: "libmp3lame", aac: "aac", wav: "pcm_s16le" };
    const mimeMap = { mp3: "audio/mpeg", aac: "audio/aac", wav: "audio/wav" };

    await this.runFfmpeg(
      ffmpeg(inputPath)
        .noVideo()
        .audioCodec(codecMap[job.format])
        .audioBitrate(job.format === "wav" ? undefined : "192k")
        .output(outputPath),
    );

    const r2Key = `assets/${job.userId}/${nanoid()}_audio.${ext}`;
    const url = await this.uploadToR2(outputPath, r2Key, mimeMap[job.format]);

    this.cleanup(inputPath, outputPath);

    // Create new MediaAsset for the extracted audio
    await prisma.mediaAsset.create({
      data: {
        userId: job.userId,
        filename: `${asset.filename}_audio.${ext}`,
        originalName: `${asset.originalName} (audio)`,
        mimeType: mimeMap[job.format],
        sizeBytes: BigInt(fs.statSync(outputPath).size ?? 0),
        url,
      },
    });

    logger.info(
      { assetId: job.assetId, format: job.format },
      "Audio extracted",
    );
    return url;
  }

  // ─── Apply color grading ──────────────────────────────────────
  async applyColorGrade(job: ColorGradeJob): Promise<string> {
    const clip = await prisma.clip.findUnique({ where: { id: job.clipId } });
    if (!clip) throw new Error("Clip not found");

    const inputPath = await this.downloadToTemp(clip.assetUrl);
    const outputPath = path.join(TMP, `${nanoid()}_graded.mp4`);

    // Build FFmpeg color filter chain
    const filters: string[] = [];

    // Brightness/contrast/saturation via eq filter
    filters.push(
      `eq=brightness=${job.brightness}:contrast=${job.contrast}:saturation=${job.saturation}`,
    );

    // Hue shift
    if (job.hue !== 0) {
      filters.push(`hue=h=${job.hue}`);
    }

    // LUT file (3D LUT for professional color grading)
    if (job.lutUrl) {
      const lutPath = await this.downloadToTemp(job.lutUrl);
      filters.push(`lut3d='${lutPath}'`);
    }

    const cmd = ffmpeg(inputPath)
      .videoFilters(filters.join(","))
      .videoCodec("libx264")
      .audioCodec("copy")
      .outputOptions(["-preset fast", "-crf 20", "-movflags +faststart"])
      .output(outputPath);

    await this.runFfmpeg(cmd);

    const r2Key = `clips/${job.userId}/${nanoid()}_graded.mp4`;
    const url = await this.uploadToR2(outputPath, r2Key, "video/mp4");

    this.cleanup(inputPath, outputPath);

    await prisma.clip.update({
      where: { id: job.clipId },
      data: {
        assetUrl: url,
        colorGrade: {
          brightness: job.brightness,
          contrast: job.contrast,
          saturation: job.saturation,
          hue: job.hue,
          lut: job.lutUrl,
        } as any,
      },
    });

    logger.info({ clipId: job.clipId }, "Color grade applied");
    return url;
  }

  // ─── Full project export ──────────────────────────────────────
  async exportProject(job: ExportJob): Promise<string> {
    // Update export status to PROCESSING
    await prisma.export.update({
      where: { id: job.exportId },
      data: { status: "PROCESSING", startedAt: new Date() },
    });

    try {
      const clips = await prisma.clip.findMany({
        where: { projectId: job.projectId },
        orderBy: { startTime: "asc" },
      });

      if (clips.length === 0) throw new Error("No clips in project");

      // Download all clips
      const inputPaths: string[] = [];
      for (const clip of clips) {
        inputPaths.push(await this.downloadToTemp(clip.assetUrl));
      }

      // Build concat list
      const concatFile = path.join(TMP, `${nanoid()}_export_concat.txt`);
      fs.writeFileSync(
        concatFile,
        inputPaths.map((p) => `file '${p}'`).join("\n"),
      );

      const ext = job.format.toLowerCase();
      const outputPath = path.join(TMP, `${nanoid()}_export.${ext}`);

      const [width, height] = job.resolution.split("x").map(Number);

      // Build resolution scale filter (maintain aspect ratio)
      const scaleFilter = `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`;

      const cmd = ffmpeg()
        .input(concatFile)
        .inputOptions(["-f concat", "-safe 0"])
        .videoFilter(scaleFilter)
        .fps(job.fps)
        .videoCodec(this.getVideoCodec(job.format))
        .audioCodec("aac")
        .audioBitrate(`${job.audioBitrate ?? 192}k`)
        .outputOptions([
          `-b:v ${job.videoBitrate ?? 4000}k`,
          "-preset slow",
          "-movflags +faststart",
        ])
        .output(outputPath);

      // GIF-specific options
      if (job.format === "GIF") {
        cmd
          .videoCodec("gif")
          .noAudio()
          .fps(Math.min(job.fps, 15)) // GIF max 15fps
          .outputOptions([
            "-vf",
            `${scaleFilter},split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
          ]);
      }

      // MP3 audio export
      if (job.format === "MP3") {
        cmd.noVideo().audioCodec("libmp3lame").audioBitrate("320k");
      }

      await this.runFfmpeg(cmd);

      const mimeTypes: Record<string, string> = {
        mp4: "video/mp4",
        mov: "video/quicktime",
        webm: "video/webm",
        mkv: "video/x-matroska",
        gif: "image/gif",
        mp3: "audio/mpeg",
      };

      const r2Key = `exports/${job.userId}/${job.projectId}/${nanoid()}.${ext}`;
      const url = await this.uploadToR2(
        outputPath,
        r2Key,
        mimeTypes[ext] ?? "video/mp4",
      );
      const size = fs.statSync(outputPath).size;

      // Update export record
      await prisma.export.update({
        where: { id: job.exportId },
        data: {
          status: "DONE",
          outputUrl: url,
          sizeBytes: BigInt(size),
          completedAt: new Date(),
          progress: 100,
        },
      });

      this.cleanup(concatFile, outputPath, ...inputPaths);

      logger.info({ exportId: job.exportId, url }, "Export completed");
      return url;
    } catch (err: any) {
      await prisma.export.update({
        where: { id: job.exportId },
        data: { status: "FAILED", error: err.message },
      });
      throw err;
    }
  }

  // ─── Generate video thumbnail ─────────────────────────────────
  async generateThumbnail(assetUrl: string, timestamp = 1): Promise<string> {
    const inputPath = await this.downloadToTemp(assetUrl);
    const outputPath = path.join(TMP, `${nanoid()}_thumb.jpg`);

    await this.runFfmpeg(
      ffmpeg(inputPath)
        .seekInput(timestamp)
        .frames(1)
        .videoFilter("scale=640:-1")
        .output(outputPath),
    );

    const r2Key = `thumbnails/${nanoid()}.jpg`;
    const url = await this.uploadToR2(outputPath, r2Key, "image/jpeg");
    this.cleanup(inputPath, outputPath);
    return url;
  }

  // ─── Probe video metadata ─────────────────────────────────────
  async probeAsset(url: string): Promise<ffmpeg.FfprobeData> {
    const inputPath = await this.downloadToTemp(url);
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        this.cleanup(inputPath);
        err ? reject(err) : resolve(metadata);
      });
    });
  }

  // ─── Private helpers ──────────────────────────────────────────
  private downloadToTemp(url: string): Promise<string> {
    // For R2 URLs — download via HTTPS fetch
    return new Promise(async (resolve, reject) => {
      const tmpPath = path.join(TMP, `${nanoid()}_input`);
      const res = await fetch(url);
      if (!res.ok || !res.body)
        return reject(new Error(`Download failed: ${url}`));

      const dest = fs.createWriteStream(tmpPath);
      const reader = res.body.getReader();

      const pump = async () => {
        const { done, value } = await reader.read();
        if (done) {
          dest.end();
          resolve(tmpPath);
          return;
        }
        dest.write(Buffer.from(value));
        pump();
      };
      pump().catch(reject);
    });
  }

  private async uploadToR2(
    localPath: string,
    key: string,
    contentType: string,
  ): Promise<string> {
    const body = fs.createReadStream(localPath);
    await this.s3.send(
      new PutObjectCommand({
        Bucket: config.R2_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return `${config.R2_PUBLIC_URL}/${key}`;
  }

  private runFfmpeg(cmd: ffmpeg.FfmpegCommand): Promise<void> {
    return new Promise((resolve, reject) => {
      cmd.on("error", reject).on("end", resolve).run();
    });
  }

  private getVideoCodec(format: string): string {
    const map: Record<string, string> = {
      MP4: "libx264",
      MOV: "libx264",
      WEBM: "libvpx-vp9",
      MKV: "libx264",
    };
    return map[format] ?? "libx264";
  }

  private cleanup(...paths: string[]): void {
    for (const p of paths) {
      try {
        fs.unlinkSync(p);
      } catch {}
    }
  }
}
