'use client';

import { useTransition } from 'react';
import { useRouter } from '@/lib/i18n/routing';
import { toast } from 'sonner';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DemoButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleActivateDemo = () => {
    startTransition(async () => {
      try {
        const { generateDemoDataAction } = await import('@/server/actions/demo');
        const res = await generateDemoDataAction();

        if (res.error) {
          toast.error(res.error);
          return;
        }

        toast.success('Mode Démo activé !', {
          description: 'Votre flotte a été peuplée avec 12 mois de données réalistes.',
          duration: 5000,
        });
        
        router.refresh();
      } catch (err) {
        toast.error('Une erreur inattendue est survenue.');
      }
    });
  };

  return (
    <Button
      onClick={handleActivateDemo}
      disabled={pending}
      variant="outline"
      size="lg"
      className="mt-4 border-veloce text-veloce hover:bg-veloce/10 gap-2 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(0,122,255,0.15)] rounded-full px-6 py-2.5"
      aria-label="Activer le Mode Démo"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Génération de la flotte...</span>
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 text-veloce animate-pulse" />
          <span>Activer le Mode Démo</span>
        </>
      )}
    </Button>
  );
}
