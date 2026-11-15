import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Kullanıcı içeriği (UGC) şikayet ve engelleme.
//  - Şikayetler: plus_sikayetler/{reporterUid_tür_hedefId}  (kişi aynı içeriği bir kez bildirir; yalnızca personel okur)
//  - Engellenenler: plus_users/{uid}/engellenenler/{engellenenUid}  (yalnızca kişinin kendisi okur/yazar)

export type ReportTargetType = 'yorum' | 'ilan' | 'is' | 'hikaye' | 'diger';

export const TARGET_LABEL: Record<ReportTargetType, string> = {
  yorum: 'Canlı yayın yorumu',
  ilan: 'İlan',
  is: 'İş ilanı',
  hikaye: 'Hikâye',
  diger: 'İçerik',
};

export const REPORT_REASONS = [
  'Hakaret / küfür',
  'Taciz veya tehdit',
  'Müstehcen / uygunsuz içerik',
  'Dolandırıcılık / yanıltıcı bilgi',
  'Nefret söylemi',
  'Spam / istenmeyen reklam',
  'Diğer',
] as const;

export interface ReportTarget {
  type: ReportTargetType;
  id: string;
  /** İçeriği yazan kişinin uid'si (biliniyorsa; engelleme için) */
  ownerUid?: string;
  ownerName?: string;
  /** Personelin ne olduğunu görmesi için kısa özet (başlık / yorum metni) */
  title?: string;
}

export interface ReportRecord {
  id: string;
  reporterUid: string;
  targetType: ReportTargetType;
  targetId: string;
  targetOwnerUid?: string;
  targetOwnerName?: string;
  targetTitle?: string;
  reason: string;
  note?: string;
  status: 'open' | 'resolved';
  createdAtMs: number;
  resolvedAtMs?: number;
  resolvedBy?: string;
  resolution?: string;
}

const KOL = 'plus_sikayetler';
const clip = (v: unknown, n: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const safeId = (v: string) => v.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 120);

export const LOGIN_REQUIRED = 'LOGIN_REQUIRED';
export const ALREADY_REPORTED = 'ALREADY_REPORTED';

export async function sendReport(target: ReportTarget, reason: string, note: string): Promise<void> {
  const me = auth.currentUser;
  if (!me) throw new Error(LOGIN_REQUIRED);
  const data: Record<string, unknown> = {
    reporterUid: me.uid,
    targetType: target.type,
    targetId: clip(target.id, 120),
    reason: clip(reason, 60),
    status: 'open',
    createdAtMs: Date.now(),
  };
  if (target.ownerUid) data.targetOwnerUid = clip(target.ownerUid, 128);
  if (target.ownerName) data.targetOwnerName = clip(target.ownerName, 60);
  if (target.title) data.targetTitle = clip(target.title, 160);
  if (note.trim()) data.note = clip(note, 300);
  try {
    await setDoc(doc(db, KOL, `${me.uid}_${target.type}_${safeId(target.id)}`), data);
  } catch (e: any) {
    // Aynı içerik daha önce bildirildiyse kural güncellemeye izin vermez
    if (e?.code === 'permission-denied') throw new Error(ALREADY_REPORTED);
    throw e;
  }
}

export interface BlockedUser {
  uid: string;
  name: string;
  createdAtMs: number;
}

export async function blockUser(uid: string, name = ''): Promise<void> {
  const me = auth.currentUser;
  if (!me) throw new Error(LOGIN_REQUIRED);
  if (!uid || uid === me.uid) return;
  await setDoc(doc(db, 'plus_users', me.uid, 'engellenenler', uid), {
    blockedUid: uid,
    name: clip(name, 60),
    createdAtMs: Date.now(),
  });
}

export async function unblockUser(uid: string): Promise<void> {
  const me = auth.currentUser;
  if (!me) return;
  await deleteDoc(doc(db, 'plus_users', me.uid, 'engellenenler', uid));
}

function useMyUid(): string | null {
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid || null);
  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid || null)), []);
  return uid;
}

/** Giriş yapan kişinin engellediği kullanıcılar (canlı). Çıkış yapılınca boşalır. */
export function useBlockedUsers(): BlockedUser[] {
  const uid = useMyUid();
  const [list, setList] = useState<BlockedUser[]>([]);
  useEffect(() => {
    if (!uid) {
      setList([]);
      return;
    }
    const unsub = onSnapshot(
      collection(db, 'plus_users', uid, 'engellenenler'),
      (snap) =>
        setList(
          snap.docs
            .map((d) => ({ uid: d.id, name: String(d.data().name || ''), createdAtMs: Number(d.data().createdAtMs) || 0 }))
            .sort((a, b) => b.createdAtMs - a.createdAtMs)
        ),
      () => setList([])
    );
    return () => unsub();
  }, [uid]);
  return list;
}

export function useBlockedUids(): Set<string> {
  const list = useBlockedUsers();
  // list yalnızca anlık görüntü değişince yenilenir; Set her render'da yeniden oluşmasın
  return useMemo(() => new Set(list.map((b) => b.uid)), [list]);
}

/** Personel: son şikayetler (yeniden eskiye). */
export function useReports(aktif = true): { reports: ReportRecord[]; hata: boolean } {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [hata, setHata] = useState(false);
  useEffect(() => {
    if (!aktif) return;
    const unsub = onSnapshot(
      query(collection(db, KOL), orderBy('createdAtMs', 'desc'), limit(200)),
      (snap) => {
        setReports(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ReportRecord, 'id'>) })));
        setHata(false);
      },
      () => setHata(true)
    );
    return () => unsub();
  }, [aktif]);
  return { reports, hata };
}

export const resolveReport = (id: string, resolution: string) =>
  updateDoc(doc(db, KOL, id), {
    status: 'resolved',
    resolvedAtMs: Date.now(),
    resolvedBy: auth.currentUser?.uid || '',
    resolution: clip(resolution, 80),
  });

export const deleteReport = (id: string) => deleteDoc(doc(db, KOL, id));
