import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RELEVANT_EVENTS = new Set<Stripe.Event.Type>([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }
  const body = await req.text();
  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, env.stripeWebhookSecret());
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bad signature';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (!RELEVANT_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true, ignored: true });
  }

  try {
    const admin = createAdminClient();

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );
        await syncSubscription(admin, sub);
      }
      return NextResponse.json({ received: true });
    }

    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated'
    ) {
      const sub = event.data.object as Stripe.Subscription;
      await syncSubscription(admin, sub);
      return NextResponse.json({ received: true });
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      await downgradeUserByCustomer(admin, sub.customer as string);
      return NextResponse.json({ received: true });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Webhook error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function syncSubscription(
  admin: ReturnType<typeof createAdminClient>,
  sub: Stripe.Subscription,
) {
  // Find user via stripe_customer_id
  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', sub.customer as string)
    .single();
  if (!profile) return;

  const tier: 'free' | 'premium' =
    sub.status === 'active' || sub.status === 'trialing' ? 'premium' : 'free';

  await admin
    .from('profiles')
    .update({ plan_tier: tier })
    .eq('id', profile.id);

  await admin.from('subscriptions').upsert(
    {
      user_id: profile.id,
      stripe_subscription_id: sub.id,
      tier: 'premium',
      status: sub.status,
      current_period_end: new Date(
        (sub as unknown as { current_period_end: number }).current_period_end *
          1000,
      ).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end,
    },
    { onConflict: 'stripe_subscription_id' },
  );
}

async function downgradeUserByCustomer(
  admin: ReturnType<typeof createAdminClient>,
  customerId: string,
) {
  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  if (!profile) return;
  await admin.from('profiles').update({ plan_tier: 'free' }).eq('id', profile.id);
}
