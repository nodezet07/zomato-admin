import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { blockUser, fetchUsers, unblockUser } from '@/services/admin';
import { formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

export function UsersPage() {
  const qc = useQueryClient();
  const isMobile = useIsMobile();
  const [page, setPage] = useState(1);
  const [role, setRole] = useState('');
  const [accountStatus, setAccountStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, role, accountStatus],
    queryFn: () => fetchUsers(page, role || undefined, accountStatus || undefined),
  });

  const blockMut = useMutation({
    mutationFn: blockUser,
    onSuccess: () => {
      toast.success('User blocked');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const unblockMut = useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      toast.success('User unblocked');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <PageShell
      eyebrow="Accounts"
      title="Users"
      subtitle="Manage customers, restaurant owners, and riders"
      action={
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select
            className="w-full sm:w-auto rounded-lg border border-black/10 px-3 py-2 text-sm"
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
          >
            <option value="">All roles</option>
            <option value="customer">Customer</option>
            <option value="restaurant_owner">Restaurant owner</option>
            <option value="rider">Rider</option>
          </select>
          <select
            className="w-full sm:w-auto rounded-lg border border-black/10 px-3 py-2 text-sm"
            value={accountStatus}
            onChange={(e) => { setAccountStatus(e.target.value); setPage(1); }}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      }
    >
      {isMobile ? (
        <div className="grid grid-cols-2 gap-3">
          {isLoading && (
            <div className="col-span-2 text-center py-8 text-muted bg-white border border-black/5 rounded-xl">Loading…</div>
          )}
          {data?.users.map((u) => (
            <Card key={u._id} className="border-black/5 overflow-hidden shadow-sm bg-white">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-ink text-sm">{u.fullName ?? '—'}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{u.email ?? u.mobile ?? '—'}</p>
                  </div>
                  <Badge variant={u.accountStatus === 'active' ? 'default' : 'destructive'}>
                    {u.accountStatus}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-zinc-100">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Role</p>
                    <Badge variant="secondary" className="capitalize">{u.role.replace(/_/g, ' ')}</Badge>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Joined</p>
                    <p className="font-semibold text-zinc-700">{formatDate(u.createdAt)}</p>
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  {u.accountStatus === 'blocked' ? (
                    <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => unblockMut.mutate(u._id)}>Unblock</Button>
                  ) : (
                    <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => blockMut.mutate(u._id)}>Block</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {!isLoading && !data?.users.length && (
            <div className="col-span-2 text-center py-8 text-muted bg-white border border-black/5 rounded-xl">No users found.</div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-black/5 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email / Mobile</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted">Loading…</TableCell>
                </TableRow>
              )}
              {data?.users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell className="font-semibold">{u.fullName ?? '—'}</TableCell>
                  <TableCell className="text-sm text-muted">
                    {u.email ?? u.mobile ?? '—'}
                  </TableCell>
                  <TableCell><Badge variant="secondary">{u.role}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={u.accountStatus === 'active' ? 'default' : 'destructive'}>
                      {u.accountStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted">{formatDate(u.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {u.accountStatus === 'blocked' ? (
                      <Button size="sm" variant="outline" onClick={() => unblockMut.mutate(u._id)}>Unblock</Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => blockMut.mutate(u._id)}>Block</Button>
                    )}
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
    </PageShell>
  );
}
