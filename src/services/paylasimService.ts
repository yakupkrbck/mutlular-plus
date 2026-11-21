import { Capacitor } from '@capacitor/core';

// Sosyal medya paylaşımı: izlemeli bağlantı + paylaşım kartı (görsel) üretici.
// Bağlantıdaki ?kaynak= değeri, analitikte "Trafik Kaynakları" ekranında görünür.

export const SITE_ADRESI = 'https://www.mutlularhaber.com';

export type PaylasimKanal = 'whatsapp' | 'instagram' | 'facebook' | 'telegram' | 'twitter' | 'diger';
export const KANAL_ETIKET: Record<PaylasimKanal, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  facebook: 'Facebook',
  telegram: 'Telegram',
  twitter: 'X',
  diger: 'Diğer',
};

/** Uygulama içinde pencere adresi (capacitor://localhost) paylaşılamaz; her zaman herkese açık adres kullanılır. */
export function izlemeliLink(yol: string, kanal: PaylasimKanal = 'diger', kampanya = 'kart'): string {
  const temiz = yol.startsWith('/') ? yol : `/${yol}`;
  const q = new URLSearchParams({ kaynak: kanal === 'diger' ? 'paylasim' : kanal, utm_medium: 'paylasim', utm_campaign: kampanya });
  return `${SITE_ADRESI}${temiz}?${q.toString()}`;
}

// ---- Kart üretimi ----------------------------------------------------------------------------
export type KartTuru = 'haber' | 'kesinti' | 'vefat' | 'eczane' | 'duyuru';
export type KartBicim = 'kare' | 'story';

export interface KartVeri {
  tur: KartTuru;
  baslik: string;
  altBaslik?: string;
  /** Küçük bilgi kutuları (ör. Tarih / Saat / Süre) */
  bilgiler?: { etiket: string; deger: string }[];
  gorsel?: string;
  /** Sağ üstteki etiket yerine özel metin */
  etiket?: string;
  /** Fotoğrafın dikey odağı: 0 = üst, 0.5 = orta, 1 = alt */
  gorselOdak?: number;
  /** Vefat kartında da fotoğraf kullanılsın (kullanıcı kendisi eklediyse) */
  gorselZorla?: boolean;
}

const TEMA: Record<KartTuru, { ad: string; a: string; b: string; vurgu: string }> = {
  haber: { ad: 'HABER', a: '#9f1239', b: '#1f2937', vurgu: '#fb7185' },
  kesinti: { ad: 'ELEKTRİK KESİNTİSİ', a: '#b45309', b: '#1c1917', vurgu: '#fbbf24' },
  vefat: { ad: 'VEFAT İLANI', a: '#1e293b', b: '#020617', vurgu: '#cbd5e1' },
  eczane: { ad: 'NÖBETÇİ ECZANE', a: '#047857', b: '#022c22', vurgu: '#6ee7b7' },
  duyuru: { ad: 'DUYURU', a: '#1d4ed8', b: '#172554', vurgu: '#93c5fd' },
};

const BOYUT: Record<KartBicim, [number, number]> = { kare: [1080, 1080], story: [1080, 1920] };
const FONT = '"Inter","Segoe UI",Roboto,Helvetica,Arial,sans-serif';

function gorselYukle(url?: string): Promise<HTMLImageElement | null> {
  return new Promise((coz) => {
    if (!url) return coz(null);
    const im = new Image();
    im.crossOrigin = 'anonymous'; // CORS izni yoksa yüklenmez; kart görselsiz üretilir
    im.onload = () => coz(im);
    im.onerror = () => coz(null);
    im.src = url;
    setTimeout(() => coz(null), 6000);
  });
}

function satirlaraBol(ctx: CanvasRenderingContext2D, metin: string, genislik: number): string[] {
  const kelimeler = metin.replace(/\s+/g, ' ').trim().split(' ');
  const satirlar: string[] = [];
  let satir = '';
  for (const k of kelimeler) {
    const dene = satir ? `${satir} ${k}` : k;
    if (ctx.measureText(dene).width > genislik && satir) {
      satirlar.push(satir);
      satir = k;
    } else satir = dene;
  }
  if (satir) satirlar.push(satir);
  return satirlar;
}

function yuvarlakDikdortgen(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function kartUret(v: KartVeri, bicim: KartBicim = 'kare'): Promise<Blob> {
  const [W, H] = BOYUT[bicim];
  const tema = TEMA[v.tur];
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  const PAD = 72;

  // Zemin
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, tema.a);
  g.addColorStop(1, tema.b);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const im = v.tur === 'vefat' && !v.gorselZorla ? null : await gorselYukle(v.gorsel); // vefat kartında kullanıcı kendi eklemedikçe fotoğraf kullanılmaz
  if (im) {
    const oran = Math.max(W / im.width, (H * 0.62) / im.height);
    const iw = im.width * oran;
    const ih = im.height * oran;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, H * 0.62);
    ctx.clip();
    ctx.drawImage(im, (W - iw) / 2, (H * 0.62 - ih) * (v.gorselOdak ?? 0.5), iw, ih);
    ctx.restore();
    const ort = ctx.createLinearGradient(0, H * 0.25, 0, H * 0.7);
    ort.addColorStop(0, 'rgba(0,0,0,0)');
    ort.addColorStop(1, tema.b);
    ctx.fillStyle = ort;
    ctx.fillRect(0, 0, W, H * 0.7);
    ctx.fillStyle = tema.b;
    ctx.fillRect(0, H * 0.7 - 1, W, H);
  }

  // Üst şerit: marka + etiket
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  yuvarlakDikdortgen(ctx, PAD, PAD, 78, 78, 22);
  ctx.fill();
  ctx.fillStyle = '#0a0a0a';
  ctx.font = `900 36px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('M', PAD + 29, PAD + 41);
  ctx.fillStyle = '#e11d48';
  ctx.fillText('P', PAD + 55, PAD + 41);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 34px ${FONT}`;
  ctx.fillText('Mutlular Plus', PAD + 98, PAD + 40);

  const etiket = v.etiket || tema.ad;
  ctx.font = `900 28px ${FONT}`;
  const ew = ctx.measureText(etiket).width + 48;
  ctx.fillStyle = tema.vurgu;
  yuvarlakDikdortgen(ctx, W - PAD - ew, PAD + 12, ew, 54, 27);
  ctx.fill();
  ctx.fillStyle = '#111827';
  ctx.textAlign = 'center';
  ctx.fillText(etiket, W - PAD - ew / 2, PAD + 40);
  ctx.textAlign = 'left';

  // Alt blok yüksekliğini önce hesapla (aşağıdan yukarı yerleşim)
  const altSerit = 150;
  let y = H - altSerit;

  // Bilgi kutuları
  const bilgiler = (v.bilgiler || []).slice(0, 3);
  let bilgiYuk = 0;
  if (bilgiler.length) {
    bilgiYuk = 150;
    y -= bilgiYuk + 28;
  }

  // Başlık: sığana kadar küçült
  const metinGen = W - PAD * 2;
  const baslikAlan = (bicim === 'story' ? 560 : 330);
  let fs = bicim === 'story' ? 84 : 72;
  let satirlar: string[] = [];
  for (; fs >= 40; fs -= 4) {
    ctx.font = `900 ${fs}px ${FONT}`;
    satirlar = satirlaraBol(ctx, v.baslik, metinGen);
    if (satirlar.length * fs * 1.14 <= baslikAlan) break;
  }
  satirlar = satirlar.slice(0, Math.floor(baslikAlan / (fs * 1.14)));
  const baslikYuk = satirlar.length * fs * 1.14;

  let altSatirlar: string[] = [];
  let altYuk = 0;
  if (v.altBaslik) {
    ctx.font = `500 ${bicim === 'story' ? 38 : 34}px ${FONT}`;
    altSatirlar = satirlaraBol(ctx, v.altBaslik, metinGen).slice(0, bicim === 'story' ? 4 : 2);
    altYuk = altSatirlar.length * (bicim === 'story' ? 52 : 46) + 20;
  }

  const blokUst = y - altYuk - baslikYuk;
  ctx.fillStyle = tema.vurgu;
  ctx.fillRect(PAD, blokUst - 28, 96, 8);

  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${fs}px ${FONT}`;
  ctx.textBaseline = 'top';
  satirlar.forEach((s, i) => ctx.fillText(s, PAD, blokUst + i * fs * 1.14));

  if (altSatirlar.length) {
    const lh = bicim === 'story' ? 52 : 46;
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.font = `500 ${bicim === 'story' ? 38 : 34}px ${FONT}`;
    altSatirlar.forEach((s, i) => ctx.fillText(s, PAD, blokUst + baslikYuk + 20 + i * lh));
  }

  if (bilgiler.length) {
    const kg = (metinGen - (bilgiler.length - 1) * 20) / bilgiler.length;
    bilgiler.forEach((b, i) => {
      const x = PAD + i * (kg + 20);
      const by = H - altSerit - bilgiYuk;
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      yuvarlakDikdortgen(ctx, x, by, kg, bilgiYuk, 28);
      ctx.fill();
      ctx.fillStyle = tema.vurgu;
      ctx.font = `800 24px ${FONT}`;
      ctx.fillText(b.etiket.toLocaleUpperCase('tr-TR'), x + 28, by + 26);
      ctx.fillStyle = '#ffffff';
      let bf = 44;
      ctx.font = `900 ${bf}px ${FONT}`;
      while (ctx.measureText(b.deger).width > kg - 56 && bf > 24) {
        bf -= 2;
        ctx.font = `900 ${bf}px ${FONT}`;
      }
      ctx.fillText(b.deger, x + 28, by + 74);
    });
  }

  // Alt şerit
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, H - altSerit + 30, W, altSerit - 30);
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 34px ${FONT}`;
  ctx.fillText('mutlularhaber.com', PAD, H - 60);
  ctx.textAlign = 'right';
  ctx.fillStyle = tema.vurgu;
  ctx.font = `700 28px ${FONT}`;
  ctx.fillText('Mahallenin haber ve hizmet uygulaması', W - PAD, H - 60);

  return new Promise((coz, red) => c.toBlob((b) => (b ? coz(b) : red(new Error('Görsel üretilemedi'))), 'image/jpeg', 0.92));
}

// ---- Paylaşma / indirme ---------------------------------------------------------------------
const blobBase64 = (b: Blob): Promise<string> =>
  new Promise((coz, red) => {
    const r = new FileReader();
    r.onload = () => coz(String(r.result).split(',')[1] || '');
    r.onerror = () => red(r.error);
    r.readAsDataURL(b);
  });

export type PaylasimSonuc = 'paylasildi' | 'indirildi' | 'iptal' | 'hata';

export async function kartPaylas(blob: Blob, metin: string, url: string, dosyaAdi = 'mutlular-plus-kart.jpg'): Promise<PaylasimSonuc> {
  try {
    if (Capacitor.isNativePlatform()) {
      const [{ Filesystem, Directory }, { Share }] = await Promise.all([import('@capacitor/filesystem'), import('@capacitor/share')]);
      const yaz = await Filesystem.writeFile({ path: dosyaAdi, data: await blobBase64(blob), directory: Directory.Cache });
      await Share.share({ title: 'Mutlular Plus', text: `${metin}\n${url}`, files: [yaz.uri], dialogTitle: 'Paylaş' });
      return 'paylasildi';
    }
    const dosya = new File([blob], dosyaAdi, { type: blob.type });
    const nav: any = navigator;
    if (nav.canShare?.({ files: [dosya] })) {
      await nav.share({ files: [dosya], text: `${metin}\n${url}` });
      return 'paylasildi';
    }
    indir(blob, dosyaAdi);
    return 'indirildi';
  } catch (e: any) {
    if (e?.name === 'AbortError' || /cancel/i.test(String(e?.message))) return 'iptal';
    console.warn('Kart paylaşılamadı', e);
    return 'hata';
  }
}

export function indir(blob: Blob, dosyaAdi = 'mutlular-plus-kart.jpg'): void {
  const u = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = u;
  a.download = dosyaAdi;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 4000);
}

/** Paylaşım metni: başlık + kısa özet + bağlantı (+ etiketler) */
export function paylasimMetni(baslik: string, ozet: string | undefined, link: string, kanal: PaylasimKanal): string {
  const kisa = (ozet || '').trim();
  const govde = [baslik, kisa && kisa !== baslik ? (kisa.length > 180 ? kisa.slice(0, 177) + '…' : kisa) : ''].filter(Boolean).join('\n\n');
  const etiket = kanal === 'instagram' || kanal === 'twitter' ? '\n\n#MutlularPlus #Mutlular #Bursa #Osmangazi' : '';
  return `${govde}\n\n${link}${etiket}`;
}
