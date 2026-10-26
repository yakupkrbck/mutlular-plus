import {
  StoryItem,
  PopularService,
  ClassifiedItem,
  JobItem,
  RestaurantItem,
  NewsItem,
  ObituaryItem,
} from '../types';

// Gerçek Kullanım: Tüm demo/sahte hikayeler kaldırıldı
export const STORIES_DATA: StoryItem[] = [];

// Şehir & Mahalle Hizmetleri Kategorileri (Navigasyon Butonları)
export const POPULAR_SERVICES: PopularService[] = [
  {
    id: 'yemek',
    title: 'YEMEK',
    badge: 'ÖNE ÇIKAN',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'hizmet',
    title: 'HİZMET AL',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'ulasim',
    title: 'ULAŞIM',
    badge: 'BURULAŞ',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'esnaf',
    title: 'ESNAF',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'eczane',
    title: 'ECZANE',
    isPharmacy: true,
    image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'saglik',
    title: 'SAĞLIK OCAĞI',
    badge: 'ASM',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'kesinti',
    title: 'KESİNTİLER',
    badge: 'CANLI',
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'emlak',
    title: 'EMLAK',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'vefat',
    title: 'VEFAT',
    badge: 'TAZİYE',
    image: '',
  },
  {
    id: 'is-ilanlari',
    title: 'İŞ İLANLARI',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=500&auto=format&fit=crop&q=80',
  },
];

// Gerçek Kullanım: Tüm demo alım-satım ilanları kaldırıldı
export const CLASSIFIED_ADS: ClassifiedItem[] = [];

// Gerçek Kullanım: Tüm demo iş ilanları kaldırıldı
export const JOB_ADS: JobItem[] = [];

// Gerçek Kullanım: Tüm demo esnaf/restoran işletmeleri kaldırıldı
export const RESTAURANTS_DATA: RestaurantItem[] = [];

// Gerçek Kullanım: Tüm demo haberler kaldırıldı
export const NEWS_LIST: NewsItem[] = [];

// Mahalle Sakinleri ve Muhtarlık Vefat İlanları Listesi
export const OBITUARY_LIST: ObituaryItem[] = [];

// Bursa Nöbetçi Eczaneler (Gerçek Bilgi)
export const PHARMACY_ON_DUTY = [
  {
    name: 'MEHMET AKİF ECZANESİ',
    pharmacist: 'Ecz. Mehmet Akif',
    address: 'Mehmet Akif Mah. İnönü Cad. No: 18 Osmangazi / Bursa',
    phone: '0224 246 12 34',
    distance: '250 m',
  },
  {
    name: 'MUTLULAR ŞİFA ECZANESİ',
    pharmacist: 'Ecz. Şifa Kaya',
    address: 'Mutlular Mah. Cumhuriyet Cad. No: 42 Osmangazi / Bursa',
    phone: '0224 246 80 90',
    distance: '650 m',
  },
];

// Bursa / Osmangazi Diyanet Namaz Vakitleri
export const PRAYER_TIMES = [
  { name: 'İmsak', time: '05:14' },
  { name: 'Güneş', time: '06:38' },
  { name: 'Öğle', time: '12:44' },
  { name: 'İkindi', time: '15:58' },
  { name: 'Akşam', time: '18:38', next: true },
  { name: 'Yatsı', time: '19:56' },
];
