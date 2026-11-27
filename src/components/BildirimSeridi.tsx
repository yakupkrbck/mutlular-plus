import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { askNotificationPermission, getNotificationState, type NotifState } from '../services/pushService';
import { izinDurumunuKaydet } from '../services/izinKayit';

const KAPALI_KEY = 'mp_bildirim_serit_kapali';

interface Props {
  /** Artık kullanılmıyor: üye olmayan ziyaretçi de bildirim açabilir */
  girisYapti?: boolean;
  onGirisGerek?: () => void;
  className?: string;
}

/** Yumuşak "bildirimleri aç" şeridi: sistem penceresini yalnız kullanıcı dokununca açar. */
export const BildirimSeridi: React.FC<Props> = ({ girisYapti, onGirisGerek, className = '' }) => {
  const [durum, setDurum] = useState<NotifState | null>(null);
  const [kapali, setKapali] = useState(() => {
    try {
      return sessionStorage.getItem(KAPALI_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [busy, setBusy] = useState(false);
  const [sonuc, setSonuc] = useState<'ok' | 'ayar' | ''>('');

  useEffect(() => {
    let alive = true;
    getNotificationState().then((s) => alive && setDurum(s)).catch(() => {});
    return () => {
      alive = false;
    };
  }, [girisYapti]);

  if (kapali || durum === null || durum === 'unsupported') return null;
  // İzin verilmiş ve giriş yapılmışsa cihaz zaten kayıtlıdır
  if (durum === 'granted' && sonuc !== 'ok') return null;

  const kapat = () => {
    setKapali(true);
    try {
      sessionStorage.setItem(KAPALI_KEY, '1');
    } catch {}
  };

  const ac = async () => {
    if (durum === 'denied') return setSonuc('ayar');
    setBusy(true);
    try {
      const r = await askNotificationPermission();
      setDurum(await getNotificationState());
      await izinDurumunuKaydet();
      if (r.ok) {
        setSonuc('ok');
        setTimeout(kapat, 2500);
      } else if (r.reason === 'denied') setSonuc('ayar');
    } catch {}
    setBusy(false);
  };

  return (
    <div className={`rounded-2xl border border-amber-200 bg-amber-50 p-3 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          {sonuc === 'ok' ? (
            <div className="text-[13px] font-black text-emerald-700">Bildirimler açıldı. Teşekkürler!</div>
          ) : sonuc === 'ayar' ? (
            <div className="text-[12px] font-semibold text-rose-600 leading-snug">
              Bildirim izni telefon ayarlarından kapalı. Ayarlar &gt; Uygulamalar &gt; Mutlular Haber &gt; Bildirimler yolundan açabilirsiniz.
            </div>
          ) : (
            <>
              <div className="text-[13px] font-black text-neutral-900 leading-snug">Kesinti, vefat ve son dakika haberlerini kaçırma</div>
              <div className="text-[11.5px] text-neutral-600 mt-0.5">
                Üye olmana gerek yok. Bildirimleri aç, mahalleden haberler anında telefonuna gelsin.
              </div>
              <button
                type="button"
                onClick={ac}
                disabled={busy}
                className="mt-2 bg-neutral-900 disabled:opacity-60 text-white text-[12px] font-black rounded-lg px-3.5 py-2"
              >
                {busy ? 'İşleniyor…' : 'Bildirimleri aç'}
              </button>
            </>
          )}
        </div>
        <button type="button" onClick={kapat} aria-label="Kapat" className="text-neutral-400 p-1 -m-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
