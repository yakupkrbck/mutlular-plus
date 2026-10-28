import React, { useState, useEffect, useMemo } from 'react';
import { Headphones, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import { NewsItem, UserProfile, HeroBannerItem } from '../types';
import { PLACEHOLDER_IMG } from '../utils/placeholder';

interface HaberVitriniProps {
  newsList: NewsItem[];
  /** Yönetici panelinden yüklenen vitrin afişleri (önce gösterilir) */
  banners?: HeroBannerItem[];
  onSelectNews: (news: NewsItem) => void;
  onOpenBusinessRegister: () => void;
  onOpenLiveSupport: () => void;
  userProfile?: UserProfile | null;
  onOpenEsnafPaneli?: () => void;
}

interface Slide {
  id: string;
  image: string;
  title: string;
  label: string;
  urgent: boolean;
  news: NewsItem | null;
}

export const HaberVitrini: React.FC<HaberVitriniProps> = ({
  newsList,
  banners = [],
  onSelectNews,
  onOpenBusinessRegister,
  onOpenLiveSupport,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Önce yöneticinin yüklediği afişler, sonra haberler. İkisi de yoksa nötr bir kart gösterilir.
  const slides: Slide[] = useMemo(() => {
    const list: Slide[] = [
      ...banners.map((b) => ({
        id: `banner-${b.id}`,
        image: b.image,
        title: b.title,
        label: b.tag || '',
        urgent: false,
        news: null,
      })),
      ...newsList.map((n) => ({
        id: `news-${n.id}`,
        image: n.image || '',
        title: n.title,
        label: n.category,
        urgent: !!n.urgent,
        news: n,
      })),
    ];
    if (list.length === 0) {
      list.push({
        id: 'empty',
        image: '',
        title: 'Mehmet Akif Mahallesi',
        label: '',
        urgent: false,
        news: null,
      });
    }
    return list;
  }, [banners, newsList]);

  const count = slides.length;
  const safeIndex = currentIndex >= count ? 0 : currentIndex;
  const active = slides[safeIndex];

  useEffect(() => {
    if (isPaused || count <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, count]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? count - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % count);
  };

  // Başlığı sarı ve beyaz renklendir
  const renderTitle = (title: string) => {
    if (title.includes(':')) {
      const parts = title.split(':');
      return (
        <>
          <span className="text-amber-400">{parts[0]}:</span>{' '}
          <span className="text-white">{parts.slice(1).join(':')}</span>
        </>
      );
    }
    const words = title.split(' ');
    if (words.length <= 2) {
      return (
        <>
          <span className="text-amber-400">{words[0]} </span>
          <span className="text-white">{words.slice(1).join(' ')}</span>
        </>
      );
    }
    return (
      <>
        <span className="text-amber-400">{words.slice(0, 2).join(' ')} </span>
        <span className="text-white">{words.slice(2).join(' ')}</span>
      </>
    );
  };

  return (
    <div className="px-3 pt-2 pb-1">
      {/* Vitrin Hero Card */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onClick={() => active.news && onSelectNews(active.news)}
        className={`relative w-full h-[220px] rounded-2xl overflow-hidden shadow-md select-none group ${
          active.news ? 'cursor-pointer' : ''
        }`}
      >
        {/* Arka plan görselleri */}
        {slides.map((item, idx) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === safeIndex ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
            }`}
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-700"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMG;
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-950" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/25" />
          </div>
        ))}

        {/* Üst kısayollar (İşletme Kayıt & Canlı Destek) */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenBusinessRegister();
            }}
            className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/25 text-white text-[11px] font-semibold py-1.5 px-3 rounded-full flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
          >
            <Store className="w-3.5 h-3.5 text-amber-300" />
            <span>Esnaf Kayıt</span>
            <ChevronRight className="w-3 h-3 opacity-80 ml-auto" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenLiveSupport();
            }}
            className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/25 text-white text-[11px] font-semibold py-1.5 px-3 rounded-full flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
          >
            <Headphones className="w-3.5 h-3.5 text-amber-300" />
            <span>Canlı Destek</span>
            <ChevronRight className="w-3 h-3 opacity-80 ml-auto" />
          </button>
        </div>

        {/* Sol ve sağ oklar */}
        {count > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Önceki"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-xs text-white/90 hover:text-white flex items-center justify-center transition active:scale-90"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Sonraki"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-xs text-white/90 hover:text-white flex items-center justify-center transition active:scale-90"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Başlık */}
        <div className="absolute bottom-3.5 inset-x-3.5 z-10">
          <div className="text-[12px] font-semibold text-white/90 drop-shadow-sm flex items-center gap-1.5 mb-1">
            <span>Mutlular</span>
            <span className="text-amber-400 font-bold">Plus</span>
            {active.label && (
              <>
                <span className="text-white/40">•</span>
                <span className="text-amber-300/90 text-[11px] font-medium tracking-wide">{active.label}</span>
              </>
            )}
            {active.urgent && (
              <span className="bg-amber-400 text-neutral-950 text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-xs ml-1">
                Flaş
              </span>
            )}
          </div>

          <h2 className="text-[19px] sm:text-[21px] font-black leading-tight drop-shadow-md line-clamp-2">
            {renderTitle(active.title)}
          </h2>
        </div>
      </div>

      {/* Sayfa noktaları */}
      {count > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2.5 mb-0.5">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Slayt ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                idx === safeIndex
                  ? 'w-5 h-1.5 bg-amber-400'
                  : 'w-1.5 h-1.5 bg-neutral-300 hover:bg-neutral-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
