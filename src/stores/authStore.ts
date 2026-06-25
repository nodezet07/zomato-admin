import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser } from '@/types/api';

type AuthState = {
  admin: AdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (admin: AdminUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (admin, accessToken, refreshToken) =>
        set({ admin, accessToken, refreshToken }),
      logout: () => set({ admin: null, accessToken: null, refreshToken: null }),
      isAuthenticated: () => Boolean(get().accessToken),
    }),
    { name: 'qb-admin-auth' },
  ),
);
