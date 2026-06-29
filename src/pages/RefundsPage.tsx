import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { RefundTicket } from '@/types/api';
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
import { approveRefund, fetchRefunds, rejectRefund } from '@/services/admin';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

function orderRef(orderId: RefundTicket['orderId']) {
  if (!orderId) return '—';
  if (typeof orderId === 'string') return orderId;
  return orderId.orderNumber ?? orderId._id ?? '—';
}

function orderAmount(orderId: RefundTicket['orderId']) {
  if (!orderId || typeof orderId === 'string') return undefined;
  return orderId.grandTotal;
}

export function RefundsPage() {
  const qc = useQueryClient();
  const isMobile = useIsMobile();
  const [dialog, setDialog] = useState<RefundTicket | null>(null);
  const [amount, setAmount] = useState('');
  const [rejectReason, setRejectReason] = useState('Insufficient evidence');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-refunds'],
    queryFn: () => fetchRefunds(1),
  });

  const approveMut = useMutation({
    mutationFn: () => {
      const full = orderAmount(dialog!.orderId);
      const partial = amount ? Number(amount) : full;
      return approveRefund(dialog!._id, partial, 'Admin approved refund');
    },
    onSuccess: () => {
      toast.success('Refund approved');
      setDialog(null);
      qc.invalidateQueries({ queryKey: ['admin-refunds'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rejectMut = useMutation({
    mutationFn: () => rejectRefund(dialog!._id, rejectReason),
    onSuccess: () => {
      toast.success('Refund rejected');
      setDialog(null);
      qc.invalidateQueries({ queryKey: ['admin-refunds'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openDialog = (t: RefundTicket) => {
    setDialog(t);
    setAmount(String(orderAmount(t.orderId) ?? ''));
  };

  return (
    <PageShell eyebrow="Disputes" title="Refund Management" subtitle="Approve full/partial refunds or reject requests">
      {isMobile ? (
        <div className="grid grid-cols-2 gap-3">
          {isLoading && (
            <div className="col-span-2 text-center py-8 text-muted bg-white border border-black/5 rounded-xl">Loading…</div>
          )}
          {data?.tickets.map((t) => (
            <Card key={t._id} className="border-black/5 overflow-hidden shadow-sm bg-white">
              <CardContent className="p-3 space-y-2 flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-mono text-xs font-black text-brand bg-brand/5 px-1.5 py-0.5 rounded-md truncate">{t.ticketNumber}</span>
                    <Badge variant="secondary" className="text-[9px] px-1 py-0 shrink-0">{t.status}</Badge>
                  </div>
                  <h3 className="font-bold text-ink text-xs mt-1.5 line-clamp-1">{t.customerId?.fullName ?? '—'}</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">Order: {orderRef(t.orderId)}</p>
                </div>
                <div className="pt-2 border-t border-zinc-100 flex flex-col gap-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold text-zinc-700">
                      {orderAmount(t.orderId) != null ? formatCurrency(orderAmount(t.orderId)!) : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="text-muted-foreground font-semibold">{formatDate(t.createdAt)}</span>
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <Button size="sm" className="w-full text-xs h-7 py-0" onClick={() => openDialog(t)}>Review</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!isLoading && !data?.tickets.length && (
            <div className="col-span-2 text-center py-8 text-muted bg-white border border-black/5 rounded-xl">No open refund tickets</div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-black/5 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted">Loading…</TableCell>
                </TableRow>
              )}
              {data?.tickets.map((t) => (
                <TableRow key={t._id}>
                  <TableCell className="font-mono text-xs">{t.ticketNumber}</TableCell>
                  <TableCell>{t.customerId?.fullName ?? '—'}</TableCell>
                  <TableCell className="font-mono text-xs">{orderRef(t.orderId)}</TableCell>
                  <TableCell>{orderAmount(t.orderId) != null ? formatCurrency(orderAmount(t.orderId)!) : '—'}</TableCell>
                  <TableCell><Badge variant="secondary">{t.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted">{formatDate(t.createdAt)}</TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => openDialog(t)}>Review</Button>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && !data?.tickets.length && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted">No open refund tickets</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!dialog} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund — {dialog?.ticketNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Refund amount (partial allowed)</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <Button className="w-full bg-brand" onClick={() => approveMut.mutate()} disabled={approveMut.isPending}>
              Approve refund
            </Button>
            <div>
              <Label>Rejection reason</Label>
              <Input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            </div>
            <Button className="w-full" variant="outline" onClick={() => rejectMut.mutate()} disabled={rejectMut.isPending}>
              Reject refund
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
