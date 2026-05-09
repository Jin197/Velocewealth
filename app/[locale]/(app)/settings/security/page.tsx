import { Shield, Smartphone, Key, AlertTriangle, Download, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input, Label } from '@/components/ui/input';

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className="rounded-btn bg-veloce/10 text-veloce p-2.5">
            <Key className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-base font-semibold">Mot de passe</h2>
            <p className="text-xs text-muted-foreground">
              Mis à jour il y a 3 mois
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="current">Mot de passe actuel</Label>
            <Input id="current" type="password" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new">Nouveau mot de passe</Label>
            <Input id="new" type="password" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button>Mettre à jour</Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-btn bg-eco/10 text-eco p-2.5">
            <Shield className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-base font-semibold">
              Authentification à deux facteurs
            </h2>
            <p className="text-xs text-muted-foreground">
              Une protection supplémentaire pour votre compte
            </p>
          </div>
          <Badge variant="muted">Désactivé</Badge>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm">
            <Smartphone className="h-3.5 w-3.5" /> App authenticator
          </Button>
          <Button variant="outline" size="sm">SMS</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-base font-semibold mb-1">
          Sessions actives
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Appareils connectés à votre compte
        </p>
        <ul className="divide-y divide-border">
          {[
            { device: 'MacBook Pro · Chrome', location: 'Lyon, France', current: true },
            { device: 'iPhone 15 · Safari', location: 'Lyon, France', current: false },
          ].map((s) => (
            <li key={s.device} className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  {s.device}
                  {s.current && (
                    <Badge variant="success" className="text-[10px] px-1.5 py-0">
                      Actuel
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{s.location}</div>
              </div>
              {!s.current && (
                <Button variant="ghost" size="sm">Déconnecter</Button>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-base font-semibold mb-3">
          Mes données (RGPD)
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4" /> Exporter mes données
          </Button>
          <Button variant="outline" className="text-destructive border-destructive/40 hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" /> Supprimer mon compte
          </Button>
        </div>
      </Card>

      <Card className="p-4 bg-amber-500/5 border-amber-500/20">
        <div className="flex items-start gap-3 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" strokeWidth={2} />
          <div>
            <div className="font-medium">Aucune activité suspecte détectée</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Dernière connexion il y a 2 minutes depuis Lyon, France.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
