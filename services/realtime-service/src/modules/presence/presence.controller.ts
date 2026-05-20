import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { PresenceService } from "./presence.service";

const bodySchema = z.object({
  streamId: z.string().min(1),
});

export class PresenceController {
  private service = new PresenceService();

  async joinStream(request: FastifyRequest, reply: FastifyReply) {
    const parsed = bodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VAL_001",
          message: "Invalid body",
          details: parsed.error.flatten(),
        },
      });
    }
    const session = await this.service.createPresence({
      streamId: parsed.data.streamId,
      userId: request.user.sub,
    });
    return reply.code(201).send({ success: true, data: session });
  }

  async leaveStream(request: FastifyRequest, reply: FastifyReply) {
    const parsed = bodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VAL_001",
          message: "Invalid body",
          details: parsed.error.flatten(),
        },
      });
    }
    const session = await this.service.endPresence({
      streamId: parsed.data.streamId,
      userId: request.user.sub,
    });
    return reply.send({ success: true, data: session });
  }
}
