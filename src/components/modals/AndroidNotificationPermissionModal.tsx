import React, { useState } from 'react';
import {
  BellRing,
  Sparkles,
  Newspaper,
  ShieldAlert,
  CheckCircle2,
  X,
  Smartphone,
  Settings,
  Volume2,
} from 'lucide-react';
import {
  requestAndroidNotificationPermission,
  getAndroidNotificationPermission,
  AndroidPermissionStatus,
  playAndroidNotificationChime,
  triggerAndroidVibration,
} from '../../services/androidNotificationService';

interface AndroidNotificationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionChanged?: (status: AndroidPermissionStatus) => void;
}

export const AndroidNotificationPermissionModal: React.FC<AndroidNotificationPermissionModalProps> = ({
  isOpen,
  onClose,
  onPermissionChanged,
}) => {
  const [currentStatus, setCurrentStatus] = useState<AndroidPermissionStatus>(
    getAndroidNotificationPermission()
  );
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    setIsLoading(true);
    try {
      const res = await requestAndroidNotificationPermission();
      setCurrentStatus(res);
      if (res === 'granted') {
        playAndroidNotificationChime('sistem');
        triggerAndroidVibration();
      }
      if (onPermissionChanged) {
        onPermissionChanged(res);
      }
      if (res === 'granted') {
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 text-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 relative overflow-hidden transition-all transform animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle top grab handle for mobile bottom sheet */}
        <div className="w-12 h-1.5 bg-neutral-700/80 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-full hover:bg-neutral-800/80 transition-colors"
          aria-label="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with App Logo & Android Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-600/30 shrink-0">
            <BellRing className="w-6 h-6 text-white animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-white">Mutlular Plus</h3>
              <span className="bg-rose-500/20 text-rose-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-rose-500/30">
                Google Play Android
              </span>
            </div>
            <p className="text-xs text-neutral-400">Canlı Mahalle & Teklif Bildirimleri</p>
          </div>
        </div>

        {/* Title & Description */}
        <div className="mb-5">
          <h4 className="text-base font-bold text-white mb-1.5">
            Önemli Gelişmelerden Anında Haberdar Olun
          </h4>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Google Play Store uygulamamız, usta fiyat teklifleri ve mahalle kesintilerini kilit ekranınıza ve bildirim çubuğunuza anında iletir.
          </p>
        </div>

        {/* Benefits list */}
        <div className="space-y-2.5 mb-6">
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-200">Usta & Fiyat Teklifleri</div>
              <div className="text-[11px] text-neutral-400">
                Verdiğiniz tamirat/tesisat taleplerine ustalar teklif verdiğinde ilk siz öğrenin.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <Newspaper className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-200">Mahalle & Belediye Duyuruları</div>
              <div className="text-[11px] text-neutral-400">
                Planlı su/elektrik kesintileri, Burulaş otobüs duyuruları ve mahalle haberleri.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-200">Acil Durum & Nöbetçi Eczaneler</div>
              <div className="text-[11px] text-neutral-400">
                Gece açık nöbetçi eczaneler ve mahalledeki kritik acil çağrılar.
              </div>
            </div>
          </div>
        </div>

        {/* Status check message if already denied */}
        {currentStatus === 'denied' && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-start gap-2.5">
            <Settings className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <span className="font-semibold block mb-0.5">Bildirimler Cihazda Engellenmiş:</span>
              Android Ayarları &gt; Uygulamalar &gt; <strong>Mutlular Plus</strong> &gt; Bildirimler sekmesinden izin vermeniz gerekmektedir.
            </div>
          </div>
        )}

        {/* Status check message if already granted */}
        {currentStatus === 'granted' && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Android sistem bildirimleri başarıyla aktif edildi!</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2.5">
          {currentStatus !== 'granted' ? (
            <button
              onClick={handleRequestPermission}
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer disabled:opacity-60 text-sm"
            >
              <Smartphone className="w-4 h-4" />
              <span>{isLoading ? 'İzin İsteniyor...' : 'Bildirimleri Etkinleştir (Android)'}</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Tamam, Harika!</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            Daha Sonra Hatırlat
          </button>
        </div>
      </div>
    </div>
  );
};
