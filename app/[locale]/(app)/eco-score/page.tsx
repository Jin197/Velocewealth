'use client';

import { Award, Lock, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { PageHeader, Section } from '@/components/domain/page-header';
import { EcoRing } from '@/components/domain/eco-ring';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Phase 4: replace with server action that computes from real driving data.
const ecoScore = {
  current: 82,
  trend: 'up' as const,
  delta: 4,
  monthly: [
    { month: 'Déc', score: 71 },
    { month: 'Jan', score: 74 },
    { month: 'Fév', score: 76 },
    { month: 'Mar', score: 78 },
    { month: 'Avr', score: 78 },
    { month: 'Mai', score: 82 },
  ],
  badges: [
    { id: 'b1', label: 'Conducteur souple', description: '0 freinage brusque sur 30 jours', earned: true },
    { id: 'b2', label: 'Pied léger', description: 'Vitesse moyenne < 110 km/h', earned: true },
    { id: 'b3', label: 'Économe', description: '−15 % de consommation vs moyenne', earned: true },
    { id: 'b4', label: 'Multi-énergies', description: 'Mix thermique + électrique optimisé', earned: false },
    { id: 'b5', label: 'Régénération pro', description: '> 30 % énergie récupérée au freinage', earned: false },
    { id: 'b6', label: 'Éco-Champion', description: 'Score ≥ 90 pendant 3 mois', earned: false },
  ],
};

export default function EcoScorePage() {
  return (
    <div className="container py-6 lg:py-8 space-y-6">
      <PageHeader
        title="Éco-score"
        description="Mesurez votre impact, gagnez des badges, débloquez des réductions partenaires"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card variant="premium" className="p-8 flex flex-col items-center justify-center text-center">
          <EcoRing score={ecoScore.current} />
          <div className="flex items-center gap-1.5 mt-4 text-eco text-sm font-medium">
            <TrendingUp className="h-4 w-4" strokeWidth={2} />+{ecoScore.delta} ce mois-ci
          </div>
          <p className="text-xs text-muted-foreground mt-2 max-w-xs">
            Excellent ! Continuez sur cette voie pour débloquer 15 % de réduction chez nos garages partenaires.
          </p>
        </Card>

        <Card className="lg:col-span-2 p-6">
          <h2 className="font-display text-base font-semibold mb-4">
            Évolution sur 6 mois
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ecoScore.monthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="month"
                  stroke="currentColor"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <YAxis
                  domain={[60, 100]}
                  stroke="currentColor"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2ECC71"
                  strokeWidth={3}
                  dot={{ fill: '#2ECC71', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Section
        title="Badges"
        description="Débloquez des récompenses en améliorant votre score"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ecoScore.badges.map((b) => (
            <Card
              key={b.id}
              variant={b.earned ? 'glass' : 'default'}
              className={cn(
                'p-4 flex items-center gap-3',
                !b.earned && 'opacity-60',
              )}
            >
              <div
                className={cn(
                  'rounded-btn h-12 w-12 flex items-center justify-center shrink-0',
                  b.earned
                    ? 'bg-gradient-eco text-white'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {b.earned ? (
                  <Award className="h-6 w-6" strokeWidth={2} />
                ) : (
                  <Lock className="h-5 w-5" strokeWidth={1.5} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display font-semibold text-sm">
                    {b.label}
                  </span>
                  {b.earned && (
                    <Badge variant="success" className="text-[10px] px-1.5 py-0">
                      Acquis
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {b.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Card variant="premium" className="p-6 flex items-center justify-between gap-4">
        <div>
          <div className="font-display font-semibold">
            Réductions débloquées
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Avec un score ≥ 80, vous bénéficiez de tarifs préférentiels chez Garage du Centre, AutoCare Premium et 12 autres partenaires.
          </p>
        </div>
        <Badge variant="success">−15 %</Badge>
      </Card>
    </div>
  );
}
