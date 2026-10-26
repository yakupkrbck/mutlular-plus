import React, { useState } from 'react';
import { ChevronRight, Heart, MapPin, Zap } from 'lucide-react';
import { ClassifiedItem } from '../types';

interface FeaturedClassifiedsProps {
  ads: ClassifiedItem[];
  onSelectAd: (ad: ClassifiedItem) => void;
  onViewAll?: () => void;
}

export const FeaturedClassifieds: React.FC<FeaturedClassifiedsProps> = ({
  ads,
  onSelectAd,
  onViewAll,
}) => {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleWhatsApp = (e: React.MouseEvent, ad: ClassifiedItem) => {
    e.stopPropagation();
    const message = encodeURIComponent(
      `Merhaba, Mutlular Plus uygulamasındaki "${ad.title}" başlıklı ${ad.price} tutarındaki ilanınız hakkında bilgi almak istiyorum.`
    );
    window.open(`https://wa.me/${ad.phone}?text=${message}`, '_blank');
  };

  return (
    <div className="px-3 py-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-rose-600" />
          <h2 className="text-[15px] font-black tracking-tight text-neutral-900">
            Öne Çıkan İlanlar
          </h2>
        </div>
        <button
          onClick={onViewAll}
          className="text-[12px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-0.5 transition"
        >
          <span>Tümünü Gör</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* Subheader Banner Strip */}
      <div className="bg-amber-50 border border-amber-200/90 rounded-xl px-3 py-1.5 flex items-center gap-2 mb-3">
        <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
        <span className="text-[11px] font-extrabold text-amber-800">
          Öne çıkarılmış ilanlar • Bugün eklendi
        </span>
      </div>

      {/* 2-Columns Grid of Cards or Empty State */}
      {ads.length === 0 ? (
        <div
          onClick={onViewAll}
          className="bg-white rounded-2xl border border-dashed border-neutral-300 p-6 text-center cursor-pointer hover:border-rose-300 transition group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-rose-600 text-rose-600" />
          </div>
          <h3 className="text-xs font-black text-neutral-900">
            Henüz öne çıkan ilan bulunmuyor
          </h3>
          <p className="text-[11px] text-neutral-500 mt-1 max-w-xs mx-auto">
            Mahallenizde satılık, kiralık ev, araba veya eşyanız mı var? Hemen ücretsiz ilan verin.
          </p>
          <button
            type="button"
            className="mt-3 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black px-3.5 py-1.5 rounded-xl shadow-xs transition"
          >
            İlk İlanı Siz Verin
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {ads.slice(0, 2).map((ad) => {
            const isFav = favorites[ad.id];
            return (
              <div
                key={ad.id}
                onClick={() => onSelectAd(ad)}
                className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-xs flex flex-col justify-between cursor-pointer group active:scale-98 transition"
              >
                {/* Image & Badges */}
                <div className="relative h-28 w-full bg-neutral-100 overflow-hidden">
                  <img
                    src={ad.image}
                    alt={ad.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Vitrin badge */}
                  <span
                    className={`absolute top-2 left-2 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-xs uppercase tracking-tight ${
                      ad.mainCategory === 'kiralik' || ad.tag?.includes('KİRALIK')
                        ? 'bg-emerald-600'
                        : ad.mainCategory === 'ikinci-el' || ad.tag?.includes('2. EL')
                        ? 'bg-amber-600'
                        : 'bg-rose-600'
                    }`}
                  >
                    {ad.tag}
                  </span>

                  {/* Heart Button */}
                  <button
                    onClick={(e) => toggleFavorite(e, ad.id)}
                    aria-label="Favoriye Ekle"
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-neutral-600 hover:text-rose-600 transition shadow-2xs"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isFav ? 'fill-rose-600 text-rose-600' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Details */}
                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[12px] font-extrabold text-neutral-900 leading-snug truncate">
                      {ad.title}
                    </h3>
                    <div className="text-[14px] font-black text-neutral-950 mt-1">
                      {ad.price}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-medium mt-1">
                      <MapPin className="w-3 h-3 text-rose-600 shrink-0" />
                      <span className="truncate">{ad.location}</span>
                    </div>
                  </div>

                  {/* WhatsApp Button */}
                  <button
                    onClick={(e) => handleWhatsApp(e, ad)}
                    className="mt-2.5 w-full bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white text-[11px] font-bold py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs"
                  >
                    {/* WhatsApp SVG Icon */}
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
