// Yönetim paneli: ham analitik belgelerinden özet hesaplar (saf fonksiyonlar, ağ yok).

export interface Ziyaretci {
  id: string;
  ilk?: number;
  son?: number;
  ik?: string;
  gun?: Record<string, { s?: number; o?: number; ks?: Record<string, number>; pg?: Record<string, number> }>;
  gh?: Record<string, number>;
  ilgi?: Record<string, number>;
  platform?: string;
  surum?: string;
  uid?: string;
  rol?: string;
  giris?: string;
  konum?: { la: number; lo: number; dg?: number };
}

/** Bir kişi: aynı hesapla giren birden çok cihaz tek kişi sayılır; girişsiz cihaz ayrı kişidir. */
export interface Kisi {
  anahtar: string;
  uid?: string;
  ilk: number | null;
  ilkGun: string | null;
  son: number;
  gunSet: Set<string>;
  oturum: number;
  platform: string;
  surum: string;
  giris?: string;
  konum?: { la: number; lo: number; dg?: number };
  gh: Record<string, number>;
  ilgi: Record<string, number>;
}

// ---- Tarih yardımcıları (Türkiye saati, UTC+3) -----------------------------
export const trGun = (ms = Date.now()): string => new Date(ms + 3 * 3600 * 1000).toISOString().slice(0, 10);
export const gunEkle = (g: string, n: number): string => {
  const d = new Date(g + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
export const gunFark = (a: string, b: string): number =>
  Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);
export const sonGunler = (n: number, bitis = trGun()): string[] =>
  Array.from({ length: n }, (_, i) => gunEkle(bitis, -(n - 1 - i)));
export const haftaBasi = (g: string): string => {
  const d = new Date(g + 'T00:00:00Z');
  const dow = (d.getUTCDay() + 6) % 7;
  return gunEkle(g, -dow);
};
export const kisaGun = (g: string): string => {
  const [, m, d] = g.split('-');
  return `${d}.${m}`;
};
export const yuzde = (a: number, b: number): number => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);

// ---- Kişileri birleştir ----------------------------------------------------
export function birlestir(liste: Ziyaretci[]): Kisi[] {
  const harita = new Map<string, Kisi & { sonSurumMs: number; sonKonumMs: number }>();
  for (const z of liste) {
    const anahtar = z.uid ? 'u:' + z.uid : 'v:' + z.id;
    let k = harita.get(anahtar);
    if (!k) {
      k = {
        anahtar,
        uid: z.uid,
        ilk: null,
        ilkGun: null,
        son: 0,
        gunSet: new Set(),
        oturum: 0,
        platform: z.platform || 'web',
        surum: z.surum || '',
        giris: z.giris,
        gh: {},
        ilgi: {},
        sonSurumMs: 0,
        sonKonumMs: 0,
      };
      harita.set(anahtar, k);
    }
    const gunler = Object.keys(z.gun || {});
    gunler.forEach((g) => {
      k!.gunSet.add(g);
      k!.oturum += Number(z.gun![g]?.s) || 0;
    });
    const enErken = gunler.length ? Date.parse(gunler.sort()[0] + 'T00:00:00+03:00') : null;
    const ilk = z.ilk || enErken;
    if (ilk && (k.ilk === null || ilk < k.ilk)) k.ilk = ilk;
    const son = z.son || 0;
    if (son > k.son) k.son = son;
    if (son >= k.sonSurumMs) {
      k.sonSurumMs = son;
      if (z.surum) k.surum = z.surum;
      if (z.platform) k.platform = z.platform;
    }
    if (z.konum && son >= k.sonKonumMs) {
      k.sonKonumMs = son;
      k.konum = z.konum;
    }
    if (z.giris) k.giris = z.giris;
    Object.entries(z.gh || {}).forEach(([a, v]) => (k!.gh[a] = (k!.gh[a] || 0) + (Number(v) || 0)));
    Object.entries(z.ilgi || {}).forEach(([a, v]) => (k!.ilgi[a] = (k!.ilgi[a] || 0) + (Number(v) || 0)));
  }
  const sonuc = Array.from(harita.values());
  sonuc.forEach((k) => {
    k.ilkGun = k.ilk ? trGun(k.ilk) : null;
  });
  return sonuc;
}

// ---- Aktiflik ---------------------------------------------------------------
export const aktifSerisi = (kisiler: Kisi[], gunler: string[]): number[] =>
  gunler.map((g) => kisiler.reduce((n, k) => n + (k.gunSet.has(g) ? 1 : 0), 0));

export const yeniSerisi = (kisiler: Kisi[], gunler: string[]): number[] => {
  const say = new Map<string, number>();
  kisiler.forEach((k) => k.ilkGun && say.set(k.ilkGun, (say.get(k.ilkGun) || 0) + 1));
  return gunler.map((g) => say.get(g) || 0);
};

/** Son n günde (bugün dahil) en az bir kez gelen kişi sayısı */
export const pencereAktif = (kisiler: Kisi[], n: number, bitis = trGun()): number => {
  const gunler = sonGunler(n, bitis);
  return kisiler.reduce((s, k) => s + (gunler.some((g) => k.gunSet.has(g)) ? 1 : 0), 0);
};

export interface Ozet {
  toplam: number;
  kayitli: number;
  bugun: number;
  dun: number;
  hafta: number;
  ay: number;
  yapiskanlik: number; // son 7 gün ortalama günlük aktif / aylık aktif (%)
  oturumOrt: number; // kişi başına oturum (son 30 gün)
}

export function ozetle(kisiler: Kisi[]): Ozet {
  const bugunG = trGun();
  const dunG = gunEkle(bugunG, -1);
  const [bugun, dun] = aktifSerisi(kisiler, [bugunG, dunG]);
  const ay = pencereAktif(kisiler, 30);
  const hafta = pencereAktif(kisiler, 7);
  const dau7 = aktifSerisi(kisiler, sonGunler(7));
  const ort = dau7.reduce((a, b) => a + b, 0) / 7;
  return {
    toplam: kisiler.length,
    kayitli: kisiler.filter((k) => k.uid).length,
    bugun,
    dun,
    hafta,
    ay,
    yapiskanlik: yuzde(ort, ay),
    oturumOrt: 0,
  };
}

// ---- Segmentler -------------------------------------------------------------
export type SegmentAdi = 'Yeni' | 'Düzenli' | 'Ara sıra' | 'Uyuyan' | 'Kayıp';
export const SEGMENT_ACIKLAMA: Record<SegmentAdi, string> = {
  Yeni: 'Son 7 günde ilk kez gelenler',
  Düzenli: 'Son 30 günde en az 8 gün gelenler',
  'Ara sıra': 'Son 30 günde geldi ama düzenli değil',
  Uyuyan: '31–90 gündür gelmeyenler (geri kazanma hedefi)',
  Kayıp: '90 günden uzun süredir gelmeyenler',
};

export function segmentOf(k: Kisi, bugun = trGun()): SegmentAdi {
  const gecenIlk = k.ilkGun ? gunFark(k.ilkGun, bugun) : 9999;
  if (gecenIlk <= 6) return 'Yeni';
  const son30 = sonGunler(30, bugun).filter((g) => k.gunSet.has(g)).length;
  if (son30 >= 8) return 'Düzenli';
  if (son30 >= 1) return 'Ara sıra';
  const sonGun = k.son ? trGun(k.son) : '';
  const gec = sonGun ? gunFark(sonGun, bugun) : 9999;
  return gec <= 90 ? 'Uyuyan' : 'Kayıp';
}

export function segmentSay(kisiler: Kisi[]): Record<SegmentAdi, number> {
  const s: Record<SegmentAdi, number> = { Yeni: 0, Düzenli: 0, 'Ara sıra': 0, Uyuyan: 0, Kayıp: 0 };
  const bugun = trGun();
  kisiler.forEach((k) => (s[segmentOf(k, bugun)] += 1));
  return s;
}

// ---- Elde tutma ---------------------------------------------------------------
export interface GeriDonus {
  d1: { oran: number; payda: number };
  h1: { oran: number; payda: number }; // ilk 7 günde geri dönen
  h4: { oran: number; payda: number }; // ilk 30 günde geri dönen
}

function geriDonen(kisiler: Kisi[], pencere: number): { oran: number; payda: number } {
  const bugun = trGun();
  let payda = 0;
  let evet = 0;
  kisiler.forEach((k) => {
    if (!k.ilkGun || gunFark(k.ilkGun, bugun) < pencere) return;
    payda += 1;
    for (let i = 1; i <= pencere; i++) {
      if (k.gunSet.has(gunEkle(k.ilkGun, i))) {
        evet += 1;
        return;
      }
    }
  });
  return { oran: yuzde(evet, payda), payda };
}

export function geriDonus(kisiler: Kisi[]): GeriDonus {
  return { d1: geriDonen(kisiler, 1), h1: geriDonen(kisiler, 7), h4: geriDonen(kisiler, 30) };
}

export interface KohortSatir {
  haftaBasi: string;
  boyut: number;
  hucreler: (number | null)[]; // 1..8. hafta, bitmemiş hafta = null
}

/** Haftalık kohort: ilk geldiği haftaya göre gruplanır; k. haftada tekrar gelenlerin oranı */
export function kohortlar(kisiler: Kisi[], hafta = 8, kohortSayisi = 8): KohortSatir[] {
  const bugun = trGun();
  const buHafta = haftaBasi(bugun);
  const gruplar = new Map<string, Kisi[]>();
  kisiler.forEach((k) => {
    if (!k.ilkGun) return;
    const hb = haftaBasi(k.ilkGun);
    if (!gruplar.has(hb)) gruplar.set(hb, []);
    gruplar.get(hb)!.push(k);
  });
  const anahtarlar = Array.from(gruplar.keys()).sort().slice(-kohortSayisi);
  return anahtarlar.map((hb) => {
    const uyeler = gruplar.get(hb)!;
    const hucreler: (number | null)[] = [];
    for (let h = 1; h <= hafta; h++) {
      const bas = gunEkle(hb, h * 7);
      if (bas > buHafta) {
        hucreler.push(null);
        continue;
      }
      const gunler = Array.from({ length: 7 }, (_, i) => gunEkle(bas, i));
      const geri = uyeler.filter((k) => gunler.some((g) => k.gunSet.has(g))).length;
      hucreler.push(yuzde(geri, uyeler.length));
    }
    return { haftaBasi: hb, boyut: uyeler.length, hucreler };
  });
}

// ---- Dağılımlar ---------------------------------------------------------------
export function dagilim<T>(liste: T[], anahtar: (x: T) => string | undefined, bos = 'Bilinmiyor'): { ad: string; deger: number }[] {
  const m = new Map<string, number>();
  liste.forEach((x) => {
    const a = anahtar(x) || bos;
    m.set(a, (m.get(a) || 0) + 1);
  });
  return Array.from(m, ([ad, deger]) => ({ ad, deger })).sort((a, b) => b.deger - a.deger);
}

/** Gün (Pzt–Paz) × saat etkinlik matrisi */
export function isiMatrisi(kisiler: Kisi[]): number[][] {
  const m = Array.from({ length: 7 }, () => Array(24).fill(0));
  kisiler.forEach((k) =>
    Object.entries(k.gh).forEach(([a, v]) => {
      const [d, h] = a.split('-').map(Number);
      if (d >= 0 && d < 7 && h >= 0 && h < 24) m[d][h] += v;
    })
  );
  return m;
}

export interface Hucre {
  la: number;
  lo: number;
  kisi: number;
  aktif30: number;
  /** Bu hücre ve 8 komşusu (≈150 m çevre) toplamı: gizlilik eşiği ve yoğunluk bunun üzerinden hesaplanır */
  komsu: number;
}

/** Gizlilik koruması: çevresinde (≈150 m) bu sayıdan az kişi olan hücre haritada gösterilmez. */
export const EN_AZ_KISI = 3;
/** Hücre kenarı: 0,0005° ≈ 55 m × 42 m (uygulama konumu bu adıma yuvarlar) */
export const HUCRE_DERECE = 0.0005;

export interface BolgeSonuc {
  hucreler: Hucre[];
  gizlenenHucre: number;
  gizlenenKisi: number;
  konumlu: number;
  medyanDogruluk: number | null;
}

export function bolgeHucreleri(kisiler: Kisi[]): Hucre[] {
  const m = new Map<string, Hucre & { ix: number; iy: number }>();
  const g30 = sonGunler(30);
  kisiler.forEach((k) => {
    if (!k.konum) return;
    const ix = Math.round(k.konum.la / HUCRE_DERECE);
    const iy = Math.round(k.konum.lo / HUCRE_DERECE);
    const a = `${ix}|${iy}`;
    let h = m.get(a);
    if (!h) {
      h = { la: k.konum.la, lo: k.konum.lo, kisi: 0, aktif30: 0, komsu: 0, ix, iy };
      m.set(a, h);
    }
    h.kisi += 1;
    if (g30.some((g) => k.gunSet.has(g))) h.aktif30 += 1;
  });
  m.forEach((h) => {
    let t = 0;
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) t += m.get(`${h.ix + dx}|${h.iy + dy}`)?.kisi || 0;
    h.komsu = t;
  });
  return Array.from(m.values()).sort((a, b) => b.komsu - a.komsu);
}

export function bolgeAnalizi(kisiler: Kisi[], enAz = EN_AZ_KISI): BolgeSonuc {
  const tum = bolgeHucreleri(kisiler);
  const gor = tum.filter((h) => h.komsu >= enAz);
  const gizli = tum.filter((h) => h.komsu < enAz);
  const dgler = kisiler.map((k) => k.konum?.dg).filter((d): d is number => typeof d === 'number').sort((a, b) => a - b);
  return {
    hucreler: gor,
    gizlenenHucre: gizli.length,
    gizlenenKisi: gizli.reduce((a, h) => a + h.kisi, 0),
    konumlu: kisiler.filter((k) => k.konum).length,
    medyanDogruluk: dgler.length ? dgler[Math.floor(dgler.length / 2)] : null,
  };
}

// ---- Geliş kaynağı ve sayfa görüntüleyen kişi ----------------------------------
export const KAYNAK_ETIKET: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
  google: 'Google',
  arama: 'Diğer arama motorları',
  youtube: 'YouTube',
  twitter: 'X / Twitter',
  telegram: 'Telegram',
  tiktok: 'TikTok',
  uygulama: 'Android uygulaması',
  dogrudan: 'Doğrudan / bilinmiyor',
  diger: 'Diğer siteler',
};

export const SAYFA_ETIKET: Record<string, string> = {
  anasayfa: 'Anasayfa',
  haber: 'Haber',
  'alim-satim': 'Alım Satım',
  yemek: 'Esnaf',
  hizmet: 'Hizmet',
  profil: 'Profil',
  'mp-hub': 'Hızlı işlemler',
  canli: 'Canlı yayın',
  vefat: 'Vefat / taziye',
  kesintiler: 'Kesintiler',
  muhtarlik: 'Muhtarlık',
  isler: 'İş ilanları',
  eczane: 'Nöbetçi eczane',
  ulasim: 'Ulaşım',
};

/** Aralıktaki oturumların geliş kaynağı + aralıkta ilk kez gelenlerin ilk kaynağı */
export function kaynakOzeti(zl: Ziyaretci[], gunler: string[]): {
  oturum: { ad: string; deger: number }[];
  yeni: { ad: string; deger: number }[];
  toplamOturum: number;
} {
  const g = new Set(gunler);
  const oturum = new Map<string, number>();
  const yeni = new Map<string, number>();
  zl.forEach((z) => {
    Object.entries(z.gun || {}).forEach(([gun, v]) => {
      if (!g.has(gun)) return;
      Object.entries(v.ks || {}).forEach(([k, n]) => oturum.set(k, (oturum.get(k) || 0) + (Number(n) || 0)));
    });
    if (z.ik && z.ilk && g.has(trGun(z.ilk))) yeni.set(z.ik, (yeni.get(z.ik) || 0) + 1);
  });
  const liste = (m: Map<string, number>) =>
    Array.from(m, ([k, deger]) => ({ ad: KAYNAK_ETIKET[k] || k, deger })).sort((a, b) => b.deger - a.deger);
  const o = liste(oturum);
  return { oturum: o, yeni: liste(yeni), toplamOturum: o.reduce((a, b) => a + b.deger, 0) };
}

/** Aralıkta her sayfayı gören benzersiz cihaz sayısı (aynı gün tekrar bakmak sayıyı artırmaz) */
export function sayfaGorenler(zl: Ziyaretci[], gunler: string[]): { ad: string; anahtar: string; deger: number }[] {
  const g = new Set(gunler);
  const m = new Map<string, Set<string>>();
  zl.forEach((z) => {
    Object.entries(z.gun || {}).forEach(([gun, v]) => {
      if (!g.has(gun)) return;
      Object.keys(v.pg || {}).forEach((s) => {
        if (!m.has(s)) m.set(s, new Set());
        m.get(s)!.add(z.uid ? 'u:' + z.uid : 'v:' + z.id);
      });
    });
  });
  return Array.from(m, ([anahtar, set]) => ({ anahtar, ad: SAYFA_ETIKET[anahtar] || anahtar, deger: set.size })).sort((a, b) => b.deger - a.deger);
}

export const ILGI_ETIKET: Record<string, string> = {
  sekme_anasayfa: 'Anasayfa sekmesi',
  sekme_haber: 'Haber sekmesi',
  'sekme_alim-satim': 'Alım Satım sekmesi',
  sekme_yemek: 'Esnaf sekmesi',
  sekme_hizmet: 'Hizmet sekmesi',
  sekme_profil: 'Profil sekmesi',
  hizli_hizmet: 'Hızlı işlem: Hizmet İste',
  hizli_ilan: 'Hızlı işlem: İlan Paylaş',
  hizli_ihbar: 'Hızlı işlem: Haber İhbar',
  hizli_vefat: 'Hızlı işlem: Vefat İlanı',
  hizli_davetiye: 'Hızlı işlem: Davetiye',
  modul_canli: 'Canlı yayın',
  modul_vefat: 'Vefat / taziye',
  modul_kesintiler: 'Kesintiler',
  modul_muhtarlik: 'Muhtarlık',
  modul_isler: 'İş ilanları',
  modul_eczane: 'Nöbetçi eczane',
  modul_ulasim: 'Ulaşım',
  bildirim_dokundu: 'Bildirime dokunma',
  funnel_hizmet_ac: 'Hizmet formu açıldı',
  funnel_hizmet_gonder: 'Hizmet talebi gönderildi',
  funnel_ilan_ac: 'İlan formu açıldı',
  funnel_ilan_gonder: 'İlan gönderildi',
  funnel_ihbar_ac: 'İhbar formu açıldı',
  funnel_ihbar_gonder: 'İhbar gönderildi',
  funnel_vefat_ac: 'Vefat formu açıldı',
  funnel_vefat_gonder: 'Vefat ilanı gönderildi',
  funnel_esnaf_ac: 'Esnaf başvurusu açıldı',
  funnel_esnaf_gonder: 'Esnaf başvurusu gönderildi',
  funnel_giris_ac: 'Giriş ekranı açıldı',
  funnel_giris_gonder: 'Giriş tamamlandı',
  funnel_davet_ac: 'Davetiye açıldı',
};

export function ilgiToplami(kisiler: Kisi[]): { ad: string; anahtar: string; deger: number }[] {
  const m: Record<string, number> = {};
  kisiler.forEach((k) => Object.entries(k.ilgi).forEach(([a, v]) => (m[a] = (m[a] || 0) + v)));
  return Object.entries(m)
    .map(([anahtar, deger]) => ({ anahtar, ad: ILGI_ETIKET[anahtar] || anahtar, deger }))
    .sort((a, b) => b.deger - a.deger);
}

// ---- Huniler: form açıldı → gönderildi (tüm zamanlar, toplam dokunuş) ----------------
export const HUNI_ADLARI: { anahtar: string; ad: string; tamamlanir: boolean }[] = [
  { anahtar: 'giris', ad: 'Giriş / kayıt', tamamlanir: true },
  { anahtar: 'hizmet', ad: 'Hizmet iste', tamamlanir: true },
  { anahtar: 'ilan', ad: 'İlan paylaş', tamamlanir: true },
  { anahtar: 'ihbar', ad: 'Haber ihbar', tamamlanir: true },
  { anahtar: 'vefat', ad: 'Vefat ilanı', tamamlanir: true },
  { anahtar: 'esnaf', ad: 'Esnaf başvurusu', tamamlanir: true },
  { anahtar: 'davet', ad: 'Davetiye', tamamlanir: false },
];

export function huniler(kisiler: Kisi[]): { anahtar: string; ad: string; ac: number; gonder: number; oran: number | null; kisiAc: number; kisiGonder: number }[] {
  const t = (k: string) => kisiler.reduce((a, x) => a + (x.ilgi[k] || 0), 0);
  const kisi = (k: string) => kisiler.filter((x) => (x.ilgi[k] || 0) > 0).length;
  return HUNI_ADLARI.map((h) => {
    const ac = t(`funnel_${h.anahtar}_ac`);
    const gonder = h.tamamlanir ? t(`funnel_${h.anahtar}_gonder`) : 0;
    return {
      anahtar: h.anahtar,
      ad: h.ad,
      ac,
      gonder,
      oran: h.tamamlanir && ac > 0 ? Math.min(100, Math.round((gonder / ac) * 1000) / 10) : null,
      kisiAc: kisi(`funnel_${h.anahtar}_ac`),
      kisiGonder: h.tamamlanir ? kisi(`funnel_${h.anahtar}_gonder`) : 0,
    };
  });
}

// ---- Akıllı bildirim saati: yoğunluk matrisinden önümüzdeki 24 saatin en iyi dilimi ----------
export function bildirimSaatleri(kisiler: Kisi[], simdi = Date.now()): {
  en: { gun: number; saat: number; ms: number; deger: number } | null;
  ilk3: { gun: number; saat: number; ms: number; deger: number }[];
  toplam: number;
} {
  const m = isiMatrisi(kisiler);
  const toplam = m.flat().reduce((a, b) => a + b, 0);
  if (toplam < 50) return { en: null, ilk3: [], toplam };
  const tr = new Date(simdi + 3 * 3600 * 1000);
  const adaylar: { gun: number; saat: number; ms: number; deger: number }[] = [];
  for (let i = 1; i <= 24; i++) {
    const t = new Date(tr.getTime() + i * 3600 * 1000);
    const gun = (t.getUTCDay() + 6) % 7; // 0 = Pazartesi
    const saat = t.getUTCHours();
    // Gece 23-07 arası bildirim önerilmez
    if (saat >= 23 || saat < 7) continue;
    adaylar.push({ gun, saat, ms: Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate(), saat) - 3 * 3600 * 1000, deger: m[gun][saat] });
  }
  adaylar.sort((a, b) => b.deger - a.deger);
  return { en: adaylar[0] || null, ilk3: adaylar.slice(0, 3), toplam };
}

// ---- Uyarılar ---------------------------------------------------------------------------------
export type UyariSeviye = 'kritik' | 'uyari' | 'bilgi';
export interface UyariKaydi {
  seviye: UyariSeviye;
  baslik: string;
  ayrinti: string;
  bolum?: string;
}

export function uyarilariUret(
  kisiler: Kisi[],
  onay: { ilan: number | null; vefat: number | null; esnaf: number | null; ihbar: number | null; kesinti: number | null; sikayet: number | null },
  okumaHatalari: Record<string, string>,
  hataGunlugu: { adet: number; surum?: string; gun?: Record<string, number> }[],
  simdi = Date.now()
): UyariKaydi[] {
  const u: UyariKaydi[] = [];
  const bugun = trGun(simdi);

  if (okumaHatalari.ziyaretciler || okumaHatalari.icerik) {
    u.push({ seviye: 'kritik', baslik: 'Analitik verisi okunamıyor', ayrinti: 'Firestore kuralları yayınlanmamış olabilir. Güncel firestore.rules dosyasını Firebase Console\'da yayınlayın.', bolum: 'veri' });
  }
  if ((onay.vefat || 0) > 0) {
    u.push({ seviye: 'kritik', baslik: `${onay.vefat} vefat ilanı onay bekliyor`, ayrinti: 'Vefat ilanları zamana duyarlıdır; öncelikle onaylayın.', bolum: 'onay' });
  }
  if ((onay.kesinti || 0) > 0) u.push({ seviye: 'uyari', baslik: `${onay.kesinti} kesinti bildirimi onay bekliyor`, ayrinti: 'Onaylanana kadar kullanıcılara gitmez.', bolum: 'onay' });
  if ((onay.sikayet || 0) > 0) u.push({ seviye: 'uyari', baslik: `${onay.sikayet} açık şikayet`, ayrinti: 'Kullanıcı şikayetleri inceleme bekliyor.', bolum: 'onay' });
  if ((onay.esnaf || 0) > 0) u.push({ seviye: 'bilgi', baslik: `${onay.esnaf} esnaf başvurusu bekliyor`, ayrinti: 'İşletme kaydı onay bekliyor.', bolum: 'onay' });
  if ((onay.ilan || 0) > 0) u.push({ seviye: 'bilgi', baslik: `${onay.ilan} ilan onay bekliyor`, ayrinti: 'Alım-satım ilanları onay bekliyor.', bolum: 'onay' });
  if ((onay.ihbar || 0) > 0) u.push({ seviye: 'bilgi', baslik: `${onay.ihbar} haber ihbarı bekliyor`, ayrinti: 'Editör incelemesi bekliyor.', bolum: 'onay' });

  // Veri toplama durdu mu?
  const sonGorulen = kisiler.reduce((a, k) => Math.max(a, k.son || 0), 0);
  if (kisiler.length > 0 && simdi - sonGorulen > 24 * 3600 * 1000) {
    u.push({ seviye: 'uyari', baslik: 'Son 24 saatte hiç kullanım kaydı yok', ayrinti: 'Uygulama kullanılmıyor olabilir ya da analitik yazımı durmuş olabilir (kota / kural).', bolum: 'veri' });
  }

  // Günlük aktif kullanıcı düşüşü: dünün sayısı, önceki 7 günün ortalamasının %40 altında mı?
  const gunler = sonGunler(9, bugun).slice(0, 8); // bugün hariç son 8 gün
  const ak = aktifSerisi(kisiler, gunler);
  const dun = ak[ak.length - 1];
  const onceki = ak.slice(0, -1);
  const ort = onceki.reduce((a, b) => a + b, 0) / Math.max(1, onceki.length);
  if (ort >= 10 && dun < ort * 0.6) {
    u.push({ seviye: 'uyari', baslik: 'Dünkü aktif kullanıcı sayısı düştü', ayrinti: `Dün ${dun} kişi; önceki 7 gün ortalaması ${Math.round(ort)}.`, bolum: 'genel' });
  }

  // Hata artışı: bugünkü hata sayısı
  const bugunHata = hataGunlugu.reduce((a, h) => a + (Number(h.gun?.[bugun]) || 0), 0);
  if (bugunHata >= 20) u.push({ seviye: 'uyari', baslik: `Bugün ${bugunHata} uygulama hatası kaydedildi`, ayrinti: 'Hatalar sekmesinde en sık görülenlere bakın.', bolum: 'hata' });
  return u;
}
