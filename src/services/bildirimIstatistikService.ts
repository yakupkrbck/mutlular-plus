import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getCountFromServer, limit, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Bildirim raporu: kaç cihaza/kullanıcıya gitti, kaç kişi gördü, kaç kişi dokundu.
//  - plus_bildirim_istatistik/{nid}              : Worker yazar (hedef sayıları, gönderim durumu)
//  - plus_bildirim_istatistik/{nid}/gorenler/{uid}    : kişi Bildirim Merkezi'nde/uygulamada gördü (kişi başı 1 kayıt)
//  - plus_bildirim_istatistik/{nid}/dokunanlar/{uid}  : kişi bildirime dokundu (kişi başı 1 kayıt)

const KOL = 'plus_bildirim_istatistik';
const SEEN_KEY = 'mutlular_seen_nids_v1';

const readSeen = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}');
  } catch {
    return {};
  }
};

/** Yönetim bildirimleri `bn-` ile başlar; yalnız bunlar için sayım tutulur. */
export const isTrackedNotification = (id?: string | null): id is string => !!id && id.startsWith('bn-');

/** Kişi bildirimi gördü ('liste') ya da dokundu ('push'). Kişi başına bir kez yazılır; hata sessizce yutulur. */
export async function markSeen(nid: string, via: 'liste' | 'push'): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid || !isTrackedNotification(nid)) return;
  const seen = readSeen();
  try {
    if (!seen[`g:${nid}:${uid}`]) {
      await setDoc(doc(db, KOL, nid, 'gorenler', uid), { uid, atMs: Date.now(), via });
      seen[`g:${nid}:${uid}`] = 1;
    }
    if (via === 'push' && !seen[`d:${nid}:${uid}`]) {
      await setDoc(doc(db, KOL, nid, 'dokunanlar', uid), { uid, atMs: Date.now(), via });
      seen[`d:${nid}:${uid}`] = 1;
    }
    // Cihaz hafızası şişmesin: en yeni 400 kaydı tut
    const keys = Object.keys(seen);
    if (keys.length > 400) keys.slice(0, keys.length - 400).forEach((k) => delete seen[k]);
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  } catch (e: any) {
    // Zaten kaydedilmişse (kural güncellemeye izin vermez) tekrar denenmesin
    if (e?.code === 'permission-denied') {
      seen[`g:${nid}:${uid}`] = 1;
      if (via === 'push') seen[`d:${nid}:${uid}`] = 1;
      try {
        localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
      } catch {}
    }
  }
}

export interface BildirimRapor {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAtMs: number;
  hedefCihaz: number;
  hedefKullanici: number;
  durum: 'gonderiliyor' | 'gonderildi' | 'hata';
  hata?: string;
  denemeSayisi?: number;
  goren: number | null;
  dokunan: number | null;
}

/** Personel: son bildirimler ve sayıları. Sayılar sunucudan toplu sayımla gelir (belge okumadan). */
export function useBildirimRaporu(aktif: boolean): { liste: BildirimRapor[]; hata: boolean; yenileniyor: boolean; yenile: () => void } {
  const [liste, setListe] = useState<BildirimRapor[]>([]);
  const [hata, setHata] = useState(false);
  const [yenileniyor, setYenileniyor] = useState(false);
  const [tick, setTick] = useState(0);
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid || null);
  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid || null)), []);

  useEffect(() => {
    if (!aktif || !uid) return;
    let iptal = false;
    const unsub = onSnapshot(
      query(collection(db, KOL), orderBy('createdAtMs', 'desc'), limit(30)),
      async (snap) => {
        setHata(false);
        setYenileniyor(true);
        const temel: BildirimRapor[] = snap.docs.map((d) => {
          const v: any = d.data();
          return {
            id: d.id,
            title: String(v.title || ''),
            message: String(v.message || ''),
            type: String(v.type || ''),
            createdAtMs: Number(v.createdAtMs) || 0,
            hedefCihaz: Number(v.hedefCihaz) || 0,
            hedefKullanici: Number(v.hedefKullanici) || 0,
            durum: (v.durum as BildirimRapor['durum']) || 'gonderiliyor',
            hata: v.hata ? String(v.hata) : undefined,
            denemeSayisi: Number(v.denemeSayisi) || 0,
            goren: null,
            dokunan: null,
          };
        });
        if (!iptal) setListe(temel);
        const sayili = await Promise.all(
          temel.map(async (r) => {
            try {
              const [g, d] = await Promise.all([
                getCountFromServer(collection(db, KOL, r.id, 'gorenler')),
                getCountFromServer(collection(db, KOL, r.id, 'dokunanlar')),
              ]);
              return { ...r, goren: g.data().count, dokunan: d.data().count };
            } catch {
              return r;
            }
          })
        );
        if (!iptal) {
          setListe(sayili);
          setYenileniyor(false);
        }
      },
      () => setHata(true)
    );
    return () => {
      iptal = true;
      unsub();
    };
  }, [aktif, uid, tick]);

  // Sayılar canlı değişsin: açıkken 30 sn'de bir yenile
  useEffect(() => {
    if (!aktif) return;
    const t = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, [aktif]);

  const yenile = useCallback(() => setTick((n) => n + 1), []);
  return { liste, hata, yenileniyor, yenile };
}
