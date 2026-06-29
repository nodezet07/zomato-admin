import type { ReactNode } from 'react';

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function PageShell({ eyebrow, title, subtitle, action, children }: Props) {
  return (
    <div className="px-4 pb-24 pt-4 sm:px-6 md:pb-6 md:pt-6 lg:px-8 lg:pt-8 max-w-[1600px] mx-auto w-full">
      <header className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand sm:text-xs">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-0.5 text-xl font-extrabold text-ink sm:text-2xl lg:text-3xl break-words">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-xs leading-relaxed text-muted sm:text-sm max-w-2xl">{subtitle}</p>
          )}
        </div>
        {action && (
          <div className="w-full shrink-0 sm:w-auto sm:max-w-md flex flex-col gap-2 sm:items-end">
            {action}
          </div>
        )}
      </header>
      {children}
    </div>
  );
}
