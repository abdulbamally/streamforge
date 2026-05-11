import { FastifyRequest, FastifyReply } from "fastify";
import { PresenceService } from "./presence.service";

export class PresenceController {
  private service = new PresenceService();

  async joinStream(request: FastifyRequest, reply: FastifyReply) {
    const payload = request.body as any;
    const session = await this.service.createPresence(payload);
    return reply.code(201).send({ data: session });
  }

  async leaveStream(request: FastifyRequest, reply: FastifyReply) {
    const payload = request.body as any;
    const session = await this.service.endPresence(payload);
    return reply.send({ data: session });
  }
}
