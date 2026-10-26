// API (Burulaş, kesinti, nöbetçi eczane) adresi.
//
// Canlı sitede (GitHub Pages) Express sunucusu çalışmaz; bu rotalar Cloudflare Worker'da çalışır.
// Worker'ı deploy ettikten sonra aşağıdaki satıra Worker adresini yaz, örn:
//   const WORKER_URL = 'https://mutlular-plus-api.KULLANICIADIN.workers.dev';
// Yerelde (npm run dev) boş kalır ve aynı sunucudaki /api rotaları kullanılır.
const WORKER_URL = 'https://mutlular-plus-api.yakupkrbck.workers.dev';

export const API_BASE: string =
  ((import.meta as any).env?.VITE_API_BASE as string | undefined) ??
  ((import.meta as any).env?.PROD ? WORKER_URL : '');
