import { Capacitor } from '@capacitor/core';

// Konum yalnızca bu CİHAZDA tutulur (sunucuya gönderilmez). Eczane yakınlığı vb. özellikler için kullanılır.
export interface SavedLocation {
  lat: number;
  lng: number;
  ts: number;
}

const KEY = 'mp_last_location';
const ASKED_KEY = 'mp_loc_asked';

export function getCachedLocation(maxAgeMs = 6 * 60 * 60 * 1000): SavedLocation | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const loc = JSON.parse(raw) as SavedLocation;
    if (!loc || typeof loc.lat !== 'number' || Date.now() - loc.ts > maxAgeMs) return null;
    return loc;
  } catch {
    return null;
  }
}

export type LocationPermission = 'granted' | 'prompt' | 'denied' | 'unknown';

export async function getLocationPermissionState(): Promise<LocationPermission> {
  try {
    if (Capacitor.isNativePlatform()) {
      const { Geolocation } = await import('@capacitor/geolocation');
      const p = await Geolocation.checkPermissions();
      const v = p.location;
      return v === 'granted' ? 'granted' : v === 'denied' ? 'denied' : 'prompt';
    }
    const perms = (navigator as any).permissions;
    if (perms?.query) {
      const r = await perms.query({ name: 'geolocation' as PermissionName });
      return r.state as LocationPermission;
    }
  } catch {}
  return 'unknown';
}

export const wasLocationAsked = () => {
  try {
    return localStorage.getItem(ASKED_KEY) === '1';
  } catch {
    return false;
  }
};

export type LocationResult =
  | { ok: true; loc: SavedLocation }
  | { ok: false; reason: 'denied' | 'unavailable' | 'timeout' };

export async function requestLocation(): Promise<LocationResult> {
  try {
    localStorage.setItem(ASKED_KEY, '1');
  } catch {}

  const save = (lat: number, lng: number): LocationResult => {
    const loc = { lat, lng, ts: Date.now() };
    try {
      localStorage.setItem(KEY, JSON.stringify(loc));
      window.dispatchEvent(new CustomEvent('mp-location-updated', { detail: loc }));
    } catch {}
    return { ok: true, loc };
  };

  try {
    if (Capacitor.isNativePlatform()) {
      const { Geolocation } = await import('@capacitor/geolocation');
      const perm = await Geolocation.requestPermissions();
      if (perm.location !== 'granted') return { ok: false, reason: 'denied' };
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 10000 });
      return save(pos.coords.latitude, pos.coords.longitude);
    }
  } catch {
    return { ok: false, reason: 'unavailable' };
  }

  if (!navigator.geolocation) return { ok: false, reason: 'unavailable' };
  return new Promise<LocationResult>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(save(pos.coords.latitude, pos.coords.longitude)),
      (err) => resolve({ ok: false, reason: err.code === 1 ? 'denied' : err.code === 3 ? 'timeout' : 'unavailable' }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 120000 }
    );
  });
}
