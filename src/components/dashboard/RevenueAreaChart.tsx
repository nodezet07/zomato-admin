import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

type Point = { date: string; revenue: number; orders?: number };

function formatAxisDate(id: string) {
  const d = new Date(id);
  if (Number.isNaN(d.getTime())) return id.slice(5);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function RevenueAreaChart({ data, days }: { data: Point[]; days: number }) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatAxisDate(d.date),
  }));

  return (
    <Card className="border-black/5 bg-white shadow-sm lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold">Revenue overview</CardTitle>
        <CardDescription>Delivered order revenue · last {days} days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="aspect-[2.4/1] w-full min-h-[220px]"
          config={{
            revenue: { label: 'Revenue', color: 'hsl(24 100% 50%)' },
          }}
        >
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(24 100% 50%)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="hsl(24 100% 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              fontSize={11}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={11}
              tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`)}
              width={48}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(v) => formatCurrency(v)}
                  labelFormatter={(l) => String(l)}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(24 100% 50%)"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
