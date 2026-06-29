import { Outlet } from 'react-router-dom';
import { SidebarComponent } from './Sidebar';
import { UserDropdown } from './UserDropdown';
import { BottomNav } from './BottomNav';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export function AppLayout() {
  return (
    <SidebarProvider>
      <SidebarComponent />
      <div className="flex min-w-0 flex-1 flex-col h-[100dvh] overflow-hidden">
        <header
          className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-black/5 bg-white px-3 sm:h-16 sm:px-6 shadow-sm"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <SidebarTrigger className="hidden md:inline-flex text-muted hover:text-ink shrink-0" />
            <h2 className="text-[11px] sm:text-sm font-extrabold text-ink truncate">
              <span className="sm:hidden">Admin</span>
              <span className="hidden sm:inline">Platform Administration</span>
            </h2>
          </div>
          <UserDropdown />
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-surface">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </SidebarProvider>
  );
}
