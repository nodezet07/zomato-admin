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
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
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
          className="w-full sm:w-auto rounded-lg border border-black/10 px-3 py-2 text-sm"
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
      {isMobile ? (
        <div className="grid grid-cols-2 gap-3">
          {isLoading && (
            <div className="col-span-2 text-center py-8 text-muted bg-white border border-black/5 rounded-xl">Loading…</div>
          )}
          {data?.entries.map((e) => (
            <Card key={e._id} className="border-black/5 overflow-hidden shadow-sm bg-white">
              <CardContent className="p-3 space-y-2 flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-mono text-xs font-black text-brand bg-brand/5 px-1.5 py-0.5 rounded-md truncate">{e.entryNumber}</span>
                    <span className="text-[9px] uppercase font-bold text-zinc-500 bg-zinc-100 px-1 py-0.5 rounded shrink-0">{e.entryType.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 font-semibold">Flow: {e.debitAccount} → {e.creditAccount}</p>
                  <p className="text-xs text-ink font-semibold mt-1.5 line-clamp-1">{e.description}</p>
                </div>
                <div className="pt-2 border-t border-zinc-100 flex justify-between items-center text-[11px]">
                  <span className="text-muted-foreground font-semibold">{formatDate(e.recordedAt)}</span>
                  <span className="font-black text-brand">{formatCurrency(e.amount)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {!isLoading && !data?.entries.length && (
            <div className="col-span-2 text-center py-8 text-muted bg-white border border-black/5 rounded-xl">No ledger entries found.</div>
          )}
        </div>
      ) : (
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
