// ============================================================
//  AI Routes — /api/v1/ai/*
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import {
  authenticate,
  requireAiPlan,
  aiRateLimit,
} from "../middleware/auth.middleware";
import {
  DetectSchema,
  OcrSchema,
  TranslateSchema,
  SceneDescribeSchema,
} from "../schemas/ai.schema";
import { VisionService } from "../services/vision.service";
import { OcrService } from "../services/ocr.service";
import { TranslationService } from "../services/translation.service";
import { SceneService } from "../services/scene.service";
import { config } from "../utils/config";

const preHandler = [authenticate, requireAiPlan, aiRateLimit];

export async function aiRoutes(app: FastifyInstance): Promise<void> {
  const vision = new VisionService();
  const ocr = new OcrService();
  const translation = new TranslationService();
  const scene = new SceneService();

  // ── POST /ai/detect — Object & label detection ────────────────
  app.post(
    "/detect",
    {
      preHandler,
      schema: {
        tags: ["Detection"],
        summary: "Detect objects, labels, faces in an image",
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const dto = DetectSchema.parse(request.body);
      const result = await vision.detect(dto.imageUrl, dto.features);
      return reply.send({ success: true, data: result });
    },
  );

  // ── POST /ai/ocr — Text extraction ───────────────────────────
  app.post(
    "/ocr",
    {
      preHandler,
      schema: {
        tags: ["OCR"],
        summary: "Extract text from an image or video frame",
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const dto = OcrSchema.parse(request.body);
      const result = await ocr.extractText(dto.imageUrl, dto.language);
      return reply.send({ success: true, data: result });
    },
  );

  // ── POST /ai/translate — Translate text ───────────────────────
  app.post(
    "/translate",
    {
      preHandler,
      schema: {
        tags: ["Translation"],
        summary: "Translate text to a target language",
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const dto = TranslateSchema.parse(request.body);

      if (Array.isArray(dto.text)) {
        const result = await translation.translateBatch(
          dto.text,
          dto.targetLanguage,
          dto.sourceLanguage,
        );
        return reply.send({ success: true, data: result });
      }

      const result = await translation.translate(
        dto.text,
        dto.targetLanguage,
        dto.sourceLanguage,
      );
      return reply.send({ success: true, data: result });
    },
  );

  // ── POST /ai/detect-language — Language detection ─────────────
  app.post(
    "/detect-language",
    {
      preHandler,
      schema: {
        tags: ["Translation"],
        summary: "Detect the language of a text string",
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { text } = request.body as { text: string };
      const result = await translation.detectLanguage(text);
      return reply.send({ success: true, data: result });
    },
  );

  // ── GET /ai/languages — Supported translation languages ───────
  app.get(
    "/languages",
    {
      schema: {
        tags: ["Translation"],
        summary: "Get list of supported translation languages",
      },
    },
    async (_request, reply: FastifyReply) => {
      return reply.send({
        success: true,
        data: { languages: translation.getSupportedLanguages() },
      });
    },
  );

  // ── POST /ai/scene/describe — Scene description ───────────────
  app.post(
    "/scene/describe",
    {
      preHandler,
      schema: {
        tags: ["Scene"],
        summary: "Get AI description of a scene image",
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const dto = SceneDescribeSchema.parse(request.body);
      const result = await scene.describe(dto.imageUrl, dto.context);
      return reply.send({ success: true, data: result });
    },
  );

  // ── POST /ai/scene/suggest-titles — Title suggestions ─────────
  app.post(
    "/scene/suggest-titles",
    {
      preHandler,
      schema: {
        tags: ["Scene"],
        summary: "Generate stream title suggestions from a description",
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { description, platform = "Twitch" } = request.body as {
        description: string;
        platform?: string;
      };
      const titles = await scene.suggestTitles(description, platform);
      return reply.send({ success: true, data: { titles } });
    },
  );

  // ── GET /ai/plans — Which plans have AI access ────────────────
  app.get(
    "/plans",
    {
      schema: {
        tags: ["Detection"],
        summary: "Get plan access info for AI features",
      },
    },
    async (_request, reply: FastifyReply) => {
      return reply.send({
        success: true,
        data: {
          allowedPlans: config.AI_PLANS_ALLOWED.split(","),
          rateLimits: {
            PRO: `${config.AI_REQUESTS_PER_MIN_PRO} requests/min`,
            CREATOR: `${config.AI_REQUESTS_PER_MIN_CREATOR} requests/min`,
            ENTERPRISE: `${config.AI_REQUESTS_PER_MIN_ENTERPRISE} requests/min`,
          },
        },
      });
    },
  );
}
