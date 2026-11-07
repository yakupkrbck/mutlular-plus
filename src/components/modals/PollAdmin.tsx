import React, { useState } from 'react';
import { Plus, X, Trash2, Loader2 } from 'lucide-react';
import type { PollItem } from '../../types';
import {
  MAX_POLL_OPTIONS,
  MIN_POLL_OPTIONS,
  createPoll,
  deletePoll,
  formatPollEnd,
  isPollOpen,
  setPollStatus,
} from '../../services/pollService';
import { PollResultBars } from '../PollCard';

interface PollAdminProps {
  polls: PollItem[];
  /** Anket yayınlandı; sendPush işaretliyse bildirim gönderilir */
  onPublished: (poll: PollItem, sendPush: boolean) => void;
  showToast: (msg: string) => void;
}

const inputCls =
  'w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 font-medium';

const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }> = ({ checked, onChange, label, hint }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="w-full flex items-center justify-between gap-3 text-left p-2.5 rounded-xl bg-neutral-900/70 border border-neutral-700 hover:border-neutral-500 transition"
  >
    <span className="min-w-0">
      <span className="block text-xs font-bold text-neutral-100">{label}</span>
      {hint && <span className="block text-[10.5px] text-neutral-400 mt-0.5 leading-snug">{hint}</span>}
    </span>
    <span className={`relative w-10 h-6 rounded-full shrink-0 transition ${checked ? 'bg-rose-600' : 'bg-neutral-600'}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`} />
    </span>
  </button>
);

export const PollAdmin: React.FC<PollAdminProps> = ({ polls, onPublished, showToast }) => {
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [maxChoices, setMaxChoices] = useState(2);
  const [endsAt, setEndsAt] = useState('');
  const [sendPush, setSendPush] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filled = options.filter((o) => o.trim()).length;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const endsAtMs = endsAt ? new Date(endsAt).getTime() : null;
      const poll = await createPoll({
        question,
        description,
        options,
        allowMultiple: allowMultiple && filled >= 3,
        maxChoices,
        endsAtMs: endsAtMs && !Number.isNaN(endsAtMs) ? endsAtMs : null,
      });
      onPublished(poll, sendPush);
      setQuestion('');
      setDescription('');
      setOptions(['', '']);
      setAllowMultiple(false);
      setMaxChoices(2);
      setEndsAt('');
      setSendPush(false);
      if (!sendPush) showToast('✓ Anket yayınlandı!');
    } catch (err: any) {
      setError(err?.message || 'Anket yayınlanamadı.');
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async (p: PollItem) => {
    try {
      await setPollStatus(p.id, isPollOpen(p) ? 'closed' : 'active');
      showToast(isPollOpen(p) ? '✓ Anket kapatıldı.' : '✓ Anket yeniden açıldı.');
    } catch {
      showToast('İşlem yapılamadı. Yetkinizi ve bağlantınızı kontrol edin.');
    }
  };

  const remove = async (p: PollItem) => {
    if (!window.confirm(`"${p.question}" anketi ve sonuçları silinsin mi? Bu işlem geri alınamaz.`)) return;
    try {
      await deletePoll(p.id);
      showToast('✓ Anket silindi.');
    } catch {
      showToast('Anket silinemedi.');
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="p-4 bg-neutral-800/60 rounded-2xl border border-neutral-700 space-y-3">
        <h3 className="text-[13px] font-black text-white">Yeni Anket Oluştur</h3>
        <div>
          <input type="text" value={question} maxLength={160} onChange={(e) => setQuestion(e.target.value)} placeholder="Anket sorusu *" className={inputCls} />
          <div className="text-right text-[9.5px] text-neutral-500 mt-0.5">{question.length}/160</div>
        </div>
        <textarea rows={2} value={description} maxLength={300} onChange={(e) => setDescription(e.target.value)} placeholder="Açıklama (isteğe bağlı)" className={inputCls} />

        <div className="space-y-1.5">
          <div className="text-[10px] text-neutral-400 uppercase font-bold">Seçenekler ({MIN_POLL_OPTIONS}–{MAX_POLL_OPTIONS})</div>
          {options.map((o, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input
                type="text"
                value={o}
                maxLength={80}
                onChange={(e) => setOptions((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
                placeholder={`Seçenek ${i + 1}`}
                className={inputCls}
              />
              {options.length > MIN_POLL_OPTIONS && (
                <button
                  type="button"
                  onClick={() => setOptions((prev) => prev.filter((_, j) => j !== i))}
                  className="p-2 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-neutral-200 shrink-0"
                  aria-label={`Seçenek ${i + 1} sil`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          {options.length < MAX_POLL_OPTIONS && (
            <button
              type="button"
              onClick={() => setOptions((prev) => [...prev, ''])}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-dashed border-neutral-600 text-neutral-300 hover:text-white hover:border-neutral-400 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Seçenek ekle
            </button>
          )}
        </div>

        {filled >= 3 && (
          <div className="space-y-1.5">
            <Switch checked={allowMultiple} onChange={setAllowMultiple} label="Birden fazla seçenek işaretlenebilsin" />
            {allowMultiple && (
              <label className="flex items-center gap-2 text-[11px] text-neutral-300 font-semibold">
                En fazla
                <select value={maxChoices} onChange={(e) => setMaxChoices(Number(e.target.value))} className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white">
                  {Array.from({ length: filled - 1 }, (_, k) => k + 2).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                seçenek
              </label>
            )}
          </div>
        )}

        <div>
          <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">Bitiş zamanı (isteğe bağlı)</label>
          <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className={inputCls} />
          <p className="text-[10.5px] text-neutral-500 mt-0.5">Boş bırakırsanız anket siz kapatana kadar açık kalır.</p>
        </div>

        <Switch checked={sendPush} onChange={setSendPush} label="Yayınlanınca bildirim gönder" hint="Tüm cihazlara bildirim gider; dokunan anketi açar." />

        {error && <p className="text-[11px] text-rose-300 font-semibold">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          Anketi Yayınla
        </button>
      </form>

      <div className="space-y-2.5">
        <h3 className="text-[13px] font-black text-white">Tüm Anketler ({polls.length})</h3>
        {polls.length === 0 && <p className="text-xs text-neutral-500">Henüz anket oluşturulmadı.</p>}
        {polls.map((p) => {
          const open = isPollOpen(p);
          return (
            <div key={p.id} className="p-3 bg-neutral-800/60 rounded-xl border border-neutral-700 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white leading-snug">{p.question}</div>
                  <div className="text-[10.5px] text-neutral-400">
                    {p.totalVotes} oy{p.endsAtMs ? ` • Bitiş: ${formatPollEnd(p.endsAtMs)}` : ''}
                  </div>
                </div>
                <span className={`shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded ${open ? 'bg-emerald-600 text-white' : 'bg-neutral-600 text-neutral-200'}`}>
                  {open ? 'AÇIK' : 'KAPALI'}
                </span>
              </div>
              <PollResultBars poll={p} dark />
              <div className="flex gap-2">
                <button type="button" onClick={() => toggleStatus(p)} className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-neutral-100 text-xs font-bold py-2 rounded-xl">
                  {open ? 'Anketi kapat' : 'Yeniden aç'}
                </button>
                <button type="button" onClick={() => remove(p)} className="px-3 bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-bold py-2 rounded-xl flex items-center gap-1" aria-label="Anketi sil">
                  <Trash2 className="w-3.5 h-3.5" />
                  Sil
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
