import { FastifyRequest, FastifyReply } from 'fastify';
import { GiftService } from './gift.service';

export class GiftController {
  private service = new GiftService();

  async sendGift(request: FastifyRequest, reply: FastifyReply) {
    const payload = request.body as any;
    const gift = await this.service.sendGift(payload);
    return reply.code(201).send({ data: gift });
  }

  async getReceivedGifts(request: FastifyRequest, reply: FastifyReply) {
    const receiverId = (request.params as any).receiverId as string;
    const gifts = await this.service.getReceivedGifts(receiverId);
    return reply.send({ data: gifts });
  }
}
