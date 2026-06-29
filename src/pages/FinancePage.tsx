import { useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import { PageShell } from '@/components/layout/PageShell';
import { STATS_GRID_CLASS } from '@/components/dashboard/StatCard';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Badge } from '@/components/ui/badge';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Card, CardContent } from '@/components/ui/card';

import {

  Table,

  TableBody,

  TableCell,

  TableHead,

  TableHeader,

  TableRow,

} from '@/components/ui/table';

import {

  approveWithdrawal,

  createRestaurantSettlement,

  createRiderPayout,

  fetchFinanceSummary,

  fetchPendingRestaurantEarnings,

  fetchPendingRiderEarnings,

  fetchPayouts,

  fetchSettlements,

  fetchWithdrawals,

  markPayoutPaid,

  markSettlementPaid,

  rejectWithdrawal,

  markWithdrawalPaid,

  markWithdrawalFailed,

  downloadSettlementsCsv,

} from '@/services/admin';

import { formatCurrency, formatDate } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';



export function FinancePage() {

  const qc = useQueryClient();
  const isMobile = useIsMobile();

  const [refInput, setRefInput] = useState<Record<string, string>>({});



  const summaryQ = useQuery({ queryKey: ['admin-finance-summary'], queryFn: fetchFinanceSummary });

  const pendingRestQ = useQuery({ queryKey: ['admin-pending-restaurant'], queryFn: () => fetchPendingRestaurantEarnings(1) });

  const pendingRiderQ = useQuery({ queryKey: ['admin-pending-rider'], queryFn: () => fetchPendingRiderEarnings(1) });

  const settlementsQ = useQuery({ queryKey: ['admin-settlements'], queryFn: () => fetchSettlements(1) });

  const payoutsQ = useQuery({ queryKey: ['admin-payouts'], queryFn: () => fetchPayouts(1) });

  const withdrawalsQ = useQuery({ queryKey: ['admin-withdrawals'], queryFn: () => fetchWithdrawals(1) });



  const invalidateFinance = () => {

    qc.invalidateQueries({ queryKey: ['admin-finance-summary'] });

    qc.invalidateQueries({ queryKey: ['admin-settlements'] });

    qc.invalidateQueries({ queryKey: ['admin-payouts'] });

    qc.invalidateQueries({ queryKey: ['admin-pending-restaurant'] });

    qc.invalidateQueries({ queryKey: ['admin-pending-rider'] });

    qc.invalidateQueries({ queryKey: ['admin-withdrawals'] });

    qc.invalidateQueries({ queryKey: ['admin-ledger'] });

  };



  const createSettlementMut = useMutation({

    mutationFn: createRestaurantSettlement,

    onSuccess: () => { toast.success('Settlement batch created'); invalidateFinance(); },

    onError: (e: Error) => toast.error(e.message),

  });



  const createPayoutMut = useMutation({

    mutationFn: createRiderPayout,

    onSuccess: () => { toast.success('Rider payout batch created'); invalidateFinance(); },

    onError: (e: Error) => toast.error(e.message),

  });



  const markSettlementMut = useMutation({

    mutationFn: ({ id, ref }: { id: string; ref: string }) => markSettlementPaid(id, ref),

    onSuccess: () => { toast.success('Settlement marked paid'); invalidateFinance(); },

    onError: (e: Error) => toast.error(e.message),

  });



  const markPayoutMut = useMutation({

    mutationFn: ({ id, ref }: { id: string; ref: string }) => markPayoutPaid(id, ref),

    onSuccess: () => { toast.success('Payout marked paid'); invalidateFinance(); },

    onError: (e: Error) => toast.error(e.message),

  });



  const approveWithdrawalMut = useMutation({

    mutationFn: (id: string) => approveWithdrawal(id),

    onSuccess: () => { toast.success('Withdrawal approved'); invalidateFinance(); },

    onError: (e: Error) => toast.error(e.message),

  });



  const payWithdrawalMut = useMutation({

    mutationFn: ({ id, ref }: { id: string; ref: string }) => markWithdrawalPaid(id, ref),

    onSuccess: () => { toast.success('Withdrawal paid'); invalidateFinance(); },

    onError: (e: Error) => toast.error(e.message),

  });



  const rejectWithdrawalMut = useMutation({

    mutationFn: (id: string) => rejectWithdrawal(id, 'Rejected by admin'),

    onSuccess: () => { toast.success('Withdrawal rejected'); invalidateFinance(); },

    onError: (e: Error) => toast.error(e.message),

  });



  const failWithdrawalMut = useMutation({

    mutationFn: (id: string) => markWithdrawalFailed(id, 'Payment failed — retry later'),

    onSuccess: () => { toast.success('Withdrawal marked failed'); invalidateFinance(); },

    onError: (e: Error) => toast.error(e.message),

  });



  const s = summaryQ.data;

  const exportCsv = async () => {
    try {
      const blob = await downloadSettlementsCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `settlements-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Settlements exported');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed');
    }
  };

  return (

    <PageShell eyebrow="Finance" title="Settlements & Payouts" subtitle="Create batches, approve payouts, manage withdrawals" action={
      <Button variant="outline" size="sm" onClick={exportCsv}>Export CSV</Button>
    }>

      <div className={`mb-6 ${STATS_GRID_CLASS}`}>

        <Card className="border-black/5 bg-white shadow-sm p-0">

          <CardContent className="p-4">

            <p className="text-xs font-bold uppercase text-muted">Total GMV</p>

            <p className="text-xl font-black">{formatCurrency(s?.platform.totalGmv ?? 0)}</p>

          </CardContent>

        </Card>

        <Card className="border-black/5 bg-white shadow-sm p-0">

          <CardContent className="p-4">

            <p className="text-xs font-bold uppercase text-muted">Commission earned</p>

            <p className="text-xl font-black">{formatCurrency(s?.platform.totalCommission ?? 0)}</p>

          </CardContent>

        </Card>

        <Card className="border-black/5 bg-white shadow-sm p-0">

          <CardContent className="p-4">

            <p className="text-xs font-bold uppercase text-muted">Pending restaurant</p>

            <p className="text-xl font-black">{formatCurrency(s?.pendingRestaurantSettlement.netPayable ?? 0)}</p>

          </CardContent>

        </Card>

        <Card className="border-black/5 bg-white shadow-sm p-0">

          <CardContent className="p-4">

            <p className="text-xs font-bold uppercase text-muted">Pending rider</p>

            <p className="text-xl font-black">{formatCurrency(s?.pendingRiderPayout.grossEarnings ?? 0)}</p>

          </CardContent>

        </Card>

      </div>



      <Tabs defaultValue="pending" className="w-full">

        <TabsList className="grid grid-cols-2 gap-1 h-auto w-full bg-muted p-1 sm:flex sm:flex-wrap">

          <TabsTrigger value="pending" className="text-xs sm:flex-1 sm:min-w-[110px]">Create batches</TabsTrigger>

          <TabsTrigger value="settlements" className="text-xs sm:flex-1 sm:min-w-[110px]">Settlements</TabsTrigger>

          <TabsTrigger value="payouts" className="text-xs sm:flex-1 sm:min-w-[110px]">Rider payouts</TabsTrigger>

          <TabsTrigger value="withdrawals" className="text-xs sm:flex-1 sm:min-w-[110px]">Withdrawals</TabsTrigger>

        </TabsList>



        <TabsContent value="pending" className="mt-4 space-y-6">

          <div className="rounded-xl border border-black/5 bg-white overflow-hidden">

            <div className="border-b border-black/5 px-4 py-3">

              <h3 className="text-sm font-bold">Pending restaurant earnings</h3>

            </div>

            {isMobile ? (
              <div className="grid grid-cols-1 gap-3 p-4">
                {pendingRestQ.data?.restaurants.map((row) => (
                  <Card key={row.restaurantId} className="border-black/5 overflow-hidden shadow-sm bg-white">
                    <CardContent className="p-3 space-y-2 flex flex-col justify-between h-full">
                      <div>
                        <h4 className="font-bold text-ink text-xs line-clamp-1">{row.restaurantName ?? row.restaurantId}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Orders: {row.orderCount}</p>
                      </div>
                      <div className="pt-2 border-t border-zinc-100 flex justify-between items-center">
                        <span className="text-[11px] font-black text-brand">{formatCurrency(row.netPayable)}</span>
                        <Button size="sm" className="h-7 text-[10px] px-2 py-0" onClick={() => createSettlementMut.mutate(row.restaurantId)} disabled={createSettlementMut.isPending}>
                          Settlement
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {!pendingRestQ.data?.restaurants.length && (
                  <div className="col-span-2 text-center py-8 text-muted bg-white border border-black/5 rounded-xl">No pending restaurant earnings</div>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Net payable</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRestQ.data?.restaurants.map((row) => (
                    <TableRow key={row.restaurantId}>
                      <TableCell className="font-semibold">{row.restaurantName ?? row.restaurantId}</TableCell>
                      <TableCell>{row.orderCount}</TableCell>
                      <TableCell>{formatCurrency(row.netPayable)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => createSettlementMut.mutate(row.restaurantId)} disabled={createSettlementMut.isPending}>
                          Create settlement
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!pendingRestQ.data?.restaurants.length && (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted">No pending restaurant earnings</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}

          </div>



          <div className="rounded-xl border border-black/5 bg-white overflow-hidden">

            <div className="border-b border-black/5 px-4 py-3">

              <h3 className="text-sm font-bold">Pending rider earnings</h3>

            </div>

            {isMobile ? (
              <div className="grid grid-cols-1 gap-3 p-4">
                {pendingRiderQ.data?.riders.map((row) => (
                  <Card key={row.riderId} className="border-black/5 overflow-hidden shadow-sm bg-white">
                    <CardContent className="p-3 space-y-2 flex flex-col justify-between h-full">
                      <div>
                        <span className="font-mono text-xs font-black text-brand bg-brand/5 px-1.5 py-0.5 rounded-md truncate inline-block">{row.riderCode ?? row.riderId}</span>
                        <p className="text-[10px] text-muted-foreground mt-1.5">Deliveries: {row.deliveryCount}</p>
                      </div>
                      <div className="pt-2 border-t border-zinc-100 flex justify-between items-center">
                        <span className="text-[11px] font-black text-zinc-700">{formatCurrency(row.grossEarnings)}</span>
                        <Button size="sm" className="h-7 text-[10px] px-2 py-0" onClick={() => createPayoutMut.mutate(row.riderId)} disabled={createPayoutMut.isPending}>
                          Payout
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {!pendingRiderQ.data?.riders.length && (
                  <div className="col-span-2 text-center py-8 text-muted bg-white border border-black/5 rounded-xl">No pending rider earnings</div>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rider</TableHead>
                    <TableHead>Deliveries</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRiderQ.data?.riders.map((row) => (
                    <TableRow key={row.riderId}>
                      <TableCell className="font-mono">{row.riderCode ?? row.riderId}</TableCell>
                      <TableCell>{row.deliveryCount}</TableCell>
                      <TableCell>{formatCurrency(row.grossEarnings)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => createPayoutMut.mutate(row.riderId)} disabled={createPayoutMut.isPending}>
                          Create payout
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!pendingRiderQ.data?.riders.length && (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted">No pending rider earnings</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}

          </div>

        </TabsContent>



        <TabsContent value="settlements" className="mt-4">

          <div className="rounded-xl border border-black/5 bg-white overflow-hidden">

            {isMobile ? (
              <div className="grid grid-cols-1 gap-3 p-4">
                {settlementsQ.data?.settlements.map((row) => (
                  <Card key={row._id} className="border-black/5 overflow-hidden shadow-sm bg-white">
                    <CardContent className="p-3 space-y-2 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-mono text-[10px] text-zinc-500 truncate">{row.settlementNumber}</span>
                          <Badge className="text-[9px] px-1 py-0 shrink-0">{row.status}</Badge>
                        </div>
                        <h4 className="font-bold text-ink text-xs mt-1.5 line-clamp-1">{row.restaurantId?.restaurantName ?? '—'}</h4>
                        <p className="text-xs font-black text-brand mt-1">{formatCurrency(row.netPayable)}</p>
                      </div>
                      {row.status === 'PENDING' && (
                        <div className="pt-2 border-t border-zinc-100 space-y-1.5">
                          <Input className="h-7 text-xs w-full" placeholder="Ref" value={refInput[row._id] ?? ''} onChange={(e) => setRefInput((p) => ({ ...p, [row._id]: e.target.value }))} />
                          <Button size="sm" className="w-full h-7 text-[10px] py-0" onClick={() => markSettlementMut.mutate({ id: row._id, ref: refInput[row._id] ?? 'MANUAL' })}>Paid</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {!settlementsQ.data?.settlements.length && (
                  <div className="col-span-2 text-center py-8 text-muted bg-white border border-black/5 rounded-xl">No settlements found.</div>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Settlement</TableHead>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mark paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settlementsQ.data?.settlements.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell className="font-mono text-xs">{row.settlementNumber}</TableCell>
                      <TableCell>{row.restaurantId?.restaurantName ?? '—'}</TableCell>
                      <TableCell>{formatCurrency(row.netPayable)}</TableCell>
                      <TableCell><Badge>{row.status}</Badge></TableCell>
                      <TableCell>
                        {row.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <Input className="h-8 w-36" placeholder="Payment ref" value={refInput[row._id] ?? ''} onChange={(e) => setRefInput((p) => ({ ...p, [row._id]: e.target.value }))} />
                            <Button size="sm" onClick={() => markSettlementMut.mutate({ id: row._id, ref: refInput[row._id] ?? 'MANUAL' })}>Paid</Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

          </div>

        </TabsContent>



        <TabsContent value="payouts" className="mt-4">

          <div className="rounded-xl border border-black/5 bg-white overflow-hidden">

            {isMobile ? (
              <div className="grid grid-cols-1 gap-3 p-4">
                {payoutsQ.data?.payouts.map((row) => (
                  <Card key={row._id} className="border-black/5 overflow-hidden shadow-sm bg-white">
                    <CardContent className="p-3 space-y-2 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-mono text-[10px] text-zinc-500 truncate">{row.payoutNumber}</span>
                          <Badge className="text-[9px] px-1 py-0 shrink-0">{row.status}</Badge>
                        </div>
                        <h4 className="font-mono font-bold text-ink text-xs mt-1.5 truncate">Rider: {row.riderId?.riderCode ?? '—'}</h4>
                        <p className="text-xs font-black text-brand mt-1">{formatCurrency(row.netPayable)}</p>
                      </div>
                      {row.status === 'PENDING' && (
                        <div className="pt-2 border-t border-zinc-100">
                          <Button size="sm" className="w-full h-7 text-[10px] py-0" onClick={() => markPayoutMut.mutate({ id: row._id, ref: refInput[row._id] ?? 'MANUAL' })}>Mark paid</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {!payoutsQ.data?.payouts.length && (
                  <div className="col-span-2 text-center py-8 text-muted bg-white border border-black/5 rounded-xl">No payouts found.</div>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payout</TableHead>
                    <TableHead>Rider</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mark paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payoutsQ.data?.payouts.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell className="font-mono text-xs">{row.payoutNumber}</TableCell>
                      <TableCell>{row.riderId?.riderCode ?? '—'}</TableCell>
                      <TableCell>{formatCurrency(row.netPayable)}</TableCell>
                      <TableCell><Badge>{row.status}</Badge></TableCell>
                      <TableCell>
                        {row.status === 'PENDING' && (
                          <Button size="sm" onClick={() => markPayoutMut.mutate({ id: row._id, ref: refInput[row._id] ?? 'MANUAL' })}>Mark paid</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

          </div>

        </TabsContent>



        <TabsContent value="withdrawals" className="mt-4">

          <div className="rounded-xl border border-black/5 bg-white overflow-hidden">

            {isMobile ? (
              <div className="grid grid-cols-1 gap-3 p-4">
                {withdrawalsQ.data?.requests.map((row) => (
                  <Card key={row._id} className="border-black/5 overflow-hidden shadow-sm bg-white">
                    <CardContent className="p-3 space-y-2 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-mono text-[10px] text-zinc-500 truncate">{row.requestNumber}</span>
                          <Badge variant="secondary" className="text-[9px] px-1 py-0 shrink-0">{row.status}</Badge>
                        </div>
                        <h4 className="font-mono font-bold text-ink text-xs mt-1.5 truncate">Rider: {row.riderId?.riderCode ?? '—'}</h4>
                        <p className="text-xs font-black text-brand mt-1">{formatCurrency(row.amount)}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(row.createdAt)}</p>
                      </div>
                      {row.status === 'PENDING' && (
                        <div className="pt-2 border-t border-zinc-100 flex flex-col gap-1">
                          <Button size="sm" className="w-full h-7 text-[10px] py-0" onClick={() => approveWithdrawalMut.mutate(row._id)}>Approve</Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px] py-0" onClick={() => rejectWithdrawalMut.mutate(row._id)}>Reject</Button>
                        </div>
                      )}
                      {row.status === 'APPROVED' && (
                        <div className="pt-2 border-t border-zinc-100 space-y-1">
                          <Input className="h-7 text-xs w-full" placeholder="Ref" value={refInput[row._id] ?? ''} onChange={(e) => setRefInput((p) => ({ ...p, [row._id]: e.target.value }))} />
                          <Button size="sm" className="w-full h-7 text-[10px] py-0" onClick={() => payWithdrawalMut.mutate({ id: row._id, ref: refInput[row._id] ?? 'MANUAL' })}>Pay</Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px] py-0" onClick={() => failWithdrawalMut.mutate(row._id)}>Fail</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {!withdrawalsQ.data?.requests.length && (
                  <div className="col-span-2 text-center py-8 text-muted bg-white border border-black/5 rounded-xl">No withdrawals found.</div>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request</TableHead>
                    <TableHead>Rider</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawalsQ.data?.requests.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell className="font-mono text-xs">{row.requestNumber}</TableCell>
                      <TableCell>{row.riderId?.riderCode ?? '—'}</TableCell>
                      <TableCell>{formatCurrency(row.amount)}</TableCell>
                      <TableCell><Badge variant="secondary">{row.status}</Badge></TableCell>
                      <TableCell className="text-sm text-muted">{formatDate(row.createdAt)}</TableCell>
                      <TableCell className="space-x-2">
                        {row.status === 'PENDING' && (
                          <>
                            <Button size="sm" onClick={() => approveWithdrawalMut.mutate(row._id)}>Approve</Button>
                            <Button size="sm" variant="outline" onClick={() => rejectWithdrawalMut.mutate(row._id)}>Reject</Button>
                          </>
                        )}
                        {row.status === 'APPROVED' && (
                          <>
                            <Input className="h-8 w-28 inline" placeholder="Ref" value={refInput[row._id] ?? ''} onChange={(e) => setRefInput((p) => ({ ...p, [row._id]: e.target.value }))} />
                            <Button size="sm" onClick={() => payWithdrawalMut.mutate({ id: row._id, ref: refInput[row._id] ?? 'MANUAL' })}>Pay</Button>
                            <Button size="sm" variant="outline" onClick={() => failWithdrawalMut.mutate(row._id)}>Mark failed</Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!withdrawalsQ.data?.requests.length && (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted">No withdrawal requests</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}

          </div>

        </TabsContent>

      </Tabs>

    </PageShell>

  );

}


