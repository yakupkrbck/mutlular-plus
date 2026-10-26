import React from 'react';
import { Tv, Youtube, ChevronRight, Play } from 'lucide-react';

interface CampusCardProps {
  onOpenCampus: () => void;
  onOpenCanliTv?: () => void;
}

export const CampusCard: React.FC<CampusCardProps> = ({ onOpenCampus, onOpenCanliTv }) => {
  const handleClick = () => {
    if (onOpenCanliTv) {
      onOpenCanliTv();
    } else {
      onOpenCampus();
    }
  };

  return (
    <div className="px-3 py-2">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-4 bg-red-600 rounded-full" />
          <h2 className="text-[15px] font-black tracking-tight text-neutral-900 flex items-center gap-1.5">
            <span>MUTLULAR CANLI TV</span>
            <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              YOUTUBE
            </span>
          </h2>
        </div>
        <button
          onClick={handleClick}
          className="text-[12px] font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5 transition"
        >
          <span>Yayını İzle</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* Maroon & Red Mutlular Canlı TV Banner */}
      <div
        onClick={handleClick}
        className="relative bg-gradient-to-r from-red-950 via-neutral-900 to-black rounded-2xl p-3.5 flex items-center justify-between gap-3 text-white shadow-md cursor-pointer group active:scale-98 transition overflow-hidden border border-red-900/30"
      >
        {/* Subtle background glow effect */}
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          {/* YouTube / TV Icon Circle */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 border border-white/20 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
            <Tv className="w-6 h-6 text-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-black text-white tracking-tight">
                Mutlular Canlı TV Yayında
              </span>
              <span className="bg-red-600/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase flex items-center gap-1 shadow-xs animate-pulse">
                <Youtube className="w-2.5 h-2.5" />
                CANLI
              </span>
            </div>
            <p className="text-[11px] text-white/80 font-medium mt-0.5 line-clamp-1">
              YouTube üzerinden kesintisiz şehir yayını & meclis gündemi
            </p>
          </div>
        </div>

        {/* Play Button */}
        <div className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 group-hover:translate-x-0.5 transition-all relative z-10">
          <Play className="w-4 h-4 fill-white ml-0.5" />
        </div>
      </div>
    </div>
  );
};

export const MutlularCanliTvCard = CampusCard;
