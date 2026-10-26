import React from 'react';
import { ChevronRight } from 'lucide-react';

interface PromoCarBannerProps {
  onExploreCars: () => void;
}

export const PromoCarBanner: React.FC<PromoCarBannerProps> = ({ onExploreCars }) => {
  return (
    <div className="px-3 py-2">
      <div className="relative bg-white rounded-2xl border border-neutral-200/90 shadow-sm overflow-hidden p-3.5">
        {/* Background decorative curved graphic */}
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-rose-500/10 pointer-events-none" />
        <div className="absolute top-0 right-16 w-16 h-16 rounded-full bg-rose-500/20 pointer-events-none" />

        <div className="flex items-center justify-between gap-2">
          {/* Left Text Column */}
          <div className="flex-1 z-10">
            {/* Top tiny logo mark */}
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[10px] font-black text-neutral-900 tracking-tight">MUTLULAR</span>
              <span className="text-[10px] font-black text-rose-600">PLUS</span>
            </div>

            <h3 className="text-[15px] font-black text-neutral-900 leading-tight">
              Aradığın Araba <br />
              <span className="text-rose-600">Burada Olabilir!</span>
            </h3>

            <p className="text-[10px] text-neutral-500 font-medium mt-1 leading-snug line-clamp-2">
              Mutlular&apos;daki araç ilanlarını tek noktadan incele, seçenekleri keşfet.
            </p>

            <button
              onClick={onExploreCars}
              className="mt-2.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition shadow-xs flex items-center gap-1"
            >
              <span>Araçları İncele</span>
              <ChevronRight className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>

          {/* Right Car Graphic */}
          <div className="w-[45%] flex flex-col items-center justify-center relative">
            <img
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=80"
              alt="Otomobil İlanları"
              className="w-full h-24 object-contain rounded-lg drop-shadow-md"
            />
          </div>
        </div>
      </div>

      {/* Pagination dots below banner */}
      <div className="flex items-center justify-center gap-1 mt-2">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className={`rounded-full transition-all ${
              i === 5 ? 'w-4 h-1.5 bg-rose-600' : 'w-1.5 h-1.5 bg-neutral-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
