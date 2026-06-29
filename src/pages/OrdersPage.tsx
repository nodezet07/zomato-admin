import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cancelOrder, fetchOrders } from '@/services/admin';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

const STATUSES = [
  '',
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'RIDER_ASSIGNED',
  'PICKED_UP',
  'ON_THE_WAY',
  'DELIVERED',
  'CANCELLED',
];

export function OrdersPage() {
  const qc = useQueryClient();
  const isMobile = useIsMobile();
  const [page, setPage] = useState(1);
  const [orderStatus, setOrderStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, orderStatus],
    queryFn: () => fetchOrders(page, orderStatus || undefined),
  });

  const cancelMut = useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId, 'Cancelled by admin'),
    onSuccess: () => {
      toast.success('Order cancelled');
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const canCancel = (status: string) =>
    !['DELIVERED', 'CANCELLED'].includes(status);

  return (
    <PageShell
      eyebrow="Operations"
      title="Orders"
      subtitle="All platform orders"
      action={
        <select
          className="w-full sm:w-auto rounded-lg border border-black/10 px-3 py-2 text-sm"
          value={orderStatus}
          onChange={(e) => { setOrderStatus(e.target.value); setPage(1); }}
        >
          <option value="">All statuses</option>
          {STATUSES.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      }
    >
      {isMobile ? (
        <div className="grid grid-cols-2 gap-3">
          {isLoading && (
            <div className="col-span-2 text-center py-8 text-muted bg-white border border-black/5 rounded-xl">Loading…</div>
          )}
          {data?.orders.map((o) => (
            <Card key={o._id} className="border-black/5 overflow-hidden shadow-sm bg-white">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-mono text-xs font-black text-brand bg-brand/5 px-2 py-0.5 rounded-md inline-block">{o.orderNumber}</p>
                    <p className="text-xs text-muted-foreground mt-1.5"><span className="font-bold">Customer:</span> {o.customerId?.fullName ?? '—'}</p>
                    <p className="text-xs text-muted-foreground"><span className="font-bold">Restaurant:</span> {o.restaurantId?.restaurantName ?? '—'}</p>
                  </div>
                  <Badge variant="secondary">{o.orderStatus}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-zinc-100">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rider</p>
                    <p className="font-mono text-xs text-zinc-700">{o.riderId?.riderCode ?? '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Payment</p>
                    <p className="font-semibold text-zinc-700 capitalize">{o.paymentMethod.toLowerCase()}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total</p>
                    <p className="font-black text-brand">{formatCurrency(o.grandTotal)}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] text-muted-foreground">{formatDate(o.createdAt)}</span>
                  {canCancel(o.orderStatus) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancelMut.mutate(o._id)}
                      disabled={cancelMut.isPending}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {!isLoading && !data?.orders.length && (
            <div className="col-span-2 text-center py-8 text-muted bg-white border border-black/5 rounded-xl">No orders found.</div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-black/5 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Rider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted">Loading…</TableCell>
                </TableRow>
              )}
              {data?.orders.map((o) => (
                <TableRow key={o._id}>
                  <TableCell className="font-mono text-sm">{o.orderNumber}</TableCell>
                  <TableCell>{o.customerId?.fullName ?? '—'}</TableCell>
                  <TableCell>{o.restaurantId?.restaurantName ?? '—'}</TableCell>
                  <TableCell className="font-mono text-xs">{o.riderId?.riderCode ?? '—'}</TableCell>
                  <TableCell><Badge variant="secondary">{o.orderStatus}</Badge></TableCell>
                  <TableCell>{o.paymentMethod}</TableCell>
                  <TableCell>{formatCurrency(o.grandTotal)}</TableCell>
                  <TableCell className="text-sm text-muted">{formatDate(o.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {canCancel(o.orderStatus) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelMut.mutate(o._id)}
                        disabled={cancelMut.isPending}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {data && data.pagination.totalPages > 1 && (
        <div className="mt-4 flex gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <Button variant="outline" disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </PageShell>
  );
}
