'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface EnergyMixProps {
  thermal: number;
  electric: number;
}

export function EnergyMix({ thermal, electric }: EnergyMixProps) {
  const data = [
    { name: 'Thermique', value: Math.round(thermal * 100), color: '#F59E0B' },
    { name: 'Électrique', value: Math.round(electric * 100), color: '#2ECC71' },
  ];

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-32 w-32 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(v: number) => `${v}%`}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Mix</div>
          <div className="font-mono text-sm font-semibold">{data[1].value}%</div>
          <div className="text-[10px] text-eco">élec.</div>
        </div>
      </div>
      <ul className="space-y-1.5 text-sm">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
            <span className="text-muted-foreground">{d.name}</span>
            <span className="font-mono tabular-nums ml-auto pl-3">{d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
