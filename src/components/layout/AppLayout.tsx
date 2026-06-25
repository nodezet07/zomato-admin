import { Outlet } from 'react-router-dom';
import { SidebarComponent } from './Sidebar';
import { UserDropdown } from './UserDropdown';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export function AppLayout() {
  return (
    <SidebarProvider>
      <SidebarComponent />
      <div className="flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-black/5 bg-white px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-muted hover:text-ink" />
            <h2 className="text-sm font-extrabold text-ink">Platform Administration</h2>
          </div>
          <UserDropdown />
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-surface">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
