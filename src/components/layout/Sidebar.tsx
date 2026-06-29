import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Bike,
  ClipboardList,
  Wallet,
  Settings2,
  RotateCcw,
  BookOpen,
  Shield,
  Headphones,
  Users,
  Tag,
  Image,
  BarChart3,
  ScrollText,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Users', icon: Users, end: false },
  { to: '/restaurants', label: 'Restaurants', icon: Store, end: false },
  { to: '/riders', label: 'Riders', icon: Bike, end: false },
  { to: '/orders', label: 'Orders', icon: ClipboardList, end: false },
  { to: '/promotions', label: 'Promotions', icon: Tag, end: false },
  { to: '/banners', label: 'Banners', icon: Image, end: false },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, end: false },
  { to: '/finance', label: 'Finance', icon: Wallet, end: false },
  { to: '/refunds', label: 'Refunds', icon: RotateCcw, end: false },
  { to: '/audit', label: 'Audit Log', icon: ScrollText, end: false },
  { to: '/support', label: 'Support', icon: Headphones, end: false },
  // { to: '/cities', label: 'Cities & Zones', icon: MapPin, end: false },
  { to: '/ledger', label: 'Ledger', icon: BookOpen, end: false },
  { to: '/platform', label: 'Platform Config', icon: Settings2, end: false },
];

export function SidebarComponent() {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-black/5 bg-white">
      <SidebarHeader className="h-16 border-b border-black/5 flex flex-col justify-center px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shrink-0">
            <Shield className="size-5" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h1 className="text-xs font-black tracking-tight text-ink">QuickBite</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarMenu className="px-2 space-y-1">
          {links.map(({ to, label, end, icon: Icon }) => {
            const isActive = end
              ? location.pathname === to
              : location.pathname.startsWith(to) && to !== '/';

            return (
              <SidebarMenuItem key={to}>
                <SidebarMenuButton
                  asChild
                  tooltip={label}
                  isActive={isActive}
                  className="h-10 data-[active=true]:bg-brand/10 data-[active=true]:text-brand"
                >
                  <Link to={to} className="flex items-center w-full">
                    <Icon className="size-[18px] shrink-0" />
                    <span className="font-semibold ml-3 group-data-[collapsible=icon]:hidden text-sm">
                      {label}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-black/5 p-4 group-data-[collapsible=icon]:hidden">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Platform v1.0</p>
      </SidebarFooter>
    </Sidebar>
  );
}
