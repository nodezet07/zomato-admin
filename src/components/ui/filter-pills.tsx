import { cn } from '@/lib/utils';

export type FilterOption = {
  value: string;
  label: string;
  count?: number;
};

type Props = {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function FilterPills({ options, value, onChange, className }: Props) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value || '__all__'}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold transition',
              active
                ? 'border-brand bg-brand text-white shadow-sm'
                : 'border-black/10 bg-white text-zinc-700 hover:border-brand/30 hover:bg-brand/5',
            )}
          >
            {opt.label}
            {opt.count !== undefined ? (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-black',
                  active ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600',
                )}
              >
                {opt.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
