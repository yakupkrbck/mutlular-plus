export interface BusLine {
  id: string;
  code: string;
  name: string;
  departure: string;
  destination: string;
  schedule: string[];
  weekendSchedule?: string[];
  route: string[];
  company?: string;
  via?: string;
  operatingHours?: string;
  hatNo?: number;
  stopId?: number;
  matchCode?: string;
}

export const BUS_LINES_DATA: BusLine[] = [
  {
    id: 'hat-15',
    code: '15',
    name: '15 - Armutköy Meydanı - Kent Meydanı - Heykel (Ring)',
    departure: 'Armutköy Meydanı',
    destination: 'Heykel / Kent Meydanı (Ring)',
    company: 'Burulaş / Bursakart',
    via: 'Çeltik - Yeniceabat - Nilüfer Cad. - Botanik Parkı - Merinos - Altıparmak - Timurtaş Paşa - Heykel - Şehreküstü - Kent Meydanı',
    operatingHours: '06:25 - 20:10 (Burulaş Resmi Sefer)',
    hatNo: 1001,
    stopId: 1656,
    matchCode: '15',
    schedule: [
      '07:45', '09:10', '09:30', '10:10', '10:50', '11:30', '11:50',
      '12:10', '12:50', '14:55', '17:30', '18:10', '19:00', '19:30', '20:10'
    ],
    weekendSchedule: [
      '06:25', '07:10', '08:10', '09:10', '10:10', '11:10', '12:10',
      '13:10', '14:10', '15:10', '16:10', '17:10', '18:10', '19:20', '20:00'
    ],
    route: [
      'ARMUTKÖY MEYDANI 1 (Kalkış)',
      'Armutköy 1',
      'Yeniceabat 7',
      'Yeniceabat BTSO Eğitim Kompleksi',
      'Çeltik Köyü Girişi',
      'Mehmet Akif Mahallesi',
      'Nilüfer Caddesi',
      'Bursa Botanik Parkı & Hayvanat Bahçesi',
      'Merinos İstasyonu / Merinos AKKM',
      'Stadyum Caddesi',
      'Altıparmak Caddesi',
      'Çatalfırın',
      'Timurtaş Paşa (Tophane)',
      'Heykel (Atatürk Caddesi Peron 2)',
      'İnegöl Çarşısı / Şehreküstü',
      'Fevzi Çakmak Caddesi',
      'Kent Meydanı',
      'Gençosman',
      'Armutköy Sondurak (Osmangazi)'
    ],
  },
  {
    id: 'hat-15h',
    code: '15H',
    name: '15H - Yunuseli / Armutköy - Bursa Devlet Hastanesi (Ring)',
    departure: 'Armutköy / Yunuseli Meydanı',
    destination: 'Bursa Devlet Hastanesi (Muradiye)',
    company: 'Burulaş / Bursakart',
    via: 'Yunuseli - Fuat Kuşçuoğlu Cad. - Çeltik - Meteoroloji - Abdal Köprüsü - Mehmet Akif Mah. - Merinos - Altıparmak - Tophane - Devlet Hastanesi',
    operatingHours: '06:25 - 17:00 (Hafta İçi Düzenli)',
    hatNo: 1065,
    stopId: 1656,
    matchCode: '15/H',
    schedule: [
      '06:25', '08:20', '13:40', '14:10', '15:30', '16:15', '17:00'
    ],
    weekendSchedule: [
      '07:00', '09:00', '11:00', '13:00', '15:00', '17:00'
    ],
    route: [
      'ARMUTKÖY MEYDANI 1 (Kalkış)',
      'Armutköy 3',
      'Yunuseli Meydanı & Camii',
      'Fuat Kuşçuoğlu Caddesi',
      'Yeniceabat 6',
      'Çeltik Köyü Girişi',
      'Meteoroloji Bölge Müdürlüğü',
      'Abdal Köprüsü 1',
      'Mehmet Akif Mahallesi',
      'Çukurca Kavşağı',
      'Nilüfer Caddesi',
      'Merinos Parkı / Stadyum',
      'Altıparmak Caddesi',
      'Tophane / Orduevi',
      'Muradiye Külliyesi',
      'Bursa Devlet Hastanesi (Tophane Son Durak)'
    ],
  },
  {
    id: 'hat-b15',
    code: 'B15',
    name: 'B15 - Mehmet Akif Ersoy Mah. - Acemler - Çekirge Devlet Hastanesi',
    departure: 'Mehmet Akif Ersoy Mh. 5',
    destination: 'Çekirge Devlet Hastanesi Peron 5',
    company: 'Burulaş / Bursakart',
    via: 'Trafo Cad. - Mutlular - Hürriyet Mezarlığı - Soğukkuyu - Acemler Metro - Cumhuriyet Lisesi - BUSKİ - Levazım - Çekirge Hastanesi',
    operatingHours: '08:35 - 19:50 (Her Gün Düzenli Sefer)',
    hatNo: 1543,
    stopId: 1630,
    matchCode: 'B/15',
    schedule: [
      '09:00', '10:00', '11:00', '14:40', '15:35', '19:00', '19:50'
    ],
    weekendSchedule: [
      '09:00', '10:30', '12:00', '14:40', '16:00', '18:00', '19:30'
    ],
    route: [
      'MEHMET AKİF MH. 5 (Kalkış Durağı)',
      'Mehmet Akif Mh. 4',
      'Trafo Caddesi 1',
      'Mutlular Meydanı',
      'Hürriyet Mezarlığı',
      'Soğukkuyu Caddesi 3',
      'Soğukkuyu Caddesi 4',
      'Soğukkuyu Merkez',
      'Acemler Metro İstasyonu 1',
      'Cumhuriyet Lisesi 1',
      'BUSKİ Genel Müdürlüğü',
      '6. Değirmen Sokak 1',
      'Levazım 1',
      'Çekirge Devlet Hastanesi Peron 5 (Varış)'
    ],
  },
  {
    id: 'hat-b15c',
    code: 'B15C',
    name: 'B15C - Mehmet Akif Ersoy Mh. - Çukurca - Çekirge Devlet Hastanesi (Ring)',
    departure: 'Mehmet Akif Ersoy Mh. (Ring)',
    destination: 'Çekirge Devlet Hastanesi - Çukurca',
    company: 'Burulaş / Bursakart',
    via: 'Çeltik - Çukurca Köyü - Nilüfer Cad. - Botanik Parkı - Abdal Köprüsü - Soğukkuyu - BUSKİ - Acemler - Levazım - Çekirge Hastanesi',
    operatingHours: '07:20 - 20:15 (Haftanın Her Günü)',
    hatNo: 1573,
    stopId: 823,
    matchCode: 'B/15-C',
    schedule: [
      '07:20', '11:40', '13:00', '16:00', '17:20', '20:15'
    ],
    weekendSchedule: [
      '07:20', '08:35', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00', '20:15'
    ],
    route: [
      'ÇEKİRGE DEVLET HASTANESİ PERON 5 (Kalkış)',
      'Levazım 2',
      '6. Değirmen Sokak 2',
      'Cumhuriyet Lisesi 2',
      'BUSKİ 1',
      'Soğukkuyu Caddesi 1-2',
      'Abdal Köprüsü 1',
      'Gazi Osman Paşa İ.Ö.O.',
      'Trafo Caddesi',
      'Mehmet Akif Mahallesi',
      'Çeltik Köyü Meydanı',
      'Çukurca Köyü',
      'Nilüfer Caddesi',
      'Botanik Parkı Girişi',
      'Hürriyet Mezarlığı',
      'Acemler İstasyonu 1',
      'Levazım 1',
      'Çekirge (Hareket Memurluğu - Son Durak)'
    ],
  },
];
