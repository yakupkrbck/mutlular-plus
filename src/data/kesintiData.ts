// BUSKİ ve UEDAŞ Kesinti Veri Tipleri ve Yardımcı Sabitleri

export interface UedasOutage {
  id: string;
  tarih: string;
  saat: string;
  neden: string;
  il: string;
  ilce: string;
  mahalle: string;
  sokaklar: string[];
  rawSokak: string;
  status: 'PLANLI_BAKIM';
  kaynak: string;
  destekHatti: string;
}

export interface BuskiItem {
  id: string;
  baslik: string;
  ilce: string;
  tarih: string;
  saat: string;
  icerik: string;
  rawHtml?: string;
  tip: string;
  kaynak: string;
  alo185: string;
  whatsapp: string;
  webPortal: string;
}

export interface KesintiDistrict {
  id: string;
  name: string;
}

export const BURSA_DISTRICTS: KesintiDistrict[] = [
  { id: '1832', name: 'Osmangazi' },
  { id: '1829', name: 'Nilüfer' },
  { id: '1859', name: 'Yıldırım' },
  { id: '1522', name: 'Mudanya' },
  { id: '1343', name: 'Gemlik' },
  { id: '1935', name: 'Gürsu' },
  { id: '1960', name: 'Kestel' },
  { id: '1411', name: 'İnegöl' },
  { id: '1434', name: 'Karacabey' },
  { id: '1535', name: 'Mustafakemalpaşa' },
  { id: '1553', name: 'Orhangazi' },
  { id: '1420', name: 'İznik' },
  { id: '1725', name: 'Yenişehir' },
];

export const MEHMET_AKIF_INFO = {
  name: 'Mehmet Akif Mahallesi',
  district: 'Osmangazi',
  city: 'Bursa',
  postalCode: '16190',
  mainStreet: 'Çukurca Yolu Caddesi',
  adjacentStreets: ['Çukurca Yolu Cd.', '1. Mutlular Sk.', '2. Mutlular Sk.', 'Çetin Sk.', 'Ayok Sk.', 'Çatal Sk.'],
  searchKeywords: ['mehmet akif', 'mehmetakif', 'cukurca', 'çukurca', 'mutlular', 'cukurcakoy', 'çukurcaköy'],
};

export function normalizeTurkishText(str: string): string {
  if (!str) return '';
  return str
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'g')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'u')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function isMehmetAkifUedasOutage(outage: UedasOutage): boolean {
  if (!outage) return false;
  const m = normalizeTurkishText(outage.mahalle || '');
  if (m.includes('mehmet akif') || m.includes('mehmetakif') || m.includes('mutlular')) {
    return true;
  }
  const s = normalizeTurkishText(`${outage.rawSokak || ''} ${(outage.sokaklar || []).join(' ')}`);
  return s.includes('mehmet akif') || s.includes('cukurca yolu cd') || s.includes('cukurca yolu caddesi');
}

export function isCukurcaUedasOutage(outage: UedasOutage): boolean {
  if (!outage) return false;
  const m = normalizeTurkishText(outage.mahalle || '');
  if (m.includes('cukurca mahallesi') || m.includes('cukurcakoy') || m.includes('cukurca k')) {
    return true;
  }
  if (m === 'cukurca') {
    return true;
  }
  const s = normalizeTurkishText(`${outage.rawSokak || ''} ${(outage.sokaklar || []).join(' ')}`);
  return (s.includes('cukurca mahallesi') || s.includes('cukurcakoy')) && !m.includes('mehmet akif');
}

export function isCeltikUedasOutage(outage: UedasOutage): boolean {
  if (!outage) return false;
  const m = normalizeTurkishText(outage.mahalle || '');
  if (m.includes('celtik') || m.includes('celtikkoy')) {
    return true;
  }
  // Mahalle başka bir yer olarak belirlenmişse (örn. YUNUSELİ), sokak isminden dolayı Çeltik Mahallesi sayılmaz
  if (!m || m === 'osmangazi') {
    const s = normalizeTurkishText(`${outage.rawSokak || ''} ${(outage.sokaklar || []).join(' ')}`);
    return s.includes('celtik mahallesi') || s.includes('celtikkoy');
  }
  return false;
}

export function isMehmetAkifBuskiOutage(item: BuskiItem): boolean {
  if (!item) return false;
  const target = normalizeTurkishText(`${item.baslik || ''} ${item.icerik || ''}`);
  if (
    (target.includes('yildirim ilcesi') || target.includes('nilufer ilcesi') || target.includes('mudanya ilcesi')) &&
    !target.includes('osmangazi')
  ) {
    return false;
  }
  return (
    target.includes('mehmet akif') ||
    target.includes('mehmetakif') ||
    target.includes('mutlular') ||
    target.includes('cukurca yolu cd') ||
    target.includes('cukurca yolu caddesi')
  );
}

export function isCukurcaBuskiOutage(item: BuskiItem): boolean {
  if (!item) return false;
  const target = normalizeTurkishText(`${item.baslik || ''} ${item.icerik || ''}`);
  if (
    (target.includes('yildirim ilcesi') || target.includes('nilufer ilcesi') || target.includes('mudanya ilcesi')) &&
    !target.includes('osmangazi')
  ) {
    return false;
  }
  if (target.includes('cukurca mahallesi') || target.includes('cukurcakoy') || target.includes('cukurca k')) {
    return true;
  }
  if (target.includes('cukurca') && !target.includes('cukurca yolu')) {
    return true;
  }
  return false;
}

export function isCeltikBuskiOutage(item: BuskiItem): boolean {
  if (!item) return false;
  const target = normalizeTurkishText(`${item.baslik || ''} ${item.icerik || ''}`);
  if (
    (target.includes('yildirim ilcesi') || target.includes('nilufer ilcesi') || target.includes('mudanya ilcesi')) &&
    !target.includes('osmangazi')
  ) {
    return false;
  }
  return (
    target.includes('celtik mahallesi') ||
    target.includes('celtik mah') ||
    target.includes('celtikkoy') ||
    (target.includes('celtik') && !target.includes('sk') && !target.includes('sokak'))
  );
}

export const KESINTI_CONTACTS = {
  uedas: {
    name: 'UEDAŞ (Uludağ Elektrik Dağıtım A.Ş.)',
    callCenter: '186',
    callCenterHref: 'tel:186',
    onlineNotice: 'https://online.uedas.com.tr/#/sikayetihbar',
    description: 'Bursa Osmangazi elektrik dağıtım ve 7/24 arıza müdahale merkezi.',
  },
  buski: {
    name: 'BUSKİ (Bursa Su ve Kanalizasyon İdaresi)',
    callCenter: '185',
    callCenterHref: 'tel:185',
    whatsapp: '0516 16 78 185',
    whatsappHref: 'https://wa.me/905161678185?text=Merhaba,%20Mehmet%20Akif%20Mahallesi%20su%20kesintisi%20veya%20ar%C4%B1za%20bildirmek%20istiyorum',
    onlinePortal: 'https://ebuski.buski.gov.tr',
    description: 'Bursa Büyükşehir Belediyesi 7/24 su arıza, altyapı ve kanalizasyon operasyon merkezi.',
  },
};

export interface NeighborhoodItem {
  id: string;
  name: string;
  shortName: string;
  district: string;
  latitude: number;
  longitude: number;
  keywords: string[];
}

export const BURSA_NEIGHBORHOODS: NeighborhoodItem[] = [
  {
    id: 'mehmet_akif',
    name: 'Mehmet Akif Mahallesi',
    shortName: 'Mehmet Akif',
    district: 'Osmangazi',
    latitude: 40.2185,
    longitude: 29.043,
    keywords: ['mehmet akif', 'mehmetakif', 'mutlular', 'cukurca yolu cd', 'çukurca yolu cd'],
  },
  {
    id: 'cukurca',
    name: 'Çukurca Mahallesi',
    shortName: 'Çukurca',
    district: 'Osmangazi',
    latitude: 40.223,
    longitude: 29.048,
    keywords: ['cukurca', 'çukurca', 'cukurcakoy', 'çukurcaköy'],
  },
  {
    id: 'celtik',
    name: 'Çeltik Mahallesi',
    shortName: 'Çeltik',
    district: 'Osmangazi',
    latitude: 40.232,
    longitude: 29.039,
    keywords: ['celtik', 'çeltik', 'celtikkoy', 'çeltikköy'],
  },
];

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findNearestNeighborhood(
  userLat: number,
  userLng: number
): { neighborhood: NeighborhoodItem; distanceKm: number } {
  let nearest = BURSA_NEIGHBORHOODS[0];
  let minDistance = calculateDistanceKm(
    userLat,
    userLng,
    nearest.latitude,
    nearest.longitude
  );

  for (const n of BURSA_NEIGHBORHOODS) {
    const dist = calculateDistanceKm(userLat, userLng, n.latitude, n.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = n;
    }
  }

  return { neighborhood: nearest, distanceKm: minDistance };
}

export function isOutageForNeighborhood(
  itemText: string,
  neighborhood: NeighborhoodItem
): boolean {
  if (!itemText || !neighborhood) return false;
  const normText = normalizeTurkishText(itemText);
  return neighborhood.keywords.some((kw) => normText.includes(normalizeTurkishText(kw)));
}


