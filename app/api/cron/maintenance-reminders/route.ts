import { NextResponse } from 'next/server';
import {
  listDueRemindersForCron,
  markReminderDispatched,
} from '@/server/actions/maintenance-tasks';
import { pushInAppNotification } from '@/server/actions/notifications';
import { renderMaintenanceReminderEmail } from '@/lib/maintenance/reminder-email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Daily cron: pushes maintenance-reminder emails and in-app notifications.
 *
 * - Triggered by Vercel cron (see vercel.json) at 07:00 Europe/Paris (~ 05:00 UTC)
 * - Authenticated by the `Authorization: Bearer <CRON_SECRET>` header that
 *   Vercel injects automatically when the call comes from its cron runner
 * - Idempotent: a phase ('warning' | 'urgent' | 'overdue') is only sent once
 *   per task. Re-running the cron in the same day is a no-op.
 */
export async function GET(request: Request) {
  const auth = request.headers.get('authorization') ?? '';
  const secret = process.env.CRON_SECRET ?? '';
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://velocewealth.com';

  let dispatched = 0;
  let failed = 0;

  try {
    const reminders = await listDueRemindersForCron();

    for (const item of reminders) {
      try {
        // 1. In-app notification first — always cheap, always succeeds.
        await pushInAppNotification({
          userId: item.task.userId,
          kind:
            item.phase === 'overdue'
              ? 'maintenance_overdue'
              : 'maintenance_reminder',
          title: titleFor(item.phase, item.task.title, item.vehicleLabel),
          body: item.task.scheduledFor
            ? bodyFor(item.phase, item.task.scheduledFor, item.userLocale)
            : undefined,
          link: '/maintenance/agenda',
          relatedVehicleId: item.task.vehicleId,
          relatedTaskId: item.task.id,
        });

        // 2. Best-effort email. Resend outages don't roll back the marker:
        // we'd rather miss the email than spam.
        if (apiKey && from) {
          const rendered = renderMaintenanceReminderEmail({
            userFullName: item.userFullName,
            userEmail: item.userEmail,
            vehicleLabel: item.vehicleLabel,
            task: item.task,
            phase: item.phase,
            locale: item.userLocale,
            appUrl,
          });
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from,
              to: item.userEmail,
              subject: rendered.subject,
              html: rendered.html,
              text: rendered.text,
            }),
          });
        }

        await markReminderDispatched(item.task.id, item.phase);
        dispatched++;
      } catch (err) {
        failed++;
        console.error('reminder dispatch error', {
          taskId: item.task.id,
          err: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return NextResponse.json({
      ok: true,
      reminders: reminders.length,
      dispatched,
      failed,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('maintenance-reminders fatal', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

function titleFor(
  phase: 'warning' | 'urgent' | 'overdue',
  taskTitle: string,
  vehicleLabel: string,
): string {
  if (phase === 'overdue')
    return `En retard : ${taskTitle} sur ${vehicleLabel}`;
  if (phase === 'urgent') return `Demain : ${taskTitle} sur ${vehicleLabel}`;
  return `À planifier : ${taskTitle} sur ${vehicleLabel}`;
}

function bodyFor(
  phase: 'warning' | 'urgent' | 'overdue',
  scheduledFor: string,
  locale: string,
): string {
  const date = new Date(scheduledFor).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'long',
  });
  if (phase === 'overdue') return `Initialement prévue le ${date}.`;
  return `Planifiée le ${date}.`;
}
