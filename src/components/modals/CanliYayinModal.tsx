import React, { useEffect, useRef, useState } from 'react';
import { Send, Trash2, X } from 'lucide-react';
import { CanliDurum, yayinAnahtari } from '../../services/canliYayinService';
import { useCanliYorumlar, yorumGonder, yorumSil, YORUM_MAX } from '../../services/canliYorumService';
import { YayinOynatici } from '../YayinOynatici';

interface CanliYayinModalProps {
  isOpen: boolean;
  onClose: () => void;
  durum: CanliDurum;
  /** Giriş yapmış kullanıcı (yorum için) */
  kullanici?: { uid: string; name: string } | null;
  /** Giriş yapılmamışsa yorum yazmak istendiğinde çağrılır */
  onGirisGerek?: () => void;
  /** Yönetici/editör: her yorumu silebilir */
  yonetici?: boolean;
}

/**
 * Canlı yayın ekranı. Yayın (YouTube kanalı/videosu ya da yüklenmiş video) varken açılır; yayın bitince kendiliğinden kapanır.
 * Yorumlar gerçek kullanıcılara aittir; izleyici sayısı yalnızca YouTube'un bildirdiği gerçek değerdir.
 */
export const CanliYayinModal: React.FC<CanliYayinModalProps> = ({ isOpen, onClose, durum, kullanici, onGirisGerek, yonetici }) => {
  const acik = isOpen && durum.live && !!(durum.videoId || durum.kanalId || durum.dosyaUrl);
  const yorumlar = useCanliYorumlar(durum.yayinBaslangicMs || 0, acik);
  const [metin, setMetin] = useState('');
  const [gonderiyor, setGonderiyor] = useState(false);
  const [hata, setHata] = useState('');
  const sonRef = useRef(0);
  const listeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listeRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [yorumlar.length]);

  if (!acik) return null;
  const canli = durum.rozet !== 'video';
  const tur = durum.videoId || durum.kanalId ? 'youtube' : 'dosya';

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kullanici) {
      onGirisGerek?.();
      return;
    }
    const t = metin.trim();
    if (!t || gonderiyor) return;
    if (Date.now() - sonRef.current < 4000) {
      setHata('Çok hızlı yazıyorsunuz, birkaç saniye bekleyin.');
      return;
    }
    setGonderiyor(true);
    setHata('');
    try {
      await yorumGonder(kullanici.uid, kullanici.name, t);
      sonRef.current = Date.now();
      setMetin('');
    } catch {
      setHata('Yorum gönderilemedi. Bağlantınızı kontrol edin.');
    } finally {
      setGonderiyor(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col" role="dialog" aria-modal="true" aria-label={canli ? 'Canlı yayın' : 'Video'}>
      <div className="flex items-center justify-between gap-2 px-3 pb-2 shrink-0" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)' }}>
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

      {/* 16:9 oynatıcı: telefon yan çevrilince ekranı doldurur; "tam ekran" düğmesiyle dikeyde de yatay izlenir */}
      <div className="shrink-0 w-full flex justify-center">
        <div className="w-full landscape:h-[calc(100vh-56px)] landscape:w-auto landscape:aspect-video" style={{ aspectRatio: '16 / 9' }}>
          <YayinOynatici key={yayinAnahtari(durum)} tur={tur} videoId={durum.videoId} kanalId={durum.kanalId} url={durum.dosyaUrl} canli={canli} dongu={durum.dongu} baslik={durum.title} />
        </div>
      </div>

      {/* Başlık + yorumlar (yan çevrilince gizlenir) */}
      <div className="flex-1 min-h-0 flex flex-col landscape:hidden">
        {durum.title && <h2 className="px-4 pt-2.5 pb-1 text-white text-[14px] font-extrabold leading-snug line-clamp-2 shrink-0">{durum.title}</h2>}
        <div className="px-4 pt-1 pb-1 text-[10.5px] font-black text-neutral-400 uppercase tracking-wider shrink-0">Yorumlar ({yorumlar.length})</div>
        <div ref={listeRef} className="flex-1 min-h-0 overflow-y-auto px-3 space-y-1.5 pb-2">
          {yorumlar.length === 0 && <p className="text-center text-[12px] text-neutral-500 pt-4">Henüz yorum yok. İlk yorumu siz yazın.</p>}
          {yorumlar.map((y) => (
            <div key={y.id} className="bg-neutral-800/70 border border-neutral-700/50 rounded-xl px-2.5 py-1.5 flex items-start gap-2 text-[12px]">
              <div className="flex-1 min-w-0 break-words">
                <span className={`font-black ${kullanici?.uid === y.uid ? 'text-amber-400' : 'text-neutral-100'}`}>{y.name}: </span>
                <span className="text-neutral-300">{y.text}</span>
              </div>
              <span className="text-[9.5px] text-neutral-500 font-mono shrink-0 pt-0.5">{new Date(y.createdAtMs).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
              {(yonetici || kullanici?.uid === y.uid) && (
                <button type="button" aria-label="Yorumu sil" onClick={() => yorumSil(y.id).catch(() => setHata('Silinemedi.'))} className="text-neutral-500 hover:text-rose-400 shrink-0 pt-0.5">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
        <form onSubmit={gonder} className="shrink-0 px-3 pt-2 bg-neutral-950 border-t border-neutral-800" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)' }}>
          {hata && <div className="text-[11px] text-rose-300 pb-1">{hata}</div>}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={metin}
              maxLength={YORUM_MAX}
              onChange={(e) => setMetin(e.target.value)}
              onFocus={() => {
                if (!kullanici) onGirisGerek?.();
              }}
              placeholder={kullanici ? 'Yorum yaz…' : 'Yorum yazmak için giriş yapın'}
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-[13px] text-white placeholder-neutral-500 outline-none focus:border-rose-500"
            />
            <button type="submit" disabled={!metin.trim() || gonderiyor} aria-label="Gönder" className="w-9 h-9 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white flex items-center justify-center shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
