'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/env';
import type { ActionResult } from './profile';

const NOT_CONFIGURED_EXPORT = { ok: false, error: 'Backend non configuré. Voir ONBOARDING.md.' };
const NOT_CONFIGURED_ACTION: ActionResult = { error: 'Backend non configuré. Voir ONBOARDING.md.' };

export async function exportUserDataAction(): Promise<{ ok: boolean; data?: any; error?: string }> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED_EXPORT;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: 'Non authentifié' };

  try {
    // 1. Get Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // 2. Get Vehicles
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', user.id);

    // 3. Get Fuel entries
    const { data: fuelEntries } = await supabase
      .from('fuel_entries')
      .select('*')
      .eq('user_id', user.id);

    // 4. Get Maintenance entries
    const { data: maintenanceEntries } = await supabase
      .from('maintenance_entries')
      .select('*')
      .eq('user_id', user.id);

    // 5. Get Maintenance alerts
    const { data: maintenanceAlerts } = await supabase
      .from('maintenance_alerts')
      .select('*')
      .eq('user_id', user.id);

    // 6. Get Subscriptions
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id);

    // 7. Get Audit logs
    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', user.id);

    const exportData = {
      exportedAt: new Date().toISOString(),
      userId: user.id,
      email: user.email,
      profile: profile || null,
      vehicles: vehicles || [],
      fuelEntries: fuelEntries || [],
      maintenanceEntries: maintenanceEntries || [],
      maintenanceAlerts: maintenanceAlerts || [],
      subscriptions: subscriptions || [],
      auditLogs: auditLogs || [],
    };

    return { ok: true, data: exportData };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Erreur lors de la récupération des données',
    };
  }
}

export async function deleteAccountAction(): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED_ACTION;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Non authentifié' };

  try {
    const admin = createAdminClient();
    
    // Stripe cleanup if customer exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profile?.stripe_customer_id) {
      // In a real application, you might cancel their subscription on Stripe here
      // But we will allow the database cascade deletion to handle local records first.
    }

    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      return { error: `Échec de la suppression : ${error.message}` };
    }

    return { ok: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Une erreur est survenue lors de la suppression de votre compte',
    };
  }
}
