import { RestaurantItem, NewsItem, ClassifiedItem } from '../types';
import { NavTab } from '../components/BottomNav';

// Site bir alt klasörde yayınlanabilir (örn. /mutlular-plus/). Vite bunu BASE_URL olarak verir.
// Kök yayında '' , alt klasörde '/mutlular-plus' olur.
const BASE_PREFIX: string = (((import.meta as any).env?.BASE_URL as string) || '/').replace(/\/+$/, '');

function stripBase(pathname: string): string {
  if (BASE_PREFIX && (pathname === BASE_PREFIX || pathname.startsWith(BASE_PREFIX + '/'))) {
    return pathname.slice(BASE_PREFIX.length) || '/';
  }
  return pathname;
}

/**
 * Türkçe karakterleri ASCII ve arama uyumlu formata dönüştürür
 */
export function turkishNormalize(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Başlık veya isimden SEO ve URL dostu slug oluşturur (örn: "donerci-ismail")
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export interface ParsedRoute {
  tab: NavTab;
  esnafSlug?: string;
  newsId?: string;
  adId?: string;
  serviceCategory?: string;
}

/**
 * Mevcut window.location.pathname'i analiz edip route durumuna çevirir.
 * Desteklenen URL formatları:
 * - / (Anasayfa)
 * - /haber veya /haber/ veya /haber/:id
 * - /alımsatım veya /alimsatim veya /alim-satim veya /alımsatım/:id
 * - /hizmet veya /hizmet/ veya /hizmet/:kategori
 * - /esnaf veya /esnaf/ veya /esnaf/dönerciismail (veya /esnaf/:slug)
 * - /profil veya /profil/
 */
export function parseCurrentPath(pathname: string): ParsedRoute {
  try {
    pathname = decodeURIComponent(pathname);
  } catch {}
  pathname = stripBase(pathname);

  const clean = pathname.replace(/^\/+|\/+$/g, '');
  if (!clean) {
    return { tab: 'anasayfa' };
  }

  const parts = clean.split('/').filter(Boolean);
  const first = parts[0]?.toLocaleLowerCase('tr-TR') || '';
  const second = parts[1] || '';

  // 1. Haber rotası (/haber, /haber/...)
  if (first === 'haber' || first === 'haberler') {
    return {
      tab: 'haber',
      newsId: second || undefined,
    };
  }

  // 2. Alım Satım rotası (/alımsatım, /alimsatim, /alim-satim)
  const normFirst = turkishNormalize(first);
  if (normFirst === 'alimsatim' || first === 'alim-satim') {
    return {
      tab: 'alim-satim',
      adId: second || undefined,
    };
  }

  // 3. Hizmet rotası (/hizmet, /hizmetler)
  if (normFirst === 'hizmet' || normFirst === 'hizmetler') {
    return {
      tab: 'hizmet',
      serviceCategory: second || undefined,
    };
  }

  // 4. Esnaf rotası (/esnaf, /yemek, /esnaf/:slug)
  if (normFirst === 'esnaf' || normFirst === 'yemek' || normFirst === 'restoran') {
    return {
      tab: 'yemek',
      esnafSlug: second || undefined,
    };
  }

  // 5. Profil rotası (/profil)
  if (normFirst === 'profil') {
    return { tab: 'profil' };
  }

  return { tab: 'anasayfa' };
}

/**
 * Verilen esnaf slug veya adı için en uygun mağazayı/restoranı bulur
 */
export function findMatchingRestaurant(
  slugOrName: string,
  restaurants: RestaurantItem[]
): RestaurantItem | undefined {
  if (!slugOrName || !restaurants.length) return undefined;

  let decoded = slugOrName;
  try {
    decoded = decodeURIComponent(slugOrName);
  } catch {}

  const rawLower = decoded.toLowerCase().trim();
  const rawClean = rawLower.replace(/[\s-_]+/g, '');
  const normalizedSearch = turkishNormalize(decoded);

  // 1. ID veya slug ile birebir eşleşme
  let found = restaurants.find(
    (r) =>
      r.id.toLowerCase() === rawLower ||
      (r.slug && r.slug.toLowerCase() === rawLower) ||
      (r.slug && turkishNormalize(r.slug) === normalizedSearch)
  );
  if (found) return found;

  // 2. Normalize edilmiş isim veya slug araması
  found = restaurants.find((r) => {
    const normName = turkishNormalize(r.name);
    const normSlug = r.slug ? turkishNormalize(r.slug) : '';
    const normId = turkishNormalize(r.id);

    return (
      normName === normalizedSearch ||
      normSlug === normalizedSearch ||
      normId === normalizedSearch ||
      normName.includes(normalizedSearch) ||
      normalizedSearch.includes(normName)
    );
  });
  if (found) return found;

  // 3. Kelime bazlı akıllı eşleşme (örn: "dönerciismail" matches "DÖNERCİ İSMAİL USTA")
  found = restaurants.find((r) => {
    const rNameClean = r.name
      .toLowerCase()
      .replace(/[^a-z0-9ğüşıöç]/gi, '');
    const normR = turkishNormalize(r.name);

    return (
      rNameClean.includes(rawClean) ||
      rawClean.includes(rNameClean) ||
      normR.includes(normalizedSearch) ||
      normalizedSearch.includes(normR)
    );
  });

  return found;
}

/**
 * Haber ID veya başlık slug eşleşmesi
 */
export function findMatchingNews(
  idOrSlug: string,
  newsList: NewsItem[]
): NewsItem | undefined {
  if (!idOrSlug || !newsList.length) return undefined;
  const decoded = decodeURIComponent(idOrSlug).toLowerCase();
  const normSearch = turkishNormalize(decoded);

  return newsList.find(
    (n) =>
      n.id.toLowerCase() === decoded ||
      slugify(n.title).toLowerCase() === decoded ||
      turkishNormalize(n.title).includes(normSearch)
  );
}

/**
 * İlan ID veya başlık eşleşmesi
 */
export function findMatchingAd(
  idOrSlug: string,
  adsList: ClassifiedItem[]
): ClassifiedItem | undefined {
  if (!idOrSlug || !adsList.length) return undefined;
  const decoded = decodeURIComponent(idOrSlug).toLowerCase();
  const normSearch = turkishNormalize(decoded);

  return adsList.find(
    (a) =>
      a.id.toLowerCase() === decoded ||
      slugify(a.title).toLowerCase() === decoded ||
      turkishNormalize(a.title).includes(normSearch)
  );
}

/**
 * Uygulama durumundan temiz ve kullanıcı dostu canonical URL yolu üretir.
 */
export function generateCanonicalPath(params: {
  tab: NavTab;
  selectedRestaurant?: RestaurantItem | null;
  selectedNews?: NewsItem | null;
  selectedAd?: ClassifiedItem | null;
}): { path: string; title: string } {
  const { tab, selectedRestaurant, selectedNews, selectedAd } = params;

  // Özel Esnaf Detayı
  if (selectedRestaurant) {
    const slug =
      selectedRestaurant.slug ||
      slugify(selectedRestaurant.name) ||
      selectedRestaurant.id;
    return {
      path: `/esnaf/${slug}`,
      title: `${selectedRestaurant.name} - Esnaf Vitrini | Mutlular Haber`,
    };
  }

  // Özel Haber Detayı
  if (selectedNews) {
    return {
      path: `/haber/${selectedNews.id}`,
      title: `${selectedNews.title} | Mutlular Haber`,
    };
  }

  // Özel İlan Detayı
  if (selectedAd) {
    return {
      path: `/alımsatım/${selectedAd.id}`,
      title: `${selectedAd.title} | Mutlular Haber Alım Satım`,
    };
  }

  // Ana Sekmeler
  switch (tab) {
    case 'haber':
      return {
        path: '/haber/',
        title: 'Haberler & Güncel Gelişmeler | Mutlular Haber',
      };
    case 'alim-satim':
      return {
        path: '/alımsatım/',
        title: 'Alım Satım & Seri İlanlar | Mutlular Haber',
      };
    case 'hizmet':
      return {
        path: '/hizmet/',
        title: 'Hizmet Rehberi & Usta Çağır | Mutlular Haber',
      };
    case 'yemek':
      return {
        path: '/esnaf/',
        title: 'Mahalle Esnafı & Çarşı Vitrini | Mutlular Haber',
      };
    case 'profil':
      return {
        path: '/profil/',
        title: 'Kullanıcı Profili & İşlemlerim | Mutlular Haber',
      };
    case 'anasayfa':
    default:
      return {
        path: '/',
        title: 'Mutlular Haber - Şehrin Dijital Haber & Esnaf Portalı',
      };
  }
}

/**
 * Sayfa yenilenmeden tarayıcı URL çubuğunu günceller ve başlığı senkronize eder
 */
export function syncUrlToBrowser(
  path: string,
  title: string,
  replace: boolean = false
) {
  if (typeof window === 'undefined') return;

  const fullPath = BASE_PREFIX + path;
  const currentPathWithSlash = window.location.pathname;
  if (currentPathWithSlash === fullPath) {
    if (document.title !== title) {
      document.title = title;
    }
    return;
  }

  if (replace) {
    window.history.replaceState({ path: fullPath }, title, fullPath);
  } else {
    window.history.pushState({ path: fullPath }, title, fullPath);
  }
  document.title = title;
}
