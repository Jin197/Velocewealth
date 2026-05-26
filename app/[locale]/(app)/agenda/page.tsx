import { redirect } from 'next/navigation';

/**
 * Top-level Agenda entry point — the sidebar / bottom-tab links here.
 * The actual implementation lives under `/maintenance/agenda` to stay
 * close to the maintenance data fetchers. We just forward.
 */
export default function AgendaShortcut() {
  redirect('/maintenance/agenda');
}
