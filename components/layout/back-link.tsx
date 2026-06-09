import { Link } from '@/lib/i18n/routing';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  href: string;
  /** Text after the chevron — what we go back TO (e.g. "Tableau de bord"). */
  label: string;
  className?: string;
}

/**
 * Reusable back-navigation chevron used on every sub-page so the user
 * always knows how to climb one level up. Placed at the very top-left
 * of a page, just above the PageHeader.
 */
export function BackLink({ href, label, className }: Props) {
  return (
    <Button variant="ghost" size="sm" asChild className={`-ml-3 ${className ?? ''}`}>
      <Link href={href}>
        <ChevronLeft className="h-4 w-4" /> {label}
      </Link>
    </Button>
  );
}
