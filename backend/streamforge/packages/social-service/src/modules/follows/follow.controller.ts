import { FastifyRequest, FastifyReply } from "fastify";
import { FollowService } from "./follow.service";

export class FollowController {
  private service = new FollowService();

  async createFollow(request: FastifyRequest, reply: FastifyReply) {
    const followeeId = (request.params as any).creatorId as string;
    const followerId = (request.body as any).followerId as string;
    const result = await this.service.follow(followerId, followeeId);
    return reply.code(201).send({ data: result });
  }

  async removeFollow(request: FastifyRequest, reply: FastifyReply) {
    const followeeId = (request.params as any).creatorId as string;
    const followerId = (request.body as any).followerId as string;
    const result = await this.service.unfollow(followerId, followeeId);
    return reply.send({ data: result });
  }
}
