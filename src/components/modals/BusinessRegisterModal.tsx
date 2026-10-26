import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Store,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  ImageIcon,
  UtensilsCrossed,
  Eye,
} from 'lucide-react';
import { UserProfile, BusinessTypeMode } from '../../types';

export interface RegisteredBusinessPayload {
  businessName: string;
  category: string;
  categoryKey: 'yemek' | 'giyim' | 'market' | 'teknoloji' | 'cicek' | 'kuafor-bakim' | 'diger';
  businessMode: BusinessTypeMode; // 'qr_menu' (Yemek) | 'magaza_vitrini' (Giyim / Perakende)
  ownerName: string;
  phone: string;
  address: string;
  description: string;
  workingHours: string;
  image?: string;
}

interface BusinessRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile | null;
  onRegisterBusiness: (business: RegisteredBusinessPayload) => void;
  onOpenEsnafPaneli?: () => void;
  onNavigateToVitrin?: () => void;
  onOpenStorePreview?: (storeName: string, mode: BusinessTypeMode) => void;
}

const CATEGORY_OPTIONS: {
  label: string;
  key: 'yemek' | 'giyim' | 'market' | 'teknoloji' | 'cicek' | 'kuafor-bakim' | 'diger';
  defaultImg: string;
}[] = [
  {
    label: 'Restoran, Lokanta & Cafe',
    key: 'yemek',
    defaultImg:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Kasap, Şarküteri & Doğal Ürünler',
    key: 'market',
    defaultImg:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Market, Bakkal & Manav',
    key: 'market',
    defaultImg:
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Giyim, Butik & Ayakkabı',
    key: 'giyim',
    defaultImg:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Kuaför, Berber & Kişisel Bakım',
    key: 'kuafor-bakim',
    defaultImg:
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Çiçekçilik, Organizasyon & Hediye',
    key: 'cicek',
    defaultImg:
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Telefon, Bilgisayar & Teknoloji Servis',
    key: 'teknoloji',
    defaultImg:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Oto Tamir, Lastik & Sanayi',
    key: 'diger',
    defaultImg:
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
  },
];

export const BusinessRegisterModal: React.FC<BusinessRegisterModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onRegisterBusiness,
  onOpenEsnafPaneli,
  onNavigateToVitrin,
  onOpenStorePreview,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [registeredData, setRegisteredData] = useState<RegisteredBusinessPayload | null>(null);

  const [businessName, setBusinessName] = useState('');
  const [selectedCatIndex, setSelectedCatIndex] = useState(0);
  const [businessMode, setBusinessMode] = useState<BusinessTypeMode>('qr_menu');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('Cumhuriyet Cad. Mutlular Mah.');
  const [description, setDescription] = useState('');
  const [workingHours, setWorkingHours] = useState('08:30 - 21:00');
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Sektör değiştikçe modu otomatik belirle
  const handleCategoryChange = (catIdx: number) => {
    setSelectedCatIndex(catIdx);
    const chosen = CATEGORY_OPTIONS[catIdx];
    if (chosen.key === 'yemek') {
      setBusinessMode('qr_menu');
    } else {
      setBusinessMode('magaza_vitrini');
    }
  };

  useEffect(() => {
    if (userProfile) {
      if (userProfile.name && !ownerName) setOwnerName(userProfile.name);
      if (userProfile.phone && !phone) setPhone(userProfile.phone);
      if (userProfile.businessName && !businessName) setBusinessName(userProfile.businessName);
      if (userProfile.businessAddress && address === 'Cumhuriyet Cad. Mutlular Mah.')
        setAddress(userProfile.businessAddress);
      if (userProfile.businessMode) {
        setBusinessMode(userProfile.businessMode);
      }
    }
  }, [userProfile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !ownerName.trim() || !phone.trim()) return;

    const chosenCat = CATEGORY_OPTIONS[selectedCatIndex];
    const payload: RegisteredBusinessPayload = {
      businessName: businessName.trim(),
      category: chosenCat.label,
      categoryKey: chosenCat.key,
      businessMode,
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      address: address.trim() || 'Mutlular Mah.',
      description:
        description.trim() ||
        `${businessName.trim()} işletmesi, Mutlular Çarşısı bünyesinde kaliteli ve güvenilir hizmet sunmaktadır.`,
      workingHours: workingHours.trim() || '08:30 - 21:00',
      image: customImageUrl.trim() || chosenCat.defaultImg,
    };

    onRegisterBusiness(payload);
    setRegisteredData(payload);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setRegisteredData(null);
    setBusinessName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white text-neutral-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-neutral-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-sm shadow-inner">
              <Store className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-black tracking-tight text-white">
                  ESNAF KAYIT
                </h3>
                <span className="bg-amber-500 text-neutral-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ESNAF SİSTEMİ
                </span>
              </div>
              <p className="text-[11px] text-neutral-300 font-medium">
                Dükkanınızı vitrine taşıyın, mahalle müşterilerinizle buluşun
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {submitted && registeredData ? (
            /* SUCCESS STATE CONNECTED TO ESNAF SYSTEM */
            <div className="py-4 space-y-4 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Mağazanız Başarıyla Açıldı!</span>
                </span>
                <h3 className="text-xl font-black text-neutral-900 mt-2">
                  {registeredData.businessName}
                </h3>
                <p className="text-xs text-neutral-600 mt-1 max-w-sm mx-auto">
                  {registeredData.businessMode === 'qr_menu' || registeredData.categoryKey === 'yemek' ? (
                    <>
                      Yemek işletmeniz oluşturuldu. Müşterileriniz esnaf alanında <strong>&ldquo;Menüyü Görüntüle&rdquo;</strong> butonu ile masadan QR menünüzü inceleyebilir.
                    </>
                  ) : (
                    <>
                      Mağazanız oluşturuldu. Müşterileriniz esnaf alanında <strong>&ldquo;Mağazayı Görüntüle&rdquo;</strong> butonu ile vitrininizi, ürünlerinizi ve stok durumunuzu inceleyebilir.
                    </>
                  )}
                </p>
              </div>

              {/* Registered Store Summary Card */}
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-500">Kategori:</span>
                  <span className="font-extrabold text-neutral-900">{registeredData.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-500">Yetkili Kişi:</span>
                  <span className="font-extrabold text-neutral-900">{registeredData.ownerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-500">İletişim:</span>
                  <span className="font-extrabold text-emerald-700">{registeredData.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-500">Sektör Modu:</span>
                  <span className={`font-extrabold px-2 py-0.5 rounded-md border ${
                    registeredData.businessMode === 'qr_menu' || registeredData.categoryKey === 'yemek'
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : 'bg-blue-50 text-blue-900 border-blue-200'
                  }`}>
                    {registeredData.businessMode === 'qr_menu' || registeredData.categoryKey === 'yemek'
                      ? '🍽️ Yemek (Menüyü Görüntüle)'
                      : '🛍️ Giyim & Diğer (Mağazayı Görüntüle)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-500">Adres:</span>
                  <span className="font-bold text-neutral-800 truncate max-w-[200px]">
                    {registeredData.address}
                  </span>
                </div>
              </div>

              {/* Direct Next Step Action Buttons: Sektöre göre Menüyü Görüntüle / Mağazayı Görüntüle */}
              <div className="space-y-2 pt-2 max-w-md mx-auto">
                {registeredData.businessMode === 'qr_menu' || registeredData.categoryKey === 'yemek' ? (
                  /* Yemek Sektörü: Menüyü Görüntüle */
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenStorePreview) {
                        onOpenStorePreview(registeredData.businessName, 'qr_menu');
                      } else if (onNavigateToVitrin) {
                        onNavigateToVitrin();
                      }
                    }}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-98 text-neutral-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <UtensilsCrossed className="w-3.5 h-3.5 text-neutral-950" />
                    <span>Menüyü Gör</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-950" />
                  </button>
                ) : (
                  /* Giyim ve Diğer Sektörler: Mağazayı Gör */
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenStorePreview) {
                        onOpenStorePreview(registeredData.businessName, 'magaza_vitrini');
                      } else if (onNavigateToVitrin) {
                        onNavigateToVitrin();
                      }
                    }}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-slate-900 via-neutral-900 to-blue-950 hover:to-slate-900 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                    <span>Mağazayı Gör</span>
                    <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                  </button>
                )}

                {onOpenEsnafPaneli && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenEsnafPaneli();
                    }}
                    className="w-full py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition active:scale-98"
                  >
                    <Store className="w-4 h-4 text-amber-600" />
                    <span>Mağazamı Yönet (Esnaf Paneli)</span>
                  </button>
                )}

                {onNavigateToVitrin && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToVitrin();
                    }}
                    className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-700" />
                    <span>Esnaf Alanında Gör</span>
                  </button>
                )}

                <button
                  onClick={handleReset}
                  className="w-full py-2 text-xs font-bold text-neutral-500 hover:text-neutral-800 transition"
                >
                  Kapat
                </button>
              </div>
            </div>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* If user already has an active esnaf profile */}
              {userProfile?.role === 'esnaf' && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <div className="text-xs font-black text-emerald-900">
                        {userProfile.businessName || 'Kayıtlı İşletmeniz Mevcut'}
                      </div>
                      <div className="text-[10px] text-emerald-700">
                        Esnaf sistemine bağlı durumdasınız. Aşağıdan bilgilerinizi güncelleyebilir veya doğrudan panelinizi açabilirsiniz.
                      </div>
                    </div>
                  </div>
                  {onOpenEsnafPaneli && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenEsnafPaneli();
                      }}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[11px] font-black shrink-0 transition"
                    >
                      Panele Git
                    </button>
                  )}
                </div>
              )}

              {/* Highlight Perks Banner */}
              <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-900 space-y-0.5">
                  <div className="font-extrabold text-[12px] text-amber-950">
                    Mutlular Esnaf Vitrininde Yerinizi Alın
                  </div>
                  <p className="text-amber-800">
                    Kayıt olduğunuzda dükkanınız anında Esnaf Vitrinine eklenir ve dükkanınıza özel <strong>Esnaf Yönetim Paneli</strong> aktif edilir.
                  </p>
                </div>
              </div>

              {/* 1. İşletme Adı */}
              <div>
                <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                  İşletme / Dükkan Adı *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Örn: Mutlular Lezzet Sofrası & Şarküteri"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-amber-600 focus:bg-white transition"
                />
              </div>

              {/* 2. Sektör & Kategori */}
              <div>
                <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                  İşletme Sektörü & Kategorisi *
                </label>
                <select
                  value={selectedCatIndex}
                  onChange={(e) => handleCategoryChange(Number(e.target.value))}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-amber-600 focus:bg-white transition"
                >
                  {CATEGORY_OPTIONS.map((opt, i) => (
                    <option key={opt.label} value={i}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* İşletme Vitrin / Menü Modu Seçimi */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-neutral-700 block">
                    Dijital Sunum & Panel Modu *
                  </label>
                  <span className="text-[10px] font-bold text-amber-700">
                    Sektöre göre otomatik belirlenir
                  </span>
                </div>
                <p className="text-[10.5px] text-neutral-500 mb-2 leading-relaxed">
                  Yemek işletmeleri için <strong>QR Menü Sistemi</strong> (Masa karekodları ve menü); giyim, butik ve diğer mağazalar için <strong>Mağaza Vitrini</strong> (Ürün kataloğu ve bedenler) devreye girer. Esnaf kendi paneli üzerinden tüm ürünlerini, fiyatlarını ve anlık stok durumlarını ekleyebilir.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBusinessMode('qr_menu')}
                    className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                      businessMode === 'qr_menu'
                        ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20'
                        : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">🍽️</span>
                      {businessMode === 'qr_menu' && (
                        <span className="text-[9px] bg-amber-500 text-neutral-950 font-black px-1.5 py-0.2 rounded-full uppercase">
                          Seçili
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5">
                      <div className="text-[11px] font-black text-neutral-900 leading-tight">
                        QR Menü Sistemi
                      </div>
                      <div className="text-[9.5px] text-neutral-500 mt-0.5 leading-snug">
                        Restoran, kafe, fırın, dönerci masaları için karekod ve menü
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBusinessMode('magaza_vitrini')}
                    className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                      businessMode === 'magaza_vitrini'
                        ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/20'
                        : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">🛍️</span>
                      {businessMode === 'magaza_vitrini' && (
                        <span className="text-[9px] bg-blue-600 text-white font-black px-1.5 py-0.2 rounded-full uppercase">
                          Seçili
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5">
                      <div className="text-[11px] font-black text-neutral-900 leading-tight">
                        Mağaza Vitrini
                      </div>
                      <div className="text-[9.5px] text-neutral-500 mt-0.5 leading-snug">
                        Giyim, butik, market, aksesuar ürün kataloğu ve stok takibi
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* 3. Yetkili Kişi & 4. Telefon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                    Yetkili / İşletmeci Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Ad Soyad"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-amber-600 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                    İletişim & Sipariş Numarası *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0532 000 00 00"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-amber-600 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* 5. Açık Adres & 6. Çalışma Saatleri */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                    Dükkan Adresi / Konumu
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Örn: Cumhuriyet Cad. No: 14/A"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-amber-600 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                    Çalışma Saatleri
                  </label>
                  <input
                    type="text"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    placeholder="08:30 - 21:00"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-amber-600 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* 7. Açıklama */}
              <div>
                <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                  İşletme Tanıtımı & Ürün / Hizmet Özeti
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Müşterilerinize işletmenizi anlatan kısa bir tanıtım yazısı..."
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-amber-600 focus:bg-white transition"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-xs py-3 rounded-2xl transition shadow-md flex items-center justify-center gap-2 mt-2"
              >
                <Store className="w-4 h-4 text-amber-400" />
                <span>İşletmeyi Esnaf Sistemine Kaydet & Vitrine Bağla</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
