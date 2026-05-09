'use client';

import { useState } from 'react';
import { Download, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function ExportLogButton({ premium }: { premium: boolean }) {
  const [pending, setPending] = useState(false);

  const handleExport = async () => {
    if (!premium) {
      toast.info('Export PDF — fonctionnalité Premium', {
        description: 'Passez Premium pour exporter votre carnet certifié.',
      });
      return;
    }
    setPending(true);
    try {
      const res = await fetch('/api/maintenance-log/export');
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Erreur lors de l\'export');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carnet-velocewealth-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Carnet exporté');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur lors de l\'export');
    } finally {
      setPending(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : premium ? (
        <Download className="h-4 w-4" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      Exporter en PDF
    </Button>
  );
}
