import type { FastifyInstance } from "fastify";
import { profileRoutes } from "../modules/profiles/profile.routes";
import { followRoutes } from "../modules/follows/follow.routes";
import { commentRoutes } from "../modules/comments/comment.routes";
import { reactionRoutes } from "../modules/reactions/reaction.routes";
import { feedRoutes } from "../modules/feed/feed.routes";

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    success: true,
    data: { service: "social-service", status: "ok" },
  }));

  await app.register(
    async (v1) => {
      await v1.register(profileRoutes, { prefix: "/profiles" });
      await v1.register(followRoutes, { prefix: "/follow" });
      await v1.register(commentRoutes, { prefix: "/comments" });
      await v1.register(reactionRoutes, { prefix: "/reactions" });
      await v1.register(feedRoutes, { prefix: "/feed" });
    },
    { prefix: "/api/v1" },
  );
}
