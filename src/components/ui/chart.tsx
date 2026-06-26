import * as React from 'react';
import * as RechartsPrimitive from 'recharts';

import { cn } from '@/lib/utils';

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    color?: string;
  };
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }
  return context;
}

type ChartContainerProps = React.ComponentProps<'div'> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children'];
};

export function ChartContainer({ id, className, children, config, ...props }: ChartContainerProps) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          '[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/40 flex justify-center text-xs',
          className,
        )}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export function ChartTooltip({
  content,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip>) {
  return <RechartsPrimitive.Tooltip cursor={false} content={content} {...props} />;
}

type TooltipPayload = {
  name?: string;
  value?: number;
  color?: string;
  dataKey?: string;
};

export function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  formatter?: (value: number, name: string) => React.ReactNode;
  labelFormatter?: (label: string) => React.ReactNode;
}) {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs shadow-lg">
      {label ? (
        <p className="mb-1 font-semibold text-ink">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      ) : null}
      <div className="space-y-1">
        {payload.map((item, i) => {
          const key = item.dataKey ?? item.name ?? String(i);
          const cfg = config[key];
          const color = item.color ?? cfg?.color ?? '#ff5a00';
          const display =
            formatter && item.value !== undefined
              ? formatter(item.value, key)
              : item.value;
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground">{cfg?.label ?? key}</span>
              <span className="ml-auto font-bold text-ink">{display}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
