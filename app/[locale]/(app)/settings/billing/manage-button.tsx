'use client';

import { useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface Props {
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  label?: React.ReactNode;
}

export function ManageSubscriptionButton({
  variant = 'outline',
  size = 'md',
  label,
}: Props) {
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    setPending(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      window.location.href = data.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
      setPending(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={pending}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {label ?? (
        <>
          Gérer l'abonnement <ExternalLink className="h-3 w-3" />
        </>
      )}
    </Button>
  );
}
