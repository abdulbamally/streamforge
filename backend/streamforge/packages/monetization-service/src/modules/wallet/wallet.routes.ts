import { FastifyPluginAsync } from "fastify";
import { WalletController } from "./wallet.controller";

const controller = new WalletController();

export const walletRoutes: FastifyPluginAsync = async (app) => {
  app.get("/:userId", controller.getWallet.bind(controller));
  app.post("/top-up", controller.topUp.bind(controller));
};
