import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Eye, ExternalLink } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

function statusVariant(status: string) {
  if (status === 'approved') return 'default' as const;
  if (status === 'rejected') return 'destructive' as const;
  return 'secondary' as const;
}

function DocPreview({ label, url }: { label: string; url?: string }) {
  if (!url) {
    return (
      <div className="rounded-lg border border-dashed border-black/10 bg-zinc-50 p-4 text-center text-xs text-muted">
        {label} — not uploaded
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
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
          className="max-h-48 w-full rounded-lg border border-black/10 object-contain bg-zinc-50"
        />
      </a>
    </div>
  );
}

export function RidersPage() {
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const status = searchParams.get('status') ?? 'pending';
  const [reviewRider, setReviewRider] = useState<RiderRow | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RiderRow | null>(null);
  const [rejectReason, setRejectReason] = useState('');

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
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function onStatusChange(next: string) {
    setPage(1);
    if (next) setSearchParams({ status: next });
    else setSearchParams({});
  }

  return (
    <PageShell
      eyebrow="Delivery fleet"
      title="Riders"
      subtitle="Review KYC documents, bank details, and approve or reject rider applications"
      action={
        <select
          className="rounded-lg border border-black/10 px-3 py-2 text-sm"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending approval</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      }
    >
      <div className="rounded-xl border border-black/5 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Rider</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deliveries</TableHead>
              <TableHead>Earnings</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !data?.riders.length && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted">
                  No riders found for this filter.
                </TableCell>
              </TableRow>
            )}
            {data?.riders.map((r) => (
              <TableRow key={r._id}>
                <TableCell className="font-mono text-sm">{r.riderCode}</TableCell>
                <TableCell>
                  <p className="font-semibold">{r.userId?.fullName ?? '—'}</p>
                  <p className="text-xs text-muted">{r.userId?.mobile ?? r.userId?.email}</p>
                </TableCell>
                <TableCell className="text-sm">
                  <p className="capitalize">{r.vehicleType?.toLowerCase() ?? '—'}</p>
                  <p className="text-xs text-muted">{r.vehicleNumber ?? '—'}</p>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(r.verificationStatus)}>
                    {r.verificationStatus}
                  </Badge>
                </TableCell>
                <TableCell>{r.totalDeliveries}</TableCell>
                <TableCell>{formatCurrency(r.totalEarnings)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setReviewRider(r)}>
                    <Eye className="size-3.5 mr-1" />
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
          <span className="text-sm text-muted">
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rider verification — {reviewRider?.userId?.fullName}</DialogTitle>
            <DialogDescription>
              {reviewRider?.riderCode} · {reviewRider?.userId?.mobile}
            </DialogDescription>
          </DialogHeader>
          {reviewRider && (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-xs font-bold uppercase text-muted">Vehicle</p>
                  <p className="font-semibold capitalize">
                    {reviewRider.vehicleType?.toLowerCase() ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-muted">Vehicle number</p>
                  <p className="font-semibold">{reviewRider.vehicleNumber ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-muted">Status</p>
                  <Badge variant={statusVariant(reviewRider.verificationStatus)}>
                    {reviewRider.verificationStatus}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <DocPreview label="Profile photo" url={reviewRider.profileImage} />
                <DocPreview label="Driving license" url={reviewRider.drivingLicense} />
                <DocPreview label="Aadhaar card" url={reviewRider.aadhaarCard} />
              </div>

              <div className="rounded-xl border border-black/5 bg-zinc-50 p-4 space-y-2 text-sm">
                <p className="text-xs font-bold uppercase text-muted">Bank account</p>
                <p>
                  <span className="text-muted">Holder: </span>
                  {reviewRider.bankAccountDetails?.accountHolderName ?? '—'}
                </p>
                <p>
                  <span className="text-muted">Account: </span>
                  {reviewRider.bankAccountDetails?.accountNumber ?? '—'}
                </p>
                <p>
                  <span className="text-muted">IFSC: </span>
                  {reviewRider.bankAccountDetails?.ifscCode ?? '—'}
                </p>
                {reviewRider.bankAccountDetails?.bankName && (
                  <p>
                    <span className="text-muted">Bank: </span>
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
              {rejectTarget?.userId?.fullName} ({rejectTarget?.riderCode}) will not be able to log
              in until they re-register.
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
