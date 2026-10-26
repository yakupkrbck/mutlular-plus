// Bursa Osmangazi 50 No'lu Mehmet Akif Aile Sağlığı Merkezi
// Doğrulanmış ve resmi veriler (Mehmet Akif & Mutlular Mahallesi)

export interface SaglikRaporuTuru {
  id: string;
  title: string;
  shortDesc: string;
  category: 'ehliyet' | 'ise-giris' | 'sporcu' | 'evlilik' | 'istirahat';
  badge: string;
  badgeTone: string;
  asmDurumu: 'Verilir' | 'Şartlı Verilir' | 'Verilemez / OSGB';
  validity: string;
  ozet: string;
  onSartlar: string[];
  adimlar: string[];
  onemliNot?: string;
  eDevletUrl?: string;
}

export interface SaglikMerkeziBilgisi {
  id: string;
  name: string;
  resmiAd: string;
  kisaAd: string;
  mahalle: string;
  bolge: string;
  ilce: string;
  il: string;
  adres: string;
  telefon: string;
  telefonHref: string;
  haritaAdres: string;
  calismaSaatleri: {
    haftaIci: string;
    ogleMolasi: string;
    haftaSonu: string;
  };
  tahlilSaatleri: {
    gunler: string;
    saat: string;
    aclikNotu: string;
    sonucVakti: string;
    cumaNotu: string;
  };
  asiSaatleri: {
    gunler: string;
    saatler: string;
    kapsam: string;
  };
  hizmetler: string[];
}

export const MEHMET_AKIF_50_ASM: SaglikMerkeziBilgisi = {
  id: 'osmangazi-50-mehmet-akif-asm',
  name: "Osmangazi 50 No'lu Mehmet Akif Aile Sağlığı Merkezi",
  resmiAd: "Bursa Osmangazi 50 No'lu Mehmet Akif Aile Sağlığı Merkezi",
  kisaAd: "50 No'lu Mehmet Akif ASM",
  mahalle: 'Mehmet Akif Mahallesi / Mutlular Mahallesi',
  bolge: 'Çukurca Yolu Caddesi',
  ilce: 'Osmangazi',
  il: 'Bursa',
  adres: 'Mehmet Akif, Çukurca Yolu Cd., 16190 Osmangazi/Bursa',
  telefon: '0224 246 87 01',
  telefonHref: 'tel:02242468701',
  haritaAdres: 'Mehmet Akif Mah Çukurca Yolu Cd Osmangazi Bursa',
  calismaSaatleri: {
    haftaIci: 'Pazartesi - Cuma: 08:00 - 17:00',
    ogleMolasi: '12:30 - 13:30 (Öğle Arası)',
    haftaSonu: 'Cumartesi & Pazar: Kapalı (Nöbetçi Eczane & Acil Servisler)',
  },
  tahlilSaatleri: {
    gunler: 'Pazartesi - Perşembe',
    saat: '08:30 - 10:30',
    aclikNotu: 'En az 10-12 saatlik açlık ile gelinmelidir.',
    sonucVakti: 'Aynı gün 16:00 sonrasında e-Nabız sistemine yansır.',
    cumaNotu: 'Cuma günleri kurye transferi ve laboratuvar çalışma takvimi sebebiyle rutin tahlil numunesi alınmaz.',
  },
  asiSaatleri: {
    gunler: 'Salı & Perşembe',
    saatler: '09:00 - 12:00 ve 13:30 - 16:00',
    kapsam: 'Bebek aşıları, çocukluk dönemi aşı takvimi ve gebe izlemleri/aşıları',
  },
  hizmetler: [
    'Muayene, Teşhis ve e-Reçete Yazımı',
    'Sürücü / Ehliyet Sağlık Raporu (e-Rapor Onaylı)',
    'Sporcu Lisans & Sağlık Raporu',
    'İşe Giriş Sağlık Raporu (Az tehlikeli & <50 çalışan)',
    'Evlilik Sağlık Raporu (SMA & Talasemi Kan Testleri)',
    'İstirahat / İş Göremezlik Raporu (Maks. 10 Gün)',
    'Kan ve İdrar Tahlilleri (Bursa Halk Sağlığı Laboratuvarı)',
    'Bebek, Çocuk ve Gebe Rutin Aşı & İzlemleri',
    'Enjeksiyon, Pansuman ve Küçük Tıbbi Müdahaleler',
    'Kanser Erken Teşhis (KETEM) Ücretsiz Taramaları',
  ],
};

// Geriye dönük uyumluluk için array formatı
export const SAGLIK_OCAKLARI_DATA = [
  {
    id: MEHMET_AKIF_50_ASM.id,
    name: MEHMET_AKIF_50_ASM.resmiAd,
    shortName: MEHMET_AKIF_50_ASM.kisaAd,
    neighborhood: MEHMET_AKIF_50_ASM.mahalle,
    district: MEHMET_AKIF_50_ASM.ilce,
    city: MEHMET_AKIF_50_ASM.il,
    address: MEHMET_AKIF_50_ASM.adres,
    phone: MEHMET_AKIF_50_ASM.telefon,
    workingHours: `${MEHMET_AKIF_50_ASM.calismaSaatleri.haftaIci} (${MEHMET_AKIF_50_ASM.calismaSaatleri.ogleMolasi})`,
    tahlilHours: `${MEHMET_AKIF_50_ASM.tahlilSaatleri.gunler}: ${MEHMET_AKIF_50_ASM.tahlilSaatleri.saat}`,
    asiDays: `${MEHMET_AKIF_50_ASM.asiSaatleri.gunler}: ${MEHMET_AKIF_50_ASM.asiSaatleri.saatler}`,
    isNearest: true,
    doctorsCount: 4,
    services: MEHMET_AKIF_50_ASM.hizmetler,
    doctors: [],
  },
];

export const SAGLIK_RAPORLARI_DATA: SaglikRaporuTuru[] = [
  {
    id: 'ehliyet-raporu',
    title: 'Sürücü / Ehliyet Sağlık Raporu',
    shortDesc: 'Yeni sürücü belgesi, sınıf yükseltme ve ehliyet yenileme için e-Rapor.',
    category: 'ehliyet',
    badge: 'e-Rapor (Ücretsiz)',
    badgeTone: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    asmDurumu: 'Verilir',
    validity: '1. Grup: 10 Yıl • 2. Grup (Ağır Vasıta): 5 Yıl',
    ozet: 'Aile hekiminiz genel durum, göz görme keskinliği ve refleks muayenesini yapar. Engel yoksa e-Devlet sistemine barkodlu e-Rapor olarak kaydeder.',
    onSartlar: [
      'e-Devlet üzerinden "Kişisel Sağlık Bilgi Formu" doldurulmuş olması ŞARTTIR. Bu form olmadan hekim sistemde raporu açamaz.',
      'T.C. Kimlik Kartı aslı ile gelinmelidir.',
      'Gözlük veya kontakt lens kullanıyorsanız muayeneye mutlaka gözlüğünüzle gelmelisiniz.',
    ],
    adimlar: [
      '1. e-Devlet kapısına girin ve "Kişisel Sağlık Bilgi Formu"nu doldurup onaylayın.',
      "2. MHRS (veya Alo 182) üzerinden 50 No'lu Mehmet Akif ASM'deki kayıtlı hekiminize randevu alın.",
      '3. Randevu saatinde hekiminize giderek fiziki ve göz muayenesine katılın.',
      '4. Hekim raporunuzu e-Rapor sistemine onaylar. Nüfus Müdürlüğü sisteminde anında görünür, kağıt evrak gerekmez.',
    ],
    onemliNot: 'İleri derece görme bozukluğu, uyku apnesi veya ciddi kronik rahatsızlık durumunda hekim sizi Devlet Hastanesi uzmanına sevk edebilir.',
    eDevletUrl: 'https://www.turkiye.gov.tr/saglik-surucu-adayi-ve-suruculer-icin-saglik-raporu-basvurusu',
  },
  {
    id: 'ise-giris-raporu',
    title: 'İşe Giriş Sağlık Raporu',
    shortDesc: 'İşe başlama ve periyodik sağlık raporu gereksinimleri.',
    category: 'ise-giris',
    badge: 'Kısıtlı / Şartlı',
    badgeTone: 'bg-amber-50 text-amber-800 border-amber-300',
    asmDurumu: 'Şartlı Verilir',
    validity: 'Az tehlikeli işlerde 5 yıl geçerlidir.',
    ozet: '6331 sayılı İş Sağlığı ve Güvenliği Kanunu uyarınca aile hekimleri SADECE "Az Tehlikeli" sınıfta ve 50\'den az çalışanı olan işyerleri için rapor verebilir.',
    onSartlar: [
      'İşverenden alınan işyeri unvanı, çalışan sayısı ve "Az Tehlikeli" sınıf belgesi/yazısı gereklidir.',
      'T.C. Kimlik Kartı ile şahsen başvuru yapılmalıdır.',
    ],
    adimlar: [
      '1. İşyerinizden tehlike sınıfını ve çalışan sayısını gösteren belgeyi alın.',
      '2. Az tehlikeli ve 50 kişiden az ise kayıtlı aile hekiminizden randevu alarak muayene olun.',
      '3. Hekim genel muayene sonrası tek hekim işe giriş raporunu düzenler.',
    ],
    onemliNot: '⚠️ DİKKAT: Tehlikeli ve Çok Tehlikeli sınıftaki işler (inşaat, sanayi, şantiye, fabrika, üretim atölyeleri) veya 50\'den fazla çalışanı olan işletmeler için aile hekimi yasal olarak rapor VEREMEZ. Bu yerler için Ortak Sağlık Güvenlik Birimi (OSGB) veya işyeri hekimine başvurulmalıdır.',
  },
  {
    id: 'sporcu-raporu',
    title: 'Sporcu Lisans & Spor Yapabilir Raporu',
    shortDesc: 'Spor kulübü lisansı, okul müsabakaları ve spor salonu kayıtları için uygunluk raporu.',
    category: 'sporcu',
    badge: 'Tek Hekim Onaylı',
    badgeTone: 'bg-blue-50 text-blue-800 border-blue-300',
    asmDurumu: 'Verilir',
    validity: 'Spor lisansı için 1 sezon, spor salonu ve etkinlikler için 1 yıl geçerlidir.',
    ozet: 'Genel kardiyak kontrol (kalp dinleme), tansiyon ve kas-iskelet sistemi muayenesi yapılarak spor yapmaya engel durum olup olmadığı değerlendirilir.',
    onSartlar: [
      'e-Devlet kapısından "Sporcu Sağlık Bilgi Formu" doldurulmalıdır.',
      'T.C. Kimlik Kartı ve varsa kulüp/federasyon talep formu.',
      '18 yaş altı sporcuların velisi ile gelmesi önerilir.',
    ],
    adimlar: [
      '1. e-Devlet üzerinden Sporcu Sağlık Bilgi Formunu onaylayın.',
      '2. Kayıtlı aile hekiminizden randevu alın.',
      '3. Fiziksel muayene sonrası raporunuz kağıt veya e-Rapor olarak teslim edilir.',
    ],
    onemliNot: 'Muayenede şüpheli kalp ritmi, üfürüm veya nefes darlığı tespit edilirse hekim EKG ve Kardiyoloji uzman görüşü için hastaneye yönlendirir.',
    eDevletUrl: 'https://www.turkiye.gov.tr/saglik-sporcu-saglik-bilgi-formu',
  },
  {
    id: 'evlilik-raporu',
    title: 'Evlilik Sağlık Raporu',
    shortDesc: 'Resmi nikah başvurusu için zorunlu sağlık tarama raporu.',
    category: 'evlilik',
    badge: 'Tahlil Sonrası Onay',
    badgeTone: 'bg-rose-50 text-rose-800 border-rose-300',
    asmDurumu: 'Verilir',
    validity: 'Düzenlendiği tarihten itibaren 6 ay süreyle nikah işlemlerinde geçerlidir.',
    ozet: 'Çiftlerin kayıtlı aile hekimlerine başvurması gerekir. Kan grubu, Talasemi (Akdeniz Anemisi), bulaşıcı hastalıklar (Hepatit B, C, HIV, Frengi) ve SMA tarama testleri yapılır.',
    onSartlar: [
      'Çiftlerin T.C. kimlik kartları ve son 6 ayda çekilmiş 2şer adet vesikalık fotoğrafları.',
      'Kan tahlilleri için sabah 08:30 - 10:30 saatleri arasında aç karnına gelinmelidir.',
    ],
    adimlar: [
      '1. Sabah 08:30 - 10:30 arası aç karnına 50 No\'lu ASM\'ye gelin ve kan numunelerinizi verin.',
      '2. Numuneler Bursa İl Halk Sağlığı Laboratuvarı\'na gönderilir (sonuçlar ortalama 2-3 iş günü sürer).',
      '3. Sonuçlar çıktığında aile hekiminiz sonuçları değerlendirir ve resmi evlilik raporunu onaylar.',
    ],
    onemliNot: 'Nikah dairesi randevunuzdan en az 1-2 hafta önce başvurmanız test süreleri açısından önerilir.',
  },
  {
    id: 'istirahat-raporu',
    title: 'İstirahat (Hastalık / İş Göremezlik) Raporu',
    shortDesc: 'Çalışan veya öğrenciler için hastalık izni raporu.',
    category: 'istirahat',
    badge: 'Maksimum 10 Gün',
    badgeTone: 'bg-purple-50 text-purple-800 border-purple-300',
    asmDurumu: 'Verilir',
    validity: 'Hekimin belirlediği gün süresince geçerlidir.',
    ozet: 'Muayene sonucu akut hastalığı tespit edilen kişiye aile hekimi tarafından tıbbi gerekçeyle tek hekim istirahat raporu verilir.',
    onSartlar: [
      'Şahsen hekime muayene olmak şarttır (başkası adına rapor düzenlenemez).',
      'T.C. Kimlik Kartı.',
    ],
    adimlar: [
      '1. Rahatsızlandığınız gün kayıtlı aile hekiminize muayene olun.',
      '2. Hekim tıbben gerekli görürse tek seferde en fazla 10 güne kadar rapor yazar.',
      '3. Rapor sistemden doğrudan SGK\'ya işlenir ve e-Devlet\'ten görüntülenebilir.',
    ],
    onemliNot: 'Aile hekimi tek seferde en fazla 10 gün, bir takvim yılında tek hekim olarak toplam en fazla 40 gün istirahat raporu düzenleyebilir.',
    eDevletUrl: 'https://www.turkiye.gov.tr/sosyal-guvenlik-4a-4b-isgoremezlik-odemesi-gorme',
  },
];
