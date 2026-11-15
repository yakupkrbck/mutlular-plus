import React, { useEffect, useState } from 'react';
import { Flag, X, CheckCircle2 } from 'lucide-react';
import { auth } from '../../firebase';
import {
  ALREADY_REPORTED,
  LOGIN_REQUIRED,
  REPORT_REASONS,
  TARGET_LABEL,
  blockUser,
  sendReport,
  type ReportTarget,
} from '../../services/reportService';

interface ReportSheetProps {
  /** null = kapalı */
  target: ReportTarget | null;
  onClose: () => void;
  /** Giriş yapılmamışsa çağrılır (varsa) */
  onRequireLogin?: () => void;
}

/** İçerik bildirme penceresi: neden seç, isteğe bağlı not, isteğe bağlı kullanıcıyı engelle. */
export const ReportSheet: React.FC<ReportSheetProps> = ({ target, onClose, onRequireLogin }) => {
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [note, setNote] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (target) {
      setReason(REPORT_REASONS[0]);
      setNote('');
      setAlsoBlock(false);
      setBusy(false);
      setError('');
      setDone(false);
    }
  }, [target?.type, target?.id]);

  if (!target) return null;

  const me = auth.currentUser;
  const canBlock = !!target.ownerUid && target.ownerUid !== me?.uid;

  const submit = async () => {
    if (busy) return;
    if (!me) {
      onClose();
      onRequireLogin?.();
      return;
    }
    setBusy(true);
    setError('');
    try {
      await sendReport(target, reason, note);
      if (alsoBlock && canBlock) await blockUser(target.ownerUid!, target.ownerName || '');
      setDone(true);
      setTimeout(onClose, 1600);
    } catch (e: any) {
      const m = e?.message;
      if (m === ALREADY_REPORTED) setError('Bu içeriği zaten bildirdiniz. İncelemeye alınacak.');
      else if (m === LOGIN_REQUIRED) setError('Bildirmek için giriş yapmalısınız.');
      else setError('Bildirim gönderilemedi. Bağlantınızı kontrol edip tekrar deneyin.');
      if (alsoBlock && m === ALREADY_REPORTED && canBlock) {
        try {
          await blockUser(target.ownerUid!, target.ownerName || '');
        } catch {}
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[88vh] overflow-y-auto"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 text-neutral-900 font-black text-[15px]">
            <Flag className="w-4 h-4 text-rose-600" />
            <span>{TARGET_LABEL[target.type]} bildir</span>
          </div>
          <button type="button" aria-label="Kapat" onClick={onClose} className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          <div className="px-4 pb-6 pt-3 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-[13px] font-black text-neutral-900">Bildiriminiz alındı</p>
            <p className="text-[11.5px] text-neutral-500">Yönetim ekibi içeriği inceleyecek. Teşekkür ederiz.</p>
          </div>
        ) : (
          <div className="px-4 pb-4 space-y-3">
            {target.title && (
              <p className="text-[11.5px] text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 line-clamp-3 break-words">“{target.title}”</p>
            )}
            <div className="space-y-1.5">
              <div className="text-[10.5px] font-black text-neutral-500 uppercase tracking-wide">Neden bildiriyorsunuz?</div>
              {REPORT_REASONS.map((r) => (
                <label key={r} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-[12.5px] font-bold cursor-pointer ${reason === r ? 'border-rose-500 bg-rose-50 text-rose-900' : 'border-neutral-200 text-neutral-700'}`}>
                  <input type="radio" name="report-reason" checked={reason === r} onChange={() => setReason(r)} className="accent-rose-600" />
                  <span>{r}</span>
                </label>
              ))}
            </div>
            <textarea
              value={note}
              maxLength={300}
              onChange={(e) => setNote(e.target.value)}
              placeholder="İsterseniz kısa bir not ekleyin (en fazla 300 karakter)"
              rows={2}
              className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-rose-500 resize-none"
            />
            {canBlock && (
              <label className="flex items-start gap-2.5 text-[12px] text-neutral-700 font-semibold cursor-pointer">
                <input type="checkbox" checked={alsoBlock} onChange={(e) => setAlsoBlock(e.target.checked)} className="mt-0.5 accent-rose-600" />
                <span>
                  Bu kullanıcıyı da engelle{target.ownerName ? ` (${target.ownerName})` : ''}. İçeriklerini artık görmem.
                </span>
              </label>
            )}
            {error && <p className="text-[11.5px] text-rose-600 font-semibold" role="alert">{error}</p>}
            <button
              type="button"
              disabled={busy}
              onClick={submit}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-black text-[13px] py-2.5 rounded-xl transition"
            >
              {busy ? 'Gönderiliyor…' : 'Bildir'}
            </button>
            <p className="text-[10.5px] text-neutral-400 text-center">Bildirimler gizli tutulur; içerik sahibi kimin bildirdiğini görmez.</p>
          </div>
        )}
      </div>
    </div>
  );
};
