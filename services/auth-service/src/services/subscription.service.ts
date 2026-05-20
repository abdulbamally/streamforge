// ============================================================
//  SubscriptionService — Stripe billing integration
// ============================================================

import Stripe from 'stripe'
import crypto from 'node:crypto'
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

const PRICE_TO_AMOUNT_CENTS: Record<string, number> = {
  [config.STRIPE_PRO_PRICE_ID]: 1499,
  [config.STRIPE_CREATOR_PRICE_ID]: 2999,
}

type PaymentProvider = 'stripe' | 'flutterwave' | 'paystack'

export class SubscriptionService {
  private stripe: Stripe

  constructor() {
    this.stripe = new Stripe(config.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
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

  // ─── Create Regional Checkout Session ─────────────────────────
  async createRegionalCheckoutSession(
    userId: string,
    provider: PaymentProvider,
    priceId: string,
    successUrl?: string,
    cancelUrl?: string,
    countryCode?: string
  ): Promise<{ url: string }> {
    if (provider === 'stripe') {
      return this.createCheckoutSession(userId, priceId, successUrl, cancelUrl)
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw createAppError(404, ErrorCodes.NOT_FOUND, 'User not found')
    }

    const amountCents = PRICE_TO_AMOUNT_CENTS[priceId]
    if (!amountCents) {
      throw createAppError(400, ErrorCodes.VALIDATION_ERROR, 'Unsupported regional priceId')
    }

    const plan = PRICE_TO_PLAN[priceId]
    if (!plan || plan === 'FREE') {
      throw createAppError(400, ErrorCodes.VALIDATION_ERROR, 'Invalid plan for checkout')
    }

    if (provider === 'flutterwave') {
      return this.createFlutterwaveCheckout({
        userId,
        email: user.email,
        name: user.displayName ?? user.username,
        amountCents,
        plan,
        priceId,
        successUrl,
        cancelUrl,
        countryCode,
      })
    }

    return this.createPaystackCheckout({
      userId,
      email: user.email,
      amountCents,
      plan,
      priceId,
      successUrl,
      cancelUrl,
      countryCode,
    })
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

  // ─── Flutterwave Webhook Handler ──────────────────────────────
  async handleFlutterwaveWebhook(rawBody: Buffer, signature?: string): Promise<void> {
    if (!config.FLUTTERWAVE_WEBHOOK_HASH) {
      throw createAppError(503, ErrorCodes.INTERNAL_ERROR, 'Flutterwave webhook hash not configured')
    }

    if (!signature || signature !== config.FLUTTERWAVE_WEBHOOK_HASH) {
      logger.warn('Invalid Flutterwave webhook signature')
      throw createAppError(400, ErrorCodes.VALIDATION_ERROR, 'Invalid webhook signature')
    }

    const event = JSON.parse(rawBody.toString('utf8')) as any
    const eventType = event?.event as string | undefined
    const payload = event?.data ?? {}
    const meta = payload?.meta ?? {}

    logger.info({ eventType }, 'Flutterwave webhook received')

    const userId = meta.userId as string | undefined
    const plan = (meta.plan as Plan | undefined) ?? 'FREE'
    const transactionRef = (payload?.id ? String(payload.id) : undefined) ?? (payload?.tx_ref as string | undefined)

    if (!userId) {
      logger.warn({ eventType }, 'Flutterwave webhook ignored: missing metadata.userId')
      return
    }

    if (eventType === 'charge.completed' && payload?.status === 'successful') {
      await this.upsertRegionalSubscription({
        userId,
        plan,
        status: 'ACTIVE',
        provider: 'flutterwave',
      })

      await this.createProviderInvoice({
        userId,
        provider: 'flutterwave',
        providerInvoiceId: transactionRef ?? `flw-${userId}-${Date.now()}`,
        amountCents: Number(payload?.amount ? Math.round(Number(payload.amount) * 100) : 0),
        currency: String(payload?.currency ?? 'usd').toLowerCase(),
        status: 'paid',
      })

      return
    }

    if (eventType === 'charge.failed') {
      await this.markRegionalSubscriptionPastDue(userId)
      return
    }

    logger.debug({ eventType }, 'Unhandled Flutterwave webhook event')
  }

  // ─── Paystack Webhook Handler ─────────────────────────────────
  async handlePaystackWebhook(rawBody: Buffer, signature?: string): Promise<void> {
    if (!config.PAYSTACK_SECRET_KEY) {
      throw createAppError(503, ErrorCodes.INTERNAL_ERROR, 'Paystack secret not configured')
    }

    const computed = crypto
      .createHmac('sha512', config.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest('hex')

    if (!signature || signature !== computed) {
      logger.warn('Invalid Paystack webhook signature')
      throw createAppError(400, ErrorCodes.VALIDATION_ERROR, 'Invalid webhook signature')
    }

    const event = JSON.parse(rawBody.toString('utf8')) as any
    const eventType = event?.event as string | undefined
    const payload = event?.data ?? {}
    const meta = payload?.metadata ?? {}

    logger.info({ eventType }, 'Paystack webhook received')

    const userId = meta.userId as string | undefined
    const plan = (meta.plan as Plan | undefined) ?? 'FREE'
    const reference = payload?.reference as string | undefined

    if (!userId) {
      logger.warn({ eventType }, 'Paystack webhook ignored: missing metadata.userId')
      return
    }

    if (eventType === 'charge.success') {
      await this.upsertRegionalSubscription({
        userId,
        plan,
        status: 'ACTIVE',
        provider: 'paystack',
      })

      await this.createProviderInvoice({
        userId,
        provider: 'paystack',
        providerInvoiceId: reference ?? `pay-${userId}-${Date.now()}`,
        amountCents: Number(payload?.amount ?? 0),
        currency: String(payload?.currency ?? 'usd').toLowerCase(),
        status: 'paid',
      })
      return
    }

    if (eventType === 'charge.failed' || eventType === 'invoice.payment_failed') {
      await this.markRegionalSubscriptionPastDue(userId)
      return
    }

    if (eventType === 'subscription.disable') {
      await prisma.subscription.updateMany({
        where: { userId },
        data: {
          plan: 'FREE',
          status: 'CANCELLED',
          stripeSubId: null,
        },
      })
      return
    }

    logger.debug({ eventType }, 'Unhandled Paystack webhook event')
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

  private async createFlutterwaveCheckout(input: {
    userId: string
    email: string
    name: string
    amountCents: number
    plan: Plan
    priceId: string
    successUrl?: string
    cancelUrl?: string
    countryCode?: string
  }): Promise<{ url: string }> {
    if (!config.FLUTTERWAVE_SECRET_KEY) {
      throw createAppError(503, ErrorCodes.INTERNAL_ERROR, 'Flutterwave is not configured')
    }

    const txRef = `sf-${input.userId}-${Date.now()}`
    const redirectUrl = input.successUrl ?? config.FLUTTERWAVE_REDIRECT_URL ?? `${config.FRONTEND_URL}/subscription/success`
    const amount = Number((input.amountCents / 100).toFixed(2))

    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount,
        currency: 'USD',
        redirect_url: redirectUrl,
        customer: {
          email: input.email,
          name: input.name,
        },
        customizations: {
          title: `StreamForge ${input.plan}`,
          description: `${input.plan} monthly subscription`,
        },
        meta: {
          userId: input.userId,
          plan: input.plan,
          priceId: input.priceId,
          provider: 'flutterwave',
          countryCode: input.countryCode ?? null,
          cancelUrl: input.cancelUrl ?? null,
        },
      }),
    })

    const payload = (await response.json()) as any
    const url = payload?.data?.link as string | undefined

    if (!response.ok || !url) {
      logger.error({ payload, status: response.status }, 'Flutterwave checkout create failed')
      throw createAppError(502, ErrorCodes.INTERNAL_ERROR, 'Failed to create Flutterwave checkout')
    }

    return { url }
  }

  private async createPaystackCheckout(input: {
    userId: string
    email: string
    amountCents: number
    plan: Plan
    priceId: string
    successUrl?: string
    cancelUrl?: string
    countryCode?: string
  }): Promise<{ url: string }> {
    if (!config.PAYSTACK_SECRET_KEY) {
      throw createAppError(503, ErrorCodes.INTERNAL_ERROR, 'Paystack is not configured')
    }

    const callbackUrl = input.successUrl ?? config.PAYSTACK_REDIRECT_URL ?? `${config.FRONTEND_URL}/subscription/success`
    const reference = `sf-${input.userId}-${Date.now()}`

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: input.email,
        amount: input.amountCents,
        currency: 'USD',
        callback_url: callbackUrl,
        reference,
        metadata: {
          userId: input.userId,
          plan: input.plan,
          priceId: input.priceId,
          provider: 'paystack',
          countryCode: input.countryCode ?? null,
          cancelUrl: input.cancelUrl ?? null,
        },
      }),
    })

    const payload = (await response.json()) as any
    const url = payload?.data?.authorization_url as string | undefined

    if (!response.ok || !url) {
      logger.error({ payload, status: response.status }, 'Paystack checkout create failed')
      throw createAppError(502, ErrorCodes.INTERNAL_ERROR, 'Failed to create Paystack checkout')
    }

    return { url }
  }

  private async upsertRegionalSubscription(input: {
    userId: string
    plan: Plan
    status: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'INCOMPLETE'
    provider: 'flutterwave' | 'paystack'
  }): Promise<void> {
    const placeholderCustomerId = `pending_${input.provider}_${input.userId}`
    await prisma.subscription.upsert({
      where: { userId: input.userId },
      create: {
        userId: input.userId,
        stripeCustomerId: placeholderCustomerId,
        plan: input.plan,
        status: input.status,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      update: {
        plan: input.plan,
        status: input.status,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
      },
    })
  }

  private async markRegionalSubscriptionPastDue(userId: string): Promise<void> {
    await prisma.subscription.updateMany({
      where: { userId },
      data: { status: 'PAST_DUE' },
    })
  }

  private async createProviderInvoice(input: {
    userId: string
    provider: 'flutterwave' | 'paystack'
    providerInvoiceId: string
    amountCents: number
    currency: string
    status: string
  }): Promise<void> {
    const sub = await prisma.subscription.findUnique({ where: { userId: input.userId } })
    if (!sub) return

    await prisma.invoice.upsert({
      where: { stripeInvoiceId: `${input.provider}:${input.providerInvoiceId}` },
      create: {
        subscriptionId: sub.id,
        stripeInvoiceId: `${input.provider}:${input.providerInvoiceId}`,
        amount: input.amountCents,
        currency: input.currency,
        status: input.status,
        paidAt: input.status === 'paid' ? new Date() : null,
      },
      update: {
        amount: input.amountCents,
        currency: input.currency,
        status: input.status,
        paidAt: input.status === 'paid' ? new Date() : null,
      },
    })
  }
}
