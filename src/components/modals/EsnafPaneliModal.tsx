import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Store,
  Tag,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
  DollarSign,
  Percent,
  Calendar,
  Eye,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
  Briefcase,
  QrCode,
  Layers,
  Search,
  Check,
  Package,
  AlertTriangle,
  Download,
  Share2,
  Printer,
  Phone,
  MessageSquare,
  HelpCircle,
  UtensilsCrossed,
  Shirt,
  Megaphone,
} from 'lucide-react';
import { StoreShowcaseProduct, StoreCampaignItem, UserProfile, BusinessTypeMode, RestaurantItem } from '../../types';
import { ImageCropField } from '../ImageCropField';

interface EsnafPaneliModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile | null;
  ownStore?: RestaurantItem | null;
  onSyncStoreCampaigns?: (campaigns: any[]) => void;
  onOpenStorePreview?: (storeData: RestaurantItem) => void;
  onOpenStoryShare?: (prefill?: { title?: string; badge?: string }) => void;
  onSyncStoreProducts?: (
    storeName: string,
    products: StoreShowcaseProduct[],
    mode: BusinessTypeMode
  ) => void;
  onUpdateStoreDetails?: (details: {
    storeName: string;
    category: string;
    businessMode: BusinessTypeMode;
    phone: string;
    address: string;
    workingHours: string;
    description: string;
    image?: string;
  }) => void;
  onOpenJobs?: () => void;
}

export const EsnafPaneliModal: React.FC<EsnafPaneliModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  ownStore,
  onSyncStoreCampaigns,
  onOpenStorePreview,
  onOpenStoryShare,
  onSyncStoreProducts,
  onUpdateStoreDetails,
  onOpenJobs,
}) => {
  const [activeTab, setActiveTab] = useState<'urunler' | 'stok_fiyat' | 'qr_vitrin' | 'kampanyalar' | 'bilgiler'>('urunler');

  // Business Profile Info
  const [storeName, setStoreName] = useState(
    userProfile?.businessName || 'Mutlular Lezzet & Döner Sofrası'
  );
  const [storeCategory, setStoreCategory] = useState(
    userProfile?.businessCategory || 'Restoran, Lokanta & Döner'
  );
  const [storeAddress, setStoreAddress] = useState(
    userProfile?.businessAddress || 'Cumhuriyet Caddesi No: 18/A Mutlular'
  );
  const [storePhone, setStorePhone] = useState(
    userProfile?.phone || ''
  );
  const [isApproved, setIsApproved] = useState(
    userProfile?.businessApproved !== false
  );
  const [storeWorkingHours, setStoreWorkingHours] = useState('08:30 - 21:00');
  const [storeDescription, setStoreDescription] = useState(
    'Mutlular Çarşısı bünyesinde kaliteli ve güvenilir hizmet sunmaktadır.'
  );

  // Business Operating Mode (QR Menü vs Mağaza Vitrini)
  const initialMode: BusinessTypeMode = useMemo(() => {
    if (userProfile?.businessMode) return userProfile.businessMode;
    const cat = (userProfile?.businessCategory || '').toLowerCase();
    if (cat.includes('yemek') || cat.includes('cafe') || cat.includes('restoran') || cat.includes('döner') || cat.includes('fırın') || cat.includes('tatlı')) {
      return 'qr_menu';
    }
    return 'magaza_vitrini';
  }, [userProfile]);

  const [businessMode, setBusinessMode] = useState<BusinessTypeMode>(initialMode);
  const [storeImage, setStoreImage] = useState(ownStore?.image || '');

  // Ürünler işletme kaydından (Firestore: plus_isletmeler) canlı gelir
  const [products, setProducts] = useState<StoreShowcaseProduct[]>(ownStore?.products || []);

  // Sync when mode changes or profile changes
  useEffect(() => {
    if (userProfile?.businessName) {
      setStoreName(userProfile.businessName);
    }
    if (userProfile?.businessCategory) {
      setStoreCategory(userProfile.businessCategory);
    }
    if (userProfile?.businessAddress) {
      setStoreAddress(userProfile.businessAddress);
    }
    if (userProfile?.phone) {
      setStorePhone(userProfile.phone);
    }
    if (userProfile?.businessApproved !== undefined) {
      setIsApproved(userProfile.businessApproved);
    }
    if (userProfile?.businessMode) {
      setBusinessMode(userProfile.businessMode);
    }

  }, [userProfile, isOpen]);

  // Keep a stable ref to onSyncStoreProducts to avoid re-render dependency cascades
  const onSyncRef = useRef(onSyncStoreProducts);
  useEffect(() => {
    onSyncRef.current = onSyncStoreProducts;
  }, [onSyncStoreProducts]);

  const syncProductsToApp = (
    updatedProducts: StoreShowcaseProduct[],
    currentMode: BusinessTypeMode = businessMode
  ) => {
    onSyncRef.current?.(storeName, updatedProducts, currentMode);
  };

  // İşletme kaydı (Firestore) değiştikçe panel verisini güncelle
  useEffect(() => {
    if (!ownStore) return;
    setProducts(ownStore.products || []);
    if (ownStore.image) setStoreImage(ownStore.image);
    setCampaigns((ownStore.campaigns as StoreCampaignItem[]) || []);
  }, [ownStore]);

  // Campaigns & Coupons
  const [campaigns, setCampaigns] = useState<StoreCampaignItem[]>((ownStore?.campaigns as StoreCampaignItem[]) || []);

  // Product Add / Edit Form State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDiscountPrice, setProdDiscountPrice] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCategory, setProdCategory] = useState(businessMode === 'qr_menu' ? 'Ana Yemekler' : 'Üst Giyim');
  const [prodStockStatus, setProdStockStatus] = useState<'in_stock' | 'out_of_stock' | 'low_stock'>('in_stock');
  const [prodStockCount, setProdStockCount] = useState<string>('20');
  const [prodSizes, setProdSizes] = useState<string>('');
  const [prodBadge, setProdBadge] = useState<string>('');
  const [prodImage, setProdImage] = useState('');

  // Search & Filter in panel
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchProd, setSearchProd] = useState<string>('');

  // Selected Table for QR Generator
  const [selectedTableNo, setSelectedTableNo] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);

  // Toast feedback
  const [feedback, setFeedback] = useState<string | null>(null);
  const triggerFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  // Categories list based on mode
  const currentCategories = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.category || 'Genel')));
    return list;
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = filterCategory === 'all' || p.category === filterCategory;
      const matchSearch =
        !searchProd.trim() ||
        p.name.toLowerCase().includes(searchProd.toLowerCase()) ||
        (p.desc && p.desc.toLowerCase().includes(searchProd.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [products, filterCategory, searchProd]);

  if (!isOpen) return null;

  // Open Form to Add
  const handleOpenAdd = () => {
    setEditingProductId(null);
    setProdName('');
    setProdPrice('');
    setProdDiscountPrice('');
    setProdDesc('');
    setProdCategory(businessMode === 'qr_menu' ? 'Ana Yemekler' : 'Üst Giyim');
    setProdStockStatus('in_stock');
    setProdStockCount('15');
    setProdSizes(businessMode === 'qr_menu' ? 'Tek Porsiyon, 1.5 Porsiyon' : 'S, M, L, XL');
    setProdBadge('');
    setProdImage('');
    setIsAddingProduct(true);
  };

  // Open Form to Edit
  const handleOpenEdit = (p: StoreShowcaseProduct) => {
    setEditingProductId(p.id);
    setProdName(p.name);
    setProdPrice(p.price.replace(/[^\d]/g, ''));
    setProdDiscountPrice(p.discountPrice ? p.discountPrice.replace(/[^\d]/g, '') : '');
    setProdDesc(p.desc || '');
    setProdCategory(p.category || (businessMode === 'qr_menu' ? 'Ana Yemekler' : 'Üst Giyim'));
    setProdStockStatus(p.stockStatus || (p.inStock ? 'in_stock' : 'out_of_stock'));
    setProdStockCount(p.stockCount ? String(p.stockCount) : '10');
    setProdSizes((p.sizes || []).join(', '));
    setProdBadge(p.badge || '');
    setProdImage(p.image);
    setIsAddingProduct(true);
  };

  // Save product (Add or Edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodPrice.trim()) return;

    const formattedPrice = prodPrice.includes('₺') ? prodPrice.trim() : `${prodPrice.trim()} ₺`;
    const formattedDiscount = prodDiscountPrice
      ? prodDiscountPrice.includes('₺')
        ? prodDiscountPrice.trim()
        : `${prodDiscountPrice.trim()} ₺`
      : undefined;

    const parsedSizes = prodSizes
      ? prodSizes.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    const stockNumber = parseInt(prodStockCount, 10);

    const isInStock = prodStockStatus !== 'out_of_stock';

    if (editingProductId) {
      // Update existing
      const updated = products.map((item) =>
        item.id === editingProductId
          ? {
              ...item,
              name: prodName.trim(),
              price: formattedPrice,
              discountPrice: formattedDiscount,
              desc: prodDesc.trim() || 'Kaliteli mahalle esnafı ürünü.',
              category: prodCategory.trim() || 'Genel',
              stockStatus: prodStockStatus,
              stockCount: isNaN(stockNumber) ? undefined : stockNumber,
              inStock: isInStock,
              badge: prodBadge.trim() || (prodStockStatus === 'out_of_stock' ? 'Tükendi' : prodStockStatus === 'low_stock' ? 'Kritik Stok' : undefined),
              sizes: parsedSizes,
              image: prodImage,
            }
          : item
      );
      setProducts(updated);
      syncProductsToApp(updated);
      triggerFeedback('Ürün ve stok bilgileri başarıyla güncellendi!');
    } else {
      // Add new
      const newProd: StoreShowcaseProduct = {
        id: `prod-${Date.now()}`,
        name: prodName.trim(),
        price: formattedPrice,
        discountPrice: formattedDiscount,
        desc: prodDesc.trim() || (businessMode === 'qr_menu' ? 'Taze ve lezzetli menü çeşidi.' : 'Kaliteli mağaza ürünü.'),
        category: prodCategory.trim() || (businessMode === 'qr_menu' ? 'Ana Yemekler' : 'Üst Giyim'),
        stockStatus: prodStockStatus,
        stockCount: isNaN(stockNumber) ? undefined : stockNumber,
        inStock: isInStock,
        badge: prodBadge.trim() || (prodStockStatus === 'out_of_stock' ? 'Tükendi' : prodStockStatus === 'low_stock' ? 'Kritik Stok' : undefined),
        sizes: parsedSizes,
        image: prodImage,
        isFeatured: true,
      };
      const updated = [newProd, ...products];
      setProducts(updated);
      syncProductsToApp(updated);
      triggerFeedback(businessMode === 'qr_menu' ? 'Yeni yemek QR Menüye eklendi!' : 'Yeni ürün vitrine eklendi!');
    }

    setIsAddingProduct(false);
    setEditingProductId(null);
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    syncProductsToApp(updated);
    triggerFeedback('Ürün listeden silindi.');
  };

  // Quick cycle stock status (in_stock -> low_stock -> out_of_stock)
  const handleCycleStock = (id: string) => {
    const updated = products.map((p) => {
      if (p.id !== id) return p;
      const current = p.stockStatus || (p.inStock ? 'in_stock' : 'out_of_stock');
      let next: 'in_stock' | 'out_of_stock' | 'low_stock' = 'in_stock';
      if (current === 'in_stock') next = 'low_stock';
      else if (current === 'low_stock') next = 'out_of_stock';
      else next = 'in_stock';

      return {
        ...p,
        stockStatus: next,
        inStock: next !== 'out_of_stock',
        badge: next === 'out_of_stock' ? 'Tükendi' : next === 'low_stock' ? 'Kritik Stok' : p.badge === 'Tükendi' || p.badge === 'Kritik Stok' ? undefined : p.badge,
      };
    });
    setProducts(updated);
    syncProductsToApp(updated);
    triggerFeedback('Stok durumu güncellendi!');
  };

  // Quick Price Edit inline
  const handleQuickUpdatePrice = (id: string, newP: string) => {
    if (!newP.trim()) return;
    const formatted = newP.includes('₺') ? newP.trim() : `${newP.trim()} ₺`;
    const updated = products.map((p) => (p.id === id ? { ...p, price: formatted } : p));
    setProducts(updated);
    syncProductsToApp(updated);
    triggerFeedback('Fiyat güncellendi!');
  };

  // Quick Stock Quantity Increment / Decrement
  const handleAdjustStockCount = (id: string, delta: number) => {
    const updated = products.map((p) => {
      if (p.id !== id) return p;
      const currentCount = p.stockCount !== undefined ? p.stockCount : 10;
      const newCount = Math.max(0, currentCount + delta);
      const newStatus: 'in_stock' | 'low_stock' | 'out_of_stock' =
        newCount === 0 ? 'out_of_stock' : newCount <= 3 ? 'low_stock' : 'in_stock';
      return {
        ...p,
        stockCount: newCount,
        stockStatus: newStatus,
        inStock: newCount > 0,
        badge: newCount === 0 ? 'Tükendi' : newCount <= 3 ? `Son ${newCount} Adet` : p.badge === 'Tükendi' ? undefined : p.badge,
      };
    });
    setProducts(updated);
    syncProductsToApp(updated);
    triggerFeedback('Stok adedi güncellendi!');
  };

  // Mode Switcher handler
  const handleSwitchMode = (mode: BusinessTypeMode) => {
    setBusinessMode(mode);
    // Mod değişince mevcut ürünler korunur; sahte örnek ürün yüklenmez
    syncProductsToApp(products, mode);
    triggerFeedback(
      mode === 'qr_menu'
        ? 'İşletme QR Menü Sistemi moduna geçirildi!'
        : 'İşletme Mağaza Vitrini moduna geçirildi!'
    );
  };

  // Store Details Save handler
  const handleSaveStoreDetails = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!storeName.trim()) return;

    if (onUpdateStoreDetails) {
      onUpdateStoreDetails({
        storeName: storeName.trim(),
        category: storeCategory.trim(),
        businessMode,
        phone: storePhone.trim(),
        address: storeAddress.trim(),
        workingHours: storeWorkingHours.trim(),
        description: storeDescription.trim(),
        image: storeImage.trim(),
      });
    }

    syncProductsToApp(products, businessMode);
    triggerFeedback('Mağaza ve vitrin bilgileri başarıyla güncellendi!');
  };

  // Preview as customer in StoreDetailModal (Menüyü Görüntüle / Mağazayı Görüntüle)
  const handleCustomerPreview = () => {
    if (onOpenStorePreview) {
      const previewStore: RestaurantItem = {
        id: `store-preview-${Date.now()}`,
        name: storeName,
        tag: storeCategory,
        rating: 0,
        time: businessMode === 'qr_menu' ? 'QR Menü' : 'Mağaza',
        deliveryFee: businessMode === 'qr_menu' ? 'Menü Servisi' : 'Mağazada Teslim',
        minOrder: 'Yeni işletme',
        image: storeImage || '',
        category: businessMode === 'qr_menu' ? 'yemek' : 'giyim',
        businessMode,
        orderType: businessMode === 'qr_menu' ? 'online' : 'store_only',
        phone: storePhone,
        address: storeAddress,
        workingHours: storeWorkingHours,
        description: storeDescription || `${storeName} işletmesi dijital ${businessMode === 'qr_menu' ? 'QR Menü' : 'Mağaza Vitrini'} kataloğu.`,
        menu: products.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          discountPrice: p.discountPrice,
          desc: p.desc,
          image: p.image,
          category: p.category,
          inStock: p.inStock,
          stockStatus: p.stockStatus,
          stockCount: p.stockCount,
          sizes: p.sizes,
          badge: p.badge,
        })),
        products,
      };
      onOpenStorePreview(previewStore);
    }
  };

  const qrShareLink = `https://mutlular.plus/menu/${encodeURIComponent(storeName.toLowerCase().replace(/\s+/g, '-'))}?masa=${selectedTableNo}`;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 text-neutral-900 flex flex-col w-full h-full overflow-hidden animate-in fade-in duration-200">
      <div className="bg-white w-full h-full flex flex-col overflow-hidden">
        
        {/* ======================================================== */}
        {/* HEADER: İŞLETME ADI, MOD ROZETİ VE HIZLI EYLEMLER         */}
        {/* ======================================================== */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-neutral-950 via-slate-900 to-amber-950 text-white shrink-0 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-10 h-10 rounded-2xl p-0.5 flex items-center justify-center shadow-md shrink-0 ${
                  businessMode === 'qr_menu'
                    ? 'bg-gradient-to-br from-amber-500 to-rose-500 text-white'
                    : 'bg-gradient-to-br from-blue-500 to-sky-400 text-white'
                }`}
              >
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  {businessMode === 'qr_menu' ? (
                    <UtensilsCrossed className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Shirt className="w-5 h-5 text-blue-400" />
                  )}
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Esnaf Yönetim Paneli
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                      businessMode === 'qr_menu'
                        ? 'bg-rose-950/70 text-rose-300 border-rose-500/40'
                        : 'bg-blue-950/70 text-blue-300 border-blue-500/40'
                    }`}
                  >
                    {businessMode === 'qr_menu' ? (
                      <>
                        <QrCode className="w-3 h-3" />
                        <span>QR Menü Modu (Yemek)</span>
                      </>
                    ) : (
                      <>
                        <Store className="w-3 h-3" />
                        <span>Mağaza Vitrini Modu</span>
                      </>
                    )}
                  </span>
                </div>

                <h2 className="text-sm sm:text-base font-black text-white truncate mt-0.5">
                  {storeName}
                </h2>
                <div className="text-[10.5px] text-slate-300 flex items-center gap-1.5 truncate">
                  <span className="truncate">{storeCategory}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">Onaylı Esnaf</span>
                </div>
              </div>
            </div>

            {/* Sağ butonlar */}
            <div className="flex items-center gap-1.5 shrink-0">
              {onOpenStoryShare && (
                <button
                  type="button"
                  onClick={() =>
                    onOpenStoryShare({
                      title: `${storeName} Özel Fırsatı`,
                      badge: 'GÜNÜN FIRSATI',
                    })
                  }
                  title="Tam Ekran Hikayede Paylaş"
                  className="text-[11px] font-black px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-sm border bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white border-rose-400"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Hikaye Paylaş</span>
                  <span className="sm:hidden">Hikaye</span>
                </button>
              )}

              {onOpenStorePreview && (
                <button
                  onClick={handleCustomerPreview}
                  title="Müşteri Görünümü ile Aç"
                  className={`text-[11px] font-black px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-sm border ${
                    businessMode === 'qr_menu'
                      ? 'bg-amber-500 hover:bg-amber-600 text-neutral-950 border-amber-400'
                      : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500'
                  }`}
                >
                  {businessMode === 'qr_menu' ? (
                    <>
                      <UtensilsCrossed className="w-3.5 h-3.5 text-neutral-950" />
                      <span>Menüyü Gör</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-sky-200" />
                      <span>Mağazayı Gör</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Toast Bildirim Geri Bildirimi */}
          {feedback && (
            <div className="mt-2 py-1 px-3 bg-emerald-500 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 animate-in slide-in-from-top-1 shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* İŞLETME MODU SEÇİCİ ŞERİDİ (YEMEK / GİYİM AYRIMI)         */}
        {/* ======================================================== */}
        <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 text-xs flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
            <span className="font-bold text-slate-400 hidden sm:inline">İşletme Tipi:</span>
            <button
              onClick={() => handleSwitchMode('qr_menu')}
              className={`px-2 py-1 rounded-lg font-black transition flex items-center gap-1 ${
                businessMode === 'qr_menu'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <UtensilsCrossed className="w-3 h-3" />
              <span>🍽️ Yemek (QR Menü)</span>
            </button>
            <button
              onClick={() => handleSwitchMode('magaza_vitrini')}
              className={`px-2 py-1 rounded-lg font-black transition flex items-center gap-1 ${
                businessMode === 'magaza_vitrini'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Shirt className="w-3 h-3" />
              <span>🛍️ Giyim & Mağaza Vitrini</span>
            </button>
          </div>

          <div className="text-[10px] text-slate-400 font-medium hidden sm:block">
            {businessMode === 'qr_menu'
              ? 'Masalara karekod & yemek fiyatları'
              : 'Ürün vitrini & beden/stok durumu'}
          </div>
        </div>

        {/* ======================================================== */}
        {/* SEKME MENÜSÜ                                              */}
        {/* ======================================================== */}
        <div className="bg-neutral-100 px-2 py-1 border-b border-neutral-200 flex gap-1 text-[11px] font-bold shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('urunler')}
            className={`py-1.5 px-3 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'urunler'
                ? 'bg-slate-900 text-white font-black shadow-xs'
                : 'text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>{businessMode === 'qr_menu' ? 'QR Menü Yemekleri' : 'Vitrin Ürünleri'}</span>
            <span className="text-[9.5px] bg-white/20 text-white px-1.5 py-0.2 rounded-full font-black">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('stok_fiyat')}
            className={`py-1.5 px-3 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'stok_fiyat'
                ? 'bg-slate-900 text-white font-black shadow-xs'
                : 'text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hızlı Stok & Fiyat</span>
          </button>

          <button
            onClick={() => setActiveTab('qr_vitrin')}
            className={`py-1.5 px-3 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'qr_vitrin'
                ? 'bg-slate-900 text-white font-black shadow-xs'
                : 'text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {businessMode === 'qr_menu' ? (
              <>
                <QrCode className="w-3.5 h-3.5 text-rose-400" />
                <span>Masa QR Kodları</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Vitrin Paylaşım</span>
              </>
            )}
          </button>

          <button
            onClick={() => setActiveTab('kampanyalar')}
            className={`py-1.5 px-3 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'kampanyalar'
                ? 'bg-slate-900 text-white font-black shadow-xs'
                : 'text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <Percent className="w-3.5 h-3.5 text-amber-400" />
            <span>Kupon & İndirim</span>
          </button>

          <button
            onClick={() => setActiveTab('bilgiler')}
            className={`py-1.5 px-3 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'bilgiler'
                ? 'bg-slate-900 text-white font-black shadow-xs'
                : 'text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-blue-400" />
            <span>Mağaza Bilgileri & Profil</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* İÇERİK ALANI                                              */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-neutral-50/70 space-y-3 min-h-0">
          
          {/* -------------------------------------------------------- */}
          {/* SEKME 1: ÜRÜNLER / MENÜ YÖNETİMİ                         */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'urunler' && (
            <div className="space-y-3">
              {/* Ekleme ve Arama Çubuğu */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-white p-2.5 rounded-2xl border border-neutral-200 shadow-2xs">
                <div className="flex-1 flex items-center gap-1.5 bg-neutral-100 rounded-xl px-2.5 py-1.5">
                  <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <input
                    type="text"
                    placeholder={businessMode === 'qr_menu' ? 'Menüde yemek veya içecek ara...' : 'Vitrinde ürün ara...'}
                    value={searchProd}
                    onChange={(e) => setSearchProd(e.target.value)}
                    className="bg-transparent text-xs text-neutral-900 outline-none w-full placeholder-neutral-400 font-medium"
                  />
                  {searchProd && (
                    <button onClick={() => setSearchProd('')} className="text-neutral-400 hover:text-neutral-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleOpenAdd}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{businessMode === 'qr_menu' ? 'Yeni Yemek Ekle' : 'Yeni Ürün Ekle'}</span>
                  </button>
                </div>
              </div>

              {/* Kategori Filtre Butonları */}
              {currentCategories.length > 1 && (
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                  <button
                    onClick={() => setFilterCategory('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
                      filterCategory === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    Tümü ({products.length})
                  </button>
                  {currentCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
                        filterCategory === cat
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* ÜRÜN EKLEME / DÜZENLEME FORMU MODALI VEYA PANELİ */}
              {isAddingProduct && (
                <form
                  onSubmit={handleSaveProduct}
                  className="bg-white rounded-2xl p-3.5 sm:p-4 border-2 border-amber-400 shadow-md space-y-3 animate-in fade-in zoom-in-98 duration-150"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <h3 className="text-xs sm:text-sm font-black text-neutral-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>
                        {editingProductId
                          ? 'Ürünü Düzenle'
                          : businessMode === 'qr_menu'
                          ? 'Yeni Yemek / Menü Çeşidi Ekle'
                          : 'Yeni Vitrin Ürünü Ekle'}
                      </span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsAddingProduct(false)}
                      className="text-neutral-400 hover:text-neutral-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 1. Ürün Adı & Kategori */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                        {businessMode === 'qr_menu' ? 'Yemek / İçecek Adı *' : 'Ürün Adı *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        placeholder={businessMode === 'qr_menu' ? 'Örn: Maydonoz Soslu Tavuk Döner' : 'Örn: Keten Oversize Gömlek'}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-amber-500 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                        Kategori *
                      </label>
                      <input
                        type="text"
                        required
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value)}
                        placeholder={businessMode === 'qr_menu' ? 'Ana Yemek, Çorba, Tatlı, İçecek...' : 'Üst Giyim, Pantolon, Ayakkabı...'}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-amber-500 font-semibold"
                      />
                    </div>
                  </div>

                  {/* 2. Fiyat, İndirimli Fiyat ve Stok Durumu */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                        Satış Fiyatı *
                      </label>
                      <input
                        type="text"
                        required
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                        placeholder="Örn: 160 ₺"
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-amber-500 font-black text-rose-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                        İndirimli Fiyat (İsteğe bağlı)
                      </label>
                      <input
                        type="text"
                        value={prodDiscountPrice}
                        onChange={(e) => setProdDiscountPrice(e.target.value)}
                        placeholder="Örn: 140 ₺"
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                        Stok Durumu *
                      </label>
                      <select
                        value={prodStockStatus}
                        onChange={(e) => setProdStockStatus(e.target.value as any)}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-2.5 py-2 text-xs font-bold text-neutral-900 outline-none focus:border-amber-500"
                      >
                        <option value="in_stock">🟢 Stokta Var / Serviste</option>
                        <option value="low_stock">🟠 Kritik Stok (Son Adetler)</option>
                        <option value="out_of_stock">🔴 Tükendi / Kalmadı</option>
                      </select>
                    </div>
                  </div>

                  {/* 3. Porsiyon / Beden & Rozet */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                        {businessMode === 'qr_menu' ? 'Porsiyon Seçenekleri (Virgülle ayırın)' : 'Beden / Numara (Virgülle ayırın)'}
                      </label>
                      <input
                        type="text"
                        value={prodSizes}
                        onChange={(e) => setProdSizes(e.target.value)}
                        placeholder={businessMode === 'qr_menu' ? 'Tek Porsiyon, 1.5 Porsiyon' : 'S, M, L, XL veya 38, 40, 42'}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                        Özel Rozet / Etiket (İsteğe bağlı)
                      </label>
                      <input
                        type="text"
                        value={prodBadge}
                        onChange={(e) => setProdBadge(e.target.value)}
                        placeholder="Örn: Şefin Önerisi, Yeni Sezon, %15 İndirim"
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* 4. Açıklama */}
                  <div>
                    <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                      Açıklama (İçindekiler / Kumaş türü)
                    </label>
                    <textarea
                      rows={2}
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      placeholder={businessMode === 'qr_menu' ? 'Özel marineli tavuk, patates, turşu ve baharatlı sos.' : '100% pamuklu nefes alan kumaş, rahat kesim.'}
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* 5. Ürün fotoğrafı: gerçek yükleme + kırpma */}
                  <ImageCropField
                    label="Ürün Fotoğrafı"
                    value={prodImage}
                    onChange={setProdImage}
                    aspect={4 / 3}
                    outputWidth={900}
                    hint="Galeriden seçin ve kadrajı ayarlayın."
                  />

                  {/* Form Butonları */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => setIsAddingProduct(false)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-black bg-slate-900 hover:bg-black text-white shadow-xs transition active:scale-95 flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>{editingProductId ? 'Değişiklikleri Kaydet' : 'Ürünü Kaydet'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* ÜRÜN KARTLARI LİSTESİ */}
              <div className="space-y-2">
                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-neutral-200 text-center space-y-2">
                    <Package className="w-10 h-10 text-neutral-300 mx-auto" />
                    <h4 className="text-xs font-bold text-neutral-700">Henüz ürün bulunamadı</h4>
                    <p className="text-[11px] text-neutral-500">
                      Yukarıdaki butona tıklayarak ilk ürününüzü hemen ekleyebilirsiniz.
                    </p>
                  </div>
                ) : (
                  filteredProducts.map((p) => {
                    const isOutOfStock = p.stockStatus === 'out_of_stock';
                    const isLowStock = p.stockStatus === 'low_stock';

                    return (
                      <div
                        key={p.id}
                        className={`bg-white rounded-2xl p-3 border transition flex items-center justify-between gap-3 shadow-2xs hover:border-neutral-300 ${
                          isOutOfStock ? 'opacity-70 bg-neutral-50/70 border-rose-200' : 'border-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Ürün Görseli */}
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-neutral-100 border border-neutral-200">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            {isOutOfStock && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[9px] font-black uppercase">
                                Tükendi
                              </div>
                            )}
                          </div>

                          {/* Ürün Bilgileri */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[9.5px] font-bold bg-neutral-100 text-neutral-700 px-1.5 py-0.2 rounded">
                                {p.category || 'Genel'}
                              </span>

                              {/* Stok Rozeti */}
                              <button
                                onClick={() => handleCycleStock(p.id)}
                                title="Stok durumunu değiştirmek için tıklayın"
                                className={`text-[9.5px] font-black px-2 py-0.2 rounded-full cursor-pointer transition active:scale-95 flex items-center gap-1 ${
                                  isOutOfStock
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : isLowStock
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                <span>{isOutOfStock ? 'Tükendi' : isLowStock ? 'Kritik Stok' : 'Stokta Var'}</span>
                              </button>

                              {p.badge && (
                                <span className="text-[9.5px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded">
                                  {p.badge}
                                </span>
                              )}
                            </div>

                            <h4 className="text-xs font-black text-neutral-900 mt-1 truncate">
                              {p.name}
                            </h4>

                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-black text-rose-600">
                                {p.price}
                              </span>
                              {p.discountPrice && (
                                <span className="text-[10px] text-neutral-400 line-through font-medium">
                                  {p.discountPrice}
                                </span>
                              )}
                              {p.sizes && p.sizes.length > 0 && (
                                <span className="text-[10px] text-neutral-500 hidden sm:inline">
                                  • {p.sizes.join(' / ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Sağ Eylemler: Hızlı Stok, Düzenle, Sil */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleCycleStock(p.id)}
                            title="Stok Durumunu Değiştir"
                            className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
                          >
                            <Package className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(p)}
                            title="Düzenle"
                            className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            title="Sil"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* SEKME 2: HIZLI STOK & FİYAT YÖNETİMİ TABLOSU             */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'stok_fiyat' && (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-emerald-400" />
                    <span>Hızlı Stok ve Fiyat Güncelleme Tablosu</span>
                  </h4>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    Günlük fiyatlarınızı tek tıkla yazın ve stok durumunu (Stokta Var / Tükendi) anında değiştirin.
                  </p>
                </div>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Canlı Senkron
                </span>
              </div>

              {/* Hızlı Tablo */}
              <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden divide-y divide-neutral-100">
                {products.map((item) => {
                  const isOut = item.stockStatus === 'out_of_stock';
                  const isLow = item.stockStatus === 'low_stock';

                  return (
                    <div
                      key={item.id}
                      className="p-2.5 sm:p-3 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                        <div className="min-w-0">
                          <h5 className="font-bold text-neutral-900 truncate text-[11.5px]">
                            {item.name}
                          </h5>
                          <span className="text-[10px] text-neutral-400">
                            {item.category || 'Genel'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap justify-end">
                        {/* Hızlı Fiyat Inputu */}
                        <div className="flex items-center bg-neutral-100 rounded-xl px-2 py-1 border border-neutral-200 w-24">
                          <input
                            type="text"
                            defaultValue={item.price}
                            onBlur={(e) => handleQuickUpdatePrice(item.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleQuickUpdatePrice(item.id, (e.target as HTMLInputElement).value);
                              }
                            }}
                            className="bg-transparent text-xs font-black text-rose-600 outline-none w-full"
                            title="Fiyatı doğrudan değiştirebilirsiniz (Enter ile kaydeder)"
                          />
                        </div>

                        {/* Stok Adedi Sayacı (+ / -) */}
                        <div className="flex items-center gap-1 bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded-xl">
                          <button
                            type="button"
                            onClick={() => handleAdjustStockCount(item.id, -1)}
                            className="w-5 h-5 rounded-md bg-white border border-neutral-200 text-neutral-700 font-bold flex items-center justify-center hover:bg-neutral-50 active:scale-95 text-xs"
                            title="Stok adedini 1 azalt"
                          >
                            -
                          </button>
                          <span className="text-[11px] font-black text-neutral-800 px-1 min-w-[20px] text-center">
                            {item.stockCount !== undefined ? item.stockCount : 10}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAdjustStockCount(item.id, 1)}
                            className="w-5 h-5 rounded-md bg-white border border-neutral-200 text-neutral-700 font-bold flex items-center justify-center hover:bg-neutral-50 active:scale-95 text-xs"
                            title="Stok adedini 1 artır"
                          >
                            +
                          </button>
                        </div>

                        {/* Hızlı Stok Durum Butonu */}
                        <button
                          type="button"
                          onClick={() => handleCycleStock(item.id)}
                          className={`text-[10.5px] font-black px-2.5 py-1 rounded-xl transition active:scale-95 flex items-center gap-1 border shrink-0 ${
                            isOut
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : isLow
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                          title="Stok durumunu hızlı değiştir (Stokta -> Kritik -> Tükendi)"
                        >
                          <span className={`w-2 h-2 rounded-full ${isOut ? 'bg-rose-600' : isLow ? 'bg-amber-600' : 'bg-emerald-600'}`} />
                          <span>
                            {isOut ? 'Tükendi' : isLow ? 'Kritik' : 'Stokta Var'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* SEKME 3: QR MENÜ & MASA KODLARI (YEMEK İŞLETMESİ İÇİN)   */}
          {/* VEYA VİTRİN PAYLAŞIM (GİYİM MAĞAZALARI İÇİN)             */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'qr_vitrin' && (
            <div className="space-y-3">
              {businessMode === 'qr_menu' ? (
                /* YEMEK İŞLETMESİ: MASA QR MENÜ SİSTEMİ */
                <div className="space-y-3">
                  <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-amber-950 text-white p-4 rounded-2xl shadow-sm border border-neutral-800">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                      <QrCode className="w-4 h-4" />
                      <span>Masaya Özel Dijital QR Menü Sistemi</span>
                    </div>
                    <h3 className="text-base font-black text-white mt-1">
                      {storeName} Masa Karekodları
                    </h3>
                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                      Müşterileriniz masadaki QR kodu telefon kamerasıyla okutarak anında güncel menünüze, porsiyon fiyatlarınıza ve mutfak stok durumunuza ulaşabilir.
                    </p>
                  </div>

                  {/* Masa Seçici & Önizleme Kartı */}
                  <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-neutral-900">
                        Masa Seçimi:
                      </span>
                      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <button
                            key={num}
                            onClick={() => setSelectedTableNo(num)}
                            className={`w-7 h-7 rounded-lg text-xs font-black transition ${
                              selectedTableNo === num
                                ? 'bg-amber-500 text-neutral-950 shadow-xs'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Masa QR Kartı Simülasyonu */}
                    <div className="p-4 bg-gradient-to-b from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-300 text-center space-y-2 max-w-xs mx-auto">
                      <div className="text-[10px] font-black uppercase tracking-widest text-amber-900">
                        {storeName}
                      </div>
                      <div className="text-sm font-black text-neutral-900">
                        MASA #{selectedTableNo}
                      </div>

                      {/* Simüle Edilmiş SVG QR Kodu */}
                      <div className="w-36 h-36 mx-auto bg-white p-2.5 rounded-2xl shadow-md border border-neutral-200 flex flex-col items-center justify-center">
                        <QrCode className="w-28 h-28 text-neutral-950" />
                        <span className="text-[8px] font-black text-amber-700 uppercase mt-0.5">
                          Menüyü Okutun
                        </span>
                      </div>

                      <p className="text-[10px] text-amber-900 font-semibold leading-tight">
                        Kameranızı açarak masadan temassız sipariş verin & fiyatları inceleyin
                      </p>
                    </div>

                    {/* QR İndir & Paylaş Butonları */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => {
                          window.print();
                        }}
                        className="py-2.5 px-3 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
                      >
                        <Printer className="w-4 h-4 text-amber-400" />
                        <span>Masa {selectedTableNo} QR Yazdır</span>
                      </button>

                      <button
                        onClick={handleCustomerPreview}
                        className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Menüyü Görüntüle</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* GİYİM & PERAKENDE: MAĞAZA VİTRİNİ PAYLAŞIM */
                <div className="space-y-3">
                  <div className="bg-gradient-to-br from-slate-900 via-neutral-900 to-blue-950 text-white p-4 rounded-2xl shadow-sm border border-neutral-800">
                    <div className="flex items-center gap-2 text-blue-400 text-xs font-black uppercase tracking-wider">
                      <Store className="w-4 h-4" />
                      <span>Dijital Mağaza Vitrini & Katalog</span>
                    </div>
                    <h3 className="text-base font-black text-white mt-1">
                      {storeName} Vitrin Kataloğu
                    </h3>
                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                      Müşterileriniz vitrininizi gezebilir, yeni sezon ürünlerinizi, bedenlerini ve stok durumlarını inceleyerek WhatsApp üzerinden doğrudan ayırtabilir.
                    </p>
                  </div>

                  {/* Paylaşım ve Önizleme Seçenekleri */}
                  <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-blue-900 uppercase">
                        Vitrin Paylaşım Bağlantınız:
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={`https://mutlular.plus/vitrin/${encodeURIComponent(storeName.toLowerCase().replace(/\s+/g, '-'))}`}
                          className="w-full bg-white border border-blue-300 rounded-lg px-2 py-1 text-xs text-neutral-800 font-mono"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`https://mutlular.plus/vitrin/${encodeURIComponent(storeName.toLowerCase().replace(/\s+/g, '-'))}`);
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 2000);
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shrink-0 transition"
                        >
                          {copiedLink ? 'Kopyalandı' : 'Kopyala'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`${storeName} yeni sezon vitrin ürünleri ve stok durumu: https://mutlular.plus/vitrin`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>WhatsApp Kataloğunda Paylaş</span>
                      </a>

                      <button
                        onClick={handleCustomerPreview}
                        className="py-2 px-3 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-sky-400" />
                        <span>Mağazayı Gör</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* SEKME 4: KAMPANYALAR & KUPONLAR                           */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'kampanyalar' && (
            <div className="space-y-3">
              <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-neutral-900 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-amber-500" />
                    <span>Aktif Kampanyalar & İndirim Kuponları</span>
                  </h4>

                  {onOpenStoryShare && (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenStoryShare({
                          title: `${storeName} Özel İndirim Kampanyası!`,
                          badge: '%20 İNDİRİM',
                        })
                      }
                      className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-[11px] rounded-lg flex items-center gap-1 transition active:scale-95 shadow-2xs"
                    >
                      <Megaphone className="w-3.5 h-3.5" />
                      <span>+ Yeni Hikaye Paylaş</span>
                    </button>
                  )}
                </div>

                {/* Hikaye Paylaşım Bilgilendirme Kutusu */}
                <div className="p-3 bg-gradient-to-r from-slate-900 via-neutral-900 to-amber-950 text-white rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                      <Megaphone className="w-3.5 h-3.5" />
                      <span>Mahalle Vitrininde Tam Ekran İzleme</span>
                    </div>
                    <p className="text-xs font-bold text-white mt-0.5">
                      Kampanyanızı vitrin altındaki hikayelerde canlı yayına alın!
                    </p>
                    <p className="text-[10.5px] text-neutral-300 mt-0.5">
                      Sakinler yuvarlak profil çemberine tıkladığında tam ekran video veya görsel olarak izler, doğrudan WhatsApp ile sipariş verir.
                    </p>
                  </div>
                </div>

                {campaigns.map((camp) => (
                  <div
                    key={camp.id}
                    className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black bg-amber-500 text-neutral-950 px-2 py-0.5 rounded">
                          {camp.code}
                        </span>
                        <span className="text-xs font-bold text-neutral-900 truncate">
                          {camp.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 mt-0.5 line-clamp-1">
                        {camp.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onOpenStoryShare && (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenStoryShare({
                              title: camp.title,
                              badge: camp.code || '% İNDİRİM',
                            })
                          }
                          className="px-2.5 py-1.5 bg-neutral-900 hover:bg-black active:scale-95 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-2xs transition"
                          title="Bu kampanyayı tam ekran hikayede paylaş"
                        >
                          <Megaphone className="w-3 h-3 text-amber-400" />
                          <span>Hikayede Paylaş</span>
                        </button>
                      )}

                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                        Aktif Kupon
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* SEKME 5: MAĞAZA BİLGİLERİ & PROFİL YÖNETİMİ              */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'bilgiler' && (
            <div className="space-y-3.5">
              <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-amber-500" />
                    <div>
                      <h4 className="text-sm font-black text-neutral-900">
                        Mağaza & Vitrin Bilgileri
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        Dükkan adınızı, kategorinizi, iletişim bilgilerinizi ve vitrin görünümünüzü düzenleyin
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                    businessMode === 'qr_menu'
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : 'bg-blue-50 text-blue-900 border-blue-300'
                  }`}>
                    {businessMode === 'qr_menu' ? '🍽️ Yemek Modu' : '🛍️ Giyim / Mağaza Modu'}
                  </span>
                </div>

                <form onSubmit={handleSaveStoreDetails} className="space-y-3.5">
                  {/* Sektör Bilgilendirme Kartı */}
                  <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-neutral-700 leading-snug space-y-1">
                      <p className="font-bold text-neutral-900">
                        Müşteri Buton & Vitrin Kuralı:
                      </p>
                      <p className="text-[11px]">
                        İşletmeniz <strong>Yemek</strong> sektöründe ise esnaf vitrininde ve aramalarda müşterilerinize{' '}
                        <strong className="text-amber-800">&ldquo;Menüyü Gör&rdquo;</strong> butonu gösterilir ve masadan QR sipariş sistemi açılır.
                      </p>
                      <p className="text-[11px]">
                        <strong>Giyim ve diğer</strong> sektörlerde ise{' '}
                        <strong className="text-blue-800">&ldquo;Mağazayı Gör&rdquo;</strong> butonu gösterilir; ürünleriniz, bedenleriniz ve stok durumu sergilenir.
                      </p>
                    </div>
                  </div>

                  {/* 1. İşletme Adı & Kategori */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                        İşletme / Mağaza Adı *
                      </label>
                      <input
                        type="text"
                        required
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="Örn: Mutlular Lezzet Döner Sofrası"
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-bold text-neutral-900 outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                        Sektör / Kategori Etiketi *
                      </label>
                      <input
                        type="text"
                        required
                        value={storeCategory}
                        onChange={(e) => setStoreCategory(e.target.value)}
                        placeholder="Örn: Restoran & Lokanta, Giyim & Butik, Şarküteri..."
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-bold text-neutral-900 outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* 2. Mod Seçimi */}
                  <div>
                    <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                      İşletme Sektör Tipi & Buton Formatı *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSwitchMode('qr_menu')}
                        className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 ${
                          businessMode === 'qr_menu'
                            ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400/40 text-neutral-950'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0">
                          <UtensilsCrossed className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black flex items-center gap-1.5">
                            <span>🍽️ Yemek Sektörü</span>
                            <span className="text-[9px] bg-amber-200 text-amber-950 px-1.5 py-0.2 rounded font-black">
                              Menüyü Gör
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-500 mt-0.5">
                            Masa karekodları, temassız menü ve porsiyon siparişi.
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSwitchMode('magaza_vitrini')}
                        className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 ${
                          businessMode === 'magaza_vitrini'
                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-400/40 text-neutral-950'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Shirt className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black flex items-center gap-1.5">
                            <span>🛍️ Giyim & Diğer Sektör</span>
                            <span className="text-[9px] bg-blue-200 text-blue-950 px-1.5 py-0.2 rounded font-black">
                              Mağazayı Gör
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-500 mt-0.5">
                            Vitrindeki ürünler, beden seçenekleri ve WhatsApp rezervasyonu.
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* 3. Telefon & Çalışma Saatleri */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                        İletişim & WhatsApp Telefonu *
                      </label>
                      <input
                        type="text"
                        required
                        value={storePhone}
                        onChange={(e) => setStorePhone(e.target.value)}
                        placeholder="Örn: 0532 990 12 34"
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-900 outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                        Çalışma Saatleri
                      </label>
                      <input
                        type="text"
                        value={storeWorkingHours}
                        onChange={(e) => setStoreWorkingHours(e.target.value)}
                        placeholder="Örn: 08:30 - 21:00 (Hergün Açık)"
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-900 outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* 4. Adres */}
                  <div>
                    <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                      Açık Adres (Harita Yol Tarifi İçin)
                    </label>
                    <input
                      type="text"
                      value={storeAddress}
                      onChange={(e) => setStoreAddress(e.target.value)}
                      placeholder="Örn: Cumhuriyet Cad. No: 18/A Mutlular Mah. Osmangazi / Bursa"
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-900 outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* 5. Açıklama */}
                  <div>
                    <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                      Mağaza Tanıtımı & Slogan
                    </label>
                    <textarea
                      rows={2}
                      value={storeDescription}
                      onChange={(e) => setStoreDescription(e.target.value)}
                      placeholder="İşletmenizi mahalle sakinlerine anlatan kısa ve samimi bir açıklama..."
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-amber-500 resize-none font-medium"
                    />
                  </div>

                  {/* 6. Kapak fotoğrafı: gerçek yükleme + kırpma */}
                  <ImageCropField
                    label="Mağaza Kapak Fotoğrafı"
                    value={storeImage}
                    onChange={setStoreImage}
                    aspect={16 / 9}
                    outputWidth={1200}
                    hint="Galeriden seçin ve kadrajı ayarlayın."
                  />

                  {/* Eylemler: Kaydet & Önizleme */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950 hover:to-neutral-900 active:scale-98 text-white font-black text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Değişiklikleri Kaydet & Vitrine Yansıt</span>
                    </button>

                    {onOpenStorePreview && (
                      <button
                        type="button"
                        onClick={handleCustomerPreview}
                        className={`active:scale-98 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs shrink-0 ${
                          businessMode === 'qr_menu'
                            ? 'bg-amber-500 hover:bg-amber-600 text-neutral-950'
                            : 'bg-neutral-900 hover:bg-black text-white'
                        }`}
                      >
                        {businessMode === 'qr_menu' ? (
                          <>
                            <UtensilsCrossed className="w-3.5 h-3.5 text-neutral-950" />
                            <span>Menüyü Gör</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 text-sky-400" />
                            <span>Mağazayı Gör</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* ALT FOOTER                                                */}
        {/* ======================================================== */}
        <div className="p-3 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between gap-2 text-xs text-neutral-500 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium hidden sm:inline">
              {businessMode === 'qr_menu' ? '🍽️ QR Menü & Mutfak Stok Sistemi' : '🛍️ Dijital Mağaza Vitrini'}
            </span>
            {onOpenStorePreview && (
              <button
                onClick={handleCustomerPreview}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-xs ${
                  businessMode === 'qr_menu'
                    ? 'bg-amber-500 hover:bg-amber-600 text-neutral-950'
                    : 'bg-slate-900 hover:bg-black text-white'
                }`}
              >
                {businessMode === 'qr_menu' ? (
                  <>
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                    <span>Menüyü Gör</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                    <span>Mağazayı Gör</span>
                  </>
                )}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold px-4 py-1.5 rounded-xl transition text-xs ml-auto"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
