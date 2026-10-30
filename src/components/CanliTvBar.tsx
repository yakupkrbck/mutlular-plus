import React from 'react';

interface CanliTvBarProps {
  onOpenCanliTv: () => void;
}

/** Ana sayfadaki "Canlı TV" kısayolu (eski hikaye şeridinin yerine) */
export const CanliTvBar: React.FC<CanliTvBarProps> = ({ onOpenCanliTv }) => (
  <div className="px-3 pt-2.5 pb-1">
    <button
      type="button"
      onClick={onOpenCanliTv}
      className="w-full py-2 px-3.5 rounded-full text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition shadow-2xs flex items-center justify-center gap-2"
    >
      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      <span>Canlı TV</span>
    </button>
  </div>
);
