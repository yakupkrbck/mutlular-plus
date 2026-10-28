import React, { useState, useMemo } from 'react';
import {
  X,
  Star,
  Clock,
  Phone,
  MapPin,
  Store,
  Share2,
  MessageCircle,
  Check,
  Navigation,
  Search,
  ArrowLeft,
  UtensilsCrossed,
  Eye,
  Heart,
  ChevronRight,
  SlidersHorizontal,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { checkIsFoodStore } from '../FoodSection';
import { PLACEHOLDER_IMG } from '../../utils/placeholder';

export interface MenuItem {
  id?: string;
  name: string;
  price: string;
  desc?: string;
  image?: string;
  inStock?: boolean;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  stockCount?: number;
  category?: string;
  badge?: string;
  promoText?: string;
  sizes?: string[];
  drinks?: string[];
  discountPrice?: string;
  discountRate?: string;
  colorVariants?: number;
}

interface StoreDetailModalProps {
  business: {
    id?: string;
    name: string;
    category?: string;
    tag?: string;
    tags?: string[];
    rating?: number;
    phone?: string;
    address?: string;
    image?: string;
    description?: string;
    workingHours?: string;
    time?: string;
    menu?: MenuItem[];
    businessMode?: 'qr_menu' | 'magaza_vitrini';
    verified?: boolean;
  } | null;
  onClose: () => void;
  initialTableNo?: number | 'paket';
  initialMode?: 'qr_menu' | 'magaza_vitrini';
}

const DEFAULT_DRINKS = [
  'Ayran (Kapalı Şişe)',
  'Coca-Cola (330ml Kutu)',
  'Coca-Cola Zero (330ml Kutu)',
  'Fanta Portakal (330ml Kutu)',
  'Fuse Tea Şeftali (330ml)',
  'Cappy Karışık Meyve Suyu',
  'Doğanay Şalgam Suyu',
  'Kızılay Maden Suyu',
];

export const StoreDetailModal: React.FC<StoreDetailModalProps> = ({
  business,
  onClose,
  initialMode,
}) => {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc'>('default');
  const [favorites, setFavorites] = useState<string[]>([]);

  // State for Seçenekler Sheet / Modal
  const [selectedItemForOptions, setSelectedItemForOptions] = useState<MenuItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedDrink, setSelectedDrink] = useState<string>('');
  const [customerNote, setCustomerNote] = useState<string>('');

  // Check if store is food-related
  const isFood = useMemo(() => {
    if (!business) return false;
    return (
      initialMode === 'qr_menu' ||
      checkIsFoodStore(business) ||
      business.businessMode === 'qr_menu'
    );
  }, [business, initialMode]);

  // Menü yalnızca işletmenin kendi eklediği ürünlerden oluşur
  const menu: MenuItem[] = useMemo(() => {
    if (!business) return [];
    if (business.menu && business.menu.length > 0) return business.menu;

    return [];
  }, [business, isFood]);

  // Unique categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    menu.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [menu]);

  // Filtered and sorted menu items
  const filteredMenu = useMemo(() => {
    let result = menu.filter((item) => {
      const matchCat =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.desc && item.desc.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });

    if (sortBy === 'price_asc') {
      result = [...result].sort((a, b) => {
        const pA = parseFloat(a.price.replace(/[^\d.]/g, '')) || 0;
        const pB = parseFloat(b.price.replace(/[^\d.]/g, '')) || 0;
        return pA - pB;
      });
    } else if (sortBy === 'price_desc') {
      result = [...result].sort((a, b) => {
        const pA = parseFloat(a.price.replace(/[^\d.]/g, '')) || 0;
        const pB = parseFloat(b.price.replace(/[^\d.]/g, '')) || 0;
        return pB - pA;
      });
    }

    return result;
  }, [menu, selectedCategory, searchQuery, sortBy]);

  // Toggle favorite heart
  const toggleFavorite = (itemId: string) => {
    setFavorites((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  // Open Options Sheet
  const handleOpenOptions = (item: MenuItem) => {
    setSelectedItemForOptions(item);
    setSelectedSize(item.sizes && item.sizes.length > 0 ? item.sizes[0] : '');
    setSelectedDrink(
      item.drinks && item.drinks.length > 0
        ? item.drinks[0]
        : isFood
        ? DEFAULT_DRINKS[0]
        : ''
    );
    setCustomerNote('');
  };

  // Close Options Sheet
  const handleCloseOptions = () => {
    setSelectedItemForOptions(null);
  };

  if (!business) return null;

  const handleCall = () => {
    if (business.phone) {
      window.location.href = `tel:${business.phone.replace(/\s+/g, '')}`;
    }
  };

  const handleCopyPhone = () => {
    if (business.phone) {
      navigator.clipboard?.writeText(business.phone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  // WhatsApp Bilgi Al yönlendirmesi
  const handleWhatsAppInquiry = (
    itemName?: string,
    itemPrice?: string,
    options?: { size?: string; drink?: string; note?: string }
  ) => {
    const rawPhone = business.phone ? business.phone.replace(/\D/g, '') : '';
    let targetPhone = '';
    if (rawPhone.length >= 10) {
      targetPhone = rawPhone.startsWith('90')
        ? rawPhone
        : `90${rawPhone.startsWith('0') ? rawPhone.slice(1) : rawPhone}`;
    }
    if (!targetPhone) {
      window.alert('Bu işletme henüz iletişim numarası eklemedi.');
      return;
    }

    let text = '';
    if (itemName) {
      text = `Merhaba ${business.name}, vitrininiz üzerinden sipariş/bilgi almak istiyorum:\n\n*Ürün:* ${itemName}\n*Fiyat:* ${itemPrice || ''}`;
      if (options?.size) {
        text += `\n*Porsiyon / Beden:* ${options.size}`;
      }
      if (options?.drink) {
        text += `\n*Seçilen Bedava İçecek:* ${options.drink}`;
      }
      if (options?.note) {
        text += `\n*Not:* ${options.note}`;
      }
      text += `\n\nBu ürün mevcut mudur, sipariş verebilir miyim?`;
    } else {
      text = `Merhaba ${business.name}, Mutlular Plus Çarşı üzerinden vitrininizi inceliyorum, bilgi almak istiyorum.`;
    }

    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShare = () => {
    const fullUrl = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: business.name,
          text: `${business.name} menüsü ve vitrin ürünlerini Mutlular Haber'de inceleyin!`,
          url: fullUrl,
        })
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } else {
      handleCopyPhone();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/70 backdrop-blur-sm flex flex-col w-screen h-screen overflow-hidden animate-in fade-in duration-200">
      {/* ======================================================== */}
      {/* 1. TAM EKRAN STICKY ÜST NAVİGASYON BARI                   */}
      {/* ======================================================== */}
      <header className="bg-white border-b border-neutral-200 shrink-0 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 shadow-xs z-30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-neutral-700 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Çarşıya Dön</span>
            <span className="sm:hidden">Geri</span>
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 shrink-0">
                {isFood ? 'Restoran & Menü' : 'Mağaza Vitrini'}
              </span>
              <h1 className="text-xs sm:text-base font-black text-neutral-900 truncate">
                {business.name}
              </h1>
            </div>
            <p className="text-[10.5px] sm:text-[11px] text-neutral-500 truncate hidden sm:block">
              {business.category || business.tag || 'Mutlular Haber Esnafı'} • Vitrin Ürünleri & Fiyatlar
            </p>
          </div>
        </div>

        {/* Sağ Butonlar: WhatsApp, Paylaş, Kapat */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => handleWhatsAppInquiry()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">WhatsApp Bilgi Al</span>
            <span className="sm:hidden">Bilgi Al</span>
          </button>

          <button
            onClick={handleShare}
            className={`h-8 sm:h-9 px-2.5 rounded-xl flex items-center gap-1.5 transition active:scale-95 text-xs font-bold ${
              copiedLink || copiedPhone
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
            title="Bağlantıyı Paylaş veya Kopyala"
          >
            {copiedLink || copiedPhone ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px]">Kopyalandı</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">Paylaş</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-neutral-100 hover:bg-rose-100 hover:text-rose-600 text-neutral-700 flex items-center justify-center transition active:scale-95"
            title="Kapat"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. ANA İÇERİK (TAM EKRAN SCROLL EDİLEBİLİR ALAN)          */}
      {/* ======================================================== */}
      <main className="flex-1 overflow-y-auto bg-neutral-100 pb-28">
        <div className="max-w-5xl mx-auto p-2.5 sm:p-5 lg:p-6 space-y-4 sm:space-y-5">
          
          {/* ======================================================== */}
          {/* A. MAĞAZA BAŞLIĞI VE GÖRSELİ                              */}
          {/* Üstte mağaza ismi & görseli, ürünleri kapatmaz            */}
          {/* ======================================================== */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
            {/* Mağaza Kapak Görseli */}
            <div
              className={`relative w-full bg-neutral-900 overflow-hidden ${
                isFood ? 'h-36 sm:h-48 md:h-52' : 'h-24 sm:h-32 md:h-36'
              }`}
            >
              <img
                src={
                  business.image ||
                  (isFood
                    ? PLACEHOLDER_IMG
                    : PLACEHOLDER_IMG)
                }
                alt={business.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/35 to-transparent" />

              {/* Sol Üst: Sektör & Doğrulama Rozetleri */}
              <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex items-center gap-1.5">
                <span className="bg-neutral-900/80 backdrop-blur-md text-white text-[10px] sm:text-[10.5px] font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg flex items-center gap-1 shadow-xs">
                  {isFood ? (
                    <UtensilsCrossed className="w-3 h-3 text-amber-400" />
                  ) : (
                    <Store className="w-3 h-3 text-sky-400" />
                  )}
                  <span>{business.category || business.tag || 'İşletme'}</span>
                </span>

                <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] sm:text-[10.5px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg flex items-center gap-1 shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Onaylı Esnaf</span>
                </span>
              </div>

              {/* Sağ Üst: Puan Bilgisi */}
              {!!business.rating && (
                <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 bg-white/95 backdrop-blur-md text-neutral-900 text-[11px] sm:text-xs font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg flex items-center gap-1 shadow-xs">
                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                  <span>{business.rating.toFixed(1)}</span>
                </div>
              )}

              {/* Alt Bilgi Şeridi */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 text-white">
                <h2
                  className={`font-black tracking-tight leading-tight drop-shadow-md ${
                    isFood ? 'text-lg sm:text-2xl md:text-3xl' : 'text-base sm:text-xl md:text-2xl'
                  }`}
                >
                  {business.name}
                </h2>
                <p className="text-[10.5px] sm:text-xs text-neutral-200 font-medium drop-shadow-sm mt-0.5 line-clamp-1">
                  {business.description || 'Seçkin vitrin ürünleri & lezzet menüleri'}
                </p>
              </div>
            </div>

            {/* Detay & Hızlı İletişim Şeridi */}
            <div className="p-2.5 sm:p-3.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-neutral-600 flex-wrap">
                <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <Clock className="w-3.5 h-3.5" />
                  {business.workingHours || business.time || '09:00 - 22:30 Açık'}
                </span>
                {business.address && (
                  <span className="flex items-center gap-1 text-neutral-600">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate max-w-[200px] sm:max-w-xs">{business.address}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {business.phone && (
                  <button
                    onClick={handleCall}
                    className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5 text-neutral-600" />
                    <span>{business.phone}</span>
                  </button>
                )}
                {business.address && (
                  <button
                    onClick={() => {
                      const query = encodeURIComponent(
                        `${business.address || ''} ${business.name} Bursa`
                      );
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${query}`,
                        '_blank'
                      );
                    }}
                    className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition active:scale-95"
                    title="Yol Tarifi Al"
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    <span className="hidden sm:inline">Yol Tarifi</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* B. VİTRİN ÜST BAŞLIĞI: REFERANS GÖRSEL 1 & 2 DİZİLİMİ      */}
          {/* Logo/İkon + Başlık + '36 ürün' + Turuncu 'Tümü >' butonu */}
          {/* ======================================================== */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-neutral-200/90 shadow-xs space-y-3">
            
            {/* Üst Şerit: Referans Görsel 1'deki Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                {/* Sol Kare/Yuvarlak Küçük Avatar */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 shadow-2xs">
                  <img
                    src={
                      menu[0]?.image ||
                      business.image ||
                      PLACEHOLDER_IMG
                    }
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Başlık ve Ürün Sayısı */}
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-black text-neutral-900 uppercase tracking-tight truncate">
                    {selectedCategory === 'all'
                      ? isFood
                        ? 'EKMEK ARASI & BURGER MENÜLERİ'
                        : `${business.name.toUpperCase()} VİTRİNİ`
                      : selectedCategory.toUpperCase()}
                  </h3>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">
                    {filteredMenu.length} ürün listelendi
                  </p>
                </div>
              </div>

              {/* Sağ: Referans Görsel 1'deki Turuncu 'Tümü >' Butonu */}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs sm:text-sm px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-1 transition shadow-xs shrink-0"
              >
                <span>Tümü</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Arama & Hızlı Sıralama Çubuğu (Referans Görsel 2'deki Filtreleme & Sıralama Barı) */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Vitrinde ara (burger, köfte, ceket)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0 text-xs font-bold text-neutral-600">
                <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-neutral-700 outline-none cursor-pointer hover:bg-neutral-100"
                >
                  <option value="default">Varsayılan Sıralama</option>
                  <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
                  <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
                </select>
              </div>
            </div>

            {/* Kategori Seçim Hapları */}
            {categories.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
                    selectedCategory === 'all'
                      ? 'bg-neutral-900 text-white shadow-2xs'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  Tümü ({menu.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* C. 2'Lİ VİTRİN KARTLARI DÜZENİ (TAM REFERANS GÖRSEL 1 & 2) */}
          {/* grid-cols-2: Telefondan ve masaüstünden 2 sütunlu dizilim */}
          {/* ======================================================== */}
          {filteredMenu.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center space-y-2 border border-neutral-200">
              <p className="text-xs sm:text-sm font-bold text-neutral-700">
                Aramanıza uygun vitrin ürünü bulunamadı.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs font-bold text-amber-600 underline"
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {filteredMenu.map((item, idx) => {
                const isFavorited = favorites.includes(item.id || item.name);
                const isOutOfStock =
                  item.stockStatus === 'out_of_stock' || item.inStock === false;

                return (
                  <div
                    key={`item-${item.id || item.name}-${idx}`}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group duration-200"
                  >
                    {/* Üst: Görsel Alanı */}
                    <div className="relative w-full aspect-[4/3] sm:aspect-[4/3] bg-neutral-900 overflow-hidden cursor-pointer">
                      <img
                        src={
                          item.image ||
                          (isFood
                            ? PLACEHOLDER_IMG
                            : PLACEHOLDER_IMG)
                        }
                        alt={item.name}
                        onClick={() => handleOpenOptions(item)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Sağ Üst: Favori Kalp Butonu (Referans Görsel 2) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id || item.name);
                        }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/85 hover:bg-white text-neutral-700 hover:text-red-500 flex items-center justify-center shadow-xs transition active:scale-90"
                        title="Favorilere Ekle"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isFavorited ? 'fill-red-500 text-red-500' : 'text-neutral-700'
                          }`}
                        />
                      </button>

                      {/* Sol Üst Rozet (Eğer varsa) */}
                      {item.badge && (
                        <div className="absolute top-2 left-2 bg-neutral-900/85 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                          {item.badge}
                        </div>
                      )}

                      {/* Stok Tükendi Rozeti */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-md uppercase">
                            Tükendi
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Orta: Başlık ve Açıklama (Referans Görsel 1 formatı) */}
                    <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between space-y-1.5">
                      <div className="space-y-0.5">
                        <h4
                          onClick={() => handleOpenOptions(item)}
                          className="text-xs sm:text-sm font-bold text-neutral-900 leading-snug line-clamp-2 cursor-pointer hover:text-amber-600 transition"
                        >
                          {item.name}
                        </h4>

                        {/* Promo / Alt Bilgi Metni (Örn: "Yanında 1 İçecek Bedava") */}
                        <p className="text-[11px] sm:text-xs text-neutral-500 font-medium line-clamp-1">
                          {item.promoText ||
                            item.desc ||
                            (isFood ? 'Yanında 1 İçecek Bedava' : 'Yeni Sezon Vitrin Ürünü')}
                        </p>

                        {/* Perakende için İndirim Rozeti & Renk Sayısı (Referans Görsel 2) */}
                        {!isFood && (
                          <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                            {item.discountRate && (
                              <span className="text-[9.5px] font-black text-red-600 border border-red-500/70 px-1 py-0.2 rounded">
                                {item.discountRate}
                              </span>
                            )}
                            {item.colorVariants && (
                              <span className="text-[10px] font-bold text-neutral-600 flex items-center gap-0.5">
                                <span className="w-2 h-2 rounded-xs bg-neutral-900 inline-block" />
                                <span>+{item.colorVariants}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Alt Bölüm: Kırmızı Fiyat ve Turuncu 'Seçenekler' Butonu (Referans Görsel 1) */}
                      <div className="pt-2 flex items-center justify-between gap-1 flex-wrap">
                        {/* Sol: Kırmızı/Siyah Fiyat */}
                        <div>
                          {item.discountPrice && (
                            <span className="text-[10px] sm:text-xs text-neutral-400 line-through block leading-none">
                              {item.discountPrice}
                            </span>
                          )}
                          <span
                            className={`text-sm sm:text-base font-black ${
                              isFood ? 'text-red-600' : 'text-neutral-900'
                            }`}
                          >
                            {item.price}
                          </span>
                        </div>

                        {/* Sağ: Referans Görsel 1'deki Turuncu [👁 Seçenekler] Butonu */}
                        <button
                          onClick={() => handleOpenOptions(item)}
                          className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-[10.5px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full flex items-center gap-1 shadow-xs transition shrink-0"
                        >
                          <Eye className="w-3 h-3 stroke-[2.5]" />
                          <span>Seçenekler</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ======================================================== */}
      {/* 3. STICKY ALT ÇUBUK: MAĞAZA İÇİN BİLGİ AL (WHATSAPP)     */}
      {/* ======================================================== */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 shadow-2xl px-3 sm:px-6 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          {/* Sol: Bilgi & İletişim */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-neutral-900 text-xs sm:text-sm truncate">
                {business.name} Vitrini
              </p>
              <p className="text-[10px] sm:text-[11px] text-neutral-500 truncate">
                {business.workingHours || business.time || 'Açık'} • WhatsApp ile bilgi alın
              </p>
            </div>
          </div>

          {/* Sağ: WhatsApp ve Telefon */}
          <div className="flex items-center gap-2 shrink-0">
            {business.phone && (
              <button
                onClick={handleCall}
                className="bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-neutral-800 text-xs font-bold py-2 px-3 sm:px-4 rounded-xl flex items-center gap-1.5 transition"
              >
                <Phone className="w-3.5 h-3.5 text-neutral-600" />
                <span className="hidden sm:inline">{business.phone}</span>
                <span className="sm:hidden">Ara</span>
              </button>
            )}

            <button
              onClick={() => handleWhatsAppInquiry()}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm py-2 px-4 sm:px-6 rounded-xl flex items-center gap-1.5 shadow-md transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Bilgi Al</span>
            </button>
          </div>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* 4. SEÇENEKLER & SİPARİŞ MODALI (REFERANS GÖRSEL SEÇENEKLERİ) */}
      {/* Karttaki '👁 Seçenekler' tıklandığında açılan detay paneli   */}
      {/* ======================================================== */}
      {selectedItemForOptions && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-neutral-200 animate-in zoom-in-95 duration-150">
            
            {/* Modal Üst Header */}
            <div className="relative h-44 sm:h-52 w-full bg-neutral-900 shrink-0">
              <img
                src={
                  selectedItemForOptions.image ||
                  PLACEHOLDER_IMG
                }
                alt={selectedItemForOptions.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
              
              <button
                onClick={handleCloseOptions}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                  {selectedItemForOptions.category || 'Vitrin Ürünü'}
                </span>
                <h3 className="text-base sm:text-lg font-black leading-tight drop-shadow-sm">
                  {selectedItemForOptions.name}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-base sm:text-lg font-black text-amber-400">
                    {selectedItemForOptions.price}
                  </span>
                  {selectedItemForOptions.promoText && (
                    <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      {selectedItemForOptions.promoText}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal İçerik (Scroll) */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Açıklama */}
              {selectedItemForOptions.desc && (
                <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200/80">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                    Ürün Bilgisi
                  </span>
                  <p className="text-neutral-700 leading-relaxed">
                    {selectedItemForOptions.desc}
                  </p>
                </div>
              )}

              {/* Porsiyon / Beden Seçeneği */}
              {selectedItemForOptions.sizes && selectedItemForOptions.sizes.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-black text-neutral-900 block text-xs">
                    {isFood ? 'Porsiyon Seçeneği:' : 'Beden / Boyut Seçiniz:'}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedItemForOptions.sizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center justify-between ${
                          selectedSize === sz
                            ? 'bg-amber-50 border-amber-500 text-amber-950 ring-1 ring-amber-500'
                            : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300'
                        }`}
                      >
                        <span>{sz}</span>
                        {selectedSize === sz && (
                          <CheckCircle2 className="w-4 h-4 text-amber-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* İçecek Seçeneği (Yemek için "Yanında 1 İçecek Bedava") */}
              {isFood && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-neutral-900 text-xs">
                      Yanında 1 İçecek Bedava:
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Ücretsiz Dahil
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {(selectedItemForOptions.drinks || DEFAULT_DRINKS).map((drink) => (
                      <button
                        key={drink}
                        type="button"
                        onClick={() => setSelectedDrink(drink)}
                        className={`p-2 rounded-xl border text-left text-[11px] font-semibold transition flex items-center justify-between ${
                          selectedDrink === drink
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500'
                            : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300'
                        }`}
                      >
                        <span className="truncate">{drink}</span>
                        {selectedDrink === drink && (
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Müşteri Notu (İsteğe bağlı) */}
              <div className="space-y-1">
                <span className="font-bold text-neutral-700 block text-[11px]">
                  Özel İstek / Sipariş Notunuz:
                </span>
                <input
                  type="text"
                  placeholder="Örn: Soğansız olsun, acı sos rica ediyorum..."
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Modal Alt Aksiyon Butonları */}
            <div className="p-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between gap-2 shrink-0">
              <button
                onClick={handleCloseOptions}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 font-bold text-xs transition"
              >
                Vazgeç
              </button>

              <button
                onClick={() => {
                  handleWhatsAppInquiry(
                    selectedItemForOptions.name,
                    selectedItemForOptions.price,
                    {
                      size: selectedSize,
                      drink: isFood ? selectedDrink : undefined,
                      note: customerNote,
                    }
                  );
                  handleCloseOptions();
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>WhatsApp ile Sipariş & Bilgi Al</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
