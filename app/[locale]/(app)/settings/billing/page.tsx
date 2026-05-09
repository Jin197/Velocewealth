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

  return (
    <div className="space-y-6">
      <Card variant="premium" className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="premium">
              <Sparkles className="h-3 w-3" /> {isPremium ? 'Premium actif' : 'Standard'}
            </Badge>
            <div className="font-display text-2xl font-bold mt-3">
              {isPremium ? 'Velocewealth Premium' : 'Velocewealth Standard'}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isPremium
                ? 'Renouvellement automatique. Modifiez votre abonnement à tout moment.'
                : 'Passez Premium pour OCR illimité, carnet certifié et export fiscal.'}
            </p>
            <div className="flex items-baseline gap-1 mt-4">
              <span className="font-mono text-3xl font-bold tabular-nums">
                {isPremium ? '4,99' : '0'}
              </span>
              <span className="text-muted-foreground">€/mois</span>
            </div>
          </div>
          {isPremium ? (
            <ManageSubscriptionButton />
          ) : (
            <Button asChild>
              <Link href="/pricing">Passer Premium</Link>
            </Button>
          )}
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
          {isPremium && <ManageSubscriptionButton variant="ghost" size="sm" label="Modifier" />}
        </div>
        {isPremium ? (
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
          {isPremium && <ManageSubscriptionButton variant="ghost" size="sm" label={<><Receipt className="h-3.5 w-3.5" /> Voir</>} />}
        </div>
        {isPremium ? (
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
