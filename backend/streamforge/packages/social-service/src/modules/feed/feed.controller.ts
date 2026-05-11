import { FastifyRequest, FastifyReply } from "fastify";
import { FeedService } from "./feed.service";

export class FeedController {
  private service = new FeedService();

  async getFeed(request: FastifyRequest, reply: FastifyReply) {
    const feed = await this.service.getFeed();
    return reply.send({ data: feed });
  }

  async getTrending(request: FastifyRequest, reply: FastifyReply) {
    const trending = await this.service.getTrending();
    return reply.send({ data: trending });
  }

  async getRecommended(request: FastifyRequest, reply: FastifyReply) {
    const recommended = await this.service.getRecommended();
    return reply.send({ data: recommended });
  }
}
