// Görsel / video boyutu yardımcıları

/** Yüklemeden ÖNCE: fotoğrafı en uzun kenarı `maks` px olacak şekilde küçültüp JPEG'e sıkıştırır. Küçülmüyorsa aynısını döndürür. */
export async function gorselKucult(dataUrl: string, maks = 1600, kalite = 0.82): Promise<string> {
  try {
    if (!dataUrl.startsWith('data:image/') || /^data:image\/(gif|svg)/.test(dataUrl)) return dataUrl;
    const img = await new Promise<HTMLImageElement>((coz, red) => {
      const i = new Image();
      i.onload = () => coz(i);
      i.onerror = red;
      i.src = dataUrl;
    });
    const oran = Math.min(1, maks / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * oran));
    const h = Math.max(1, Math.round(img.naturalHeight * oran));
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    if (!ctx) return dataUrl;
    ctx.fillStyle = '#fff'; // şeffaf PNG'ler JPEG'de siyah olmasın
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const yeni = c.toDataURL('image/jpeg', kalite);
    return yeni.length < dataUrl.length ? yeni : dataUrl;
  } catch {
    return dataUrl;
  }
}

/** Dosyayı okuyup küçültülmüş data: URL döndürür */
export async function dosyadanKucukGorsel(f: File, maks = 1600): Promise<string> {
  const ham = await new Promise<string>((coz, red) => {
    const r = new FileReader();
    r.onload = () => coz(String(r.result));
    r.onerror = () => red(new Error('Dosya okunamadı.'));
    r.readAsDataURL(f);
  });
  return gorselKucult(ham, maks);
}

const CLD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(?!(?:[a-z]{1,3}_[^/]+,?)+\/)(.+)$/;

/** Cloudinary fotoğrafını okurken küçük/hafif sürümüne çevirir (otomatik format + kalite). Başka adresler değişmez. */
export function hafifGorsel(url: string | undefined, genislik = 1080): string {
  if (!url) return '';
  const m = url.match(CLD);
  return m ? `${m[1]}f_auto,q_auto,w_${genislik},c_limit/${m[2]}` : url;
}

/** Cloudinary videosunu okurken daha düşük çözünürlük/bit hızıyla ister. Hata olursa oynatıcı özgün adrese döner. */
export function hafifVideo(url: string | undefined, genislik = 854): string {
  if (!url) return '';
  const m = url.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/)(v\d+\/.+)$/);
  return m ? `${m[1]}q_auto,w_${genislik},c_limit/${m[2]}` : url;
}

// ---- Haber metni blokları ---------------------------------------------------------------------
// Metin düz string olarak saklanır (eski haberler bozulmaz). Paragraflar boş satırla ayrılır;
// görsel bloğu tek satırdır:  [[img:https://...|Alt yazı]]
export type HaberBlok = { t: 'p'; metin: string } | { t: 'img'; url: string; yazi: string };

const IMG_SATIR = /^\[\[img:(https?:\/\/[^\s|\]]+)(?:\|([^\]]*))?\]\]$/;

export function blokAyir(icerik: string | undefined): HaberBlok[] {
  return (icerik || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p): HaberBlok => {
      const m = p.match(IMG_SATIR);
      return m ? { t: 'img', url: m[1], yazi: (m[2] || '').trim() } : { t: 'p', metin: p };
    });
}

export function blokBirlestir(bloklar: HaberBlok[]): string {
  return bloklar
    .map((b) => (b.t === 'img' ? `[[img:${b.url}${b.yazi ? '|' + b.yazi.replace(/[\]|\n]/g, ' ') : ''}]]` : b.metin.trim()))
    .filter(Boolean)
    .join('\n\n');
}

/** Bildirim / arama / özet gibi yerlerde görsel işaretlerini çıkarır */
export const metinOnizleme = (icerik: string | undefined): string =>
  (icerik || '').replace(/\[\[img:[^\]]*\]\]/g, '').replace(/\n{3,}/g, '\n\n').trim();
