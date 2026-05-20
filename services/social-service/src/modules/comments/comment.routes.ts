import type { FastifyPluginAsync } from "fastify";
import { authenticate } from "../../middleware/auth.middleware";
import { CommentController } from "./comment.controller";

const controller = new CommentController();

export const commentRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/",
    { preHandler: [authenticate] },
    controller.createComment.bind(controller),
  );
  app.get("/:streamId", controller.getComments.bind(controller));
};
