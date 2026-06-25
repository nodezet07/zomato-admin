import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
      action={<Button className="bg-brand" onClick={() => setOpen(true)}>New banner</Button>}
    >
      <div className="rounded-xl border border-black/5 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Placement</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted">Loading…</TableCell></TableRow>
            )}
            {data?.banners.map((b) => (
              <TableRow key={b._id}>
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
                  <Button size="sm" variant="outline" onClick={() => toggleMut.mutate({ id: b._id, isActive: !b.isActive })}>
                    {b.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteMut.mutate(b._id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && !data?.banners.length && (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted">No banners yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create banner</DialogTitle></DialogHeader>
          <form onSubmit={onSubmit} className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required /></div>
            <div><Label>Image URL</Label><Input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} required /></div>
            <div><Label>Link URL</Label><Input value={form.linkUrl} onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))} /></div>
            <div>
              <Label>Placement</Label>
              <select className="w-full rounded-lg border px-3 py-2 text-sm" value={form.placement} onChange={(e) => setForm((f) => ({ ...f, placement: e.target.value }))}>
                <option value="HOME">Home</option>
                <option value="RESTAURANT">Restaurant</option>
                <option value="CHECKOUT">Checkout</option>
              </select>
            </div>
            <Button type="submit" className="w-full bg-brand" disabled={createMut.isPending}>Create</Button>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
