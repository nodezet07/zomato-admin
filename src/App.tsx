import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { UsersPage } from '@/pages/UsersPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { RestaurantsPage } from '@/pages/RestaurantsPage';
import { RidersPage } from '@/pages/RidersPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { FinancePage } from '@/pages/FinancePage';
import { RefundsPage } from '@/pages/RefundsPage';
import { SupportPage } from '@/pages/SupportPage';
import { CitiesPage } from '@/pages/CitiesPage';
import { LedgerPage } from '@/pages/LedgerPage';
import { PlatformPage } from '@/pages/PlatformPage';
import { PromotionsPage } from '@/pages/PromotionsPage';
import { BannersPage } from '@/pages/BannersPage';
import { AuditPage } from '@/pages/AuditPage';
import { useAuthStore } from '@/stores/authStore';

function PublicOnly({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnly>
              <LoginPage />
            </PublicOnly>
          }
        />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="restaurants" element={<RestaurantsPage />} />
            <Route path="riders" element={<RidersPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="promotions" element={<PromotionsPage />} />
            <Route path="banners" element={<BannersPage />} />
            <Route path="analytics" element={<DashboardPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="refunds" element={<RefundsPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="cities" element={<CitiesPage />} />
            <Route path="ledger" element={<LedgerPage />} />
            <Route path="platform" element={<PlatformPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  );
}
