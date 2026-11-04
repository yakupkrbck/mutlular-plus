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

async function registerWithWorker(token: string, removeFields: string[] = []): Promise<{ ok: boolean; error?: string }> {
  const user = auth.currentUser;
  if (!user) return { ok: false, error: 'Giriş gerekli' };
  const idToken = await user.getIdToken();
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/push/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ token, removeFields }),
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

/** Rol / hizmet alanı değişince konu aboneliklerini yeniler (yeni jeton almadan). */
export async function resyncPushTopics(removedFields: string[] = []): Promise<void> {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || !auth.currentUser) return;
    await registerWithWorker(token, removedFields);
  } catch {}
}

/** Çıkış yaparken: bu cihazı kişiye özel / yönetim / usta konularından çıkarır (herkese açık duyurular sürer). */
export async function unregisterPush(): Promise<void> {
  const user = auth.currentUser;
  const token = (() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  })();
  if (!user || !token) return;
  try {
    const idToken = await user.getIdToken();
    await fetch(`${API_BASE}/api/push/unregister`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ token }),
    });
  } catch {}
}

/**
 * Olay bildirimi: "ne oldu"yu sunucuya bildirir; alıcıları ve içeriği sunucu KENDİSİ belirler
 * (talep → o alandaki ustalar, teklif → talep sahibi, onay bekleyen kayıt → yönetim, vb.).
 * Sonuç beklenmez; başarısız olursa kullanıcı akışı etkilenmez.
 */
export async function notifyEvent(
  type: string,
  payload: Record<string, unknown> = {}
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const user = auth.currentUser;
  if (!user) return { ok: false, error: 'Giriş gerekli' };
  try {
    const idToken = await user.getIdToken();
    const res = await fetch(`${API_BASE}/api/push/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ type, ...payload }),
    });
    const json: any = await res.json().catch(() => ({}));
    if (res.status === 503) return { ok: false, error: 'Bildirim sunucusu henüz yapılandırılmadı.' };
    if (!res.ok || !json.success) return { ok: false, error: json.error || `HTTP ${res.status}` };
    return { ok: true, skipped: !!json.skipped };
  } catch (e) {
    console.warn('[bildirim olayı]', type, e);
    return { ok: false, error: 'Sunucuya ulaşılamadı.' };
  }
}

/** Yönetim: UEDAŞ / BUSKİ'yi şimdi tara; yeni kesintiler onay listesine düşer ve yöneticilere bildirilir. */
export async function scanKesintiNow(): Promise<{ ok: boolean; yeni?: number; error?: string }> {
  const user = auth.currentUser;
  if (!user) return { ok: false, error: 'Giriş gerekli' };
  try {
    const idToken = await user.getIdToken();
    const res = await fetch(`${API_BASE}/api/push/kesinti-tara`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: '{}',
    });
    const j: any = await res.json().catch(() => ({}));
    if (!res.ok || !j.success) return { ok: false, error: j.error || `HTTP ${res.status}` };
    return { ok: true, yeni: (j.uedas?.yeni || 0) + (j.buski?.yeni || 0) };
  } catch {
    return { ok: false, error: 'Sunucuya ulaşılamadı.' };
  }
}

/** Yönetim arayüzlerinden tek tuşla "tüm cihazlara" duyuru. Sonuç ekranda kısa mesajla gösterilir. */
export async function broadcastPush(title: string, body: string, actionTab = 'profil') {
  const r = await sendBroadcastPush(title, body, actionTab);
  try {
    window.dispatchEvent(
      new CustomEvent(r.ok ? 'mp-info' : 'mp-sync-error', {
        detail: r.ok ? 'Bildirim tüm cihazlara gönderildi.' : `Cihaz bildirimi gönderilemedi: ${r.error}`,
      })
    );
  } catch {}
  return r;
}
