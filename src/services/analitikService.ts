import { Capacitor } from '@capacitor/core';
import { deleteDoc, doc, increment, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { APP_VERSION } from '../version';
import { getCachedLocation } from './locationService';

// ---------------------------------------------------------------------------
// Anonim kullanım analitiği (yönetim panelindeki /yonetimpaneli için veri katmanı)
//
//  - plus_ziyaretciler/{vid}        : cihaz başına 1 belge. İlk/son görülme, gün gün oturum sayısı (gun),
//                                     gün×saat etkinliği (gh), ilgi sayaçları (ilgi), cihaz/sürüm, giriş yapıldıysa uid/rol,
//                                     YAKLAŞIK konum hücresi (≈50 m; tam konum ASLA gönderilmez) ve konum doğruluğu (dg, metre).
//  - plus_icerik_istatistik/{tip_id}: içerik başına görüntülenme sayacı (haber, ilan, esnaf).
//  - plus_arama_istatistik/{terim}  : arama sözcüğü sayacı (sonuç bulunamayanlar ayrıca sayılır).
//
// Kayıtlar kişiyi tanımlayan metin (ad, telefon, e-posta, mesaj) içermez. Yazma yalnızca birleştirilir (merge),
// okuma yalnızca yönetici. Kullanıcı kapatmak isterse: localStorage 'mp_analitik_kapali' = '1'.
// ---------------------------------------------------------------------------

const VID_KEY = 'mp_vid';
const ILK_KEY = 'mp_vid_ilk';
const KAPALI_KEY = 'mp_analitik_kapali';
const FLUSH_MS = 20000;
const OTURUM_ARASI_MS = 30 * 60 * 1000;

export const ZIYARETCI_KOL = 'plus_ziyaretciler';
export const ICERIK_KOL = 'plus_icerik_istatistik';
export const ARAMA_KOL = 'plus_arama_istatistik';
export const CEVRIMICI_KOL = 'plus_cevrimici';
export const ESNAF_KOL = 'plus_esnaf_istatistik';
export const HATA_KOL = 'plus_hatalar';
const NABIZ_MS = 60000;

export const analitikKapali = (): boolean => {
  try {
    return localStorage.getItem(KAPALI_KEY) === '1';
  } catch {
    return false;
  }
};

export const analitikKapat = (kapali: boolean) => {
  try {
    if (kapali) localStorage.setItem(KAPALI_KEY, '1');
    else localStorage.removeItem(KAPALI_KEY);
  } catch {}
};

const rastgele = () => {
  const b = new Uint8Array(12);
  try {
    crypto.getRandomValues(b);
  } catch {
    for (let i = 0; i < b.length; i++) b[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
};

const ziyaretciId = (): string => {
  try {
    let v = localStorage.getItem(VID_KEY);
    if (!v || v.length < 8) {
      v = 'v' + rastgele();
      localStorage.setItem(VID_KEY, v);
    }
    return v;
  } catch {
    return 'v' + rastgele();
  }
};

// Türkiye saati (UTC+3, yaz saati yok)
const trTarih = (ms = Date.now()) => new Date(ms + 3 * 3600 * 1000);
export const gunAnahtari = (ms = Date.now()) => trTarih(ms).toISOString().slice(0, 10);
const gunSaat = (ms = Date.now()) => {
  const d = trTarih(ms);
  const dow = (d.getUTCDay() + 6) % 7; // 0 = Pazartesi
  return `${dow}-${d.getUTCHours()}`;
};

const temizId = (v: string) => v.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 100);
const kisalt = (v: unknown, n: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

// ---- Birikim (toplu yazma) ------------------------------------------------
let kimlik: { uid: string; rol: string; giris: string } | null = null;
let oturumBekliyor = false;
let olaySayisi = 0;
const ilgi: Record<string, number> = {};
const gh: Record<string, number> = {};
let zamanlayici: ReturnType<typeof setTimeout> | null = null;
let baslatildi = false;
let sonEtkinlik = 0;
let yazimda = false;
let bekleyenKaynak: string | null = null;
let ilkOturumYapildi = false;
let oturumKaynagi = 'dogrudan';
let aktifSayfa = 'anasayfa';
let sonNabiz = 0;
/** Cihazın bildirim (b) ve konum (k) izin durumu: g=verdi, r=sistem reddi, x=uygulama içinde reddetti, s=sorulmadı, u=desteklenmiyor */
let izinBekleyen: { b: string; k: string } | null = null;

export function analitikIzin(b: string, k: string): void {
  if (analitikKapali()) return;
  izinBekleyen = { b, k };
  zamanla();
}
const sayfaBekleyen: Record<string, number> = {};
const sayfaGorulen = new Set<string>();

// ---- Geliş kaynağı ---------------------------------------------------------
const kaynakSinifla = (s: string): string | null => {
  const t = s.toLowerCase();
  if (!t) return null;
  if (t.includes('instagram')) return 'instagram';
  if (/facebook|^fb$|fb\.|fbclid/.test(t)) return 'facebook';
  if (/whatsapp|wa\.me/.test(t)) return 'whatsapp';
  if (/youtube|youtu\.be/.test(t)) return 'youtube';
  if (/twitter|^x$|x\.com|t\.co$/.test(t)) return 'twitter';
  if (/telegram|t\.me/.test(t)) return 'telegram';
  if (t.includes('tiktok')) return 'tiktok';
  if (t.includes('google')) return 'google';
  if (/bing|yandex|duckduckgo|yahoo|ecosia/.test(t)) return 'arama';
  return null;
};

/** Bu açılışın geliş kaynağı. Bağlantıya ?kaynak=instagram gibi etiket eklenirse en güvenilir odur. */
function kaynakBul(): string {
  try {
    if (Capacitor.isNativePlatform()) return 'uygulama';
    const q = new URLSearchParams(window.location.search);
    const etiket = kaynakSinifla(q.get('kaynak') || q.get('utm_source') || q.get('ref') || '');
    if (etiket) return etiket;
    const ua = navigator.userAgent || '';
    if (/Instagram/i.test(ua)) return 'instagram';
    if (/FBAN|FBAV|FB_IAB/i.test(ua)) return 'facebook';
    if (/TikTok|musical_ly|BytedanceWebview/i.test(ua)) return 'tiktok';
    if (document.referrer) {
      const host = new URL(document.referrer).hostname;
      if (host === window.location.hostname) return 'dogrudan';
      return kaynakSinifla(host) || 'diger';
    }
  } catch {}
  return 'dogrudan';
}

const zamanla = () => {
  if (zamanlayici) return;
  zamanlayici = setTimeout(() => {
    zamanlayici = null;
    void yaz();
  }, FLUSH_MS);
};

// 0,0005 derece ≈ 55 m (enlemde) × 42 m (boylamda): mahalle hizmet alanı ~1 km olduğu için yoğunluk haritası bu ölçekte anlamlı.
// Tam koordinat gönderilmez; panel de çevresinde (≈150 m) en az 3 kişi olmayan hücreleri göstermez.
const yuvarla = (v: number) => Number((Math.round(v * 2000) / 2000).toFixed(4));
const konumHucresi = (): { la: number; lo: number; dg?: number } | null => {
  const l = getCachedLocation(30 * 24 * 3600 * 1000);
  if (!l) return null;
  const hucre: { la: number; lo: number; dg?: number } = {
    la: yuvarla(l.lat),
    lo: yuvarla(l.lng),
  };
  if (typeof l.acc === 'number') hucre.dg = Math.min(5000, Math.round(l.acc / 10) * 10);
  return hucre;
};

async function yaz(): Promise<void> {
  if (analitikKapali() || yazimda) return;
  if (!oturumBekliyor && olaySayisi === 0 && !izinBekleyen && !Object.keys(ilgi).length && !Object.keys(sayfaBekleyen).length) return;
  yazimda = true;
  const simdi = Date.now();
  const gun = gunAnahtari(simdi);
  const oturum = oturumBekliyor;
  const olay = olaySayisi;
  const ilgiKopya = { ...ilgi };
  const ghKopya = { ...gh };
  const kaynak = bekleyenKaynak;
  const sayfalar = { ...sayfaBekleyen };
  bekleyenKaynak = null;
  Object.keys(sayfaBekleyen).forEach((k) => delete sayfaBekleyen[k]);
  oturumBekliyor = false;
  olaySayisi = 0;
  Object.keys(ilgi).forEach((k) => delete ilgi[k]);
  Object.keys(gh).forEach((k) => delete gh[k]);

  const gunVeri: Record<string, any> = {};
  if (oturum) gunVeri.s = increment(1);
  if (olay) gunVeri.o = increment(olay);
  if (oturum && kaynak) gunVeri.ks = { [kaynak]: increment(1) };
  if (Object.keys(sayfalar).length) gunVeri.pg = sayfalar; // o gün bu sayfayı gören cihaz (değer 1: tekrar yazmak sayıyı artırmaz)

  const patch: Record<string, any> = {
    son: simdi,
    platform: Capacitor.getPlatform(),
    surum: APP_VERSION,
  };
  let ilkYazildi = false;
  try {
    if (!localStorage.getItem(ILK_KEY)) {
      patch.ilk = simdi;
      if (kaynak) patch.ik = kaynak;
      ilkYazildi = true;
    }
  } catch {}
  if (Object.keys(gunVeri).length) patch.gun = { [gun]: gunVeri };
  if (Object.keys(ghKopya).length) patch.gh = Object.fromEntries(Object.entries(ghKopya).map(([k, v]) => [k, increment(v)]));
  if (Object.keys(ilgiKopya).length) patch.ilgi = Object.fromEntries(Object.entries(ilgiKopya).map(([k, v]) => [k, increment(v)]));
  if (kimlik) {
    patch.uid = kimlik.uid;
    patch.rol = kimlik.rol;
    patch.giris = kimlik.giris;
  }
  const konum = konumHucresi();
  if (konum) patch.konum = konum;
  const izinKopya = izinBekleyen;
  izinBekleyen = null;
  if (izinKopya) patch.izin = { b: izinKopya.b, k: izinKopya.k, t: simdi };

  try {
    await setDoc(doc(db, ZIYARETCI_KOL, ziyaretciId()), patch, { merge: true });
    if (ilkYazildi) {
      try {
        localStorage.setItem(ILK_KEY, '1');
      } catch {}
    }
  } catch {
    // Yazılamadıysa sayaçları geri koy (bir sonraki turda tekrar denenir); sessizce devam
    if (izinKopya && !izinBekleyen) izinBekleyen = izinKopya;
    oturumBekliyor = oturumBekliyor || oturum;
    if (oturum && kaynak && !bekleyenKaynak) bekleyenKaynak = kaynak;
    Object.keys(sayfalar).forEach((k) => (sayfaBekleyen[k] = 1));
    olaySayisi += olay;
    Object.entries(ilgiKopya).forEach(([k, v]) => (ilgi[k] = (ilgi[k] || 0) + v));
    Object.entries(ghKopya).forEach(([k, v]) => (gh[k] = (gh[k] || 0) + v));
  } finally {
    yazimda = false;
  }
}

const yeniOturum = () => {
  oturumBekliyor = true;
  // Yalnız sayfa ilk açıldığında gerçek kaynak ölçülür; aynı açılışta sonradan başlayan oturumlar 'doğrudan' sayılır
  bekleyenKaynak = ilkOturumYapildi ? 'dogrudan' : kaynakBul();
  oturumKaynagi = bekleyenKaynak;
  ilkOturumYapildi = true;
  gh[gunSaat()] = (gh[gunSaat()] || 0) + 1;
  sonEtkinlik = Date.now();
  zamanla();
};

/** Uygulama açılırken bir kez çağrılır. */
export function analitikBaslat(): void {
  if (baslatildi || typeof window === 'undefined') return;
  baslatildi = true;
  if (analitikKapali()) return;
  hataDinleyiciKur();
  yeniOturum();
  void nabiz(true);
  // Çevrimiçi sayacı: ekran açıkken dakikada bir "buradayım" işareti
  setInterval(() => {
    if (document.visibilityState === 'visible') void nabiz(true);
  }, NABIZ_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      void nabiz(true, false);
      void yaz();
    } else {
      void nabiz(true);
      if (Date.now() - sonEtkinlik > OTURUM_ARASI_MS) yeniOturum();
    }
  });
  window.addEventListener('pagehide', () => {
    void nabiz(true, false);
    void yaz();
  });
  window.addEventListener('mp-location-updated', () => zamanla());
}

/** Giriş yapılınca/çıkılınca çağrılır; kişi bilgisi değil, yalnız uid + rol + giriş yöntemi saklanır. */
export function analitikKimlik(k: { uid?: string; rol: string; giris: string } | null): void {
  const yeni = k?.uid ? { uid: k.uid, rol: k.rol, giris: k.giris } : null;
  if (JSON.stringify(yeni) === JSON.stringify(kimlik)) return;
  kimlik = yeni;
  if (yeni && !analitikKapali()) {
    oturumBekliyor = oturumBekliyor || false;
    olaySayisi += 0;
    zamanla();
  }
}

async function nabiz(zorla: boolean, cevrimici = true): Promise<void> {
  if (analitikKapali() || !baslatildi) return;
  const simdi = Date.now();
  if (!zorla && simdi - sonNabiz < 15000) return;
  sonNabiz = simdi;
  try {
    // Kişiyi tanımlayan alan yok: yalnız zaman, bulunduğu ekran, cihaz türü ve geliş kaynağı
    await setDoc(doc(db, CEVRIMICI_KOL, ziyaretciId()), { t: simdi, s: aktifSayfa, p: Capacitor.getPlatform(), k: oturumKaynagi, a: cevrimici });
  } catch {}
}

/** Kullanıcının şu an baktığı ekran ('anasayfa', 'haber', 'canli' ...). Çevrimiçi sayacı ve "sayfayı gören kişi" için. */
export function analitikSayfa(ad: string): void {
  if (analitikKapali() || !baslatildi) return;
  const t = temizId(ad).slice(0, 30);
  if (!t) return;
  aktifSayfa = t;
  const anahtar = gunAnahtari() + '|' + t;
  if (!sayfaGorulen.has(anahtar)) {
    sayfaGorulen.add(anahtar);
    sayfaBekleyen[t] = 1;
    zamanla();
  }
  void nabiz(false);
}

/** Basit olay sayacı: ilgi.{tur} artar. Örn. 'sekme_haber', 'hizli_ilan', 'bildirim_dokundu'. */
export function analitikOlay(tur: string): void {
  if (analitikKapali() || !baslatildi) return;
  const t = temizId(tur).slice(0, 40);
  if (!t) return;
  ilgi[t] = (ilgi[t] || 0) + 1;
  olaySayisi += 1;
  sonEtkinlik = Date.now();
  gh[gunSaat()] = (gh[gunSaat()] || 0) + 1;
  zamanla();
}

// ---- İçerik görüntüleme (oturumda içerik başına 1 kez) --------------------
const gorulen = new Set<string>();

export function icerikGoruntule(tip: 'haber' | 'ilan' | 'esnaf', id: string, baslik: string, kategori?: string): void {
  if (analitikKapali() || !id) return;
  const anahtar = `${tip}_${temizId(id)}`;
  if (gorulen.has(anahtar)) return;
  gorulen.add(anahtar);
  const simdi = Date.now();
  void setDoc(
    doc(db, ICERIK_KOL, anahtar),
    {
      tip,
      id: kisalt(id, 100),
      baslik: kisalt(baslik, 90),
      ...(kategori ? { kategori: kisalt(kategori, 40) } : {}),
      goruntulenme: increment(1),
      son: simdi,
      gun: { [gunAnahtari(simdi)]: increment(1) },
    },
    { merge: true }
  ).catch(() => {});
}

// ---- Arama ----------------------------------------------------------------
const aramaYazildi = new Set<string>();

const asciiTerim = (t: string) =>
  t
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Arama sözcüğünü sayar. `sonucSayisi` 0 ise "sonuç bulunamadı" olarak ayrıca işaretlenir. */
export function aramaKaydet(terim: string, sonucSayisi: number): void {
  if (analitikKapali()) return;
  const t = asciiTerim(terim).slice(0, 50);
  if (t.length < 3) return;
  // Telefon/e-posta gibi kişisel görünen aramalar kaydedilmez
  if (/\d{6,}/.test(t.replace(/ /g, '')) || terim.includes('@')) return;
  const id = temizId(t.replace(/ /g, '_'));
  if (aramaYazildi.has(id)) return;
  aramaYazildi.add(id);
  void setDoc(
    doc(db, ARAMA_KOL, id),
    { terim: t, adet: increment(1), bos: increment(sonucSayisi === 0 ? 1 : 0), son: Date.now() },
    { merge: true }
  ).catch(() => {});
}

/** Hesap silinirken bu cihazın analitik belgesi de silinir (kural: yalnız kendi uid'li belgesi). */
export async function analitikSil(): Promise<void> {
  try {
    await deleteDoc(doc(db, ZIYARETCI_KOL, ziyaretciId()));
  } catch {}
}

// ---- Esnaf sayaçları -----------------------------------------------------------
// plus_esnaf_istatistik/{işletmeId}: toplam + gün gün sayaçlar. İşletme sahibi KENDİ belgesini okur (esnaf panelindeki İstatistik sekmesi).
export type EsnafOlayTuru = 'goruntule' | 'ara' | 'yol' | 'whatsapp' | 'paylas' | 'menu';
const esnafSon = new Map<string, number>();

export function esnafOlay(isletmeId: string | undefined, tur: EsnafOlayTuru): void {
  if (analitikKapali() || !isletmeId) return;
  const id = temizId(isletmeId);
  if (!id) return;
  const anahtar = `${id}|${tur}`;
  const simdi = Date.now();
  // Aynı oturumda aynı tür en fazla 10 sn'de bir sayılır (çift dokunuş ve sekme yenilemeleri şişirmesin)
  const onceki = esnafSon.get(anahtar) || 0;
  if (tur === 'goruntule' ? onceki > 0 : simdi - onceki < 10000) return;
  esnafSon.set(anahtar, simdi);
  void setDoc(
    doc(db, ESNAF_KOL, id),
    { son: simdi, toplam: { [tur]: increment(1) }, gun: { [gunAnahtari(simdi)]: { [tur]: increment(1) } } },
    { merge: true }
  ).catch(() => {});
}

// ---- Hata günlüğü ---------------------------------------------------------------
// plus_hatalar/{özet}: aynı hata tek belgede sayılır (mesaj + sürüm). Kişisel veri sızmasın diye metin temizlenir.
const hataGorulen = new Set<string>();
let hataSayisi = 0;
const GURULTU = /ResizeObserver loop|^Script error\.?$|Non-Error promise rejection|AbortError|Load failed$|Failed to fetch$|NetworkError/i;

const hataOzeti = (s: string): string => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return 'h' + (h >>> 0).toString(36);
};

const metniTemizle = (m: string): string =>
  m
    .replace(/https?:\/\/[^\s)]+/g, (u) => {
      try {
        return new URL(u).pathname.split('/').pop() || 'url';
      } catch {
        return 'url';
      }
    })
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '<eposta>')
    .replace(/\d{6,}/g, '#')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);

export function hataKaydet(mesaj: unknown, kaynak = ''): void {
  if (analitikKapali()) return;
  const m = metniTemizle(typeof mesaj === 'string' ? mesaj : (mesaj as any)?.message || String(mesaj ?? ''));
  if (!m || GURULTU.test(m)) return;
  const k = metniTemizle(kaynak).slice(0, 60);
  const id = hataOzeti(m + '|' + APP_VERSION);
  if (hataGorulen.has(id) || hataSayisi >= 15) return; // aynı hata oturumda 1 kez; oturum başına en çok 15 farklı hata
  hataGorulen.add(id);
  hataSayisi += 1;
  const simdi = Date.now();
  void setDoc(
    doc(db, HATA_KOL, id),
    {
      mesaj: m,
      kaynak: k,
      surum: APP_VERSION,
      platform: Capacitor.getPlatform(),
      adet: increment(1),
      son: simdi,
      gun: { [gunAnahtari(simdi)]: increment(1) },
    },
    { merge: true }
  ).catch(() => {});
}

let hataDinleniyor = false;
export function hataDinleyiciKur(): void {
  if (hataDinleniyor || typeof window === 'undefined') return;
  hataDinleniyor = true;
  window.addEventListener('error', (e) => {
    const yer = e.filename ? `${(e.filename.split('/').pop() || '').split('?')[0]}:${e.lineno}` : '';
    hataKaydet(e.message, yer);
  });
  window.addEventListener('unhandledrejection', (e) => hataKaydet((e.reason as any)?.message || e.reason, 'promise'));
}
