import { FastifyRequest, FastifyReply } from "fastify";
import { WalletService } from "./wallet.service";

export class WalletController {
  private service = new WalletService();

  async getWallet(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.params as any).userId as string;
    const wallet = await this.service.getWallet(userId);
    return reply.send({ data: wallet });
  }

  async topUp(request: FastifyRequest, reply: FastifyReply) {
    const payload = request.body as any;
    const result = await this.service.topUp(payload.userId, payload.amount);
    return reply.code(201).send({ data: result });
  }
}
