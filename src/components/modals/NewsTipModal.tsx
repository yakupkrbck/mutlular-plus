import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Camera,
  Send,
  MessageSquare,
  CheckCircle2,
  Image as ImageIcon,
  Video as VideoIcon,
  Trash2,
  Play,
  UploadCloud,
  AlertTriangle,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { COORDINATOR_WHATSAPP } from '../../config/site';

interface NewsTipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AttachedMedia {
  id: string;
  file: File;
  previewUrl: string;
  type: 'image' | 'video';
  name: string;
  size: number;
  sizeFormatted: string;
}

// Dosya boyutu sınır sabitleri (Byte & MB)
const MAX_IMAGE_SIZE_MB = 10;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024; // 10 MB

const MAX_VIDEO_SIZE_MB = 35;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024; // 35 MB

const MAX_TOTAL_PAYLOAD_MB = 60;
const MAX_TOTAL_PAYLOAD_BYTES = MAX_TOTAL_PAYLOAD_MB * 1024 * 1024; // 60 MB

const MAX_FILES_COUNT = 5;

export const NewsTipModal: React.FC<NewsTipModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [mediaList, setMediaList] = useState<AttachedMedia[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [uploadError, setUploadError] = useState<{ title: string; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Toplam kullanılan boyut hesabı
  const totalUsedBytes = useMemo(() => {
    return mediaList.reduce((acc, curr) => acc + curr.size, 0);
  }, [mediaList]);

  const totalUsedPercentage = useMemo(() => {
    return Math.min(100, Math.round((totalUsedBytes / MAX_TOTAL_PAYLOAD_BYTES) * 100));
  }, [totalUsedBytes]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      mediaList.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [mediaList]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFilesSelected = (files: FileList | null, forcedType?: 'image' | 'video') => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    // 1. Dosya adedi sınırı kontrolü
    if (mediaList.length + files.length > MAX_FILES_COUNT) {
      setUploadError({
        title: 'Dosya Adedi Sınırı Aşıldı',
        message: `En fazla ${MAX_FILES_COUNT} adet medya yükleyebilirsiniz. (Şu an ${mediaList.length} dosya yüklü, ${files.length} yeni dosya eklenemez).`,
      });
      resetFileInputs();
      return;
    }

    const newMediaItems: AttachedMedia[] = [];
    let runningTotalBytes = totalUsedBytes;
    let encounteredError: { title: string; message: string } | null = null;

    Array.from(files).forEach((file) => {
      if (encounteredError) return;

      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      // 2. Dosya türü kontrolü
      if (!isImage && !isVideo) {
        encounteredError = {
          title: 'Geçersiz Dosya Formatı',
          message: `"${file.name}" kabul edilmiyor. Yalnızca görsel (JPG, PNG, WEBP) ve video (MP4, MOV) yükleyebilirsiniz.`,
        };
        return;
      }

      // 3. Tekil dosya boyutu kontrolü
      if (isImage && file.size > MAX_IMAGE_SIZE_BYTES) {
        encounteredError = {
          title: 'Görsel Boyutu Çok Büyük!',
          message: `"${file.name}" dosyası ${formatFileSize(file.size)} büyüklüğünde. Fotoğraflar en fazla ${MAX_IMAGE_SIZE_MB} MB olabilir. Lütfen görseli küçülterek tekrar deneyin.`,
        };
        return;
      }

      if (isVideo && file.size > MAX_VIDEO_SIZE_BYTES) {
        encounteredError = {
          title: 'Video Boyutu Çok Büyük!',
          message: `"${file.name}" dosyası ${formatFileSize(file.size)} büyüklüğünde. Videolar en fazla ${MAX_VIDEO_SIZE_MB} MB olabilir. Lütfen videoyu kırparak veya sıkıştırarak yükleyiniz.`,
        };
        return;
      }

      // 4. Kümülatif toplam kota kontrolü
      if (runningTotalBytes + file.size > MAX_TOTAL_PAYLOAD_BYTES) {
        encounteredError = {
          title: 'Toplam Boyut Kotası Aşıldı!',
          message: `"${file.name}" eklendiğinde toplam dosya boyutu sınırı olan ${MAX_TOTAL_PAYLOAD_MB} MB aşılıyor (${formatFileSize(runningTotalBytes + file.size)}).`,
        };
        return;
      }

      // Kontrollerden geçti, listeye ekle
      runningTotalBytes += file.size;
      const previewUrl = URL.createObjectURL(file);
      newMediaItems.push({
        id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl,
        type: forcedType || (isVideo ? 'video' : 'image'),
        name: file.name,
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
      });
    });

    if (encounteredError) {
      setUploadError(encounteredError);
    }

    if (newMediaItems.length > 0) {
      setMediaList((prev) => [...prev, ...newMediaItems]);
    }

    resetFileInputs();
  };

  const resetFileInputs = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleRemoveMedia = (id: string) => {
    setUploadError(null);
    setMediaList((prev) => {
      const target = prev.find((m) => m.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((m) => m.id !== id);
    });
  };

  const resetForm = () => {
    mediaList.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setMediaList([]);
    setTitle('');
    setLocation('');
    setDescription('');
    setPhone('');
    setUploadError(null);
    resetFileInputs();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Boyut güvenlik kontrolü
    if (totalUsedBytes > MAX_TOTAL_PAYLOAD_BYTES) {
      setUploadError({
        title: 'Toplam Boyut Sınırı',
        message: `Yüklenen dosyaların toplamı ${MAX_TOTAL_PAYLOAD_MB} MB sınırını aşıyor. Lütfen bazı dosyaları çıkarın.`,
      });
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      resetForm();
      onClose();
    }, 2500);
  };

  const photoCount = mediaList.filter((m) => m.type === 'image').length;
  const videoCount = mediaList.filter((m) => m.type === 'video').length;

  const handleWhatsAppTip = () => {
    const mediaSummary =
      mediaList.length > 0
        ? `📎 Ekli Medya: ${mediaList.length} dosya (${photoCount} Fotoğraf, ${videoCount} Video - Toplam: ${formatFileSize(totalUsedBytes)})`
        : 'Medya: Eklenmedi';

    const text = encodeURIComponent(
      `🔴 *MUTLULAR PLUS HABER İHBARI*\n\n` +
      `📌 *Konu:* ${title || 'Önemli Şehir Gelişmesi'}\n` +
      `📍 *Konum:* ${location || 'Mutlular / Osmangazi'}\n` +
      `📝 *Detay:* ${description || 'Açıklama belirtilmedi.'}\n` +
      `📞 *İletişim:* ${phone || 'Gizli / Belirtilmedi'}\n` +
      `📸 *${mediaSummary}*\n\n` +
      `*(Not: Lütfen seçtiğiniz fotoğraf ve videoları WhatsApp sohbetine ekleyerek gönderiniz.)*`
    );
    window.open(`https://wa.me/${COORDINATOR_WHATSAPP}?text=${text}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-4 sm:p-5 relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-rose-600/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-black text-neutral-900 leading-tight">
                  Haber İhbar Masası
                </h3>
                <span className="text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-md">
                  Doğrulanmış İhbar
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-medium">
                Gördüğün olayı fotoğraf veya video ile haber merkezine ilet
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="text-[16px] font-black text-neutral-900">
              İhbarınız Başarıyla Alındı!
            </h4>
            <p className="text-[12px] text-neutral-600 max-w-xs mx-auto">
              {mediaList.length > 0 ? (
                <span className="font-semibold text-neutral-800">
                  {mediaList.length} adet medya ({formatFileSize(totalUsedBytes)}) ve ihbar detaylarınız{' '}
                </span>
              ) : (
                'İhbar detaylarınız '
              )}
              editör masamıza ulaştı. Doğrulandıktan sonra Mutlular Plus bülteninde yayınlanacaktır.
            </p>
            <div className="inline-block bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-xl text-[11px] font-medium text-neutral-500">
              Duyarlılığınız için teşekkür ederiz!
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="py-3 space-y-3 overflow-y-auto pr-1">
            {/* Olay Başlığı */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                Olay Başlığı <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Örn: Meydanda kaza, ana su borusu patlaması..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-rose-600 focus:bg-white transition"
              />
            </div>

            {/* Konum / Mahalle */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                Konum / Mahalle / Cadde <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Örn: Mutlular Mah. Stadyum Cad. No: 12 önü"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-rose-600 focus:bg-white transition"
              />
            </div>

            {/* Görsel / Video Yükleme Alanı & Boyut Kontrol Paneli */}
            <div className="bg-gradient-to-b from-neutral-50 to-rose-50/25 border border-neutral-200/90 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-rose-600" />
                  <span className="text-[11px] font-bold text-neutral-800 uppercase tracking-tight">
                    Görsel veya Video Yükleme
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-neutral-200 text-neutral-700 shadow-2xs">
                  {mediaList.length}/{MAX_FILES_COUNT} Dosya
                </span>
              </div>

              {/* Boyut Sınırları Rehberi */}
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="bg-white/80 border border-neutral-200 rounded-lg py-1 px-1.5">
                  <span className="block text-[8.5px] font-bold text-neutral-400 uppercase">Maks. Foto</span>
                  <span className="text-[10.5px] font-black text-neutral-800">{MAX_IMAGE_SIZE_MB} MB</span>
                </div>
                <div className="bg-white/80 border border-neutral-200 rounded-lg py-1 px-1.5">
                  <span className="block text-[8.5px] font-bold text-neutral-400 uppercase">Maks. Video</span>
                  <span className="text-[10.5px] font-black text-rose-700">{MAX_VIDEO_SIZE_MB} MB</span>
                </div>
                <div className="bg-white/80 border border-neutral-200 rounded-lg py-1 px-1.5">
                  <span className="block text-[8.5px] font-bold text-neutral-400 uppercase">Toplam Limit</span>
                  <span className="text-[10.5px] font-black text-neutral-800">{MAX_TOTAL_PAYLOAD_MB} MB</span>
                </div>
              </div>

              {/* Kullanılan Boyut İlerleme Çubuğu */}
              {mediaList.length > 0 && (
                <div className="bg-white border border-neutral-200 rounded-xl p-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-neutral-600">Toplam Boyut Kullanımı:</span>
                    <span
                      className={`font-black ${
                        totalUsedPercentage > 85 ? 'text-rose-600' : 'text-neutral-800'
                      }`}
                    >
                      {formatFileSize(totalUsedBytes)} / {MAX_TOTAL_PAYLOAD_MB} MB (%{totalUsedPercentage})
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        totalUsedPercentage > 85
                          ? 'bg-rose-600'
                          : totalUsedPercentage > 60
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${totalUsedPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files, 'image')}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files, 'video')}
              />

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-rose-200 hover:border-rose-400 hover:bg-rose-50/50 text-rose-700 font-bold text-[11px] shadow-2xs active:scale-98 transition"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-rose-600" />
                  <span>Fotoğraf Seç (≤10MB)</span>
                </button>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-rose-200 hover:border-rose-400 hover:bg-rose-50/50 text-rose-700 font-bold text-[11px] shadow-2xs active:scale-98 transition"
                >
                  <VideoIcon className="w-3.5 h-3.5 text-rose-600" />
                  <span>Video Seç (≤35MB)</span>
                </button>
              </div>

              {/* Drag/Click Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFilesSelected(e.dataTransfer.files);
                }}
                className="border-2 border-dashed border-rose-200 hover:border-rose-400 bg-white/70 hover:bg-white rounded-xl p-3 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1"
              >
                <UploadCloud className="w-6 h-6 text-rose-500 animate-pulse" />
                <p className="text-[11.5px] font-bold text-neutral-800">
                  Dosyaları buraya sürükleyin veya dokunun
                </p>
                <p className="text-[9.5px] text-neutral-500 font-medium">
                  Görsel veya video seçin • Otomatik boyut denetimi yapılır
                </p>
              </div>

              {/* Belirgin Hata / Uyarı Bildirim Kutusu (Boyut & Format Denetimi) */}
              {uploadError && (
                <div className="p-3 bg-red-50 border-2 border-rose-300 rounded-xl flex items-start gap-2.5 animate-in shake duration-200 shadow-sm">
                  <div className="p-1 rounded-full bg-rose-600 text-white shrink-0 mt-0.5">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-[11.5px] font-black text-rose-900 leading-tight">
                      {uploadError.title}
                    </h5>
                    <p className="text-[10.5px] text-rose-700 font-medium mt-0.5 leading-normal">
                      {uploadError.message}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadError(null)}
                    className="p-1 text-rose-400 hover:text-rose-700 rounded-lg hover:bg-rose-100 transition shrink-0"
                    title="Kapat"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Previews Grid */}
              {mediaList.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-neutral-600">
                    <span>
                      Yüklenen Medyalar ({photoCount} Fotoğraf, {videoCount} Video)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        mediaList.forEach((item) => URL.revokeObjectURL(item.previewUrl));
                        setMediaList([]);
                        setUploadError(null);
                      }}
                      className="text-neutral-400 hover:text-rose-600 transition"
                    >
                      Tümünü Temizle
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {mediaList.map((item) => (
                      <div
                        key={item.id}
                        className="relative group rounded-xl overflow-hidden border border-neutral-200 bg-black aspect-video flex items-center justify-center shadow-xs"
                      >
                        {item.type === 'image' ? (
                          <img
                            src={item.previewUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="relative w-full h-full bg-neutral-900 flex items-center justify-center">
                            <video
                              src={item.previewUrl}
                              className="w-full h-full object-cover opacity-75"
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <div className="w-6 h-6 rounded-full bg-rose-600/90 text-white flex items-center justify-center">
                                <Play className="w-3 h-3 fill-white ml-0.5" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Type & Size Badge */}
                        <div className="absolute bottom-1 left-1 bg-black/80 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 max-w-[85%] truncate">
                          {item.type === 'image' ? (
                            <ImageIcon className="w-2.5 h-2.5 shrink-0 text-amber-300" />
                          ) : (
                            <VideoIcon className="w-2.5 h-2.5 shrink-0 text-rose-300" />
                          )}
                          <span className="truncate">{item.sizeFormatted}</span>
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveMedia(item.id);
                          }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow transition active:scale-90"
                          title="Kaldır"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Açıklama / Detaylar */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                Açıklama / Detaylar <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Olay nerede, ne zaman gerçekleşti? Neler gördünüz? Kısaca açıklayınız..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-rose-600 focus:bg-white transition"
              />
            </div>

            {/* İletişim Numarası */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-neutral-700 uppercase">
                  İletişim Numaranız
                </label>
                <span className="text-[9.5px] font-semibold text-neutral-400">
                  (Gizli tutulur, editör teyidi içindir)
                </span>
              </div>
              <input
                type="tel"
                placeholder="0555 000 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-rose-600 focus:bg-white transition"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2 shrink-0">
              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold text-[13px] py-2.5 rounded-xl transition shadow-md shadow-rose-600/25 flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>
                  {mediaList.length > 0
                    ? `İhbarı & ${mediaList.length} Dosyayı Gönder (${formatFileSize(totalUsedBytes)})`
                    : 'İhbarı Haber Masasına Gönder'}
                </span>
              </button>

              <div className="relative flex items-center justify-center py-0.5">
                <div className="border-t border-neutral-200 w-full" />
                <span className="bg-white px-2 text-[10px] font-bold uppercase text-neutral-400 absolute">
                  veya
                </span>
              </div>

              {mediaList.length > 0 && (
                <div className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-2 flex items-start gap-1.5 leading-tight">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    WhatsApp açıldığında seçtiğiniz {mediaList.length} adet medya dosyasını sohbete eklemeyi unutmayınız.
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={handleWhatsAppTip}
                className="w-full bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white font-bold text-[12.5px] py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>WhatsApp İhbar Hattına İlet (0555 123 45 67)</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};


