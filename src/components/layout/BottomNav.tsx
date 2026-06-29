import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const primaryLinks = [
  { to: '/', label: 'Home', shortLabel: 'Home', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Users', shortLabel: 'Users', icon: Users, end: false },
  { to: '/restaurants', label: 'Restaurants', shortLabel: 'Shops', icon: Store, end: false },
  { to: '/riders', label: 'Riders', shortLabel: 'Riders', icon: Bike, end: false },
  { to: '/orders', label: 'Orders', shortLabel: 'Orders', icon: ClipboardList, end: false },
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
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const moreActive = moreLinks.some((l) => location.pathname.startsWith(l.to));

  const handleLogout = () => {
    setMoreOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav
      className="md:hidden shrink-0 border-t border-black/5 bg-white/95 backdrop-blur-md z-30"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 4px)' }}
    >
      <div className="grid h-[52px] grid-cols-6 items-stretch">
        {primaryLinks.map(({ to, shortLabel, end, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex flex-col items-center justify-center gap-0.5 px-0.5 py-1 text-[8px] font-bold transition min-w-0',
                isActive ? 'text-brand' : 'text-muted-foreground hover:text-ink',
              ].join(' ')
            }
          >
            <Icon className="size-[17px] shrink-0" strokeWidth={2.25} />
            <span className="w-full truncate text-center leading-none">{shortLabel}</span>
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
                        : 'border-black/5 text-ink hover:bg-black/2',
                    ].join(' ')
                  }
                >
                  <Icon className="size-5 shrink-0" />
                  <span className="truncate">{label}</span>
                </NavLink>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full rounded-xl border-rose-200 font-bold text-rose-600 hover:bg-rose-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 size-4" />
              Log out
            </Button>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
