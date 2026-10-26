// Mutlular Plus - Professional Google Play Store & Android Notification Engine
// Fully compatible with Android Trusted Web Activity (TWA), Web Push API, and FCM

export type AndroidPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export type NotificationChannelId =
  | 'son_dakika'
  | 'canli_yayin'
  | 'vefat_taziye'
  | 'yonetici_duyuru'
  | 'ilan_firsat'
  | 'usta_talep'
  | 'kullanici_teklif'
  | 'ozel_mesaj'
  | 'acil_durum'
  // Backward compatibility
  | 'usta_teklifleri'
  | 'ilan_ve_esnaf'
  | 'mahalle_duyuru';

export interface AndroidNotificationChannel {
  id: NotificationChannelId;
  name: string;
  description: string;
  importance: 'high' | 'default' | 'urgent';
  enabled: boolean;
  sound: boolean;
  vibrate: boolean;
  iconName: string;
  badgeColor?: string;
}

export type AndroidPayloadType =
  | 'son_dakika'
  | 'canli_yayin'
  | 'vefat'
  | 'duyuru'
  | 'ilan'
  | 'usta_talep'
  | 'kullanici_teklif'
  | 'teklif'
  | 'ozel'
  | 'acil'
  | 'haber'
  | 'muhtarlik'
  | 'sistem';

export interface AndroidNotificationPayload {
  id?: string;
  title: string;
  body: string;
  type?: AndroidPayloadType;
  channelId?: NotificationChannelId;
  tag?: string;
  badgeText?: string;
  actionTab?: string;
  subTab?: string;
  relatedId?: string;
  url?: string;
  imageUrl?: string;
  timestamp?: number;
}

export const ANDROID_CHANNELS_CONFIG: Record<
  string,
  Omit<AndroidNotificationChannel, 'enabled'>
> = {
  son_dakika: {
    id: 'son_dakika',
    name: '🚨 Son Dakika Haberleri',
    description: 'Mahalle ve şehir gündemindeki flaş gelişmeler ve acil haberler.',
    importance: 'urgent',
    sound: true,
    vibrate: true,
    iconName: 'AlertCircle',
    badgeColor: '#e11d48',
  },
  canli_yayin: {
    id: 'canli_yayin',
    name: '🔴 Mutlular Canlı Yayın',
    description: 'Mutlular Canlı TV ve mahalle canlı yayınları başladığında anlık bildirim.',
    importance: 'high',
    sound: true,
    vibrate: true,
    iconName: 'Radio',
    badgeColor: '#dc2626',
  },
  vefat_taziye: {
    id: 'vefat_taziye',
    name: '🕊️ Vefat & Taziye Haberleri',
    description: 'Mahalle sakinlerimizin vefat haberleri, cenaze vakitleri ve taziye mesajları.',
    importance: 'high',
    sound: true,
    vibrate: true,
    iconName: 'HeartCrack',
    badgeColor: '#475569',
  },
  yonetici_duyuru: {
    id: 'yonetici_duyuru',
    name: '📢 Yönetici & Muhtarlık Duyuruları',
    description: 'Yönetimden gelen resmi duyurular, su/elektrik kesintileri ve acil uyarılar.',
    importance: 'high',
    sound: true,
    vibrate: true,
    iconName: 'BellRing',
    badgeColor: '#2563eb',
  },
  ilan_firsat: {
    id: 'ilan_firsat',
    name: '🏷️ İlanlar & Esnaf Fırsatları',
    description: 'Yönetici tarafından öne çıkarılan ilanlar, satılık/kiralık ve esnaf indirimleri.',
    importance: 'default',
    sound: true,
    vibrate: false,
    iconName: 'ShoppingBag',
    badgeColor: '#059669',
  },
  usta_talep: {
    id: 'usta_talep',
    name: '🔨 Ustaya Talep Bildirimleri (Özel)',
    description: 'Müşterilerden gelen yeni iş ve teklif talebi bildirimleri.',
    importance: 'urgent',
    sound: true,
    vibrate: true,
    iconName: 'Wrench',
    badgeColor: '#d97706',
  },
  kullanici_teklif: {
    id: 'kullanici_teklif',
    name: '💼 Müşteriye Teklif Bildirimleri (Özel)',
    description: 'Verdiğiniz talebe ustalardan gelen yeni fiyat teklifleri.',
    importance: 'urgent',
    sound: true,
    vibrate: true,
    iconName: 'Sparkles',
    badgeColor: '#0284c7',
  },
  ozel_mesaj: {
    id: 'ozel_mesaj',
    name: '💬 Özel Bildirimler & Mesajlar',
    description: 'Birebir yazışmalar, sipariş durumları ve kişiye özel onaylar.',
    importance: 'high',
    sound: true,
    vibrate: true,
    iconName: 'MessageSquare',
    badgeColor: '#7c3aed',
  },
  acil_durum: {
    id: 'acil_durum',
    name: '⚠️ Acil Durum & Nöbetçi Eczaneler',
    description: 'Kritik uyarılar, yakın nöbetçi eczaneler ve afet bildirimleri.',
    importance: 'urgent',
    sound: true,
    vibrate: true,
    iconName: 'AlertTriangle',
    badgeColor: '#b91c1c',
  },
  // Backward compatibility mappings
  usta_teklifleri: {
    id: 'usta_talep',
    name: '🔨 Usta & Hizmet Teklifleri',
    description: 'Ustalar ve müşteriler arasındaki teklif bildirimleri.',
    importance: 'high',
    sound: true,
    vibrate: true,
    iconName: 'Sparkles',
    badgeColor: '#d97706',
  },
  ilan_ve_esnaf: {
    id: 'ilan_firsat',
    name: '🏷️ İlanlar & Esnaf',
    description: 'İlan onayları ve esnaf fırsatları.',
    importance: 'default',
    sound: true,
    vibrate: false,
    iconName: 'ShoppingBag',
    badgeColor: '#059669',
  },
  mahalle_duyuru: {
    id: 'yonetici_duyuru',
    name: '📢 Mahalle Duyuruları',
    description: 'Muhtarlık ve mahalle duyuruları.',
    importance: 'default',
    sound: true,
    vibrate: false,
    iconName: 'Newspaper',
    badgeColor: '#2563eb',
  },
};

// 1. Channel Preference Management
export const getChannelPreference = (channelId: NotificationChannelId | string): boolean => {
  try {
    const val = localStorage.getItem(`mutlular_channel_${channelId}`);
    return val !== 'false'; // default true
  } catch {
    return true;
  }
};

export const setChannelPreference = (channelId: NotificationChannelId | string, enabled: boolean): void => {
  try {
    localStorage.setItem(`mutlular_channel_${channelId}`, enabled ? 'true' : 'false');
  } catch {}
};

export const getPrimaryChannels = (): AndroidNotificationChannel[] => {
  const primaryKeys: NotificationChannelId[] = [
    'son_dakika',
    'canli_yayin',
    'vefat_taziye',
    'yonetici_duyuru',
    'ilan_firsat',
    'usta_talep',
    'kullanici_teklif',
    'ozel_mesaj',
    'acil_durum',
  ];

  return primaryKeys.map((id) => ({
    ...(ANDROID_CHANNELS_CONFIG[id] as Omit<AndroidNotificationChannel, 'enabled'>),
    enabled: getChannelPreference(id),
  }));
};

export const getAllChannelsWithState = (): AndroidNotificationChannel[] => {
  return getPrimaryChannels();
};

// 2. Browser & Service Worker Compatibility Checks
export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const isServiceWorkerSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
};

export const getAndroidNotificationPermission = (): AndroidPermissionStatus => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission as AndroidPermissionStatus;
};

export const requestAndroidNotificationPermission = async (): Promise<AndroidPermissionStatus> => {
  if (!isNotificationSupported()) return 'unsupported';

  try {
    const status = await Notification.requestPermission();
    return status as AndroidPermissionStatus;
  } catch (err) {
    console.warn('Android notification permission prompt failed:', err);
    return 'denied';
  }
};

// 3. Android Service Worker Registration
export const registerAndroidServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!isServiceWorkerSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    if (registration.installing) {
      console.log('Android Service Worker installing...');
    }

    return registration;
  } catch (err) {
    console.warn('Android Service Worker registration error:', err);
    return null;
  }
};

// 4. Android Home Screen App Icon Badge API (navigator.setAppBadge)
export const updateAppIconBadge = async (unreadCount: number): Promise<void> => {
  try {
    if (typeof navigator !== 'undefined') {
      const nav = navigator as unknown as {
        setAppBadge?: (count: number) => Promise<void>;
        clearAppBadge?: () => Promise<void>;
      };

      if (unreadCount > 0 && typeof nav.setAppBadge === 'function') {
        await nav.setAppBadge(unreadCount);
      } else if (typeof nav.clearAppBadge === 'function') {
        await nav.clearAppBadge();
      }
    }
  } catch (e) {
    // Badges may not be supported on all browsers/platforms
  }
};

// 5. Unique Device FCM Push Token Generator & Storage
export const getOrGenerateDevicePushToken = (): string => {
  try {
    let token = localStorage.getItem('mutlular_fcm_device_token');
    if (!token) {
      const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      token = `fcm_android_mutlular_${Date.now()}_${randomPart}`;
      localStorage.setItem('mutlular_fcm_device_token', token);
    }
    return token;
  } catch {
    return 'fcm_android_mutlular_default_token';
  }
};

// 6. Sound & Vibration Synthesizer
export const playAndroidNotificationChime = (type: AndroidPayloadType = 'sistem'): void => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'acil' || type === 'son_dakika') {
      // Urgent siren tone (High alert)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
      return;
    }

    if (type === 'canli_yayin') {
      // Broadcast Fanfare (Triple ascending major triad: C5 -> E5 -> G5)
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.28);
      });
      return;
    }

    if (type === 'vefat') {
      // Solemn, gentle resonance (Low C4 with soft fade, respectful)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(261.63, now); // C4
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.85);
      return;
    }

    if (type === 'kullanici_teklif' || type === 'teklif') {
      // Cash/Sparkle success chime (B5 -> E6)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, now); // B5
      osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.1); // E6
      osc2.frequency.setValueAtTime(1318.51, now + 0.06);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now + 0.05);
      osc1.stop(now + 0.5);
      osc2.stop(now + 0.5);
      return;
    }

    if (type === 'usta_talep') {
      // Work alert double-click (F#5 -> C#6)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(739.99, now);
      osc.frequency.setValueAtTime(1108.73, now + 0.08);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
      return;
    }

    if (type === 'muhtarlik') {
      // Official Brass Chime (Grand double resonant alert: D5 -> A5)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880.00, now + 0.12); // A5
      osc2.frequency.setValueAtTime(880.00, now + 0.08);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now + 0.06);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
      return;
    }

    // Default Material You dual-tone Android notification sound (E5 -> B5)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    osc1.frequency.exponentialRampToValueAtTime(987.77, now + 0.12); // B5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.22, now + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.06);

    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  } catch (e) {
    // Autoplay restrictions or audio context blocked
  }
};

export const triggerAndroidVibration = (pattern = [150, 75, 150, 75, 300]): void => {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (e) {
    // Vibration not supported
  }
};

// 7. Sound / Vibrate Master Preferences
export const getAndroidSoundPref = (): boolean => {
  try {
    return localStorage.getItem('mutlular_android_sound') !== 'false';
  } catch {
    return true;
  }
};

export const setAndroidSoundPref = (val: boolean): void => {
  try {
    localStorage.setItem('mutlular_android_sound', val ? 'true' : 'false');
  } catch {}
};

export const getAndroidVibratePref = (): boolean => {
  try {
    return localStorage.getItem('mutlular_android_vibrate') !== 'false';
  } catch {
    return true;
  }
};

export const setAndroidVibratePref = (val: boolean): void => {
  try {
    localStorage.setItem('mutlular_android_vibrate', val ? 'true' : 'false');
  } catch {}
};

// Map notification type to channel id
export const mapTypeToChannel = (type?: AndroidPayloadType): NotificationChannelId => {
  switch (type) {
    case 'son_dakika':
    case 'haber':
      return 'son_dakika';
    case 'canli_yayin':
      return 'canli_yayin';
    case 'vefat':
      return 'vefat_taziye';
    case 'duyuru':
      return 'yonetici_duyuru';
    case 'ilan':
      return 'ilan_firsat';
    case 'usta_talep':
      return 'usta_talep';
    case 'kullanici_teklif':
    case 'teklif':
      return 'kullanici_teklif';
    case 'ozel':
      return 'ozel_mesaj';
    case 'acil':
      return 'acil_durum';
    case 'muhtarlik':
      return 'yonetici_duyuru';
    default:
      return 'yonetici_duyuru';
  }
};

// 8. Main Dispatcher: Sends real notification to Android System Status Bar, Heads-up popup & Haptics
export const sendAndroidAppNotification = async (
  payload: AndroidNotificationPayload
): Promise<boolean> => {
  const channelId = payload.channelId || mapTypeToChannel(payload.type);
  const isChannelEnabled = getChannelPreference(channelId);

  // If user disabled this channel in settings, don't dispatch sound/system alert
  if (!isChannelEnabled) {
    return false;
  }

  const soundEnabled = getAndroidSoundPref();
  const vibrateEnabled = getAndroidVibratePref();

  // Play custom sound & vibration based on category
  if (soundEnabled) {
    playAndroidNotificationChime(payload.type);
  }
  if (vibrateEnabled) {
    let pattern = [150, 75, 150, 75, 300];
    if (payload.type === 'acil' || payload.type === 'son_dakika') {
      pattern = [300, 100, 300, 100, 300];
    } else if (payload.type === 'vefat') {
      pattern = [400]; // Respectful single long vibration
    } else if (payload.type === 'canli_yayin') {
      pattern = [100, 50, 100, 50, 150];
    }
    triggerAndroidVibration(pattern);
  }

  // Dispatch Heads-up In-App notification event
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('android-heads-up-push', {
      detail: {
        ...payload,
        channelId,
      },
    });
    window.dispatchEvent(event);
  }

  // Dispatch to Android System Status Bar / Lock Screen via Service Worker
  const permission = getAndroidNotificationPermission();
  if (permission === 'granted') {
    try {
      if (isServiceWorkerSupported()) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          let actionTitle = 'Görüntüle';
          if (payload.type === 'canli_yayin') actionTitle = 'Yayını İzle';
          else if (payload.type === 'vefat') actionTitle = 'Taziye Mesajı Yaz';
          else if (payload.type === 'kullanici_teklif' || payload.type === 'teklif') actionTitle = 'Teklifi İncele';
          else if (payload.type === 'usta_talep') actionTitle = 'Teklif Ver';
          else if (payload.type === 'ilan') actionTitle = 'İlanı Aç';
          else if (payload.type === 'son_dakika') actionTitle = 'Haberi Oku';

          const swOptions = {
            body: payload.body,
            icon: '/icon-192.svg',
            badge: '/icon-192.svg',
            image: payload.imageUrl,
            tag: payload.tag || `${channelId}-${Date.now()}`,
            data: {
              ...payload,
              channelId,
              actionTab: payload.actionTab || 'profil',
              subTab: payload.subTab || 'bildirimler',
              relatedId: payload.relatedId,
              url: payload.url || '/',
            },
            renotify: true,
            vibrate: [150, 75, 150, 75, 300],
            requireInteraction:
              payload.type === 'acil' ||
              payload.type === 'son_dakika' ||
              payload.type === 'canli_yayin' ||
              payload.type === 'usta_talep' ||
              payload.type === 'kullanici_teklif',
            actions: [
              {
                action: 'open_action',
                title: actionTitle,
              },
              {
                action: 'dismiss',
                title: 'Kapat',
              },
            ],
          };

          await (
            registration.showNotification as (
              title: string,
              opt?: Record<string, unknown>
            ) => Promise<void>
          )(payload.title, swOptions);
          return true;
        }
      }

      // Fallback if ServiceWorker not ready
      new Notification(payload.title, {
        body: payload.body,
        icon: '/icon-192.svg',
        tag: payload.tag || `${channelId}-${Date.now()}`,
      });
      return true;
    } catch (err) {
      console.warn('Native notification dispatch error:', err);
    }
  }

  return false;
};
