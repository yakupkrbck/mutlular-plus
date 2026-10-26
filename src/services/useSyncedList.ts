import { useCallback, useEffect, useRef, useState, Dispatch, SetStateAction } from 'react';
import { collection, doc, onSnapshot, query, setDoc, deleteDoc, QueryConstraint } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { uploadDataUrlsDeep } from './uploadService';

export interface SyncOptions {
  enabled?: boolean;
  constraints?: QueryConstraint[];
  /** constraints değiştiğinde aboneliği yenilemek için kararlı bir anahtar */
  key?: string;
  /** Yeni belgelere ownerUid (giriş yapan kullanıcı) ekler */
  stampOwner?: boolean;
}

export const notifySyncError = (msg: string) => {
  try {
    window.dispatchEvent(new CustomEvent('mp-sync-error', { detail: msg }));
  } catch {}
};

const friendly = (err: any): string => {
  if (err?.code === 'permission-denied') return 'Bu işlem için yetkiniz yok.';
  if (err?.code === 'unavailable') return 'Bağlantı kurulamadı. İnternetinizi kontrol edin.';
  return err?.message || 'Kayıt sırasında bir hata oluştu.';
};

/**
 * useState benzeri, ama Firestore koleksiyonuyla canlı senkron çalışır.
 * Mevcut `setList(prev => ...)` çağrıları aynen çalışır; fark (ekle/değiştir/sil)
 * otomatik olarak Firestore'a yazılır. Veri içindeki data: görseller Cloudinary'ye yüklenir.
 */
export function useSyncedList<T extends { id: string }>(
  path: string,
  opts: SyncOptions = {}
): [T[], Dispatch<SetStateAction<T[]>>, boolean] {
  const { enabled = true, key = '', stampOwner = false } = opts;
  const [list, setListState] = useState<T[]>([]);
  const [ready, setReady] = useState(false);
  const listRef = useRef<T[]>([]);
  const serverRef = useRef<T[]>([]);
  const constraintsRef = useRef<QueryConstraint[]>(opts.constraints || []);
  constraintsRef.current = opts.constraints || [];

  useEffect(() => {
    if (!enabled) {
      listRef.current = [];
      serverRef.current = [];
      setListState([]);
      setReady(false);
      return;
    }
    const q = query(collection(db, path), ...constraintsRef.current);
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs
          .map((d) => ({ ...(d.data() as any), id: d.id } as T))
          .sort((a: any, b: any) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
        serverRef.current = items;
        listRef.current = items;
        setListState(items);
        setReady(true);
      },
      (err) => {
        console.error('[sync]', path, err);
        notifySyncError(friendly(err));
        setReady(true);
      }
    );
    return () => unsub();
  }, [path, enabled, key]);

  const setList: Dispatch<SetStateAction<T[]>> = useCallback(
    (upd) => {
      const prev = listRef.current;
      const next = typeof upd === 'function' ? (upd as (p: T[]) => T[])(prev) : upd;
      if (next === prev) return;

      const prevMap = new Map(prev.map((i) => [i.id, i]));
      const nextIds = new Set(next.map((i) => i.id));
      const toWrite: any[] = [];
      const finalNext: T[] = next.map((item) => {
        const old = prevMap.get(item.id);
        if (old === item) return item;
        if (old && JSON.stringify(old) === JSON.stringify(item)) return item;
        let data: any = item;
        if (!old) {
          data = { ...item, createdAtMs: (item as any).createdAtMs || Date.now() };
          if (stampOwner && auth.currentUser && !data.ownerUid) data.ownerUid = auth.currentUser.uid;
        }
        toWrite.push(data);
        return data as T;
      });
      const toDelete = prev.filter((o) => !nextIds.has(o.id));

      if ((toWrite.length || toDelete.length) && !auth.currentUser) {
        notifySyncError('Bu işlem için giriş yapmalısınız.');
        return;
      }

      listRef.current = finalNext;
      setListState(finalNext);

      if (!toWrite.length && !toDelete.length) return;
      const jobs: Promise<unknown>[] = [
        ...toWrite.map(async (data) => {
          const clean = await uploadDataUrlsDeep(data);
          await setDoc(doc(db, path, data.id), clean);
        }),
        ...toDelete.map((o) => deleteDoc(doc(db, path, o.id))),
      ];
      Promise.all(jobs).catch((err) => {
        console.error('[sync write]', path, err);
        notifySyncError(friendly(err));
        listRef.current = serverRef.current;
        setListState(serverRef.current);
      });
    },
    [path, stampOwner]
  );

  return [list, setList, ready];
}
