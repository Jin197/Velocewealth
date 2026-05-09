import { Link } from '@/lib/i18n/routing';
import { Sparkles, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  isPremium: boolean;
  feature: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * Wrap any element to gate it behind Premium tier.
 * If !isPremium, renders an upsell card instead of the children.
 */
export function PremiumGate({
  isPremium,
  feature,
  description,
  children,
}: Props) {
  if (isPremium) return <>{children}</>;
  return (
    <Card variant="premium" className="p-6 text-center space-y-3">
      <div className="rounded-full bg-veloce/10 text-veloce h-12 w-12 mx-auto flex items-center justify-center">
        <Lock className="h-5 w-5" strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="font-display font-semibold text-base">
          {feature} — Premium
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <Button asChild>
        <Link href="/pricing">
          <Sparkles className="h-4 w-4" /> Passer Premium
        </Link>
      </Button>
    </Card>
  );
}
