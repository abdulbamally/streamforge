import { FastifyPluginAsync } from 'fastify';
import { PayoutController } from './payout.controller';

const controller = new PayoutController();

export const payoutRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', controller.requestPayout.bind(controller));
  app.get('/:userId', controller.getPayouts.bind(controller));
};
