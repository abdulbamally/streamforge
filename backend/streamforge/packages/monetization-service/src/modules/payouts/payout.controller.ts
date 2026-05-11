import { FastifyRequest, FastifyReply } from 'fastify';
import { PayoutService } from './payout.service';

export class PayoutController {
  private service = new PayoutService();

  async requestPayout(request: FastifyRequest, reply: FastifyReply) {
    const payload = request.body as any;
    const payout = await this.service.requestPayout(payload);
    return reply.code(201).send({ data: payout });
  }

  async getPayouts(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.params as any).userId as string;
    const payouts = await this.service.getPayouts(userId);
    return reply.send({ data: payouts });
  }
}
