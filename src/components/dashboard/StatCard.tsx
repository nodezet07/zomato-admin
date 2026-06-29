import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Accent = 'default' | 'brand' | 'success' | 'warning' | 'danger';

/** Shared responsive grid for KPI / stat cards across admin pages */
export const STATS_GRID_CLASS =
  'grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4';

const accentStyles: Record<Accent, { icon: string; value: string }> = {
  default: { icon: 'text-muted-foreground/60', value: 'text-ink' },
  brand: { icon: 'text-brand/70', value: 'text-brand' },
  success: { icon: 'text-emerald-600/70', value: 'text-emerald-700' },
  warning: { icon: 'text-amber-600/70', value: 'text-amber-700' },
  danger: { icon: 'text-red-600/70', value: 'text-red-700' },
};

type Props = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  accent?: Accent;
  className?: string;
  onClick?: () => void;
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'default',
  className,
  onClick,
}: Props) {
  const styles = accentStyles[accent];

  return (
    <Card
      className={cn(
        'gap-2 border-black/5 bg-white py-3 shadow-sm transition duration-200 hover:shadow-md sm:gap-4 sm:py-4',
        onClick && 'cursor-pointer hover:border-brand/20',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 px-3 pb-0 sm:px-5">
        <CardTitle className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground leading-tight sm:text-[10px]">
          {label}
        </CardTitle>
        {Icon ? <Icon className={cn('size-3.5 shrink-0 sm:size-4', styles.icon)} /> : null}
      </CardHeader>
      <CardContent className="px-3 pt-0 sm:px-5">
        <p className={cn('text-xl font-black tracking-tight sm:text-2xl', styles.value)}>{value}</p>
        {hint ? (
          <p className="mt-0.5 text-[10px] font-medium text-muted-foreground line-clamp-2 sm:mt-1 sm:text-xs">
            {hint}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
