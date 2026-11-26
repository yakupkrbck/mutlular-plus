import React, { useEffect, useState } from 'react';
import { Bell, MapPin } from 'lucide-react';
import { askNotificationPermission, getNotificationState } from '../../services/pushService';
import { getLocationPermissionState, requestLocation } from '../../services/locationService';
import { izinAppIciRed, izinDurumunuKaydet } from '../../services/izinKayit';

interface PermissionPromptProps {
  isOpen: boolean;
  /** Bildirim izni istenmeli mi */
  needNotif: boolean;
  /** Konum izni istenmeli mi */
  needLoc: boolean;
  onClose: () => void;
}

type Adim = 'notif' | 'loc';

const METIN: Record<Adim, { baslik: string; alt: string; ayar: string }> = {
  notif: {
    baslik: 'Mutlular Haber size bildirim göndermek istiyor',
    alt: 'Mahalleden haberler, kesintiler ve duyurular anında telefonunuza gelsin.',
    ayar: 'Bildirim izni telefon ayarlarından kapalı. Ayarlar > Uygulamalar > Mutlular Haber > Bildirimler yolundan açabilirsiniz.',
  },
  loc: {
    baslik: 'Mutlular Haber konumunuza erişmek istiyor',
    alt: 'Size yakın nöbetçi eczane, kesinti ve haberleri gösterebilmek için.',
    ayar: 'Konum izni telefon ayarlarından kapalı. Ayarlar > Uygulamalar > Mutlular Haber > Konum yolundan açabilirsiniz.',
  },
};

export const PermissionPrompt: React.FC<PermissionPromptProps> = ({ isOpen, needNotif, needLoc, onClose }) => {
  const adimlar: Adim[] = [...(needNotif ? (['notif'] as Adim[]) : []), ...(needLoc ? (['loc'] as Adim[]) : [])];
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const [ayarIpucu, setAyarIpucu] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setI(0);
      setBusy(false);
      setAyarIpucu(false);
    }
  }, [isOpen]);

  const adim = adimlar[i];
  if (!isOpen || !adim) return null;

  const sonraki = async () => {
    setAyarIpucu(false);
    await izinDurumunuKaydet();
    if (i + 1 < adimlar.length) setI(i + 1);
    else onClose();
  };

  const izinVer = async () => {
    setBusy(true);
    try {
      if (adim === 'notif') {
        const once = await getNotificationState();
        const r = await askNotificationPermission();
        izinAppIciRed('b', false);
        if (!r.ok && r.reason === 'denied' && once === 'denied') {
          // Sistem penceresi bir daha açılmaz; kullanıcıya ayarlardan açması söylenir
          setAyarIpucu(true);
          setBusy(false);
          await izinDurumunuKaydet();
          return;
        }
      } else {
        const once = await getLocationPermissionState();
        const r = await requestLocation();
        izinAppIciRed('k', false);
        if (!r.ok && r.reason === 'denied' && once === 'denied') {
          setAyarIpucu(true);
          setBusy(false);
          await izinDurumunuKaydet();
          return;
        }
      }
    } catch {}
    setBusy(false);
    await sonraki();
  };

  const reddet = async () => {
    izinAppIciRed(adim === 'notif' ? 'b' : 'k', true);
    await sonraki();
  };

  const Ikon = adim === 'notif' ? Bell : MapPin;

  return (
    <div className="fixed inset-0 z-[350] bg-black/55 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Ikon className="w-6 h-6" />
          </div>
          <h3 className="text-[16px] font-black text-neutral-900 leading-snug">{METIN[adim].baslik}</h3>
          <p className="text-[12.5px] text-neutral-600 leading-snug">{METIN[adim].alt}</p>
        </div>
        {ayarIpucu ? (
          <>
            <p className="text-[12px] font-semibold text-rose-600 text-center leading-snug">{METIN[adim].ayar}</p>
            <button type="button" onClick={sonraki} className="w-full bg-neutral-900 text-white text-[13px] font-black rounded-xl py-3">
              Tamam
            </button>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={reddet}
              disabled={busy}
              className="bg-neutral-100 hover:bg-neutral-200 disabled:opacity-60 text-neutral-700 text-[13px] font-black rounded-xl py-3"
            >
              Reddet
            </button>
            <button
              type="button"
              onClick={izinVer}
              disabled={busy}
              className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-60 text-white text-[13px] font-black rounded-xl py-3"
            >
              {busy ? 'İşleniyor…' : 'İzin ver'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
