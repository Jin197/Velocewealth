import { cn } from '@/lib/utils';

interface EcoRingProps {
  score: number;
  size?: number;
  thickness?: number;
  label?: string;
  className?: string;
}

export function EcoRing({
  score,
  size = 180,
  thickness = 12,
  label = 'Éco-score',
  className,
}: EcoRingProps) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80 ? '#2ECC71' : score >= 60 ? '#007AFF' : score >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="eco-ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={thickness}
          className="text-muted"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#eco-ring-grad)"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="none"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-mono text-4xl font-bold tabular-nums">{score}</div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
          {label}
        </div>
      </div>
    </div>
  );
}
