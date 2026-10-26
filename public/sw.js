// Mutlular Plus - Google Play Store & Android Service Worker Push Handler
// Compatible with Android Trusted Web Activity (TWA) & Firebase Cloud Messaging (FCM)

const CACHE_NAME = 'mutlular-plus-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 1. PostMessage Triggered Notifications (Internal Engine Dispatch)
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SHOW_ANDROID_NOTIFICATION') {
    const payload = event.data.payload || {};
    event.waitUntil(showAndroidSystemNotification(payload));
  } else if (event.data.type === 'CLEAR_ALL_NOTIFICATIONS') {
    event.waitUntil(
      self.registration.getNotifications().then((notifications) => {
        notifications.forEach((n) => n.close());
      })
    );
  }
});

// 2. Real Web Push & Firebase Cloud Messaging (FCM) Event Listener
self.addEventListener('push', (event) => {
  let pushData = {
    title: 'Mutlular Plus • Mahalle Bildirimi',
    body: 'Yeni bir duyuru veya usta teklifi iletildi.',
    tag: 'mutlular-push',
    channel: 'genel',
    badgeText: 'Yeni',
    data: {},
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      // Support FCM format: { notification: {...}, data: {...} } or direct payload
      if (parsed.notification) {
        pushData.title = parsed.notification.title || pushData.title;
        pushData.body = parsed.notification.body || pushData.body;
        pushData.icon = parsed.notification.icon || '/icon-192.svg';
        pushData.image = parsed.notification.image;
      }
      if (parsed.data) {
        pushData = {
          ...pushData,
          ...parsed.data,
          title: parsed.data.title || pushData.title,
          body: parsed.data.body || pushData.body,
        };
      } else if (!parsed.notification) {
        pushData = { ...pushData, ...parsed };
      }
    } catch (e) {
      pushData.body = event.data.text() || pushData.body;
    }
  }

  event.waitUntil(showAndroidSystemNotification(pushData));
});

// Helper: Show native Android notification with rich options
function showAndroidSystemNotification(payload) {
  const {
    title = 'Mutlular Plus Bildirimi',
    body = '',
    tag = 'mutlular-channel',
    icon = '/icon-192.svg',
    badge = '/icon-192.svg',
    image,
    data = {},
  } = payload;

  const notificationData = {
    ...data,
    actionTab: payload.actionTab || (data && data.actionTab) || 'profil',
    subTab: payload.subTab || (data && data.subTab) || 'bildirimler',
    relatedId: payload.relatedId || (data && data.relatedId),
    url: payload.url || (data && data.url) || '/',
    timestamp: Date.now(),
  };

  const options = {
    body,
    icon,
    badge,
    image: image || undefined,
    tag: tag || `mutlular-${Date.now()}`,
    renotify: true,
    vibrate: [150, 75, 150, 75, 300],
    requireInteraction: payload.type === 'acil' || payload.type === 'teklif',
    data: notificationData,
    actions: [
      {
        action: 'open_action',
        title: payload.type === 'teklif' ? 'Teklife Git' : 'İncele',
      },
      {
        action: 'dismiss',
        title: 'Kapat',
      },
    ],
  };

  return self.registration.showNotification(title, options);
}

// 3. Android Notification Click Event Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const notificationData = event.notification.data || {};
  const actionTab = notificationData.actionTab || 'profil';
  const subTab = notificationData.subTab || 'bildirimler';
  const targetUrl = `/?tab=${encodeURIComponent(actionTab)}&subTab=${encodeURIComponent(subTab)}`;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app window is open, focus and send navigation message
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            payload: notificationData,
          });
          return;
        }
      }
      // If no window is open, launch app at target URL
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// 4. Android Notification Dismiss / Close Event
self.addEventListener('notificationclose', (event) => {
  // Can be used for telemetry or analytics in future
});
