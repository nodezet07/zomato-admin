import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createCoupon, deleteCoupon, fetchCoupons } from '@/services/admin';
import { formatDate } from '@/lib/utils';

const defaultForm = {
  couponCode: '',
  title: '',
  description: '',
  discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FLAT',
  discountValue: '10',
  minimumOrderAmount: '199',
  maximumDiscount: '100',
  usageLimit: '100',
  validFrom: new Date().toISOString().slice(0, 10),
  validTo: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
};

export function PromotionsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons', page, status],
    queryFn: () => fetchCoupons(page, status || undefined),
  });

  const createMut = useMutation({
    mutationFn: () =>
      createCoupon({
        couponCode: form.couponCode,
        title: form.title,
        description: form.description || undefined,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minimumOrderAmount: Number(form.minimumOrderAmount) || 0,
        maximumDiscount: form.maximumDiscount ? Number(form.maximumDiscount) : undefined,
        usageLimit: Number(form.usageLimit) || 100,
        validFrom: new Date(form.validFrom).toISOString(),
        validTo: new Date(form.validTo).toISOString(),
      }),
    onSuccess: () => {
      toast.success('Coupon created');
      setDialogOpen(false);
      setForm(defaultForm);
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      toast.success('Coupon deleted');
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createMut.mutate();
  };

  const scopeLabel = (restaurants: Array<{ _id: string; restaurantName?: string } | string>) => {
    if (!restaurants?.length) return 'Global';
    const first = restaurants[0];
    if (typeof first === 'string') return `${restaurants.length} restaurant(s)`;
    return restaurants
      .filter((r): r is { _id: string; restaurantName?: string } => typeof r !== 'string')
      .map((r) => r.restaurantName ?? r._id)
      .join(', ');
  };

  return (
    <PageShell
      eyebrow="Marketing"
      title="Promotions & Coupons"
      subtitle="Create and manage platform-wide and restaurant-specific offers"
      action={
        <div className="flex gap-2">
          <select
            className="rounded-lg border border-black/10 px-3 py-2 text-sm"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="EXPIRED">Expired</option>
          </select>
          <Button className="bg-brand" onClick={() => setDialogOpen(true)}>New coupon</Button>
        </div>
      }
    >
      <div className="rounded-xl border border-black/5 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Valid until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted">Loading…</TableCell>
              </TableRow>
            )}
            {data?.coupons.map((c) => (
              <TableRow key={c._id}>
                <TableCell className="font-mono font-bold">{c.couponCode}</TableCell>
                <TableCell>{c.title}</TableCell>
                <TableCell>
                  {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                  {c.minimumOrderAmount > 0 && (
                    <span className="block text-xs text-muted">Min ₹{c.minimumOrderAmount}</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">{scopeLabel(c.applicableRestaurants)}</TableCell>
                <TableCell className="text-sm">{c.usedCount}/{c.usageLimit}</TableCell>
                <TableCell className="text-sm text-muted">{formatDate(c.validTo)}</TableCell>
                <TableCell>
                  <Badge variant={c.status === 'ACTIVE' ? 'default' : 'secondary'}>{c.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteMut.mutate(c._id)}
                    disabled={deleteMut.isPending}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && !data?.coupons.length && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted">
                  No coupons yet — run <code className="text-xs">npm run seed:coupons</code> or create one
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.pagination.totalPages > 1 && (
        <div className="mt-4 flex gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <Button variant="outline" disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create coupon</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label>Coupon code</Label>
              <Input
                value={form.couponCode}
                onChange={(e) => setForm((f) => ({ ...f, couponCode: e.target.value.toUpperCase() }))}
                placeholder="WELCOME50"
                required
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <select
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                  value={form.discountType}
                  onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as 'PERCENTAGE' | 'FLAT' }))}
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FLAT">Flat amount</option>
                </select>
              </div>
              <div>
                <Label>Value</Label>
                <Input type="number" min={1} value={form.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Min order (₹)</Label>
                <Input type="number" value={form.minimumOrderAmount} onChange={(e) => setForm((f) => ({ ...f, minimumOrderAmount: e.target.value }))} />
              </div>
              <div>
                <Label>Max discount (₹)</Label>
                <Input type="number" value={form.maximumDiscount} onChange={(e) => setForm((f) => ({ ...f, maximumDiscount: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Valid from</Label>
                <Input type="date" value={form.validFrom} onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))} required />
              </div>
              <div>
                <Label>Valid to</Label>
                <Input type="date" value={form.validTo} onChange={(e) => setForm((f) => ({ ...f, validTo: e.target.value }))} required />
              </div>
            </div>
            <Button type="submit" className="w-full bg-brand" disabled={createMut.isPending}>
              Create coupon
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
