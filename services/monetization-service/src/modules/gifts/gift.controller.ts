import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { GiftService } from "./gift.service";

const sendBody = z.object({
  receiverId: z.string().min(1),
  coinAmount: z.number().int().positive(),
  giftType: z.string().min(1).max(64),
  streamId: z.string().min(1).optional(),
});

export class GiftController {
  private service = new GiftService();

  async sendGift(request: FastifyRequest, reply: FastifyReply) {
    const parsed = sendBody.safeParse(request.body);
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
    const gift = await this.service.sendGift({
      senderId: request.user.sub,
      receiverId: parsed.data.receiverId,
      streamId: parsed.data.streamId,
      coinAmount: parsed.data.coinAmount,
      giftType: parsed.data.giftType,
    });
    return reply.code(201).send({ success: true, data: gift });
  }

  async getReceivedGifts(request: FastifyRequest, reply: FastifyReply) {
    const receiverId = (request.params as { receiverId: string }).receiverId;
    if (receiverId !== request.user.sub) {
      return reply.status(403).send({
        success: false,
        error: { code: "AUTHZ_002", message: "Cannot read another user's gifts" },
      });
    }
    const gifts = await this.service.getReceivedGifts(receiverId);
    return reply.send({ success: true, data: gifts });
  }
}
