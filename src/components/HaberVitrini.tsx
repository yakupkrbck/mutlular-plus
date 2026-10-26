import React, { useState, useEffect } from 'react';
import { Building2, Headphones, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import { NewsItem, UserProfile } from '../types';

interface HaberVitriniProps {
  newsList: NewsItem[];
  onSelectNews: (news: NewsItem) => void;
  onOpenBusinessRegister: () => void;
  onOpenLiveSupport: () => void;
  userProfile?: UserProfile | null;
  onOpenEsnafPaneli?: () => void;
}

export const HaberVitrini: React.FC<HaberVitriniProps> = ({
  newsList,
  onSelectNews,
  onOpenBusinessRegister,
  onOpenLiveSupport,
  userProfile,
  onOpenEsnafPaneli,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeNews = newsList[currentIndex] || newsList[0];

  useEffect(() => {
    if (isPaused || newsList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, newsList.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? newsList.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % newsList.length);
  };

  if (!activeNews) return null;

  // Split title to apply yellow and white coloring just like "Şehrin Dijital Merkezi"
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
    // Highlight first 2 words in yellow and the rest in white
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
        onClick={() => onSelectNews(activeNews)}
        className="relative w-full h-[220px] rounded-2xl overflow-hidden shadow-md select-none cursor-pointer group"
      >
        {/* Background Images with smooth fade transition */}
        {newsList.map((item, idx) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={
                item.image ||
                'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1000&auto=format&fit=crop&q=80'
              }
              alt={item.title}
              className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-700"
            />
            {/* Scrim Overlay for clean contrast while keeping image bright */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/25" />
          </div>
        ))}

        {/* Top Badges / Floating Actions (İşletme Kayıt & Canlı Destek) */}
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

        {/* Left & Right subtle navigation arrows */}
        <button
          onClick={handlePrev}
          aria-label="Önceki haber"
          className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-xs text-white/90 hover:text-white flex items-center justify-center transition active:scale-90"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleNext}
          aria-label="Sonraki haber"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-xs text-white/90 hover:text-white flex items-center justify-center transition active:scale-90"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Headline text (Only Title, No Description, Yellow and White style like 'Şehrin Dijital Merkezi') */}
        <div className="absolute bottom-3.5 inset-x-3.5 z-10">
          {/* Brand Tag & Category */}
          <div className="text-[12px] font-semibold text-white/90 drop-shadow-sm flex items-center gap-1.5 mb-1">
            <span>Mutlular</span>
            <span className="text-amber-400 font-bold">Plus</span>
            <span className="text-white/40">•</span>
            <span className="text-amber-300/90 text-[11px] font-medium tracking-wide">
              {activeNews.category}
            </span>
            {activeNews.urgent && (
              <span className="bg-amber-400 text-neutral-950 text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-xs ml-1">
                Flaş
              </span>
            )}
          </div>

          {/* Clean Yellow & White Headline */}
          <h2 className="text-[19px] sm:text-[21px] font-black leading-tight drop-shadow-md line-clamp-2">
            {renderTitle(activeNews.title)}
          </h2>
        </div>
      </div>

      {/* Slider Pagination Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-2.5 mb-0.5">
        {newsList.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Haber ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? 'w-5 h-1.5 bg-amber-400'
                : 'w-1.5 h-1.5 bg-neutral-300 hover:bg-neutral-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
