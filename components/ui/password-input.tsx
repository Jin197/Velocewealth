'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  /** Override the show/hide button accessible labels per language. */
  showLabel?: string;
  hideLabel?: string;
};

/**
 * Password input with a built-in show/hide toggle. Defaults to hidden
 * (type=password). Click the eye icon to flip — useful on password-reset
 * and account-creation flows where users want to verify what they typed
 * before submitting.
 *
 * Keeps native form semantics: the underlying input still has
 * autoComplete/required/name attributes, so it integrates cleanly with
 * <form action={…}> and password managers.
 */
export const PasswordInput = forwardRef<HTMLInputElement, Props>(
  function PasswordInput(
    {
      className,
      showLabel = 'Afficher le mot de passe',
      hideLabel = 'Masquer le mot de passe',
      ...rest
    },
    ref,
  ) {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn('pr-10', className)}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          tabIndex={-1}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:text-foreground"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <Eye className="h-4 w-4" strokeWidth={1.5} />
          )}
        </button>
      </div>
    );
  },
);
