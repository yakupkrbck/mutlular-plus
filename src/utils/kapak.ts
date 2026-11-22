// Haber videosu kapak görseli üretimi (16:9, 1280×720)

export interface KapakSecenek {
  /** Taban görsel (data: URL ya da CORS izinli adres). Yoksa renkli zemin kullanılır. */
  taban?: string | null;
  baslik: string;
  kategori: string;
  baslikGoster: boolean;
  etiketGoster: boolean;
  logoGoster: boolean;
}

const FONT = '"Inter","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
const W = 1280;
const H = 720;

function yukle(src: string): Promise<HTMLImageElement | null> {
  return new Promise((coz) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => coz(im);
    im.onerror = () => coz(null);
    im.src = src;
    setTimeout(() => coz(null), 8000);
  });
}

function sar(ctx: CanvasRenderingContext2D, metin: string, gen: number): string[] {
  const k = metin.replace(/\s+/g, ' ').trim().split(' ');
  const s: string[] = [];
  let satir = '';
  for (const w of k) {
    const dene = satir ? `${satir} ${w}` : w;
    if (ctx.measureText(dene).width > gen && satir) {
      s.push(satir);
      satir = w;
    } else satir = dene;
  }
  if (satir) s.push(satir);
  return s;
}

function yd(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Seçeneklere göre kapağı çizer; JPEG data: URL döndürür. */
export async function kapakUret(o: KapakSecenek): Promise<string> {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#9f1239');
  g.addColorStop(1, '#1f2937');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const im = o.taban ? await yukle(o.taban) : null;
  if (o.taban && !im) throw new Error('Görsel okunamadı (başka siteden geliyor olabilir). Dosya olarak yükleyin.');
  if (im) {
    const oran = Math.max(W / im.width, H / im.height);
    const iw = im.width * oran;
    const ih = im.height * oran;
    ctx.drawImage(im, (W - iw) / 2, (H - ih) / 2, iw, ih);
  }

  const baslikVar = o.baslikGoster && o.baslik.trim();
  if (baslikVar || o.etiketGoster) {
    const k = ctx.createLinearGradient(0, H * 0.35, 0, H);
    k.addColorStop(0, 'rgba(0,0,0,0)');
    k.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = k;
    ctx.fillRect(0, H * 0.35, W, H * 0.65);
  }

  ctx.textBaseline = 'top';
  const PAD = 56;
  let y = H - PAD;
  if (baslikVar) {
    let fs = 60;
    let satirlar: string[] = [];
    for (; fs >= 34; fs -= 4) {
      ctx.font = `900 ${fs}px ${FONT}`;
      satirlar = sar(ctx, o.baslik, W - PAD * 2 - 40);
      if (satirlar.length <= 3) break;
    }
    satirlar = satirlar.slice(0, 3);
    const yuk = satirlar.length * fs * 1.15;
    y -= yuk;
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 12;
    satirlar.forEach((s, i) => ctx.fillText(s, PAD, y + i * fs * 1.15));
    ctx.shadowBlur = 0;
    y -= 18;
  }
  if (o.etiketGoster && o.kategori.trim()) {
    const t = o.kategori.toLocaleUpperCase('tr-TR');
    ctx.font = `900 26px ${FONT}`;
    const w = ctx.measureText(t).width + 36;
    y -= 46;
    ctx.fillStyle = '#e11d48';
    yd(ctx, PAD, y, w, 46, 10);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'middle';
    ctx.fillText(t, PAD + 18, y + 24);
    ctx.textBaseline = 'top';
  }

  if (o.logoGoster) {
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    yd(ctx, W - PAD - 64, PAD - 10, 64, 64, 18);
    ctx.fill();
    ctx.font = `900 30px ${FONT}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0a0a0a';
    ctx.fillText('M', W - PAD - 42, PAD + 23);
    ctx.fillStyle = '#e11d48';
    ctx.fillText('P', W - PAD - 20, PAD + 23);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  // Oynat simgesi her zaman çizilir
  {
    const cx = W / 2;
    const cy = H / 2 - (baslikVar ? 30 : 0);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.arc(cx, cy, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy - 34);
    ctx.lineTo(cx - 20, cy + 34);
    ctx.lineTo(cx + 38, cy);
    ctx.closePath();
    ctx.fill();
  }
  return c.toDataURL('image/jpeg', 0.88);
}

/** Dosyayı okuyup data: URL döndürür */
export const dosyaOku = (f: File): Promise<string> =>
  new Promise((coz, red) => {
    const r = new FileReader();
    r.onload = () => coz(String(r.result));
    r.onerror = () => red(new Error('Dosya okunamadı.'));
    r.readAsDataURL(f);
  });
