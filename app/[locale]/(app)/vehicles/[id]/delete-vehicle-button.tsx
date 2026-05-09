'use client';

import { useState, useTransition } from 'react';
import { useRouter } from '@/lib/i18n/routing';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Confirm } from '@/components/ui/confirm';
import { deleteVehicleAction } from '@/server/actions/vehicles';

export function DeleteVehicleButton({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteVehicleAction(id);
      if (res?.error) {
        toast.error(res.error);
        setOpen(false);
        return;
      }
      toast.success('Véhicule supprimé', {
        description: `${label} et son historique ont été retirés.`,
      });
      router.push('/vehicles');
    });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Supprimer le véhicule"
        className="text-muted-foreground hover:text-destructive"
        disabled={pending}
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
      </Button>
      <Confirm
        open={open}
        title="Supprimer ce véhicule ?"
        description="Toutes les dépenses énergie, entretiens et alertes liés seront également supprimés. Cette action est irréversible."
        confirmLabel={pending ? 'Suppression…' : 'Supprimer'}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
