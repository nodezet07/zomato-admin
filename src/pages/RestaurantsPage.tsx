import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
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
  createRestaurant,
  fetchRestaurants,
  rejectRestaurant,
  updateRestaurantCommission,
} from '@/services/admin';

const DEFAULT_LAT = 19.076;
const DEFAULT_LNG = 72.8777;

export function RestaurantsPage() {
  const qc = useQueryClient();
  const isMobile = useIsMobile();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerFullName, setOwnerFullName] = useState('');
  const [ownerMobile, setOwnerMobile] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantPhone, setRestaurantPhone] = useState('');
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState(String(DEFAULT_LAT));
  const [longitude, setLongitude] = useState(String(DEFAULT_LNG));
  const [autoApprove, setAutoApprove] = useState(true);
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

  const createMut = useMutation({
    mutationFn: () =>
      createRestaurant({
        ownerEmail: ownerEmail.trim(),
        ownerFullName: ownerFullName.trim(),
        ownerMobile: ownerMobile.trim() || undefined,
        restaurantName: restaurantName.trim(),
        phone: restaurantPhone.trim() || undefined,
        latitude: Number(latitude),
        longitude: Number(longitude),
        autoApprove,
        address: city.trim() ? { city: city.trim() } : undefined,
      }),
    onSuccess: () => {
      toast.success('Restaurant created');
      setCreateOpen(false);
      setOwnerEmail('');
      setOwnerFullName('');
      setOwnerMobile('');
      setRestaurantName('');
      setRestaurantPhone('');
      setCity('');
      setLatitude(String(DEFAULT_LAT));
      setLongitude(String(DEFAULT_LNG));
      setAutoApprove(true);
      qc.invalidateQueries({ queryKey: ['admin-restaurants'] });
    },
    onError: (e: Error) => {
      toast.error(e.message || 'Failed to create restaurant');
    },
  });

  function handleCreateSubmit(e: FormEvent) {
    e.preventDefault();
    createMut.mutate();
  }

  return (
    <PageShell
      eyebrow="Partners"
      title="Restaurants"
      subtitle="Approve partners, create restaurants, and configure commission"
      action={
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select
            className="w-full sm:w-auto rounded-lg border border-black/10 px-3 py-2 text-sm"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button className="bg-brand" onClick={() => setCreateOpen(true)}>
            Create restaurant
          </Button>
        </div>
      }
    >
      {isMobile ? (
        <div className="grid grid-cols-2 gap-3">
          {isLoading && (
            <div className="col-span-2 text-center text-muted py-8 bg-white border border-black/5 rounded-xl">Loading…</div>
          )}
          {data?.restaurants.map((r) => (
            <Card key={r._id} className="border-black/5 overflow-hidden shadow-sm bg-white">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-ink text-sm">{r.restaurantName}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Owner: {r.ownerId?.fullName ?? '—'}</p>
                    <p className="text-[11px] text-muted-foreground">{r.ownerId?.email}</p>
                  </div>
                  <Badge variant={r.restaurantStatus === 'approved' ? 'default' : 'secondary'}>
                    {r.restaurantStatus}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-zinc-100">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Commission</p>
                    <p className="font-semibold text-zinc-700">{r.platformCommissionPercentage ?? 15}%</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Settlement</p>
                    <p className="font-semibold text-zinc-700">{r.settlementCycle ?? 'WEEKLY'}</p>
                  </div>
                </div>
                <div className="pt-2 flex justify-end gap-2">
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
                </div>
              </CardContent>
            </Card>
          ))}
          {!isLoading && !data?.restaurants.length && (
            <div className="col-span-2 text-center py-8 text-muted bg-white border border-black/5 rounded-xl">No restaurants found.</div>
          )}
        </div>
      ) : (
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
      )}

      {data && data.pagination.totalPages > 1 && (
        <div className="mt-4 flex gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <Button variant="outline" disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create restaurant</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Owner</p>
              <div className="space-y-2">
                <Label htmlFor="ownerEmail">Owner email</Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  required
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="owner@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerFullName">Owner full name</Label>
                <Input
                  id="ownerFullName"
                  required
                  value={ownerFullName}
                  onChange={(e) => setOwnerFullName(e.target.value)}
                  placeholder="Restaurant owner name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerMobile">Owner mobile (optional)</Label>
                <Input
                  id="ownerMobile"
                  value={ownerMobile}
                  onChange={(e) => setOwnerMobile(e.target.value)}
                  placeholder="10-digit mobile"
                  maxLength={10}
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Restaurant</p>
              <div className="space-y-2">
                <Label htmlFor="restaurantName">Restaurant name</Label>
                <Input
                  id="restaurantName"
                  required
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="e.g. Spice Garden"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="restaurantPhone">Restaurant phone (optional)</Label>
                <Input
                  id="restaurantPhone"
                  value={restaurantPhone}
                  onChange={(e) => setRestaurantPhone(e.target.value)}
                  placeholder="10-digit phone"
                  maxLength={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Mumbai"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
              />
              Approve immediately (owner can log in and go live)
            </label>

            <Button
              type="submit"
              className="w-full bg-brand"
              disabled={createMut.isPending}
            >
              {createMut.isPending ? 'Creating…' : 'Create restaurant'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

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
