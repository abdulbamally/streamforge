import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import type { JwtAccessPayload } from "@streamforge/shared/types";
import { ReactionService } from "./reaction.service";

const createBody = z.object({
  streamId: z.string().min(1),
  type: z.string().min(1),
});

export class ReactionController {
  private service = new ReactionService();

  async createReaction(request: FastifyRequest, reply: FastifyReply) {
    const parsed = createBody.safeParse(request.body);
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
    const reaction = await this.service.addReaction(
      parsed.data.streamId,
      request.user!.sub,
      parsed.data.type,
    );
    return reply.code(201).send({ success: true, data: reaction });
  }

  async getReactions(request: FastifyRequest, reply: FastifyReply) {
    const streamId = (request.params as { streamId: string }).streamId;
    const reactions = await this.service.getReactions(streamId);
    return reply.send({ success: true, data: reactions });
  }
}
