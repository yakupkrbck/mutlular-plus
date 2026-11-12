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
export type KaynakTur = 'gorsel' | 'video' | 'youtube' | 'web';
export interface Kaynak {
  type: KaynakTur;
  url: string;
  /** video / YouTube sesi açık mı (varsayılan sessiz) */
  ses?: boolean;
}
export type Kose = 'sol-ust' | 'sag-ust' | 'sol-alt' | 'sag-alt';

/** Katman varyantları (her katmanın birden fazla hazır görünümü vardır). */
export interface RejiVaryant {
  kj: string;
  ticker: string;
  live: string;
  logo: string;
  konusmaci: string;
  zaman: string;
  baslik: string;
  sd: string;
  tam: string;
  pip: string;
}

export interface RejiDurum {
  brand: { name: string; logo: string; visible: boolean; position: 'sol-ust' | 'sag-ust'; size: number };
  top: { visible: boolean; liveText: string; location: string; showLive: boolean; showLoc: boolean; position: 'sol-ust' | 'sag-ust' };
  kj: { visible: boolean; category: string; title: string; sub: string };
  ticker: { visible: boolean; items: string[]; speed: number; clock: boolean; label: string };
  breaking: boolean;
  /** Son dakika bandı metni (boşsa ana bant başlığı kullanılır) */
  sd: { text: string };
  konusmaci: { visible: boolean; name: string; title: string; position: 'sol' | 'sag' };
  zaman: { visible: boolean; mode: 'saat' | 'tarih' | 'tarihsaat' | 'saniye'; position: 'sol-ust' | 'sag-ust' };
  baslik: { visible: boolean; text: string; position: 'ust' | 'alt' };
  tam: { visible: boolean; label: string; title: string; text: string; image: string; bg: string };
  pip: { visible: boolean; src: Kaynak; position: Kose; size: number; label: string };
  split: { visible: boolean; layout: 'sol' | 'sag' | 'ust' | 'alt'; ratio: number; src: Kaynak; title: string; text: string };
  theme: { normal: string; breaking: string; accent: string; text: string; dark: string };
  look: { font: 'sans' | 'serif' | 'dar' | 'yuvarlak'; radius: number; scale: number; anim: 'kay' | 'solma' | 'yok' };
  v: RejiVaryant;
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
  /** Kayıtlı konuşmacılar (isimlik için tek dokunuşla seçilir) */
  konusmacilar: RejiKonusmaci[];
}

export interface RejiKonusmaci {
  id: string;
  name: string;
  title: string;
}

export const DEFAULT_REJI: RejiDurum = {
  brand: { name: 'MUTLULAR HABER', logo: '', visible: true, position: 'sag-ust', size: 1 },
  top: { visible: true, liveText: 'CANLI', location: 'OSMANGAZİ / BURSA', showLive: true, showLoc: true, position: 'sol-ust' },
  kj: { visible: true, category: 'GÜNDEM', title: '', sub: '' },
  ticker: { visible: true, items: [], speed: 8, clock: true, label: 'SON HABERLER' },
  breaking: false,
  sd: { text: '' },
  konusmaci: { visible: false, name: '', title: '', position: 'sol' },
  zaman: { visible: false, mode: 'tarihsaat', position: 'sag-ust' },
  baslik: { visible: false, text: '', position: 'alt' },
  tam: { visible: false, label: '', title: '', text: '', image: '', bg: '' },
  pip: { visible: false, src: { type: 'gorsel', url: '' }, position: 'sag-alt', size: 26, label: '' },
  split: { visible: false, layout: 'sol', ratio: 40, src: { type: 'gorsel', url: '' }, title: '', text: '' },
  theme: { normal: '#0b3d91', breaking: '#c8102e', accent: '#ffffff', text: '#ffffff', dark: '#111111' },
  look: { font: 'sans', radius: 0.6, scale: 1, anim: 'kay' },
  v: { kj: 'klasik', ticker: 'klasik', live: 'klasik', logo: 'duz', konusmaci: 'klasik', zaman: 'kutu', baslik: 'tam', sd: 'tema', tam: 'gorsel', pip: 'kose' },
};

// ---------------------------------------------------------------------------
// Katalog: her katmanın varyantları (katman.html içindeki CSS ile birebir eşleşir)
// ---------------------------------------------------------------------------
export interface KatmanTanim {
  anahtar: keyof RejiVaryant;
  ad: string;
  aciklama: string;
  varyantlar: { id: string; ad: string }[];
}
export const KATMANLAR: KatmanTanim[] = [
  { anahtar: 'kj', ad: 'Alt Bant (ana bant)', aciklama: 'Haber başlığı, kategori ve alt açıklama', varyantlar: [
    { id: 'klasik', ad: 'Klasik' }, { id: 'cizgi', ad: 'Çizgili koyu' }, { id: 'kutu', ad: 'Yüzen kart' }, { id: 'ince', ad: 'Tek satır' }, { id: 'yan', ad: 'Yan etiketli' } ] },
  { anahtar: 'ticker', ad: 'Kayan Yazı', aciklama: 'Ekranın altında akan haber satırları', varyantlar: [
    { id: 'klasik', ad: 'Klasik' }, { id: 'cam', ad: 'Cam kapsül' }, { id: 'ince', ad: 'İnce şerit' }, { id: 'etiketli', ad: 'Etiketli' } ] },
  { anahtar: 'logo', ad: 'Kanal Logosu', aciklama: 'Köşedeki logo veya kanal adı', varyantlar: [
    { id: 'duz', ad: 'Düz' }, { id: 'kutu', ad: 'Beyaz kutu' }, { id: 'daire', ad: 'Daire' } ] },
  { anahtar: 'sd', ad: 'Son Dakika Bandı', aciklama: 'Son dakika modu açılınca görünüm', varyantlar: [
    { id: 'tema', ad: 'Yalnız renk' }, { id: 'bant', ad: 'Üst bant' }, { id: 'rozet', ad: 'Rozet' } ] },
  { anahtar: 'konusmaci', ad: 'Konuşmacı İsimliği', aciklama: 'Konuşan kişinin adı ve unvanı', varyantlar: [
    { id: 'klasik', ad: 'Klasik' }, { id: 'cizgi', ad: 'Çizgili' }, { id: 'kapsul', ad: 'Kapsül' } ] },
  { anahtar: 'live', ad: 'Canlı Yayın Etiketi', aciklama: 'CANLI rozeti ve konum bilgisi', varyantlar: [
    { id: 'klasik', ad: 'Klasik' }, { id: 'oval', ad: 'Oval' }, { id: 'kare', ad: 'Köşeli' }, { id: 'minimal', ad: 'Minimal' } ] },
  { anahtar: 'zaman', ad: 'Tarih ve Saat', aciklama: 'Köşede tarih / saat göstergesi', varyantlar: [
    { id: 'kutu', ad: 'Kutu' }, { id: 'minimal', ad: 'Minimal' }, { id: 'buyuk', ad: 'Büyük renkli' } ] },
  { anahtar: 'baslik', ad: 'Haber Başlığı Bandı', aciklama: 'Tek satırlık ayrı başlık şeridi', varyantlar: [
    { id: 'tam', ad: 'Tam genişlik' }, { id: 'kapsul', ad: 'Kapsül' }, { id: 'cizgi', ad: 'Çizgili' } ] },
  { anahtar: 'tam', ad: 'Tam Ekran Haber Grafiği', aciklama: 'Görüntünün tamamını kaplayan haber kartı', varyantlar: [
    { id: 'gorsel', ad: 'Görsel + yazı' }, { id: 'yan', ad: 'Yan yana' }, { id: 'yazi', ad: 'Yalnız yazı' } ] },
  { anahtar: 'pip', ad: 'Görüntü İçinde Görüntü', aciklama: 'Köşede küçük pencere (görsel, video, YouTube, sayfa)', varyantlar: [
    { id: 'kose', ad: 'Yuvarlak köşe' }, { id: 'daire', ad: 'Daire' }, { id: 'cerceve', ad: 'Çerçeveli' } ] },
];

export const YAZI_TIPLERI: { id: RejiDurum['look']['font']; ad: string }[] = [
  { id: 'sans', ad: 'Modern' }, { id: 'serif', ad: 'Gazete (serif)' }, { id: 'dar', ad: 'Dar' }, { id: 'yuvarlak', ad: 'Yuvarlak' },
];

/** Hazır paketler: renk + yazı tipi + köşe + tüm katmanların varyantlarını tek dokunuşta ayarlar. */
export interface RejiPaket {
  id: string;
  ad: string;
  aciklama: string;
  theme: RejiDurum['theme'];
  look: Pick<RejiDurum['look'], 'font' | 'radius'>;
  v: RejiVaryant;
}
export const PAKETLER: RejiPaket[] = [
  {
    id: 'klasik', ad: 'Klasik Haber', aciklama: 'Mavi, beyaz etiketli, televizyon haber görünümü',
    theme: { normal: '#0b3d91', breaking: '#c8102e', accent: '#ffffff', text: '#ffffff', dark: '#111111' },
    look: { font: 'sans', radius: 0.6 },
    v: { kj: 'klasik', ticker: 'klasik', live: 'klasik', logo: 'duz', konusmaci: 'klasik', zaman: 'kutu', baslik: 'tam', sd: 'tema', tam: 'gorsel', pip: 'kose' },
  },
  {
    id: 'cam', ad: 'Modern Cam', aciklama: 'Koyu şeffaf, ince çizgili, sade ve şık',
    theme: { normal: '#2563eb', breaking: '#e11d48', accent: '#7dd3fc', text: '#ffffff', dark: '#0b1220' },
    look: { font: 'sans', radius: 1.2 },
    v: { kj: 'cizgi', ticker: 'cam', live: 'minimal', logo: 'kutu', konusmaci: 'cizgi', zaman: 'minimal', baslik: 'cizgi', sd: 'rozet', tam: 'gorsel', pip: 'kose' },
  },
  {
    id: 'ana', ad: 'Ana Haber', aciklama: 'Kırmızı üst bantlı, yan etiketli, iddialı',
    theme: { normal: '#b91c1c', breaking: '#7f1d1d', accent: '#ffffff', text: '#ffffff', dark: '#0a0a0a' },
    look: { font: 'dar', radius: 0 },
    v: { kj: 'yan', ticker: 'etiketli', live: 'kare', logo: 'kutu', konusmaci: 'klasik', zaman: 'buyuk', baslik: 'tam', sd: 'bant', tam: 'yan', pip: 'cerceve' },
  },
  {
    id: 'spor', ad: 'Spor / Canlı', aciklama: 'Yeşil-sarı, oval ve enerjik',
    theme: { normal: '#0f9d58', breaking: '#ef4444', accent: '#ffe600', text: '#ffffff', dark: '#06210f' },
    look: { font: 'yuvarlak', radius: 1.4 },
    v: { kj: 'kutu', ticker: 'etiketli', live: 'oval', logo: 'daire', konusmaci: 'kapsul', zaman: 'buyuk', baslik: 'kapsul', sd: 'rozet', tam: 'gorsel', pip: 'daire' },
  },
  {
    id: 'altin', ad: 'Altın / Prestij', aciklama: 'Siyah-altın, gazete yazı tipi, resmi program havası',
    theme: { normal: '#161616', breaking: '#8b0000', accent: '#d4af37', text: '#ffffff', dark: '#000000' },
    look: { font: 'serif', radius: 0.2 },
    v: { kj: 'cizgi', ticker: 'ince', live: 'oval', logo: 'duz', konusmaci: 'cizgi', zaman: 'kutu', baslik: 'cizgi', sd: 'bant', tam: 'yazi', pip: 'cerceve' },
  },
  {
    id: 'minimal', ad: 'Minimal', aciklama: 'En az öğe: tek satır bant, ince şerit',
    theme: { normal: '#111827', breaking: '#dc2626', accent: '#f3f4f6', text: '#ffffff', dark: '#111827' },
    look: { font: 'sans', radius: 0.4 },
    v: { kj: 'ince', ticker: 'ince', live: 'minimal', logo: 'duz', konusmaci: 'kapsul', zaman: 'minimal', baslik: 'kapsul', sd: 'rozet', tam: 'yazi', pip: 'kose' },
  },
];

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

const SATIR_KAYNAK = (raw: any, d: Kaynak): Kaynak => ({ ...d, ...(raw || {}) });

/** Kayıtlı (eksik alanlı olabilen) veriyi varsayılanlarla tamamlar. Eski (v1) kayıtlar da çalışır. */
export const birlestirReji = (raw: any): RejiDurum => {
  const D = DEFAULT_REJI;
  return {
    ...D,
    ...raw,
    brand: { ...D.brand, ...(raw?.brand || {}) },
    top: { ...D.top, ...(raw?.top || {}) },
    kj: { ...D.kj, ...(raw?.kj || {}) },
    ticker: {
      ...D.ticker,
      ...(raw?.ticker || {}),
      items: Array.isArray(raw?.ticker?.items) ? raw.ticker.items.map(String) : [],
    },
    breaking: !!raw?.breaking,
    sd: { ...D.sd, ...(raw?.sd || {}) },
    konusmaci: { ...D.konusmaci, ...(raw?.konusmaci || {}) },
    zaman: { ...D.zaman, ...(raw?.zaman || {}) },
    baslik: { ...D.baslik, ...(raw?.baslik || {}) },
    tam: { ...D.tam, ...(raw?.tam || {}) },
    pip: { ...D.pip, ...(raw?.pip || {}), src: SATIR_KAYNAK(raw?.pip?.src, D.pip.src) },
    split: { ...D.split, ...(raw?.split || {}), src: SATIR_KAYNAK(raw?.split?.src, D.split.src) },
    theme: { ...D.theme, ...(raw?.theme || {}) },
    look: { ...D.look, ...(raw?.look || {}) },
    v: { ...D.v, ...(raw?.v || {}) },
  };
};

export const DEFAULT_AYAR = (token: string): RejiAyar => ({ token, playlist: [], plIndex: -1, tickerOtomatik: false, tickerAdet: 8, konusmacilar: [] });

const birlestirAyar = (raw: any): RejiAyar => ({
  ...DEFAULT_AYAR(String(raw?.token || '')),
  ...raw,
  playlist: Array.isArray(raw?.playlist) ? raw.playlist : [],
  plIndex: Number.isInteger(raw?.plIndex) ? raw.plIndex : -1,
  konusmacilar: Array.isArray(raw?.konusmacilar) ? raw.konusmacilar : [],
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
  ayar: Pick<RejiAyar, 'playlist' | 'tickerOtomatik' | 'tickerAdet'> & { konusmacilar?: RejiKonusmaci[] };
  durum: RejiDurum;
}
export const yedekOlustur = (ayar: RejiAyar, durum: RejiDurum): RejiYedek => ({
  surum: 1,
  ayar: { playlist: ayar.playlist, tickerOtomatik: ayar.tickerOtomatik, tickerAdet: ayar.tickerAdet, konusmacilar: ayar.konusmacilar },
  durum,
});
/** Yedek dosyasını doğrular; geçersizse hata fırlatır. Anahtar (token) yedeğe girmez. */
export const yedekCoz = (metin: string): RejiYedek => {
  const j = JSON.parse(metin);
  if (j?.surum !== 1 || !j.durum || !Array.isArray(j.ayar?.playlist)) throw new Error('Geçersiz yedek dosyası.');
  return { surum: 1, ayar: { playlist: j.ayar.playlist, tickerOtomatik: !!j.ayar.tickerOtomatik, tickerAdet: Number(j.ayar.tickerAdet) || 8, konusmacilar: Array.isArray(j.ayar.konusmacilar) ? j.ayar.konusmacilar : [] }, durum: birlestirReji(j.durum) };
};
