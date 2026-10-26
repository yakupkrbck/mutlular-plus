import React from 'react';
import { ChevronRight } from 'lucide-react';

interface ExploreSectionProps {
  onSelectItem: (item: string) => void;
  onViewAll?: () => void;
}

export const ExploreSection: React.FC<ExploreSectionProps> = ({
  onSelectItem,
  onViewAll,
}) => {
  const exploreCards = [
    {
      id: 'neler-oluyor',
      title: 'Neler Oluyor',
      type: 'icon',
      bg: 'bg-rose-900',
      label: '?',
    },
    {
      id: 'sanatcilarimiz',
      title: 'Sanatçılarımız',
      type: 'image',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'spor-kulubu',
      title: 'Mutlularspor',
      type: 'badge',
      bg: 'bg-red-800',
    },
    {
      id: 'egitim',
      title: 'Eğitim Kurumları',
      type: 'image',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=200&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="px-3 py-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-4 bg-rose-600 rounded-full" />
          <h2 className="text-[15px] font-black tracking-tight text-neutral-900">
            KEŞFET
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

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-4 gap-2">
        {exploreCards.map((card) => (
          <div
            key={card.id}
            onClick={() => onSelectItem(card.title)}
            className="bg-white rounded-2xl border border-neutral-200/80 p-2 flex flex-col items-center justify-center text-center shadow-xs cursor-pointer active:scale-95 transition group"
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden relative shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform">
              {card.type === 'icon' && (
                <div className={`w-full h-full ${card.bg} flex items-center justify-center text-white font-black text-2xl`}>
                  {card.label}
                </div>
              )}
              {card.type === 'badge' && (
                <div className="w-full h-full bg-gradient-to-br from-red-800 to-neutral-900 flex flex-col items-center justify-center p-1 text-white">
                  <div className="w-8 h-8 rounded-full border border-amber-400 bg-red-700 flex items-center justify-center font-black text-[9px] text-amber-300">
                    MSFK
                  </div>
                </div>
              )}
              {card.type === 'image' && card.image && (
                <>
                  <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20" />
                </>
              )}
            </div>
            <span className="text-[11px] font-bold text-neutral-800 mt-1.5 tracking-tight truncate w-full text-center">
              {card.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
