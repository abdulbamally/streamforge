import { FastifyPluginAsync } from "fastify";
import { ProfileController } from "./profile.controller";

const controller = new ProfileController();

export const profileRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", controller.listProfiles.bind(controller));
  app.get("/:id", controller.getProfile.bind(controller));
};
