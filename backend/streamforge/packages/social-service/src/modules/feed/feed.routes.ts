import { FastifyPluginAsync } from "fastify";
import { FeedController } from "./feed.controller";

const controller = new FeedController();

export const feedRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", controller.getFeed.bind(controller));
  app.get("/trending", controller.getTrending.bind(controller));
  app.get("/recommended", controller.getRecommended.bind(controller));
};
