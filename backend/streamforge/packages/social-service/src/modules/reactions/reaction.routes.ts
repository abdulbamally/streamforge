import { FastifyPluginAsync } from "fastify";
import { ReactionController } from "./reaction.controller";

const controller = new ReactionController();

export const reactionRoutes: FastifyPluginAsync = async (app) => {
  app.post("/", controller.createReaction.bind(controller));
  app.get("/:streamId", controller.getReactions.bind(controller));
};
