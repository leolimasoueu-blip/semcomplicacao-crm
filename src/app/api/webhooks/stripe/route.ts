import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe/client'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = getSupabaseAdminClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const workspaceId = session.metadata?.workspace_id
    if (!workspaceId) return NextResponse.json({ received: true })

    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

    await admin
      .from('subscriptions')
      .update({
        plan: 'pro',
        status: 'active',
        stripe_subscription_id: subscription.id,
        current_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
      })
      .eq('workspace_id', workspaceId)
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const workspaceId = (subscription.metadata?.workspace_id) as string | undefined

    const lookup = workspaceId
      ? admin.from('subscriptions').update({ plan: 'free', status: 'canceled', stripe_subscription_id: null }).eq('workspace_id', workspaceId)
      : admin.from('subscriptions').update({ plan: 'free', status: 'canceled', stripe_subscription_id: null }).eq('stripe_subscription_id', subscription.id)

    await lookup
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const subscriptionId = (invoice as unknown as { subscription: string | null }).subscription

    if (subscriptionId) {
      await admin
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_subscription_id', subscriptionId)
    }
  }

  return NextResponse.json({ received: true })
}
