import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Image, ImageOff, Layers } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { StatCard, STATS_GRID_CLASS } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
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
import { createBanner, deleteBanner, fetchBanners, updateBanner } from '@/services/admin';

export function BannersPage() {
  const qc = useQueryClient();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    placement: 'HOME',
    priority: '0',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => fetchBanners(1),
  });

  const stats = useMemo(() => {
    const banners = data?.banners ?? [];
    const active = banners.filter((b) => b.isActive).length;
    const inactive = banners.length - active;
    return {
      total: data?.pagination.total ?? banners.length,
      active,
      inactive,
      placements: new Set(banners.map((b) => b.placement)).size,
    };
  }, [data]);

  const createMut = useMutation({
    mutationFn: () =>
      createBanner({
        title: form.title,
        imageUrl: form.imageUrl,
        linkUrl: form.linkUrl || undefined,
        placement: form.placement,
        priority: Number(form.priority),
        isActive: true,
      }),
    onSuccess: () => {
      toast.success('Banner created');
      setOpen(false);
      setForm({ title: '', imageUrl: '', linkUrl: '', placement: 'HOME', priority: '0' });
      qc.invalidateQueries({ queryKey: ['admin-banners'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateBanner(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-banners'] }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      toast.success('Banner deleted');
      qc.invalidateQueries({ queryKey: ['admin-banners'] });
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    createMut.mutate();
  };

  return (
    <PageShell
      eyebrow="Marketing"
      title="Banners"
      subtitle="Home screen and promotional banners for the customer app"
      action={
        <Button className="w-full sm:w-auto bg-brand" onClick={() => setOpen(true)}>
          New banner
        </Button>
      }
    >
      <div className={`mb-6 ${STATS_GRID_CLASS}`}>
        <StatCard
          label="Total banners"
          value={isLoading ? '…' : stats.total}
          hint="All placements"
          icon={Layers}
          accent="brand"
        />
        <StatCard
          label="Active"
          value={isLoading ? '…' : stats.active}
          hint="Visible in app"
          icon={Image}
          accent="success"
        />
        <StatCard
          label="Inactive"
          value={isLoading ? '…' : stats.inactive}
          hint="Hidden from app"
          icon={ImageOff}
          accent="warning"
        />
        <StatCard
          label="Placements"
          value={isLoading ? '…' : stats.placements}
          hint="Unique screen slots"
          icon={Layers}
        />
      </div>

      {isMobile ? (
        <div className="grid grid-cols-1 gap-3">
          {isLoading && (
            <div className="text-center py-8 text-muted bg-white border border-black/5 rounded-xl">
              Loading…
            </div>
          )}
          {data?.banners.map((b) => (
            <Card key={b._id} className="border-black/5 overflow-hidden shadow-sm bg-white">
              <CardContent className="p-0">
                {b.imageUrl ? (
                  <div className="aspect-[2.4/1] w-full overflow-hidden bg-zinc-100 border-b border-black/5">
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-ink text-sm truncate">{b.title}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{b.placement}</p>
                    </div>
                    <Badge variant={b.isActive ? 'default' : 'secondary'} className="shrink-0 text-[10px]">
                      {b.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-zinc-100 pt-2">
                    <span className="text-muted-foreground">
                      Priority <span className="font-bold text-ink">{b.priority}</span>
                    </span>
                    {b.linkUrl ? (
                      <a
                        href={b.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand font-semibold truncate max-w-[50%]"
                      >
                        Link
                      </a>
                    ) : (
                      <span className="text-muted-foreground">No link</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 min-w-[120px]"
                      onClick={() => toggleMut.mutate({ id: b._id, isActive: !b.isActive })}
                    >
                      {b.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 min-w-[120px] text-rose-600 border-rose-200 hover:bg-rose-50"
                      onClick={() => deleteMut.mutate(b._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {!isLoading && !data?.banners.length && (
            <div className="text-center py-8 text-muted bg-white border border-black/5 rounded-xl">
              No banners yet
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-black/5 bg-white overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Placement</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted">
                    Loading…
                  </TableCell>
                </TableRow>
              )}
              {data?.banners.map((b) => (
                <TableRow key={b._id}>
                  <TableCell>
                    {b.imageUrl ? (
                      <img
                        src={b.imageUrl}
                        alt={b.title}
                        className="h-12 w-24 rounded-md border border-black/10 object-cover bg-zinc-50"
                      />
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold">{b.title}</p>
                    <p className="text-xs text-muted truncate max-w-xs">{b.imageUrl}</p>
                  </TableCell>
                  <TableCell>{b.placement}</TableCell>
                  <TableCell>{b.priority}</TableCell>
                  <TableCell>
                    <Badge variant={b.isActive ? 'default' : 'secondary'}>
                      {b.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleMut.mutate({ id: b._id, isActive: !b.isActive })}
                    >
                      {b.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteMut.mutate(b._id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && !data?.banners.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted">
                    No banners yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create banner</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Link URL</Label>
              <Input
                value={form.linkUrl}
                onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
              />
            </div>
            <div>
              <Label>Placement</Label>
              <select
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={form.placement}
                onChange={(e) => setForm((f) => ({ ...f, placement: e.target.value }))}
              >
                <option value="HOME">Home</option>
                <option value="RESTAURANT">Restaurant</option>
                <option value="CHECKOUT">Checkout</option>
              </select>
            </div>
            <div>
              <Label>Priority</Label>
              <Input
                type="number"
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              />
            </div>
            <Button type="submit" className="w-full bg-brand" disabled={createMut.isPending}>
              Create
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
