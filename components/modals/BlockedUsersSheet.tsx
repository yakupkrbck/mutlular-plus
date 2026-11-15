import React from 'react';
import { UserX, X } from 'lucide-react';
import { unblockUser, useBlockedUsers } from '../../services/reportService';

interface BlockedUsersSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Engellenen kullanıcılar listesi; buradan engel kaldırılır. */
export const BlockedUsersSheet: React.FC<BlockedUsersSheetProps> = ({ isOpen, onClose }) => {
  const liste = useBlockedUsers();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[90] bg-black/60 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[80vh] overflow-y-auto"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 text-neutral-900 font-black text-[15px]">
            <UserX className="w-4 h-4 text-neutral-700" />
            <span>Engellenen kullanıcılar</span>
          </div>
          <button type="button" aria-label="Kapat" onClick={onClose} className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-4 pb-4 space-y-2">
          {liste.length === 0 ? (
            <p className="text-[12px] text-neutral-500 py-6 text-center">Engellediğiniz kimse yok. Bir içeriği bildirirken kullanıcıyı da engelleyebilirsiniz.</p>
          ) : (
            liste.map((b) => (
              <div key={b.uid} className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-neutral-200">
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-neutral-900 truncate">{b.name || 'Kullanıcı'}</div>
                  <div className="text-[10px] text-neutral-400">{b.createdAtMs ? new Date(b.createdAtMs).toLocaleDateString('tr-TR') : ''}</div>
                </div>
                <button
                  type="button"
                  onClick={() => unblockUser(b.uid).catch(() => {})}
                  className="shrink-0 text-[11.5px] font-black text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-lg px-2.5 py-1"
                >
                  Engeli kaldır
                </button>
              </div>
            ))
          )}
          <p className="text-[10.5px] text-neutral-400 pt-1">Engellediğiniz kişilerin yorum, ilan ve iş ilanları size gösterilmez.</p>
        </div>
      </div>
    </div>
  );
};
