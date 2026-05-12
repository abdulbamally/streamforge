import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { WalletService } from "./wallet.service";

const topUpBody = z.object({
  amountCents: z.number().int().positive(),
});

export class WalletController {
  private service = new WalletService();

  async getWallet(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.params as { userId: string }).userId;
    if (userId !== request.user.sub) {
      return reply.status(403).send({
        success: false,
        error: { code: "AUTHZ_002", message: "Cannot access another user's wallet" },
      });
    }
    const wallet = await this.service.getWallet(userId);
    return reply.send({ success: true, data: wallet });
  }

  async topUp(request: FastifyRequest, reply: FastifyReply) {
    const parsed = topUpBody.safeParse(request.body);
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
    const result = await this.service.topUp(request.user.sub, parsed.data.amountCents);
    return reply.code(201).send({ success: true, data: result });
  }
}
