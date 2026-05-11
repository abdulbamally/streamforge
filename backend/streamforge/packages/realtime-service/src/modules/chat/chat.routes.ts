import { FastifyPluginAsync } from "fastify";
import { ChatController } from "./chat.controller";

const controller = new ChatController();

export const chatRoutes: FastifyPluginAsync = async (app) => {
  app.post("/", controller.sendMessage.bind(controller));
  app.get("/:roomId", controller.getMessages.bind(controller));
};
