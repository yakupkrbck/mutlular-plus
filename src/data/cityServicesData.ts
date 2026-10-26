export interface CityServiceItem {
  id: string;
  category: string;
  name: string;
  phone: string;
  address: string;
  description: string;
}

export const EMERGENCY_NUMBERS = [
  { name: '112 Acil Çağrı (Tüm Acil Durumlar)', number: '112', color: 'bg-rose-600', desc: 'Ambulans, Polis, İtfaiye, Jandarma, AFAD' },
  { name: 'Alo 153 Beyaz Masa / Belediye', number: '153', color: 'bg-blue-600', desc: 'Şikayet, öneri, arıza bildirim hattı' },
  { name: 'Alo 185 Su ve Kanalizasyon Arıza', number: '185', color: 'bg-cyan-600', desc: 'Su kesintisi ve altyapı arızaları' },
  { name: 'Alo 186 Elektrik Arıza (BEDAŞ/TEDAŞ)', number: '186', color: 'bg-amber-600', desc: 'Elektrik kesintisi ve trafo arızaları' },
  { name: 'Alo 187 Doğalgaz Acil', number: '187', color: 'bg-orange-600', desc: 'Gaz kokusu ve kaçak bildirimleri' },
  { name: 'Alo 114 Zehir Danışma Merkezi', number: '114', color: 'bg-purple-600', desc: 'Zehirlenme vakaları acil danışma hattı' },
  { name: 'Alo 177 Orman Yangını İhbar', number: '177', color: 'bg-emerald-600', desc: 'Orman yangını ve anız ihbarları' },
];

export const MUNICIPAL_SERVICES: CityServiceItem[] = [
  {
    id: 'm-1',
    category: 'E-Belediye',
    name: 'Bursa Osmangazi Emlak & ÇTV Vergi Borcu Sorgulama',
    phone: '444 16 01',
    address: 'Santral Garaj Mah. Ulubatlı Hasan Bulvarı No:10 Osmangazi / BURSA',
    description: 'Resmi e-Devlet ve Osmangazi Belediyesi portalları üzerinden doğrudan vergi ve borç sorgulama yönlendirmesi.',
  },
  {
    id: 'm-2',
    category: 'E-Belediye',
    name: 'Osmangazi E-İmar & Parsel Durumu',
    phone: '0224 270 70 00',
    address: 'İmar ve Şehircilik Müdürlüğü / Osmangazi Hizmet Binası',
    description: 'Mutlular Mahallesi ada/parsel bazlı güncel sayısal imar planı ve yapı ruhsatı inceleme.',
  },
  {
    id: 'm-3',
    category: 'Muhtarlık',
    name: 'Bursa Osmangazi Mutlular Mahallesi Muhtarlığı',
    phone: '0224 233 11 22',
    address: 'Mutlular Mah. Cumhuriyet Cad. No: 14 Osmangazi / BURSA',
    description: 'Mahalle ikametgah, talep bildirimleri, sokak aydınlatma ve muhtarlık onay işlemleri.',
  },
  {
    id: 'm-4',
    category: 'Beyaz Masa',
    name: 'Osmangazi Belediyesi Çözüm Merkezi & Beyaz Masa',
    phone: '444 16 01 / 153',
    address: 'Alo 153 • WhatsApp: 0530 962 16 16',
    description: 'Mahalle sakinleri arıza, çöp, asfalt, park ve sokak hayvanı taleplerini 7/24 iletebilir.',
  },
];
