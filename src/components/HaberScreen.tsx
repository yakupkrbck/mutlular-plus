import React, { useState } from 'react';
import {
  Newspaper,
  Calendar,
  Eye,
  Share2,
  Search,
  Filter,
  Flame,
  Clock,
  ChevronRight,
  Sparkles,
  Building2,
  Send
} from 'lucide-react';
import { NewsItem, ObituaryItem } from '../types';

interface HaberScreenProps {
  newsList: NewsItem[];
  obituaryList?: ObituaryItem[];
  onSelectNews: (news: NewsItem) => void;
  onOpenNewsTip: () => void;
}

const NEWS_CATEGORIES = [
  'Tümü',
  'Şehir & Yaşam',
  'Eğitim & Kampüs',
  'Esnaf & Ekonomi',
  'Kültür & Turizm',
  'Spor',
  'Belediye Duyurusu',
];

export const HaberScreen: React.FC<HaberScreenProps> = ({
  newsList,
  obituaryList = [],
  onSelectNews,
  onOpenNewsTip,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNews = newsList.filter((item) => {
    const matchesCat =
      selectedCategory === 'Tümü' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const featured = filteredNews[0] || newsList[0];
  const remainingNews = filteredNews.slice(1);

  return (
    <div className="space-y-3.5 pb-8">
      {/* Top Search & Tip Banner */}
      <div className="px-3 pt-1">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Haber başlığı veya konu ara..."
            className="w-full bg-white border border-neutral-200/90 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-neutral-800 placeholder-neutral-400 shadow-2xs focus:outline-none focus:border-rose-500 font-medium"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-3 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 pb-1">
          {NEWS_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition active:scale-95 shrink-0 ${
                  isSelected
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200/80 shadow-2xs'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* News Tip Trigger Alert */}
      <div className="px-3">
        <div
          onClick={onOpenNewsTip}
          className="bg-gradient-to-r from-purple-50 to-rose-50 border border-purple-200/80 rounded-2xl p-3 flex items-center justify-between cursor-pointer hover:border-purple-300 transition shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[12px] font-black text-purple-950">
                Şehrinizden Bir Haber mi Var?
              </div>
              <div className="text-[10px] text-purple-800 font-semibold">
                Mutlular Haber Masasına ihbarda bulunun, saniyeler içinde yayınlayalım.
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-purple-600 shrink-0" />
        </div>
      </div>

      {/* Featured News Hero Card */}
      {featured && (
        <div className="px-3">
          <div
            onClick={() => onSelectNews(featured)}
            className="group relative rounded-3xl overflow-hidden bg-neutral-900 shadow-md cursor-pointer border border-neutral-200/80 transition transform active:scale-98"
          >
            <div className="relative h-56 w-full">
              <img
                src={featured.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80'}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="bg-rose-600 text-white text-[9.5px] font-black uppercase px-2 py-0.5 rounded shadow-xs">
                  {featured.category}
                </span>
                {featured.urgent && (
                  <span className="bg-amber-400 text-neutral-950 text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-xs animate-pulse">
                    Flaş Haber
                  </span>
                )}
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
                <h3 className="text-base sm:text-lg font-black leading-snug drop-shadow-md">
                  {featured.title}
                </h3>
                <p className="text-[11.5px] text-neutral-300 line-clamp-2 leading-relaxed">
                  {featured.summary}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-neutral-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {featured.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {featured.readCount || '1.850 Okunma'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Other News or Empty State */}
      <div className="px-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-3.5 bg-rose-600 rounded-full" />
            <h3 className="text-[14px] font-black tracking-tight text-neutral-900">
              GÜNCEL GELİŞMELER ({filteredNews.length})
            </h3>
          </div>
          <span className="text-[10px] font-bold text-neutral-400">
            Mutlular Haber Masası
          </span>
        </div>

        {filteredNews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-8 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-neutral-900">
                Henüz yayınlanmış mahalle haberi bulunmuyor
              </h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Mehmet Akif Mahallesindeki gelişmeleri, duyuruları veya etkinlikleri haber masamıza ileterek ilk haberi yayınlayabilirsiniz.
              </p>
            </div>
            <button
              onClick={onOpenNewsTip}
              className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Haber / İhbar Gönder</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {remainingNews.map((news) => (
              <div
                key={news.id}
                onClick={() => onSelectNews(news)}
                className="bg-white rounded-2xl p-3 border border-neutral-200/80 shadow-2xs flex gap-3 cursor-pointer hover:border-rose-400 active:scale-98 transition group"
              >
                <img
                  src={news.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&auto=format&fit=crop&q=80'}
                  alt={news.title}
                  className="w-24 h-24 rounded-xl object-cover shrink-0 bg-neutral-100 group-hover:scale-102 transition-transform"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9.5px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.2 rounded">
                        {news.category}
                      </span>
                      {news.urgent && (
                        <span className="text-[8.5px] font-black text-white bg-rose-600 px-1.5 py-0.2 rounded">
                          SON DAKİKA
                        </span>
                      )}
                    </div>
                    <h4 className="text-[12.5px] font-black text-neutral-900 leading-snug line-clamp-2">
                      {news.title}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {news.date}
                    </span>
                    <span className="font-bold text-neutral-600 group-hover:text-rose-600 flex items-center gap-0.5">
                      Haberi Oku <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
