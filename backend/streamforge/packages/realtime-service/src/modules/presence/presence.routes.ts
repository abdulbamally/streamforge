import { FastifyPluginAsync } from "fastify";
import { PresenceController } from "./presence.controller";

const controller = new PresenceController();

export const presenceRoutes: FastifyPluginAsync = async (app) => {
  app.post("/join", controller.joinStream.bind(controller));
  app.post("/leave", controller.leaveStream.bind(controller));
};
