import type { FastifyPluginAsync } from "fastify";
import { optionalAuthenticate } from "../../middleware/optional-auth.middleware";
import { FeedController } from "./feed.controller";

const controller = new FeedController();

export const feedRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", controller.getFeed.bind(controller));
  app.get("/trending", controller.getTrending.bind(controller));
  app.get(
    "/recommended",
    { preHandler: [optionalAuthenticate] },
    controller.getRecommended.bind(controller),
  );
};
