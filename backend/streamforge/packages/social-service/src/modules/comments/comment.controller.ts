import { FastifyRequest, FastifyReply } from "fastify";
import { CommentService } from "./comment.service";

export class CommentController {
  private service = new CommentService();

  async createComment(request: FastifyRequest, reply: FastifyReply) {
    const payload = request.body as any;
    const comment = await this.service.addComment(
      payload.streamId,
      payload.userId,
      payload.content,
    );
    return reply.code(201).send({ data: comment });
  }

  async getComments(request: FastifyRequest, reply: FastifyReply) {
    const streamId = (request.params as any).streamId as string;
    const comments = await this.service.getComments(streamId);
    return reply.send({ data: comments });
  }
}
