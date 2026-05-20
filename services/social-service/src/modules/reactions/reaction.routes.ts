import type { FastifyPluginAsync } from "fastify";
import { authenticate } from "../../middleware/auth.middleware";
import { ReactionController } from "./reaction.controller";

const controller = new ReactionController();

export const reactionRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/",
    { preHandler: [authenticate] },
    controller.createReaction.bind(controller),
  );
  app.get("/:streamId", controller.getReactions.bind(controller));
};
