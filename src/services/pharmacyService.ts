import { API_BASE } from '../config/api';

// Nöbetçi eczaneler: veri, her eczanenin nöbet başlangıç/bitiş saatiyle birlikte gelir ve
// "şu an nöbetçi" olanlar Türkiye saatine göre sunucuda hesaplanır. Uydurma yedek liste yoktur.

export interface Pharmacy {
  id: string;
  name: string;
  ilce: string;
  bolge?: string;
  address: string;
  /** Adres tarifi (örn. "Çarşamba Sağlık Ocağı karşı arası") */
  landmark?: string;
  phone: string;
  /** Tüm telefon numaraları (ilki ana numara) */
  phones: string[];
  mapsUrl: string;
  /** Konum: 'tam' = kaynağın verdiği GPS, diğerleri mahalle/ilçe merkezine göre yaklaşık. Yalnızca sıralama için kullanılır */
  lat: number;
  lng: number;
  approx: 'tam' | 'mahalle' | 'ilce';
  source?: 'beo' | 'eczaneleri';
  dutyStart: string;
  dutyEnd: string;
  dutyLabel: string;
  status: 'nobette' | 'yakinda';
}

export interface PharmacyApiResponse {
  success: boolean;
  source?: string;
  sources?: string[];
  sourceNotes?: string[];
  pageTitle?: string;
  sourceUrl?: string;
  date?: string;
  count?: number;
  pharmacies: Pharmacy[];
  error?: string;
}

export interface Coords {
  lat: number;
  lng: number;
}

// Varsayılan referans: Mehmet Akif (Mutlular) Mahallesi merkezi
export const HOME_LOCATION: Coords = { lat: 40.2185, lng: 29.043 };

export async function fetchNobetciEczaneler(): Promise<PharmacyApiResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/nobetci-eczaneler`);
    const json = (await res.json()) as PharmacyApiResponse;
    if (!res.ok || !json.success) {
      return { success: false, pharmacies: [], error: json.error || 'Nöbetçi eczane listesi alınamadı.' };
    }
    return json;
  } catch {
    return { success: false, pharmacies: [], error: 'Bağlantı kurulamadı. İnternetinizi kontrol edin.' };
  }
}

const toRad = (d: number) => (d * Math.PI) / 180;
const haversine = (a: Coords, b: Coords) => {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

/**
 * Yakınlık derecesine göre sıralar. Mesafe KİŞİYE GÖSTERİLMEZ (konumlar mahalle merkezine göre yaklaşıktır).
 * Önce şu an nöbetçi olanlar, sonra yakında başlayanlar; her grup kendi içinde yakınlığa göre sıralanır.
 */
export function sortByProximity(list: Pharmacy[], from: Coords): Pharmacy[] {
  return [...list].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'nobette' ? -1 : 1;
    const da = haversine(from, a);
    const db = haversine(from, b);
    if (Math.abs(da - db) > 0.05) return da - db;
    return a.name.localeCompare(b.name, 'tr');
  });
}

/** Yol tarifi: kullanıcının mevcut konumundan eczanenin adresine (Google Haritalar) */
export function directionsUrl(p: Pharmacy): string {
  const dest = encodeURIComponent(`${p.name} ${p.address} ${p.ilce} Bursa`);
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
}

/** BEO sayfası adresleri BÜYÜK HARFLE verir; okunaklı hâle getirir ("BAHAR MAH." → "Bahar Mah.") */
export function titleTr(text: string): string {
  return (text || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/(^|[\s(\-/.])([a-zçğıöşü])/g, (_m, pre, ch) => pre + ch.toLocaleUpperCase('tr-TR'));
}
