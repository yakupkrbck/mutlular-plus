import { Capacitor } from '@capacitor/core';
import '@fontsource/anton/latin-400.css';
import '@fontsource/anton/latin-ext-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-ext-500.css';
import '@fontsource/inter/latin-800.css';
import '@fontsource/inter/latin-ext-800.css';

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
export type KartTuru = 'haber' | 'kesinti' | 'vefat' | 'eczane' | 'duyuru' | 'ilan';
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
}

const TEMA: Record<KartTuru, { ad: string; a: string; b: string; vurgu: string; pill: string }> = {
  haber: { ad: 'HABER', a: '#1b1020', b: '#070b12', vurgu: '#ffd21f', pill: '#e60f0f' },
  kesinti: { ad: 'ELEKTRİK KESİNTİSİ', a: '#2a1a05', b: '#0a0907', vurgu: '#fbbf24', pill: '#d97706' },
  vefat: { ad: 'VEFAT İLANI', a: '#1e293b', b: '#05080f', vurgu: '#e2e8f0', pill: '#475569' },
  eczane: { ad: 'NÖBETÇİ ECZANE', a: '#053b2c', b: '#04110d', vurgu: '#4ade80', pill: '#059669' },
  duyuru: { ad: 'DUYURU', a: '#15286b', b: '#060b1f', vurgu: '#7dd3fc', pill: '#2563eb' },
  ilan: { ad: 'ÖNE ÇIKAN İLAN', a: '#0b3b3a', b: '#031312', vurgu: '#5eead4', pill: '#0d9488' },
};

const BOYUT: Record<KartBicim, [number, number]> = { kare: [1080, 1080], story: [1080, 1920] };
// Yazı tipleri uygulamayla birlikte paketlenir (cihazın yazı tipine bağlı kalmasın)
const FONT = '"Inter","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
const FONT_DAR = '"Anton","Impact","Arial Narrow",sans-serif';
const TR = (s: string) => s.toLocaleUpperCase('tr-TR');

async function fontlarHazir(): Promise<void> {
  try {
    const f = (document as any).fonts;
    if (!f?.load) return;
    const ornek = 'İŞĞÇÖÜışğ Aa';
    await Promise.all([f.load('40px "Anton"', ornek), f.load('500 30px "Inter"', ornek), f.load('800 30px "Inter"', ornek)]);
  } catch {
    /* yazı tipi yüklenemezse yedek yazı tipiyle çizilir */
  }
}

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

type Kelime = { t: string; vurgu: boolean };

/** Başlıktaki tırnak içi ifadeler ve rakamlı kelimeler vurgulanır; hiçbiri yoksa son satır vurgulanır. */
function baslikKelimeleri(baslik: string): { kelimeler: Kelime[]; isaretli: boolean } {
  let ic = false;
  const kelimeler = TR(baslik.replace(/\s+/g, ' ').trim())
    .split(' ')
    .map((t) => {
      if (/^[“"‘]/.test(t)) ic = true;
      const v = ic || /\d/.test(t);
      if (/[”"’]$/.test(t) && !/^[’]/.test(t)) ic = false;
      return { t, vurgu: v };
    });
  const isaretli = kelimeler.some((k) => k.vurgu) && kelimeler.some((k) => !k.vurgu);
  return { kelimeler, isaretli };
}

function kelimeSatirlari(ctx: CanvasRenderingContext2D, kelimeler: Kelime[], genislik: number): Kelime[][] {
  const satirlar: Kelime[][] = [];
  let satir: Kelime[] = [];
  for (const k of kelimeler) {
    const dene = [...satir, k].map((x) => x.t).join(' ');
    if (ctx.measureText(dene).width > genislik && satir.length) {
      satirlar.push(satir);
      satir = [k];
    } else satir.push(k);
  }
  if (satir.length) satirlar.push(satir);
  return satirlar;
}

export async function kartUret(v: KartVeri, bicim: KartBicim = 'kare'): Promise<Blob> {
  const [W, H] = BOYUT[bicim];
  const tema = TEMA[v.tur];
  const story = bicim === 'story';
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  await fontlarHazir();

  // Zemin
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, tema.a);
  g.addColorStop(1, tema.b);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const im = await gorselYukle(v.gorsel); // vefat kartında fotoğraf yalnızca yönetici stüdyodan eklerse gelir
  const bilgiler = (v.bilgiler || []).slice(0, 3);
  const bilgiYuk = bilgiler.length ? 150 : 0;

  // ---- Fotoğraf kutusu (yuvarlak köşeli)
  const M = 40;
  const py = 40;
  const pw = W - M * 2;
  const ph = story ? (bilgiYuk ? 760 : 880) : bilgiYuk ? 340 : Math.round(H * 0.42);
  ctx.save();
  yuvarlakDikdortgen(ctx, M, py, pw, ph, 36);
  ctx.clip();
  if (im) {
    const oran = Math.max(pw / im.width, ph / im.height);
    const iw = im.width * oran;
    const ih = im.height * oran;
    try {
      ctx.filter = v.tur === 'vefat' ? 'none' : 'contrast(1.1) saturate(1.25)'; // vefatta renk oynatılmaz; eski iOS Safari'de yok sayılır
    } catch {
      /* desteklenmiyorsa filtresiz */
    }
    ctx.drawImage(im, M + (pw - iw) / 2, py + (v.tur === 'vefat' ? (ph - ih) * 0.2 : (ph - ih) / 2), iw, ih); // vefatta yüz kırpılmasın diye görsel yukarı hizalı
    ctx.filter = 'none';
  } else {
    const gg = ctx.createLinearGradient(M, py, M + pw, py + ph);
    gg.addColorStop(0, tema.pill);
    gg.addColorStop(1, tema.a);
    ctx.fillStyle = gg;
    ctx.fillRect(M, py, pw, ph);
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.font = `400 ${Math.round(ph * 0.55)}px ${FONT_DAR}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MP', W / 2, py + ph / 2);
    ctx.textAlign = 'left';
  }
  ctx.restore();

  // Marka (fotoğrafın sol üstü)
  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  yuvarlakDikdortgen(ctx, M + 28, py + 28, 68, 68, 20);
  ctx.fill();
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.font = `800 31px ${FONT}`;
  ctx.fillStyle = '#0a0a0a';
  ctx.fillText('M', M + 28 + 25, py + 28 + 36);
  ctx.fillStyle = '#e11d48';
  ctx.fillText('P', M + 28 + 48, py + 28 + 36);

  // ---- Etiket (haberin kategorisi / kartın türü) — fotoğrafın alt kenarında ortada
  const etiket = TR((v.etiket || tema.ad).trim());
  let ef = story ? 54 : 46;
  ctx.font = `800 ${ef}px ${FONT}`;
  while (ctx.measureText(etiket).width + 80 > W - 120 && ef > 26) {
    ef -= 2;
    ctx.font = `800 ${ef}px ${FONT}`;
  }
  const ew = ctx.measureText(etiket).width + 80;
  const eh = Math.round(ef * 1.85);
  const ex = (W - ew) / 2;
  const ey = py + ph - eh / 2;
  ctx.fillStyle = tema.pill;
  yuvarlakDikdortgen(ctx, ex, ey, ew, eh, 18);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillText(etiket, W / 2, ey + eh / 2 + 2);

  // ---- Başlık + özet: kalan alana sığacak şekilde
  const altLimit = story ? H - 380 : H - 100; // story'de alt ~380 px link alanı
  const PAD = 70;
  const metinGen = W - PAD * 2;
  const ust = ey + eh + (story ? 40 : 28);
  const bos = altLimit - ust - (bilgiYuk ? bilgiYuk + 24 : 0);

  const { kelimeler, isaretli } = baslikKelimeleri(v.baslik);
  const ozetMetin = (v.altBaslik || '').replace(/\s+/g, ' ').trim();
  const cumleler = ozetMetin.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) || [];
  const ozetSatirYuk = story ? 48 : 40;
  const ozetFs = story ? 32 : 27;
  const enFazlaOzet = story ? 3 : 2;

  let fs = story ? 132 : 92;
  let satirlar: Kelime[][] = [];
  let ozetNormal: string[] = [];
  let ozetVurgu: string[] = [];
  for (; fs >= 52; fs -= 4) {
    ctx.font = `400 ${fs}px ${FONT_DAR}`;
    satirlar = kelimeSatirlari(ctx, kelimeler, metinGen);
    if (satirlar.length > 3 && fs > 52) continue;
    // özet
    ozetNormal = [];
    ozetVurgu = [];
    if (cumleler.length) {
      ctx.font = `500 ${ozetFs}px ${FONT}`;
      const vurguCumle = cumleler.length >= 2 ? cumleler[cumleler.length - 1] : '';
      const normal = cumleler.length >= 2 ? cumleler.slice(0, -1).join(' ') : cumleler.join(' ');
      ctx.font = `800 ${ozetFs}px ${FONT}`;
      ozetVurgu = vurguCumle ? satirlaraBol(ctx, vurguCumle, metinGen).slice(0, enFazlaOzet) : [];
      ctx.font = `500 ${ozetFs}px ${FONT}`;
      const tumNormal = satirlaraBol(ctx, normal, metinGen);
      const izin = Math.max(0, enFazlaOzet - ozetVurgu.length);
      ozetNormal = tumNormal.slice(0, izin);
      if (tumNormal.length > izin && ozetNormal.length) ozetNormal[ozetNormal.length - 1] = ozetNormal[ozetNormal.length - 1].replace(/[\s.,;:]+$/, '') + '…';
    }
    const yuk = Math.min(satirlar.length, 3) * fs * 1.08 + ((ozetNormal.length + ozetVurgu.length) ? 18 + (ozetNormal.length + ozetVurgu.length) * ozetSatirYuk : 0);
    if (yuk <= bos) break;
  }
  if (satirlar.length > 3) {
    satirlar = satirlar.slice(0, 3);
    const son = satirlar[2];
    son[son.length - 1] = { ...son[son.length - 1], t: son[son.length - 1].t + '…' };
  }
  const lh = fs * 1.08;
  let y = ust;
  ctx.textBaseline = 'alphabetic';
  ctx.font = `400 ${fs}px ${FONT_DAR}`;
  satirlar.forEach((s, i) => {
    const sonSatir = i === satirlar.length - 1;
    const hepsi = s.map((k) => k.t).join(' ');
    const bosGen = ctx.measureText(' ').width;
    const toplam = ctx.measureText(hepsi).width;
    let x = (W - toplam) / 2;
    ctx.textAlign = 'left';
    s.forEach((k) => {
      const vurgulu = isaretli ? k.vurgu : satirlar.length >= 2 && sonSatir;
      ctx.fillStyle = vurgulu ? tema.vurgu : '#ffffff';
      ctx.fillText(k.t, x, y + (i + 1) * lh - fs * 0.15);
      x += ctx.measureText(k.t).width + bosGen;
    });
  });
  y += satirlar.length * lh + 18;

  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';
  ctx.font = `500 ${ozetFs}px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ozetNormal.forEach((s, i) => ctx.fillText(s, W / 2, y + i * ozetSatirYuk));
  y += ozetNormal.length * ozetSatirYuk;
  ctx.font = `800 ${ozetFs}px ${FONT}`;
  ctx.fillStyle = tema.vurgu;
  ozetVurgu.forEach((s, i) => ctx.fillText(s, W / 2, y + i * ozetSatirYuk));
  ctx.textAlign = 'left';

  // Bilgi kutuları (tarih / saat / süre)
  if (bilgiler.length) {
    const kg = (metinGen - (bilgiler.length - 1) * 20) / bilgiler.length;
    bilgiler.forEach((b, i) => {
      const x = PAD + i * (kg + 20);
      const by = altLimit - bilgiYuk;
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      yuvarlakDikdortgen(ctx, x, by, kg, bilgiYuk, 28);
      ctx.fill();
      ctx.fillStyle = tema.vurgu;
      ctx.font = `800 24px ${FONT}`;
      ctx.fillText(b.etiket.toLocaleUpperCase('tr-TR'), x + 28, by + 26);
      ctx.fillStyle = '#ffffff';
      let bf = 44;
      ctx.font = `800 ${bf}px ${FONT}`;
      while (ctx.measureText(b.deger).width > kg - 56 && bf > 24) {
        bf -= 2;
        ctx.font = `800 ${bf}px ${FONT}`;
      }
      ctx.fillText(b.deger, x + 28, by + 74);
    });
  }

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  if (story) {
    // Link alanı: boş bırakılır; Instagram link çıkartması buraya yerleştirilir
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 38px ${FONT}`;
    ctx.fillText('DETAYLAR LİNKTE', W / 2, H - 330);
    ctx.font = `800 52px ${FONT}`;
    ctx.fillText('↓', W / 2, H - 268);
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    yuvarlakDikdortgen(ctx, 150, H - 215, W - 300, 130, 65);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.stroke();
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = `800 24px ${FONT}`;
    ctx.fillText('mutlularhaber.com', W / 2, H - 44);
  }
  ctx.textAlign = 'left';

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
