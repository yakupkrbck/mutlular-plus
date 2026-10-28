import React, { useState } from 'react';
import { X, PlusCircle, CheckCircle2, KeyRound, BadgeDollarSign, PackageOpen } from 'lucide-react';
import { ClassifiedItem, ClassifiedMainCategory, ClassifiedSubCategory } from '../../types';
import { PLACEHOLDER_IMG } from '../../utils/placeholder';

interface MarketListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessAdd?: (item: ClassifiedItem) => void;
}

export const MarketListingModal: React.FC<MarketListingModalProps> = ({
  isOpen,
  onClose,
  onSuccessAdd,
}) => {
  const [mainCategory, setMainCategory] = useState<ClassifiedMainCategory>('satilik');
  const [subCategory, setSubCategory] = useState<string>('ev');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('Merkez, Mutlular');
  const [phone, setPhone] = useState('');
  const [desc, setDesc] = useState('');
  const [agency, setAgency] = useState('SAHİBİNDEN');
  const [rooms, setRooms] = useState('');
  const [area, setArea] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  // Subcategory options based on main category
  const getSubCategoryOptions = () => {
    if (mainCategory === 'kiralik') {
      return [
        { id: 'ev', label: 'Kiralık Ev / Daire' },
        { id: 'tarla', label: 'Kiralık Tarla' },
        { id: 'arac', label: 'Kiralık Araç' },
        { id: 'arsa', label: 'Kiralık Arsa' },
        { id: 'depo', label: 'Kiralık Depo' },
      ];
    }
    if (mainCategory === 'satilik') {
      return [
        { id: 'ev', label: 'Satılık Ev / Konut' },
        { id: 'tarla', label: 'Satılık Tarla' },
        { id: 'arsa', label: 'Satılık Arsa' },
        { id: 'depo', label: 'Satılık Depo' },
        { id: 'arac', label: 'Satılık Araç' },
      ];
    }
    return [
      { id: 'elektronik', label: 'Elektronik & Telefon' },
      { id: 'esya', label: 'Ev Eşyası & Mobilya' },
      { id: 'arac', label: 'Vasıta & Traktör / Araç' },
      { id: 'diger', label: 'Diğer / Her Şey' },
    ];
  };

  const handleMainCategoryChange = (cat: ClassifiedMainCategory) => {
    setMainCategory(cat);
    if (cat === 'kiralik') setSubCategory('ev');
    else if (cat === 'satilik') setSubCategory('ev');
    else setSubCategory('elektronik');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      window.alert('Lütfen iletişim telefon numaranızı yazın.');
      return;
    }
    setSubmitted(true);

    const defaultImage = PLACEHOLDER_IMG;

    const tagLabel =
      mainCategory === 'kiralik' ? 'KİRALIK' : mainCategory === 'satilik' ? 'SATILIK' : '2. EL';

    setTimeout(() => {
      setSubmitted(false);
      if (onSuccessAdd) {
        onSuccessAdd({
          id: `ad-${Date.now()}`,
          title: title.trim(),
          price: price.includes('₺') ? price : `${price} ₺`,
          location: location.trim(),
          image: defaultImage,
          tag: tagLabel,
          date: 'Bugün',
          phone: phone.trim(),
          description: desc.trim() || 'İlan sahibi tarafından detaylı bilgi verilmedi.',
          agency: agency.trim() || 'SAHİBİNDEN',
          rooms: rooms.trim() || undefined,
          area: area.trim() || undefined,
          mainCategory,
          subCategory: subCategory as ClassifiedSubCategory,
          categoryType: subCategory === 'arac' ? 'vasita' : mainCategory === 'ikinci-el' ? 'ikinci-el' : 'emlak',
        });
      }
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-4 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[14px] font-black text-neutral-900 leading-tight">
                Ücretsiz İlan Ver
              </h3>
              <p className="text-[10px] text-neutral-500 font-semibold">
                Kiralık • Satılık • 2. El Vitrini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-12 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-[15px] font-black text-neutral-900">
              İlanınız Alındı!
            </h4>
            <p className="text-[11px] text-neutral-500">
              Yönetim onayından sonra vitrinde yayınlanır. Durumunu profil panelinizden takip edebilirsiniz.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="py-3 space-y-3 overflow-y-auto">
            {/* Üst Kategori Seçimi (3 lü Tab) */}
            <div>
              <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                Üst Kategori Seçimi
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => handleMainCategoryChange('kiralik')}
                  className={`py-2 rounded-xl text-[11px] font-black transition flex flex-col items-center gap-0.5 ${
                    mainCategory === 'kiralik'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Kiralık</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMainCategoryChange('satilik')}
                  className={`py-2 rounded-xl text-[11px] font-black transition flex flex-col items-center gap-0.5 ${
                    mainCategory === 'satilik'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <BadgeDollarSign className="w-3.5 h-3.5" />
                  <span>Satılık</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMainCategoryChange('ikinci-el')}
                  className={`py-2 rounded-xl text-[11px] font-black transition flex flex-col items-center gap-0.5 ${
                    mainCategory === 'ikinci-el'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <PackageOpen className="w-3.5 h-3.5" />
                  <span>2. El</span>
                </button>
              </div>
            </div>

            {/* Alt Kategori Seçimi */}
            <div>
              <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                Alt Kategori
              </label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-semibold outline-none focus:border-rose-600 focus:bg-white"
              >
                {getSubCategoryOptions().map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* İlan Başlığı */}
            <div>
              <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                İlan Başlığı
              </label>
              <input
                required
                type="text"
                placeholder={
                  mainCategory === 'kiralik'
                    ? 'Örn: Cadde Üzeri 3+1 Kiralık Daire / Kiralık Tarla'
                    : mainCategory === 'satilik'
                    ? 'Örn: Satılık 650 m² İmarlı Arsa / 2021 Renault Clio'
                    : 'Örn: iPhone 13 128 GB / Temiz Koltuk Takımı'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-rose-600 focus:bg-white"
              />
            </div>

            {/* Fiyat ve Konum */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                  Fiyat (₺)
                </label>
                <input
                  required
                  type="text"
                  placeholder={mainCategory === 'kiralik' ? '18.500 ₺ / ay' : '450.000 ₺'}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-rose-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                  Konum
                </label>
                <input
                  required
                  type="text"
                  placeholder="Örn: Sanayi, Merkez"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-rose-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Ek Detaylar (Oda/Özellik & Alan/Metrekare) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                  Oda / Tip / Model
                </label>
                <input
                  type="text"
                  placeholder="Örn: 3+1 / Dizel"
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-rose-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                  Alan / KM / Durum
                </label>
                <input
                  type="text"
                  placeholder="Örn: 150 m² / 45.000 km"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-rose-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Telefon & Satıcı */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                  İletişim Tel
                </label>
                <input
                  type="tel"
                  placeholder="0555 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-rose-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                  Satıcı Türü
                </label>
                <input
                  type="text"
                  placeholder="Sahibinden / Emlakçı"
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-rose-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Açıklama */}
            <div>
              <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                İlan Açıklaması
              </label>
              <textarea
                rows={2}
                placeholder="İlanınızın özelliklerini ve durumunu kısaca açıklayın..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-rose-600 focus:bg-white resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-black text-[13px] py-3 rounded-2xl shadow-md transition"
            >
              İlanı Ücretsiz Yayınla
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
