// ============================================================
//  SubscriptionService — Stripe billing integration
// ============================================================

import Stripe from 'stripe'
import { config } from '../utils/config'
import { prisma } from '../utils/prisma'
import { logger } from '../utils/logger'
import { createAppError } from '../utils/errors'
import { ErrorCodes } from '@streamforge/shared/types'
import type { Plan } from '@streamforge/shared/types'

const PRICE_TO_PLAN: Record<string, Plan> = {
  [config.STRIPE_PRO_PRICE_ID]:        'PRO',
  [config.STRIPE_CREATOR_PRICE_ID]:    'CREATOR',
  [config.STRIPE_ENTERPRISE_PRICE_ID]: 'ENTERPRISE',
}

export class SubscriptionService {
  private stripe: Stripe

  constructor() {
    this.stripe = new Stripe(config.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
    })
  }

  // ─── Create Checkout Session ─────────────────────────────────
  async createCheckoutSession(
    userId: string,
    priceId: string,
    successUrl?: string,
    cancelUrl?: string
  ): Promise<{ url: string }> {
    const user = await prisma.user.findUnique({
      where:   { id: userId },
      include: { subscription: true },
    })

    if (!user) {
      throw createAppError(404, ErrorCodes.NOT_FOUND, 'User not found')
    }

    // Ensure Stripe customer exists
    let stripeCustomerId = user.subscription?.stripeCustomerId

    if (!stripeCustomerId || stripeCustomerId.startsWith('pending_')) {
      const customer = await this.stripe.customers.create({
        email:    user.email,
        name:     user.displayName ?? user.username,
        metadata: { userId: user.id },
      })
      stripeCustomerId = customer.id

      // Update or create subscription record with real Stripe customer ID
      await prisma.subscription.upsert({
        where:  { userId },
        create: { userId, stripeCustomerId, plan: 'FREE', status: 'ACTIVE' },
        update: { stripeCustomerId },
      })
    }

    const session = await this.stripe.checkout.sessions.create({
      customer:   stripeCustomerId,
      mode:       'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl ?? `${config.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  cancelUrl  ?? `${config.FRONTEND_URL}/subscription/cancelled`,
      subscription_data: {
        trial_period_days: 14,
        metadata: { userId },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    if (!session.url) {
      throw createAppError(500, ErrorCodes.INTERNAL_ERROR, 'Failed to create checkout session')
    }

    return { url: session.url }
  }

  // ─── Create Portal Session ───────────────────────────────────
  async createPortalSession(userId: string): Promise<{ url: string }> {
    const subscription = await prisma.subscription.findUnique({ where: { userId } })

    if (!subscription || subscription.stripeCustomerId.startsWith('pending_')) {
      throw createAppError(400, ErrorCodes.VALIDATION_ERROR, 'No active subscription found')
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer:   subscription.stripeCustomerId,
      return_url: `${config.FRONTEND_URL}/settings/subscription`,
    })

    return { url: session.url }
  }

  // ─── Get Subscription ────────────────────────────────────────
  async getSubscription(userId: string) {
    return prisma.subscription.findUnique({
      where:   { userId },
      include: { invoices: { orderBy: { createdAt: 'desc' }, take: 5 } },
    })
  }

  // ─── Stripe Webhook Handler ───────────────────────────────────
  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    let event: Stripe.Event

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        config.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      logger.warn({ err }, 'Invalid Stripe webhook signature')
      throw createAppError(400, ErrorCodes.VALIDATION_ERROR, 'Invalid webhook signature')
    }

    logger.info({ type: event.type }, 'Stripe webhook received')

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        logger.debug({ type: event.type }, 'Unhandled Stripe webhook event')
    }
  }

  // ─── Webhook event handlers ───────────────────────────────────
  private async handleSubscriptionUpdated(sub: Stripe.Subscription): Promise<void> {
    const userId = sub.metadata?.userId
    if (!userId) return

    const priceId = sub.items.data[0]?.price.id
    const plan: Plan = PRICE_TO_PLAN[priceId] ?? 'FREE'

    await prisma.subscription.upsert({
      where:  { userId },
      create: {
        userId,
        stripeCustomerId:  sub.customer as string,
        stripeSubId:       sub.id,
        plan,
        status:            this.mapStripeStatus(sub.status),
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd:   new Date(sub.current_period_end   * 1000),
        cancelAtPeriodEnd:  sub.cancel_at_period_end,
        trialEnd:           sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      },
      update: {
        stripeSubId:        sub.id,
        plan,
        status:             this.mapStripeStatus(sub.status),
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd:   new Date(sub.current_period_end   * 1000),
        cancelAtPeriodEnd:  sub.cancel_at_period_end,
        trialEnd:           sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      },
    })

    logger.info({ userId, plan }, 'Subscription updated')
  }

  private async handleSubscriptionDeleted(sub: Stripe.Subscription): Promise<void> {
    const userId = sub.metadata?.userId
    if (!userId) return

    await prisma.subscription.update({
      where: { userId },
      data: {
        plan:   'FREE',
        status: 'CANCELLED',
        stripeSubId: null,
      },
    })

    logger.info({ userId }, 'Subscription cancelled — downgraded to FREE')
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string
    const sub = await prisma.subscription.findFirst({
      where: { stripeCustomerId: customerId },
    })

    if (!sub) return

    await prisma.invoice.create({
      data: {
        subscriptionId:  sub.id,
        stripeInvoiceId: invoice.id,
        amount:          invoice.amount_paid,
        currency:        invoice.currency,
        status:          'paid',
        paidAt:          new Date(),
      },
    })
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string
    const sub = await prisma.subscription.findFirst({
      where: { stripeCustomerId: customerId },
    })

    if (!sub) return

    await prisma.subscription.update({
      where: { id: sub.id },
      data:  { status: 'PAST_DUE' },
    })

    logger.warn({ customerId }, 'Invoice payment failed — subscription marked PAST_DUE')
  }

  private mapStripeStatus(status: Stripe.Subscription.Status): any {
    const map: Record<string, string> = {
      active:            'ACTIVE',
      canceled:          'CANCELLED',
      past_due:          'PAST_DUE',
      trialing:          'TRIALING',
      incomplete:        'INCOMPLETE',
      incomplete_expired: 'CANCELLED',
      unpaid:            'PAST_DUE',
      paused:            'PAST_DUE',
    }
    return map[status] ?? 'ACTIVE'
  }
}
