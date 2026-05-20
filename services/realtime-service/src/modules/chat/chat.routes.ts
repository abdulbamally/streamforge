import type { FastifyPluginAsync } from "fastify";
import { authenticate } from "../../middleware/auth.middleware";
import { ChatController } from "./chat.controller";

const controller = new ChatController();

export const chatRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/",
    { preHandler: [authenticate] },
    controller.sendMessage.bind(controller),
  );
  app.get("/:roomId", controller.getMessages.bind(controller));
};
