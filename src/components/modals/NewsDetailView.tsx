import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, Eye, Share2, ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import { NewsItem } from '../../types';
import { PLACEHOLDER_IMG } from '../../utils/placeholder';
import { youtubeId } from '../../utils/newsVideo';
import { blokAyir, hafifGorsel, hafifVideo } from '../../utils/gorsel';
import { formatViews, useNewsViews } from '../../services/newsViewService';
import { PaylasimKartiModal } from '../PaylasimKartiModal';
import { izlemeliLink } from '../../services/paylasimService';

interface NewsDetailViewProps {
  news: NewsItem | null;
  onClose: () => void;
  /** Sosyal medya kartı yalnızca yöneticiye açık */
  yonetici?: boolean;
}

const YAZI_MIN = 12;
const YAZI_MAX = 24;
const YAZI_VARSAYILAN = 15;

const yaziBoyutuOku = (): number => {
  try {
    const v = Number(localStorage.getItem('mp_haber_yazi'));
    return v >= YAZI_MIN && v <= YAZI_MAX ? v : YAZI_VARSAYILAN;
  } catch {
    return YAZI_VARSAYILAN;
  }
};

export const NewsDetailView: React.FC<NewsDetailViewProps> = ({ news, onClose, yonetici = false }) => {
  // Hook'lar erken return'den ÖNCE olmalı
  const views = useNewsViews(news ? [news.id] : []);
  const [kartAcik, setKartAcik] = useState(false);
  const [yazi, setYazi] = useState<number>(yaziBoyutuOku);
  const [buyuk, setBuyuk] = useState<string | null>(null);
  const [yakin, setYakin] = useState(false);
  const [videoYedek, setVideoYedek] = useState(false);
  const [kaydirma, setKaydirma] = useState(0);
  const [baslikBitis, setBaslikBitis] = useState(200);
  const [medyaYuk, setMedyaYuk] = useState(240);
  const kapsayici = useRef<HTMLDivElement>(null);
  const baslikRef = useRef<HTMLHeadingElement>(null);
  const medyaRef = useRef<HTMLDivElement>(null);

  const bloklar = useMemo(() => blokAyir(news?.content), [news?.content]);

  useEffect(() => {
    setVideoYedek(false);
    setBuyuk(null);
    kapsayici.current?.scrollTo({ top: 0 });
  }, [news?.id]);

  useEffect(() => {
    const olc = () => {
      if (baslikRef.current) setBaslikBitis(baslikRef.current.offsetTop + baslikRef.current.offsetHeight);
      if (medyaRef.current) setMedyaYuk(medyaRef.current.offsetHeight);
    };
    olc();
    window.addEventListener('resize', olc);
    return () => window.removeEventListener('resize', olc);
  }, [news?.id, yazi]);

  const yaziDegistir = (d: number) =>
    setYazi((eski) => {
      const yeni = Math.min(YAZI_MAX, Math.max(YAZI_MIN, eski + d));
      try {
        localStorage.setItem('mp_haber_yazi', String(yeni));
      } catch {}
      return yeni;
    });

  if (!news) return null;
  const okunma = views[news.id];

  const yt = news.video ? youtubeId(news.video) : null;

  const handleShare = () => {
    const link = izlemeliLink(`/haber/${news.id}`, 'diger', 'haber');
    if (navigator.share) {
      navigator.share({ title: news.title, text: news.summary, url: link }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(`${news.title}\n${link}`);
      alert('Haber bağlantısı kopyalandı!');
    }
  };

  // Üstteki medya kaydırılıp çıkınca sabit üst çubuk görünür; başlık da ekrandan çıkınca çubuğa yazılır
  const cubukGorunur = kaydirma > medyaYuk - 70;
  const baslikCubukta = kaydirma > baslikBitis - 60;
  const topPad = 'env(safe-area-inset-top, 0px)';
  const yuvarlak = 'w-8 h-8 rounded-full flex items-center justify-center pointer-events-auto transition';
  const koyu = `${yuvarlak} bg-black/50 hover:bg-black/70 text-white`;
  const acik = `${yuvarlak} bg-neutral-100 hover:bg-neutral-200 text-neutral-800`;
  const kls = cubukGorunur ? acik : koyu;

  return (
    <div className="fixed inset-0 z-50 bg-white animate-in fade-in duration-200">
      <div className="bg-white w-full h-full overflow-hidden flex flex-col relative sm:max-w-2xl sm:mx-auto">
        {/* Üst çubuk: medya üstündeyken saydam düğmeler, medya geçilince beyaz çubuk (geri · başlık · yazı boyutu · paylaş) */}
        <div
          className={`absolute inset-x-0 top-0 z-20 flex items-center gap-2 px-3 pointer-events-none transition-colors duration-200 ${
            cubukGorunur ? 'bg-white/95 backdrop-blur border-b border-neutral-200 shadow-sm' : ''
          }`}
          style={{ paddingTop: `calc(${topPad} + 8px)`, paddingBottom: 8 }}
        >
          <button onClick={onClose} aria-label="Geri" className={kls}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            {cubukGorunur && (
              <div className={`text-[12.5px] font-extrabold text-neutral-900 truncate transition-opacity duration-200 ${baslikCubukta ? 'opacity-100' : 'opacity-0'}`}>
                {news.title}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 pointer-events-auto">
            <button onClick={() => yaziDegistir(-1)} disabled={yazi <= YAZI_MIN} aria-label="Yazıyı küçült" className={`${kls} text-[11px] font-black disabled:opacity-40`}>
              A−
            </button>
            <button onClick={() => yaziDegistir(1)} disabled={yazi >= YAZI_MAX} aria-label="Yazıyı büyüt" className={`${kls} text-[14px] font-black disabled:opacity-40`}>
              A+
            </button>
            <button onClick={handleShare} aria-label="Paylaş" className={kls}>
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tek kaydırma alanı: medya + yazı birlikte kayar */}
        <div ref={kapsayici} onScroll={(e) => setKaydirma(e.currentTarget.scrollTop)} className="flex-1 overflow-y-auto overscroll-contain">
          <div ref={medyaRef} className="w-full bg-black" style={{ paddingTop: news.video ? `calc(${topPad} + 52px)` : topPad }}>
            <div className="aspect-video w-full relative bg-neutral-900">
              {news.video ? (
                yt ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${yt}?rel=0&playsinline=1`}
                    title={news.title}
                    allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  <video
                    key={videoYedek ? 'asil' : 'hafif'}
                    src={videoYedek ? news.video : hafifVideo(news.video)}
                    poster={hafifGorsel(news.image, 1080) || undefined}
                    controls
                    playsInline
                    preload="metadata"
                    onError={() => setVideoYedek(true)}
                    className="w-full h-full bg-black"
                  />
                )
              ) : (
                <img src={hafifGorsel(news.image, 1280) || PLACEHOLDER_IMG} alt={news.title} className="w-full h-full object-cover" />
              )}
            </div>
          </div>

          <article className="px-4 pt-4 pb-6 text-neutral-700" style={{ fontSize: yazi, lineHeight: 1.65 }}>
            <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">{news.category}</span>
            <h1 ref={baslikRef} className="font-black leading-snug text-neutral-900 mt-2" style={{ fontSize: yazi + 5 }}>
              {news.title}
            </h1>
            <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-medium mt-1.5 mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {news.date}
              </span>
              {okunma ? (
                <span className="flex items-center gap-1" data-testid="okunma">
                  <Eye className="w-3 h-3" />
                  {formatViews(okunma)}
                </span>
              ) : null}
            </div>

            <p className="font-bold text-neutral-900 mb-4" style={{ fontSize: yazi + 1.5, lineHeight: 1.5 }}>
              {news.summary}
            </p>

            <div className="space-y-3.5">
              {bloklar.map((b, i) =>
                b.t === 'p' ? (
                  <p key={i} className="whitespace-pre-line">
                    {b.metin}
                  </p>
                ) : (
                  <figure key={i} className="-mx-4 my-1">
                    <button type="button" onClick={() => { setBuyuk(b.url); setYakin(false); }} className="block w-full" aria-label="Görseli büyüt">
                      <img src={hafifGorsel(b.url, 1080)} alt={b.yazi || ''} loading="lazy" className="w-full h-auto bg-neutral-100" />
                    </button>
                    {b.yazi && <figcaption className="px-4 pt-1.5 text-[11.5px] text-neutral-500 leading-snug">{b.yazi}</figcaption>}
                  </figure>
                )
              )}
            </div>

            <div className="mt-5 p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-[11px]">
              <div className="font-extrabold text-neutral-800">Mutlular Plus Haber Masası</div>
            </div>
          </article>
        </div>

        {/* Alt çubuk: her zaman sabit */}
        <div className="shrink-0 p-3 bg-white border-t border-neutral-200 flex items-center gap-2" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
          <button
            onClick={handleShare}
            className="flex-1 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold text-[12px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>Haberi Paylaş</span>
          </button>
          {yonetici && (
            <button
              onClick={() => setKartAcik(true)}
              className="flex-1 bg-neutral-900 hover:bg-neutral-800 active:scale-98 text-white font-bold text-[12px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Kart Oluştur</span>
            </button>
          )}
        </div>

        {/* Görsel büyütme: dokununca yakınlaşır, kaydırarak gezilir */}
        {buyuk && (
          <div className="absolute inset-0 z-40 bg-black flex flex-col">
            <div className="flex justify-end p-3" style={{ paddingTop: `calc(${topPad} + 8px)` }}>
              <button onClick={() => setBuyuk(null)} aria-label="Kapat" className="w-9 h-9 rounded-full bg-white/15 text-white flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto" style={{ touchAction: 'pan-x pan-y pinch-zoom' }} onClick={() => setYakin((z) => !z)}>
              <div className="min-h-full flex items-center justify-center">
                <img src={hafifGorsel(buyuk, 1600)} alt="" style={{ width: yakin ? '250%' : '100%', maxWidth: 'none' }} className="h-auto select-none" draggable={false} />
              </div>
            </div>
            <div className="text-center text-[11px] text-white/60 pb-3">{yakin ? 'Küçültmek için dokunun' : 'Yakınlaştırmak için dokunun'}</div>
          </div>
        )}
      </div>
      <PaylasimKartiModal
        acik={kartAcik}
        onKapat={() => setKartAcik(false)}
        kart={{ tur: 'haber', baslik: news.title, altBaslik: news.summary, gorsel: news.image, etiket: (news.category || 'HABER').toLocaleUpperCase('tr-TR') }}
        yol={`/haber/${news.id}`}
        ozet={news.summary}
        kampanya="haber"
      />
    </div>
  );
};
