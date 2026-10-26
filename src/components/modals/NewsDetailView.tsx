import React from 'react';
import { X, Calendar, Share2, Eye, Tag, ArrowLeft } from 'lucide-react';
import { NewsItem } from '../../types';

interface NewsDetailViewProps {
  news: NewsItem | null;
  onClose: () => void;
}

export const NewsDetailView: React.FC<NewsDetailViewProps> = ({ news, onClose }) => {
  if (!news) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.summary,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${news.title} - Mutlular Plus Haber`);
      alert('Haber bağlantısı kopyalandı!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col relative">
        {/* Top Header Buttons */}
        <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between pointer-events-none">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center pointer-events-auto transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center pointer-events-auto transition"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Featured Image */}
        <div className="relative h-56 w-full bg-neutral-900 shrink-0">
          <img
            src={news.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=700&auto=format&fit=crop&q=80'}
            alt={news.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <span className="bg-rose-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
              {news.category}
            </span>
            <h2 className="text-[15px] font-black leading-snug mt-1.5 drop-shadow-md">
              {news.title}
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-white/80 font-medium mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {news.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                1.420 Okunma
              </span>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1 text-[13px] text-neutral-700 leading-relaxed">
          <p className="font-bold text-neutral-900 leading-snug text-[14px]">
            {news.summary}
          </p>

          <p>
            Mutlular genelinde devam eden kalkınma ve istihdam hamlesi kapsamında yeni yatırımlar hayata geçiriliyor. Şehrin önde gelen sivil toplum kuruluşları, sanayiciler ve esnaf temsilcileri bir araya gelerek ortak yol haritasını değerlendirdi.
          </p>

          <p>
            Vatandaşların yoğun ilgi gösterdiği projede özellikle genç istihdamı, üniversite sanayi iş birliği ve Mutlular Plus dijital altyapısının yaygınlaştırılması ön planda tutuluyor.
          </p>

          <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-[11px] space-y-1">
            <div className="font-extrabold text-neutral-800">Mutlular Plus Haber Masası</div>
            <div className="text-neutral-500">Kaynak: Yerel Muhabir Ağı • Doğrulanmış Haber</div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex-1 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold text-[12px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>Haberi Paylaş</span>
          </button>
        </div>
      </div>
    </div>
  );
};
