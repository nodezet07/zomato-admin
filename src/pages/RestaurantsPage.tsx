import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  approveRestaurant,
  fetchRestaurants,
  rejectRestaurant,
  updateRestaurantCommission,
} from '@/services/admin';

export function RestaurantsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('');
  const [commissionDialog, setCommissionDialog] = useState<{
    id: string;
    name: string;
    current: number;
    settlementCycle?: string;
  } | null>(null);
  const [commission, setCommission] = useState('15');
  const [settlementCycle, setSettlementCycle] = useState('WEEKLY');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-restaurants', page, status],
    queryFn: () => fetchRestaurants(page, status || undefined),
  });

  const approveMut = useMutation({
    mutationFn: approveRestaurant,
    onSuccess: () => {
      toast.success('Restaurant approved');
      qc.invalidateQueries({ queryKey: ['admin-restaurants'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rejectMut = useMutation({
    mutationFn: (id: string) => rejectRestaurant(id, 'Rejected by admin'),
    onSuccess: () => {
      toast.success('Restaurant rejected');
      qc.invalidateQueries({ queryKey: ['admin-restaurants'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const commissionMut = useMutation({
    mutationFn: () =>
      updateRestaurantCommission(commissionDialog!.id, Number(commission), settlementCycle),
    onSuccess: () => {
      toast.success('Commission updated');
      setCommissionDialog(null);
      qc.invalidateQueries({ queryKey: ['admin-restaurants'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <PageShell
      eyebrow="Partners"
      title="Restaurants"
      subtitle="Approve partners and configure per-restaurant commission"
      action={
        <select
          className="rounded-lg border border-black/10 px-3 py-2 text-sm"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      }
    >
      <div className="rounded-xl border border-black/5 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Restaurant</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Settlement</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted py-8">Loading…</TableCell>
              </TableRow>
            )}
            {data?.restaurants.map((r) => (
              <TableRow key={r._id}>
                <TableCell className="font-semibold">{r.restaurantName}</TableCell>
                <TableCell className="text-sm text-muted">
                  {r.ownerId?.fullName ?? '—'}
                  <br />
                  <span className="text-xs">{r.ownerId?.email}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={r.restaurantStatus === 'approved' ? 'default' : 'secondary'}>
                    {r.restaurantStatus}
                  </Badge>
                </TableCell>
                <TableCell>{r.platformCommissionPercentage ?? 15}%</TableCell>
                <TableCell className="text-xs text-muted">{r.settlementCycle ?? 'WEEKLY'}</TableCell>
                <TableCell className="text-right space-x-2">
                  {r.restaurantStatus === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => approveMut.mutate(r._id)}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => rejectMut.mutate(r._id)}>Reject</Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setCommissionDialog({
                        id: r._id,
                        name: r.restaurantName,
                        current: r.platformCommissionPercentage ?? 15,
                        settlementCycle: r.settlementCycle,
                      });
                      setCommission(String(r.platformCommissionPercentage ?? 15));
                      setSettlementCycle(r.settlementCycle ?? 'WEEKLY');
                    }}
                  >
                    Commission
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data && data.pagination.totalPages > 1 && (
        <div className="mt-4 flex gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <Button variant="outline" disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      <Dialog open={!!commissionDialog} onOpenChange={() => setCommissionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Commission — {commissionDialog?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="number"
              min={0}
              max={100}
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              placeholder="Commission %"
            />
            <div>
              <label className="text-sm font-medium">Settlement cycle</label>
              <select
                className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                value={settlementCycle}
                onChange={(e) => setSettlementCycle(e.target.value)}
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Bi-weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
            <Button
              className="w-full bg-brand"
              onClick={() => commissionMut.mutate()}
              disabled={commissionMut.isPending}
            >
              Save commission
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
