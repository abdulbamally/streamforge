import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { CommentService } from "./comment.service";

const createBody = z.object({
  streamId: z.string().min(1),
  content: z.string().min(1),
});

export class CommentController {
  private service = new CommentService();

  async createComment(request: FastifyRequest, reply: FastifyReply) {
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
    const comment = await this.service.addComment(
      parsed.data.streamId,
      request.user!.sub,
      parsed.data.content,
    );
    return reply.code(201).send({ success: true, data: comment });
  }

  async getComments(request: FastifyRequest, reply: FastifyReply) {
    const streamId = (request.params as { streamId: string }).streamId;
    const comments = await this.service.getComments(streamId);
    return reply.send({ success: true, data: comments });
  }
}
