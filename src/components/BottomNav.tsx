import React from 'react';
import { Newspaper, Compass, Store, Wrench, Home, Plus } from 'lucide-react';

export type NavTab = 'anasayfa' | 'haber' | 'alim-satim' | 'mp-hub' | 'yemek' | 'hizmet' | 'profil';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

interface TabDef {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const LEFT_TABS: TabDef[] = [
  { id: 'haber', label: 'Haber', icon: Newspaper },
  { id: 'alim-satim', label: 'Alım Satım', icon: Compass },
];
const RIGHT_TABS: TabDef[] = [
  { id: 'yemek', label: 'Esnaf', icon: Store },
  { id: 'hizmet', label: 'Hizmet', icon: Wrench },
];

/**
 * Mobil: altta sabit dock, ortada yükseltilmiş "+" (Hızlı İşlemler) ve altında Anasayfa.
 * Masaüstü / yan çevirme (md ve üstü): aynı menü sol kenar çubuğuna dönüşür.
 */
export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const renderTab = (t: TabDef) => {
    const Icon = t.icon;
    const active = currentTab === t.id;
    return (
      <button
        key={t.id}
        onClick={() => onTabChange(t.id)}
        aria-label={t.label}
        aria-current={active ? 'page' : undefined}
        className="flex-1 min-w-0 md:flex-none md:w-full flex flex-col items-center justify-center gap-1 py-1 md:py-2 transition group"
      >
        <Icon
          className={`w-5 h-5 transition-colors ${
            active ? 'text-rose-600' : 'text-neutral-500 group-hover:text-neutral-900'
          }`}
        />
        <span
          className={`text-[10px] sm:text-[11px] font-bold tracking-tight whitespace-nowrap transition-colors ${
            active ? 'text-rose-600' : 'text-neutral-500'
          }`}
        >
          {t.label}
        </span>
        {active && <span className="w-4 h-0.5 bg-rose-600 rounded-full -mt-0.5" />}
      </button>
    );
  };

  const homeActive = currentTab === 'anasayfa';

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pointer-events-none md:inset-x-auto md:inset-y-0 md:left-0 md:w-[88px]">
      <div className="max-w-md mx-auto relative pointer-events-auto md:max-w-none md:mx-0 md:h-full">
        <div className="bg-white/95 backdrop-blur-md border-t border-neutral-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-4 py-2 flex items-center justify-between relative rounded-t-2xl md:h-full md:flex-col md:justify-center md:gap-1 md:rounded-none md:border-t-0 md:border-r md:px-1 md:py-3 md:shadow-[4px_0_20px_rgba(0,0,0,0.05)]">
          {LEFT_TABS.map(renderTab)}

          {/* Orta: "+" Hızlı İşlemler çekmecesini açar, altındaki Anasayfa anasayfaya götürür */}
          <div className="flex-1 md:flex-none md:w-full flex flex-col items-center -mt-6 md:mt-0 md:my-2">
            <button
              onClick={() => onTabChange('mp-hub')}
              aria-label="Hızlı İşlemler"
              title="Hızlı İşlemler (Hizmet İste, İlan Paylaş, Haber İhbar, Vefat İlanı, Davetiyeler)"
              className="w-14 h-10 rounded-2xl bg-white border-2 border-rose-500 shadow-[0_8px_20px_rgba(225,29,72,0.22)] ring-2 ring-rose-100 flex items-center justify-center active:scale-95 transition-all hover:shadow-xl"
            >
              <Plus className="w-6 h-6 text-neutral-950" strokeWidth={3} />
            </button>
            <button
              onClick={() => onTabChange('anasayfa')}
              aria-label="Anasayfa"
              aria-current={homeActive ? 'page' : undefined}
              className="flex flex-col items-center gap-0.5 pt-1 group"
            >
              <Home
                className={`w-4 h-4 transition-colors ${
                  homeActive ? 'text-rose-600' : 'text-neutral-500 group-hover:text-neutral-900'
                }`}
              />
              <span
                className={`text-[10px] sm:text-[11px] font-bold tracking-tight whitespace-nowrap transition-colors ${
                  homeActive ? 'text-rose-600' : 'text-neutral-500'
                }`}
              >
                Anasayfa
              </span>
            </button>
          </div>

          {RIGHT_TABS.map(renderTab)}
        </div>
      </div>
    </nav>
  );
};
