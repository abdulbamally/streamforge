import type { FastifyReply, FastifyRequest } from "fastify";
import { FollowService } from "./follow.service";

export class FollowController {
  private service = new FollowService();

  async createFollow(request: FastifyRequest, reply: FastifyReply) {
    const followeeId = (request.params as { creatorId: string }).creatorId;
    const uid = request.user!.sub;
    const result = await this.service.follow(uid, followeeId);
    return reply.code(201).send({ success: true, data: result });
  }

  async removeFollow(request: FastifyRequest, reply: FastifyReply) {
    const followeeId = (request.params as { creatorId: string }).creatorId;
    const uid = request.user!.sub;
    const result = await this.service.unfollow(uid, followeeId);
    if (!result) {
      return reply.status(404).send({
        success: false,
        error: { code: "SRV_002", message: "Follow relationship not found" },
      });
    }
    return reply.send({ success: true, data: result });
  }
}
