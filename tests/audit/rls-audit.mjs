#!/usr/bin/env node
/**
 * RLS audit — verifies that user B cannot access user A's data.
 *
 * Prerequisites:
 *   - Supabase project running with migrations applied
 *   - Two test users created (set SUPABASE_TEST_USER_A_EMAIL/PASS, _B_EMAIL/PASS)
 *   - User A has at least one vehicle
 *
 * Usage:
 *   node tests/audit/rls-audit.mjs
 *
 * Exits 0 if RLS is correctly enforced, 1 otherwise.
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY;
const A_EMAIL = process.env.SUPABASE_TEST_USER_A_EMAIL;
const A_PASS = process.env.SUPABASE_TEST_USER_A_PASSWORD;
const B_EMAIL = process.env.SUPABASE_TEST_USER_B_EMAIL;
const B_PASS = process.env.SUPABASE_TEST_USER_B_PASSWORD;

if (!URL || !ANON || !SVC || !A_EMAIL || !A_PASS || !B_EMAIL || !B_PASS) {
  console.error('Missing env vars. See file header for setup.');
  process.exit(2);
}

const log = {
  pass: (msg) => console.log(`\x1b[32m✓\x1b[0m ${msg}`),
  fail: (msg) => console.log(`\x1b[31m✗\x1b[0m ${msg}`),
  info: (msg) => console.log(`\x1b[36m›\x1b[0m ${msg}`),
};

let failures = 0;

async function signIn(email, password) {
  const c = createClient(URL, ANON);
  const { data, error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Sign-in failed for ${email}: ${error.message}`);
  return c;
}

async function ensureUserAHasVehicle(a) {
  const { data: existing } = await a.from('vehicles').select('id').limit(1);
  if (existing && existing.length > 0) return existing[0].id;
  const { data, error } = await a
    .from('vehicles')
    .insert({
      make: 'Audit',
      model: 'A',
      year: 2024,
      plate: 'AUDIT-1',
      fuel_type: 'thermal',
      purchase_date: '2024-01-01',
      purchase_price: 1000,
      currency: 'EUR',
      current_mileage_km: 0,
      estimated_resale_value: 800,
    })
    .select('id')
    .single();
  if (error) throw new Error(`Could not seed user A vehicle: ${error.message}`);
  return data.id;
}

async function expectDeny(label, promise) {
  const { data, error } = await promise;
  // RLS denials show up as either an error OR an empty result
  const denied = !!error || (Array.isArray(data) && data.length === 0);
  if (denied) {
    log.pass(label);
  } else {
    log.fail(`${label} — got ${JSON.stringify(data)}`);
    failures++;
  }
}

async function expectError(label, promise) {
  const { error } = await promise;
  if (error) {
    log.pass(`${label} — blocked: ${error.message.slice(0, 60)}`);
  } else {
    log.fail(`${label} — was NOT blocked`);
    failures++;
  }
}

async function run() {
  log.info('Signing in user A...');
  const a = await signIn(A_EMAIL, A_PASS);
  const vehicleA = await ensureUserAHasVehicle(a);
  log.info(`User A vehicle: ${vehicleA}`);

  log.info('Signing in user B...');
  const b = await signIn(B_EMAIL, B_PASS);

  // ===== Cross-user reads should return nothing =====
  await expectDeny(
    'B cannot SELECT A vehicles',
    b.from('vehicles').select('*').eq('id', vehicleA),
  );
  await expectDeny(
    'B cannot SELECT A fuel_entries',
    b.from('fuel_entries').select('*').eq('vehicle_id', vehicleA),
  );
  await expectDeny(
    'B cannot SELECT A maintenance_entries',
    b.from('maintenance_entries').select('*').eq('vehicle_id', vehicleA),
  );

  // ===== Cross-user writes should error =====
  await expectError(
    'B cannot UPDATE A vehicle',
    b.from('vehicles').update({ make: 'Hacked' }).eq('id', vehicleA),
  );
  await expectError(
    'B cannot DELETE A vehicle',
    b.from('vehicles').delete().eq('id', vehicleA),
  );

  // ===== Maintenance immutability triggers =====
  log.info('Inserting a maintenance entry as user A...');
  const { data: mInsert, error: mErr } = await a
    .from('maintenance_entries')
    .insert({
      vehicle_id: vehicleA,
      occurred_at: new Date().toISOString(),
      category: 'oil',
      description: 'Audit row',
      cost: 1,
      currency: 'EUR',
      garage_name: 'Audit',
      mileage_km: 100,
      previous_hash: 'genesis',
      hash: 'audit_test_hash',
    })
    .select('id')
    .single();
  if (mErr) {
    log.fail(`Could not insert maintenance: ${mErr.message}`);
    failures++;
  } else {
    await expectError(
      'A cannot UPDATE own maintenance (trigger blocks)',
      a.from('maintenance_entries').update({ cost: 999 }).eq('id', mInsert.id),
    );
    await expectError(
      'A cannot DELETE own maintenance (trigger blocks)',
      a.from('maintenance_entries').delete().eq('id', mInsert.id),
    );
  }

  // ===== Public catalog reads should work =====
  log.info('Verifying public catalog reads...');
  const { error: stErr } = await b.from('stations').select('id').limit(1);
  if (stErr) {
    log.fail(`B cannot read public stations: ${stErr.message}`);
    failures++;
  } else {
    log.pass('B can read public stations');
  }

  // Cleanup
  await a.auth.signOut();
  await b.auth.signOut();

  console.log('');
  if (failures > 0) {
    log.fail(`${failures} check(s) failed`);
    process.exit(1);
  } else {
    log.pass('All RLS checks passed');
    process.exit(0);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
