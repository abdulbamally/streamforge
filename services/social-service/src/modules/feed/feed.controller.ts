import type { FastifyReply, FastifyRequest } from "fastify";
import { FeedService } from "./feed.service";

export class FeedController {
  private service = new FeedService();

  async getFeed(_request: FastifyRequest, reply: FastifyReply) {
    const feed = await this.service.getFeed();
    return reply.send({ success: true, data: feed });
  }

  async getTrending(_request: FastifyRequest, reply: FastifyReply) {
    const trending = await this.service.getTrending();
    return reply.send({ success: true, data: trending });
  }

  async getRecommended(request: FastifyRequest, reply: FastifyReply) {
    const viewerId = request.user?.sub;
    const recommended = await this.service.getRecommended(viewerId);
    return reply.send({ success: true, data: recommended });
  }
}
