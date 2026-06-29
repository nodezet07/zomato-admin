import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Bike,
  ClipboardList,
  Wallet,
  Settings2,
  RotateCcw,
  BookOpen,
  Headphones,
  Users,
  Tag,
  Image,
  BarChart3,
  ScrollText,
  MoreHorizontal,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const primaryLinks = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Users', icon: Users, end: false },
  { to: '/restaurants', label: 'Restaurants', icon: Store, end: false },
  { to: '/riders', label: 'Riders', icon: Bike, end: false },
  { to: '/orders', label: 'Orders', icon: ClipboardList, end: false },
] as const;

const moreLinks = [
  { to: '/promotions', label: 'Promotions', icon: Tag },
  { to: '/banners', label: 'Banners', icon: Image },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/finance', label: 'Finance', icon: Wallet },
  { to: '/refunds', label: 'Refunds', icon: RotateCcw },
  { to: '/audit', label: 'Audit Log', icon: ScrollText },
  { to: '/support', label: 'Support', icon: Headphones },
  // { to: '/cities', label: 'Cities', icon: MapPin },
  { to: '/ledger', label: 'Ledger', icon: BookOpen },
  { to: '/platform', label: 'Config', icon: Settings2 },
] as const;

export function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const moreActive = moreLinks.some((l) => location.pathname.startsWith(l.to));

  return (
    <nav
      className="md:hidden shrink-0 border-t border-black/5 bg-white/95 backdrop-blur-md z-30"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid h-14 grid-cols-6 items-stretch">
        {primaryLinks.map(({ to, label, end, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex flex-col items-center justify-center gap-0.5 px-0.5 py-1 text-[9px] font-bold transition',
                isActive ? 'text-brand' : 'text-muted-foreground hover:text-ink',
              ].join(' ')
            }
          >
            <Icon className="size-[18px] shrink-0" strokeWidth={2.25} />
            <span className="w-full truncate text-center">{label}</span>
          </NavLink>
        ))}

        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className={[
                'flex flex-col items-center justify-center gap-0.5 px-0.5 py-1 text-[9px] font-bold transition cursor-pointer',
                moreActive ? 'text-brand' : 'text-muted-foreground hover:text-ink',
              ].join(' ')}
            >
              <MoreHorizontal className="size-[18px] shrink-0" strokeWidth={2.25} />
              <span>More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl pb-8 bg-white max-h-[70vh] overflow-y-auto">
            <SheetHeader className="pb-2 border-b border-black/5">
              <SheetTitle className="text-left text-base font-extrabold text-ink">More Sections</SheetTitle>
            </SheetHeader>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {moreLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-bold transition',
                      isActive
                        ? 'border-brand/30 bg-brand/5 text-brand'
                        : 'border-black/5 text-ink hover:bg-black/[0.02]',
                    ].join(' ')
                  }
                >
                  <Icon className="size-5 shrink-0" />
                  <span className="truncate">{label}</span>
                </NavLink>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
