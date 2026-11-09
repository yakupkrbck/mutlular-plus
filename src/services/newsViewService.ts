import { useEffect, useState } from 'react';
import { API_BASE } from '../config/api';

// ---------------------------------------------------------------------------
// Haber okunma sayısı. Sayaç Worker'da tutulur (`/api/news/view`), herkes (misafirler dahil) sayılır.
// Aynı cihaz aynı haberi 6 saat içinde bir kez sayar; Worker ayrıca IP başına aynı korumayı uygular.
// ---------------------------------------------------------------------------
const cache = new Map<string, number>();
const asked = new Set<string>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const SEEN_MS = 6 * 3600_000;

export const formatViews = (n: number): string => `${n.toLocaleString('tr-TR')} okunma`;

/** Sayıları toplu getirir (Worker 2 dk önbellekler). Sayısı olmayan haberler bir daha sorulmaz. */
export async function fetchViews(ids: string[]): Promise<void> {
  const need = [...new Set(ids)].filter((id) => id && !asked.has(id)).slice(0, 30);
  if (!need.length) return;
  need.forEach((id) => asked.add(id));
  try {
    const res = await fetch(`${API_BASE}/api/news/views?ids=${need.map(encodeURIComponent).join(',')}`);
    if (!res.ok) {
      need.forEach((id) => asked.delete(id));
      return;
    }
    const data = await res.json();
    for (const [id, v] of Object.entries(data?.views || {})) {
      const n = Number(v);
      if (n > 0) cache.set(id, n);
    }
    emit();
  } catch {
    need.forEach((id) => asked.delete(id));
  }
}

/** Haber açıldığında çağrılır: aynı cihazda 6 saat içinde tekrar saymaz. */
export async function recordView(id: string): Promise<void> {
  if (!id) return;
  const key = `mp_nv_${id}`;
  try {
    const last = Number(localStorage.getItem(key) || 0);
    if (last && Date.now() - last < SEEN_MS) return;
  } catch {
    /* depolama kapalıysa her açılış sayılır; Worker yine IP ile sınırlar */
  }
  try {
    const res = await fetch(`${API_BASE}/api/news/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
      keepalive: true,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success) return;
    try {
      localStorage.setItem(key, String(Date.now()));
    } catch {}
    if (data.views > 0) {
      cache.set(id, Number(data.views));
      emit();
    }
  } catch {
    /* çevrimdışı: bir sonraki açılışta yeniden denenir */
  }
}

/** Verilen haberlerin okunma sayıları (bilinmeyenler listede yoktur). */
export function useNewsViews(ids: string[]): Record<string, number> {
  const [, force] = useState(0);
  const key = ids.join(',');
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  useEffect(() => {
    if (key) fetchViews(key.split(','));
  }, [key]);
  const out: Record<string, number> = {};
  for (const id of ids) {
    const v = cache.get(id);
    if (v) out[id] = v;
  }
  return out;
}

/** Yalnızca testler için */
export const __resetNewsViews = () => {
  cache.clear();
  asked.clear();
};
