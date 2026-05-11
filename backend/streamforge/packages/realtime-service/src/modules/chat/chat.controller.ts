import { FastifyRequest, FastifyReply } from "fastify";
import { ChatService } from "./chat.service";

export class ChatController {
  private service = new ChatService();

  async sendMessage(request: FastifyRequest, reply: FastifyReply) {
    const payload = request.body as any;
    const message = await this.service.createMessage(payload);
    return reply.code(201).send({ data: message });
  }

  async getMessages(request: FastifyRequest, reply: FastifyReply) {
    const roomId = (request.params as any).roomId as string;
    const messages = await this.service.getRoomMessages(roomId);
    return reply.send({ data: messages });
  }
}
