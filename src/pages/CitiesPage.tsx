import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CityRow } from '@/types/api';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { createCity, fetchCities, updateCity } from '@/services/admin';

export function CitiesPage() {
  const qc = useQueryClient();
  const [cityCode, setCityCode] = useState('');
  const [cityName, setCityName] = useState('');
  const [state, setState] = useState('');
  const [zoneDialog, setZoneDialog] = useState<CityRow | null>(null);
  const [zoneCode, setZoneCode] = useState('');
  const [zoneName, setZoneName] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-cities'],
    queryFn: () => fetchCities(1),
  });

  const createMut = useMutation({
    mutationFn: () => createCity({ cityCode, cityName, state: state || undefined }),
    onSuccess: () => {
      toast.success('City created');
      setCityCode('');
      setCityName('');
      setState('');
      qc.invalidateQueries({ queryKey: ['admin-cities'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateCity(id, { isActive }),
    onSuccess: () => {
      toast.success('City status updated');
      qc.invalidateQueries({ queryKey: ['admin-cities'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const zoneMut = useMutation({
    mutationFn: () => {
      const existing = zoneDialog!.zones ?? [];
      const zones = [
        ...existing,
        { zoneCode: zoneCode.toUpperCase(), zoneName, isActive: true },
      ];
      return updateCity(zoneDialog!._id, { zones });
    },
    onSuccess: () => {
      toast.success('Zone added');
      setZoneCode('');
      setZoneName('');
      qc.invalidateQueries({ queryKey: ['admin-cities'] });
      setZoneDialog(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createMut.mutate();
  };

  const handleZoneSubmit = (e: FormEvent) => {
    e.preventDefault();
    zoneMut.mutate();
  };

  return (
    <PageShell
      eyebrow="Multi-city"
      title="Cities & Zones"
      subtitle="Configure cities and delivery zones for multi-city operations"
      action={
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
          <Input placeholder="Code (MUM)" value={cityCode} onChange={(e) => setCityCode(e.target.value)} className="w-full sm:w-24" required />
          <Input placeholder="City name" value={cityName} onChange={(e) => setCityName(e.target.value)} className="w-full sm:w-40" required />
          <Input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} className="w-full sm:w-32" />
          <Button type="submit" className="w-full sm:w-auto bg-brand" disabled={createMut.isPending}>Add city</Button>
        </form>
      }
    >
      <div className="rounded-xl border border-black/5 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>City</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Zones</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted">Loading…</TableCell>
              </TableRow>
            )}
            {data?.cities.map((c) => (
              <TableRow key={c._id}>
                <TableCell className="font-mono font-bold">{c.cityCode}</TableCell>
                <TableCell>{c.cityName}</TableCell>
                <TableCell>{c.state ?? '—'}</TableCell>
                <TableCell>
                  {c.zones?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {c.zones.map((z) => (
                        <Badge key={z.zoneCode} variant="outline" className="text-xs">
                          {z.zoneName}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted text-sm">No zones</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={c.isActive ? 'default' : 'secondary'}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setZoneDialog(c)}>Add zone</Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleMut.mutate({ id: c._id, isActive: !c.isActive })}
                  >
                    {c.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!zoneDialog} onOpenChange={() => setZoneDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add zone — {zoneDialog?.cityName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleZoneSubmit} className="space-y-3">
            <div>
              <Label>Zone code</Label>
              <Input value={zoneCode} onChange={(e) => setZoneCode(e.target.value)} placeholder="NORTH" required />
            </div>
            <div>
              <Label>Zone name</Label>
              <Input value={zoneName} onChange={(e) => setZoneName(e.target.value)} placeholder="North Mumbai" required />
            </div>
            <Button type="submit" className="w-full bg-brand" disabled={zoneMut.isPending}>Add zone</Button>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
