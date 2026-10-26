import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Info,
  Check,
  Trash2,
  ArrowRight,
  Filter,
  PlusCircle,
  Clock,
  ShieldCheck,
  CheckCheck,
  Smartphone,
  Volume2,
  VolumeX,
  Vibrate,
  VibrateOff,
  Send,
  AlertTriangle,
  Radio,
  Copy,
  Layers,
  Newspaper,
  Check as CheckIcon,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  HeartCrack,
  Megaphone,
  Wrench,
  MessageSquare,
} from 'lucide-react';
import { UserNotification, NotificationType } from '../../types';
import {
  getAndroidNotificationPermission,
  getAndroidSoundPref,
  setAndroidSoundPref,
  getAndroidVibratePref,
  setAndroidVibratePref,
  sendAndroidAppNotification,
  AndroidPermissionStatus,
  getAllChannelsWithState,
  setChannelPreference,
  NotificationChannelId,
  getOrGenerateDevicePushToken,
  updateAppIconBadge,
  AndroidPayloadType,
} from '../../services/androidNotificationService';
import { AndroidNotificationPermissionModal } from '../modals/AndroidNotificationPermissionModal';

interface BildirimMerkeziViewProps {
  notifications: UserNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAll: () => void;
  onAddTestNotification: (type: NotificationType) => void;
  onNavigateToQuotes: (relatedId?: string) => void;
  onNavigateToClassifieds: () => void;
  onNavigateTab?: (tab: string, subTab?: string, relatedId?: string) => void;
}

export const BildirimMerkeziView: React.FC<BildirimMerkeziViewProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll,
  onAddTestNotification,
  onNavigateToQuotes,
  onNavigateToClassifieds,
  onNavigateTab,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'teklif' | 'ilan' | 'haber' | 'muhtarlik'>('all');
  const [permissionStatus, setPermissionStatus] = useState<AndroidPermissionStatus>('default');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrateEnabled, setVibrateEnabled] = useState<boolean>(true);
  const [countdownTimer, setCountdownTimer] = useState<number | null>(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [showChannelSettings, setShowChannelSettings] = useState(false);
  const [channels, setChannels] = useState(getAllChannelsWithState());
  const deviceFcmToken = getOrGenerateDevicePushToken();

  useEffect(() => {
    setPermissionStatus(getAndroidNotificationPermission());
    setSoundEnabled(getAndroidSoundPref());
    setVibrateEnabled(getAndroidVibratePref());
    setChannels(getAllChannelsWithState());
  }, []);

  // Sync app badge
  useEffect(() => {
    const unread = notifications.filter((n) => !n.read).length;
    updateAppIconBadge(unread);
  }, [notifications]);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setAndroidSoundPref(next);
  };

  const handleToggleVibrate = () => {
    const next = !vibrateEnabled;
    setVibrateEnabled(next);
    setAndroidVibratePref(next);
  };

  const handleToggleChannel = (channelId: NotificationChannelId) => {
    const target = channels.find((c) => c.id === channelId);
    if (!target) return;
    const nextState = !target.enabled;
    setChannelPreference(channelId, nextState);
    setChannels((prev) =>
      prev.map((c) => (c.id === channelId ? { ...c, enabled: nextState } : c))
    );
  };

  const handleCopyFcmToken = () => {
    navigator.clipboard?.writeText(deviceFcmToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleSendAndroidTestNotification = (
    type: AndroidPayloadType,
    customTitle?: string,
    customBody?: string
  ) => {
    onAddTestNotification(
      type === 'kullanici_teklif' || type === 'usta_talep' || type === 'teklif'
        ? 'teklif'
        : type === 'ilan'
        ? 'ilan'
        : type === 'son_dakika' || type === 'haber'
        ? 'haber'
        : type === 'canli_yayin'
        ? 'canli_yayin'
        : type === 'vefat'
        ? 'vefat'
        : type === 'duyuru'
        ? 'duyuru'
        : 'ozel'
    );

    let defaultTitle = '📢 Mutlular Bildirim';
    let defaultBody = 'Yeni bir mahalle bildirimi aldınız.';
    let actionTab = 'profil';
    let badgeText = 'BİLDİRİM';

    switch (type) {
      case 'son_dakika':
        defaultTitle = '🚨 SON DAKİKA: Nilüfer Çayı Park Projesi Başladı';
        defaultBody = 'Belediye ekipleri yürüyüş ve yeşil alan düzenleme çalışmalarına bu sabah başladı.';
        actionTab = 'haber';
        badgeText = 'SON DAKİKA';
        break;
      case 'canli_yayin':
        defaultTitle = '🔴 Mutlular Canlı Yayın Başladı!';
        defaultBody = 'Mutlular TV Mahalle Meclisi Canlı Yayını başladı. İzlemek için dokunun.';
        actionTab = 'canli_yayin';
        badgeText = 'CANLI YAYIN';
        break;
      case 'vefat':
        defaultTitle = '🕊️ Vefat & Taziye: Hacı Ahmet Yılmaz Hakka Yürüdü';
        defaultBody = 'Cenazesi bugün İkindi namazını müteakip Mutlular Merkez Camiinden kaldırılacaktır.';
        actionTab = 'vefat';
        badgeText = 'VEFAT & TAZİYE';
        break;
      case 'duyuru':
        defaultTitle = '📢 BUSKİ Planlı Su Kesintisi Duyurusu';
        defaultBody = 'Yarın 09:00 - 15:00 saatleri arasında Mutlular Caddesi genelinde şebeke bakımı yapılacaktır.';
        actionTab = 'profil';
        badgeText = 'DUYURU';
        break;
      case 'ilan':
        defaultTitle = '🏷️ Öne Çıkan İlan: Satılık 3+1 Bahçeli Müstakil Ev';
        defaultBody = '3.450.000 ₺ • Köy İçi Meydanı 200m mesafede. Fırsat ilanı inceleyin.';
        actionTab = 'alim_satim';
        badgeText = 'ÖNE ÇIKAN İLAN';
        break;
      case 'usta_talep':
        defaultTitle = '🔨 Yeni Usta Talebi: Sıhhi Tesisat & Su Kaçağı';
        defaultBody = 'Cumhuriyet Mahallesinden acil banyo kaçak tespiti talebi geldi. Teklif vermek için dokunun.';
        actionTab = 'hizmet';
        badgeText = 'YENİ TALEP';
        break;
      case 'kullanici_teklif':
      case 'teklif':
        defaultTitle = '💼 Ustanızdan Teklif Geldi! (1.250 ₺)';
        defaultBody = 'Usta Mehmet Çelik talebinize garanti kapsamlı fiyat teklifi sundu. İnceleyin.';
        actionTab = 'tekliflerim';
        badgeText = 'TEKLİF GELDİ';
        break;
      case 'ozel':
        defaultTitle = '💬 Yeni Özel Mesaj: Usta Mehmet Çelik';
        defaultBody = 'Malzemeleri temin ettim, yarın saat 10:00 gibi adreste olacağım.';
        actionTab = 'profil';
        badgeText = 'ÖZEL MESAJ';
        break;
      default:
        break;
    }

    sendAndroidAppNotification({
      title: customTitle || defaultTitle,
      body: customBody || defaultBody,
      type,
      tag: `android-${type}-${Date.now()}`,
      badgeText,
      actionTab,
      timestamp: Date.now(),
    });
  };

  const handleStartDelayedPushSimulation = () => {
    if (countdownTimer !== null) return;
    setCountdownTimer(5);

    const interval = setInterval(() => {
      setCountdownTimer((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          // Trigger push notification after timer expires
          handleSendAndroidTestNotification(
            'teklif',
            '📲 Android Arka Plan Push: Usta Teklifi!',
            'Ahmet Usta (Kombi & Tesisat) talebinize özel indirimli 600 ₺ teklif gönderdi.'
          );
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredList = notifications.filter((item) => {
    if (activeFilter === 'unread') return !item.read;
    if (activeFilter === 'teklif') return item.type === 'teklif';
    if (activeFilter === 'ilan') return item.type === 'ilan';
    if (activeFilter === 'muhtarlik') return item.type === 'muhtarlik';
    if (activeFilter === 'haber')
      return (
        item.type === 'haber' ||
        item.type === 'son_dakika' ||
        item.type === 'duyuru' ||
        item.type === 'canli_yayin' ||
        item.type === 'vefat'
      );
    return true;
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'muhtarlik':
        return (
          <div className="w-9 h-9 rounded-xl bg-red-600/10 text-red-700 border border-red-200/80 flex items-center justify-center shrink-0 shadow-2xs">
            <span className="text-lg">🏛️</span>
          </div>
        );
      case 'teklif':
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-200/80 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 fill-amber-500/30" />
          </div>
        );
      case 'ilan':
        return (
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-200/80 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
        );
      case 'haber':
        return (
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-200/80 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      case 'canli_yayin':
        return (
          <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-600 border border-red-200/80 flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4" />
          </div>
        );
      case 'vefat':
        return (
          <div className="w-9 h-9 rounded-xl bg-neutral-600/10 text-neutral-700 border border-neutral-300 flex items-center justify-center shrink-0">
            <HeartCrack className="w-4 h-4" />
          </div>
        );
      case 'duyuru':
        return (
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 border border-indigo-200/80 flex items-center justify-center shrink-0">
            <Megaphone className="w-4 h-4" />
          </div>
        );
      case 'ozel':
        return (
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-200/80 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
        );
      case 'sistem':
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-200/80 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Android & Play Store Header Card */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-rose-950 text-white rounded-3xl p-4 shadow-xl border border-neutral-800/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          {/* Top row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shadow-inner">
                <Bell className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white">Bildirim Merkezi</h3>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                    Google Play Ready
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  {unreadCount > 0 ? `${unreadCount} yeni okunmamış bildirim` : 'Tüm bildirimler güncel'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-[11px] font-black text-white transition flex items-center gap-1.5 border border-white/10"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Tümünü</span> Okundu Yap
              </button>
            )}
          </div>

          {/* Play Store Info Strip */}
          <div className="bg-white/5 rounded-2xl p-2.5 text-[10.5px] text-neutral-300 flex items-center justify-between border border-white/10 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">
                Paket: <code className="text-rose-300 font-mono">com.mutlularplus.app</code> • TWA & FCM Aktif
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleCopyFcmToken}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition cursor-pointer"
                title="Cihaz Push Belirtecini Kopyala"
              >
                {copiedToken ? <CheckIcon className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedToken ? 'Kopyalandı' : 'FCM Token'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Android Native Push & Notification Control Hub */}
      <div className="bg-white rounded-3xl p-3.5 border border-neutral-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[12.5px] font-black text-neutral-900 leading-tight">
                Android Sistem Bildirimleri
              </h4>
              <p className="text-[10px] text-neutral-500 font-medium">
                Kilit ekranı, durum çubuğu ve sesli/titreşimli bildirimler
              </p>
            </div>
          </div>

          {/* Permission Status Pill */}
          {permissionStatus === 'granted' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              İzin Aktif
            </span>
          ) : permissionStatus === 'denied' ? (
            <button
              onClick={() => setIsPermissionModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition"
            >
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              Engellendi (Düzelt)
            </button>
          ) : (
            <button
              onClick={() => setIsPermissionModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-black bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-xs transition cursor-pointer"
            >
              <Radio className="w-3 h-3" />
              İzni Etkinleştir
            </button>
          )}
        </div>

        {/* Master Sound & Vibrate Controls */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-100">
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-2xl flex items-center justify-between border transition text-left cursor-pointer ${
              soundEnabled
                ? 'bg-rose-50/70 border-rose-200/80 text-rose-900'
                : 'bg-neutral-50 border-neutral-200 text-neutral-500'
            }`}
          >
            <div className="flex items-center gap-2">
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-rose-600" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
              )}
              <span className="text-[11px] font-black">Bildirim Sesi</span>
            </div>
            <span
              className={`text-[9.5px] font-black px-1.5 py-0.5 rounded-md ${
                soundEnabled ? 'bg-rose-600 text-white' : 'bg-neutral-200 text-neutral-600'
              }`}
            >
              {soundEnabled ? 'Açık' : 'Kapalı'}
            </span>
          </button>

          <button
            onClick={handleToggleVibrate}
            className={`p-2 rounded-2xl flex items-center justify-between border transition text-left cursor-pointer ${
              vibrateEnabled
                ? 'bg-amber-50/70 border-amber-200/80 text-amber-900'
                : 'bg-neutral-50 border-neutral-200 text-neutral-500'
            }`}
          >
            <div className="flex items-center gap-2">
              {vibrateEnabled ? (
                <Vibrate className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <VibrateOff className="w-3.5 h-3.5 text-neutral-400" />
              )}
              <span className="text-[11px] font-black">Titreşim</span>
            </div>
            <span
              className={`text-[9.5px] font-black px-1.5 py-0.5 rounded-md ${
                vibrateEnabled ? 'bg-amber-600 text-white' : 'bg-neutral-200 text-neutral-600'
              }`}
            >
              {vibrateEnabled ? 'Açık' : 'Kapalı'}
            </span>
          </button>
        </div>

        {/* Android Notification Channels Toggle Section */}
        <div className="pt-2 border-t border-neutral-100">
          <button
            onClick={() => setShowChannelSettings(!showChannelSettings)}
            className="w-full flex items-center justify-between py-1 text-neutral-700 hover:text-neutral-900 transition text-[11px] font-black"
          >
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-rose-600" />
              <span>Android Bildirim Kanalları ({channels.filter((c) => c.enabled).length}/{channels.length} Aktif)</span>
            </div>
            {showChannelSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showChannelSettings && (
            <div className="mt-2 space-y-1.5 animate-in fade-in duration-200">
              {channels.map((ch) => (
                <div
                  key={ch.id}
                  className="p-2 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-black text-neutral-900">{ch.name}</span>
                      <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-md ${
                        ch.importance === 'urgent' ? 'bg-rose-100 text-rose-700' : ch.importance === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-neutral-200 text-neutral-700'
                      }`}>
                        {ch.importance === 'urgent' ? 'Acil' : ch.importance === 'high' ? 'Yüksek' : 'Standart'}
                      </span>
                    </div>
                    <p className="text-[9.5px] text-neutral-500 truncate">{ch.description}</p>
                  </div>

                  <button
                    onClick={() => handleToggleChannel(ch.id)}
                    className={`shrink-0 w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      ch.enabled ? 'bg-rose-600' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        ch.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real Push Notification Test Action Buttons */}
        <div className="pt-2 border-t border-neutral-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">
              Gerçek Cihaz Bildirim Testi (Play Store)
            </span>
            <span className="text-[9.5px] text-neutral-500 font-semibold">
              Kilit ekranında &amp; çubukta görünür
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              onClick={() => handleSendAndroidTestNotification('son_dakika')}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 border border-rose-200/80 text-rose-800 text-[10px] font-black flex items-center gap-1.5 transition text-left cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="truncate">🚨 Son Dakika</span>
            </button>

            <button
              onClick={() => handleSendAndroidTestNotification('canli_yayin')}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 active:scale-95 border border-red-200/80 text-red-800 text-[10px] font-black flex items-center gap-1.5 transition text-left cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span className="truncate">🔴 Canlı Yayın</span>
            </button>

            <button
              onClick={() => handleSendAndroidTestNotification('vefat')}
              className="p-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 active:scale-95 border border-neutral-300 text-neutral-800 text-[10px] font-black flex items-center gap-1.5 transition text-left cursor-pointer"
            >
              <span className="text-xs">🕊️</span>
              <span className="truncate">Vefat & Taziye</span>
            </button>

            <button
              onClick={() => handleSendAndroidTestNotification('duyuru')}
              className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 active:scale-95 border border-blue-200/80 text-blue-800 text-[10px] font-black flex items-center gap-1.5 transition text-left cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">📢 Yönetici Duyuru</span>
            </button>

            <button
              onClick={() => handleSendAndroidTestNotification('ilan')}
              className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 border border-emerald-200/80 text-emerald-800 text-[10px] font-black flex items-center gap-1.5 transition text-left cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">🏷️ İlan Bildirimi</span>
            </button>

            <button
              onClick={() => handleSendAndroidTestNotification('usta_talep')}
              className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 border border-amber-200/80 text-amber-800 text-[10px] font-black flex items-center gap-1.5 transition text-left cursor-pointer"
            >
              <span className="text-xs">🔨</span>
              <span className="truncate">Ustaya Talep</span>
            </button>

            <button
              onClick={() => handleSendAndroidTestNotification('kullanici_teklif')}
              className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 active:scale-95 border border-cyan-200/80 text-cyan-800 text-[10px] font-black flex items-center gap-1.5 transition text-left cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
              <span className="truncate">💼 Teklif Geldi</span>
            </button>

            <button
              onClick={() => handleSendAndroidTestNotification('ozel')}
              className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 active:scale-95 border border-purple-200/80 text-purple-800 text-[10px] font-black flex items-center gap-1.5 transition text-left cursor-pointer"
            >
              <span className="text-xs">💬</span>
              <span className="truncate">Özel Mesaj</span>
            </button>
          </div>

          {/* 5-second countdown background tester */}
          <div className="mt-2">
            <button
              onClick={handleStartDelayedPushSimulation}
              disabled={countdownTimer !== null}
              className={`w-full py-2 px-3 rounded-xl text-[10.5px] font-black flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer ${
                countdownTimer !== null
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {countdownTimer !== null
                  ? `⏱️ ${countdownTimer} sn sonra bildirim gelecek (Sekmeyi küçültüp/kapatıp test edin)...`
                  : '📲 5 Sn Sonra Arka Plan Push Testi (Sekmeyi değiştirip kilit ekranından bakın)'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          <span>Tümü</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-200/60 text-inherit font-extrabold">
            {notifications.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('unread')}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeFilter === 'unread'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          {unreadCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
          <span>Okunmamış</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
              activeFilter === 'unread' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
            }`}
          >
            {unreadCount}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('teklif')}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeFilter === 'teklif'
              ? 'bg-amber-500 text-neutral-950 shadow-xs'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-900" />
          <span>Usta Teklifleri</span>
        </button>

        <button
          onClick={() => setActiveFilter('ilan')}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeFilter === 'ilan'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>İlanlarım</span>
        </button>

        <button
          onClick={() => setActiveFilter('haber')}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeFilter === 'haber'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          <Newspaper className="w-3.5 h-3.5 text-rose-500" />
          <span>Haber & Duyuru</span>
        </button>

        <button
          onClick={() => setActiveFilter('muhtarlik')}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeFilter === 'muhtarlik'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          <span>🏛️</span>
          <span>Muhtarlık Talepleri</span>
          {notifications.filter((n) => n.type === 'muhtarlik').length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-100 text-red-800 font-extrabold">
              {notifications.filter((n) => n.type === 'muhtarlik').length}
            </span>
          )}
        </button>
      </div>

      {/* 4. Notifications List */}
      <div className="space-y-2">
        {filteredList.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-neutral-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-neutral-800">Bildirim Bulunmuyor</h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                {activeFilter === 'unread'
                  ? 'Okunmamış bildiriminiz yok.'
                  : 'Bu kategoride henüz bildirim gelmedi.'}
              </p>
            </div>
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (!item.read) onMarkAsRead(item.id);
                if (onNavigateTab && item.actionTab) {
                  onNavigateTab(item.actionTab, undefined, item.relatedId);
                } else if (item.actionTab === 'tekliflerim') {
                  onNavigateToQuotes(item.relatedId);
                } else if (item.actionTab === 'alim-satim' || item.actionTab === 'alim_satim') {
                  onNavigateToClassifieds();
                }
              }}
              className={`p-3.5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                !item.read
                  ? 'bg-white border-rose-200/90 shadow-xs hover:border-rose-400'
                  : 'bg-white/80 border-neutral-200/80 hover:bg-white'
              }`}
            >
              {!item.read && (
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-rose-600" />
              )}

              <div className="flex items-start gap-3">
                {getNotificationIcon(item.type)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-black text-neutral-900 truncate">
                        {item.title}
                      </span>
                      {item.badgeText && (
                        <span className="text-[9.5px] font-black px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-700 shrink-0">
                          {item.badgeText}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-400 font-medium shrink-0">
                      {item.date}
                    </span>
                  </div>

                  <p className="text-[11.5px] text-neutral-600 leading-snug line-clamp-2">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-neutral-100">
                    <div className="flex items-center gap-2">
                      {item.sender && (
                        <span className="text-[10.5px] font-bold text-neutral-500">
                          Gönderen: {item.sender}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNotification(item.id);
                        }}
                        className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-rose-600 transition cursor-pointer"
                        title="Bildirimi Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Clear All Footer Button */}
      {notifications.length > 0 && (
        <div className="pt-2 text-center">
          <button
            onClick={onClearAll}
            className="text-xs font-bold text-neutral-400 hover:text-rose-600 transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Tüm Bildirimleri Temizle</span>
          </button>
        </div>
      )}

      {/* Android Notification Permission Modal */}
      <AndroidNotificationPermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => {
          setIsPermissionModalOpen(false);
          setPermissionStatus(getAndroidNotificationPermission());
        }}
        onPermissionChanged={(status) => {
          setPermissionStatus(status);
        }}
      />
    </div>
  );
};
