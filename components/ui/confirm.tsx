'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ConfirmProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function Confirm({
  open,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  destructive,
  onConfirm,
  onCancel,
}: ConfirmProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onCancel}
      onClick={(e) => {
        if (e.target === ref.current) onCancel();
      }}
      className={cn(
        'rounded-card border border-border bg-card text-card-foreground shadow-elevated p-6 max-w-sm w-[90vw]',
        'backdrop:bg-black/60 backdrop:backdrop-blur-sm',
        'open:animate-fade-in',
      )}
    >
      <h2 className="font-display font-semibold text-base">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      )}
      <div className="flex gap-2 mt-6">
        <Button variant="ghost" className="flex-1" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button
          variant={destructive ? 'destructive' : 'primary'}
          className="flex-1"
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
