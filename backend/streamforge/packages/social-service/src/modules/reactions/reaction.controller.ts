import { FastifyRequest, FastifyReply } from "fastify";
import { ReactionService } from "./reaction.service";

export class ReactionController {
  private service = new ReactionService();

  async createReaction(request: FastifyRequest, reply: FastifyReply) {
    const payload = request.body as any;
    const reaction = await this.service.addReaction(
      payload.streamId,
      payload.userId,
      payload.type,
    );
    return reply.code(201).send({ data: reaction });
  }

  async getReactions(request: FastifyRequest, reply: FastifyReply) {
    const streamId = (request.params as any).streamId as string;
    const reactions = await this.service.getReactions(streamId);
    return reply.send({ data: reactions });
  }
}
