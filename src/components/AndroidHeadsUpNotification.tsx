import React, { useEffect, useState } from 'react';
import {
  X,
  Sparkles,
  ShoppingBag,
  Bell,
  ChevronRight,
  AlertTriangle,
  Newspaper,
  Radio,
  HeartCrack,
  Wrench,
  Megaphone,
  MessageSquare,
} from 'lucide-react';
import { AndroidNotificationPayload } from '../services/androidNotificationService';

interface AndroidHeadsUpNotificationProps {
  onNavigateTab?: (tab: string, subTab?: string, relatedId?: string) => void;
}

export const AndroidHeadsUpNotification: React.FC<AndroidHeadsUpNotificationProps> = ({
  onNavigateTab,
}) => {
  const [activeNotification, setActiveNotification] = useState<AndroidNotificationPayload | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handlePushEvent = (e: Event) => {
      const customEvent = e as CustomEvent<AndroidNotificationPayload>;
      if (customEvent.detail) {
        setActiveNotification(customEvent.detail);
        setIsVisible(true);
      }
    };

    window.addEventListener('android-heads-up-push', handlePushEvent);
    return () => {
      window.removeEventListener('android-heads-up-push', handlePushEvent);
    };
  }, []);

  // Auto-dismiss after 6 seconds (or 8s for breaking/live/urgent)
  useEffect(() => {
    if (!isVisible || !activeNotification) return;

    const timeoutDuration =
      activeNotification.type === 'son_dakika' ||
      activeNotification.type === 'canli_yayin' ||
      activeNotification.type === 'acil'
        ? 8000
        : 6000;

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setActiveNotification(null), 300);
    }, timeoutDuration);

    return () => clearTimeout(timer);
  }, [isVisible, activeNotification]);

  if (!activeNotification) return null;

  const handleAction = () => {
    setIsVisible(false);
    if (activeNotification.actionTab) {
      if (
        activeNotification.actionTab === 'tekliflerim' ||
        activeNotification.actionTab === 'bildirimler'
      ) {
        onNavigateTab?.('profil', activeNotification.actionTab, activeNotification.relatedId);
      } else {
        onNavigateTab?.(
          activeNotification.actionTab,
          activeNotification.subTab,
          activeNotification.relatedId
        );
      }
    }
    setTimeout(() => setActiveNotification(null), 300);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    setTimeout(() => setActiveNotification(null), 300);
  };

  // Pure white theme with vivid category icons, badges and clear contrast
  const getNotificationVisuals = () => {
    switch (activeNotification.type) {
      case 'son_dakika':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />,
          iconBg: 'bg-rose-50 border-rose-200 text-rose-600',
          accent: 'from-rose-500 via-red-500 to-amber-500',
          badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
          badgeText: activeNotification.badgeText || 'SON DAKİKA',
          actionText: 'Haberi Oku',
          actionColor: 'text-rose-600 hover:text-rose-700',
        };
      case 'canli_yayin':
        return {
          icon: <Radio className="w-5 h-5 text-red-600 animate-pulse" />,
          iconBg: 'bg-red-50 border-red-200 text-red-600',
          accent: 'from-red-600 via-rose-500 to-orange-500',
          badgeColor: 'bg-red-100 text-red-800 border-red-300',
          badgeText: activeNotification.badgeText || 'CANLI YAYIN',
          actionText: 'Yayına Katıl',
          actionColor: 'text-red-600 hover:text-red-700',
        };
      case 'vefat':
        return {
          icon: <HeartCrack className="w-5 h-5 text-neutral-700" />,
          iconBg: 'bg-neutral-100 border-neutral-300 text-neutral-800',
          accent: 'from-neutral-700 via-neutral-500 to-neutral-800',
          badgeColor: 'bg-neutral-100 text-neutral-800 border-neutral-300',
          badgeText: activeNotification.badgeText || 'VEFAT & TAZİYE',
          actionText: 'Taziye Mesajı Yaz',
          actionColor: 'text-neutral-800 hover:text-neutral-900',
        };
      case 'duyuru':
        return {
          icon: <Megaphone className="w-5 h-5 text-blue-600" />,
          iconBg: 'bg-blue-50 border-blue-200 text-blue-600',
          accent: 'from-blue-600 via-indigo-500 to-blue-700',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
          badgeText: activeNotification.badgeText || 'DUYURU',
          actionText: 'Duyuruyu İncele',
          actionColor: 'text-blue-600 hover:text-blue-700',
        };
      case 'usta_talep':
        return {
          icon: <Wrench className="w-5 h-5 text-amber-600" />,
          iconBg: 'bg-amber-50 border-amber-200 text-amber-700',
          accent: 'from-amber-500 via-orange-500 to-amber-600',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
          badgeText: activeNotification.badgeText || 'USTAYA TALEP',
          actionText: 'Teklif Ver',
          actionColor: 'text-amber-700 hover:text-amber-800',
        };
      case 'kullanici_teklif':
      case 'teklif':
        return {
          icon: <Sparkles className="w-5 h-5 text-emerald-600 fill-emerald-500/20" />,
          iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          accent: 'from-emerald-500 via-teal-500 to-emerald-600',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          badgeText: activeNotification.badgeText || 'TEKLİF GELDİ',
          actionText: 'Teklifi İncele',
          actionColor: 'text-emerald-700 hover:text-emerald-800',
        };
      case 'ilan':
        return {
          icon: <ShoppingBag className="w-5 h-5 text-sky-600" />,
          iconBg: 'bg-sky-50 border-sky-200 text-sky-700',
          accent: 'from-sky-500 via-blue-500 to-indigo-600',
          badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
          badgeText: activeNotification.badgeText || 'ÖNE ÇIKAN İLAN',
          actionText: 'İlana Git',
          actionColor: 'text-sky-700 hover:text-sky-800',
        };
      case 'ozel':
        return {
          icon: <MessageSquare className="w-5 h-5 text-purple-600" />,
          iconBg: 'bg-purple-50 border-purple-200 text-purple-700',
          accent: 'from-purple-500 via-fuchsia-500 to-purple-600',
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
          badgeText: activeNotification.badgeText || 'ÖZEL BİLDİRİM',
          actionText: 'Görüntüle',
          actionColor: 'text-purple-700 hover:text-purple-800',
        };
      case 'acil':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />,
          iconBg: 'bg-rose-100 border-rose-300 text-rose-700',
          accent: 'from-rose-600 via-red-600 to-rose-700',
          badgeColor: 'bg-rose-100 text-rose-800 border-rose-400',
          badgeText: activeNotification.badgeText || 'ACİL DURUM',
          actionText: 'Acil Bilgi',
          actionColor: 'text-rose-700 hover:text-rose-800',
        };
      case 'haber':
        return {
          icon: <Newspaper className="w-5 h-5 text-emerald-600" />,
          iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          accent: 'from-emerald-500 via-green-500 to-emerald-600',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          badgeText: activeNotification.badgeText || 'HABER',
          actionText: 'Haberi Oku',
          actionColor: 'text-emerald-700 hover:text-emerald-800',
        };
      default:
        return {
          icon: <Bell className="w-5 h-5 text-rose-600" />,
          iconBg: 'bg-rose-50 border-rose-200 text-rose-600',
          accent: 'from-rose-500 via-amber-400 to-rose-600',
          badgeColor: 'bg-neutral-100 text-neutral-800 border-neutral-300',
          badgeText: activeNotification.badgeText || 'BİLDİRİM',
          actionText: 'Açmak için dokunun',
          actionColor: 'text-rose-600 hover:text-rose-700',
        };
    }
  };

  const visuals = getNotificationVisuals();

  return (
    <div
      className={`fixed top-2 left-0 right-0 z-[100] px-3 max-w-md mx-auto pointer-events-none transition-all duration-300 ease-out transform ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-12 opacity-0 scale-95'
      }`}
    >
      {/* PURE WHITE NOTIFICATION CARD */}
      <div
        onClick={handleAction}
        className="pointer-events-auto bg-white text-neutral-900 rounded-2xl p-3.5 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.18),0_4px_12px_rgba(0,0,0,0.06)] border border-neutral-200/90 cursor-pointer active:scale-98 transition flex items-start gap-3 relative overflow-hidden group"
      >
        {/* Colorful Gradient Accent Line at the Top */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${visuals.accent}`} />

        {/* Clear Category Icon Box */}
        <div
          className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs mt-0.5 ${visuals.iconBg}`}
        >
          {visuals.icon}
        </div>

        {/* Content Area - Clear, Legible, High-Contrast Typography */}
        <div className="flex-1 min-w-0 pr-6">
          {/* Header Row: App Name • Time • Category Badge */}
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold mb-1">
            <span className="text-rose-600 font-black tracking-tight uppercase">
              MUTLULAR PLUS
            </span>
            <span className="text-neutral-300">•</span>
            <span className="text-neutral-500 font-semibold text-[10px]">Şimdi</span>

            {visuals.badgeText && (
              <span
                className={`ml-auto text-[9px] px-2 py-0.5 rounded-md border font-black uppercase tracking-wider ${visuals.badgeColor}`}
              >
                {visuals.badgeText}
              </span>
            )}
          </div>

          {/* Title - Bold and Distinct */}
          <h4 className="text-[13.5px] font-black text-neutral-950 leading-snug truncate">
            {activeNotification.title}
          </h4>

          {/* Body Text - Clear readable neutral-700 */}
          <p className="text-[12px] text-neutral-600 leading-snug line-clamp-2 mt-0.5 font-medium">
            {activeNotification.body}
          </p>

          {/* Interactive Action CTA */}
          <div className="flex items-center gap-1.5 mt-2 pt-1 border-t border-neutral-100">
            <span className={`text-[11px] font-black flex items-center gap-1 ${visuals.actionColor}`}>
              <span>{visuals.actionText}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="text-[10px] text-neutral-400 font-semibold ml-auto">
              Detayları görmek için dokunun
            </span>
          </div>
        </div>

        {/* Dismiss / Close Button - High visibility on white */}
        <button
          onClick={handleClose}
          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-neutral-100 hover:bg-neutral-200 active:scale-95 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition cursor-pointer"
          aria-label="Kapat"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
