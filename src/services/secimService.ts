import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { uploadDataUrlsDeep } from './uploadService';

// ---------------------------------------------------------------------------
// Muhtarlık seçimi sonuçları
// Veri: Firestore `plus_ayarlar/secim` belgesi (yönetim panelinden elle girilir, herkes canlı görür).
// Aşağıdaki SecimVeri nesnesi bilerek basit tutuldu: sayıları değiştirirsiniz, yüzdeler ve
// çubuklar secimHesapla() ile otomatik yeniden hesaplanır.
// ---------------------------------------------------------------------------
export interface SecimAday {
  id: string;
  ad: string;
  /** Fotoğraf bağlantısı; boşsa yer tutucu (baş harfler) gösterilir */
  foto?: string;
  /** Aldığı oy */
  oy: number;
}

export interface SecimVeri {
  baslik: string;
  /** Ekranda gösterilsin mi? (kapalıyken ana sayfada kart çıkmaz) */
  yayinda: boolean;
  /** devam: sayım sürüyor • kesin: sonuçlar kesinleşti */
  durum: 'devam' | 'kesin';
  toplamSecmen: number;
  /** Kullanılan oy (oyuOtomatikHesapla açıkken adaylar + geçersiz oydan hesaplanır) */
  kullanilanOy: number;
  gecersizOy: number;
  toplamSandik: number;
  acilanSandik: number;
  oyuOtomatikHesapla: boolean;
  adaylar: SecimAday[];
  /** Son güncelleme (ms) */
  guncelleme?: number;
}

export const MAX_ADAY = 8;

export const DEFAULT_SECIM: SecimVeri = {
  baslik: 'Muhtarlık Seçimi Sonuçları',
  yayinda: false,
  durum: 'devam',
  toplamSecmen: 0,
  kullanilanOy: 0,
  gecersizOy: 0,
  toplamSandik: 0,
  acilanSandik: 0,
  oyuOtomatikHesapla: true,
  adaylar: [
    { id: 'a1', ad: '1. Aday', oy: 0 },
    { id: 'a2', ad: '2. Aday', oy: 0 },
    { id: 'a3', ad: '3. Aday', oy: 0 },
  ],
};

/** Adaylar için sakin, göz yormayan renk paleti (sıraya göre döner). */
export const ADAY_RENKLERI = ['#4a6fa5', '#3e8e84', '#c08a4b', '#8570a8', '#6f9162', '#b8665f', '#5b8497', '#8a8f9c'];
export const adayRengi = (i: number) => ADAY_RENKLERI[i % ADAY_RENKLERI.length];

const sayi = (v: unknown): number => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n > 0 ? n : 0;
};
const yuzde = (a: number, b: number): number => (b > 0 ? Math.min(100, Math.max(0, (a / b) * 100)) : 0);

export interface SecimAdayHesap extends SecimAday {
  /** Geçerli oy içindeki payı (0–100) */
  yuzde: number;
  sira: number;
  onde: boolean;
  renk: string;
}

export interface SecimHesap {
  veri: SecimVeri;
  gecerliOy: number;
  kullanilanOy: number;
  katilimYuzde: number;
  acilanSandikYuzde: number;
  adaylar: SecimAdayHesap[];
  /** Birinci sırada eşitlik var mı? */
  esitlik: boolean;
  /** Oy girilmiş mi? */
  oyVar: boolean;
  /** Girişte tutarsızlık varsa uyarılar (yönetici panelinde gösterilir) */
  uyarilar: string[];
}

/**
 * Tüm yüzdeleri tek yerden hesaplar:
 *  • aday yüzdesi = aday oyu / geçerli oy (adayların oy toplamı)
 *  • katılım = kullanılan oy / toplam seçmen
 *  • açılan sandık = açılan / toplam sandık
 */
export const secimHesapla = (girdi: SecimVeri): SecimHesap => {
  const adayOylari = girdi.adaylar.map((a) => ({ ...a, oy: sayi(a.oy) }));
  const gecerliOy = adayOylari.reduce((t, a) => t + a.oy, 0);
  const gecersiz = sayi(girdi.gecersizOy);
  const kullanilanOy = girdi.oyuOtomatikHesapla ? gecerliOy + gecersiz : sayi(girdi.kullanilanOy);
  const toplamSecmen = sayi(girdi.toplamSecmen);
  const toplamSandik = sayi(girdi.toplamSandik);
  const acilanSandik = sayi(girdi.acilanSandik);

  const maxOy = adayOylari.reduce((m, a) => Math.max(m, a.oy), 0);
  const birinciSayisi = maxOy > 0 ? adayOylari.filter((a) => a.oy === maxOy).length : 0;

  const siralI = adayOylari
    .map((a, i) => ({ a, i }))
    .sort((x, y) => y.a.oy - x.a.oy || x.i - y.i)
    .map(({ a, i }, sira) => ({
      ...a,
      yuzde: yuzde(a.oy, gecerliOy),
      sira: sira + 1,
      onde: maxOy > 0 && a.oy === maxOy,
      renk: adayRengi(i), // renk, girişteki sıraya bağlı: oylar değişince renkler yer değiştirmez
    }));

  const uyarilar: string[] = [];
  if (toplamSecmen > 0 && kullanilanOy > toplamSecmen) uyarilar.push('Kullanılan oy, toplam seçmenden fazla.');
  if (toplamSandik > 0 && acilanSandik > toplamSandik) uyarilar.push('Açılan sandık sayısı, toplam sandıktan fazla.');
  if (!girdi.oyuOtomatikHesapla && gecerliOy + gecersiz > sayi(girdi.kullanilanOy)) {
    uyarilar.push('Aday oyları ve geçersiz oyların toplamı, kullanılan oydan fazla.');
  }

  return {
    veri: girdi,
    gecerliOy,
    kullanilanOy,
    katilimYuzde: yuzde(kullanilanOy, toplamSecmen),
    acilanSandikYuzde: yuzde(acilanSandik, toplamSandik),
    adaylar: siralI,
    esitlik: birinciSayisi > 1,
    oyVar: gecerliOy > 0,
    uyarilar,
  };
};

/** 1234567 → "1.234.567" */
export const sayiYaz = (n: number): string => Math.round(n).toLocaleString('tr-TR');
/** 45.23 → "%45,2" */
export const yuzdeYaz = (n: number): string => `%${n.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}`;

const normalize = (raw: any): SecimVeri => ({
  ...DEFAULT_SECIM,
  ...raw,
  adaylar: Array.isArray(raw?.adaylar) && raw.adaylar.length ? raw.adaylar : DEFAULT_SECIM.adaylar,
});

/** Seçim sonuçlarını canlı izler: yönetici kaydettiği anda herkesin ekranı güncellenir. */
export function useSecim(): SecimVeri {
  const [veri, setVeri] = useState<SecimVeri>(DEFAULT_SECIM);
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'plus_ayarlar', 'secim'),
      (snap) => setVeri(snap.exists() ? normalize(snap.data()) : DEFAULT_SECIM),
      () => setVeri(DEFAULT_SECIM)
    );
    return () => unsub();
  }, []);
  return veri;
}

/** Kaydeder (aday fotoğrafları önce Cloudinary'ye yüklenir). Kullanılan oy otomatikse hesaplanıp yazılır. */
export async function saveSecim(girdi: SecimVeri): Promise<void> {
  const hesap = secimHesapla(girdi);
  const temiz: SecimVeri = {
    ...girdi,
    toplamSecmen: sayi(girdi.toplamSecmen),
    gecersizOy: sayi(girdi.gecersizOy),
    toplamSandik: sayi(girdi.toplamSandik),
    acilanSandik: Math.min(sayi(girdi.acilanSandik), sayi(girdi.toplamSandik) || sayi(girdi.acilanSandik)),
    kullanilanOy: hesap.kullanilanOy,
    adaylar: girdi.adaylar.map((a) => ({ ...a, ad: a.ad.trim() || 'Aday', oy: sayi(a.oy) })),
    guncelleme: Date.now(),
  };
  const yuklenmis = await uploadDataUrlsDeep(temiz);
  await setDoc(doc(db, 'plus_ayarlar', 'secim'), yuklenmis);
}
