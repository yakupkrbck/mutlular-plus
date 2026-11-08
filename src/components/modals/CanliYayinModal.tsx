import React from 'react';
import { X, ExternalLink, Radio } from 'lucide-react';
import { CanliDurum, youtubeEmbed } from '../../services/canliYayinService';

interface CanliYayinModalProps {
  isOpen: boolean;
  onClose: () => void;
  durum: CanliDurum;
}

/** Canlı yayını tam ekran izleme (vitrinden dokununca açılır). */
export const CanliYayinModal: React.FC<CanliYayinModalProps> = ({ isOpen, onClose, durum }) => {
  if (!isOpen) return null;
  const canli = durum.live && !!durum.videoId;
  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col" role="dialog" aria-modal="true" aria-label="Canlı yayın">
      <div className="flex items-center justify-between gap-2 px-3 pb-2" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)' }}>
        <div className="flex items-center gap-2 min-w-0">
          {canli ? (
            <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[10.5px] font-black px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              CANLI
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-neutral-700 text-neutral-200 text-[10.5px] font-bold px-2.5 py-1 rounded-full">
              <Radio className="w-3 h-3" />
              Yayın bitti
            </span>
          )}
          {canli && durum.viewers ? <span className="text-[11px] text-neutral-300">{durum.viewers.toLocaleString('tr-TR')} izleyici</span> : null}
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center" aria-label="Kapat">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center">
        {canli ? (
          <div className="w-full max-h-full" style={{ aspectRatio: '16 / 9', maxWidth: 'calc((100vh - 130px) * 16 / 9)' }}>
            <iframe
              key={durum.videoId}
              title={durum.title || 'Canlı yayın'}
              src={youtubeEmbed(durum.videoId!, { autoplay: true, muted: false, controls: true })}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="w-full h-full border-0 bg-black"
            />
          </div>
        ) : (
          <div className="text-center px-8 space-y-3">
            <p className="text-white text-[15px] font-bold">Canlı yayın sona erdi</p>
            <p className="text-neutral-400 text-[12px]">Yeni bir yayın başladığında ana sayfadaki vitrinde yeniden görünecek.</p>
            <button onClick={onClose} className="px-5 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white text-sm font-bold">
              Kapat
            </button>
          </div>
        )}
      </div>

      {canli && (
        <div className="px-4 pt-2 space-y-2" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)' }}>
          {durum.title && <h2 className="text-white text-[14px] font-extrabold leading-snug line-clamp-2">{durum.title}</h2>}
          <a
            href={`https://www.youtube.com/watch?v=${durum.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-neutral-300 hover:text-white underline underline-offset-2"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Oynatma sorunu varsa YouTube'da aç
          </a>
        </div>
      )}
    </div>
  );
};
