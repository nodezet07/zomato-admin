import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageShell } from '@/components/layout/PageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  fetchDashboard, 
  fetchFinanceSummary, 
  fetchAnalyticsSummary, 
  fetchTaxReport 
} from '@/services/admin';
import { formatCurrency } from '@/lib/utils';
import { 
  Users, 
  Store, 
  Bike, 
  ClipboardList, 
  TrendingUp, 
  ShieldAlert, 
  LineChart,
  Percent,
  CheckCircle,
  Truck,
  PiggyBank
} from 'lucide-react';

function StatCard({ 
  label, 
  value, 
  hint, 
  icon: Icon 
}: { 
  label: string; 
  value: string | number; 
  hint?: string;
  icon?: any;
}) {
  return (
    <Card className="border-black/5 shadow-sm bg-white hover:shadow-md transition duration-300">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted">{label}</CardTitle>
        {Icon && <Icon className="h-4.5 w-4.5 text-muted/65" />}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-black text-ink">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted font-medium">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function MiniBarChart({ data, valueType = 'currency' }: { 
  data: Array<{ _id: string; revenue?: number; orders?: number; taxCollected?: number }>;
  valueType?: 'currency' | 'number';
}) {
  const max = Math.max(...data.map((d) => d.revenue ?? d.orders ?? d.taxCollected ?? 0), 1);
  return (
    <div className="flex items-end gap-2 h-44 mt-6">
      {data.slice(-14).map((d) => {
        const val = d.revenue ?? d.orders ?? d.taxCollected ?? 0;
        const h = Math.max(6, (val / max) * 100);
        const displayVal = valueType === 'currency' ? formatCurrency(val) : String(val);
        
        return (
          <div key={d._id} className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer">
            <div className="w-full relative flex flex-col justify-end">
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none whitespace-nowrap shadow-md">
                {d._id}: {displayVal}
              </div>
              <div 
                className="w-full bg-brand/80 group-hover:bg-brand rounded-t transition duration-300" 
                style={{ height: `${h}px` }} 
              />
            </div>
            <span className="text-[10px] font-bold text-muted truncate w-full text-center">{d._id.slice(5)}</span>
          </div>
        );
      })}
    </div>
  );
}

export function DashboardPage() {
  const [days, setDays] = useState('30');
  
  // Queries
  const statsQ = useQuery({ queryKey: ['admin-dashboard'], queryFn: fetchDashboard });
  const financeQ = useQuery({ queryKey: ['admin-finance-summary'], queryFn: fetchFinanceSummary });
  
  const summaryQ = useQuery({
    queryKey: ['admin-analytics', days],
    queryFn: () => fetchAnalyticsSummary(Number(days)),
  });
  
  const taxQ = useQuery({
    queryKey: ['admin-tax', days],
    queryFn: () => fetchTaxReport(Number(days)),
  });

  const stats = statsQ.data;
  const finance = financeQ.data;
  
  const sales = summaryQ.data?.sales as Record<string, any> | undefined;
  const orders = summaryQ.data?.orders as Record<string, any> | undefined;
  const delivery = summaryQ.data?.delivery as Record<string, any> | undefined;
  const tax = taxQ.data as Record<string, any> | undefined;

  const isLoading = statsQ.isLoading || financeQ.isLoading || summaryQ.isLoading || taxQ.isLoading;

  if (isLoading) {
    return (
      <PageShell title="Dashboard & Analytics" subtitle="Loading platform overview metrics...">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </PageShell>
    );
  }

  // Calculated custom stats ratios
  const capturedRatio = stats?.revenue.totalDelivered 
    ? ((stats.revenue.capturedPayments / stats.revenue.totalDelivered) * 100).toFixed(1)
    : '0';

  return (
    <PageShell
      eyebrow="Insights & Management"
      title="Dashboard & Analytics"
      subtitle="Merged real-time platform metrics, financial summaries, and tax reports"
      action={
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-muted uppercase tracking-wider">Report Range:</span>
          <select 
            className="rounded-lg border px-3 py-2 text-sm font-semibold bg-white cursor-pointer shadow-sm text-zinc-700" 
            value={days} 
            onChange={(e) => setDays(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      }
    >
      {/* Real-time stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard label="Total Users" value={stats?.users.total ?? 0} icon={Users} />
        <StatCard
          label="Restaurants Active"
          value={stats?.restaurants.total ?? 0}
          hint={`${stats?.restaurants.pendingApproval ?? 0} pending approval`}
          icon={Store}
        />
        <StatCard
          label="Riders Active"
          value={stats?.riders.total ?? 0}
          hint={
            (stats?.riders.pendingApproval ?? 0) > 0
              ? `${stats?.riders.pendingApproval ?? 0} pending — open Riders page`
              : 'All riders verified'
          }
          icon={Bike}
        />
        <StatCard
          label="Orders Today"
          value={stats?.orders.today ?? 0}
          hint={`${stats?.orders.active ?? 0} active currently`}
          icon={ClipboardList}
        />
      </div>

      <Tabs defaultValue="platform" className="w-full">
        <TabsList className="bg-zinc-100 p-1 rounded-xl">
          <TabsTrigger value="platform" className="rounded-lg font-bold text-sm">Platform Health</TabsTrigger>
          <TabsTrigger value="revenue" className="rounded-lg font-bold text-sm">Sales & Volume</TabsTrigger>
          <TabsTrigger value="finance" className="rounded-lg font-bold text-sm">Finance & Payouts</TabsTrigger>
          <TabsTrigger value="gst" className="rounded-lg font-bold text-sm">GST & Tax Reports</TabsTrigger>
        </TabsList>

        {/* Tab 1: Platform health & operations summary */}
        <TabsContent value="platform" className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Delivered GMV"
              value={formatCurrency(stats?.revenue.totalDelivered ?? 0)}
              hint={`Payments captured ratio: ${capturedRatio}%`}
              icon={CheckCircle}
            />
            <StatCard
              label="Captured Payments"
              value={formatCurrency(stats?.revenue.capturedPayments ?? 0)}
              icon={TrendingUp}
            />
            <StatCard
              label="Pending Support/Refunds"
              value={stats?.support.pendingRefundTickets ?? 0}
              hint="Requires admin review"
              icon={ShieldAlert}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            <Card className="border-black/5 shadow-sm">
              <CardHeader><CardTitle className="text-sm font-bold">Today's Activity Feed</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-3 text-xs leading-relaxed text-zinc-600">
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-100">
                  <span className="font-semibold text-zinc-800">&bull; Orders delivered today</span>
                  <span className="font-black text-emerald-600">{stats?.orders.today ?? 0}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-100">
                  <span className="font-semibold text-zinc-800">&bull; Total pending restaurant approvals</span>
                  <span className="font-black text-amber-600">{stats?.restaurants.pendingApproval ?? 0}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-100">
                  <span className="font-semibold text-zinc-800">&bull; Total pending rider verifications</span>
                  <Link
                    to="/riders?status=pending"
                    className="font-black text-amber-600 hover:underline"
                  >
                    {stats?.riders.pendingApproval ?? 0} — review
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-black/5 shadow-sm">
              <CardHeader><CardTitle className="text-sm font-bold">Settlement Batches Pipeline</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                  <div className="font-bold text-zinc-500 uppercase tracking-wide text-[9px]">Rest. Pending Payouts</div>
                  <div className="text-lg font-black text-zinc-800 mt-1">{finance?.settlementBatches.restaurantPending ?? 0} batch</div>
                </div>
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                  <div className="font-bold text-zinc-500 uppercase tracking-wide text-[9px]">Rest. Paid Settlements</div>
                  <div className="text-lg font-black text-zinc-800 mt-1">{finance?.settlementBatches.restaurantPaid ?? 0} batch</div>
                </div>
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                  <div className="font-bold text-zinc-500 uppercase tracking-wide text-[9px]">Rider Pending Payouts</div>
                  <div className="text-lg font-black text-zinc-800 mt-1">{finance?.settlementBatches.riderPending ?? 0} batch</div>
                </div>
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                  <div className="font-bold text-zinc-500 uppercase tracking-wide text-[9px]">Rider Paid Payouts</div>
                  <div className="text-lg font-black text-zinc-800 mt-1">{finance?.settlementBatches.riderPaid ?? 0} batch</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Sales & Volume (analytics summary details) */}
        <TabsContent value="revenue" className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-black/5 shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase tracking-wider text-muted">Range Revenue</CardTitle></CardHeader><CardContent className="text-2xl font-black text-ink">{formatCurrency(Number(sales?.totalRevenue ?? 0))}</CardContent></Card>
            <Card className="border-black/5 shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase tracking-wider text-muted">Delivered Orders</CardTitle></CardHeader><CardContent className="text-2xl font-black text-ink">{String(sales?.deliveredOrders ?? 0)}</CardContent></Card>
            <Card className="border-black/5 shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase tracking-wider text-muted">Avg Order Value</CardTitle></CardHeader><CardContent className="text-2xl font-black text-ink">{formatCurrency(Number(sales?.avgOrderValue ?? 0))}</CardContent></Card>
            <Card className="border-black/5 shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase tracking-wider text-muted">Online Riders</CardTitle></CardHeader><CardContent className="text-2xl font-black text-ink">{String(delivery?.onlineRiders ?? 0)}</CardContent></Card>
          </div>

          <Card className="border-black/5 shadow-sm">
            <CardHeader><CardTitle className="text-sm font-bold">Revenue by Day</CardTitle></CardHeader>
            <CardContent>
              <MiniBarChart data={(sales?.revenueByDay as Array<{ _id: string; revenue: number }>) ?? []} />
            </CardContent>
          </Card>

          <Card className="border-black/5 shadow-sm">
            <CardHeader><CardTitle className="text-sm font-bold">Orders Status Breakdown</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2.5 mt-2">
              {((orders?.byStatus as Array<{ _id: string; count: number }>) ?? []).map((s) => (
                <span key={s._id} className="rounded-lg bg-zinc-100 hover:bg-zinc-200 transition px-3 py-1.5 text-xs font-bold text-zinc-700">
                  {s._id}: {s.count}
                </span>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Detailed platform finance and payout summaries (Additional Stats) */}
        <TabsContent value="finance" className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Gross GMV (Platform)"
              value={formatCurrency(finance?.platform.totalGmv ?? 0)}
              icon={LineChart}
            />
            <StatCard
              label="Platform Commission"
              value={formatCurrency(finance?.platform.totalCommission ?? 0)}
              icon={Percent}
            />
            <StatCard
              label="Platform Fees Collected"
              value={formatCurrency(finance?.platform.totalPlatformFees ?? 0)}
              icon={PiggyBank}
            />
            <StatCard
              label="Accrued Delivery Fees"
              value={formatCurrency(finance?.platform.totalDeliveryFees ?? 0)}
              icon={Truck}
            />
            <StatCard
              label="Rider Accrued Earnings"
              value={formatCurrency(finance?.platform.totalRiderEarningsAccrued ?? 0)}
              icon={Bike}
            />
            <StatCard
              label="Restaurant Accrued Earnings"
              value={formatCurrency(finance?.platform.totalRestaurantPayableAccrued ?? 0)}
              icon={Store}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            <Card className="border-black/5 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted">Pending Restaurant Settlements</CardTitle>
              </CardHeader>
              <CardContent className="flex items-end justify-between mt-2">
                <div>
                  <div className="text-3xl font-black text-[#e23744]">{formatCurrency(finance?.pendingRestaurantSettlement.netPayable ?? 0)}</div>
                  <p className="text-xs text-zinc-500 font-semibold mt-1">Pending payout to restaurants</p>
                </div>
                <span className="text-xs font-bold text-zinc-600 bg-zinc-150 px-2.5 py-1 rounded">
                  {finance?.pendingRestaurantSettlement.orderCount ?? 0} orders
                </span>
              </CardContent>
            </Card>

            <Card className="border-black/5 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted">Pending Rider Payouts</CardTitle>
              </CardHeader>
              <CardContent className="flex items-end justify-between mt-2">
                <div>
                  <div className="text-3xl font-black text-[#e23744]">{formatCurrency(finance?.pendingRiderPayout.grossEarnings ?? 0)}</div>
                  <p className="text-xs text-zinc-500 font-semibold mt-1">Accrued rider payouts pending</p>
                </div>
                <span className="text-xs font-bold text-zinc-600 bg-zinc-150 px-2.5 py-1 rounded">
                  {finance?.pendingRiderPayout.deliveryCount ?? 0} deliveries
                </span>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 4: GST / Tax (tax details) */}
        <TabsContent value="gst" className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-black/5 shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase tracking-wider text-muted">Tax Collected</CardTitle></CardHeader><CardContent className="text-2xl font-black text-ink">{formatCurrency(Number(tax?.totalTaxCollected ?? 0))}</CardContent></Card>
            <Card className="border-black/5 shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase tracking-wider text-muted">Taxable Subtotal</CardTitle></CardHeader><CardContent className="text-2xl font-black text-ink">{formatCurrency(Number(tax?.taxableSubtotal ?? 0))}</CardContent></Card>
            <Card className="border-black/5 shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase tracking-wider text-muted">Effective Rate</CardTitle></CardHeader><CardContent className="text-2xl font-black text-ink">{String(tax?.effectiveTaxRate ?? 0)}%</CardContent></Card>
          </div>
          
          <Card className="border-black/5 shadow-sm">
            <CardHeader><CardTitle className="text-sm font-bold">Tax by Day</CardTitle></CardHeader>
            <CardContent>
              <MiniBarChart data={(tax?.taxByDay as Array<{ _id: string; taxCollected: number }>) ?? []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
