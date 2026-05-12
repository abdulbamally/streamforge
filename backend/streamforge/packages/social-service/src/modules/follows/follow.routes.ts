import type { FastifyPluginAsync } from "fastify";
import { authenticate } from "../../middleware/auth.middleware";
import { FollowController } from "./follow.controller";

const controller = new FollowController();

export const followRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/:creatorId",
    { preHandler: [authenticate] },
    controller.createFollow.bind(controller),
  );
  app.delete(
    "/:creatorId",
    { preHandler: [authenticate] },
    controller.removeFollow.bind(controller),
  );
};
