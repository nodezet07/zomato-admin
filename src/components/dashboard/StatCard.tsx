import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Accent = 'default' | 'brand' | 'success' | 'warning' | 'danger';

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
        'gap-4 border-black/5 bg-white py-4 shadow-sm transition duration-200 hover:shadow-md',
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
      <CardHeader className="flex flex-row items-start justify-between space-y-0 px-5 pb-0">
        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </CardTitle>
        {Icon ? <Icon className={cn('size-4 shrink-0', styles.icon)} /> : null}
      </CardHeader>
      <CardContent className="px-5 pt-0">
        <p className={cn('text-2xl font-black tracking-tight', styles.value)}>{value}</p>
        {hint ? <p className="mt-1 text-xs font-medium text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
