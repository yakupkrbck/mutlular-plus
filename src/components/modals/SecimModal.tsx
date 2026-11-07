import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { SecimVeri } from '../../services/secimService';
import { SecimDashboard } from '../SecimDashboard';

export const SecimModal: React.FC<{ isOpen: boolean; onClose: () => void; veri: SecimVeri }> = ({ isOpen, onClose, veri }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col" role="dialog" aria-modal="true" aria-label="Muhtarlık seçimi sonuçları">
      <div className="bg-white border-b border-slate-200 flex items-center gap-2 px-3 pb-3" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center" aria-label="Geri">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="font-black text-[15px] text-slate-900">Seçim Sonuçları</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>
        <div className="max-w-xl mx-auto">
          <SecimDashboard veri={veri} />
        </div>
      </div>
    </div>
  );
};
