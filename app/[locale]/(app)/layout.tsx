import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Topbar } from '@/components/layout/topbar';
import { UserProvider } from '@/components/user-context';
import { getProfile } from '@/lib/data';
import { isSupabaseConfigured } from '@/lib/env';
import { cn } from '@/lib/utils';
import { Link } from '@/lib/i18n/routing';

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
          <TrialWarningBanner profile={profile} />
          {!isSupabaseConfigured() && <BackendNotConfiguredBanner />}
          <main className="flex-1 pb-24 lg:pb-8 overflow-x-hidden">{children}</main>
        </div>
        <MobileNav />
      </div>
    </UserProvider>
  );
}

function TrialWarningBanner({ profile }: { profile: any }) {
  if (!profile?.isTrial || !profile?.createdAt) return null;
  const elapsedMs = Date.now() - new Date(profile.createdAt).getTime();
  const trialDaysLeft = Math.max(0, Math.ceil((14 * 24 * 60 * 60 * 1000 - elapsedMs) / (24 * 60 * 60 * 1000)));
  const isUrgent = trialDaysLeft <= 2;
  
  return (
    <div className={cn(
      "border-b text-sm transition-all duration-300",
      isUrgent 
        ? "border-amber-500/20 bg-amber-500/10 text-amber-200" 
        : "border-border bg-card/60 text-muted-foreground"
    )}>
      <div className="container py-2.5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className={cn(
            "h-2 w-2 rounded-full",
            isUrgent ? "bg-amber-400 animate-pulse" : "bg-veloce animate-pulse"
          )} />
          <span>
            {isUrgent ? (
              <>
                <strong>Attention :</strong> Plus que <span className="font-semibold text-white">{trialDaysLeft} jour{trialDaysLeft > 1 ? 's' : ''}</span> d&apos;essai Premium gratuit. Activez votre plan pour conserver vos accès illimités.
              </>
            ) : (
              <>
                Vous profitez d&apos;un essai Premium gratuit (<span className="font-semibold text-foreground">{trialDaysLeft} jour{trialDaysLeft > 1 ? 's' : ''} restant{trialDaysLeft > 1 ? 's' : ''}</span>).
              </>
            )}
          </span>
        </div>
        <Link 
          href="/settings/billing" 
          className={cn(
            "text-xs font-semibold px-3 py-1 rounded-full border transition-all",
            isUrgent 
              ? "border-amber-500/30 hover:bg-amber-500/20 text-amber-200 bg-amber-500/5" 
              : "border-border hover:bg-muted text-foreground"
          )}
        >
          Découvrir les offres
        </Link>
      </div>
    </div>
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
