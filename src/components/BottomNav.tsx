import React from 'react';
import { Newspaper, Compass, Store, Wrench } from 'lucide-react';

export type NavTab = 'anasayfa' | 'haber' | 'alim-satim' | 'mp-hub' | 'yemek' | 'hizmet' | 'profil';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pointer-events-none">
      <div className="max-w-md mx-auto relative pointer-events-auto">
        {/* Curved White Dock Container */}
        <div className="bg-white/95 backdrop-blur-md border-t border-neutral-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-4 py-2 flex items-center justify-between relative rounded-t-2xl">
          {/* 1. Haber (Eski Anasayfa butonu Haber ile değiştirildi) */}
          <button
            onClick={() => onTabChange('haber')}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-1 transition group"
          >
            <div className="relative">
              <Newspaper
                className={`w-5 h-5 transition-colors ${
                  currentTab === 'haber'
                    ? 'text-rose-600'
                    : 'text-neutral-500 group-hover:text-neutral-900'
                }`}
              />
            </div>
            <span
              className={`text-[11px] font-bold transition-colors ${
                currentTab === 'haber' ? 'text-rose-600' : 'text-neutral-500'
              }`}
            >
              Haber
            </span>
            {currentTab === 'haber' && (
              <span className="w-4 h-0.5 bg-rose-600 rounded-full -mt-0.5" />
            )}
          </button>

          {/* 2. Alım Satım */}
          <button
            onClick={() => onTabChange('alim-satim')}
            className="flex-1 min-w-0 flex flex-col items-center justify-center gap-1 py-1 transition group"
          >
            <div className="relative">
              <Compass
                className={`w-5 h-5 transition-colors ${
                  currentTab === 'alim-satim'
                    ? 'text-rose-600'
                    : 'text-neutral-500 group-hover:text-neutral-900'
                }`}
              />
            </div>
            <span
              className={`text-[10px] sm:text-[11px] font-bold tracking-tight transition-colors whitespace-nowrap ${
                currentTab === 'alim-satim' ? 'text-rose-600' : 'text-neutral-500'
              }`}
            >
              Alım Satım
            </span>
            {currentTab === 'alim-satim' && (
              <span className="w-4 h-0.5 bg-rose-600 rounded-full -mt-0.5" />
            )}
          </button>

          {/* 3. Center Elevated "MP" Hub Button */}
          <div className="flex-1 flex justify-center -mt-6">
            <button
              onClick={() => onTabChange('mp-hub')}
              aria-label="MP Hızlı İşlemler ve Anasayfa"
              title="MP Hızlı İşlemler (Hizmet İste, İlan Paylaş, Haber İhbar, Vefat İlanı, Davetiyeler)"
              className="w-13 h-13 rounded-2xl bg-white border-2 border-rose-500 shadow-[0_8px_20px_rgba(225,29,72,0.22)] ring-2 ring-rose-100 flex flex-col items-center justify-center active:scale-95 transition-all hover:shadow-xl group relative"
            >
              <div className="flex items-center justify-center font-black text-[17px] tracking-tighter">
                <span className="text-neutral-950">M</span>
                <span className="text-rose-600 -ml-0.5">P</span>
              </div>
              <span className="text-[7.5px] font-black -mt-0.5 tracking-tight leading-none uppercase text-rose-600">
                İŞLEM
              </span>
            </button>
          </div>

          {/* 4. Esnaf */}
          <button
            onClick={() => onTabChange('yemek')}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-1 transition group"
          >
            <Store
              className={`w-5 h-5 transition-colors ${
                currentTab === 'yemek'
                  ? 'text-rose-600'
                  : 'text-neutral-500 group-hover:text-neutral-900'
              }`}
            />
            <span
              className={`text-[11px] font-bold transition-colors ${
                currentTab === 'yemek' ? 'text-rose-600' : 'text-neutral-500'
              }`}
            >
              Esnaf
            </span>
            {currentTab === 'yemek' && (
              <span className="w-4 h-0.5 bg-rose-600 rounded-full -mt-0.5" />
            )}
          </button>

          {/* 5. Hizmet (Eski Profil butonu Hizmet ile değiştirildi) */}
          <button
            onClick={() => onTabChange('hizmet')}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-1 transition group"
          >
            <Wrench
              className={`w-5 h-5 transition-colors ${
                currentTab === 'hizmet'
                  ? 'text-rose-600'
                  : 'text-neutral-500 group-hover:text-neutral-900'
              }`}
            />
            <span
              className={`text-[11px] font-bold transition-colors ${
                currentTab === 'hizmet' ? 'text-rose-600' : 'text-neutral-500'
              }`}
            >
              Hizmet
            </span>
            {currentTab === 'hizmet' && (
              <span className="w-4 h-0.5 bg-rose-600 rounded-full -mt-0.5" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};
