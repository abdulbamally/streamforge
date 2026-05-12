import type { FastifyInstance } from "fastify";
import { walletRoutes } from "../modules/wallet/wallet.routes";
import { giftRoutes } from "../modules/gifts/gift.routes";
import { payoutRoutes } from "../modules/payouts/payout.routes";

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    success: true,
    data: { service: "monetization-service", status: "ok" },
  }));

  await app.register(
    async (v1) => {
      await v1.register(walletRoutes, { prefix: "/wallet" });
      await v1.register(giftRoutes, { prefix: "/gifts" });
      await v1.register(payoutRoutes, { prefix: "/payouts" });
    },
    { prefix: "/api/v1" },
  );
}
