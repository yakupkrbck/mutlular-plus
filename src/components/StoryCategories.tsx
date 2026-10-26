import React, { useState } from 'react';
import { ChevronRight, Plus, Video, Sparkles, Megaphone, Play } from 'lucide-react';
import { StoryItem } from '../types';

interface StoryCategoriesProps {
  stories: StoryItem[];
  onSelectStory: (story: StoryItem, index: number) => void;
  onOpenStoryShare?: () => void;
  onNavigateCampus?: () => void;
  onNavigateCanliTv?: () => void;
  onNavigateAll?: () => void;
}

export const StoryCategories: React.FC<StoryCategoriesProps> = ({
  stories,
  onSelectStory,
  onOpenStoryShare,
  onNavigateCampus,
  onNavigateCanliTv,
  onNavigateAll,
}) => {
  const [activeTab, setActiveTab] = useState<'senin-icin' | 'canli-tv'>('senin-icin');

  const handleCanliTvClick = () => {
    setActiveTab('canli-tv');
    if (onNavigateCanliTv) {
      onNavigateCanliTv();
    } else if (onNavigateCampus) {
      onNavigateCampus();
    }
  };

  return (
    <div className="px-3 pt-2.5 pb-2">
      {/* Top Filter Buttons & 'Tümü >' */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-1">
          <button
            onClick={() => setActiveTab('senin-icin')}
            className={`flex-1 py-1 px-3.5 rounded-full text-xs font-bold transition shadow-2xs flex items-center justify-center gap-1.5 ${
              activeTab === 'senin-icin'
                ? 'bg-rose-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Esnaf Hikayeleri</span>
          </button>

          <button
            onClick={handleCanliTvClick}
            className={`flex-1 py-1 px-3.5 rounded-full text-xs font-bold transition shadow-2xs flex items-center justify-center gap-1.5 ${
              activeTab === 'canli-tv'
                ? 'bg-red-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>Canlı TV</span>
          </button>
        </div>

        <button
          onClick={onNavigateAll}
          className="flex items-center gap-0.5 text-xs font-bold text-neutral-500 hover:text-rose-600 transition pl-1 shrink-0"
        >
          <span>Tümü</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Story Circles Carousel */}
      <div className="relative">
        <div className="flex items-center gap-2.5 sm:gap-3.5 overflow-x-auto no-scrollbar py-1">
          
          {/* 1. Dükkanınız / Esnaf Hikaye Paylaş Çemberi */}
          {onOpenStoryShare && (
            <div
              onClick={onOpenStoryShare}
              className="flex flex-col items-center gap-1 cursor-pointer shrink-0 group select-none"
              title="Esnaf Hikayesi Paylaş"
            >
              <div className="relative p-0.5 rounded-full border-2 border-dashed border-amber-500 bg-amber-50 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex flex-col items-center justify-center text-white relative">
                  <Megaphone className="w-5 h-5 text-white drop-shadow" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-neutral-900 border-2 border-white flex items-center justify-center text-amber-400">
                    <Plus className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
              </div>
              <span className="text-[10.5px] font-black text-amber-900 tracking-tight text-center w-16 truncate">
                Hikaye Ekle
              </span>
            </div>
          )}

          {/* 2. Esnaf Hikayeleri Çemberleri */}
          {stories.map((story, index) => {
            const isVideo =
              story.mediaType === 'video' || (story.mediaUrl && story.mediaUrl.endsWith('.mp4'));

            return (
              <div
                key={story.id}
                onClick={() => onSelectStory(story, index)}
                className="flex flex-col items-center gap-1 cursor-pointer shrink-0 group select-none"
              >
                {/* Circular Avatar with Instagram-style gradient ring */}
                <div
                  className={`relative p-[2.5px] rounded-full transition-transform duration-200 group-hover:scale-105 shadow-2xs ${
                    story.isNew
                      ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600'
                      : 'border-2 border-neutral-300 bg-white'
                  }`}
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-900 border-2 border-white flex items-center justify-center relative">
                    <img
                      src={story.avatar || story.image}
                      alt={story.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />

                    {/* Video veya İndirim Rozeti */}
                    {isVideo && (
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-2xs py-0.5 flex items-center justify-center">
                        <Play className="w-2.5 h-2.5 text-white fill-white" />
                      </div>
                    )}
                  </div>

                  {/* Canlı / Yeni Rozeti */}
                  {story.badge && (
                    <div className="absolute -top-1 -right-1 bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full border border-white shadow-xs">
                      {story.badge.includes('İNDİRİM') ? '%' : '★'}
                    </div>
                  )}
                </div>

                {/* Story Merchant Title */}
                <span className="text-[10.5px] font-bold text-neutral-800 tracking-tight text-center w-16 truncate leading-tight">
                  {story.shortName || story.name}
                </span>
              </div>
            );
          })}

          {/* Next Button in carousel */}
          <button
            onClick={onNavigateAll}
            className="w-7 h-7 rounded-full bg-white border border-neutral-200 shadow-xs flex items-center justify-center text-rose-600 hover:bg-rose-50 active:scale-95 shrink-0 transition"
          >
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
