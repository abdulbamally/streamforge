import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { PayoutService } from "./payout.service";

const requestBody = z.object({
  amountCents: z.number().int().positive(),
});

export class PayoutController {
  private service = new PayoutService();

  async requestPayout(request: FastifyRequest, reply: FastifyReply) {
    const parsed = requestBody.safeParse(request.body);
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
    const payout = await this.service.requestPayout(
      request.user.sub,
      parsed.data.amountCents,
    );
    return reply.code(201).send({ success: true, data: payout });
  }

  async getPayouts(request: FastifyRequest, reply: FastifyReply) {
    const payouts = await this.service.getPayouts(request.user.sub);
    return reply.send({ success: true, data: payouts });
  }
}
