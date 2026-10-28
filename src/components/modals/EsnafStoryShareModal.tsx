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
import { ImageCropField } from '../ImageCropField';

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

export const EsnafStoryShareModal: React.FC<EsnafStoryShareModalProps> = ({
  isOpen,
  onClose,
  onPublishStory,
  merchantName = 'İşletmeniz',
  merchantCategory = 'Esnaf & Mağaza',
  merchantPhone = '',
  merchantAddress = '',
  initialCampaignTitle = '',
  initialBadge = '',
}) => {
  const [title, setTitle] = useState(initialCampaignTitle || '');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState(initialBadge || '');
  const [mediaUrl, setMediaUrl] = useState('');
  const mediaType: 'video' | 'image' = 'image';
  const [actionText, setActionText] = useState('Dükkanı & Menüyü Gör');
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl) {
      window.alert('Lütfen hikaye için bir fotoğraf yükleyin.');
      return;
    }
    if (!title.trim()) return;

    const newStory: StoryItem = {
      id: `esnaf-story-${Date.now()}`,
      name: merchantName,
      shortName: merchantName.slice(0, 10),
      category: merchantCategory,
      image: mediaUrl,
      avatar: mediaUrl,
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
      likesCount: 0,
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
          
          {/* 1. Hikaye fotoğrafı: gerçek yükleme + kırpma (dikey 9:16) */}
          <div>
            <label className="text-xs font-black text-neutral-900 block mb-1.5">
              1. Hikaye Fotoğrafı *
            </label>
            <ImageCropField
              value={mediaUrl}
              onChange={setMediaUrl}
              aspect={9 / 16}
              outputWidth={1080}
              hint="Dikey (9:16) kırpılır. Galeriden veya kameradan yükleyin."
            />
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
