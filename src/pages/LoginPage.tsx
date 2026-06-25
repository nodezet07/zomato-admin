import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Loader2, ShieldCheck } from 'lucide-react';
import { adminLogin } from '@/services/admin';
import { useAuthStore } from '@/stores/authStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('admin@foodapp.com');
  const [password, setPassword] = useState('Admin@123');
  const [errorMsg, setErrorMsg] = useState('');

  const login = useMutation({
    mutationFn: () => adminLogin(email.trim(), password),
    onSuccess: (data) => {
      setAuth(data.admin, data.accessToken, data.refreshToken);
      navigate('/', { replace: true });
    },
    onError: (err: Error) => setErrorMsg(err.message),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    login.mutate();
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-brand to-brand-dark p-10 text-white">
        <div>
          <p className="text-xs font-black uppercase tracking-widest opacity-80">QuickBite</p>
          <h1 className="mt-4 text-4xl font-black leading-tight">Platform Admin</h1>
          <p className="mt-4 max-w-md text-sm opacity-90 leading-relaxed">
            Manage restaurants, riders, settlements, refunds, and platform configuration from one
            dashboard.
          </p>
        </div>
        <p className="text-xs opacity-70">Finance · Settlements · Compliance</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-ink">Admin Login</h1>
              <p className="text-xs text-muted">QuickBite platform control</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@foodapp.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {errorMsg && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errorMsg}
            </p>
          )}

          <Button type="submit" className="w-full bg-brand hover:bg-brand-dark" disabled={login.isPending}>
            {login.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Sign in'}
          </Button>

          <p className="text-center text-[11px] text-muted">
            Default: admin@foodapp.com / Admin@123 (run npm run seed:admin)
          </p>
        </form>
      </div>
    </div>
  );
}
