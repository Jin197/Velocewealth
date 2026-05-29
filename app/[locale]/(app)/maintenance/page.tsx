import { redirect } from 'next/navigation';

/**
 * Standalone /maintenance landing got replaced by the cross-vehicle
 * /agenda screen. Per-vehicle drill-downs (/maintenance/plan/[id],
 * /maintenance/prognostics/[id], /maintenance/[id], /maintenance/new,
 * /maintenance/log, /maintenance/agenda) stay valid.
 */
export default function MaintenanceRedirect() {
  redirect('/agenda');
}
