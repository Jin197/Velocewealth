'use client';

/**
 * Phase 3 note: data persistence moved to Supabase. This file is kept as a
 * stub to avoid breaking imports during the migration. New code should fetch
 * via lib/data on the server, or call server actions on the client.
 *
 * Remove this file once all imports have been migrated.
 */

export const useStore = () => {
  throw new Error(
    'useStore is deprecated in Phase 3. Fetch via lib/data (server) or call server actions (client).',
  );
};

export const useVehicles = () => [];
export const useFuelEntries = () => [];
export const useMaintenanceEntries = () => [];
export const useAlerts = () => [];
export const useUser = () => {
  throw new Error('useUser moved to @/components/user-context');
};
export const useVehicle = () => null;
