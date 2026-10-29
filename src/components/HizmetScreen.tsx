import React, { useState, useMemo } from 'react';
import {
  Droplets,
  Zap,
  Flame,
  Paintbrush,
  Hammer,
  Truck,
  Key,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Search,
  Send,
  Sparkles,
  HelpCircle,
  Coins,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check,
  Building,
  Home,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Wrench,
} from 'lucide-react';

export interface SubActivity {
  id: string;
  name: string;
  description: string;
  popular?: boolean;
  badge?: string;
}

export interface MainActivity {
  id: string;
  name: string;
  shortDesc: string;
  icon: React.ElementType;
  themeColor: string;
  badgeBg: string;
  subActivities: SubActivity[];
}

export const MAIN_ACTIVITIES: MainActivity[] = [
  {
    id: 'tesisat',
    name: 'Sıhhi Tesisat & Su Sistemleri',
    shortDesc: 'Su kaçağı tespiti, gider açma, batarya ve kalorifer tesisatı',
    icon: Droplets,
    themeColor: 'from-blue-600 to-cyan-600',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    subActivities: [
      {
        id: 'tesisat-1',
        name: 'Su Kaçağı Tespiti (Termal Kameralı)',
        description: 'Kırmadan dökmeden akustik ve termal cihazla noktasal boru kaçağı tespiti.',
        popular: true,
        badge: 'Acil / Aynı Gün',
      },
      {
        id: 'tesisat-2',
        name: 'Tıkalı Gider, Lavabo & Tuvalet Açma',
        description: 'Robot cihazla kırmadan mutfak, banyo ve ana gider borularının açılması.',
        popular: true,
        badge: '7/24 Hizmet',
      },
      {
        id: 'tesisat-3',
        name: 'Musluk, Batarya & Vana Değişimi',
        description: 'Mutfak-banyo bataryaları, ara musluk ve su saati vana montajı.',
      },
      {
        id: 'tesisat-4',
        name: 'Klozet & Gömme Rezervuar Onarımı',
        description: 'Şamandıra, boşaltma grubu ve sifon tamir ve yenileme işleri.',
      },
      {
        id: 'tesisat-5',
        name: 'Kalorifer & Yerden Isıtma Tesisatı',
        description: 'Kolektör değişimi, petek montajı ve boru hattı yenileme.',
      },
      {
        id: 'tesisat-6',
        name: 'Su Deposu & Hidrofor Bakımı',
        description: 'Hidrofor motor tamiri, su deposu dezenfeksiyonu ve tesisat montajı.',
      },
    ],
  },
  {
    id: 'elektrik',
    name: 'Elektrik, Aydınlatma & Otomasyon',
    shortDesc: 'Arıza onarım, sigorta, avize montajı, güvenlik kamerası ve pano',
    icon: Zap,
    themeColor: 'from-amber-500 to-yellow-600',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    subActivities: [
      {
        id: 'elektrik-1',
        name: 'Acil Elektrik Arıza & Şalter / Sigorta Değişimi',
        description: 'Kısa devre, atan sigorta ve kaçak akım rölesi arıza giderimi.',
        popular: true,
        badge: 'Acil Müdahale',
      },
      {
        id: 'elektrik-2',
        name: 'Avize, Spot & Led Aydınlatma Montajı',
        description: 'Tavan avizeleri, gizli led şerit ve bahçe aydınlatma sistemleri.',
        popular: true,
      },
      {
        id: 'elektrik-3',
        name: 'Priz, Anahtar & Yeni Hat Çekimi',
        description: 'Klima, fırın veya şofben için kablo hattı çekilmesi ve priz montajı.',
      },
      {
        id: 'elektrik-4',
        name: 'Diafon & Görüntülü Zil Sistemleri',
        description: 'Bina içi diafon, zil panosu ve akıllı kapı açma sistemleri kurulumu.',
      },
      {
        id: 'elektrik-5',
        name: 'Güvenlik Kamerası & Alarm Kurulumu',
        description: 'Gece görüşlü IP kamera montajı, kayıt cihazı ve hırsız alarmı kurulumu.',
      },
      {
        id: 'elektrik-6',
        name: 'Güneş Paneli & Solar Elektrik Sistemleri',
        description: 'Bağ evi ve çatılar için akülü/şebekeli güneş enerjisi tesisatı.',
      },
    ],
  },
  {
    id: 'iklimlendirme',
    name: 'Kombi, Klima & Isıtma Sistemleri',
    shortDesc: 'Kombi bakımı, petek temizliği, klima montajı ve gaz dolumu',
    icon: Flame,
    themeColor: 'from-orange-500 to-rose-600',
    badgeBg: 'bg-orange-50 text-orange-800 border-orange-200',
    subActivities: [
      {
        id: 'iklim-1',
        name: 'Kombi Yıllık Periyodik Bakım & Tamiri',
        description: 'Genleşme tankı gazı, eşanjör temizliği, fan ve elektronik kart tamiri.',
        popular: true,
        badge: 'Garantili Bakım',
      },
      {
        id: 'iklim-2',
        name: 'Makineli & İlaçlı Petek Temizliği',
        description: 'Özel yıkama makinesi ve koruma kimyasalıyla %30 yakıt tasarrufu.',
        popular: true,
      },
      {
        id: 'iklim-3',
        name: 'Klima Montajı, Gaz Dolumu & Bakım',
        description: 'İç-dış ünite montajı, R410/R32 gaz basımı ve antibakteriyel temizlik.',
        badge: 'Yaz & Kış Servisi',
      },
      {
        id: 'iklim-4',
        name: 'Doğalgaz Tesisatı & Ocak Dönüşümü',
        description: 'Gaz kaçağı testi, fleks hortum değişimi ve tüpgaz/doğalgaz dönüşümü.',
      },
      {
        id: 'iklim-5',
        name: 'Şofben & Termosifon Montajı',
        description: 'Elektrikli veya gazlı su ısıtıcı montaj ve arıza tamiri.',
      },
    ],
  },
  {
    id: 'boya',
    name: 'Boya, Badana & Dekorasyon',
    shortDesc: 'İç/dış cephe boyama, alçı sıva, asma tavan ve duvar kağıdı',
    icon: Paintbrush,
    themeColor: 'from-rose-600 to-pink-600',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    subActivities: [
      {
        id: 'boya-1',
        name: 'Daire & İş Yeri Komple Boya Badana',
        description: 'Eşyalı veya boş daireler için koruyucu örtülü, temiz ve garantili boyama.',
        popular: true,
        badge: 'Eşya Koruma Garantisi',
      },
      {
        id: 'boya-2',
        name: 'Alçı Sıva, Alçıpan & Asma Tavan',
        description: 'Duvar düzeltme, alçıpan bölme duvar, gizli ışıklı asma tavan.',
      },
      {
        id: 'boya-3',
        name: 'Duvar Kağıdı Uygulama & Çıta Kaplama',
        description: 'İthal/yerli duvar kağıdı yapıştırma, salon ve koridor çıtalama.',
      },
      {
        id: 'boya-4',
        name: 'Dış Cephe Mantolama & Isı Yalıtımı',
        description: 'Bina dış cephe taşyünü/strafor yalıtım ve dekoratif sıva boyası.',
      },
      {
        id: 'boya-5',
        name: 'Fayans, Seramik & Epoksi Zemin',
        description: 'Mutfak-banyo kalebodur, seramik döşeme ve derz yenileme.',
      },
    ],
  },
  {
    id: 'marangoz',
    name: 'Mobilya, Marangoz & İç Kapı',
    shortDesc: 'Özel ölçü dolap, mobilya montajı, kapı tamiri ve parke döşeme',
    icon: Hammer,
    themeColor: 'from-emerald-600 to-teal-700',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    subActivities: [
      {
        id: 'marangoz-1',
        name: 'Özel Ölçü Mutfak & Banyo Dolabı İmalatı',
        description: 'MDF / Akrilik kapak mutfak dolabı, banyo dolabı ve vestiyer tasarımı.',
        popular: true,
        badge: 'Ücretsiz 3D Çizim',
      },
      {
        id: 'marangoz-2',
        name: 'Hazır Mobilya Montajı & Demontaj',
        description: 'IKEA, Koçtaş, internetten alınan gardırop, masa ve dolap kurulumu.',
        popular: true,
      },
      {
        id: 'marangoz-3',
        name: 'Oda Kapısı & Çelik Kapı Ayarı / Tamiri',
        description: 'Sürtünen kapıların tıraşlanması, kilit-kol değişimi ve fitil yenileme.',
      },
      {
        id: 'marangoz-4',
        name: 'Laminat Parke & Süpürgelik Döşeme',
        description: 'Şilte serimi, kilitli laminat parke döşeme ve süpürgelik montajı.',
      },
      {
        id: 'marangoz-5',
        name: 'Mobilya Tamiri, Menteşe & Ray Değişimi',
        description: 'Kırık dolap kapakları, frenli ray sistemi ve sandalye tamiri.',
      },
    ],
  },
  {
    id: 'nakliyat',
    name: 'Nakliyat, Taşıma & Depolama',
    shortDesc: 'Evden eve asansörlü taşımacılık, parça eşya ve şehirlerarası nakliyat',
    icon: Truck,
    themeColor: 'from-indigo-600 to-purple-600',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    subActivities: [
      {
        id: 'nakliyat-1',
        name: 'Evden Eve Asansörlü Taşımacılık',
        description: 'Yüksek katlara modüler asansör ile çiziksiz, sigortalı ev taşıma.',
        popular: true,
        badge: 'Sigortalı Taşıma',
      },
      {
        id: 'nakliyat-2',
        name: 'Parça Eşya / Kamyonet & Pikap Taşıma',
        description: 'Tek parça beyaz eşya, koltuk veya çeyiz taşıması için uygun fiyatlı araç.',
        popular: true,
      },
      {
        id: 'nakliyat-3',
        name: 'Eşya Paketleme & Marangozlu Söküm/Montaj',
        description: 'Balonlu naylonla sarma, mobilyaların ustalarca sökülüp kurulması.',
      },
      {
        id: 'nakliyat-4',
        name: 'Moloz & Kaba Atık Tahliyesi',
        description: 'Tadilat sonrası moloz çuvallarının belediye döküm sahasına taşınması.',
      },
    ],
  },
  {
    id: 'cilingir',
    name: 'Çilingir, Kilit & Demir Doğrama',
    shortDesc: '7/24 kapı açma, barel değişimi, çelik kapı kilidi, ferforje korkuluk',
    icon: Key,
    themeColor: 'from-neutral-800 to-neutral-950',
    badgeBg: 'bg-neutral-100 text-neutral-800 border-neutral-300',
    subActivities: [
      {
        id: 'cilingir-1',
        name: '7/24 Acil Kapı Açma (Hasarsız)',
        description: 'Kilitli veya çekili kalan çelik ve ahşap kapıların hasarsız açılması.',
        popular: true,
        badge: '15-20 Dk Kapıda',
      },
      {
        id: 'cilingir-2',
        name: 'Kilit Göbeği (Barel) Değişimi & Güvenlik Kilidi',
        description: 'Tuzaklı, alarmlı ve yüksek güvenlikli kilit göbek montajı.',
        popular: true,
      },
      {
        id: 'cilingir-3',
        name: 'Demir Parmaklık, Korkuluk & Ferforje',
        description: 'Pencere korkuluğu, bahçe giriş kapısı ve yangın merdiveni imalatı.',
      },
      {
        id: 'cilingir-4',
        name: 'Otomatik Kepenk & Garaj Kapısı Tamiri',
        description: 'Motor değişimi, yay tamiri, kumanda kodlama ve fotosel arızaları.',
      },
    ],
  },
  {
    id: 'temizlik',
    name: 'Temizlik, İlaçlama & Halı/Koltuk Yıkama',
    shortDesc: 'Ev temizliği, inşaat sonrası detaylı temizlik, koltuk yıkama, böcek ilaçlama',
    icon: Sparkles,
    themeColor: 'from-teal-600 to-emerald-700',
    badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
    subActivities: [
      {
        id: 'temizlik-1',
        name: 'Boş / Taşınma Öncesi Genel Ev Temizliği',
        description: 'Mutfak dolapları içi, banyo kireç temizliği ve zemin hijyeni.',
        popular: true,
        badge: 'Detaylı Hijyen',
      },
      {
        id: 'temizlik-2',
        name: 'İnşaat & Boya Sonrası Detaylı Temizlik',
        description: 'Boya, alçı ve harç kalıntılarının özel kimyasallarla kazınması.',
      },
      {
        id: 'temizlik-3',
        name: 'Yerinde Koltuk, Yatak & Halı Yıkama',
        description: 'Buharlı ve vakumlu sanayi tipi makinelerle derinlemesine yıkama.',
        popular: true,
      },
      {
        id: 'temizlik-4',
        name: 'Haşere, Böcek & Pire İlaçlama',
        description: 'Sağlık Bakanlığı onaylı kokusuz ve güvenli ilaçlama uygulaması.',
      },
    ],
  },
  {
    id: 'dograma',
    name: 'Cam Balkon, Sineklik & PVC Doğrama',
    shortDesc: 'Katlanır cam balkon, pileli sineklik, PVC pencere ve kilit ayarı',
    icon: Building,
    themeColor: 'from-sky-600 to-blue-700',
    badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
    subActivities: [
      {
        id: 'dograma-1',
        name: 'Katlanır & Sürgülü Cam Balkon Sistemleri',
        description: 'Temperli 8mm camlı, alüminyum fitilli ısıcamlı balkon kapatma.',
        popular: true,
        badge: 'Isıcamlı Seçenek',
      },
      {
        id: 'dograma-2',
        name: 'Pileli (Akordeon) Pencere & Kapı Sinekliği',
        description: 'Yırtılmaz tül, kolay açılır-kapanır özel ölçü sineklik üretimi.',
        popular: true,
      },
      {
        id: 'dograma-3',
        name: 'PVC Pencere Kol, Menteşe & İspanyolet Ayarı',
        description: 'Hava alan pencerelerin conta değişimi, çift açılım mekanizma tamiri.',
      },
    ],
  },
  {
    id: 'bahce',
    name: 'Bahçe Bakımı, Peyzaj & Tarım İşleri',
    shortDesc: 'Çim biçme, ağaç budama, otomatik sulama ve bahçe çiti yapımı',
    icon: Home,
    themeColor: 'from-green-600 to-lime-700',
    badgeBg: 'bg-green-50 text-green-800 border-green-200',
    subActivities: [
      {
        id: 'bahce-1',
        name: 'Bahçe Çim Biçme, Çapalama & Ağaç Budama',
        description: 'Periyodik bahçe bakımı, kuru dal budama ve yabani ot temizliği.',
        popular: true,
      },
      {
        id: 'bahce-2',
        name: 'Otomatik Damla & Yağmurlama Sulama Sistemi',
        description: 'Zaman ayarlı kontrol ünitesi, boru hattı ve nozul montajı.',
      },
      {
        id: 'bahce-3',
        name: 'Tel Çit, Panel Çit & Bahçe Duvarı Yapımı',
        description: 'Beton direkli tel örgü, yeşil panel çit ve çim çit uygulaması.',
      },
    ],
  },
];

interface HizmetScreenProps {
  onOpenQuoteWizard: () => void;
  onOpenQuoteWithService?: (category: string, subCategory?: string) => void;
  onOpenLiveSupport?: () => void;
  /** Yalnızca en az bir ustanın açtığı hizmet alanları (Firestore: plus_hizmet_alanlari) */
  activeFields?: { id: string; name: string }[];
}

export const HizmetScreen: React.FC<HizmetScreenProps> = ({
  onOpenQuoteWizard,
  onOpenQuoteWithService,
  activeFields = [],
}) => {
  // Hizmet alanları ustaların seçimiyle açılır; ustası olmayan alan hiç gösterilmez.
  const activities: MainActivity[] = useMemo(
    () =>
      activeFields.map((f) => {
        const std = MAIN_ACTIVITIES.find((m) => m.name === f.name);
        if (std) {
          // Henüz var olmayan hizmetlere dair iddialar (acil, 7/24 vb.) gösterilmez
          return { ...std, subActivities: std.subActivities.map((x) => ({ ...x, badge: undefined, popular: false })) };
        }
        return {
          id: `ozel-${f.id}`,
          name: f.name,
          shortDesc: 'Mahalle ustaları bu alanda hizmet veriyor.',
          icon: Wrench,
          themeColor: 'from-neutral-700 to-neutral-900',
          badgeBg: 'bg-neutral-100 text-neutral-700 border-neutral-200',
          subActivities: [
            {
              id: `ozel-${f.id}-genel`,
              name: 'Genel Hizmet Talebi',
              description: 'Bu alanda yapılmasını istediğiniz işi anlatarak talep oluşturun.',
            },
          ],
        } as MainActivity;
      }),
    [activeFields]
  );
  const [selectedMainCatId, setSelectedMainCatId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedCatIds, setExpandedCatIds] = useState<Record<string, boolean>>({
    tesisat: true,
    elektrik: true,
    iklimlendirme: true,
    boya: true,
    marangoz: true,
    nakliyat: true,
    cilingir: true,
    temizlik: true,
    dograma: true,
    bahce: true,
  });

  const toggleExpand = (catId: string) => {
    setExpandedCatIds((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Filter main and sub activities based on search query and category selector
  const filteredActivities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return activities.map((mainCat) => {
      // Category filter check
      if (selectedMainCatId !== 'all' && mainCat.id !== selectedMainCatId) {
        return null;
      }

      // If no search query, return full category
      if (!q) {
        return mainCat;
      }

      // Check if main category matches
      const mainMatches =
        mainCat.name.toLowerCase().includes(q) ||
        mainCat.shortDesc.toLowerCase().includes(q);

      // Filter sub-activities matching search query
      const matchingSubs = mainCat.subActivities.filter(
        (sub) =>
          sub.name.toLowerCase().includes(q) ||
          sub.description.toLowerCase().includes(q) ||
          (sub.badge && sub.badge.toLowerCase().includes(q))
      );

      if (mainMatches) {
        // If main matches, keep all sub activities or filtered ones
        return {
          ...mainCat,
          subActivities: matchingSubs.length > 0 ? matchingSubs : mainCat.subActivities,
        };
      }

      if (matchingSubs.length > 0) {
        return {
          ...mainCat,
          subActivities: matchingSubs,
        };
      }

      return null;
    }).filter(Boolean) as MainActivity[];
  }, [selectedMainCatId, searchQuery, activities]);

  const totalSubActivitiesCount = useMemo(() => {
    return filteredActivities.reduce((acc, cat) => acc + cat.subActivities.length, 0);
  }, [filteredActivities]);

  const handleRequestQuote = (mainCatName: string, subCatName: string) => {
    if (onOpenQuoteWithService) {
      onOpenQuoteWithService(mainCatName, subCatName);
    } else {
      onOpenQuoteWizard();
    }
  };

  return (
    <div className="space-y-3.5 pb-24 animate-in fade-in duration-200">
      {/* 1. Header Banner / Platform Policy Notice */}
      <div className="px-3 pt-1">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-900 to-amber-950 p-4.5 text-white shadow-md border border-neutral-800">
          <div className="relative z-10 space-y-2 max-w-sm">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Güvenli & Aracısız Teklif Sistemi</span>
            </div>

            <h2 className="text-[17px] font-black tracking-tight leading-snug">
              Hangi Hizmete İhtiyacınız Var?{' '}
              <span className="text-amber-400">Ücretsiz Teklif Talep Edin</span>
            </h2>

            <p className="text-[11.5px] text-neutral-300 leading-relaxed">
              Mutlular Plus&apos;ta ustalara doğrudan telefonla ulaşılamaz. İstediğiniz faaliyet alanını seçerek teklif talebi oluşturursunuz; bölgedeki kayıtlı ve onaylı ustalar teklif sunar.
            </p>

            {/* Fair marketplace micro-card */}
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/15 flex items-center gap-2.5 text-[11px] text-amber-200">
              <Coins className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="leading-tight">
                <span className="font-extrabold text-white block">Adil Teklif Havuzu Modeli:</span>
                <span className="text-neutral-300 text-[10.5px]">
                  Ustalar her teklif talebine yanıt verirken sistem kredisi kullanır. Bu sayede sadece ciddi, güvenilir ve garantili teklifler alırsınız.
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (onOpenQuoteWithService) {
                  onOpenQuoteWithService('Sıhhi Tesisat & Su Sistemleri');
                } else {
                  onOpenQuoteWizard();
                }
              }}
              className="mt-1 w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-neutral-950 font-black text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition"
            >
              <Send className="w-3.5 h-3.5 text-neutral-950" />
              <span>Hemen Genel Teklif Talebi Oluştur</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-950" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. 3-Step Process Explanation Strip */}
      <div className="px-3">
        <div className="bg-white rounded-2xl p-3 border border-neutral-200 shadow-2xs">
          <div className="text-[11px] font-black text-neutral-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Süreç Nasıl İşliyor? (3 Adımda Garantili Hizmet)</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-neutral-50 border border-neutral-100 flex flex-col items-center justify-between">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 font-black text-[11px] flex items-center justify-center mb-1">
                1
              </div>
              <div className="text-[11px] font-bold text-neutral-900 leading-tight">
                Faaliyet Seçin
              </div>
              <div className="text-[9.5px] text-neutral-500 mt-0.5 leading-snug">
                Ana ve alt hizmet alanını belirleyin
              </div>
            </div>

            <div className="p-2 rounded-xl bg-neutral-50 border border-neutral-100 flex flex-col items-center justify-between">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 font-black text-[11px] flex items-center justify-center mb-1">
                2
              </div>
              <div className="text-[11px] font-bold text-neutral-900 leading-tight">
                Teklif İsteyin
              </div>
              <div className="text-[9.5px] text-neutral-500 mt-0.5 leading-snug">
                İş detayını ve adresinizi yazın
              </div>
            </div>

            <div className="p-2 rounded-xl bg-neutral-50 border border-neutral-100 flex flex-col items-center justify-between">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-[11px] flex items-center justify-center mb-1">
                3
              </div>
              <div className="text-[11px] font-bold text-neutral-900 leading-tight">
                Fiyatları Seçin
              </div>
              <div className="text-[9.5px] text-neutral-500 mt-0.5 leading-snug">
                Gelen tekliflerden en iyisini seçin
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Search Bar */}
      <div className="px-3">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Faaliyet veya hizmet ara (Örn: Su Kaçağı, Kombi, Boya, Çilingir, Cam Balkon)..."
            className="w-full bg-white border border-neutral-200/90 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-neutral-800 placeholder-neutral-400 shadow-2xs focus:outline-none focus:border-amber-500 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400 hover:text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded"
            >
              Temizle
            </button>
          )}
        </div>
      </div>

      {/* 4. Ana Faaliyet Filter Tabs (Horizontal Scroll) */}
      <div className="px-3 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 pb-1">
          <button
            onClick={() => setSelectedMainCatId('all')}
            className={`px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap transition active:scale-95 shrink-0 ${
              selectedMainCatId === 'all'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200 shadow-2xs'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tüm Faaliyetler ({activities.length})</span>
          </button>

          {activities.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedMainCatId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedMainCatId(cat.id)}
                className={`px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap transition active:scale-95 shrink-0 ${
                  isSelected
                    ? 'bg-amber-500 text-neutral-950 shadow-xs font-black'
                    : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200/80 shadow-2xs'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-neutral-950' : 'text-neutral-500'}`} />
                <span>{cat.name.split('&')[0]}</span>
                <span className="text-[9.5px] opacity-70">({cat.subActivities.length})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Activities Section Header */}
      <div className="px-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
          <h3 className="text-[13.5px] font-black tracking-tight text-neutral-900 uppercase">
            HİZMET FAALİYET ALANLARI
          </h3>
        </div>
        <span className="text-[11px] font-extrabold text-neutral-500">
          {totalSubActivitiesCount} Alt Faaliyet
        </span>
      </div>

      {/* 6. Hierarchical Activity Cards: Ana Faaliyet & Alt Faaliyetler */}
      <div className="px-3 space-y-4">
        {activities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center space-y-2">
            <Wrench className="w-10 h-10 text-neutral-300 mx-auto" />
            <h4 className="text-[14px] font-black text-neutral-800">Henüz hizmet alanı açılmadı</h4>
            <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
              Mahalle ustaları kayıt olup hizmet alanlarını seçtikçe burada görünecek. Talep yalnızca açık alanlardan oluşturulabilir.
            </p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center space-y-2 border border-neutral-200">
            <HelpCircle className="w-10 h-10 text-neutral-300 mx-auto" />
            <h4 className="text-[14px] font-black text-neutral-800">
              Aradığınız Faaliyet Bulunamadı
            </h4>
            <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
              &quot;{searchQuery}&quot; ile eşleşen bir hizmet bulunamadı. Genel teklif talebi oluşturarak ihtiyacınızı iletebilirsiniz.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedMainCatId('all');
                onOpenQuoteWizard();
              }}
              className="mt-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs transition"
            >
              Özel Teklif Talebi Oluştur
            </button>
          </div>
        ) : (
          filteredActivities.map((mainCat) => {
            const Icon = mainCat.icon;
            const isExpanded = expandedCatIds[mainCat.id] ?? true;

            return (
              <div
                key={mainCat.id}
                className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden transition"
              >
                {/* Ana Faaliyet Header Banner */}
                <div
                  onClick={() => toggleExpand(mainCat.id)}
                  className="p-3.5 bg-gradient-to-r from-neutral-50 to-white border-b border-neutral-100 flex items-center justify-between cursor-pointer select-none hover:bg-neutral-50/80 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${mainCat.themeColor} text-white flex items-center justify-center font-black shadow-2xs shrink-0`}
                    >
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9.5px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                          Ana Faaliyet
                        </span>
                        <span className="text-[10px] font-extrabold text-neutral-400">
                          {mainCat.subActivities.length} Alt Hizmet
                        </span>
                      </div>
                      <h4 className="text-[14px] font-black text-neutral-900 leading-tight truncate mt-0.5">
                        {mainCat.name}
                      </h4>
                      <p className="text-[11px] text-neutral-500 font-medium truncate">
                        {mainCat.shortDesc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <button
                      type="button"
                      aria-label="Daralt / Genişlet"
                      className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Alt Faaliyetler List (Sub-Activities) */}
                {isExpanded && (
                  <div className="divide-y divide-neutral-100">
                    {mainCat.subActivities.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3 sm:p-3.5 hover:bg-neutral-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                      >
                        {/* Sub-activity details */}
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <h5 className="text-[12.5px] font-extrabold text-neutral-900 leading-snug">
                              {sub.name}
                            </h5>
                            {sub.badge && (
                              <span className="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/70">
                                {sub.badge}
                              </span>
                            )}
                            {sub.popular && (
                              <span className="text-[9.5px] font-black px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/70">
                                Çok Talep Edilen
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-600 font-normal leading-relaxed pl-3.5">
                            {sub.description}
                          </p>
                        </div>

                        {/* Action: Teklif Talep Et (Strictly no direct craftsman phone/contact!) */}
                        <div className="shrink-0 flex items-center justify-end sm:justify-center pt-1 sm:pt-0 pl-3.5 sm:pl-0">
                          <button
                            onClick={() => handleRequestQuote(mainCat.name, sub.name)}
                            className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-neutral-950 font-black text-[11.5px] py-2 px-3.5 rounded-xl shadow-xs transition flex items-center gap-1.5 group"
                          >
                            <Send className="w-3.5 h-3.5 text-neutral-950 transition-transform group-hover:translate-x-0.5" />
                            <span>Teklif Talep Et</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 7. Bottom Assurance Footer */}
      <div className="px-3">
        <div className="rounded-2xl p-3.5 bg-neutral-900 text-neutral-300 text-[11px] space-y-2 border border-neutral-800">
          <div className="flex items-center gap-2 text-white font-black text-xs">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Mutlular Plus Hizmet Güvencesi</span>
          </div>
          <p className="text-neutral-400 text-[10.5px] leading-relaxed">
            Tüm faaliyet alanları bölgedeki doğrulanmış ve odaya kayıtlı ustalar tarafından karşılanır. Kullanıcılar için teklif almak %100 ücretsizdir. Ustalar ise doğrudan aranmak yerine sadece teklif vererek sisteme katılır.
          </p>
        </div>
      </div>
    </div>
  );
};
