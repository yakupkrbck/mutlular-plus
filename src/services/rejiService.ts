import { useEffect, useState } from 'react';
import { deleteDoc, doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { NewsItem } from '../types';

// ---------------------------------------------------------------------------
// Reji (canlı yayın grafik) sistemi
//  • plus_reji_yayin/{token}  : ekrandaki (yayındaki) grafik durumu. Katman sayfası bunu okur.
//      - get herkese açık, list kapalı: bağlantıdaki uzun anahtarı bilen okur (PRISM/OBS giriş yapmaz)
//      - yazma: yalnızca yönetici/editör (admins kaydı)
//  • plus_reji_ayar/main      : yalnızca personel: anahtar (token), hazır başlık listesi, otomatik kayan yazı ayarı
// ---------------------------------------------------------------------------
export interface RejiDurum {
  brand: { name: string; logo: string };
  top: { visible: boolean; liveText: string; location: string };
  kj: { visible: boolean; category: string; title: string; sub: string };
  ticker: { visible: boolean; items: string[]; speed: number };
  breaking: boolean;
  theme: { normal: string; breaking: string };
  updatedAtMs?: number;
}

export interface RejiBaslik {
  id: string;
  category: string;
  title: string;
  sub: string;
}

export interface RejiAyar {
  token: string;
  playlist: RejiBaslik[];
  plIndex: number;
  /** Kayan yazı son haberlerden otomatik doldurulsun mu? */
  tickerOtomatik: boolean;
  tickerAdet: number;
}

export const DEFAULT_REJI: RejiDurum = {
  brand: { name: 'MUTLULAR HABER', logo: '' },
  top: { visible: true, liveText: 'CANLI', location: 'OSMANGAZİ / BURSA' },
  kj: { visible: true, category: 'GÜNDEM', title: '', sub: '' },
  ticker: { visible: true, items: [], speed: 8 },
  breaking: false,
  theme: { normal: '#0b3d91', breaking: '#c8102e' },
};

export const KATEGORILER = ['GÜNDEM', 'EKONOMİ', 'SPOR', 'ASAYİŞ', 'YEREL', 'HAVA DURUMU', 'MAGAZİN'];

/** Herkese açık adres (PRISM / OBS buraya yapıştırılır; uygulama içi önizleme göreli adresi kullanır) */
export const SITE_URL = 'https://www.mutlularhaber.com';
export const katmanAdresi = (token: string, base = SITE_URL) => `${base}/reji/katman.html?t=${encodeURIComponent(token)}`;
export const panelAdresi = (base = SITE_URL) => `${base}/reji`;

const ALFABE = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
/** Tahmin edilemez anahtar: 24 karakter ≈ 143 bit (tarayıcının güvenli rastgele üretecinden) */
export const yeniToken = (uzunluk = 24): string => {
  const bytes = new Uint8Array(uzunluk * 2);
  crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes) {
    if (b < 248) out += ALFABE[b % 62]; // 248 = 62*4: sapmasız
    if (out.length === uzunluk) break;
  }
  return out;
};

/** Kayıtlı (eksik alanlı olabilen) veriyi varsayılanlarla tamamlar. */
export const birlestirReji = (raw: any): RejiDurum => ({
  ...DEFAULT_REJI,
  ...raw,
  brand: { ...DEFAULT_REJI.brand, ...(raw?.brand || {}) },
  top: { ...DEFAULT_REJI.top, ...(raw?.top || {}) },
  kj: { ...DEFAULT_REJI.kj, ...(raw?.kj || {}) },
  ticker: {
    ...DEFAULT_REJI.ticker,
    ...(raw?.ticker || {}),
    items: Array.isArray(raw?.ticker?.items) ? raw.ticker.items.map(String) : [],
  },
  theme: { ...DEFAULT_REJI.theme, ...(raw?.theme || {}) },
  breaking: !!raw?.breaking,
});

export const DEFAULT_AYAR = (token: string): RejiAyar => ({ token, playlist: [], plIndex: -1, tickerOtomatik: false, tickerAdet: 8 });

const birlestirAyar = (raw: any): RejiAyar => ({
  ...DEFAULT_AYAR(String(raw?.token || '')),
  ...raw,
  playlist: Array.isArray(raw?.playlist) ? raw.playlist : [],
  plIndex: Number.isInteger(raw?.plIndex) ? raw.plIndex : -1,
});

/**
 * Son haberlerden kayan yazı satırları: "son dakika" haberler önce, tekrarlar atılır, en fazla `adet` satır.
 */
export const tickerHaberlerden = (haberler: NewsItem[], adet: number): string[] => {
  const sirali = [...haberler.filter((n) => n.urgent), ...haberler.filter((n) => !n.urgent)];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const n of sirali) {
    const t = (n.title || '').trim().replace(/\s+/g, ' ');
    if (!t) continue;
    const satir = (n.urgent ? 'SON DAKİKA: ' : '') + (t.length > 140 ? `${t.slice(0, 137)}…` : t);
    const k = satir.toLocaleLowerCase('tr-TR');
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(satir);
    if (out.length >= Math.max(1, adet)) break;
  }
  return out;
};

/** Hazır başlık listesinde `d` adım ilerle/geri git (dairesel). Liste boşsa -1. */
export const sonrakiIndeks = (mevcut: number, uzunluk: number, d: number): number =>
  uzunluk === 0 ? -1 : (((mevcut < 0 ? (d > 0 ? -1 : 0) : mevcut) + d) % uzunluk + uzunluk) % uzunluk;

const yayinRef = (token: string) => doc(db, 'plus_reji_yayin', token);
const ayarRef = () => doc(db, 'plus_reji_ayar', 'main');

/** Yayındaki grafiği günceller. Yalnızca verilen alanlar değişir (iç içe nesneler birleştirilir). */
export const rejiYaz = (token: string, patch: Record<string, unknown>) =>
  setDoc(yayinRef(token), { ...patch, updatedAtMs: Date.now() }, { merge: true });

export const ayarYaz = (patch: Partial<RejiAyar>) => setDoc(ayarRef(), patch, { merge: true });

/** İlk kurulum: anahtar ve yayın belgesi yoksa oluşturur. */
export async function rejiKurulum(): Promise<RejiAyar> {
  const snap = await getDoc(ayarRef());
  if (snap.exists() && snap.data()?.token) return birlestirAyar(snap.data());
  const ayar = DEFAULT_AYAR(yeniToken());
  await setDoc(yayinRef(ayar.token), { ...DEFAULT_REJI, updatedAtMs: Date.now() });
  await setDoc(ayarRef(), ayar, { merge: true });
  return ayar;
}

/** Anahtarı yeniler (eski bağlantı çalışmaz olur). Güncel grafik yeni anahtara taşınır. */
export async function tokenYenile(eski: string, durum: RejiDurum): Promise<string> {
  const yeni = yeniToken();
  await setDoc(yayinRef(yeni), { ...durum, updatedAtMs: Date.now() });
  await setDoc(ayarRef(), { token: yeni }, { merge: true });
  await deleteDoc(yayinRef(eski)).catch(() => {});
  return yeni;
}

/** Personel ayarlarını canlı izler. ayar === null: henüz kurulmamış. */
export function useRejiAyar(): { ayar: RejiAyar | null; hazir: boolean; hata: string | null } {
  const [s, setS] = useState<{ ayar: RejiAyar | null; hazir: boolean; hata: string | null }>({ ayar: null, hazir: false, hata: null });
  useEffect(() => {
    const unsub = onSnapshot(
      ayarRef(),
      (snap) => setS({ ayar: snap.exists() && snap.data()?.token ? birlestirAyar(snap.data()) : null, hazir: true, hata: null }),
      (e) => setS({ ayar: null, hazir: true, hata: (e as any)?.code === 'permission-denied' ? 'Bu bölümü kullanma yetkiniz yok.' : 'Reji ayarları okunamadı.' })
    );
    return () => unsub();
  }, []);
  return s;
}

/** Yayındaki grafiği canlı izler (panel önizlemesi ve kontrol düğmelerinin durumu için). */
export function useRejiYayin(token?: string): RejiDurum | null {
  const [d, setD] = useState<RejiDurum | null>(null);
  useEffect(() => {
    if (!token) {
      setD(null);
      return;
    }
    const unsub = onSnapshot(
      yayinRef(token),
      (snap) => setD(snap.exists() ? birlestirReji(snap.data()) : birlestirReji({})),
      () => setD(null)
    );
    return () => unsub();
  }, [token]);
  return d;
}

export interface RejiYedek {
  surum: 1;
  ayar: Pick<RejiAyar, 'playlist' | 'tickerOtomatik' | 'tickerAdet'>;
  durum: RejiDurum;
}
export const yedekOlustur = (ayar: RejiAyar, durum: RejiDurum): RejiYedek => ({
  surum: 1,
  ayar: { playlist: ayar.playlist, tickerOtomatik: ayar.tickerOtomatik, tickerAdet: ayar.tickerAdet },
  durum,
});
/** Yedek dosyasını doğrular; geçersizse hata fırlatır. Anahtar (token) yedeğe girmez. */
export const yedekCoz = (metin: string): RejiYedek => {
  const j = JSON.parse(metin);
  if (j?.surum !== 1 || !j.durum || !Array.isArray(j.ayar?.playlist)) throw new Error('Geçersiz yedek dosyası.');
  return { surum: 1, ayar: { playlist: j.ayar.playlist, tickerOtomatik: !!j.ayar.tickerOtomatik, tickerAdet: Number(j.ayar.tickerAdet) || 8 }, durum: birlestirReji(j.durum) };
};
