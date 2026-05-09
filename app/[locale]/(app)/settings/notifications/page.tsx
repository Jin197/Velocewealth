import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const groups = [
  {
    title: 'Maintenance',
    items: [
      { label: 'Alertes prédictives (pneus, freins, vidange)', defaultOn: true },
      { label: 'Rappel contrôle technique', defaultOn: true },
      { label: 'Échéance assurance', defaultOn: true },
    ],
  },
  {
    title: 'Énergie',
    items: [
      { label: 'Hausse de prix sur stations habituelles', defaultOn: true },
      { label: 'Borne disponible à proximité', defaultOn: false },
    ],
  },
  {
    title: 'Marché',
    items: [
      { label: 'Variation indice de revente > 5 %', defaultOn: true },
      { label: 'Récap mensuel coût/km', defaultOn: true },
    ],
  },
  {
    title: 'Promotions partenaires',
    items: [
      { label: 'Offres garages partenaires', defaultOn: false },
      { label: 'Récompenses éco-score', defaultOn: true },
    ],
  },
];

function Toggle({ defaultOn }: { defaultOn?: boolean }) {
  return (
    <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
      <input type="checkbox" defaultChecked={defaultOn} className="peer sr-only" />
      <span className="absolute inset-0 rounded-pill bg-muted peer-checked:bg-veloce transition-colors" />
      <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
    </label>
  );
}

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <div>
            <div className="font-display font-semibold">Canaux</div>
            <div className="text-xs text-muted-foreground">
              Comment voulez-vous être prévenu ?
            </div>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          {[
            { label: 'Email', defaultOn: true },
            { label: 'Push', defaultOn: true },
            { label: 'SMS', defaultOn: false },
          ].map((c) => (
            <label
              key={c.label}
              className="flex items-center justify-between rounded-card border border-border p-4 cursor-pointer"
            >
              <span className="text-sm font-medium">{c.label}</span>
              <Toggle defaultOn={c.defaultOn} />
            </label>
          ))}
        </div>
      </Card>

      {groups.map((g) => (
        <Card key={g.title} className="p-6">
          <h2 className="font-display text-sm font-semibold mb-4">{g.title}</h2>
          <ul className="divide-y divide-border">
            {g.items.map((it) => (
              <li key={it.label} className="flex items-center justify-between py-3 text-sm">
                <span>{it.label}</span>
                <Toggle defaultOn={it.defaultOn} />
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <div className="flex justify-end gap-3">
        <Button variant="ghost">Réinitialiser</Button>
        <Button>Enregistrer</Button>
      </div>
    </div>
  );
}
