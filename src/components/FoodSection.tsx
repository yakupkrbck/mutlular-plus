import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Clock,
  Bike,
  Coins,
  Star,
  ShoppingBag,
  Gift,
  ThumbsUp,
  Store,
  Phone,
  Eye,
  Shirt,
  UtensilsCrossed,
  Sparkles,
  ShoppingBasket,
  Smartphone,
  Flower2,
  Tag,
  QrCode,
  MapPin,
  MessageCircle,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Camera,
} from 'lucide-react';
import { RestaurantItem, UserProfile } from '../types';

export const checkIsFoodStore = (store: {
  category?: string;
  tag?: string;
  businessMode?: string;
  name?: string;
}): boolean => {
  if (store.businessMode === 'qr_menu') return true;
  if (store.businessMode === 'magaza_vitrini') return false;

  const cat = (store.category || '').toLowerCase();
  const tag = (store.tag || '').toLowerCase();

  // If explicitly clothing, retail, market, flower, tech, barber, automotive, etc -> FALSE
  if (
    cat === 'giyim' ||
    cat === 'market' ||
    cat === 'cicek' ||
    cat === 'teknoloji' ||
    cat === 'kuafor-bakim' ||
    cat === 'diger' ||
    cat.includes('giyim') ||
    cat.includes('butik') ||
    cat.includes('ayakkabı') ||
    cat.includes('kuaför') ||
    cat.includes('berber') ||
    cat.includes('çiçek') ||
    cat.includes('telefon') ||
    cat.includes('sanayi')
  ) {
    return false;
  }

  // If explicitly food category -> TRUE
  if (
    cat === 'yemek' ||
    cat.includes('yemek') ||
    cat.includes('restoran') ||
    cat.includes('cafe') ||
    cat.includes('kafe') ||
    cat.includes('lokanta')
  ) {
    return true;
  }

  const foodKeywords = [
    'döner', 'kebap', 'köfte', 'lezzet', 'mutfak', 'tatlı', 'pasta', 'çorba',
    'pide', 'lahmacun', 'börek', 'kahve', 'cafe', 'kafe', 'dürüm', 'burger',
    'pizza', 'ızgara', 'fırın', 'baklava', 'lokanta', 'restoran'
  ];
  return foodKeywords.some((kw) => tag.includes(kw) || cat.includes(kw));
};

export type MainSectionMode = 'all' | 'qr_menu' | 'magaza_vitrini';

interface FoodSectionProps {
  restaurants: RestaurantItem[];
  onOrderRestaurant: (restaurant: RestaurantItem, tableNo?: number | 'paket', mode?: 'qr_menu' | 'magaza_vitrini') => void;
  onOpenParaPuan: () => void;
  onOpenBusinessRegister?: () => void;
  onOpenEsnafPaneli?: () => void;
  onOpenQrScanner?: () => void;
  onViewAll?: () => void;
  title?: string;
  defaultMode?: MainSectionMode;
  userProfile?: UserProfile | null;
}

type StoreCategoryFilter = 'all' | 'yemek' | 'giyim' | 'market' | 'cicek' | 'teknoloji';

export const FoodSection: React.FC<FoodSectionProps> = ({
  restaurants,
  onOrderRestaurant,
  onOpenParaPuan,
  onOpenBusinessRegister,
  onOpenEsnafPaneli,
  onOpenQrScanner,
  onViewAll,
  title = 'Esnaf & Mağazalar',
  defaultMode = 'all',
  userProfile,
}) => {
  const [sectionMode, setSectionMode] = useState<MainSectionMode>(defaultMode);
  const [selectedCategory, setSelectedCategory] = useState<StoreCategoryFilter>('all');

  useEffect(() => {
    if (defaultMode) {
      setSectionMode(defaultMode);
    }
  }, [defaultMode]);

  const categories: { id: StoreCategoryFilter; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Tümü', icon: <Store className="w-3.5 h-3.5" /> },
    { id: 'yemek', label: 'Yemek & Tatlı', icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
    { id: 'giyim', label: 'Giyim & Moda', icon: <Shirt className="w-3.5 h-3.5" /> },
    { id: 'market', label: 'Şarküteri & Market', icon: <ShoppingBasket className="w-3.5 h-3.5" /> },
    { id: 'cicek', label: 'Çiçek & Hediye', icon: <Flower2 className="w-3.5 h-3.5" /> },
    { id: 'teknoloji', label: 'Teknoloji & Servis', icon: <Smartphone className="w-3.5 h-3.5" /> },
  ];

  // Filter stores according to active section mode and category
  const filteredStores = restaurants.filter((store) => {
    const isFood = checkIsFoodStore(store);

    if (sectionMode === 'qr_menu' && !isFood) return false;
    if (sectionMode === 'magaza_vitrini' && isFood) return false;

    if (selectedCategory === 'all') return true;
    return store.category === selectedCategory;
  });

  const qrStoresCount = restaurants.filter((s) => checkIsFoodStore(s)).length;

  const showcaseStoresCount = restaurants.filter((s) => !checkIsFoodStore(s)).length;

  const handleOpenDirections = (store: RestaurantItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const query = encodeURIComponent(`${store.address || ''} ${store.name} Bursa`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleWhatsAppInquiry = (store: RestaurantItem, itemName?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const phone = store.phone ? store.phone.replace(/\D/g, '') : '';
    const text = itemName
      ? `Merhaba ${store.name}, vitrininizdeki "${itemName}" ürünü hakkında beden ve stok sormak istiyorum.`
      : `Merhaba ${store.name}, Mutlular Plus vitrininizdeki ürünler hakkında bilgi almak istiyorum.`;
    window.open(`https://wa.me/90${phone.startsWith('0') ? phone.slice(1) : phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Check if current logged-in user is an esnaf with their own registered store
  // Esnafın kendi işletmesi yalnızca gerçekten kayıtlıysa gösterilir (uydurma kart oluşturulmaz)
  const userStore =
    userProfile?.uid ? restaurants.find((r: any) => r.ownerUid === userProfile.uid) || null : null;

  const isUserStoreFood = userStore ? checkIsFoodStore(userStore) : false;

  return (
    <div className="px-3 py-2 space-y-3">
      {/* 1. Header with dynamic count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
          <h2 className="text-[15px] font-black tracking-tight text-neutral-900 flex items-center gap-1.5">
            <span>{title}</span>
            <span className="text-[11px] font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-md">
              {filteredStores.length} İşletme
            </span>
          </h2>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-[12px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-0.5 transition cursor-pointer"
          >
            <span>Tümünü Gör</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Sizin İşletmeniz - Esnafın Kendi Canlı Vitrin Kartı */}
      {userProfile?.role === 'esnaf' && userStore && (
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950 text-white rounded-2xl p-3.5 border border-amber-500/40 shadow-md space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black shrink-0 shadow-xs">
                <Store className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black uppercase text-amber-300 bg-amber-500/20 px-2 py-0.2 rounded-full border border-amber-500/30">
                    Sizin İşletmeniz
                  </span>
                  <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Esnaf Vitrininde Canlı Yayında</span>
                  </span>
                </div>
                <h3 className="text-[14px] font-black text-white truncate mt-0.5">
                  {userStore.name}
                </h3>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-300 bg-white/10 px-2 py-0.5 rounded-md shrink-0">
              {(userStore.menu || []).length} Ürün Aktif
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onOrderRestaurant(userStore, 1, isUserStoreFood ? 'qr_menu' : 'magaza_vitrini')}
              className="flex-1 bg-amber-500 hover:bg-amber-600 active:scale-98 text-neutral-950 font-bold text-xs py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs"
            >
              {isUserStoreFood ? (
                <>
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Menüyü Gör</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Mağazayı Gör</span>
                </>
              )}
            </button>

            {onOpenEsnafPaneli && (
              <button
                onClick={onOpenEsnafPaneli}
                className="bg-white/15 hover:bg-white/25 active:scale-98 text-white font-black text-xs py-2 px-3.5 rounded-xl flex items-center justify-center gap-1.5 transition border border-white/20 shrink-0"
              >
                <Store className="w-4 h-4 text-amber-400" />
                <span>Mağazamı Yönet</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Top Segmented View Switcher: Tümü vs. QR Menü vs. Mağazayı Gör */}
      <div className="bg-neutral-200/80 p-1 rounded-2xl flex items-center gap-1 shadow-inner">
        <button
          onClick={() => {
            setSectionMode('all');
            setSelectedCategory('all');
          }}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 min-w-0 ${
            sectionMode === 'all'
              ? 'bg-white text-neutral-900 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Store className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Tüm Çarşı</span>
        </button>

        <button
          onClick={() => {
            setSectionMode('qr_menu');
            setSelectedCategory('all');
          }}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 min-w-0 ${
            sectionMode === 'qr_menu'
              ? 'bg-amber-500 text-neutral-950 shadow-xs'
              : 'text-neutral-700 hover:text-neutral-950'
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5 shrink-0 text-amber-900" />
          <span className="truncate">🍽️ Lezzet Menüleri</span>
          <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-amber-200/80 text-amber-950 hidden sm:inline">
            {qrStoresCount}
          </span>
        </button>

        <button
          onClick={() => {
            setSectionMode('magaza_vitrini');
            setSelectedCategory('all');
          }}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 min-w-0 ${
            sectionMode === 'magaza_vitrini'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-neutral-700 hover:text-neutral-950'
          }`}
        >
          <Shirt className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">🛍️ Mağazalar</span>
          <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-900 hidden sm:inline">
            {showcaseStoresCount}
          </span>
        </button>
      </div>

      {/* 3. DEDICATED PROMO BANNERS BY ACTIVE MODE */}
      {sectionMode === 'qr_menu' ? (
        /* YEMEK MENÜLERİ ÖZEL ALANI BANNERI */
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-3 text-neutral-950 shadow-xs flex items-center justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[9.5px] font-black uppercase tracking-wider bg-black/20 text-white px-2 py-0.5 rounded-md">
                Menü Servisi
              </span>
              <span className="text-[10px] font-black text-amber-950 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-800 animate-pulse" />
                Güncel Menü & Fiyatlar
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-black text-white leading-tight">
              Restoran & Kafe Menüleri
            </h3>
            <p className="text-[10.5px] text-amber-100 font-medium leading-snug line-clamp-1">
              Öne çıkan lezzetleri ve porsiyon fiyatlarını inceleyin.
            </p>
          </div>
        </div>
      ) : sectionMode === 'magaza_vitrini' ? (
        /* MAĞAZA VİTRİNİ ÖZEL ALANI BANNERI */
        <div className="bg-gradient-to-r from-blue-800 via-indigo-800 to-sky-800 rounded-2xl p-3 text-white shadow-xs flex items-center justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[9.5px] font-black uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-md">
                Esnaf Çarşısı
              </span>
              <span className="text-[10px] font-bold text-sky-200">
                Canlı Vitrin & Stok
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-black leading-tight">
              Semt Dükkanları Vitrini
            </h3>
            <p className="text-[10.5px] text-sky-100 font-medium leading-snug line-clamp-1">
              Dükkan gezmeden vitrindeki ürünleri ve bedenleri inceleyin.
            </p>
          </div>

          {onOpenBusinessRegister && (
            <button
              onClick={onOpenBusinessRegister}
              className="bg-white hover:bg-neutral-100 text-blue-950 font-bold text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-xs shrink-0"
            >
              <Store className="w-3.5 h-3.5 text-blue-700" />
              <span>Dükkan Ekle</span>
            </button>
          )}
        </div>
      ) : (
        /* ALL MODES: Para Puan & Esnaf Kayıt Banner */
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-3 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs">
                MP
              </div>
              <div>
                <p className="text-[12px] font-bold text-neutral-900 leading-snug">
                  Mahallenin esnafından alışveriş yap,{' '}
                  <span className="text-rose-600 font-extrabold">Para Puan</span> kazan!
                </p>
              </div>
            </div>

            <button
              onClick={onOpenParaPuan}
              className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 transition shrink-0 active:scale-95 shadow-2xs"
            >
              <span>Fırsatlar</span>
              <Gift className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-neutral-500 font-medium mt-2 pt-2 border-t border-neutral-100">
            <div className="flex items-center gap-1.5">
              <ThumbsUp className="w-3 h-3 text-rose-600 shrink-0" />
              <span>Masada QR sipariş veya mağaza vitrininden ayırtma</span>
            </div>
            {onOpenBusinessRegister && (
              <button
                onClick={onOpenBusinessRegister}
                className="text-[10px] font-black text-amber-700 hover:text-amber-800 flex items-center gap-1 shrink-0 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 transition"
              >
                <Store className="w-3 h-3 text-amber-600" />
                <span>Dükkanını Ekle</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. Category Pills (Yemek, Giyim, Şarküteri, vb.) */}
      {sectionMode !== 'qr_menu' && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 pt-0.5 -mx-3 px-3">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 5. STORES & RESTAURANTS LIST */}
      <div className="space-y-3.5">
        {filteredStores.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-8 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-neutral-900">
                Henüz bu kategoride kayıtlı dükkan bulunmuyor
              </h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Mehmet Akif Mahallesi esnafı mısınız? Dijital vitrininizi ve QR menünüzü dakikalar içinde ücretsiz açın.
              </p>
            </div>
            {onOpenBusinessRegister && (
              <button
                onClick={onOpenBusinessRegister}
                className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
              >
                <Store className="w-3.5 h-3.5 text-amber-400" />
                <span>Dükkanınızı / İşletmenizi Kaydedin</span>
              </button>
            )}
          </div>
        ) : (
          filteredStores.map((store) => {
          const isFood = checkIsFoodStore(store);

          return (
            <div
              key={store.id}
              className="bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-xs hover:border-neutral-300 transition"
            >
              {/* Hero Image */}
              <div
                onClick={() => onOrderRestaurant(store, 1, isFood ? 'qr_menu' : 'magaza_vitrini')}
                className="relative h-44 w-full bg-neutral-900 overflow-hidden group cursor-pointer"
              >
                <img
                  src={store.image}
                  alt={store.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Tag Badges */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 flex-wrap">
                  <div className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {store.tag}
                  </div>
                  {isFood ? (
                    <div className="bg-amber-500/95 backdrop-blur-xs text-neutral-950 text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                      <span>🍽️ QR Menü Aktif</span>
                    </div>
                  ) : (
                    <div className="bg-blue-600/95 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
                      <Store className="w-3 h-3" />
                      <span>🛍️ Fiziki Mağaza Vitrini</span>
                    </div>
                  )}
                </div>

                {/* Top Rating */}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md flex items-center gap-1 text-white text-[11px] font-bold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{store.rating ? store.rating.toFixed(1) : 'Yeni'}</span>
                </div>
              </div>

              {/* Business Meta */}
              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3
                      onClick={() => onOrderRestaurant(store, 1, isFood ? 'qr_menu' : 'magaza_vitrini')}
                      className="text-[13.5px] font-black text-neutral-900 uppercase tracking-tight hover:text-rose-600 transition cursor-pointer leading-tight"
                    >
                      {store.name}
                    </h3>
                    {store.address && (
                      <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-medium mt-0.5">
                        <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span className="truncate">{store.address}</span>
                      </div>
                    )}
                  </div>

                  <span className="text-[10.5px] font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md shrink-0">
                    {store.time}
                  </span>
                </div>

                {/* PRODUCT SHOWCASE MINI CARDS PREVIEW */}
                {store.menu && store.menu.length > 0 && (
                  <div className="pt-1 border-t border-neutral-100">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                      {isFood ? 'Öne Çıkan Menü Çeşitleri:' : 'Vitrindeki Ürünler & Stok:'}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {store.menu.slice(0, 2).map((item, idx) => (
                        <div
                          key={`preview-${item.name}-${idx}`}
                          onClick={() => onOrderRestaurant(store, 1, isFood ? 'qr_menu' : 'magaza_vitrini')}
                          className="bg-neutral-50 p-2 rounded-xl border border-neutral-200/70 hover:border-neutral-300 transition cursor-pointer flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[11px] font-black text-neutral-900 truncate">
                                {item.name}
                              </span>
                              <span className="text-[10px] font-black text-rose-600 shrink-0">
                                {item.price}
                              </span>
                            </div>
                            {item.desc && (
                              <p className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5">
                                {item.desc}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-1 mt-1 text-[9px] font-bold">
                            <span
                              className={`px-1.5 py-0.2 rounded ${
                                item.stockStatus === 'out_of_stock' || item.inStock === false
                                  ? 'bg-rose-100 text-rose-800'
                                  : item.stockStatus === 'low_stock'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {item.stockStatus === 'out_of_stock' || item.inStock === false
                                ? 'Tükendi'
                                : item.stockStatus === 'low_stock'
                                ? 'Kritik Stok'
                                : 'Stokta Var'}
                            </span>

                            {item.sizes && item.sizes.length > 0 && (
                              <span className="text-neutral-400">
                                {item.sizes.length} Seçenek
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ACTIONS */}
                {isFood ? (
                  /* Yemek sektörü: Menüyü Gör */
                  <div className="pt-2 flex items-center gap-1.5">
                    <button
                      onClick={() => onOrderRestaurant(store, 1, 'qr_menu')}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 active:scale-98 text-neutral-950 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5 text-neutral-950" />
                      <span>Menüyü Gör</span>
                    </button>
                    {store.phone && (
                      <button
                        onClick={(e) => handleWhatsAppInquiry(store, undefined, e)}
                        className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white p-2 rounded-xl flex items-center justify-center transition shadow-xs shrink-0"
                        title="WhatsApp ile Sipariş / Bilgi"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {store.address && (
                      <button
                        onClick={(e) => handleOpenDirections(store, e)}
                        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 p-2 rounded-xl transition shrink-0 active:scale-95"
                        title="Haritada Yol Tarifi Al"
                      >
                        <Navigation className="w-3.5 h-3.5 text-amber-700" />
                      </button>
                    )}
                    {store.phone && (
                      <a
                        href={`tel:${store.phone.replace(/\s+/g, '')}`}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 p-2 rounded-xl transition shrink-0 active:scale-95"
                        title="Dükkanı Ara"
                      >
                        <Phone className="w-3.5 h-3.5 text-neutral-800" />
                      </a>
                    )}
                  </div>
                ) : (
                  /* Giyim ve diğer esnaf dükkanları: Zarif ve dengeli Mağazayı Gör */
                  <div className="pt-2 flex items-center gap-1.5">
                    <button
                      onClick={() => onOrderRestaurant(store, 1, 'magaza_vitrini')}
                      className="flex-1 bg-slate-900 hover:bg-black active:scale-98 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-sky-400" />
                      <span>Mağazayı Gör</span>
                    </button>

                    {store.phone && (
                      <button
                        onClick={(e) => handleWhatsAppInquiry(store, undefined, e)}
                        className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white p-2 rounded-xl flex items-center justify-center transition shadow-xs shrink-0"
                        title="WhatsApp ile Sor / Ayırt"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {store.address && (
                      <button
                        onClick={(e) => handleOpenDirections(store, e)}
                        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 p-2 rounded-xl transition shrink-0 active:scale-95"
                        title="Haritada Yol Tarifi Al"
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-600" />
                      </button>
                    )}

                    {store.phone && (
                      <a
                        href={`tel:${store.phone.replace(/\s+/g, '')}`}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 p-2 rounded-xl transition shrink-0 active:scale-95"
                        title="Dükkanı Ara"
                      >
                        <Phone className="w-3.5 h-3.5 text-neutral-800" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
      </div>
    </div>
  );
};
