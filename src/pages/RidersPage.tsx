import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bike, CheckCircle2, Clock, Eye, ExternalLink, XCircle } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { StatCard } from '@/components/dashboard/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FilterPills } from '@/components/ui/filter-pills';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { approveRider, fetchRiders, rejectRider } from '@/services/admin';
import { formatCurrency } from '@/lib/utils';
import type { RiderRow } from '@/types/api';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
] as const;

function statusVariant(status: string) {
  if (status === 'approved') return 'default' as const;
  if (status === 'rejected') return 'destructive' as const;
  return 'secondary' as const;
}

function DocPreview({ label, url }: { label: string; url?: string }) {
  if (!url) {
    return (
      <div className="rounded-lg border border-dashed border-black/10 bg-zinc-50 p-4 text-center text-xs text-muted-foreground">
        {label} — not uploaded
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
        >
          Open <ExternalLink className="size-3" />
        </a>
      </div>
      <a href={url} target="_blank" rel="noreferrer" className="block">
        <img
          src={url}
          alt={label}
          className="max-h-48 w-full rounded-lg border border-black/10 bg-zinc-50 object-contain"
        />
      </a>
    </div>
  );
}

function useRiderStatusCounts() {
  const results = useQueries({
    queries: STATUS_FILTERS.filter((f) => f.value !== '').map((f) => ({
      queryKey: ['admin-riders-count', f.value],
      queryFn: () => fetchRiders(1, f.value),
      staleTime: 60_000,
    })),
  });

  const allQ = useQuery({
    queryKey: ['admin-riders-count', 'all'],
    queryFn: () => fetchRiders(1),
    staleTime: 60_000,
  });

  return {
    all: allQ.data?.pagination.total ?? 0,
    pending: results[0]?.data?.pagination.total ?? 0,
    approved: results[1]?.data?.pagination.total ?? 0,
    rejected: results[2]?.data?.pagination.total ?? 0,
    loading: allQ.isLoading || results.some((r) => r.isLoading),
  };
}

export function RidersPage() {
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const status = searchParams.has('status') ? (searchParams.get('status') ?? '') : 'pending';
  const [reviewRider, setReviewRider] = useState<RiderRow | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RiderRow | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const counts = useRiderStatusCounts();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-riders', page, status],
    queryFn: () => fetchRiders(page, status || undefined),
  });

  const approveMut = useMutation({
    mutationFn: approveRider,
    onSuccess: () => {
      toast.success('Rider approved — they can now log in');
      setReviewRider(null);
      qc.invalidateQueries({ queryKey: ['admin-riders'] });
      qc.invalidateQueries({ queryKey: ['admin-riders-count'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectRider(id, reason),
    onSuccess: () => {
      toast.success('Rider rejected');
      setRejectTarget(null);
      setRejectReason('');
      setReviewRider(null);
      qc.invalidateQueries({ queryKey: ['admin-riders'] });
      qc.invalidateQueries({ queryKey: ['admin-riders-count'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function onStatusChange(next: string) {
    setPage(1);
    setSearchParams({ status: next });
  }

  const filterOptions = STATUS_FILTERS.map((f) => ({
    ...f,
    count:
      f.value === ''
        ? counts.all
        : f.value === 'pending'
          ? counts.pending
          : f.value === 'approved'
            ? counts.approved
            : counts.rejected,
  }));

  return (
    <PageShell
      eyebrow="Delivery fleet"
      title="Riders"
      subtitle="Review KYC documents, bank details, and approve or reject rider applications"
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total riders"
          value={counts.loading ? '…' : counts.all}
          hint="Registered on platform"
          icon={Bike}
          accent="brand"
          onClick={() => onStatusChange('')}
        />
        <StatCard
          label="Pending approval"
          value={counts.loading ? '…' : counts.pending}
          hint="Awaiting KYC review"
          icon={Clock}
          accent="warning"
          onClick={() => onStatusChange('pending')}
        />
        <StatCard
          label="Approved"
          value={counts.loading ? '…' : counts.approved}
          hint="Can go online & deliver"
          icon={CheckCircle2}
          accent="success"
          onClick={() => onStatusChange('approved')}
        />
        <StatCard
          label="Rejected"
          value={counts.loading ? '…' : counts.rejected}
          hint="Needs re-application"
          icon={XCircle}
          accent="danger"
          onClick={() => onStatusChange('rejected')}
        />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterPills options={filterOptions} value={status} onChange={onStatusChange} />
        <p className="text-xs font-semibold text-muted-foreground">
          Showing {data?.riders.length ?? 0} of {data?.pagination.total ?? 0} riders
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/80 hover:bg-zinc-50/80">
              <TableHead className="font-bold">Code</TableHead>
              <TableHead className="font-bold">Rider</TableHead>
              <TableHead className="font-bold">Vehicle</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold">Deliveries</TableHead>
              <TableHead className="font-bold">Earnings</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  Loading riders…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !data?.riders.length && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  No riders found for this filter.
                </TableCell>
              </TableRow>
            )}
            {data?.riders.map((r) => (
              <TableRow key={r._id} className="hover:bg-zinc-50/50">
                <TableCell className="font-mono text-sm font-semibold">{r.riderCode}</TableCell>
                <TableCell>
                  <p className="font-semibold text-ink">{r.userId?.fullName ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{r.userId?.mobile ?? r.userId?.email}</p>
                </TableCell>
                <TableCell className="text-sm">
                  <p className="font-medium capitalize">{r.vehicleType?.toLowerCase() ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{r.vehicleNumber ?? '—'}</p>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(r.verificationStatus)} className="capitalize">
                    {r.verificationStatus}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold">{r.totalDeliveries}</TableCell>
                <TableCell className="font-semibold">{formatCurrency(r.totalEarnings)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setReviewRider(r)}>
                      <Eye className="mr-1 size-3.5" />
                      Review
                    </Button>
                    {r.verificationStatus === 'pending' && (
                      <>
                        <Button size="sm" onClick={() => approveMut.mutate(r._id)}>
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRejectTarget(r);
                            setRejectReason('');
                          }}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data && data.pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center gap-3">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= data.pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <Dialog open={!!reviewRider} onOpenChange={() => setReviewRider(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rider verification — {reviewRider?.userId?.fullName}</DialogTitle>
            <DialogDescription>
              {reviewRider?.riderCode} · {reviewRider?.userId?.mobile}
            </DialogDescription>
          </DialogHeader>
          {reviewRider && (
            <div className="space-y-5">
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground">Vehicle</p>
                  <p className="font-semibold capitalize">
                    {reviewRider.vehicleType?.toLowerCase() ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground">Vehicle number</p>
                  <p className="font-semibold">{reviewRider.vehicleNumber ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground">Status</p>
                  <Badge variant={statusVariant(reviewRider.verificationStatus)} className="mt-1 capitalize">
                    {reviewRider.verificationStatus}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <DocPreview label="Profile photo" url={reviewRider.profileImage} />
                <DocPreview label="Driving license" url={reviewRider.drivingLicense} />
                <DocPreview label="Aadhaar card" url={reviewRider.aadhaarCard} />
              </div>

              <div className="space-y-2 rounded-xl border border-black/5 bg-zinc-50 p-4 text-sm">
                <p className="text-xs font-bold uppercase text-muted-foreground">Bank account</p>
                <p>
                  <span className="text-muted-foreground">Holder: </span>
                  {reviewRider.bankAccountDetails?.accountHolderName ?? '—'}
                </p>
                <p>
                  <span className="text-muted-foreground">Account: </span>
                  {reviewRider.bankAccountDetails?.accountNumber ?? '—'}
                </p>
                <p>
                  <span className="text-muted-foreground">IFSC: </span>
                  {reviewRider.bankAccountDetails?.ifscCode ?? '—'}
                </p>
                {reviewRider.bankAccountDetails?.bankName && (
                  <p>
                    <span className="text-muted-foreground">Bank: </span>
                    {reviewRider.bankAccountDetails.bankName}
                  </p>
                )}
              </div>

              {reviewRider.verificationStatus === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => approveMut.mutate(reviewRider._id)}
                    disabled={approveMut.isPending}
                  >
                    Approve rider
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setRejectTarget(reviewRider);
                      setRejectReason('');
                    }}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectTarget} onOpenChange={() => setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject rider</DialogTitle>
            <DialogDescription>
              {rejectTarget?.userId?.fullName} ({rejectTarget?.riderCode}) will not be able to log in
              until they re-register.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Reason (optional)</Label>
              <Textarea
                id="reject-reason"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Blurry license photo, invalid bank details…"
              />
            </div>
            <Button
              variant="destructive"
              className="w-full"
              disabled={rejectMut.isPending}
              onClick={() =>
                rejectTarget &&
                rejectMut.mutate({
                  id: rejectTarget._id,
                  reason: rejectReason.trim() || 'Rejected by admin',
                })
              }
            >
              Confirm rejection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
