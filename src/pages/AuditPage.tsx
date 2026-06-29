import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fetchAuditLogs } from '@/services/admin';
import { formatDate } from '@/lib/utils';

export function AuditPage() {
  const [page, setPage] = useState(1);
  const [module, setModule] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit', page, module],
    queryFn: () => fetchAuditLogs(page, module || undefined),
  });

  return (
    <PageShell
      eyebrow="Compliance"
      title="Audit Log"
      subtitle="Admin actions across users, finance, refunds, and platform config"
      action={
        <select className="w-full sm:w-auto rounded-lg border border-black/10 px-3 py-2 text-sm" value={module} onChange={(e) => { setModule(e.target.value); setPage(1); }}>
          <option value="">All modules</option>
          <option value="user">User</option>
          <option value="restaurant">Restaurant</option>
          <option value="finance">Finance</option>
          <option value="refund">Refund</option>
          <option value="platform">Platform</option>
        </select>
      }
    >
      <div className="rounded-xl border border-black/5 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Entity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted">Loading…</TableCell></TableRow>
            )}
            {data?.logs.map((log) => (
              <TableRow key={log._id}>
                <TableCell className="text-sm text-muted">{formatDate(log.createdAt)}</TableCell>
                <TableCell><Badge variant="outline">{log.module}</Badge></TableCell>
                <TableCell className="font-mono text-xs">{log.action}</TableCell>
                <TableCell className="text-sm">{log.actorRole}</TableCell>
                <TableCell className="font-mono text-xs">{log.entityId?.slice(-8) ?? '—'}</TableCell>
              </TableRow>
            ))}
            {!isLoading && !data?.logs.length && (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted">No audit entries yet</TableCell></TableRow>
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
    </PageShell>
  );
}
