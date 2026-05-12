import type { FastifyReply, FastifyRequest } from "fastify";
import { ProfileService } from "./profile.service";

export class ProfileController {
  private service = new ProfileService();

  async listProfiles(request: FastifyRequest, reply: FastifyReply) {
    const profiles = await this.service.getAllProfiles();
    return reply.send({ success: true, data: profiles });
  }

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const id = (request.params as { id: string }).id;
    const profile = await this.service.getProfileByUserId(id);
    if (!profile) {
      return reply.status(404).send({
        success: false,
        error: { code: "SRV_002", message: "Profile not found" },
      });
    }
    return reply.send({ success: true, data: profile });
  }
}
