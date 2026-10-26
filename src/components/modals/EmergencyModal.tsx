import React from 'react';
import { X, PhoneCall, ShieldAlert, AlertTriangle } from 'lucide-react';
import { EMERGENCY_NUMBERS } from '../../data/cityServicesData';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-4 relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              112
            </div>
            <div>
              <h3 className="text-[14px] font-black text-neutral-900 leading-tight">
                Acil Çağrı & Önemli Numaralar
              </h3>
              <p className="text-[10px] text-neutral-500 font-semibold">
                Mutlular 7/24 Acil Hizmetleri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 112 Banner */}
        <div className="my-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center">
          <div className="text-3xl font-black text-rose-700 leading-none">
            112
          </div>
          <p className="text-[11px] font-bold text-rose-800 mt-1">
            Ambulans, Polis, İtfaiye ve Jandarma tek hatta toplandı.
          </p>
          <a
            href="tel:112"
            className="mt-2.5 inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-[12px] px-4 py-2 rounded-xl transition shadow-xs"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>112&apos;yi Hemen Ara</span>
          </a>
        </div>

        {/* Other Emergency list */}
        <div className="space-y-2 overflow-y-auto py-1">
          {EMERGENCY_NUMBERS.slice(1).map((em, idx) => (
            <div
              key={idx}
              className="bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-2xs"
            >
              <div className="flex-1">
                <div className="font-extrabold text-[12px] text-neutral-900">
                  {em.name}
                </div>
                <div className="text-[10px] text-neutral-500 leading-tight">
                  {em.desc}
                </div>
              </div>

              <a
                href={`tel:${em.number}`}
                className="bg-white hover:bg-neutral-100 border border-neutral-300 font-bold text-neutral-800 text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0"
              >
                <PhoneCall className="w-3 h-3 text-rose-600" />
                <span>{em.number}</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
