import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UserDropdown() {
  const navigate = useNavigate();
  const admin = useAuthStore((s) => s.admin);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="md:hidden font-semibold text-rose-600 border-rose-200 hover:bg-rose-50"
        onClick={handleLogout}
      >
        <LogOut className="size-4 shrink-0" />
        <span className="ml-1">Log out</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="font-semibold max-w-[140px] truncate">
            {admin?.name ?? 'Admin'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled className="truncate max-w-[220px]">
            {admin?.email}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="size-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
