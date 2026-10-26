import React, { useState, useEffect } from 'react';
import { Building2, Headphones, Search, ChevronRight } from 'lucide-react';

interface HeroSliderProps {
  onOpenBusinessRegister: () => void;
  onOpenLiveSupport: () => void;
  onSearch: (query: string) => void;
}

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1000&auto=format&fit=crop&q=80',
    tag: 'Mutlular',
    sub: 'Plus',
    title: 'Şehrin Dijital Merkezi',
  },
  {
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80',
    tag: 'Lezzet Dolu',
    sub: 'Fırsatlar',
    title: 'En İyi Restoranlar Burada',
  },
  {
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
    tag: 'Güvenilir',
    sub: 'Pazar',
    title: 'Mutlular İkinci El & Emlak',
  },
  {
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop&q=80',
    tag: 'Gençlik &',
    sub: 'Kampüs',
    title: 'Öğrencilere Özel Avantajlar',
  },
  {
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1000&auto=format&fit=crop&q=80',
    tag: 'Hızlı &',
    sub: 'Usta',
    title: 'Şehrin Tüm Esnafı Cebinde',
  },
];

export const HeroSlider: React.FC<HeroSliderProps> = ({
  onOpenBusinessRegister,
  onOpenLiveSupport,
  onSearch,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  return (
    <div className="px-3 pt-2 pb-1">
      {/* Hero Card */}
      <div className="relative w-full h-[230px] rounded-2xl overflow-hidden shadow-lg select-none">
        {/* Background images */}
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            {/* Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />
          </div>
        ))}

        {/* Top Badges / Floating Actions */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10">
          <button
            onClick={onOpenBusinessRegister}
            className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/25 text-white text-[11px] font-semibold py-1.5 px-3 rounded-full flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-200" />
            <span>Esnaf Kayıt</span>
            <ChevronRight className="w-3 h-3 opacity-80" />
          </button>

          <button
            onClick={onOpenLiveSupport}
            className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/25 text-white text-[11px] font-semibold py-1.5 px-3 rounded-full flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
          >
            <Headphones className="w-3.5 h-3.5 text-rose-300" />
            <span>Canlı destek</span>
            <ChevronRight className="w-3 h-3 opacity-80" />
          </button>
        </div>

        {/* Headline text and search bar */}
        <div className="absolute bottom-3 inset-x-3 z-10 flex flex-col gap-2">
          {/* Headline */}
          <div>
            <div className="text-[12px] font-semibold text-white/90 drop-shadow-sm flex items-center gap-1">
              <span>Mutlular</span>
              <span className="text-amber-400 font-bold">Plus</span>
            </div>
            <h1 className="text-[20px] font-black text-white leading-tight drop-shadow-md">
              Şehrin <span className="text-amber-400">Dijital</span> Merkezi
            </h1>
          </div>

          {/* Frosted Search Input */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center bg-white/20 hover:bg-white/25 focus-within:bg-white/30 backdrop-blur-md border border-white/30 rounded-xl p-1 transition shadow-sm"
          >
            <div className="pl-2.5 text-white/80">
              <Search className="w-4 h-4 stroke-[2.2]" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Şehrin Dijital Merkezinde ara..."
              className="w-full bg-transparent text-[13px] text-white placeholder-white/80 pl-2 pr-10 py-1.5 outline-none font-medium"
            />
            <button
              type="submit"
              aria-label="Ara"
              className="absolute right-1 w-8 h-8 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center justify-center transition shadow-md"
            >
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>

      {/* Slider Pagination Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-2.5 mb-1">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Slayt ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              idx === currentSlide
                ? 'w-5 h-1.5 bg-rose-600'
                : 'w-1.5 h-1.5 bg-neutral-300 hover:bg-neutral-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
