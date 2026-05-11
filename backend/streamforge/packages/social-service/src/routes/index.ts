import { FastifyInstance } from "fastify";
import { profileRoutes } from "../modules/profiles/profile.routes";
import { followRoutes } from "../modules/follows/follow.routes";
import { commentRoutes } from "../modules/comments/comment.routes";
import { reactionRoutes } from "../modules/reactions/reaction.routes";
import { feedRoutes } from "../modules/feed/feed.routes";

export function registerRoutes(app: FastifyInstance) {
  app.get("/", async () => ({ service: "social-service", status: "ok" }));
  app.register(profileRoutes, { prefix: "/profiles" });
  app.register(followRoutes, { prefix: "/follow" });
  app.register(commentRoutes, { prefix: "/comments" });
  app.register(reactionRoutes, { prefix: "/reactions" });
  app.register(feedRoutes, { prefix: "/feed" });
}
