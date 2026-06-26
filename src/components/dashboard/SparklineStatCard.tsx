import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { cn, formatCurrency } from '@/lib/utils';
import { Area, AreaChart, XAxis } from 'recharts';

export type SparklinePoint = { date: string; value: number };

type Props = {
  label: string;
  sublabel?: string;
  value: string;
  series: SparklinePoint[];
  dataKey?: string;
  color?: string;
  icon?: LucideIcon;
  formatChange?: (n: number) => string;
  onClick?: () => void;
};

function slugify(text: string) {
  return text.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '_').toLowerCase();
}

export function computeSeriesTrend(series: number[]) {
  if (series.length < 2) {
    return { change: 0, percent: '0%', positive: true };
  }
  const mid = Math.max(1, Math.floor(series.length / 2));
  const firstAvg = series.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
  const secondAvg = series.slice(mid).reduce((a, b) => a + b, 0) / (series.length - mid);
  const change = secondAvg - firstAvg;
  const pct = firstAvg > 0 ? (change / firstAvg) * 100 : 0;
  return {
    change,
    percent: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`,
    positive: pct >= 0,
  };
}

export function SparklineStatCard({
  label,
  sublabel,
  value,
  series,
  dataKey = 'value',
  color = 'hsl(24 100% 50%)',
  icon: Icon,
  formatChange,
  onClick,
}: Props) {
  const values = series.map((s) => s.value);
  const trend = computeSeriesTrend(values);
  const gradientId = `gradient-${slugify(label)}`;
  const changeText = formatChange
    ? formatChange(trend.change)
    : trend.change >= 0
      ? `+${Math.abs(trend.change).toFixed(0)}`
      : `-${Math.abs(trend.change).toFixed(0)}`;

  return (
    <Card
      className={cn(
        'border-black/5 bg-white p-0 shadow-sm transition hover:shadow-md',
        onClick && 'cursor-pointer',
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 pb-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <dt className="text-sm font-semibold text-ink">
              {label}
              {sublabel ? (
                <span className="font-normal text-muted-foreground"> ({sublabel})</span>
              ) : null}
            </dt>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <dd className="text-2xl font-black tracking-tight text-ink">{value}</dd>
              <dd className="flex shrink-0 items-center gap-1 text-xs">
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 font-bold',
                    trend.positive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-600',
                  )}
                >
                  {trend.percent}
                </span>
              </dd>
            </div>
            <p
              className={cn(
                'mt-0.5 text-[11px] font-medium',
                trend.positive ? 'text-emerald-600' : 'text-red-600',
              )}
            >
              {changeText} vs prior period
            </p>
          </div>
          {Icon ? (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
              <Icon className="size-4 text-muted-foreground" />
            </div>
          ) : null}
        </div>

        <div className="mt-3 h-14 overflow-hidden">
          <ChartContainer
            className="h-full w-full"
            config={{
              [dataKey]: { label, color },
            }}
          >
            <AreaChart data={series}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <Area
                dataKey={dataKey}
                stroke={color}
                fill={`url(#${gradientId})`}
                fillOpacity={0.4}
                strokeWidth={1.5}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function formatSparkCurrency(n: number) {
  if (Math.abs(n) >= 1000) return formatCurrency(Math.round(n));
  return `₹${Math.round(n)}`;
}
