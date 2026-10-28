import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Heart,
  Share2,
  MessageCircle,
  Store,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  MapPin,
  Clock,
  UtensilsCrossed,
} from 'lucide-react';
import { StoryItem } from '../../types';

interface StoryViewerModalProps {
  isOpen: boolean;
  stories: StoryItem[];
  initialStoryIndex?: number;
  onClose: () => void;
  onOpenStore?: (storeNameOrId: string) => void;
  onLikeStory?: (storyId: string) => void;
}

const STORY_DURATION_MS = 6000; // 6 saniye per story

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  isOpen,
  stories,
  initialStoryIndex = 0,
  onClose,
  onOpenStore,
  onLikeStory,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [likedStories, setLikedStories] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressIntervalRef = useRef<any>(null);

  // Sync initial index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialStoryIndex, stories.length - 1)));
      setProgress(0);
      setIsPaused(false);
    }
  }, [isOpen, initialStoryIndex, stories.length]);

  const currentStory = stories[currentIndex];

  // Initialize like counts
  useEffect(() => {
    if (currentStory && likeCounts[currentStory.id] === undefined) {
      setLikeCounts((prev) => ({
        ...prev,
        [currentStory.id]: currentStory.likesCount || Math.floor(Math.random() * 40) + 15,
      }));
    }
  }, [currentStory, likeCounts]);

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    } else {
      setProgress(0);
    }
  }, [currentIndex]);

  // Story Timer & Progress Bar
  useEffect(() => {
    if (!isOpen || isPaused || !currentStory) return;

    const intervalTime = 50; // Update every 50ms
    const step = (intervalTime / STORY_DURATION_MS) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isOpen, isPaused, currentStory, handleNext]);

  // Video playback sync with pause/play
  useEffect(() => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isPaused, currentIndex]);

  // Keyboard controls (Left, Right, Space, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || !currentStory) return null;

  const isLiked = likedStories[currentStory.id];
  const currentLikes = likeCounts[currentStory.id] ?? (currentStory.likesCount || 24);

  const toggleLike = () => {
    setLikedStories((prev) => {
      const next = !prev[currentStory.id];
      setLikeCounts((c) => ({
        ...c,
        [currentStory.id]: (c[currentStory.id] || 0) + (next ? 1 : -1),
      }));
      if (next) {
        setShowHeartAnim(true);
        setTimeout(() => setShowHeartAnim(false), 900);
      }
      return { ...prev, [currentStory.id]: next };
    });

    if (onLikeStory) {
      onLikeStory(currentStory.id);
    }
  };

  const handleShare = () => {
    const text = `${currentStory.name} işletmesinin Mutlular Plus hikayesi: "${currentStory.title}" https://mutlular.plus/hikaye/${currentStory.id}`;
    if (navigator.share) {
      navigator.share({ title: currentStory.name, text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }
  };

  const handleWhatsAppAction = () => {
    const phone = currentStory.phone;
    if (!phone) {
      window.alert('Bu işletme henüz WhatsApp numarası eklemedi.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Merhaba ${currentStory.name}! Mutlular Plus Mahalle Hikayenizdeki "${currentStory.title || 'fırsat'}" hakkında bilgi almak / sipariş vermek istiyorum.`
    );
    window.open(`https://wa.me/90${cleanPhone.replace(/^0/, '')}?text=${message}`, '_blank');
  };

  const handleDirections = () => {
    const query = encodeURIComponent(
      `${currentStory.name} ${currentStory.address || 'Mutlular Mahallesi Osmangazi Bursa'}`
    );
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const isVideo =
    currentStory.mediaType === 'video' ||
    (currentStory.mediaUrl && currentStory.mediaUrl.endsWith('.mp4'));

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-200">
      
      {/* Masaüstü Sol & Sağ Hızlı Geçiş Butonları */}
      <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className={`hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 text-white items-center justify-center transition active:scale-90 z-20 backdrop-blur-xs ${
          currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
        }`}
        title="Önceki Hikaye"
      >
        <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
      </button>

      <button
        onClick={handleNext}
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 text-white items-center justify-center transition active:scale-90 z-20 backdrop-blur-xs cursor-pointer"
        title="Sonraki Hikaye"
      >
        <ChevronRight className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Main Story Container (Phone Aspect Ratio) */}
      <div className="relative w-full h-full sm:h-[94vh] sm:max-h-[860px] sm:max-w-[420px] sm:rounded-3xl overflow-hidden bg-neutral-950 flex flex-col shadow-2xl border sm:border-neutral-800">
        
        {/* ======================================================== */}
        {/* 1. ÜST İLERLEME ÇUBUĞU (SEGMENTED PROGRESS BARS)          */}
        {/* ======================================================== */}
        <div className="absolute top-0 inset-x-0 z-30 pt-3 px-3 pb-2 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center gap-1.5">
          {stories.map((story, idx) => {
            let barFill = 0;
            if (idx < currentIndex) barFill = 100;
            else if (idx === currentIndex) barFill = progress;
            else barFill = 0;

            return (
              <div
                key={story.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                  setProgress(0);
                }}
                className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden cursor-pointer"
              >
                <div
                  className="h-full bg-white rounded-full transition-all duration-75 ease-linear shadow-xs"
                  style={{ width: `${barFill}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* 2. ESNAF PROFİLİ & ÜST EYLEMLER (HEADER)                 */}
        {/* ======================================================== */}
        <div className="absolute top-6 inset-x-0 z-30 px-3.5 pt-2 flex items-center justify-between text-white">
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenStore) {
                onClose();
                onOpenStore(currentStory.storeId || currentStory.name);
              }
            }}
            className="flex items-center gap-2.5 cursor-pointer group min-w-0"
          >
            {/* Story Avatar Ring */}
            <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shrink-0 shadow-md">
              <img
                src={currentStory.avatar || currentStory.image}
                alt={currentStory.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-neutral-950"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-white drop-shadow-md truncate group-hover:text-amber-300 transition">
                  {currentStory.name}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 fill-sky-400 shrink-0" />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-300 font-medium">
                <span className="bg-white/20 backdrop-blur-md px-1.5 py-0.2 rounded text-[10px] font-bold">
                  {currentStory.category}
                </span>
                <span>•</span>
                <span className="text-neutral-300">{currentStory.timeAgo || 'Bugün'}</span>
              </div>
            </div>
          </div>

          {/* Sağ Kontroller: Duraklat, Ses, Kapat */}
          <div className="flex items-center gap-1 shrink-0">
            {isVideo && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition active:scale-95"
                title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPaused(!isPaused);
              }}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition active:scale-95"
              title={isPaused ? 'Oynat' : 'Duraklat'}
            >
              {isPaused ? <Play className="w-4 h-4 text-amber-400 fill-amber-400" /> : <Pause className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-rose-600/80 backdrop-blur-md flex items-center justify-center text-white transition active:scale-95 ml-1"
              title="Kapat (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. TAM EKRAN MEDYA (VİDEO VEYA GÖRSEL)                    */}
        {/* ======================================================== */}
        <div
          className="relative flex-1 w-full h-full overflow-hidden bg-neutral-900 cursor-pointer"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {isVideo ? (
            <video
              ref={videoRef}
              key={currentStory.mediaUrl || currentStory.image}
              src={currentStory.mediaUrl}
              poster={currentStory.image}
              autoPlay
              loop
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              key={currentStory.mediaUrl || currentStory.image}
              src={currentStory.mediaUrl || currentStory.image}
              alt={currentStory.title || currentStory.name}
              className="w-full h-full object-cover animate-in fade-in duration-300"
            />
          )}

          {/* Sol & Sağ Dokunma Bölgeleri (Önceki / Sonraki) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-0 inset-y-0 w-1/3 z-10"
            title="Önceki"
          />
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-0 inset-y-0 w-2/3 z-10"
            title="Sonraki"
          />

          {/* Üst ve Alt Karartma Gradyanları (Metin Okunurluğu İçin) */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

          {/* Çift Tık Kalp Animasyonu */}
          {showHeartAnim && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-in zoom-in-50 fade-in duration-200">
              <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-2xl animate-pulse" />
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 4. HİKAYE BİLGİ & DUYURU KARTI (OVERLAY)                 */}
        {/* ======================================================== */}
        <div className="absolute bottom-20 inset-x-0 z-30 px-4 text-white space-y-2 pointer-events-none">
          {/* Rozet (İndirim / Kampanya / Yeni Sezon) */}
          {currentStory.badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentStory.badge}</span>
            </div>
          )}

          {/* Hikaye Başlığı */}
          <h2 className="text-base sm:text-lg font-black leading-snug drop-shadow-md text-white">
            {currentStory.title || `${currentStory.name} Özel Vitrin Paylaşımı`}
          </h2>

          {/* Hikaye Açıklaması */}
          {currentStory.description && (
            <p className="text-xs sm:text-sm text-neutral-200 font-medium leading-relaxed drop-shadow line-clamp-3">
              {currentStory.description}
            </p>
          )}

          {/* Konum / Adres */}
          {currentStory.address && (
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate">{currentStory.address}</span>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 5. ALT ETKİLEŞİM & EYLEM ÇUBUĞU (ACTION BAR)              */}
        {/* ======================================================== */}
        <div className="absolute bottom-0 inset-x-0 z-30 p-3 bg-gradient-to-t from-black via-black/95 to-transparent flex items-center gap-2">
          {/* Ana Eylem Butonu (Menüyü / Mağazayı Gör veya WhatsApp) */}
          <button
            onClick={() => {
              if (onOpenStore) {
                onClose();
                onOpenStore(currentStory.storeId || currentStory.name);
              } else {
                handleWhatsAppAction();
              }
            }}
            className="flex-1 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:opacity-95 active:scale-98 text-neutral-950 font-black text-xs sm:text-sm py-2.5 px-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition"
          >
            {currentStory.category.toLowerCase().includes('tatli') ||
            currentStory.category.toLowerCase().includes('pide') ||
            currentStory.category.toLowerCase().includes('kebap') ||
            currentStory.category.toLowerCase().includes('burger') ? (
              <UtensilsCrossed className="w-4 h-4 text-neutral-950" />
            ) : (
              <Store className="w-4 h-4 text-neutral-950" />
            )}
            <span>{currentStory.actionText || 'Dükkanı & Menüyü İncele'}</span>
          </button>

          {/* WhatsApp Hızlı Mesaj */}
          <button
            onClick={handleWhatsAppAction}
            className="w-10 h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white flex items-center justify-center transition shadow-md shrink-0"
            title="WhatsApp ile İletişim / Sipariş"
          >
            <MessageCircle className="w-5 h-5" />
          </button>

          {/* Beğen Butonu */}
          <button
            onClick={toggleLike}
            className={`w-10 h-10 rounded-2xl backdrop-blur-md flex flex-col items-center justify-center transition active:scale-90 shrink-0 border ${
              isLiked
                ? 'bg-rose-600/90 text-white border-rose-500'
                : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
            }`}
            title="Beğen"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
            <span className="text-[9px] font-bold leading-none mt-0.5">{currentLikes}</span>
          </button>

          {/* Yol Tarifi */}
          <button
            onClick={handleDirections}
            className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition backdrop-blur-md border border-white/20 shrink-0"
            title="Google Haritalar Yol Tarifi"
          >
            <Navigation className="w-4 h-4 text-amber-400" />
          </button>

          {/* Paylaş */}
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition backdrop-blur-md border border-white/20 shrink-0"
            title="Hikayeyi Paylaş"
          >
            <Share2 className="w-4 h-4 text-sky-400" />
          </button>
        </div>

        {/* Kopyalandı Bildirimi */}
        {copiedToast && (
          <div className="absolute top-20 inset-x-4 z-40 bg-emerald-500 text-neutral-950 text-xs font-black p-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Hikaye bağlantısı kopyalandı!</span>
          </div>
        )}
      </div>
    </div>
  );
};
