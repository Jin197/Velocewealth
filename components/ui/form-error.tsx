import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FormError({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  if (!message) return null;
  return (
    <p
      className={cn(
        'flex items-center gap-1.5 text-xs text-destructive mt-1',
        className,
      )}
      role="alert"
    >
      <AlertCircle className="h-3 w-3" strokeWidth={2} />
      {message}
    </p>
  );
}
