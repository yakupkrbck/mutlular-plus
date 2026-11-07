import React, { useState } from 'react';
import { Check, Loader2, Vote } from 'lucide-react';
import type { PollItem } from '../types';
import { formatPollEnd, isPollOpen, pollResults, timeLeftText } from '../services/pollService';

/** Seçenek başına oy çubukları (anket kartında ve yönetim panelinde ortak). */
export const PollResultBars: React.FC<{ poll: PollItem; mine?: string[]; dark?: boolean }> = ({ poll, mine = [], dark }) => (
  <div className="space-y-2" data-testid="poll-results">
    {pollResults(poll).map((r) => {
      const isMine = mine.includes(r.id);
      return (
        <div key={r.id}>
          <div className={`flex items-center justify-between gap-2 text-[12px] font-semibold ${dark ? 'text-neutral-200' : 'text-neutral-800'}`}>
            <span className="flex items-center gap-1 min-w-0">
              {isMine && <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" aria-label="Sizin oyunuz" />}
              <span className="truncate">{r.text}</span>
            </span>
            <span className="shrink-0 tabular-nums">
              %{r.percent} <span className={dark ? 'text-neutral-500 font-normal' : 'text-neutral-400 font-normal'}>({r.count})</span>
            </span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden mt-1 ${dark ? 'bg-neutral-700' : 'bg-neutral-100'}`}>
            <div
              className={`h-full rounded-full transition-all ${isMine ? 'bg-rose-600' : dark ? 'bg-neutral-400' : 'bg-rose-300'}`}
              style={{ width: `${r.percent}%` }}
            />
          </div>
        </div>
      );
    })}
  </div>
);

interface PollCardProps {
  poll: PollItem;
  /** Giriş yapan kişinin bu ankette seçtikleri (oy vermediyse undefined) */
  myVote?: string[];
  /** true dönerse oy kaydedildi; false: işlem yapılmadı (ör. giriş penceresi açıldı) */
  onVote: (pollId: string, optionIds: string[]) => Promise<boolean>;
  highlight?: boolean;
  /** Aynı anket sayfada iki yerde görünebildiği için (ana sayfa + liste) kimlik öneki bağlama göre verilir */
  idPrefix?: string;
}

export const PollCard: React.FC<PollCardProps> = ({ poll, myVote, onVote, highlight, idPrefix = 'poll' }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justVoted, setJustVoted] = useState<string[] | null>(null);

  const open = isPollOpen(poll);
  const voted = myVote ?? justVoted ?? undefined;
  const showResults = !!voted || !open;
  const max = poll.allowMultiple ? Math.max(1, poll.maxChoices || poll.options.length) : 1;

  const toggle = (id: string) => {
    setError(null);
    if (max === 1) {
      setSelected([id]);
      return;
    }
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= max) return prev;
      return [...prev, id];
    });
  };

  const submit = async () => {
    if (!selected.length || busy) return;
    setBusy(true);
    setError(null);
    try {
      const ok = await onVote(poll.id, selected);
      if (ok) setJustVoted(selected);
    } catch (e: any) {
      setError(e?.message || 'Oy kaydedilemedi.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      id={`${idPrefix}-${poll.id}`}
      className={`bg-white rounded-2xl border p-4 space-y-3 shadow-2xs ${highlight ? 'border-rose-400 ring-2 ring-rose-200' : 'border-neutral-200'}`}
      aria-label="Mahalle anketi"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-[10px] font-black tracking-wider text-rose-600 uppercase">
          <Vote className="w-3.5 h-3.5" />
          Mahalle Anketi
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${open ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
          {open ? (poll.endsAtMs ? timeLeftText(poll.endsAtMs) : 'Devam ediyor') : 'Sona erdi'}
        </span>
      </div>

      <div>
        <h3 className="text-[15px] font-black text-neutral-900 leading-snug">{poll.question}</h3>
        {poll.description && <p className="text-[12px] text-neutral-500 mt-1 leading-relaxed">{poll.description}</p>}
      </div>

      {showResults ? (
        <>
          <PollResultBars poll={poll} mine={voted} />
          <p className="text-[11px] text-neutral-400">
            {poll.totalVotes} kişi oy kullandı
            {poll.allowMultiple ? ' • birden fazla seçenek işaretlenebildi' : ''}
            {poll.endsAtMs ? ` • Bitiş: ${formatPollEnd(poll.endsAtMs)}` : ''}
          </p>
        </>
      ) : (
        <>
          <div className="space-y-1.5" role={max === 1 ? 'radiogroup' : 'group'}>
            {poll.options.map((o) => {
              const on = selected.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  role={max === 1 ? 'radio' : 'checkbox'}
                  aria-checked={on}
                  onClick={() => toggle(o.id)}
                  className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-[13px] font-semibold transition ${
                    on ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-neutral-200 hover:border-neutral-300 text-neutral-800'
                  }`}
                >
                  <span
                    className={`w-4 h-4 shrink-0 border-2 flex items-center justify-center ${max === 1 ? 'rounded-full' : 'rounded'} ${
                      on ? 'border-rose-600 bg-rose-600' : 'border-neutral-300'
                    }`}
                  >
                    {on && <Check className="w-3 h-3 text-white" />}
                  </span>
                  {o.text}
                </button>
              );
            })}
          </div>
          {max > 1 && <p className="text-[11px] text-neutral-400">En fazla {max} seçenek işaretleyebilirsiniz.</p>}
          {error && <p className="text-[12px] text-rose-600 font-semibold">{error}</p>}
          <button
            type="button"
            onClick={submit}
            disabled={!selected.length || busy}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-[13px] font-bold flex items-center justify-center gap-1.5 transition"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {busy ? 'Kaydediliyor…' : 'Oy Ver'}
          </button>
          <p className="text-[10.5px] text-neutral-400 text-center">Her kişi bir kez oy verebilir; oy değiştirilemez.</p>
        </>
      )}
    </section>
  );
};
