import { Link } from '@/lib/i18n/routing';
import { Sparkles, Check, ExternalLink, CreditCard, Receipt } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getProfile } from '@/lib/data';
import { isSupabaseConfigured } from '@/lib/env';
import { ManageSubscriptionButton } from './manage-button';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const profile = isSupabaseConfigured() ? await getProfile() : null;
  const isPremium = profile?.planTier === 'premium';
  const isFamily = profile?.planTier === 'family';
  const isSubscribed = isPremium || isFamily;

  return (
    <div className="space-y-6">
      <Card variant="premium" className="p-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <Badge variant={isFamily ? 'family' : isPremium ? 'premium' : 'default'}>
              <Sparkles className="h-3 w-3" /> {isSubscribed ? `${isFamily ? 'Family/Pro' : 'Premium'} actif` : 'Standard'}
            </Badge>
            <div className="font-display text-2xl font-bold mt-3">
              {isSubscribed ? `Velocewealth ${isFamily ? 'Family/Pro' : 'Premium'}` : 'Velocewealth Standard'}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isSubscribed
                ? 'Renouvellement automatique. Modifiez votre abonnement à tout moment.'
                : 'Passez Premium pour OCR illimité, carnet certifié et export fiscal.'}
            </p>
            <div className="flex items-baseline gap-1 mt-4">
              <span className="font-mono text-3xl font-bold tabular-nums">
                {isFamily ? '16,99' : isPremium ? '9,99' : '0'}
              </span>
              <span className="text-muted-foreground">€/mois</span>
            </div>
          </div>
          <div className="shrink-0 flex items-center">
            {isSubscribed ? (
              <ManageSubscriptionButton className="w-full sm:w-auto text-center justify-center font-semibold" />
            ) : (
              <Button asChild className="w-full sm:w-auto text-center justify-center">
                <Link href="/pricing">Passer Premium</Link>
              </Button>
            )}
          </div>
        </div>

        <ul className="mt-6 grid sm:grid-cols-2 gap-2 text-sm">
          {[
            'Scan OCR illimité',
            'Suivi TCO complet',
            'Export fiscal frais réels',
            'Carnet certifié PDF',
            'Indice de revente temps réel',
            'Analyse éco-conduite',
          ].map((f) => (
            <li key={f} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-eco" strokeWidth={2} />
              {f}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold">Mode de paiement</h2>
          {isSubscribed && <ManageSubscriptionButton variant="ghost" size="sm" label="Modifier" />}
        </div>
        {isSubscribed ? (
          <div className="flex items-center gap-3">
            <div className="rounded-btn bg-muted p-3">
              <CreditCard className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div className="text-sm text-muted-foreground">
              Géré via le portail Stripe — cliquez sur « Modifier ».
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Aucun mode de paiement enregistré.
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold">
            Historique de facturation
          </h2>
          {isSubscribed && <ManageSubscriptionButton variant="ghost" size="sm" label={<><Receipt className="h-3.5 w-3.5" /> Voir</>} />}
        </div>
        {isSubscribed ? (
          <div className="text-sm text-muted-foreground">
            Téléchargez vos factures depuis le portail Stripe.
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Aucune facture pour le moment.
          </div>
        )}
      </Card>
    </div>
  );
}
