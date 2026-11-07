import { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { API_BASE } from '../config/api';
import type { PollItem } from '../types';

export const MIN_POLL_OPTIONS = 2;
export const MAX_POLL_OPTIONS = 6;

/** Anket oy almaya açık mı? (yönetici kapatmadıysa ve süresi dolmadıysa) */
export const isPollOpen = (p: PollItem, now = Date.now()): boolean =>
  p.status === 'active' && (!p.endsAtMs || p.endsAtMs > now);

export interface PollResultRow {
  id: string;
  text: string;
  count: number;
  percent: number;
}

/** Seçenek başına oy ve yüzde (yüzde, oy kullanan kişi sayısına göre). */
export const pollResults = (p: PollItem): PollResultRow[] => {
  const total = Math.max(0, p.totalVotes || 0);
  return p.options.map((o) => {
    const count = Math.max(0, p.counts?.[o.id] || 0);
    return { id: o.id, text: o.text, count, percent: total ? Math.min(100, Math.round((count / total) * 100)) : 0 };
  });
};

const pad = (n: number) => String(n).padStart(2, '0');
export const formatPollEnd = (ms: number): string => {
  const d = new Date(ms);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** "2 gün kaldı", "3 saat kaldı", "12 dk kaldı" */
export const timeLeftText = (endsAtMs: number, now = Date.now()): string => {
  const diff = endsAtMs - now;
  if (diff <= 0) return 'Süre doldu';
  const min = Math.ceil(diff / 60000);
  if (min < 60) return `${min} dk kaldı`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} saat kaldı`;
  return `${Math.floor(hours / 24)} gün kaldı`;
};

const normalize = (raw: any): PollItem => {
  const options = Array.isArray(raw.options) ? raw.options : [];
  return {
    ...raw,
    options,
    optionIds: Array.isArray(raw.optionIds) ? raw.optionIds : options.map((o: any) => o.id),
    counts: raw.counts || {},
    totalVotes: Number(raw.totalVotes) || 0,
    allowMultiple: !!raw.allowMultiple,
    createdAtMs: Number(raw.createdAtMs) || 0,
  } as PollItem;
};

/** Anketleri canlı izler (herkes okuyabilir). */
export function usePolls(): PollItem[] {
  const [polls, setPolls] = useState<PollItem[]>([]);
  useEffect(() => {
    const q = query(collection(db, 'plus_anketler'), orderBy('createdAtMs', 'desc'), limit(40));
    return onSnapshot(
      q,
      (snap) => setPolls(snap.docs.map((d) => normalize({ ...(d.data() as any), id: d.id }))),
      (err) => console.warn('[anket] okunamadı', (err as any)?.code || err)
    );
  }, []);
  return polls;
}

/** Giriş yapan kişinin oy verdiği anketler: { anketId: [seçenekId, ...] } */
export function useMyVotes(uid?: string): Record<string, string[]> {
  const [votes, setVotes] = useState<Record<string, string[]>>({});
  useEffect(() => {
    if (!uid) {
      setVotes({});
      return;
    }
    const q = query(collection(db, 'plus_anket_oylar'), where('uid', '==', uid));
    return onSnapshot(
      q,
      (snap) => {
        const m: Record<string, string[]> = {};
        snap.docs.forEach((d) => {
          const x = d.data() as any;
          if (x.pollId && Array.isArray(x.optionIds)) m[x.pollId] = x.optionIds;
        });
        setVotes(m);
      },
      (err) => console.warn('[anket] oylar okunamadı', (err as any)?.code || err)
    );
  }, [uid]);
  return votes;
}

/** Oy ver. Sunucu aynı kişinin ikinci oyunu ve kapanmış anketi reddeder. */
export async function votePoll(pollId: string, optionIds: string[]): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Oy vermek için giriş yapmalısınız.');
  const token = await user.getIdToken();
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/poll/vote`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ pollId, optionIds }),
    });
  } catch {
    throw new Error('Bağlantı kurulamadı. İnternetinizi kontrol edin.');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) throw new Error(data?.error || 'Oy kaydedilemedi. Lütfen tekrar deneyin.');
}

export interface NewPollInput {
  question: string;
  description?: string;
  options: string[];
  allowMultiple?: boolean;
  maxChoices?: number;
  endsAtMs?: number | null;
}

/** Yönetici: yeni anket yayınlar (sayaçlar sıfırdan başlar). */
export async function createPoll(input: NewPollInput): Promise<PollItem> {
  const question = input.question.trim();
  const texts = input.options.map((t) => t.trim().replace(/\s+/g, ' ')).filter(Boolean);
  if (!question) throw new Error('Anket sorusunu yazın.');
  if (texts.length < MIN_POLL_OPTIONS) throw new Error('En az 2 seçenek yazın.');
  if (texts.length > MAX_POLL_OPTIONS) throw new Error(`En fazla ${MAX_POLL_OPTIONS} seçenek olabilir.`);
  const lower = texts.map((t) => t.toLocaleLowerCase('tr-TR'));
  if (new Set(lower).size !== lower.length) throw new Error('Aynı seçenek iki kez yazılmış.');
  if (input.endsAtMs && input.endsAtMs <= Date.now()) throw new Error('Bitiş zamanı gelecekte olmalı.');

  const options = texts.map((text, i) => ({ id: `o${i + 1}`, text }));
  const multiple = !!input.allowMultiple && options.length >= 3;
  const poll: PollItem = {
    id: `poll-${Date.now()}`,
    question,
    description: input.description?.trim() || undefined,
    options,
    optionIds: options.map((o) => o.id),
    counts: Object.fromEntries(options.map((o) => [o.id, 0])),
    totalVotes: 0,
    allowMultiple: multiple,
    maxChoices: multiple ? Math.min(options.length, Math.max(2, input.maxChoices || options.length)) : 1,
    status: 'active',
    endsAtMs: input.endsAtMs || null,
    createdAtMs: Date.now(),
    createdBy: auth.currentUser?.uid,
  };
  await setDoc(doc(db, 'plus_anketler', poll.id), poll);
  return poll;
}

/** Yönetici: anketi kapatır veya yeniden açar (yeniden açınca bitiş süresi kaldırılır). */
export const setPollStatus = (id: string, status: 'active' | 'closed') =>
  updateDoc(doc(db, 'plus_anketler', id), status === 'active' ? { status, endsAtMs: null } : { status });

export const deletePoll = (id: string) => deleteDoc(doc(db, 'plus_anketler', id));
