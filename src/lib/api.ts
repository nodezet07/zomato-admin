import { API_URL } from '@/config/env';
import { useAuthStore } from '@/stores/authStore';

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ApiError = Error & { status?: number; data?: unknown };

export async function apiFetch<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  const headers = new Headers(init?.headers ?? {});
  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = useAuthStore.getState().accessToken;
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err = new Error(
      (data as { message?: string })?.message ?? `Request failed: ${res.status}`,
    ) as ApiError;
    err.status = res.status;
    err.data = data;
    if (res.status === 401) useAuthStore.getState().logout();
    throw err;
  }

  return data as T;
}

export function unwrap<T>(res: ApiResponse<T>): T {
  return res.data;
}
