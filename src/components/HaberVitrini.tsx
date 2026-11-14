import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NewsItem, UserProfile, HeroBannerItem } from '../types';
import { PLACEHOLDER_IMG } from '../utils/placeholder';
import { SecimVeri, secimHesapla, yuzdeYaz } from '../services/secimService';

interface HaberVitriniProps {
  newsList: NewsItem[];
  /** Yönetici panelinden yüklenen vitrin afişleri (önce gösterilir) */
  banners?: HeroBannerItem[];
  onSelectNews: (news: NewsItem) => void;
  /** Eski kısayol butonları vitrinden kaldırıldı; geriye dönük uyumluluk için isteğe bağlı */
  onOpenBusinessRegister?: () => void;
  onOpenLiveSupport?: () => void;
  userProfile?: UserProfile | null;
  onOpenEsnafPaneli?: () => void;
  /** Muhtarlık seçimi sonuçları: yayındaysa vitrinde slayt olarak gösterilir */
  secim?: SecimVeri | null;
  onOpenSecim?: () => void;
}

type SlideKind = 'banner' | 'news' | 'secim' | 'empty';

interface Slide {
  id: string;
  kind: SlideKind;
  image: string;
  title: string;
  label: string;
  urgent: boolean;
  news: NewsItem | null;
  /** Bu slaytta kalma süresi (ms) */
  dwell: number;
}

const DWELL = { normal: 4500, secim: 8000 };

export const HaberVitrini: React.FC<HaberVitriniProps> = ({
  newsList,
  banners = [],
  onSelectNews,
  secim,
  onOpenSecim,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Önce yöneticinin yüklediği afişler, sonra haberler. İkisi de yoksa nötr bir kart gösterilir.
  const slides: Slide[] = useMemo(() => {
    const list: Slide[] = [];
    // Seçim sonuçları yayındaysa
    if (secim?.yayinda) {
      list.push({ id: 'secim', kind: 'secim', image: '', title: secim.baslik, label: 'Seçim', urgent: false, news: null, dwell: DWELL.secim });
    }
    list.push(
      ...banners.map((b) => ({
        id: `banner-${b.id}`,
        kind: 'banner' as const,
        image: b.image,
        title: b.title,
        label: b.tag || '',
        urgent: false,
        news: null,
        dwell: DWELL.normal,
      })),
      ...newsList.map((n) => ({
        id: `news-${n.id}`,
        kind: 'news' as const,
        image: n.image || '',
        title: n.title,
        label: n.category,
        urgent: !!n.urgent,
        news: n,
        dwell: DWELL.normal,
      }))
    );
    if (list.length === 0) {
      list.push({
        id: 'empty',
        kind: 'empty',
        image: '',
        title: 'Mehmet Akif Mahallesi',
        label: '',
        urgent: false,
        news: null,
        dwell: DWELL.normal,
      });
    }
    return list;
  }, [banners, newsList, secim?.yayinda, secim?.baslik]);

  const count = slides.length;
  const safeIndex = currentIndex >= count ? 0 : currentIndex;
  const active = slides[safeIndex];

  // Her slaytın kendi süresi var: canlı yayın uzun, seçim orta, haberler kısa kalır
  const activeDwell = active.dwell;
  useEffect(() => {
    if (isPaused || count <= 1) return;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, activeDwell);
    return () => clearTimeout(timer);
  }, [isPaused, count, safeIndex, activeDwell]);

  const handleOpen = () => {
    if (active.kind === 'secim') onOpenSecim?.();
    else if (active.news) onSelectNews(active.news);
  };
  const clickable = active.kind === 'secim' || !!active.news;
  const secimHesap = secim?.yayinda ? secimHesapla(secim) : null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? count - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % count);
  };

  // Başlığı sarı ve beyaz renklendir
  const renderTitle = (title: string) => {
    if (title.includes(':')) {
      const parts = title.split(':');
      return (
        <>
          <span className="text-amber-400">{parts[0]}:</span>{' '}
          <span className="text-white">{parts.slice(1).join(':')}</span>
        </>
      );
    }
    const words = title.split(' ');
    if (words.length <= 2) {
      return (
        <>
          <span className="text-amber-400">{words[0]} </span>
          <span className="text-white">{words.slice(1).join(' ')}</span>
        </>
      );
    }
    return (
      <>
        <span className="text-amber-400">{words.slice(0, 2).join(' ')} </span>
        <span className="text-white">{words.slice(2).join(' ')}</span>
      </>
    );
  };

  return (
    <div className="px-3 pt-2 pb-1">
      {/* Vitrin Hero Card */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onClick={handleOpen}
        // 16:9 oran: canlı yayın oynatıcısı ve seçim slaytı bu ölçüye göre yerleşir
        className={`relative w-full aspect-video rounded-2xl overflow-hidden shadow-md select-none group ${
          clickable ? 'cursor-pointer' : ''
        }`}
      >
        {/* Arka plan görselleri */}
        {slides.map((item, idx) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === safeIndex ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
            }`}
          >
            {item.kind === 'secim' ? (
              <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
            ) : item.image ? (
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-700"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMG;
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-950" />
            )}
            {item.kind !== 'secim' && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/25" />
            )}
          </div>
        ))}

        {/* Sol ve sağ oklar */}
        {count > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Önceki"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-xs text-white/90 hover:text-white flex items-center justify-center transition active:scale-90"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Sonraki"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-xs text-white/90 hover:text-white flex items-center justify-center transition active:scale-90"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Seçim durumu */}
        {active.kind === 'secim' && secim && secimHesap && (
          <div className="absolute inset-x-10 top-3.5 bottom-3.5 z-10 flex flex-col text-white" data-testid="vitrin-secim">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11.5px] font-bold text-slate-200 truncate">{secim.baslik}</span>
              <span className={`shrink-0 text-[9.5px] font-black px-2 py-0.5 rounded-full ${secim.durum === 'kesin' ? 'bg-emerald-400/20 text-emerald-200' : 'bg-sky-400/20 text-sky-200'}`}>
                {secim.durum === 'kesin' ? 'Kesinleşti' : 'Canlı'}
              </span>
            </div>
            <div className="flex-1 min-h-0 mt-1.5 grid grid-cols-[auto_1fr] gap-4 items-center">
              <div>
                <div className="text-[10.5px] text-slate-300">Açılan sandık</div>
                <div className="text-[34px] leading-none font-black tabular-nums">{yuzdeYaz(secimHesap.acilanSandikYuzde)}</div>
                <div className="text-[10.5px] text-slate-400 mt-1">
                  {secim.acilanSandik} / {secim.toplamSandik} sandık
                </div>
              </div>
              <ul className="space-y-2.5 min-w-0">
                {secimHesap.adaylar.slice(0, 3).map((a) => (
                  <li key={a.id}>
                    <div className="flex items-center justify-between gap-2 text-[11.5px] font-semibold">
                      <span className="truncate">{a.ad}</span>
                      <span className="tabular-nums shrink-0">{yuzdeYaz(a.yuzde)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/15 overflow-hidden mt-1">
                      <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${a.yuzde}%`, backgroundColor: a.renk }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Ayrıntılı sonuçlar için dokunun</div>
          </div>
        )}

        {/* Başlık */}
        {active.kind !== 'secim' && (
        <div className="absolute bottom-3.5 inset-x-3.5 z-10">
          <div className="text-[12px] font-semibold text-white/90 drop-shadow-sm flex items-center gap-1.5 mb-1">
            <span>Mutlular</span>
            <span className="text-amber-400 font-bold">Plus</span>
            {active.label && (
              <>
                <span className="text-white/40">•</span>
                <span className="text-amber-300/90 text-[11px] font-medium tracking-wide">{active.label}</span>
              </>
            )}
            {active.urgent && (
              <span className="bg-amber-400 text-neutral-950 text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-xs ml-1">
                Flaş
              </span>
            )}
          </div>

          <h2 className="font-black leading-tight drop-shadow-md text-[19px] sm:text-[21px] line-clamp-2">
            {renderTitle(active.title)}
          </h2>
        </div>
        )}
      </div>

      {/* Sayfa noktaları */}
      {count > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2.5 mb-0.5">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Slayt ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                idx === safeIndex
                  ? 'w-5 h-1.5 bg-amber-400'
                  : 'w-1.5 h-1.5 bg-neutral-300 hover:bg-neutral-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
