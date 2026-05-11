import { FastifyRequest, FastifyReply } from "fastify";
import { ProfileService } from "./profile.service";

export class ProfileController {
  private service = new ProfileService();

  async listProfiles(request: FastifyRequest, reply: FastifyReply) {
    const profiles = await this.service.getAllProfiles();
    return reply.send({ data: profiles });
  }

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const id = (request.params as any).id as string;
    const profile = await this.service.getProfileById(id);
    return reply.send({ data: profile });
  }
}
