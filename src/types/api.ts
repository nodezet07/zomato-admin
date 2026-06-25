export type AdminUser = {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type DashboardStats = {
  users: { total: number };
  restaurants: { total: number; pendingApproval: number };
  riders: { total: number; pendingApproval: number };
  orders: { total: number; today: number; active: number; delivered: number };
  revenue: { totalDelivered: number; capturedPayments: number };
  support: { pendingRefundTickets: number };
};

export type FinanceSummary = {
  platform: {
    totalGmv: number;
    totalCommission: number;
    totalPlatformFees: number;
    totalDeliveryFees: number;
    totalRiderEarningsAccrued: number;
    totalRestaurantPayableAccrued: number;
  };
  pendingRestaurantSettlement: { orderCount: number; netPayable: number };
  pendingRiderPayout: { deliveryCount: number; grossEarnings: number };
  settlementBatches: {
    restaurantPending: number;
    restaurantPaid: number;
    riderPending: number;
    riderPaid: number;
  };
};

export type RestaurantRow = {
  _id: string;
  restaurantName: string;
  restaurantStatus: string;
  isOpen: boolean;
  platformCommissionPercentage?: number;
  settlementCycle?: string;
  city?: string;
  ownerId?: { fullName?: string; email?: string; mobile?: string };
};

export type RiderRow = {
  _id: string;
  riderCode: string;
  verificationStatus: string;
  onlineStatus: boolean;
  vehicleType?: string;
  vehicleNumber?: string;
  drivingLicense?: string;
  aadhaarCard?: string;
  profileImage?: string;
  bankAccountDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
  };
  totalDeliveries: number;
  totalEarnings: number;
  createdAt?: string;
  userId?: { fullName?: string; email?: string; mobile?: string };
};

export type UserRow = {
  _id: string;
  fullName?: string;
  email?: string;
  mobile?: string;
  role: string;
  accountStatus: string;
  createdAt: string;
};

export type OrderRow = {
  _id: string;
  orderNumber: string;
  orderStatus: string;
  grandTotal: number;
  paymentMethod: string;
  createdAt: string;
  restaurantId?: { restaurantName?: string };
  customerId?: { fullName?: string; mobile?: string };
  riderId?: { riderCode?: string };
};

export type SettlementRow = {
  _id: string;
  settlementNumber: string;
  status: string;
  netPayable: number;
  orderCount: number;
  restaurantId?: { restaurantName?: string };
  createdAt: string;
};

export type PayoutRow = {
  _id: string;
  payoutNumber: string;
  status: string;
  netPayable: number;
  deliveryCount: number;
  riderId?: { riderCode?: string };
  createdAt: string;
};

export type PendingRestaurantEarning = {
  restaurantId: string;
  restaurantName?: string;
  orderCount: number;
  netPayable: number;
};

export type PendingRiderEarning = {
  riderId: string;
  riderCode?: string;
  deliveryCount: number;
  grossEarnings: number;
};

export type PlatformPolicy = {
  _id: string;
  defaultRestaurantCommissionPercent: number;
  defaultPlatformFeePercent: number;
  maxPlatformFee: number;
  defaultDeliveryFee: number;
  settlementCycle: string;
  restaurantReserveHoldDays: number;
  riderMinWithdrawalAmount: number;
  riderBaseFare: number;
  riderPerKmRate: number;
  riderSurgeMultiplier: number;
  deliveryFeeSlabs: { maxKm: number; fee: number }[];
  cancellationRules: {
    stage: string;
    responsibleParty: string;
    chargeType: string;
    chargeValue: number;
    description: string;
  }[];
};

export type CityRow = {
  _id: string;
  cityCode: string;
  cityName: string;
  state?: string;
  isActive: boolean;
  zones: { zoneCode: string; zoneName: string; isActive: boolean }[];
};

export type LedgerEntry = {
  _id: string;
  entryNumber: string;
  entryType: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  description: string;
  recordedAt: string;
};

export type WithdrawalRow = {
  _id: string;
  requestNumber: string;
  amount: number;
  status: string;
  createdAt: string;
  riderId?: { riderCode?: string; totalEarnings?: number };
};

export type RefundTicket = {
  _id: string;
  ticketNumber: string;
  status: string;
  issueType: string;
  description: string;
  orderId?: string | { _id?: string; orderNumber?: string; grandTotal?: number };
  customerId?: { fullName?: string; email?: string };
  createdAt: string;
};

export type SupportTicket = {
  _id: string;
  ticketNumber: string;
  status: string;
  issueType: string;
  description: string;
  resolution?: string;
  createdAt: string;
  customerId?: { fullName?: string; email?: string; mobile?: string };
  orderId?: string | { _id?: string; orderNumber?: string; grandTotal?: number; orderStatus?: string };
  replies?: Array<{
    _id?: string;
    authorRole: string;
    message: string;
    createdAt: string;
  }>;
};
