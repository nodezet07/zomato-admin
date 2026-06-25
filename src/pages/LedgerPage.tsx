import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fetchLedger } from '@/services/admin';
import { formatCurrency, formatDate } from '@/lib/utils';

const ENTRY_TYPES = [
  '',
  'ORDER_PAYMENT',
  'COMMISSION',
  'RESTAURANT_SETTLEMENT',
  'RIDER_PAYOUT',
  'REFUND',
  'PLATFORM_FEE',
];

export function LedgerPage() {
  const [page, setPage] = useState(1);
  const [entryType, setEntryType] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['admin-ledger', page, entryType],
    queryFn: () => fetchLedger(page, entryType || undefined),
  });

  return (
    <PageShell
      eyebrow="Accounting"
      title="Finance Ledger"
      subtitle="Double-entry ledger for payments, commissions, settlements, and payouts"
      action={
        <select
          className="rounded-lg border border-black/10 px-3 py-2 text-sm"
          value={entryType}
          onChange={(e) => { setEntryType(e.target.value); setPage(1); }}
        >
          <option value="">All entry types</option>
          {ENTRY_TYPES.filter(Boolean).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      }
    >
      <div className="rounded-xl border border-black/5 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entry</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Debit → Credit</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted">Loading…</TableCell>
              </TableRow>
            )}
            {data?.entries.map((e) => (
              <TableRow key={e._id}>
                <TableCell className="font-mono text-xs">{e.entryNumber}</TableCell>
                <TableCell className="text-xs">{e.entryType}</TableCell>
                <TableCell className="text-xs">
                  {e.debitAccount} → {e.creditAccount}
                </TableCell>
                <TableCell>{formatCurrency(e.amount)}</TableCell>
                <TableCell className="max-w-xs truncate text-sm">{e.description}</TableCell>
                <TableCell className="text-sm text-muted">{formatDate(e.recordedAt)}</TableCell>
              </TableRow>
            ))}
            {!isLoading && !data?.entries.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted">
                  No ledger entries yet — entries are recorded on settlements and payouts
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
    </PageShell>
  );
}
