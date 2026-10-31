import React, { useState } from 'react';
import { Bell, MapPin, Check, X } from 'lucide-react';
import { enablePush, PushResult } from '../../services/pushService';
import { requestLocation } from '../../services/locationService';

interface PermissionPromptProps {
  isOpen: boolean;
  /** Bildirim izni istenmeli mi */
  needNotif: boolean;
  /** Konum izni istenmeli mi */
  needLoc: boolean;
  onClose: () => void;
}

type Status = 'idle' | 'busy' | 'ok' | 'denied' | 'unsupported' | 'error';

const DISMISS_KEY = 'mp_perm_dismissed_at';

const notifMessage = (r: PushResult): { status: Status; text: string } => {
  if (r.ok) return { status: 'ok', text: 'Bildirimler açıldı.' };
  switch (r.reason) {
    case 'denied':
      return { status: 'denied', text: 'İzin verilmedi. Tarayıcı/telefon ayarlarından sonradan açabilirsiniz.' };
    case 'dismissed':
      return { status: 'idle', text: 'İzin penceresi kapatıldı. Tekrar deneyebilirsiniz.' };
    case 'unsupported':
      return { status: 'unsupported', text: 'Bu tarayıcı bildirimleri desteklemiyor.' };
    case 'not_configured':
      return { status: 'error', text: 'Bildirim altyapısı henüz hazır değil.' };
    default:
      return { status: 'error', text: `Bildirim kaydı yapılamadı${r.detail ? ` (${r.detail})` : ''}.` };
  }
};

export const PermissionPrompt: React.FC<PermissionPromptProps> = ({ isOpen, needNotif, needLoc, onClose }) => {
  const [notif, setNotif] = useState<{ status: Status; text?: string }>({ status: 'idle' });
  const [loc, setLoc] = useState<{ status: Status; text?: string }>({ status: 'idle' });

  if (!isOpen) return null;

  const askNotif = async () => {
    setNotif({ status: 'busy' });
    const r = await enablePush();
    setNotif(notifMessage(r));
  };

  const askLoc = async () => {
    setLoc({ status: 'busy' });
    const r = await requestLocation();
    if (r.ok) setLoc({ status: 'ok', text: 'Konum alındı.' });
    else if ((r as { reason?: string }).reason === 'denied') setLoc({ status: 'denied', text: 'İzin verilmedi. Ayarlardan sonradan açabilirsiniz.' });
    else setLoc({ status: 'error', text: 'Konum şu an alınamadı.' });
  };

  const later = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    onClose();
  };

  const allDone =
    (!needNotif || notif.status === 'ok' || notif.status === 'denied' || notif.status === 'unsupported') &&
    (!needLoc || loc.status === 'ok' || loc.status === 'denied');

  const row = (
    icon: React.ReactNode,
    title: string,
    desc: string,
    st: { status: Status; text?: string },
    action: () => void,
    label: string
  ) => (
    <div className="rounded-2xl border border-neutral-200 p-3.5 space-y-2">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">{icon}</div>
        <div className="min-w-0">
          <h4 className="text-[13px] font-black text-neutral-900">{title}</h4>
          <p className="text-[11.5px] text-neutral-600 leading-snug mt-0.5">{desc}</p>
        </div>
      </div>
      {st.status === 'ok' ? (
        <div className="flex items-center gap-1.5 text-[12px] font-black text-emerald-700">
          <Check className="w-4 h-4" /> {st.text}
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={action}
            disabled={st.status === 'busy'}
            className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:opacity-60 text-white text-[12.5px] font-black rounded-xl py-2.5"
          >
            {st.status === 'busy' ? 'İşleniyor…' : label}
          </button>
          {st.text && <p className="text-[11px] font-semibold text-rose-600">{st.text}</p>}
        </>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[350] bg-black/55 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-3 max-h-[92vh] overflow-y-auto"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-[16px] font-black text-neutral-900">Hoş geldiniz!</h3>
            <p className="text-[12px] text-neutral-500 mt-0.5">Mahalleden haber almak için iki izin isteyeceğiz.</p>
          </div>
          <button type="button" onClick={later} aria-label="Kapat" className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
            <X className="w-4 h-4 text-neutral-600" />
          </button>
        </div>

        {needNotif &&
          row(
            <Bell className="w-4.5 h-4.5" />,
            'Bildirimler',
            'Mahalle duyuruları, son dakika haberleri, taziye ve usta teklifleri uygulama kapalıyken de telefonunuza gelsin.',
            notif,
            askNotif,
            'Bildirimlere İzin Ver'
          )}

        {needLoc &&
          row(
            <MapPin className="w-4.5 h-4.5" />,
            'Konum',
            'Size en yakın nöbetçi eczaneyi ve mahalledeki kesintileri gösterebilmemiz için. Konumunuz yalnızca bu cihazda kalır, sunucuya gönderilmez.',
            loc,
            askLoc,
            'Konumumu Paylaş'
          )}

        <div className="pt-1">
          {allDone ? (
            <button type="button" onClick={onClose} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-black rounded-xl py-3">
              Tamam
            </button>
          ) : (
            <button type="button" onClick={later} className="w-full text-[12px] font-bold text-neutral-500 py-2">
              Şimdi değil
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
