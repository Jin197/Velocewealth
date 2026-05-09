import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Topbar } from '@/components/layout/topbar';
import { UserProvider } from '@/components/user-context';
import { getProfile } from '@/lib/data';
import { isSupabaseConfigured } from '@/lib/env';

export const dynamic = 'force-dynamic';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = isSupabaseConfigured() ? await getProfile() : null;

  return (
    <UserProvider user={profile}>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          {!isSupabaseConfigured() && <BackendNotConfiguredBanner />}
          <main className="flex-1 pb-24 lg:pb-8">{children}</main>
        </div>
        <MobileNav />
      </div>
    </UserProvider>
  );
}

function BackendNotConfiguredBanner() {
  return (
    <div className="border-b border-amber-500/20 bg-amber-500/10">
      <div className="container py-3 text-sm text-amber-200">
        <strong className="font-medium">Mode pré-prod</strong>
        <span className="ml-2 text-muted-foreground">
          Variables d'environnement Supabase manquantes — voir{' '}
          <code className="font-mono text-xs">ONBOARDING.md</code> pour brancher
          le backend.
        </span>
      </div>
    </div>
  );
}
