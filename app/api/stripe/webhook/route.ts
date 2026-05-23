import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { env } from '@/lib/env';
import { trackCriticalError } from '@/lib/telemetry';

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
    const errorObj = err instanceof Error ? err : new Error(msg);
    // Track Stripe validation / signature failure as Stripe critical error
    trackCriticalError(errorObj, 'stripe');
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
    const errorObj = e instanceof Error ? e : new Error(String(e));
    const isSupabase = errorObj.message.includes('Supabase error');
    
    // Track database/webhook process error
    trackCriticalError(errorObj, isSupabase ? 'supabase' : 'stripe');

    const msg = errorObj.message;
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function syncSubscription(
  admin: ReturnType<typeof createAdminClient>,
  sub: Stripe.Subscription,
) {
  // Find user via stripe_customer_id
  const { data: profile, error: findError } = await admin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', sub.customer as string)
    .single();
  
  if (findError) {
    if (findError.code !== 'PGRST116') {
      throw new Error(`Supabase error (profile find): ${findError.message}`);
    }
    return;
  }

  const priceId = sub.items.data[0]?.price.id;
  const subTier: 'premium' | 'family' =
    priceId === env.stripePriceFamilyMonthly() || priceId === env.stripePriceFamilyYearly()
      ? 'family'
      : 'premium';

  const planTier: 'free' | 'premium' | 'family' =
    sub.status === 'active' || sub.status === 'trialing' ? subTier : 'free';

  const { error: updateError } = await admin
    .from('profiles')
    .update({ plan_tier: planTier })
    .eq('id', profile.id);
  
  if (updateError) {
    throw new Error(`Supabase error (profile update): ${updateError.message}`);
  }

  const { error: upsertError } = await admin.from('subscriptions').upsert(
    {
      user_id: profile.id,
      stripe_subscription_id: sub.id,
      tier: subTier,
      status: sub.status,
      current_period_end: new Date(
        (sub as unknown as { current_period_end: number }).current_period_end *
          1000,
      ).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end,
    },
    { onConflict: 'stripe_subscription_id' },
  );

  if (upsertError) {
    throw new Error(`Supabase error (subscription upsert): ${upsertError.message}`);
  }
}

async function downgradeUserByCustomer(
  admin: ReturnType<typeof createAdminClient>,
  customerId: string,
) {
  const { data: profile, error: findError } = await admin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (findError) {
    if (findError.code !== 'PGRST116') {
      throw new Error(`Supabase error (profile find for downgrade): ${findError.message}`);
    }
    return;
  }

  const { error: updateError } = await admin
    .from('profiles')
    .update({ plan_tier: 'free' })
    .eq('id', profile.id);

  if (updateError) {
    throw new Error(`Supabase error (profile downgrade): ${updateError.message}`);
  }
}
