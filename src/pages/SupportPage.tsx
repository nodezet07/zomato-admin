import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import {
  fetchSupportTicket,
  fetchSupportTickets,
  replySupportTicket,
  updateSupportTicket,
} from '@/services/admin';
import { formatDate } from '@/lib/utils';

export function SupportPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-support', page, status],
    queryFn: () => fetchSupportTickets(page, status || undefined),
  });

  const detailQ = useQuery({
    queryKey: ['admin-support-ticket', selectedId],
    queryFn: () => fetchSupportTicket(selectedId!),
    enabled: !!selectedId,
  });

  const ticket = detailQ.data;

  const replyMut = useMutation({
    mutationFn: () => replySupportTicket(selectedId!, reply.trim()),
    onSuccess: () => {
      toast.success('Reply sent');
      setReply('');
      qc.invalidateQueries({ queryKey: ['admin-support-ticket', selectedId] });
      qc.invalidateQueries({ queryKey: ['admin-support'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resolveMut = useMutation({
    mutationFn: () =>
      updateSupportTicket(selectedId!, {
        status: 'RESOLVED',
        resolution: 'Resolved by admin',
      }),
    onSuccess: () => {
      toast.success('Ticket resolved');
      setSelectedId(null);
      qc.invalidateQueries({ queryKey: ['admin-support'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleReply = (e: FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    replyMut.mutate();
  };

  return (
    <PageShell
      eyebrow="Support"
      title="Support & Disputes"
      subtitle="View tickets, reply, and resolve issues"
      action={
        <select
          className="rounded-lg border border-black/10 px-3 py-2 text-sm"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      }
    >
      <div className="rounded-xl border border-black/5 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted">Loading…</TableCell></TableRow>
            )}
            {data?.tickets.map((t) => (
              <TableRow key={t._id}>
                <TableCell className="font-mono text-xs">{t.ticketNumber}</TableCell>
                <TableCell><Badge variant="secondary">{t.issueType}</Badge></TableCell>
                <TableCell>{t.customerId?.fullName ?? '—'}</TableCell>
                <TableCell className="max-w-xs truncate">{t.description}</TableCell>
                <TableCell>{t.status}</TableCell>
                <TableCell className="text-sm text-muted">{formatDate(t.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => setSelectedId(t._id)}>View</Button>
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

      <Dialog open={!!selectedId} onOpenChange={() => setSelectedId(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ticket {ticket?.ticketNumber ?? '…'}</DialogTitle>
          </DialogHeader>
          {detailQ.isLoading && <p className="text-sm text-muted">Loading…</p>}
          {ticket && (
            <div className="space-y-4">
              <div className="rounded-lg bg-surface p-3 text-sm">
                <p><span className="font-bold">Status:</span> {ticket.status}</p>
                <p><span className="font-bold">Type:</span> {ticket.issueType}</p>
                <p className="mt-2">{ticket.description}</p>
              </div>

              {ticket.replies && ticket.replies.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase text-muted">Replies</p>
                  {ticket.replies.map((r, i) => (
                    <div key={r._id ?? i} className="rounded-lg border border-black/5 p-2 text-sm">
                      <p className="text-[10px] font-bold uppercase text-muted">{r.authorRole}</p>
                      <p>{r.message}</p>
                      <p className="text-xs text-muted mt-1">{formatDate(r.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}

              {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                <>
                  <form onSubmit={handleReply} className="space-y-2">
                    <Textarea
                      placeholder="Write a reply to the customer…"
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      rows={3}
                    />
                    <Button type="submit" size="sm" disabled={replyMut.isPending}>Send reply</Button>
                  </form>
                  <Button
                    className="w-full bg-brand"
                    onClick={() => resolveMut.mutate()}
                    disabled={resolveMut.isPending}
                  >
                    Mark resolved
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
