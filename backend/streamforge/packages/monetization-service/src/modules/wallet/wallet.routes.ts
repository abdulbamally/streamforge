import type { FastifyPluginAsync } from "fastify";
import { authenticate } from "../../middleware/auth.middleware";
import { WalletController } from "./wallet.controller";

const controller = new WalletController();

export const walletRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/top-up",
    { preHandler: [authenticate] },
    controller.topUp.bind(controller),
  );
  app.get(
    "/:userId",
    { preHandler: [authenticate] },
    controller.getWallet.bind(controller),
  );
};
