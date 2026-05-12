import type { FastifyPluginAsync } from "fastify";
import { authenticate } from "../../middleware/auth.middleware";
import { GiftController } from "./gift.controller";

const controller = new GiftController();

export const giftRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/",
    { preHandler: [authenticate] },
    controller.sendGift.bind(controller),
  );
  app.get(
    "/received/:receiverId",
    { preHandler: [authenticate] },
    controller.getReceivedGifts.bind(controller),
  );
};
