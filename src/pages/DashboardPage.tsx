import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageShell } from '@/components/layout/PageShell';
import {
  DonutBreakdownChart,
  HorizontalBarList,
  QuickStatsCard,
} from '@/components/dashboard/BreakdownCharts';
import { RevenueAreaChart } from '@/components/dashboard/RevenueAreaChart';
import {
  formatSparkCurrency,
  SparklineStatCard,
  type SparklinePoint,
} from '@/components/dashboard/SparklineStatCard';
import { STATS_GRID_CLASS } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  fetchAnalyticsSummary,
  fetchDashboard,
  fetchFinanceSummary,
  fetchTaxReport,
} from '@/services/admin';
import { cn, formatCurrency } from '@/lib/utils';
import {
  Bike,
  ClipboardList,
  IndianRupee,
  Store,
  TrendingUp,
  Users,
  ChevronRight,
} from 'lucide-react';

type DayRow = { _id: string; revenue?: number; count?: number; orders?: number; deliveries?: number };

function toSparkline(rows: DayRow[], valueKey: keyof DayRow): SparklinePoint[] {
  return rows.map((r) => ({
    date: r._id,
    value: Number(r[valueKey] ?? 0),
  }));
}

const RANGE_OPTIONS = [
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
] as const;

export function DashboardPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAnalyticsView = pathname.startsWith('/analytics');
  const pageTitle = isAnalyticsView ? 'Analytics' : 'Dashboard';
  const pageSubtitle = isAnalyticsView
    ? 'Revenue trends, order volume, and platform performance'
    : 'Track revenue, orders, fleet health, and payouts in one place';
  const [days, setDays] = useState('30');
  const daysNum = Number(days);

  const statsQ = useQuery({ queryKey: ['admin-dashboard'], queryFn: fetchDashboard });
  const financeQ = useQuery({ queryKey: ['admin-finance-summary'], queryFn: fetchFinanceSummary });
  const summaryQ = useQuery({
    queryKey: ['admin-analytics', days],
    queryFn: () => fetchAnalyticsSummary(daysNum),
  });
  const taxQ = useQuery({
    queryKey: ['admin-tax', days],
    queryFn: () => fetchTaxReport(daysNum),
  });

  const stats = statsQ.data;
  const finance = financeQ.data;
  const sales = summaryQ.data?.sales as Record<string, unknown> | undefined;
  const orders = summaryQ.data?.orders as Record<string, unknown> | undefined;
  const users = summaryQ.data?.users as Record<string, unknown> | undefined;
  const delivery = summaryQ.data?.delivery as Record<string, unknown> | undefined;
  const tax = taxQ.data as Record<string, unknown> | undefined;

  const isLoading =
    statsQ.isLoading || financeQ.isLoading || summaryQ.isLoading || taxQ.isLoading;

  const revenueByDay = (sales?.revenueByDay as DayRow[]) ?? [];
  const ordersByDay = (orders?.ordersByDay as DayRow[]) ?? [];
  const newUsersByDay = (users?.newUsersByDay as DayRow[]) ?? [];
  const deliveriesByDay = (delivery?.deliveriesByDay as DayRow[]) ?? [];
  const ordersByStatus = (orders?.ordersByStatus as Array<{ _id: string; count: number }>) ?? [];
  const paymentMethods =
    (sales?.revenueByPaymentMethod as Array<{ _id: string; revenue: number }>) ?? [];
  const topRestaurants =
    (sales?.topRestaurants as Array<{ restaurantName?: string; revenue: number; orders: number }>) ??
    [];

  const derived = useMemo(() => {
    const rangeRevenue = Number(sales?.totalRevenue ?? 0);
    const deliveredOrders = Number(sales?.deliveredOrders ?? 0);
    const avgOrderValue = Number(sales?.avgOrderValue ?? 0);
    const revenuePerDay = daysNum > 0 ? rangeRevenue / daysNum : 0;
    const ordersPerDay = daysNum > 0 ? deliveredOrders / daysNum : 0;
    const capturedRatio = stats?.revenue.totalDelivered
      ? ((stats.revenue.capturedPayments / stats.revenue.totalDelivered) * 100).toFixed(1)
      : '0';

    return {
      rangeRevenue,
      deliveredOrders,
      avgOrderValue,
      revenuePerDay,
      ordersPerDay,
      capturedRatio,
    };
  }, [sales, stats, daysNum]);

  if (isLoading) {
    return (
      <PageShell title={pageTitle} subtitle="Loading platform overview…">
        <div className={STATS_GRID_CLASS}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
        <Skeleton className="mt-4 h-72 rounded-xl" />
      </PageShell>
    );
  }

  const revenueChartData = revenueByDay.map((d) => ({
    date: d._id,
    revenue: d.revenue ?? 0,
    orders: d.orders ?? 0,
  }));

  const statusDonut = ordersByStatus.map((s) => ({
    name: s._id,
    value: s.count,
  }));

  const paymentBars = paymentMethods.map((p) => ({
    label: p._id || 'Unknown',
    value: p.revenue,
  }));

  const restaurantBars = topRestaurants.map((r) => ({
    label: r.restaurantName ?? 'Restaurant',
    value: r.revenue,
  }));

  return (
    <PageShell
      eyebrow={isAnalyticsView ? 'Analytics' : 'Platform overview'}
      title={pageTitle}
      subtitle={pageSubtitle}
      action={
        <div className="flex w-full items-center gap-1 rounded-xl border border-black/10 bg-white p-1 shadow-sm sm:w-auto">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDays(opt.value)}
              className={cn(
                'flex-1 rounded-lg px-2 py-2 text-[11px] font-bold transition sm:flex-none sm:px-3 sm:py-1.5 sm:text-xs',
                days === opt.value
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-zinc-600 hover:bg-zinc-50',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      }
    >
      {/* KPI sparkline row */}
      <div className={`mb-6 ${STATS_GRID_CLASS}`}>
        <SparklineStatCard
          label="Range revenue"
          sublabel={`${days}d`}
          value={formatCurrency(derived.rangeRevenue)}
          series={toSparkline(revenueByDay, 'revenue')}
          color="hsl(24 100% 50%)"
          icon={IndianRupee}
          formatChange={formatSparkCurrency}
        />
        <SparklineStatCard
          label="Delivered orders"
          sublabel={`${days}d`}
          value={derived.deliveredOrders.toLocaleString()}
          series={toSparkline(ordersByDay, 'count')}
          color="hsl(173 58% 39%)"
          icon={ClipboardList}
        />
        <SparklineStatCard
          label="New users"
          sublabel={`${days}d`}
          value={Number(users?.newUsersInPeriod ?? 0).toLocaleString()}
          series={toSparkline(newUsersByDay, 'count')}
          color="hsl(221 83% 53%)"
          icon={Users}
        />
        <SparklineStatCard
          label="Deliveries"
          sublabel={`${days}d`}
          value={Number(delivery?.totalDeliveriesInPeriod ?? 0).toLocaleString()}
          series={toSparkline(deliveriesByDay, 'deliveries')}
          color="hsl(142 76% 36%)"
          icon={Bike}
        />
      </div>

      {/* Platform snapshot row */}
      <div className={`mb-6 ${STATS_GRID_CLASS}`}>
        <SparklineStatCard
          label="Total users"
          value={(stats?.users.total ?? 0).toLocaleString()}
          series={toSparkline(newUsersByDay, 'count')}
          color="hsl(221 83% 53%)"
          icon={Users}
          onClick={() => navigate('/users')}
        />
        <SparklineStatCard
          label="Restaurants"
          value={(stats?.restaurants.total ?? 0).toLocaleString()}
          series={[{ date: 'now', value: stats?.restaurants.total ?? 0 }]}
          color="hsl(24 100% 50%)"
          icon={Store}
          onClick={() => navigate('/restaurants')}
        />
        <SparklineStatCard
          label="Riders"
          value={(stats?.riders.total ?? 0).toLocaleString()}
          series={toSparkline(deliveriesByDay, 'deliveries')}
          color="hsl(142 76% 36%)"
          icon={Bike}
          onClick={() => navigate('/riders?status=pending')}
        />
        <SparklineStatCard
          label="Captured GMV"
          value={formatCurrency(stats?.revenue.capturedPayments ?? 0)}
          series={toSparkline(revenueByDay, 'revenue')}
          color="hsl(173 58% 39%)"
          icon={TrendingUp}
          formatChange={formatSparkCurrency}
        />
      </div>

      {/* Main charts */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RevenueAreaChart data={revenueChartData} days={daysNum} />
        <DonutBreakdownChart
          title="Orders by status"
          subtitle="Distribution in selected period"
          data={statusDonut}
          centerLabel={String(orders?.totalOrders ?? 0)}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HorizontalBarList
          title="Revenue by payment method"
          subtitle="How customers pay"
          items={paymentBars}
          valueFormatter={(n) => formatCurrency(n)}
        />
        <HorizontalBarList
          title="Top restaurants"
          subtitle="Highest revenue in period"
          items={restaurantBars}
          valueFormatter={(n) => formatCurrency(n)}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickStatsCard
          title="Quick stats"
          subtitle="Key metrics summary"
          rows={[
            { label: 'Avg order value', value: formatCurrency(derived.avgOrderValue) },
            { label: 'Orders per day', value: derived.ordersPerDay.toFixed(1) },
            { label: 'Revenue per day', value: formatCurrency(derived.revenuePerDay) },
            { label: 'Online riders', value: String(delivery?.onlineRiders ?? 0) },
            { label: 'Capture rate', value: `${derived.capturedRatio}%` },
            { label: 'Avg delivery time', value: `${delivery?.avgDeliveryTimeMinutes ?? 0} min` },
          ]}
        />

        <QuickStatsCard
          title="Pending actions"
          subtitle="Requires admin attention"
          rows={[
            {
              label: 'Rider verifications',
              value: String(stats?.riders.pendingApproval ?? 0),
            },
            {
              label: 'Restaurant approvals',
              value: String(stats?.restaurants.pendingApproval ?? 0),
            },
            {
              label: 'Refund tickets',
              value: String(stats?.support.pendingRefundTickets ?? 0),
            },
            {
              label: 'Pending rider payout',
              value: formatCurrency(finance?.pendingRiderPayout.grossEarnings ?? 0),
            },
            {
              label: 'Pending rest. settlement',
              value: formatCurrency(finance?.pendingRestaurantSettlement.netPayable ?? 0),
            },
            {
              label: 'Tax collected',
              value: formatCurrency(Number(tax?.totalTaxCollected ?? 0)),
            },
          ]}
        />

        <Card className="border-black/5 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {[
              { label: 'Review pending riders', href: '/riders?status=pending', count: stats?.riders.pendingApproval },
              { label: 'Manage restaurants', href: '/restaurants', count: stats?.restaurants.pendingApproval },
              { label: 'View all orders', href: '/orders' },
              { label: 'Finance & payouts', href: '/finance' },
              { label: 'Support tickets', href: '/support', count: stats?.support.pendingRefundTickets },
            ].map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center justify-between rounded-lg px-2 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 active:bg-zinc-100 min-h-[44px]"
              >
                <span>{item.label}</span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  {item.count !== undefined && item.count > 0 ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700">
                      {item.count}
                    </span>
                  ) : null}
                  <ChevronRight className="size-4" />
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Finance footer row */}
      <div className={STATS_GRID_CLASS}>
        {[
          { label: 'Platform GMV', value: formatCurrency(finance?.platform.totalGmv ?? 0) },
          { label: 'Commission earned', value: formatCurrency(finance?.platform.totalCommission ?? 0) },
          { label: 'Delivery fees', value: formatCurrency(finance?.platform.totalDeliveryFees ?? 0) },
          { label: 'Orders today', value: String(stats?.orders.today ?? 0) },
        ].map((item) => (
          <Card key={item.label} className="border-black/5 bg-white shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground sm:text-[10px]">
                {item.label}
              </p>
              <p className="mt-1 text-lg font-black text-ink sm:text-xl break-all">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {topRestaurants.length > 0 ? (
        <Card className="mt-6 border-black/5 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Top performing restaurants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-zinc-100">
              {topRestaurants.slice(0, 5).map((r, i) => (
                <div key={i} className="flex flex-col gap-2 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-black text-zinc-600">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-ink truncate">{r.restaurantName ?? 'Restaurant'}</p>
                      <p className="text-xs text-muted-foreground">{r.orders} orders</p>
                    </div>
                  </div>
                  <span className="font-black text-brand shrink-0 sm:text-right">{formatCurrency(r.revenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </PageShell>
  );
}
