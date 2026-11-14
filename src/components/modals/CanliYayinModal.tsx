import React from 'react';
import { X } from 'lucide-react';
import { CanliDurum, yayinAnahtari } from '../../services/canliYayinService';
import { YayinOynatici } from '../YayinOynatici';

interface CanliYayinModalProps {
  isOpen: boolean;
  onClose: () => void;
  durum: CanliDurum;
}

/**
 * Canlı yayın ekranı. Yayın (YouTube yayını/videosu ya da yüklenmiş video) varken açılır; yayın bitince kendiliğinden kapanır.
 * Yorum/beğeni/izleyici sayısı uydurulmaz: izleyici sayısı yalnızca YouTube'un bildirdiği gerçek değerdir.
 */
export const CanliYayinModal: React.FC<CanliYayinModalProps> = ({ isOpen, onClose, durum }) => {
  if (!isOpen || !durum.live || !(durum.videoId || durum.dosyaUrl)) return null;
  const canli = durum.rozet !== 'video';
  const tur = durum.videoId ? 'youtube' : 'dosya';
  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col" role="dialog" aria-modal="true" aria-label={canli ? 'Canlı yayın' : 'Video'}>
      <div className="flex items-center justify-between gap-2 px-3 pb-2" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)' }}>
        <div className="flex items-center gap-2 min-w-0">
          {canli ? (
            <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[10.5px] font-black px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              CANLI
            </span>
          ) : (
            <span className="inline-flex items-center bg-white/15 text-white text-[10.5px] font-black px-2.5 py-1 rounded-full">VİDEO</span>
          )}
          <span className="text-[12px] font-bold text-white/90">
            Mutlular <span className="text-amber-400">Plus</span>
          </span>
          {canli && durum.viewers ? <span className="text-[11px] text-neutral-300">{durum.viewers.toLocaleString('tr-TR')} izleyici</span> : null}
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center" aria-label="Kapat">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div className="w-full max-h-full" style={{ aspectRatio: '16 / 9', maxWidth: 'calc((100vh - 130px) * 16 / 9)' }}>
          <YayinOynatici key={yayinAnahtari(durum)} tur={tur} videoId={durum.videoId} url={durum.dosyaUrl} canli={canli} dongu={durum.dongu} baslik={durum.title} />
        </div>
      </div>

      {durum.title && (
        <div className="px-4 pt-2" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
          <h2 className="text-white text-[15px] font-extrabold leading-snug line-clamp-2">{durum.title}</h2>
        </div>
      )}
    </div>
  );
};
