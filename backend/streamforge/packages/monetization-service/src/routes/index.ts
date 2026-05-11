import { FastifyInstance } from "fastify";
import { walletRoutes } from "../modules/wallet/wallet.routes";
import { giftRoutes } from "../modules/gifts/gift.routes";
import { payoutRoutes } from "../modules/payouts/payout.routes";

export function registerRoutes(app: FastifyInstance) {
  app.get("/", async () => ({ service: "monetization-service", status: "ok" }));
  app.register(walletRoutes, { prefix: "/wallet" });
  app.register(giftRoutes, { prefix: "/gifts" });
  app.register(payoutRoutes, { prefix: "/payouts" });
}
