import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  Share2,
  Store,
  Upload,
  Eye,
  Megaphone,
  Tag,
  MessageCircle,
} from 'lucide-react';
import { StoryItem } from '../../types';

interface EsnafStoryShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishStory: (newStory: StoryItem) => void;
  merchantName?: string;
  merchantCategory?: string;
  merchantPhone?: string;
  merchantAddress?: string;
  initialCampaignTitle?: string;
  initialBadge?: string;
}

const PRESET_STORY_TEMPLATES: {
  id: string;
  name: string;
  category: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  previewUrl: string;
  defaultBadge: string;
  defaultTitle: string;
  defaultDesc: string;
}[] = [
  {
    id: 'tpl-1',
    name: 'Burger & Izgara Cızırtısı (Canlı Video)',
    category: 'Yemek & Burger',
    mediaType: 'video',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hamburger-being-seasoned-42999-large.mp4',
    previewUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80',
    defaultBadge: 'GÜNÜN FIRSATI',
    defaultTitle: 'Dumanı Üstünde Çift Köfte Smash Burger Menü!',
    defaultDesc: 'Patates kızartması ve içecek hediyeli özel lezzet menümüz masada ve paket serviste hazır.',
  },
  {
    id: 'tpl-2',
    name: 'Fırın & Pide / Lahmacun (Canlı Video)',
    category: 'Pide & Kebap',
    mediaType: 'video',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-putting-a-pizza-in-the-oven-43003-large.mp4',
    previewUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300&auto=format&fit=crop&q=80',
    defaultBadge: '%20 İNDİRİM',
    defaultTitle: 'Taş Fırından Yeni Çıktı: Çıtır Lahmacun & Pide!',
    defaultDesc: 'Bugüne özel 3 lahmacun alana yayık ayran ikramımızdır.',
  },
  {
    id: 'tpl-3',
    name: '3. Nesil Kahve & Barista (Canlı Video)',
    category: 'Kafe & Tatlı',
    mediaType: 'video',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-serving-coffee-in-a-cup-40502-large.mp4',
    previewUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&auto=format&fit=crop&q=80',
    defaultBadge: '2. KAHVE HEDİYE',
    defaultTitle: 'Taze Çekilmiş Filtre Kahve & Tatlı Keyfi',
    defaultDesc: 'Mahalle sakinlerimize özel öğleden sonra saat 17:00’ye kadar geçerlidir.',
  },
  {
    id: 'tpl-4',
    name: 'Antep Baklava & Kadayıf (Görsel)',
    category: 'Tatlıcı',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1579888944880-d98341245702?w=1200&auto=format&fit=crop&q=80',
    previewUrl: 'https://images.unsplash.com/photo-1579888944880-d98341245702?w=300&auto=format&fit=crop&q=80',
    defaultBadge: 'SICAK ŞERBETLİ',
    defaultTitle: 'Fıstıklı Havuç Diliminde Günün İndirimi!',
    defaultDesc: 'Gerçek tereyağı ve taze Antep fıstığıyla günlük üretilmektedir.',
  },
  {
    id: 'tpl-5',
    name: 'Yeni Sezon Vitrin & Giyim (Görsel)',
    category: 'Giyim & Butik',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
    previewUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&auto=format&fit=crop&q=80',
    defaultBadge: 'YENİ SEZON',
    defaultTitle: 'Sonbahar / Kış Koleksiyonu Vitrinimizde!',
    defaultDesc: 'Sınırlı sayıda triko, kazak ve mont çeşitleri. WhatsApp üzerinden ayırtabilirsiniz.',
  },
  {
    id: 'tpl-6',
    name: 'Çiçek & Özel Hediye (Görsel)',
    category: 'Çiçekçi',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1200&auto=format&fit=crop&q=80',
    previewUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=300&auto=format&fit=crop&q=80',
    defaultBadge: 'ÜCRETSİZ TESLİMAT',
    defaultTitle: 'Taze Gül Buketleri & Canlı Saksı Çiçekleri',
    defaultDesc: 'Mahalle içi aynı gün 30 dakikada adrese teslim.',
  },
];

export const EsnafStoryShareModal: React.FC<EsnafStoryShareModalProps> = ({
  isOpen,
  onClose,
  onPublishStory,
  merchantName = 'İşletmeniz',
  merchantCategory = 'Esnaf & Mağaza',
  merchantPhone = '0532 990 12 34',
  merchantAddress = 'Mutlular Mah. Osmangazi / Bursa',
  initialCampaignTitle = '',
  initialBadge = 'GÜNÜN FIRSATI',
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState(PRESET_STORY_TEMPLATES[0]);
  const [title, setTitle] = useState(initialCampaignTitle || PRESET_STORY_TEMPLATES[0].defaultTitle);
  const [description, setDescription] = useState(PRESET_STORY_TEMPLATES[0].defaultDesc);
  const [badge, setBadge] = useState(initialBadge || PRESET_STORY_TEMPLATES[0].defaultBadge);
  const [mediaType, setMediaType] = useState<'video' | 'image'>(PRESET_STORY_TEMPLATES[0].mediaType);
  const [mediaUrl, setMediaUrl] = useState(PRESET_STORY_TEMPLATES[0].mediaUrl);
  const [actionText, setActionText] = useState('Dükkanı & Menüyü Gör');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSelectTemplate = (tpl: (typeof PRESET_STORY_TEMPLATES)[0]) => {
    setSelectedTemplate(tpl);
    setMediaType(tpl.mediaType);
    setMediaUrl(tpl.mediaUrl);
    if (!initialCampaignTitle) {
      setTitle(tpl.defaultTitle);
      setDescription(tpl.defaultDesc);
      setBadge(tpl.defaultBadge);
    }
  };

  const handleCustomUrlApply = () => {
    if (customUrlInput.trim()) {
      setMediaUrl(customUrlInput.trim());
      if (customUrlInput.endsWith('.mp4')) {
        setMediaType('video');
      } else {
        setMediaType('image');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newStory: StoryItem = {
      id: `esnaf-story-${Date.now()}`,
      name: merchantName,
      shortName: merchantName.slice(0, 10),
      category: merchantCategory,
      image: selectedTemplate.previewUrl,
      avatar: selectedTemplate.previewUrl,
      mediaType,
      mediaUrl,
      isNew: true,
      timeAgo: 'Az önce',
      title: title.trim(),
      description: description.trim(),
      badge: badge.trim().toUpperCase(),
      actionText,
      actionType: 'whatsapp',
      phone: merchantPhone,
      address: merchantAddress,
      likesCount: 1,
    };

    onPublishStory(newStory);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-neutral-200">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-neutral-950 via-slate-900 to-amber-950 text-white shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black shadow-md">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  Hikayede Paylaş
                </h3>
                <span className="text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Canlı Vitrin
                </span>
              </div>
              <p className="text-[11px] text-neutral-300">
                {merchantName} • Kampanyanızı mahalle sakinlerine tam ekran duyurun
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* 1. Medya Seçimi: Hazır Video & Görsel Şablonları */}
          <div>
            <label className="text-xs font-black text-neutral-900 block mb-1.5 flex items-center justify-between">
              <span>1. Hikaye Görseli / Videosu Seçin *</span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                {mediaType === 'video' ? '🎬 Canlı Video Oynatıcı' : '🖼️ Yüksek Çözünürlüklü Görsel'}
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_STORY_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplate.id === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`relative rounded-xl overflow-hidden text-left border-2 transition active:scale-95 group flex flex-col ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-400/40 shadow-md'
                        : 'border-neutral-200 hover:border-neutral-300 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="h-20 w-full relative bg-neutral-900">
                      <img
                        src={tpl.previewUrl}
                        alt={tpl.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 right-1 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                        {tpl.mediaType === 'video' ? (
                          <>
                            <Video className="w-2.5 h-2.5 text-amber-400" />
                            <span>Video</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-2.5 h-2.5 text-sky-400" />
                            <span>Görsel</span>
                          </>
                        )}
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                      )}
                    </div>
                    <div className="p-1.5 bg-neutral-50 text-[10px] font-bold text-neutral-800 truncate">
                      {tpl.name}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Özel Video veya Görsel Bağlantısı */}
            <div className="mt-2.5 flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Özel görsel veya video URL'si yapıştırın..."
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="flex-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-1.5 text-xs text-neutral-900 outline-none focus:border-amber-500 font-mono"
              />
              <button
                type="button"
                onClick={handleCustomUrlApply}
                className="bg-neutral-900 text-white font-bold text-xs px-3 py-1.5 rounded-xl hover:bg-black transition active:scale-95"
              >
                Uygula
              </button>
            </div>
          </div>

          {/* 2. Rozet ve Kampanya Başlığı */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black text-neutral-900 block mb-1">
                  Öne Çıkan Rozet
                </label>
                <input
                  type="text"
                  required
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="Örn: %20 İNDİRİM, GÜNÜN FIRSATI"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-bold text-amber-800 outline-none focus:border-amber-500"
                />
                <div className="flex items-center gap-1 mt-1 overflow-x-auto no-scrollbar">
                  {['%20 İNDİRİM', 'GÜNÜN MENÜSÜ', 'YENİ SEZON', 'DUYURU', 'GEL AL FIRSATI'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBadge(b)}
                      className="text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-amber-100 text-neutral-700 hover:text-amber-900 transition shrink-0"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-neutral-900 block mb-1">
                  Alt Buton Metni
                </label>
                <input
                  type="text"
                  required
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  placeholder="Örn: Menüyü İncele, WhatsApp ile Yaz"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-bold text-neutral-900 outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-neutral-900 block mb-1">
                Hikaye Başlığı & Duyuru Metni *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Dumanı Üstünde Çift Köfte Burger Menü Çıktı!"
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-bold text-neutral-900 outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-black text-neutral-900 block mb-1">
                Açıklama / Detaylar
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Kampanyanın şartları, porsiyon bilgisi veya stok durumu..."
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-medium text-neutral-900 outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>

          {/* 3. Canlı Mini Önizleme Kartı */}
          <div className="bg-neutral-900 text-white p-3 rounded-2xl flex items-center gap-3">
            <div className="w-12 h-16 rounded-xl overflow-hidden bg-neutral-800 shrink-0 relative">
              <img
                src={selectedTemplate.previewUrl}
                alt="Önizleme"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 bg-black/60 text-[8px] font-bold px-1 rounded text-amber-300">
                {mediaType.toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[9.5px] font-black uppercase text-amber-400 bg-amber-500/20 px-1.5 py-0.2 rounded">
                {badge || 'KAMPANYA'}
              </span>
              <h4 className="text-xs font-black text-white truncate mt-0.5">
                {title || 'Hikaye Başlığınız'}
              </h4>
              <p className="text-[10px] text-neutral-400 line-clamp-1">
                {description || 'Açıklama metni burada görüntülenecektir.'}
              </p>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:opacity-95 active:scale-98 text-neutral-950 font-black text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Hikayeyi Canlı Yayına Al (24 Saat Vitrinde)</span>
            </button>
          </div>
        </form>

        {showSuccess && (
          <div className="absolute inset-0 bg-neutral-950/90 flex flex-col items-center justify-center text-white z-20 animate-in fade-in">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
            <h3 className="text-base font-black mt-2">Hikayeniz Yayında!</h3>
            <p className="text-xs text-neutral-300 mt-0.5">
              Mahalle vitrininde en başa eklendi ve tüm sakinlere açıldı.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
