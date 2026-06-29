import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils';
import { Cell, Pie, PieChart } from 'recharts';

const COLORS = [
  'hsl(24 100% 50%)',
  'hsl(173 58% 39%)',
  'hsl(221 83% 53%)',
  'hsl(45 93% 47%)',
  'hsl(0 72% 51%)',
  'hsl(262 83% 58%)',
];

type Slice = { name: string; value: number };

export function DonutBreakdownChart({
  title,
  subtitle,
  data,
  centerLabel,
}: {
  title: string;
  subtitle: string;
  data: Slice[];
  centerLabel?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const filtered = data.filter((d) => d.value > 0);

  return (
    <Card className="border-black/5 bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold">{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No data for this period</p>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <div className="relative size-44 shrink-0">
              <ChartContainer
                className="size-full"
                config={Object.fromEntries(
                  filtered.map((d, i) => [d.name, { label: d.name, color: COLORS[i % COLORS.length] }]),
                )}
              >
                <PieChart>
                  <Pie
                    data={filtered}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {filtered.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              {centerLabel ? (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-ink">{centerLabel}</span>
                  <span className="text-[10px] font-semibold text-muted-foreground">total</span>
                </div>
              ) : null}
            </div>
            <ul className="w-full space-y-2">
              {filtered.map((item, i) => {
                const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <li key={item.name} className="flex items-center gap-2 text-sm">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="flex-1 truncate font-medium capitalize text-zinc-700">
                      {item.name.replace(/_/g, ' ')}
                    </span>
                    <span className="font-bold text-ink">{pct}%</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function HorizontalBarList({
  title,
  subtitle,
  items,
  valueFormatter = (n) => String(n),
}: {
  title: string;
  subtitle: string;
  items: Array<{ label: string; value: number }>;
  valueFormatter?: (n: number) => string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  const sorted = [...items].sort((a, b) => b.value - a.value).slice(0, 6);

  return (
    <Card className="border-black/5 bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold">{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sorted.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No data for this period</p>
        ) : (
          sorted.map((item, i) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate font-medium capitalize text-zinc-700">
                  {item.label.replace(/_/g, ' ')}
                </span>
                <span className="shrink-0 font-bold text-ink">{valueFormatter(item.value)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(item.value / max) * 100}%`,
                    backgroundColor: COLORS[i % COLORS.length],
                  }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function QuickStatsCard({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: Array<{ label: string; value: string }>;
}) {
  return (
    <Card className="border-black/5 bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold">{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-0">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3 ${
              i < rows.length - 1 ? 'border-b border-zinc-100' : ''
            }`}
          >
            <span className="font-medium text-zinc-600">{row.label}</span>
            <span className="font-black text-ink shrink-0">{row.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export { formatCurrency };
