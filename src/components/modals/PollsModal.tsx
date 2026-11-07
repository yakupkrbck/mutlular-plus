import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { PollItem } from '../../types';
import { isPollOpen } from '../../services/pollService';
import { PollCard } from '../PollCard';

interface PollsModalProps {
  isOpen: boolean;
  onClose: () => void;
  polls: PollItem[];
  myVotes: Record<string, string[]>;
  onVote: (pollId: string, optionIds: string[]) => Promise<boolean>;
  /** Bildirimden gelindiyse o anket öne çıkarılır */
  focusPollId?: string;
}

export const PollsModal: React.FC<PollsModalProps> = ({ isOpen, onClose, polls, myVotes, onVote, focusPollId }) => {
  useEffect(() => {
    if (!isOpen || !focusPollId) return;
    const t = setTimeout(() => document.getElementById(`polls-modal-${focusPollId}`)?.scrollIntoView?.({ block: 'center', behavior: 'smooth' }), 150);
    return () => clearTimeout(t);
  }, [isOpen, focusPollId, polls.length]);

  if (!isOpen) return null;
  const open = polls.filter((p) => isPollOpen(p));
  const closed = polls.filter((p) => !isPollOpen(p));

  return (
    <div className="fixed inset-0 z-50 bg-neutral-50 flex flex-col" role="dialog" aria-modal="true" aria-label="Mahalle anketleri">
      <div className="bg-white border-b border-neutral-200 flex items-center gap-2 px-3 pb-3" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center" aria-label="Geri">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="font-black text-[15px] text-neutral-900">Mahalle Anketleri</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>
        {polls.length === 0 && <p className="text-center text-sm text-neutral-500 pt-16">Henüz anket yok.</p>}
        {open.length > 0 && (
          <div className="space-y-3">
            <div className="text-[11px] font-black text-neutral-400 uppercase tracking-wider">Devam eden ({open.length})</div>
            {open.map((p) => (
              <PollCard key={p.id} poll={p} myVote={myVotes[p.id]} onVote={onVote} highlight={p.id === focusPollId} idPrefix="polls-modal" />
            ))}
          </div>
        )}
        {closed.length > 0 && (
          <div className="space-y-3">
            <div className="text-[11px] font-black text-neutral-400 uppercase tracking-wider">Sonuçlanan ({closed.length})</div>
            {closed.map((p) => (
              <PollCard key={p.id} poll={p} myVote={myVotes[p.id]} onVote={onVote} highlight={p.id === focusPollId} idPrefix="polls-modal" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
