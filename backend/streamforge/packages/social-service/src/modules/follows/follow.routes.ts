import { FastifyPluginAsync } from "fastify";
import { FollowController } from "./follow.controller";

const controller = new FollowController();

export const followRoutes: FastifyPluginAsync = async (app) => {
  app.post("/:creatorId", controller.createFollow.bind(controller));
  app.delete("/:creatorId", controller.removeFollow.bind(controller));
};
