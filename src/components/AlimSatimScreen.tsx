import React, { useState } from 'react';
import {
  Building2,
  BedDouble,
  Layers,
  MapPin,
  Maximize2,
  PlusCircle,
  Search,
  Filter,
  Car,
  Home,
  Tag,
  KeyRound,
  BadgeDollarSign,
  PackageOpen,
  Wheat,
  Warehouse,
  Compass,
  Phone,
  MessageCircle,
  Sparkles,
  Tv,
  Sofa,
  Smartphone,
  ChevronRight,
} from 'lucide-react';
import { ClassifiedItem, ClassifiedMainCategory, ClassifiedSubCategory } from '../types';

interface AlimSatimScreenProps {
  items: ClassifiedItem[];
  onSelectItem: (item: ClassifiedItem) => void;
  onOpenCreateAd: () => void;
}

export const AlimSatimScreen: React.FC<AlimSatimScreenProps> = ({
  items,
  onSelectItem,
  onOpenCreateAd,
}) => {
  // 3 Üst Kategori: 'kiralik' | 'satilik' | 'ikinci-el'
  const [activeMainCategory, setActiveMainCategory] = useState<ClassifiedMainCategory>('satilik');
  // Alt kategori filtresi: 'tumu' veya spesifik alt kategori
  const [activeSubCategory, setActiveSubCategory] = useState<string>('tumu');
  const [searchQuery, setSearchQuery] = useState('');

  // Ana kategori değiştiğinde alt filtreyi sıfırla
  const handleSelectMainCategory = (cat: ClassifiedMainCategory) => {
    setActiveMainCategory(cat);
    setActiveSubCategory('tumu');
  };

  // İlgili ana kategoriye göre tanımlı alt kategoriler
  const getSubCategories = () => {
    if (activeMainCategory === 'kiralik') {
      return [
        { id: 'tumu', label: 'Tümü' },
        { id: 'ev', label: 'Ev / Daire', icon: Home },
        { id: 'tarla', label: 'Tarla', icon: Wheat },
        { id: 'arac', label: 'Araç', icon: Car },
        { id: 'arsa', label: 'Arsa', icon: Compass },
        { id: 'depo', label: 'Depo', icon: Warehouse },
      ];
    }
    if (activeMainCategory === 'satilik') {
      return [
        { id: 'tumu', label: 'Tümü' },
        { id: 'ev', label: 'Ev / Konut', icon: Home },
        { id: 'tarla', label: 'Tarla', icon: Wheat },
        { id: 'arsa', label: 'Arsa', icon: Compass },
        { id: 'depo', label: 'Depo', icon: Warehouse },
        { id: 'arac', label: 'Araç', icon: Car },
      ];
    }
    // 2. El: Her Şey
    return [
      { id: 'tumu', label: 'Tümü (Her Şey)' },
      { id: 'elektronik', label: 'Elektronik & Telefon', icon: Smartphone },
      { id: 'esya', label: 'Ev Eşyası & Mobilya', icon: Sofa },
      { id: 'arac', label: 'Vasıta & Traktör', icon: Car },
      { id: 'diger', label: 'Diğer / Her Şey', icon: PackageOpen },
    ];
  };

  const currentSubCategories = getSubCategories();

  // Filtreleme mantığı
  const filteredItems = items.filter((item) => {
    // 1. Ana Kategori Eşleşmesi
    let matchesMain = false;
    if (item.mainCategory) {
      matchesMain = item.mainCategory === activeMainCategory;
    } else {
      // Geriye dönük uyumluluk
      if (activeMainCategory === 'satilik') {
        matchesMain = item.tag?.toUpperCase().includes('SATILIK') || item.categoryType === 'emlak';
      } else if (activeMainCategory === 'kiralik') {
        matchesMain = item.tag?.toUpperCase().includes('KİRALIK') || item.price?.includes('ay') || item.price?.includes('gün');
      } else if (activeMainCategory === 'ikinci-el') {
        matchesMain = item.tag?.toUpperCase().includes('2. EL') || item.categoryType === 'ikinci-el';
      }
    }

    if (!matchesMain) return false;

    // 2. Alt Kategori Eşleşmesi
    if (activeSubCategory !== 'tumu') {
      if (item.subCategory) {
        if (item.subCategory !== activeSubCategory) {
          // 2. elde diger seçildiğinde veya spesifik durumlar
          if (!(activeSubCategory === 'diger' && !['elektronik', 'esya', 'arac'].includes(item.subCategory))) {
            return false;
          }
        }
      } else {
        // Fallback checks
        const text = (item.title + ' ' + (item.description || '')).toLowerCase();
        if (activeSubCategory === 'ev' && !text.includes('daire') && !text.includes('ev') && !text.includes('konut')) return false;
        if (activeSubCategory === 'tarla' && !text.includes('tarla') && !text.includes('dönüm')) return false;
        if (activeSubCategory === 'arac' && !text.includes('araba') && !text.includes('model') && !text.includes('oto')) return false;
        if (activeSubCategory === 'arsa' && !text.includes('arsa') && !text.includes('parsel')) return false;
        if (activeSubCategory === 'depo' && !text.includes('depo') && !text.includes('atölye')) return false;
      }
    }

    // 3. Arama Metni Eşleşmesi
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.agency && item.agency.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }

    return true;
  });

  // Kategoriye özel stil / rozet renkleri
  const getMainCategoryTheme = () => {
    switch (activeMainCategory) {
      case 'kiralik':
        return {
          bg: 'bg-emerald-600',
          lightBg: 'bg-emerald-50',
          textColor: 'text-emerald-700',
          borderColor: 'border-emerald-200',
          badgeBg: 'bg-emerald-600',
          bannerTitle: 'Kiralık İlanları',
          bannerDesc: 'Kiralık ev, tarla, araç, arsa ve depo fırsatları',
        };
      case 'satilik':
        return {
          bg: 'bg-rose-600',
          lightBg: 'bg-rose-50',
          textColor: 'text-rose-700',
          borderColor: 'border-rose-200',
          badgeBg: 'bg-rose-600',
          bannerTitle: 'Satılık İlanları',
          bannerDesc: 'Satılık ev, tarla, arsa, depo ve vasıta seçenekleri',
        };
      case 'ikinci-el':
        return {
          bg: 'bg-amber-600',
          lightBg: 'bg-amber-50',
          textColor: 'text-amber-800',
          borderColor: 'border-amber-200',
          badgeBg: 'bg-amber-600',
          bannerTitle: '2. El Pazarı (Her Şey)',
          bannerDesc: 'Elektronik, eşya, vasıta ve aradığınız her şey burada',
        };
    }
  };

  const theme = getMainCategoryTheme();

  return (
    <div className="p-3 sm:p-4 space-y-3.5 pb-24 animate-in fade-in duration-200">
      {/* 1. Üst Kategori Seçim Kartları (3 Ana Kategori) */}
      <div className="grid grid-cols-3 gap-2">
        {/* Kiralık */}
        <button
          onClick={() => handleSelectMainCategory('kiralik')}
          className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl border transition-all ${
            activeMainCategory === 'kiralik'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-[1.02]'
              : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 shadow-2xs'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 transition-colors ${
              activeMainCategory === 'kiralik'
                ? 'bg-white/20 text-white'
                : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            <KeyRound className="w-5 h-5 stroke-[2.3]" />
          </div>
          <span className="text-[13px] font-black tracking-tight leading-tight">
            Kiralık
          </span>
          <span
            className={`text-[9.5px] font-semibold mt-0.5 ${
              activeMainCategory === 'kiralik' ? 'text-emerald-100' : 'text-neutral-400'
            }`}
          >
            Ev, Tarla, Araç
          </span>
        </button>

        {/* Satılık */}
        <button
          onClick={() => handleSelectMainCategory('satilik')}
          className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl border transition-all ${
            activeMainCategory === 'satilik'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20 scale-[1.02]'
              : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 shadow-2xs'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 transition-colors ${
              activeMainCategory === 'satilik'
                ? 'bg-white/20 text-white'
                : 'bg-rose-50 text-rose-600'
            }`}
          >
            <BadgeDollarSign className="w-5 h-5 stroke-[2.3]" />
          </div>
          <span className="text-[13px] font-black tracking-tight leading-tight">
            Satılık
          </span>
          <span
            className={`text-[9.5px] font-semibold mt-0.5 ${
              activeMainCategory === 'satilik' ? 'text-rose-100' : 'text-neutral-400'
            }`}
          >
            Ev, Tarla, Arsa
          </span>
        </button>

        {/* 2. El */}
        <button
          onClick={() => handleSelectMainCategory('ikinci-el')}
          className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl border transition-all ${
            activeMainCategory === 'ikinci-el'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20 scale-[1.02]'
              : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 shadow-2xs'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 transition-colors ${
              activeMainCategory === 'ikinci-el'
                ? 'bg-white/20 text-white'
                : 'bg-amber-50 text-amber-600'
            }`}
          >
            <PackageOpen className="w-5 h-5 stroke-[2.3]" />
          </div>
          <span className="text-[13px] font-black tracking-tight leading-tight">
            2. El
          </span>
          <span
            className={`text-[9.5px] font-semibold mt-0.5 ${
              activeMainCategory === 'ikinci-el' ? 'text-amber-100' : 'text-neutral-400'
            }`}
          >
            Her Şey Burada
          </span>
        </button>
      </div>

      {/* 2. Search & İlan Ver Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative flex items-center bg-white border border-neutral-200 rounded-2xl px-3 py-2 shadow-2xs">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`${
              activeMainCategory === 'kiralik'
                ? 'Kiralık ilanlarda ara...'
                : activeMainCategory === 'satilik'
                ? 'Satılık ilanlarda ara...'
                : '2. El ilanlarında her şeyi ara...'
            }`}
            className="w-full bg-transparent text-[12px] font-semibold text-neutral-800 placeholder-neutral-400 pl-2 outline-none"
          />
        </div>

        {/* + İlan Ver Button */}
        <button
          onClick={onOpenCreateAd}
          className={`h-9 px-3.5 rounded-2xl text-white font-extrabold text-[12px] flex items-center gap-1.5 shadow-sm transition shrink-0 active:scale-95 ${theme.bg}`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>İlan Ver</span>
        </button>
      </div>

      {/* 3. Alt Kategori Hap Butonları (Subcategory Chips) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {currentSubCategories.map((sub) => {
          const isSelected = activeSubCategory === sub.id;
          const SubIcon = sub.icon;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubCategory(sub.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-black flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
                isSelected
                  ? `${theme.bg} text-white shadow-xs`
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              {SubIcon && <SubIcon className="w-3.5 h-3.5" />}
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Bilgi Şeridi */}
      <div
        className={`${theme.lightBg} border ${theme.borderColor} rounded-2xl px-3 py-2 flex items-center justify-between gap-2`}
      >
        <div className="flex items-center gap-2">
          <Sparkles className={`w-4 h-4 ${theme.textColor} shrink-0`} />
          <span className={`text-[11px] font-extrabold ${theme.textColor}`}>
            {theme.bannerTitle} • {theme.bannerDesc}
          </span>
        </div>
        <span
          className={`text-[10px] font-black px-2 py-0.5 rounded-full bg-white shadow-2xs ${theme.textColor}`}
        >
          {filteredItems.length} İlan
        </span>
      </div>

      {/* 5. İlan Kartları Listesi */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          // Tag rozet rengi
          const isRental = item.mainCategory === 'kiralik' || item.tag?.includes('KİRALIK');
          const isSecondHand = item.mainCategory === 'ikinci-el' || item.tag?.includes('2. EL');
          const badgeClass = isRental
            ? 'bg-emerald-600 text-white'
            : isSecondHand
            ? 'bg-amber-600 text-white'
            : 'bg-rose-600 text-white';

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="bg-white rounded-3xl border border-neutral-200/90 p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer active:scale-[0.99] select-none"
            >
              <div className="flex items-start gap-3.5">
                {/* Sol Görsel + Rozet */}
                <div className="relative w-[124px] h-[96px] rounded-2xl overflow-hidden shrink-0 bg-neutral-100 shadow-2xs">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Rozet */}
                  <div
                    className={`absolute top-1.5 left-1.5 ${badgeClass} font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-tight shadow-xs`}
                  >
                    {item.tag || (isRental ? 'KİRALIK' : isSecondHand ? '2. EL' : 'SATILIK')}
                  </div>
                </div>

                {/* Sağ Detay Kolonu */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  {/* Satıcı / Kurum & Fiyat */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 text-neutral-600 font-extrabold text-[10.5px] uppercase tracking-tight truncate">
                      <Building2 className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                      <span className="truncate">{item.agency || 'SAHİBİNDEN'}</span>
                    </div>
                    <div className={`font-black text-[14px] shrink-0 ${
                      isRental ? 'text-emerald-600' : isSecondHand ? 'text-amber-700' : 'text-rose-600'
                    }`}>
                      {item.price}
                    </div>
                  </div>

                  {/* Başlık */}
                  <h3 className="text-[12.5px] font-black text-neutral-900 leading-snug line-clamp-2 uppercase mt-0.5">
                    {item.title}
                  </h3>

                  {/* Özellik Satırı 1: Oda/Tip & Alan/Detay */}
                  <div className="flex items-center gap-2.5 text-[10.5px] font-bold text-neutral-700 mt-1 flex-wrap">
                    {item.rooms && (
                      <div className="flex items-center gap-1">
                        <BedDouble className="w-3 h-3 text-neutral-500" />
                        <span>{item.rooms}</span>
                      </div>
                    )}
                    {item.area && (
                      <div className="flex items-center gap-1">
                        <Maximize2 className="w-3 h-3 text-neutral-500" />
                        <span>{item.area}</span>
                      </div>
                    )}
                  </div>

                  {/* Özellik Satırı 2: Kat veya Alt Detay */}
                  {item.floor && (
                    <div className="flex items-center gap-1 text-[10.5px] font-semibold text-neutral-600 mt-0.5">
                      <Layers className="w-3 h-3 text-neutral-400" />
                      <span>{item.floor}</span>
                    </div>
                  )}

                  {/* Konum */}
                  <div className="flex items-center gap-1 text-[10.5px] font-medium text-neutral-500 mt-1 leading-tight">
                    <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                    <span className="line-clamp-1">{item.location}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-neutral-300 p-6">
            <Tag className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <h4 className="text-[14px] font-black text-neutral-800">
              Bu kriterde ilan bulunamadı
            </h4>
            <p className="text-[11px] text-neutral-500 mt-1">
              Farklı bir alt kategori seçebilir veya ilk ilanı siz ekleyebilirsiniz.
            </p>
            <button
              onClick={onOpenCreateAd}
              className={`mt-3.5 text-white font-extrabold text-[12px] px-4 py-2 rounded-xl shadow-xs ${theme.bg}`}
            >
              Hemen İlan Ver
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
