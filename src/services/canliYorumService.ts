import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

// Canlı yayın yorumları: plus_canli_yorumlar. Gerçek kullanıcılar yazar; yönetici/editör ve yorum sahibi silebilir.
export interface CanliYorum {
  id: string;
  text: string;
  name: string;
  uid: string;
  createdAtMs: number;
}

export const YORUM_MAX = 200;
const KOL = 'plus_canli_yorumlar';

/** Yayın başlangıcından (ms) sonraki yorumları canlı izler; en yeni altta. */
export function useCanliYorumlar(baslangicMs = 0, aktif = true): CanliYorum[] {
  const [liste, setListe] = useState<CanliYorum[]>([]);
  useEffect(() => {
    if (!aktif) {
      setListe([]);
      return;
    }
    const unsub = onSnapshot(
      query(collection(db, KOL), orderBy('createdAtMs', 'desc'), limit(80)),
      (snap) => {
        const hepsi = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<CanliYorum, 'id'>) }))
          .filter((y) => typeof y.text === 'string' && typeof y.createdAtMs === 'number' && y.createdAtMs >= baslangicMs);
        setListe(hepsi.reverse());
      },
      () => setListe([])
    );
    return () => unsub();
  }, [baslangicMs, aktif]);
  return liste;
}

export const yorumGonder = (uid: string, name: string, text: string) =>
  addDoc(collection(db, KOL), { uid, name: name.trim().slice(0, 60) || 'Misafir', text: text.trim().slice(0, YORUM_MAX), createdAtMs: Date.now() });

export const yorumSil = (id: string) => deleteDoc(doc(db, KOL, id));
