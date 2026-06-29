import { apiFetch, unwrap, type ApiResponse } from '@/lib/api';
import type {
  AdminUser,
  DashboardStats,
  FinanceSummary,
  OrderRow,
  Pagination,
  PayoutRow,
  PlatformPolicy,
  RefundTicket,
  RestaurantRow,
  RiderRow,
  SettlementRow,
  CityRow,
  LedgerEntry,
  WithdrawalRow,
} from '@/types/api';

export async function adminLogin(email: string, password: string) {
  const res = await apiFetch<
    ApiResponse<{ admin: AdminUser; accessToken: string; refreshToken: string }>
  >('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return unwrap(res);
}

export async function fetchDashboard() {
  const res = await apiFetch<ApiResponse<{ stats: DashboardStats }>>('/admin/dashboard');
  return unwrap(res).stats;
}

export async function fetchFinanceSummary() {
  const res = await apiFetch<ApiResponse<FinanceSummary>>('/admin/finance/summary');
  return unwrap(res);
}

export async function fetchRestaurants(page = 1, status?: string) {
  const q = new URLSearchParams({ page: String(page), limit: '20' });
  if (status) q.set('status', status);
  const res = await apiFetch<
    ApiResponse<{ restaurants: RestaurantRow[]; pagination: Pagination }>
  >(`/admin/restaurants?${q}`);
  return unwrap(res);
}

export type AdminCreateRestaurantInput = {
  ownerEmail: string;
  ownerFullName: string;
  ownerMobile?: string;
  autoApprove?: boolean;
  restaurantName: string;
  latitude: number;
  longitude: number;
  phone?: string;
  description?: string;
  cuisines?: string[];
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
};

export async function createRestaurant(input: AdminCreateRestaurantInput) {
  const res = await apiFetch<ApiResponse<{ restaurant: RestaurantRow }>>(
    '/admin/restaurants',
    { method: 'POST', body: JSON.stringify(input) },
  );
  return unwrap(res).restaurant;
}

export async function approveRestaurant(restaurantId: string) {
  const res = await apiFetch<ApiResponse<{ restaurant: RestaurantRow }>>(
    `/admin/restaurants/approve/${restaurantId}`,
    { method: 'PATCH' },
  );
  return unwrap(res).restaurant;
}

export async function rejectRestaurant(restaurantId: string, reason?: string) {
  const res = await apiFetch<ApiResponse<{ restaurant: RestaurantRow }>>(
    `/admin/restaurants/reject/${restaurantId}`,
    { method: 'PATCH', body: JSON.stringify({ reason }) },
  );
  return unwrap(res).restaurant;
}

export async function updateRestaurantCommission(
  restaurantId: string,
  commissionPercent: number,
  settlementCycle?: string,
) {
  const res = await apiFetch<ApiResponse<{ restaurant: RestaurantRow }>>(
    `/admin/restaurants/${restaurantId}/commission`,
    {
      method: 'PATCH',
      body: JSON.stringify({ commissionPercent, settlementCycle }),
    },
  );
  return unwrap(res).restaurant;
}

export async function fetchRiders(page = 1, verificationStatus?: string) {
  const q = new URLSearchParams({ page: String(page), limit: '20' });
  if (verificationStatus) q.set('verificationStatus', verificationStatus);
  const res = await apiFetch<
    ApiResponse<{ riders: RiderRow[]; pagination: Pagination }>
  >(`/admin/riders?${q}`);
  return unwrap(res);
}

export async function approveRider(riderId: string) {
  await apiFetch(`/admin/riders/approve/${riderId}`, { method: 'PATCH' });
}

export async function rejectRider(riderId: string, reason?: string) {
  await apiFetch(`/admin/riders/reject/${riderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

export async function fetchSupportTickets(page = 1, status?: string, issueType?: string) {
  const q = new URLSearchParams({ page: String(page), limit: '20' });
  if (status) q.set('status', status);
  if (issueType) q.set('issueType', issueType);
  const res = await apiFetch<
    ApiResponse<{ tickets: import('@/types/api').SupportTicket[]; pagination: Pagination }>
  >(`/admin/support/tickets?${q}`);
  return unwrap(res);
}

export async function fetchSupportTicket(ticketId: string) {
  const res = await apiFetch<
    ApiResponse<{ ticket: import('@/types/api').SupportTicket }>
  >(`/admin/support/tickets/${ticketId}`);
  return unwrap(res).ticket;
}

export async function replySupportTicket(ticketId: string, message: string) {
  const res = await apiFetch<
    ApiResponse<{ ticket: import('@/types/api').SupportTicket }>
  >('/admin/support/tickets/reply', {
    method: 'POST',
    body: JSON.stringify({ ticketId, message }),
  });
  return unwrap(res).ticket;
}

export async function updateSupportTicket(
  ticketId: string,
  body: { status?: string; resolution?: string },
) {
  const res = await apiFetch<
    ApiResponse<{ ticket: import('@/types/api').SupportTicket }>
  >(`/admin/support/tickets/${ticketId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return unwrap(res).ticket;
}

export async function fetchUsers(page = 1, role?: string, accountStatus?: string) {
  const q = new URLSearchParams({ page: String(page), limit: '20' });
  if (role) q.set('role', role);
  if (accountStatus) q.set('accountStatus', accountStatus);
  const res = await apiFetch<
    ApiResponse<{ users: import('@/types/api').UserRow[]; pagination: Pagination }>
  >(`/admin/users?${q}`);
  return unwrap(res);
}

export async function blockUser(userId: string) {
  await apiFetch(`/admin/users/block/${userId}`, { method: 'PATCH' });
}

export async function unblockUser(userId: string) {
  await apiFetch(`/admin/users/unblock/${userId}`, { method: 'PATCH' });
}

export async function fetchOrders(page = 1, orderStatus?: string) {
  const q = new URLSearchParams({ page: String(page), limit: '20' });
  if (orderStatus) q.set('orderStatus', orderStatus);
  const res = await apiFetch<
    ApiResponse<{ orders: OrderRow[]; pagination: Pagination }>
  >(`/admin/orders?${q}`);
  return unwrap(res);
}

export async function cancelOrder(orderId: string, reason?: string) {
  const res = await apiFetch<ApiResponse<{ order: OrderRow }>>(
    `/admin/orders/cancel/${orderId}`,
    { method: 'PATCH', body: JSON.stringify({ reason }) },
  );
  return unwrap(res).order;
}

export async function fetchSettlements(page = 1, status?: string) {
  const q = new URLSearchParams({ page: String(page), limit: '20' });
  if (status) q.set('status', status);
  const res = await apiFetch<
    ApiResponse<{ settlements: SettlementRow[]; pagination: Pagination }>
  >(`/admin/finance/restaurants/settlements?${q}`);
  return unwrap(res);
}

export async function markSettlementPaid(settlementId: string, paymentReference: string) {
  const res = await apiFetch<ApiResponse<{ settlement: SettlementRow }>>(
    `/admin/finance/restaurants/settlements/${settlementId}/mark-paid`,
    { method: 'PATCH', body: JSON.stringify({ paymentReference }) },
  );
  return unwrap(res).settlement;
}

export async function fetchPayouts(page = 1, status?: string) {
  const q = new URLSearchParams({ page: String(page), limit: '20' });
  if (status) q.set('status', status);
  const res = await apiFetch<
    ApiResponse<{ payouts: PayoutRow[]; pagination: Pagination }>
  >(`/admin/finance/riders/payouts?${q}`);
  return unwrap(res);
}

export async function markPayoutPaid(payoutId: string, paymentReference: string) {
  const res = await apiFetch<ApiResponse<{ payout: PayoutRow }>>(
    `/admin/finance/riders/payouts/${payoutId}/mark-paid`,
    { method: 'PATCH', body: JSON.stringify({ paymentReference }) },
  );
  return unwrap(res).payout;
}

export async function fetchRefunds(page = 1) {
  const res = await apiFetch<
    ApiResponse<{ tickets: RefundTicket[]; pagination: Pagination }>
  >(`/admin/refunds?page=${page}&limit=20`);
  return unwrap(res);
}

export async function fetchPlatformPolicy() {
  const res = await apiFetch<ApiResponse<{ policy: PlatformPolicy }>>('/admin/platform/policy');
  return unwrap(res).policy;
}

export async function updatePlatformPolicy(body: Partial<PlatformPolicy>) {
  const res = await apiFetch<ApiResponse<{ policy: PlatformPolicy }>>('/admin/platform/policy', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return unwrap(res).policy;
}

export async function fetchCities(page = 1) {
  const res = await apiFetch<
    ApiResponse<{ cities: CityRow[]; pagination: Pagination }>
  >(`/admin/platform/cities?page=${page}&limit=20`);
  return unwrap(res);
}

export async function createCity(body: {
  cityCode: string;
  cityName: string;
  state?: string;
}) {
  const res = await apiFetch<ApiResponse<{ city: CityRow }>>('/admin/platform/cities', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return unwrap(res).city;
}

export async function fetchLedger(page = 1, entryType?: string) {
  const q = new URLSearchParams({ page: String(page), limit: '20' });
  if (entryType) q.set('entryType', entryType);
  const res = await apiFetch<
    ApiResponse<{ entries: LedgerEntry[]; pagination: Pagination; summary: unknown[] }>
  >(`/admin/finance/ledger?${q}`);
  return unwrap(res);
}

export async function fetchWithdrawals(page = 1, status?: string) {
  const q = new URLSearchParams({ page: String(page), limit: '20' });
  if (status) q.set('status', status);
  const res = await apiFetch<
    ApiResponse<{ requests: WithdrawalRow[]; pagination: Pagination }>
  >(`/admin/finance/withdrawals?${q}`);
  return unwrap(res);
}

export async function approveWithdrawal(requestId: string, note?: string) {
  await apiFetch(`/admin/finance/withdrawals/${requestId}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ note }),
  });
}

export async function rejectWithdrawal(requestId: string, reason: string) {
  await apiFetch(`/admin/finance/withdrawals/${requestId}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

export async function markWithdrawalPaid(requestId: string, paymentReference: string) {
  await apiFetch(`/admin/finance/withdrawals/${requestId}/mark-paid`, {
    method: 'PATCH',
    body: JSON.stringify({ paymentReference }),
  });
}

export async function fetchPendingRestaurantEarnings(page = 1) {
  const res = await apiFetch<
    ApiResponse<{ restaurants: import('@/types/api').PendingRestaurantEarning[]; pagination: Pagination }>
  >(`/admin/finance/restaurants/earnings?page=${page}&limit=20`);
  return unwrap(res);
}

export async function fetchPendingRiderEarnings(page = 1) {
  const res = await apiFetch<
    ApiResponse<{ riders: import('@/types/api').PendingRiderEarning[]; pagination: Pagination }>
  >(`/admin/finance/riders/earnings?page=${page}&limit=20`);
  return unwrap(res);
}

export async function createRestaurantSettlement(restaurantId: string) {
  const res = await apiFetch<ApiResponse<{ settlement: SettlementRow }>>(
    `/admin/finance/restaurants/${restaurantId}/settlements`,
    { method: 'POST', body: JSON.stringify({}) },
  );
  return unwrap(res).settlement;
}

export async function createRiderPayout(riderId: string) {
  const res = await apiFetch<ApiResponse<{ payout: PayoutRow }>>(
    `/admin/finance/riders/${riderId}/payouts`,
    { method: 'POST', body: JSON.stringify({}) },
  );
  return unwrap(res).payout;
}

export async function markWithdrawalFailed(requestId: string, reason: string) {
  await apiFetch(`/admin/finance/withdrawals/${requestId}/mark-failed`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

export async function updateCity(
  cityId: string,
  body: {
    cityName?: string;
    state?: string;
    isActive?: boolean;
    zones?: { zoneCode: string; zoneName: string; isActive?: boolean; radiusKm?: number }[];
  },
) {
  const res = await apiFetch<ApiResponse<{ city: CityRow }>>(
    `/admin/platform/cities/${cityId}`,
    { method: 'PATCH', body: JSON.stringify(body) },
  );
  return unwrap(res).city;
}

export type CouponRow = {
  _id: string;
  couponCode: string;
  title: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscount?: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  status: string;
  applicableRestaurants: Array<{ _id: string; restaurantName?: string } | string>;
  createdAt: string;
};

export async function fetchCoupons(page = 1, status?: string) {
  const q = new URLSearchParams({ page: String(page), limit: '20' });
  if (status) q.set('status', status);
  const res = await apiFetch<
    ApiResponse<{ coupons: CouponRow[]; pagination: Pagination }>
  >(`/coupons?${q}`);
  return unwrap(res);
}

export async function createCoupon(body: {
  couponCode: string;
  title: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  validFrom: string;
  validTo: string;
  applicableRestaurants?: string[];
  status?: string;
}) {
  const res = await apiFetch<ApiResponse<{ coupon: CouponRow }>>('/coupons', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return unwrap(res).coupon;
}

export async function deleteCoupon(couponId: string) {
  await apiFetch(`/coupons/${couponId}`, { method: 'DELETE' });
}

export async function approveRefund(ticketId: string, amount?: number, reason?: string) {
  const res = await apiFetch<ApiResponse<unknown>>(`/admin/refunds/${ticketId}/approve`, {
    method: 'POST',
    body: JSON.stringify({ amount, reason }),
  });
  return unwrap(res);
}

export async function rejectRefund(ticketId: string, reason: string) {
  const res = await apiFetch<ApiResponse<unknown>>(`/admin/refunds/${ticketId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
  return unwrap(res);
}

export type BannerRow = {
  _id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  placement: string;
  priority: number;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
};

export async function fetchBanners(page = 1) {
  const res = await apiFetch<
    ApiResponse<{ banners: BannerRow[]; pagination: Pagination }>
  >(`/admin/banners?page=${page}&limit=20`);
  return unwrap(res);
}

export async function createBanner(body: Partial<BannerRow>) {
  const res = await apiFetch<ApiResponse<{ banner: BannerRow }>>('/admin/banners', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return unwrap(res).banner;
}

export async function updateBanner(bannerId: string, body: Partial<BannerRow>) {
  const res = await apiFetch<ApiResponse<{ banner: BannerRow }>>(
    `/admin/banners/${bannerId}`,
    { method: 'PATCH', body: JSON.stringify(body) },
  );
  return unwrap(res).banner;
}

export async function deleteBanner(bannerId: string) {
  await apiFetch(`/admin/banners/${bannerId}`, { method: 'DELETE' });
}

export type AuditLogRow = {
  _id: string;
  actorId: string;
  actorRole: string;
  module: string;
  action: string;
  entityId?: string;
  createdAt: string;
};

export async function fetchAuditLogs(page = 1, module?: string) {
  const q = new URLSearchParams({ page: String(page), limit: '30' });
  if (module) q.set('module', module);
  const res = await apiFetch<
    ApiResponse<{ logs: AuditLogRow[]; pagination: Pagination }>
  >(`/admin/audit-logs?${q}`);
  return unwrap(res);
}

export async function fetchAnalyticsSummary(days = 30) {
  const res = await apiFetch<ApiResponse<Record<string, unknown>>>(
    `/analytics/summary?days=${days}`,
  );
  return unwrap(res);
}

export async function fetchTaxReport(days = 30) {
  const res = await apiFetch<ApiResponse<{ report: Record<string, unknown> }>>(
    `/analytics/tax?days=${days}`,
  );
  return unwrap(res).report;
}

export async function downloadSettlementsCsv(status?: string) {
  const { useAuthStore } = await import('@/stores/authStore');
  const token = useAuthStore.getState().accessToken;
  const q = status ? `?status=${status}` : '';
  const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1'}/admin/finance/restaurants/settlements/export${q}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Export failed');
  return res.blob();
}
