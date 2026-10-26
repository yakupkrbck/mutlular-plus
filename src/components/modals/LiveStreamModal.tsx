import React, { useState } from 'react';
import {
  X,
  Radio,
  Eye,
  MessageCircle,
  Heart,
  Send,
  Youtube,
  Tv,
  Share2,
  ExternalLink,
  Plus,
  Check,
  Sparkles,
  BellRing,
} from 'lucide-react';
import { sendAndroidAppNotification } from '../../services/androidNotificationService';

interface LiveStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface TvChannel {
  id: string;
  title: string;
  category: string;
  youtubeId: string;
  viewers: string;
  description: string;
  isLive: boolean;
}

// Helper to extract YouTube video or live stream ID from various URL formats
export function extractYouTubeId(urlOrId: string): string {
  if (!urlOrId) return 'jfKfPfyJRdk';
  const trimmed = urlOrId.trim();

  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex matching youtube.com/watch?v=..., youtu.be/..., youtube.com/live/..., youtube.com/embed/...
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/))([a-zA-Z0-9_-]{11})/
  );
  if (match && match[1]) {
    return match[1];
  }

  return trimmed;
}

const DEFAULT_CHANNELS: TvChannel[] = [
  {
    id: 'ch-1',
    title: 'Mutlular TV Ana Haber & Şehir Meclisi',
    category: 'Gündem',
    youtubeId: 'jfKfPfyJRdk', // Default active YouTube stream
    viewers: '1.480',
    description: 'Şehir meclisi canlı oturumu, yerel haber bülteni ve güncel gelişmeler.',
    isLive: true,
  },
  {
    id: 'ch-2',
    title: 'Mutlular Meydanı & Şehir Kameraları (7/24)',
    category: 'Şehir Kamerası',
    youtubeId: '5qap5aO4i9A',
    viewers: '820',
    description: 'Cumhuriyet Meydanı, Saat Kulesi ve Millet Bahçesi kesintisiz canlı yayın.',
    isLive: true,
  },
  {
    id: 'ch-3',
    title: 'Mutlular Açık Hava Kültür & Konser Yayını',
    category: 'Kültür & Sanat',
    youtubeId: 'kJQP7kiw5Fk',
    viewers: '640',
    description: 'Bahar etkinlikleri, tiyatro ve yerel sanatçıların canlı performansları.',
    isLive: false,
  },
  {
    id: 'ch-4',
    title: 'Mutlularspor TV & Canlı Karşılaşmalar',
    category: 'Spor',
    youtubeId: 'M7lc1UVf-VE',
    viewers: '2.310',
    description: 'Mutlularspor lig maçları, canlı anlatımlar ve maç sonu basın toplantıları.',
    isLive: true,
  },
];

export const LiveStreamModal: React.FC<LiveStreamModalProps> = ({ isOpen, onClose }) => {
  const [channels, setChannels] = useState<TvChannel[]>(DEFAULT_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState<string>('ch-1');
  const [comment, setComment] = useState('');
  const [likes, setLikes] = useState(342);
  const [hasLiked, setHasLiked] = useState(false);
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);

  const handleBroadcastLiveStart = async () => {
    await sendAndroidAppNotification({
      title: '🔴 Mutlular Canlı Yayın Başladı!',
      body: `"${activeChannel.title}" yayını şu an canlı yayında! İzlemek ve sohbete katılmak için dokunun.`,
      type: 'canli_yayin',
      actionTab: 'canli_yayin',
      badgeText: 'CANLI YAYIN',
      timestamp: Date.now(),
    });
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3500);
  };

  const [comments, setComments] = useState([
    { user: 'Ahmet Y.', text: 'Görüntü kalitesi 1080p gayet net 👍', time: '14:21' },
    { user: 'Büşra K.', text: 'Şehir meclisi kararlarını buradan takip etmek çok pratik.', time: '14:22' },
    { user: 'Kemal T.', text: 'Mutlular TV YouTube yayını için tebrikler!', time: '14:23' },
    { user: 'Zeynep D.', text: 'Ses kalitesi de harika, iyi yayınlar dilerim.', time: '14:24' },
  ]);

  if (!isOpen) return null;

  const activeChannel =
    channels.find((ch) => ch.id === activeChannelId) || channels[0];
  const youtubeVideoId = extractYouTubeId(activeChannel.youtubeId);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    setComments((prev) => [
      ...prev,
      { user: 'Ben', text: comment.trim(), time: timeStr },
    ]);
    setComment('');
  };

  const handleLike = () => {
    if (!hasLiked) {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    } else {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    }
  };

  const handleShare = () => {
    const streamUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(streamUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleAddCustomStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    const extracted = extractYouTubeId(customUrlInput.trim());
    const newChan: TvChannel = {
      id: `custom-${Date.now()}`,
      title: 'Özel YouTube Canlı Yayını',
      category: 'Özel Yayın',
      youtubeId: extracted,
      viewers: 'Canlı',
      description: 'Kullanıcı tarafından eklenen YouTube canlı yayını.',
      isLive: true,
    };

    setChannels((prev) => [newChan, ...prev]);
    setActiveChannelId(newChan.id);
    setCustomUrlInput('');
    setShowCustomUrlInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 text-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative max-h-[95vh] flex flex-col border border-neutral-800">
        {/* Top Header */}
        <div className="px-4 py-3 bg-neutral-950 border-b border-neutral-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-sm shadow-red-900/50">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-black tracking-tight text-white">
                  MUTLULAR CANLI TV
                </span>
                <span className="bg-red-600 text-white text-[8.5px] font-black px-1.5 py-0.2 rounded-full uppercase flex items-center gap-0.5 tracking-wider">
                  <Youtube className="w-2.5 h-2.5" />
                  YOUTUBE
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-medium">
                Canlı Şehir & Meclis Yayınları
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
              title="Özel YouTube linki gir"
              className="text-[11px] font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-2.5 py-1.5 rounded-full flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5 text-red-400" />
              <span>Yayın Ekle</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Kapat"
              className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Custom YouTube URL Form Accordion */}
        {showCustomUrlInput && (
          <form
            onSubmit={handleAddCustomStream}
            className="p-3 bg-neutral-950/90 border-b border-neutral-800 text-xs space-y-2 animate-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center justify-between text-neutral-300 font-semibold text-[11px]">
              <span className="flex items-center gap-1.5">
                <Youtube className="w-3.5 h-3.5 text-red-500" />
                <span>YouTube Linki veya Video ID'si Girin</span>
              </span>
              <button
                type="button"
                onClick={() => setShowCustomUrlInput(false)}
                className="text-neutral-500 hover:text-neutral-300"
              >
                Vazgeç
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="Örn: https://www.youtube.com/watch?v=... veya ID"
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-1.5 text-white placeholder-neutral-500 text-xs outline-none focus:border-red-500"
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition"
              >
                Oynat
              </button>
            </div>
          </form>
        )}

        {/* Channel Selection Pills */}
        <div className="px-3 py-2 bg-neutral-950/60 border-b border-neutral-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {channels.map((chan) => (
            <button
              key={chan.id}
              onClick={() => setActiveChannelId(chan.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                chan.id === activeChannel.id
                  ? 'bg-red-600 text-white shadow-sm shadow-red-900/50'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {chan.isLive && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
              <span>{chan.title.split('&')[0].trim()}</span>
            </button>
          ))}
        </div>

        {/* Real YouTube Video Player (Responsive 16:9 iframe) */}
        <div className="relative w-full aspect-video bg-black shrink-0 overflow-hidden">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&rel=0&playsinline=1`}
            title={activeChannel.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Stream Details & Action Bar */}
        <div className="p-3 bg-neutral-950 border-b border-neutral-800/80 shrink-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider animate-pulse shrink-0">
                  <Radio className="w-2.5 h-2.5" />
                  CANLI YAYIN
                </span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  {activeChannel.category}
                </span>
                <span className="text-[10px] text-neutral-400 font-medium flex items-center gap-1">
                  <Eye className="w-3 h-3 text-neutral-400" />
                  {activeChannel.viewers} İzleyici
                </span>
              </div>
              <h3 className="text-[14px] font-black text-white leading-tight mt-1 line-clamp-1">
                {activeChannel.title}
              </h3>
              <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                {activeChannel.description}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 shrink-0 pt-1">
              <button
                onClick={handleLike}
                className={`p-2 rounded-xl flex items-center gap-1 text-[11px] font-bold transition ${
                  hasLiked
                    ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                }`}
                title="Beğen"
              >
                <Heart
                  className={`w-3.5 h-3.5 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`}
                />
                <span>{likes}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1 text-[11px] font-bold transition"
                title="Paylaş"
              >
                {copySuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-[10px]">Kopyalandı</span>
                  </>
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
              </button>

              <a
                href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-red-400 flex items-center gap-1 text-[11px] font-bold transition"
                title="YouTube'da Aç"
              >
                <Youtube className="w-3.5 h-3.5" />
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Live broadcast announcement button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleBroadcastLiveStart}
              className={`w-full py-2 px-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs transition shadow-md active:scale-98 ${
                broadcastSent
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>
                {broadcastSent
                  ? '✓ Canlı Yayın Bildirimi Tüm Cihazlara Gönderildi!'
                  : '🔴 Canlı Yayını Başlat & Tüm Mahalleye Bildir (Push)'}
              </span>
            </button>
          </div>
        </div>

        {/* Live Chat Section */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden bg-neutral-900 min-h-[170px] max-h-[240px]">
          <div className="px-3 pt-2 pb-1 text-[10.5px] font-black text-neutral-400 uppercase tracking-wider flex items-center justify-between border-b border-neutral-800">
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-red-500" />
              <span>Canlı Sohbet & Yorumlar</span>
            </div>
            <span className="text-[10px] font-medium text-neutral-500">
              YouTube Canlı Akışı
            </span>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-1.5 p-3 text-[11.5px]">
            {comments.map((c, idx) => (
              <div
                key={idx}
                className="bg-neutral-800/70 p-2 rounded-xl border border-neutral-700/50 flex items-start justify-between gap-2"
              >
                <div className="flex-1">
                  <span
                    className={`font-black ${
                      c.user === 'Ben' ? 'text-red-400' : 'text-neutral-200'
                    }`}
                  >
                    {c.user}:{' '}
                  </span>
                  <span className="text-neutral-300 font-normal">{c.text}</span>
                </div>
                <span className="text-[9.5px] text-neutral-500 font-mono shrink-0">
                  {c.time}
                </span>
              </div>
            ))}
          </div>

          {/* Send comment form */}
          <form
            onSubmit={handleSendComment}
            className="p-2.5 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Canlı yayına yorum yaz..."
              className="flex-1 bg-neutral-800 border border-neutral-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-red-500"
            />
            <button
              type="submit"
              disabled={!comment.trim()}
              className="w-8 h-8 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-red-600 text-white flex items-center justify-center shrink-0 transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
