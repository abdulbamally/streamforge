import { FastifyPluginAsync } from 'fastify';
import { GiftController } from './gift.controller';

const controller = new GiftController();

export const giftRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', controller.sendGift.bind(controller));
  app.get('/:receiverId', controller.getReceivedGifts.bind(controller));
};
