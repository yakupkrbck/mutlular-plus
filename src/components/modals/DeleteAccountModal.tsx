import React, { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { accountNeedsPassword, deleteMyAccount, authErrorMessage } from '../../services/authService';
import { unregisterPush } from '../../services/pushService';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose, onDeleted }) => {
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;
  const needsPassword = accountNeedsPassword();
  const ready = confirmText.trim().toLocaleUpperCase('tr-TR') === 'SİL' && (!needsPassword || password.length > 0);

  const handleDelete = async () => {
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    try {
      // Bu cihazı kişiye özel bildirim konularından çıkar (hesap silinmeden önce)
      await unregisterPush().catch(() => {});
      await deleteMyAccount(needsPassword ? password : undefined);
      setConfirmText('');
      setPassword('');
      onDeleted();
    } catch (e: any) {
      setError(e?.code ? authErrorMessage(e) : e?.message || 'Hesap silinemedi. Lütfen tekrar deneyin.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 flex items-end sm:items-center justify-center p-3" role="dialog" aria-modal="true">
      <div className="bg-white w-full max-w-md rounded-3xl p-5 space-y-3.5 shadow-2xl" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="font-black text-[15px] leading-tight">Hesabı kalıcı olarak sil</h3>
          </div>
          <button onClick={onClose} disabled={busy} className="p-1 text-neutral-400 hover:text-neutral-700" aria-label="Kapat">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-[12px] text-neutral-600 leading-relaxed space-y-1.5">
          <p>Bu işlem <b>geri alınamaz</b>. Şunlar silinir:</p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Profiliniz ve hesabınız</li>
            <li>Verdiğiniz ilanlar, iş ilanları ve başvurularınız</li>
            <li>İşletme / esnaf kayıtlarınız ve hikayeleriniz</li>
            <li>Hizmet talepleriniz, haber ihbarlarınız ve muhtarlık başvurularınız</li>
            <li>Bildirim geçmişiniz</li>
          </ul>
          <p>Başkalarının ilanlarına yazdığınız teklifler ve yorumlar anonimleşerek kalabilir.</p>
        </div>

        {needsPassword && (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifrenizi girin"
            autoComplete="current-password"
            className="w-full border border-neutral-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-500"
          />
        )}
        <div>
          <label className="text-[11px] font-bold text-neutral-500 block mb-1">Onaylamak için SİL yazın</label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="SİL"
            autoCapitalize="characters"
            className="w-full border border-neutral-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-500"
          />
        </div>

        {error && <p className="text-[12px] text-rose-600 font-semibold">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} disabled={busy} className="flex-1 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-bold">
            Vazgeç
          </button>
          <button
            onClick={handleDelete}
            disabled={!ready || busy}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-sm font-bold flex items-center justify-center gap-1.5"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {busy ? 'Siliniyor…' : 'Hesabımı sil'}
          </button>
        </div>
      </div>
    </div>
  );
};
