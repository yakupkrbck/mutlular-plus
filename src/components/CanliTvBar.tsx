import React from 'react';
import { CanliDurum } from '../services/canliYayinService';

interface CanliTvBarProps {
  canli?: CanliDurum | null;
  onOpenCanliTv: () => void;
}

/** Ana sayfadaki canlı yayın kısayolu: yalnızca yayın varken görünür. */
export const CanliTvBar: React.FC<CanliTvBarProps> = ({ canli, onOpenCanliTv }) => {
  if (!canli?.live) return null;
  const canliRozet = canli.rozet !== 'video';
  return (
    <div className="px-3 pt-2.5 pb-1">
      <button
        type="button"
        onClick={onOpenCanliTv}
        className="w-full py-2.5 px-3.5 rounded-full text-xs font-black bg-red-600 hover:bg-red-700 text-white transition shadow-sm flex items-center justify-center gap-2"
      >
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <span className="truncate">{canliRozet ? 'CANLI YAYIN' : 'VİDEO'}{canli.title ? ` · ${canli.title}` : ''}</span>
        <span className="opacity-90 shrink-0">İzle</span>
      </button>
    </div>
  );
};
