'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormError } from '@/components/ui/form-error';
import { useUser } from '@/components/user-context';
import { updateProfileAction } from '@/server/actions/profile';
import { getCurrenciesByRegion } from '@/lib/currencies';

export default function ProfileSettingsPage() {
  const user = useUser();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      setError(undefined);
      const res = await updateProfileAction(formData);
      if (res.error) {
        setError(res.error);
        return;
      }
      toast.success('Profil mis à jour');
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Avatar name={user.fullName} size="lg" />
            <div className="min-w-0">
              <div className="font-display text-lg font-semibold truncate">
                {user.fullName}
              </div>
              <div className="text-sm text-muted-foreground truncate">{user.email}</div>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" disabled className="shrink-0 self-start sm:self-auto">
            Changer la photo
          </Button>
        </div>
      </Card>

      <Card className="p-6 space-y-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Identité
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Nom complet</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={user.fullName}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={user.email}
              required
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Localisation
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="locale">Langue</Label>
            <Select id="locale" name="locale" defaultValue={user.locale}>
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="ar">العربية</option>
              <option value="pt">Português</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="country">Pays</Label>
            <Select id="country" name="country" defaultValue={user.country}>
              <option value="FR">France</option>
              <option value="BE">Belgique</option>
              <option value="CH">Suisse</option>
              <option value="MA">Maroc</option>
              <option value="SN">Sénégal</option>
              <option value="CI">Côte d'Ivoire</option>
              <option value="CA">Canada</option>
              <option value="US">États-Unis</option>
              <option value="GB">Royaume-Uni</option>
              <option value="ES">Espagne</option>
              <option value="PT">Portugal</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currency">Devise</Label>
            <Select id="currency" name="currency" defaultValue={user.currency}>
              {getCurrenciesByRegion().map((group) => (
                <optgroup key={group.region} label={group.region}>
                  {group.currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.symbol} {c.code} — {c.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      <FormError message={error} />

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
