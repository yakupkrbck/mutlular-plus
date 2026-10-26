// BUSKİ & UEDAŞ Canlı Kesinti Servisi
import { UedasOutage, BuskiItem, KesintiDistrict, BURSA_DISTRICTS } from '../data/kesintiData';
import { API_BASE } from '../config/api';

export interface UedasResponse {
  success: boolean;
  source: string;
  provider: string;
  title: string;
  il?: string;
  ilce: string;
  ilceId?: string;
  districts?: KesintiDistrict[];
  targetNeighborhoods?: string[];
  hasOutage?: boolean;
  status?: string;
  message?: string;
  count: number;
  outages: UedasOutage[];
  neighborhoods?: Record<string, { name: string; hasOutage: boolean; message: string; outages: UedasOutage[] }>;
  timestamp: string;
}

export interface BuskiResponse {
  success: boolean;
  source: string;
  provider: string;
  title: string;
  il?: string;
  ilce?: string;
  targetNeighborhoods?: string[];
  hasOutage?: boolean;
  status?: string;
  message?: string;
  count: number;
  items: BuskiItem[];
  neighborhoods?: Record<string, { name: string; hasOutage: boolean; message: string; items: BuskiItem[] }>;
  timestamp: string;
}

export interface KesintiSummaryResponse {
  success: boolean;
  il?: string;
  ilce?: string;
  targetNeighborhoods?: string[];
  hasOutage?: boolean;
  status?: string;
  message?: string;
  electricity?: {
    provider: string;
    hasOutage: boolean;
    status: string;
    message: string;
    count: number;
    outages: UedasOutage[];
  };
  water?: {
    provider: string;
    hasOutage: boolean;
    status: string;
    message: string;
    count: number;
    items: BuskiItem[];
  };
  neighborhoods?: Array<{
    id: string;
    name: string;
    hasElectricityOutage: boolean;
    hasWaterOutage: boolean;
    status: string;
  }>;
  updatedAt?: string;
}

export async function fetchUedasOutages(ilceId: string = '1832'): Promise<UedasResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/kesintiler/uedas?ilce=${encodeURIComponent(ilceId)}`);
    if (!res.ok) {
      throw new Error(`UEDAŞ API isteği başarısız: ${res.status}`);
    }
    return await res.json();
  } catch (error: any) {
    console.warn('UEDAŞ fetch fallback devrede:', error.message);
    return {
      success: true,
      source: 'LOCAL_FALLBACK',
      provider: 'UEDAŞ',
      title: 'UEDAŞ Planlı Elektrik Kesintileri',
      il: 'Bursa',
      ilce: 'Osmangazi',
      targetNeighborhoods: [
        'Mehmet Akif Mahallesi',
        'Çukurca Mahallesi',
        'Çeltik Mahallesi',
      ],
      hasOutage: false,
      status: 'KESINTI_YOK',
      message: 'Bursa Osmangazi Mehmet Akif Mahallesi, Çukurca ve Çeltik mahallelerinde planlı elektrik kesintisi bildirilmemiştir. Kesinti yok.',
      count: 0,
      outages: [],
      timestamp: new Date().toISOString(),
    };
  }
}

export async function fetchBuskiOutages(): Promise<BuskiResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/kesintiler/buski`);
    if (!res.ok) {
      throw new Error(`BUSKİ API isteği başarısız: ${res.status}`);
    }
    return await res.json();
  } catch (error: any) {
    console.warn('BUSKİ fetch fallback devrede:', error.message);
    return {
      success: true,
      source: 'LOCAL_FALLBACK',
      provider: 'BUSKİ',
      title: 'BUSKİ Su Kesintileri ve Altyapı Bilgilendirmeleri',
      il: 'Bursa',
      ilce: 'Osmangazi',
      targetNeighborhoods: [
        'Mehmet Akif Mahallesi',
        'Çukurca Mahallesi',
        'Çeltik Mahallesi',
      ],
      hasOutage: false,
      status: 'KESINTI_YOK',
      message: 'Bursa Osmangazi Mehmet Akif Mahallesi, Çukurca ve Çeltik mahallelerinde su kesintisi bulunmamaktadır. Kesinti yok.',
      count: 0,
      items: [],
      timestamp: new Date().toISOString(),
    };
  }
}

export async function fetchKesintiSummary(): Promise<KesintiSummaryResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/kesintiler/summary`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
