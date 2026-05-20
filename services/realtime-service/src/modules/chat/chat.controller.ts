import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { ChatService } from "./chat.service";

const createBody = z.object({
  roomId: z.string().min(1),
  message: z.string().min(1),
});

export class ChatController {
  private service = new ChatService();

  async sendMessage(request: FastifyRequest, reply: FastifyReply) {
    const parsed = createBody.safeParse(request.body);
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
    const message = await this.service.createMessage({
      roomId: parsed.data.roomId,
      userId: request.user.sub,
      message: parsed.data.message,
    });
    return reply.code(201).send({ success: true, data: message });
  }

  async getMessages(request: FastifyRequest, reply: FastifyReply) {
    const roomId = (request.params as { roomId: string }).roomId;
    const messages = await this.service.getRoomMessages(roomId);
    return reply.send({ success: true, data: messages });
  }
}
