import React, { useState } from 'react';
import {
  Zap,
  HeartCrack,
  ChevronRight,
  Maximize2,
  Calendar,
  Clock,
  Compass,
} from 'lucide-react';
import { NewsItem, ObituaryItem } from '../types';

interface NewsSectionProps {
  news: NewsItem[];
  obituaries: ObituaryItem[];
  onOpenNewsDetail: (news: NewsItem) => void;
  onOpenAllNews?: () => void;
  onOpenVefat?: () => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({
  news,
  obituaries,
  onOpenNewsDetail,
  onOpenAllNews,
  onOpenVefat,
}) => {
  const [activeTab, setActiveTab] = useState<'son-dakika' | 'kayiplar'>('son-dakika');

  const mainNews = news[0];

  return (
    <div className="px-3 py-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-4 bg-rose-600 rounded-full" />
          <h2 className="text-[15px] font-black tracking-tight text-neutral-900">
            HABERLER & KAYIPLAR
          </h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-neutral-100 p-1 rounded-xl flex items-center gap-1 mb-2.5">
        <button
          onClick={() => setActiveTab('son-dakika')}
          className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeTab === 'son-dakika'
              ? 'bg-white text-rose-600 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
          <span>Son Dakika</span>
        </button>

        <button
          onClick={() => setActiveTab('kayiplar')}
          className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeTab === 'kayiplar'
              ? 'bg-white text-neutral-900 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <HeartCrack className="w-3.5 h-3.5 text-neutral-500" />
          <span>Kaybettiklerimiz</span>
        </button>
      </div>

      {/* Content based on Tab */}
      {activeTab === 'son-dakika' ? (
        <div>
          {mainNews ? (
            /* Breaking News Card */
            <div
              onClick={() => onOpenNewsDetail(mainNews)}
              className="bg-rose-50/80 border border-rose-200/90 rounded-2xl p-3 flex items-start justify-between gap-3 shadow-xs cursor-pointer hover:bg-rose-100/60 transition group active:scale-98"
            >
              <div className="flex items-start gap-3">
                {/* Lightning Red Circle */}
                <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 group-hover:scale-105 transition-transform">
                  <Zap className="w-5 h-5 fill-rose-600 text-rose-600" />
                </div>

                <div>
                  <div className="text-[12px] font-extrabold text-rose-700 tracking-tight">
                    Son Dakika
                  </div>
                  <h3 className="text-[13px] font-bold text-neutral-900 leading-snug mt-0.5 line-clamp-2">
                    {mainNews.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] font-bold bg-neutral-200/70 text-neutral-700 px-1.5 py-0.5 rounded">
                      {mainNews.category}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-medium">
                      {mainNews.date}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expand button */}
              <div className="w-7 h-7 rounded-full bg-white shadow-xs border border-rose-200/60 flex items-center justify-center text-neutral-600 shrink-0 mt-1 group-hover:text-rose-600">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>
          ) : (
            /* Empty News State */
            <div
              onClick={onOpenAllNews}
              className="bg-neutral-50 hover:bg-neutral-100/80 border border-dashed border-neutral-300 rounded-2xl p-4 text-center cursor-pointer transition group"
            >
              <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-2">
                <Zap className="w-4 h-4 fill-rose-600 text-rose-600" />
              </div>
              <h4 className="text-[13px] font-extrabold text-neutral-900">
                Henüz yayınlanmış son dakika haberi yok
              </h4>
              <p className="text-[11px] text-neutral-500 mt-1">
                Mahallenizdeki duyuru ve gelişmeleri haber masamıza iletebilirsiniz.
              </p>
            </div>
          )}

          {/* Footer link */}
          <div className="text-right mt-2">
            <button
              onClick={onOpenAllNews}
              className="inline-flex items-center gap-0.5 text-[12px] font-bold text-neutral-600 hover:text-rose-600 transition cursor-pointer"
            >
              <span>Tüm haberler</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Kaybettiklerimiz (Obituary list) */
        <div className="space-y-2">
          {obituaries.length > 0 ? (
            obituaries.map((ob) => (
              <div
                key={ob.id}
                onClick={onOpenVefat}
                className="bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/80 rounded-2xl p-3 shadow-xs cursor-pointer transition active:scale-98"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[13px] font-black text-neutral-900">
                      {ob.name}
                    </span>
                    <div className="text-[10px] text-neutral-500 font-semibold">
                      Memleketi: <strong className="text-neutral-700">{ob.hometown}</strong> • Babası: {ob.fatherName}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full shrink-0">
                    Vefat
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600 mt-1 font-medium">
                  Cenaze: <span className="font-bold text-neutral-800">{ob.mosque}</span> • {ob.date}
                </p>
                <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-0.5 pt-1 border-t border-neutral-200/60">
                  <span>Defin: {ob.cemetery}</span>
                  <span className="font-bold text-rose-600 flex items-center gap-0.5">
                    Taziye & Bilgiler <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div
              onClick={onOpenVefat}
              className="bg-neutral-50 hover:bg-neutral-100/80 border border-dashed border-neutral-300 rounded-2xl p-4 text-center cursor-pointer transition"
            >
              <HeartCrack className="w-6 h-6 text-neutral-400 mx-auto mb-1.5" />
              <h4 className="text-[12.5px] font-black text-neutral-800">
                Kayıtlı güncel vefat ilanı bulunmuyor
              </h4>
              <p className="text-[10.5px] text-neutral-500 mt-0.5">
                Doğrulanmış vefat duyurusu veya taziye iletmek için dokunun.
              </p>
            </div>
          )}

          {/* Footer link to open modal */}
          <div className="text-right mt-2">
            <button
              onClick={onOpenVefat}
              className="inline-flex items-center gap-0.5 text-[12px] font-bold text-neutral-600 hover:text-rose-600 transition cursor-pointer"
            >
              <span>Tüm cenaze ilanları & İlan ver</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
