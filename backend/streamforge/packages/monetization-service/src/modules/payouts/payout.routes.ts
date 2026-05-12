import type { FastifyPluginAsync } from "fastify";
import { authenticate } from "../../middleware/auth.middleware";
import { PayoutController } from "./payout.controller";

const controller = new PayoutController();

export const payoutRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/",
    { preHandler: [authenticate] },
    controller.getPayouts.bind(controller),
  );
  app.post(
    "/",
    { preHandler: [authenticate] },
    controller.requestPayout.bind(controller),
  );
};
