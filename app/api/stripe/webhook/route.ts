import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        await handleSubscriptionCanceled(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        await handlePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        await handlePaymentFailed(invoice)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const plan = session.metadata?.plan

  if (!userId || !plan) return

  const PLAN_LIMITS: { [key: string]: number } = {
    PRO: 500,
    PREMIUM: 2000,
    ENTERPRISE: 10000,
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: plan,
      messagesLimit: PLAN_LIMITS[plan] || 50,
      messagesUsed: 0, // Resetear mensajes al actualizar plan
      stripeSubscriptionId: session.subscription as string,
      subscriptionStatus: 'ACTIVE',
    },
  })

  console.log(`✅ Checkout completed for user ${userId}, plan: ${plan}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId }
  })

  if (!user) return

  const status = subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE'

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: status,
    },
  })

  console.log(`✅ Subscription updated for user ${user.id}, status: ${status}`)
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId }
  })

  if (!user) return

  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: 'FREE',
      messagesLimit: 50,
      subscriptionStatus: 'CANCELED',
    },
  })

  console.log(`✅ Subscription canceled for user ${user.id}`)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId }
  })

  if (!user) return

  // Resetear mensajes en cada pago exitoso (renovación mensual)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      messagesUsed: 0,
      subscriptionStatus: 'ACTIVE',
    },
  })

  console.log(`✅ Payment succeeded for user ${user.id}`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId }
  })

  if (!user) return

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'PAST_DUE',
    },
  })

  console.log(`⚠️ Payment failed for user ${user.id}`)
}
