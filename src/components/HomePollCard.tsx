import React from 'react';
import type { PollItem } from '../types';
import { isPollOpen } from '../services/pollService';
import { PollCard } from './PollCard';

interface HomePollCardProps {
  polls: PollItem[];
  myVotes: Record<string, string[]>;
  onVote: (pollId: string, optionIds: string[]) => Promise<boolean>;
  onOpenAll: () => void;
}

/** Ana sayfada en yeni açık anketi gösterir; hiç açık anket yoksa yalnızca eski sonuçlara kısayol sunar. */
export const HomePollCard: React.FC<HomePollCardProps> = ({ polls, myVotes, onVote, onOpenAll }) => {
  if (!polls.length) return null;
  const latestOpen = polls.find((p) => isPollOpen(p));
  return (
    <div className="px-3 space-y-1.5">
      {latestOpen && <PollCard poll={latestOpen} myVote={myVotes[latestOpen.id]} onVote={onVote} />}
      <button
        type="button"
        onClick={onOpenAll}
        className="w-full py-2 rounded-full text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
      >
        {latestOpen ? `Tüm anketler (${polls.length})` : `Anket sonuçlarını gör (${polls.length})`}
      </button>
    </div>
  );
};
