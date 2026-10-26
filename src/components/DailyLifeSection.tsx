import React from 'react';
import { ChevronRight, Flower2, Car, Truck, BedDouble } from 'lucide-react';

interface DailyLifeSectionProps {
  onSelectItem: (item: string) => void;
  onViewAll?: () => void;
}

export const DailyLifeSection: React.FC<DailyLifeSectionProps> = ({
  onSelectItem,
  onViewAll,
}) => {
  const items = [
    {
      id: 'cicekci',
      title: 'Çiçekçi',
      icon: Flower2,
      bgColor: 'bg-rose-900',
      tag: 'ÇİÇEK',
    },
    {
      id: 'arac-kirala',
      title: 'Araç Kirala',
      icon: Car,
      bgColor: 'bg-red-900',
      tag: 'RENT A CAR',
    },
    {
      id: 'oto-cekici',
      title: 'Oto Çekici',
      icon: Truck,
      bgColor: 'bg-amber-800',
      tag: 'YOL YARDIM',
    },
    {
      id: 'otel',
      title: 'Otel',
      icon: BedDouble,
      bgColor: 'bg-slate-900',
      tag: 'APART',
    },
  ];

  return (
    <div className="px-3 py-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-4 bg-rose-600 rounded-full" />
          <h2 className="text-[15px] font-black tracking-tight text-neutral-900">
            GÜNLÜK YAŞAM
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
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item.title)}
              className="bg-white rounded-2xl border border-neutral-200/80 p-2 flex flex-col items-center justify-center text-center shadow-xs cursor-pointer active:scale-95 transition group"
            >
              <div
                className={`w-12 h-12 rounded-xl ${item.bgColor} flex flex-col items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-5 h-5 text-white stroke-[2]" />
                <span className="text-[6px] font-bold tracking-tight opacity-80 mt-0.5">
                  {item.tag}
                </span>
              </div>
              <span className="text-[11px] font-bold text-neutral-800 mt-1.5 tracking-tight truncate w-full text-center">
                {item.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
