import { auth } from '../firebase';
import { API_BASE } from '../config/api';

// Gerçek dosya yükleme: Cloudinary.
// 1) Tercih edilen yol: Worker'dan giriş doğrulamalı İMZA alınır (gizli anahtar repoda/istemcide yok).
// 2) Worker henüz yapılandırılmadıysa (503/404) eski imzasız ön ayara düşülür; bu yalnızca geçiş içindir.
const CLOUD_NAME = 'dn2wanvcr';
const UNSIGNED_PRESET = 'mutlular_haber';

interface Signature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  allowedFormats: string;
  signature: string;
}

async function getSignature(): Promise<Signature | null> {
  const user = auth.currentUser;
  if (!user) throw new Error('Fotoğraf yüklemek için giriş yapmalısınız.');
  const token = await user.getIdToken();
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/upload-signature`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return null; // Worker'a ulaşılamadı: geçiş yolu
  }
  if (res.status === 503 || res.status === 404) return null; // henüz yapılandırılmamış
  if (res.status === 401) throw new Error('Oturumunuz doğrulanamadı. Çıkış yapıp tekrar girin.');
  if (res.status === 429) throw new Error('Çok fazla yükleme yapıldı. Biraz sonra tekrar deneyin.');
  if (!res.ok) throw new Error('Yükleme izni alınamadı.');
  return (await res.json()) as Signature;
}

export const uploadDataUrl = async (dataUrl: string): Promise<string> => {
  if (!dataUrl.startsWith('data:image/')) {
    throw new Error('Yalnızca fotoğraf yüklenebilir.');
  }
  const sig = await getSignature();
  const fd = new FormData();
  fd.append('file', dataUrl);
  if (sig) {
    fd.append('api_key', sig.apiKey);
    fd.append('timestamp', String(sig.timestamp));
    fd.append('signature', sig.signature);
    fd.append('folder', sig.folder);
    fd.append('allowed_formats', sig.allowedFormats);
  } else {
    console.warn('[upload] İmzalı yükleme yapılandırılmamış, imzasız ön ayar kullanılıyor.');
    fd.append('upload_preset', UNSIGNED_PRESET);
  }
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: fd,
  });
  if (!res.ok) throw new Error('Fotoğraf yüklenemedi. İnternet bağlantınızı kontrol edin.');
  const json = await res.json();
  return json.secure_url as string;
};

export const uploadFile = async (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => uploadDataUrl(String(r.result)).then(resolve, reject);
    r.onerror = () => reject(new Error('Dosya okunamadı.'));
    r.readAsDataURL(file);
  });

const isBigDataUrl = (v: unknown): v is string =>
  typeof v === 'string' && /^data:image\//.test(v) && v.length > 2000;

// Bir nesnenin içindeki tüm data: fotoğraf değerlerini Cloudinary'ye yükleyip URL ile değiştirir.
export const uploadDataUrlsDeep = async <T,>(value: T, cache = new Map<string, Promise<string>>()): Promise<T> => {
  if (isBigDataUrl(value)) {
    if (!cache.has(value)) cache.set(value, uploadDataUrl(value));
    return (await cache.get(value)) as unknown as T;
  }
  if (Array.isArray(value)) {
    return (await Promise.all(value.map((v) => uploadDataUrlsDeep(v, cache)))) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const entries = await Promise.all(
      Object.entries(value as Record<string, unknown>).map(async ([k, v]) => [k, await uploadDataUrlsDeep(v, cache)] as const)
    );
    return Object.fromEntries(entries) as T;
  }
  return value;
};
