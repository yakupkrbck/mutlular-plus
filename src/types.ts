export interface PopularService {
  id: string;
  title: string;
  image: string;
  badge?: string;
  color?: string;
  isPharmacy?: boolean;
}

export type ClassifiedMainCategory = 'kiralik' | 'satilik' | 'ikinci-el';
export type ClassifiedSubCategory = 'ev' | 'tarla' | 'arac' | 'arsa' | 'depo' | 'diger' | 'elektronik' | 'esya' | 'giyim';

export interface ClassifiedItem {
  id: string;
  ownerUid?: string;
  /** Yayın durumu: sıradan kullanıcının ilanı 'pending' doğar, yönetim onaylar */
  status?: 'pending' | 'approved' | 'rejected';
  title: string;
  price: string;
  location: string;
  image: string;
  tag: string;
  date: string;
  phone: string;
  description: string;
  agency?: string;
  rooms?: string;
  area?: string;
  floor?: string;
  mainCategory?: ClassifiedMainCategory;
  subCategory?: ClassifiedSubCategory;
  categoryType?: 'emlak' | 'vasita' | 'ikinci-el';
}

export interface JobApplication {
  id: string;
  applicantUid?: string;
  jobOwnerUid?: string;
  jobId: string;
  applicantName: string;
  applicantRole: 'mahalle_sakini' | 'usta';
  applicantPhone: string;
  experience?: string;
  note?: string;
  appliedAt: string;
  status?: 'beklemede' | 'onaylandi' | 'reddedildi';
}

export interface JobItem {
  id: string;
  ownerUid?: string;
  /** Herkese açık sayaç (başvuranların kişisel bilgisi ayrı, özel koleksiyonda tutulur) */
  applicationCount?: number;
  title: string;
  company: string;
  posterType?: 'usta' | 'esnaf' | 'isletme';
  location: string;
  type: string;
  badge2?: string;
  date: string;
  salary?: string;
  phone?: string;
  description?: string;
  requirements?: string[];
  sector?: string;
  isUrgent?: boolean;
  applications?: JobApplication[];
}

export type BusinessTypeMode = 'qr_menu' | 'magaza_vitrini';

export interface RestaurantItem {
  id: string;
  ownerUid?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  campaigns?: any[];
  slug?: string;
  name: string;
  tag: string;
  rating: number;
  time: string;
  deliveryFee: string;
  minOrder: string;
  image: string;
  category?: 'yemek' | 'giyim' | 'market' | 'teknoloji' | 'cicek' | 'kuafor-bakim' | 'diger';
  businessMode?: BusinessTypeMode; // 'qr_menu' (Yemek) | 'magaza_vitrini' (Giyim / Perakende)
  orderType?: 'online' | 'store_only'; // 'online' -> Sipariş Ver, 'store_only' -> Mağazayı Gör / Telefon Et
  phone?: string;
  address?: string;
  workingHours?: string;
  description?: string;
  menu?: {
    id?: string;
    name: string;
    price: string;
    discountPrice?: string;
    desc: string;
    image?: string;
    category?: string;
    inStock?: boolean;
    stockStatus?: 'in_stock' | 'out_of_stock' | 'low_stock';
    stockCount?: number;
    sizes?: string[];
    badge?: string;
  }[];
  products?: StoreShowcaseProduct[];
  qrTableUrl?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  urgent?: boolean;
  image?: string;
  readCount?: string;
}

export type ObituaryStatus = 'approved' | 'pending' | 'rejected';

export interface ObituaryCondolence {
  id: string;
  author: string;
  message: string;
  date: string;
  phone?: string;
}

export interface ObituaryItem {
  id: string;
  ownerUid?: string;
  name: string; // Cenazenin adı soyadı
  hometown: string; // Memleketi
  fatherName: string; // Babasının ismi
  sonName?: string; // Oğlu ve yakınlarının ismi
  date: string; // Ne zaman namazının kılınacağı
  mosque: string; // Hangi camiiden kaldırılacağı
  cemetery: string; // Hangi mezarlığa defnedileceği
  phone: string; // Telefon numarası
  relative?: string; // Ek akraba bilgisi
  status: ObituaryStatus; // Onay durumu: 'approved' | 'pending' | 'rejected'
  submittedBy?: {
    name: string;
    phone?: string;
    role?: string;
    date?: string;
  };
  approvedBy?: string;
  notes?: string;
  condolences?: ObituaryCondolence[];
  deathDate?: string; // Vefat Tarihi
  burialDate?: string; // Defin Tarihi
  mapLocationUrl?: string; // Harita / Yol Tarifi Bağlantısı
}

export interface PendingMerchantItem {
  id: string;
  ownerUid?: string;
  storeId?: string;
  businessName: string;
  category: string;
  ownerName: string;
  phone: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export type UserRole = 'mahalle-sakini' | 'esnaf' | 'usta' | 'editor' | 'yonetici' | 'muhtar';

export type QuoteRequestStatus = 'beklemede' | 'teklif-geldi' | 'tamamlandi';

export interface MasterOffer {
  id: string;
  ustaUid?: string;
  masterTitle: string;
  price: string;
  estimatedTime: string;
  message: string;
  rating?: number;
  phone?: string;
}

export interface UserQuoteRequest {
  id: string;
  /** Hizmet alanı kimliği; yalnızca ustası olan alanlardan talep açılabilir */
  categoryId?: string;
  ownerUid?: string;
  ownerName?: string;
  category: string;
  subCategory: string;
  status: QuoteRequestStatus;
  urgency: string;
  desc: string;
  address: string;
  phone?: string;
  createdAt: string;
  offersCount?: number;
  offers?: MasterOffer[];
  acceptedOffer?: MasterOffer;
}

export interface UserProfile {
  uid?: string;
  name: string;
  phone?: string;
  email?: string;
  role: UserRole;
  roleLabel: string;
  avatar?: string;
  loginMethod: 'phone' | 'google' | 'form';
  title?: string;
  officialBadge?: string;
  isOfficial?: boolean;
  // Esnaf specific fields
  businessName?: string;
  businessCategory?: string;
  businessAddress?: string;
  businessApproved?: boolean;
  businessMode?: BusinessTypeMode;
  // Usta specific fields
  activities?: string[];
  experienceYears?: string;
  // Editor specific fields
  editorDuties?: string[];
  assignedBy?: string;
}

export interface StoreShowcaseProduct {
  id: string;
  name: string;
  price: string;
  discountPrice?: string;
  image: string;
  desc: string;
  inStock: boolean;
  stockStatus?: 'in_stock' | 'out_of_stock' | 'low_stock'; // 'Stokta Var' | 'Tükendi' | 'Kritik Stok'
  stockCount?: number;
  category?: string; // Menü / Vitrin kategorisi
  isFeatured?: boolean;
  badge?: string; // 'Şefin Önerisi', 'Yeni Sezon', 'Tükendi', vb.
  sizes?: string[]; // Beden veya Porsiyon seçenekleri
}

export interface StoreCampaignItem {
  id: string;
  title: string;
  code: string;
  discountBadge: string;
  validUntil: string;
  description: string;
  active: boolean;
}

export interface UstaSubmittedOffer {
  id: string;
  requestId: string;
  customerName: string;
  customerPhone?: string;
  category: string;
  subCategory: string;
  customerAddress: string;
  customerDesc: string;
  offeredPrice: string;
  estimatedTime: string;
  offerNote: string;
  status: 'beklemede' | 'kabul-edildi' | 'tamamlandi' | 'reddedildi';
  submittedAt: string;
}

export interface AssignedEditor {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedDate: string;
  status: 'active' | 'suspended';
  assignedBy: string;
  duties: string[];
}

export type NotificationType =
  | 'teklif'
  | 'ilan'
  | 'sistem'
  | 'haber'
  | 'son_dakika'
  | 'canli_yayin'
  | 'vefat'
  | 'duyuru'
  | 'ozel'
  | 'muhtarlik';

export interface UserNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
  relatedId?: string;
  badgeText?: string;
  sender?: string;
  actionTab?: string;
  imageUrl?: string;
}

export interface MuhtarlikApplication {
  id: string; // e.g. 'MAKIF-4821'
  ownerUid?: string;
  citizenName: string;
  phone: string;
  street: string;
  category: string;
  message: string;
  createdAt: string;
  status: 'bekliyor' | 'inceleniyor' | 'belediyeye_iletildi' | 'tamamlandi';
  officialNotes?: string;
  updatedAt?: string;
}

// Yönetici panelinden yüklenen ana sayfa vitrin afişi
export interface HeroBannerItem {
  id: string;
  image: string;
  title: string;
  tag?: string;
  ownerUid?: string;
}
