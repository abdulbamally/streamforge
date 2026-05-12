import type { FastifyPluginAsync } from "fastify";
import { authenticate } from "../../middleware/auth.middleware";
import { PresenceController } from "./presence.controller";

const controller = new PresenceController();

export const presenceRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/join",
    { preHandler: [authenticate] },
    controller.joinStream.bind(controller),
  );
  app.post(
    "/leave",
    { preHandler: [authenticate] },
    controller.leaveStream.bind(controller),
  );
};
