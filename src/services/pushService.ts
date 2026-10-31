import { Capacitor } from '@capacitor/core';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { app, auth } from '../firebase';
import { API_BASE } from '../config/api';
import { FCM_VAPID_KEY } from '../config/push';
import {
  getAndroidNotificationPermission,
  requestAndroidNotificationPermission,
  registerAndroidServiceWorker,
  sendAndroidAppNotification,
} from './androidNotificationService';

// Gerçek push (FCM): cihaz jetonu Worker'a gönderilir, Worker cihazı "tum" konusuna abone eder.
// Yönetici bildirim gönderince Worker tek istekle bu konuya yollar ve tüm cihazlara ulaşır.

export type PushResult = {
  ok: boolean;
  reason?: 'unsupported' | 'not_configured' | 'denied' | 'dismissed' | 'no_token' | 'register_failed' | 'native_error' | 'timeout' | 'login_required';
  detail?: string;
};

const TOKEN_KEY = 'mp_fcm_token';

async function registerWithWorker(token: string): Promise<{ ok: boolean; error?: string }> {
  const user = auth.currentUser;
  if (!user) return { ok: false, error: 'Giriş gerekli' };
  const idToken = await user.getIdToken();
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/push/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ token }),
    });
  } catch {
    return { ok: false, error: 'Sunucuya ulaşılamadı' };
  }
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) return { ok: false, error: json.error || `HTTP ${res.status}` };
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
  return { ok: true };
}

let nativeListenersAdded = false;

async function enableNative(): Promise<PushResult> {
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    const perm = await PushNotifications.requestPermissions();
    if (perm.receive !== 'granted') return { ok: false, reason: 'denied' };

    return await new Promise<PushResult>((resolve) => {
      let done = false;
      const finish = (r: PushResult) => {
        if (done) return;
        done = true;
        resolve(r);
      };
      if (!nativeListenersAdded) {
        nativeListenersAdded = true;
        // Uygulama açıkken gelen bildirimi uygulama içi uyarı olarak göster
        PushNotifications.addListener('pushNotificationReceived', (n) => {
          sendAndroidAppNotification({ title: n.title || 'Mutlular Plus', body: n.body || '', type: 'duyuru' });
        });
      }
      PushNotifications.addListener('registration', async (t) => {
        const r = await registerWithWorker(t.value);
        finish(r.ok ? { ok: true } : { ok: false, reason: 'register_failed', detail: r.error });
      });
      PushNotifications.addListener('registrationError', (e) =>
        finish({ ok: false, reason: 'native_error', detail: String((e as any)?.error || '') })
      );
      PushNotifications.register();
      setTimeout(() => finish({ ok: false, reason: 'timeout' }), 12000);
    });
  } catch (e: any) {
    return { ok: false, reason: 'native_error', detail: e?.message };
  }
}

async function webToken(): Promise<PushResult> {
  if (!(await isSupported())) return { ok: false, reason: 'unsupported' };
  if (!FCM_VAPID_KEY) return { ok: false, reason: 'not_configured' };
  const reg = (await registerAndroidServiceWorker()) || (await navigator.serviceWorker.ready);
  await navigator.serviceWorker.ready;
  const token = await getToken(getMessaging(app), { vapidKey: FCM_VAPID_KEY, serviceWorkerRegistration: reg });
  if (!token) return { ok: false, reason: 'no_token' };
  const r = await registerWithWorker(token);
  return r.ok ? { ok: true } : { ok: false, reason: 'register_failed', detail: r.error };
}

/** İzin ister (kullanıcı dokunuşuyla çağrılmalı), cihazı kaydeder. */
export async function enablePush(): Promise<PushResult> {
  if (!auth.currentUser) return { ok: false, reason: 'login_required' };
  if (Capacitor.isNativePlatform()) return enableNative();
  const perm = await requestAndroidNotificationPermission();
  if (perm === 'unsupported') return { ok: false, reason: 'unsupported' };
  if (perm !== 'granted') return { ok: false, reason: perm === 'denied' ? 'denied' : 'dismissed' };
  try {
    return await webToken();
  } catch (e: any) {
    return { ok: false, reason: 'no_token', detail: e?.message };
  }
}

/** İzin zaten verilmişse sessizce yeniler (jetonlar zamanla değişebilir). */
export async function refreshPushIfGranted(): Promise<void> {
  if (!auth.currentUser) return;
  try {
    if (Capacitor.isNativePlatform()) {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      const p = await PushNotifications.checkPermissions();
      if (p.receive === 'granted') await enableNative();
      return;
    }
    if (getAndroidNotificationPermission() === 'granted') await webToken();
  } catch (e) {
    console.warn('[push] yenilenemedi', e);
  }
}

/** Yönetici: tüm cihazlara bildirim gönderir (Worker yetkiyi doğrular). */
export async function sendBroadcastPush(
  title: string,
  body: string,
  actionTab = 'profil'
): Promise<{ ok: boolean; error?: string }> {
  const user = auth.currentUser;
  if (!user) return { ok: false, error: 'Giriş gerekli' };
  try {
    const idToken = await user.getIdToken();
    const res = await fetch(`${API_BASE}/api/push/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ title, body, actionTab }),
    });
    const json: any = await res.json().catch(() => ({}));
    if (res.status === 503) return { ok: false, error: 'Bildirim sunucusu henüz yapılandırılmadı.' };
    if (!res.ok || !json.success) return { ok: false, error: json.error || `HTTP ${res.status}` };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Sunucuya ulaşılamadı.' };
  }
}
