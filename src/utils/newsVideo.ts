// Haber videosu yardımcıları: YouTube bağlantısı, Cloudinary videosu ve doğrudan dosya bağlantısı

export const youtubeId = (url: string): string | null => {
  const m = String(url || '').match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/
  );
  return m ? m[1] : null;
};

/** Video için kapak görseli: YouTube küçük resmi veya Cloudinary'nin ilk karesi. Bulunamazsa boş döner. */
export const videoPoster = (url: string): string => {
  const yt = youtubeId(url);
  if (yt) return `https://img.youtube.com/vi/${yt}/hqdefault.jpg`;
  if (/res\.cloudinary\.com\/.+\/video\/upload\//.test(url)) {
    return url
      .replace('/video/upload/', '/video/upload/so_0,w_1200,c_limit/')
      .replace(/\.[a-z0-9]+(\?.*)?$/i, '.jpg');
  }
  return '';
};

export const isVideoFileUrl = (url: string): boolean => /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url);
