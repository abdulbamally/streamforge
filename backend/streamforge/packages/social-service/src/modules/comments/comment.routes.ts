import { FastifyPluginAsync } from "fastify";
import { CommentController } from "./comment.controller";

const controller = new CommentController();

export const commentRoutes: FastifyPluginAsync = async (app) => {
  app.post("/", controller.createComment.bind(controller));
  app.get("/:streamId", controller.getComments.bind(controller));
};
