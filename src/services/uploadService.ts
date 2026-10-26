// Gerçek dosya yükleme: Cloudinary (unsigned preset). Firebase Storage kullanılmıyor (Spark planı).
const CLOUD_NAME = 'dn2wanvcr';
const UPLOAD_PRESET = 'mutlular_haber';

export const uploadDataUrl = async (dataUrl: string): Promise<string> => {
  const isVideo = dataUrl.startsWith('data:video');
  const fd = new FormData();
  fd.append('file', dataUrl);
  fd.append('upload_preset', UPLOAD_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${isVideo ? 'video' : 'image'}/upload`,
    { method: 'POST', body: fd }
  );
  if (!res.ok) throw new Error('Dosya yüklenemedi. İnternet bağlantınızı kontrol edin.');
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
  typeof v === 'string' && /^data:(image|video)\//.test(v) && v.length > 2000;

// Bir nesnenin içindeki tüm data: görsel/video değerlerini Cloudinary'ye yükleyip URL ile değiştirir.
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
