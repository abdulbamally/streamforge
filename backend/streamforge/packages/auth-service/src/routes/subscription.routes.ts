// ============================================================
//  Subscription Routes — /api/subscriptions/*
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { CreateCheckoutSchema, CreateRegionalCheckoutSchema } from '../schemas/auth.schema'
import { authenticate, validateBody } from '../middleware/auth.middleware'
import { SubscriptionService } from '../services/subscription.service'
import { PLAN_LIMITS } from '@streamforge/shared/types'

export async function subscriptionRoutes(app: FastifyInstance): Promise<void> {
  const subscriptionService = new SubscriptionService()

  // ─── GET /api/subscriptions/plans ───────────────────────────
  app.get(
    '/plans',
    {
      schema: {
        tags: ['Subscription'],
        summary: 'Get all available plans and their limits',
      },
    },
    async (_request, reply: FastifyReply) => {
      return reply.send({
        success: true,
        data: {
          plans: [
            {
              id:    'FREE',
              name:  'Free',
              price: 0,
              limits: PLAN_LIMITS.FREE,
            },
            {
              id:       'PRO',
              name:     'Pro',
              price:    1499, // $14.99/mo in cents
              priceId:  process.env.STRIPE_PRO_PRICE_ID,
              limits:   PLAN_LIMITS.PRO,
              popular:  true,
            },
            {
              id:      'CREATOR',
              name:    'Creator',
              price:   2999, // $29.99/mo
              priceId: process.env.STRIPE_CREATOR_PRICE_ID,
              limits:  PLAN_LIMITS.CREATOR,
            },
            {
              id:      'ENTERPRISE',
              name:    'Enterprise',
              price:   null, // Contact sales
              priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
              limits:  PLAN_LIMITS.ENTERPRISE,
            },
          ],
        },
      })
    }
  )

  // ─── GET /api/subscriptions/me ───────────────────────────────
  app.get(
    '/me',
    {
      schema: {
        tags: ['Subscription'],
        summary: 'Get current user subscription details',
        security: [{ BearerAuth: [] }],
      },
      preHandler: [authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const subscription = await subscriptionService.getSubscription(request.user.sub)

      return reply.send({
        success: true,
        data: subscription ?? {
          plan:   'FREE',
          status: 'ACTIVE',
          limits: PLAN_LIMITS.FREE,
        },
      })
    }
  )

  // ─── POST /api/subscriptions/checkout ────────────────────────
  app.post(
    '/checkout',
    {
      schema: {
        tags: ['Subscription'],
        summary: 'Create a Stripe checkout session',
        security: [{ BearerAuth: [] }],
        body: {
          type: 'object',
          required: ['priceId'],
          properties: {
            priceId:    { type: 'string' },
            successUrl: { type: 'string' },
            cancelUrl:  { type: 'string' },
          },
        },
      },
      preHandler: [authenticate, validateBody(CreateCheckoutSchema)],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const dto = CreateCheckoutSchema.parse(request.body)
      const { url } = await subscriptionService.createCheckoutSession(
        request.user.sub,
        dto.priceId,
        dto.successUrl,
        dto.cancelUrl
      )

      return reply.send({ success: true, data: { url } })
    }
  )

  // ─── POST /api/subscriptions/checkout/regional ───────────────
  app.post(
    '/checkout/regional',
    {
      schema: {
        tags: ['Subscription'],
        summary: 'Create a regional checkout session (Stripe/Flutterwave/Paystack)',
        security: [{ BearerAuth: [] }],
        body: {
          type: 'object',
          required: ['priceId', 'provider'],
          properties: {
            priceId: { type: 'string' },
            provider: { type: 'string', enum: ['stripe', 'flutterwave', 'paystack'] },
            countryCode: { type: 'string', minLength: 2, maxLength: 2 },
            successUrl: { type: 'string' },
            cancelUrl: { type: 'string' },
          },
        },
      },
      preHandler: [authenticate, validateBody(CreateRegionalCheckoutSchema)],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const dto = CreateRegionalCheckoutSchema.parse(request.body)
      const { url } = await subscriptionService.createRegionalCheckoutSession(
        request.user.sub,
        dto.provider,
        dto.priceId,
        dto.successUrl,
        dto.cancelUrl,
        dto.countryCode
      )

      return reply.send({ success: true, data: { url } })
    }
  )

  // ─── POST /api/subscriptions/portal ──────────────────────────
  app.post(
    '/portal',
    {
      schema: {
        tags: ['Subscription'],
        summary: 'Create a Stripe billing portal session',
        security: [{ BearerAuth: [] }],
      },
      preHandler: [authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { url } = await subscriptionService.createPortalSession(request.user.sub)
      return reply.send({ success: true, data: { url } })
    }
  )

  // ─── POST /api/subscriptions/webhook ─────────────────────────
  // NOTE: Must receive raw body — register BEFORE JSON body parser
  app.post(
    '/webhook',
    {
      config: {
        rawBody: true,
        rateLimit: { max: 1000, timeWindow: '1m' }, // Stripe can send bursts
      },
      schema: {
        tags: ['Subscription'],
        summary: 'Stripe webhook endpoint (Stripe → server)',
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const signature = request.headers['stripe-signature'] as string

      if (!signature) {
        return reply.status(400).send({ received: false })
      }

      await subscriptionService.handleWebhook(
        (request as any).rawBody,
        signature
      )

      return reply.send({ received: true })
    }
  )
}
