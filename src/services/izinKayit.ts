import { getNotificationState } from './pushService';
import { getLocationPermissionState, getCachedLocation } from './locationService';
import { analitikIzin } from './analitikService';

// Uygulama içindeki "Reddet" düğmesi sistem izin durumunu değiştirmez; ayrı ayırt edebilmek için cihazda işaretlenir.
const RED = { b: 'mp_izin_red_b', k: 'mp_izin_red_k' } as const;

export function izinAppIciRed(tur: 'b' | 'k', red: boolean): void {
  try {
    if (red) localStorage.setItem(RED[tur], '1');
    else localStorage.removeItem(RED[tur]);
  } catch {}
}

const appIciRedMi = (tur: 'b' | 'k'): boolean => {
  try {
    return localStorage.getItem(RED[tur]) === '1';
  } catch {
    return false;
  }
};

/** Güncel bildirim + konum izin durumunu okuyup cihaz kaydına yazar (analitik kapalıysa yazılmaz). */
export async function izinDurumunuKaydet(): Promise<void> {
  try {
    const [n, l] = await Promise.all([getNotificationState(), getLocationPermissionState()]);
    const b = n === 'granted' ? 'g' : n === 'denied' ? 'r' : n === 'unsupported' ? 'u' : appIciRedMi('b') ? 'x' : 's';
    const k =
      l === 'granted'
        ? 'g'
        : l === 'denied'
          ? 'r'
          : l === 'unknown' && getCachedLocation(365 * 24 * 60 * 60 * 1000)
            ? 'g'
            : appIciRedMi('k')
              ? 'x'
              : 's';
    if (b === 'g') izinAppIciRed('b', false);
    if (k === 'g') izinAppIciRed('k', false);
    analitikIzin(b, k);
  } catch {}
}
