import { useEffect, useState } from 'react';
import { collection, getCountFromServer, getDocs, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import type { Ziyaretci } from './analiz';

export interface KullaniciKaydi {
  uid: string;
  role: string;
  loginMethod?: string;
  createdAtMs?: number;
  updatedMs?: number;
  businessApproved?: boolean;
}

export interface IcerikKaydi {
  id: string;
  tip: string;
  baslik: string;
  kategori?: string;
  goruntulenme: number;
  son?: number;
  gun?: Record<string, number>;
}

export interface AramaKaydi {
  id: string;
  terim: string;
  adet: number;
  bos: number;
  son?: number;
}

export interface OnayKuyrugu {
  ilan: number | null;
  vefat: number | null;
  esnaf: number | null;
  ihbar: number | null;
  kesinti: number | null;
  sikayet: number | null;
}

export interface PanelVeri {
  ziyaretciler: Ziyaretci[];
  kullanicilar: KullaniciKaydi[];
  icerik: IcerikKaydi[];
  arama: AramaKaydi[];
  onay: OnayKuyrugu;
  /** Kaynak başına okuma hataları (ör. kurallar henüz yayınlanmadıysa permission-denied) */
  hatalar: Record<string, string>;
  yuklendi: number;
}

const hataMetni = (e: any): string =>
  e?.code === 'permission-denied'
    ? 'Okuma izni yok. firestore.rules.analitik içeriğini Firebase kurallarına ekleyip yayınlayın.'
    : e?.message || 'Bilinmeyen hata';

const ms = (v: any): number | undefined => {
  if (typeof v === 'number') return v;
  if (v && typeof v.toMillis === 'function') return v.toMillis();
  return undefined;
};

async function say(kol: string, alan: string, deger: string): Promise<number | null> {
  try {
    const r = await getCountFromServer(query(collection(db, kol), where(alan, '==', deger)));
    return r.data().count;
  } catch {
    return null;
  }
}

export async function panelVerisiYukle(): Promise<PanelVeri> {
  const hatalar: Record<string, string> = {};
  const [zv, us, ic, ar, ilan, vefat, esnaf, ihbar, kesinti, sikayet] = await Promise.all([
    getDocs(collection(db, 'plus_ziyaretciler')).catch((e) => ((hatalar.ziyaretciler = hataMetni(e)), null)),
    getDocs(collection(db, 'plus_users')).catch((e) => ((hatalar.kullanicilar = hataMetni(e)), null)),
    getDocs(query(collection(db, 'plus_icerik_istatistik'), orderBy('goruntulenme', 'desc'), limit(300))).catch(
      (e) => ((hatalar.icerik = hataMetni(e)), null)
    ),
    getDocs(query(collection(db, 'plus_arama_istatistik'), orderBy('adet', 'desc'), limit(300))).catch(
      (e) => ((hatalar.arama = hataMetni(e)), null)
    ),
    say('plus_ilanlar', 'status', 'pending'),
    say('plus_vefat', 'status', 'pending'),
    say('plus_esnaf_basvurulari', 'status', 'pending'),
    say('plus_haber_ihbar', 'status', 'pending'),
    say('plus_kesinti_onay', 'status', 'bekliyor'),
    say('plus_sikayetler', 'status', 'open'),
  ]);

  return {
    ziyaretciler: (zv?.docs || []).map((d) => ({ id: d.id, ...(d.data() as any) })),
    kullanicilar: (us?.docs || []).map((d) => {
      const v: any = d.data();
      return {
        uid: d.id,
        role: String(v.role || 'mahalle-sakini'),
        loginMethod: v.loginMethod,
        createdAtMs: typeof v.createdAtMs === 'number' ? v.createdAtMs : undefined,
        updatedMs: ms(v.updatedAt),
        businessApproved: v.businessApproved,
      };
    }),
    icerik: (ic?.docs || []).map((d) => ({ id: d.id, ...(d.data() as any) })),
    arama: (ar?.docs || []).map((d) => ({ id: d.id, ...(d.data() as any) })),
    onay: { ilan, vefat, esnaf, ihbar, kesinti, sikayet },
    hatalar,
    yuklendi: Date.now(),
  };
}

// ---- Canlı: şimdi çevrimiçi ---------------------------------------------------
export interface CanliKayit {
  id: string;
  t: number;
  s: string; // bulunduğu ekran
  p: string; // cihaz türü
  k: string; // geliş kaynağı
}

const CANLI_PENCERE_MS = 90 * 1000;

/** plus_cevrimici belgelerini canlı izler; son 90 sn içinde "buradayım" diyenler çevrimiçi sayılır. */
export function useCanli(): { liste: CanliKayit[]; hata: string | null; hazir: boolean } {
  const [ham, setHam] = useState<CanliKayit[]>([]);
  const [hata, setHata] = useState<string | null>(null);
  const [hazir, setHazir] = useState(false);
  const [simdi, setSimdi] = useState(Date.now());

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'plus_cevrimici'), where('t', '>', Date.now() - 15 * 60 * 1000)),
      (snap) => {
        setHata(null);
        setHazir(true);
        setHam(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      },
      (e) => {
        setHata(hataMetni(e));
        setHazir(true);
      }
    );
    const tik = setInterval(() => setSimdi(Date.now()), 5000);
    return () => {
      unsub();
      clearInterval(tik);
    };
  }, []);

  const liste = ham.filter((k) => (k as any).a !== false && k.t > simdi - CANLI_PENCERE_MS);
  return { liste, hata, hazir };
}
