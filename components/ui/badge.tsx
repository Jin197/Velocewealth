import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-pill border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-veloce/10 text-veloce',
        success: 'border-transparent bg-eco/10 text-eco',
        warning: 'border-transparent bg-amber-500/10 text-amber-500',
        danger: 'border-transparent bg-destructive/10 text-destructive',
        muted: 'border-border bg-muted text-muted-foreground',
        outline: 'text-foreground border-border',
        premium:
          'border-veloce/30 bg-gradient-to-r from-veloce/10 to-eco/10 text-veloce',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
