import React from 'react';
import { ChevronRight, Bus, CreditCard, ExternalLink, Stethoscope, Zap, Droplets } from 'lucide-react';

interface CityServicesProps {
  onOpenBelediye: () => void;
  onOpenEmergency: () => void;
  onOpenPrayers: () => void;
  onOpenMuhtar: () => void;
  onOpenBus?: () => void;
  onOpenSaglikOcagi?: () => void;
  onOpenKesintiler?: () => void;
}

export const CityServices: React.FC<CityServicesProps> = ({
  onOpenBelediye,
  onOpenEmergency,
  onOpenPrayers,
  onOpenMuhtar,
  onOpenBus,
  onOpenSaglikOcagi,
  onOpenKesintiler,
}) => {
  return (
    <div className="px-3 py-2">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-4 bg-rose-600 rounded-full" />
          <h2 className="text-[15px] font-black tracking-tight text-neutral-900">
            ŞEHİR HİZMETLERİ
          </h2>
        </div>
        <button
          onClick={onOpenMuhtar}
          className="text-[12px] font-bold text-neutral-600 hover:text-rose-600 flex items-center gap-0.5 transition"
        >
          <span>Muhtar & Talep</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3 Large Square Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* E-Belediye (Bursa Osmangazi Belediyesi) */}
        <div
          onClick={onOpenBelediye}
          className="bg-white rounded-2xl border border-neutral-200/80 p-2.5 flex flex-col items-center justify-center text-center shadow-xs cursor-pointer active:scale-95 transition group"
        >
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#0369a1] flex flex-col items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" />
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[6.5px] font-black uppercase tracking-tight mt-0.5">OSMANGAZİ</span>
          </div>
          <span className="text-[11px] font-bold text-neutral-800 mt-2 tracking-tight leading-tight">
            Osmangazi E-Belediye
          </span>
        </div>

        {/* Acil Numaralar (112) */}
        <div
          onClick={onOpenEmergency}
          className="bg-white rounded-2xl border border-neutral-200/80 p-2.5 flex flex-col items-center justify-center text-center shadow-xs cursor-pointer active:scale-95 transition group"
        >
          <div className="w-14 h-14 rounded-xl bg-[#be123c] flex flex-col items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <span className="text-[18px] font-black tracking-tighter leading-none">112</span>
            <span className="text-[7px] font-bold uppercase tracking-wider mt-0.5 bg-white/20 px-1 rounded">ACİL ÇAĞRI</span>
          </div>
          <span className="text-[12px] font-bold text-neutral-800 mt-2 tracking-tight">
            Acil Numaralar
          </span>
        </div>

        {/* Namaz Vakitleri */}
        <div
          onClick={onOpenPrayers}
          className="bg-white rounded-2xl border border-neutral-200/80 p-2.5 flex flex-col items-center justify-center text-center shadow-xs cursor-pointer active:scale-95 transition group"
        >
          <div className="w-14 h-14 rounded-xl bg-[#881337] flex flex-col items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
              <path d="M12 2C12 2 10 5 10 7C10 8.1 10.9 9 12 9C13.1 9 14 8.1 14 7C14 5 12 2 12 2ZM4 10C3.45 10 3 10.45 3 11V21C3 21.55 3.45 22 4 22H20C20.55 22 21 21.55 21 21V11C21 10.45 20.55 10 20 10H4ZM12 11C13.66 11 15 12.34 15 14V20H9V14C9 12.34 10.34 11 12 11Z" />
            </svg>
          </div>
          <span className="text-[12px] font-bold text-neutral-800 mt-2 tracking-tight">
            Namaz Vakitleri
          </span>
        </div>
      </div>

      {/* Burulaş & Bursakart Hızlı Erişim Şeridi */}
      {onOpenBus && (
        <div
          onClick={onOpenBus}
          className="mt-2.5 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-2xl p-2.5 sm:p-3 flex items-center justify-between cursor-pointer hover:shadow-md active:scale-98 transition shadow-xs border border-blue-800/80 group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/90 border border-blue-400/40 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Bus className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[12.5px] font-black leading-tight text-white">
                  Burulaş & Bursakart
                </span>
                <span className="bg-amber-400 text-neutral-950 font-black text-[8px] px-1.5 py-0.2 rounded uppercase">
                  Canlı
                </span>
              </div>
              <span className="text-[10px] text-blue-200 block mt-0.5 font-medium">
                Bakiye Sorgula • Dolum • Otobüs Nerede?
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-blue-300 text-xs font-bold">
            <span className="text-[10px] hidden xs:inline">Aç</span>
            <ChevronRight className="w-4 h-4 text-blue-300 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      )}

      {/* Sağlık Ocağı (ASM) & Aile Hekimi Hızlı Erişim Şeridi */}
      {onOpenSaglikOcagi && (
        <div
          onClick={onOpenSaglikOcagi}
          className="mt-2 bg-gradient-to-r from-teal-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-2.5 sm:p-3 flex items-center justify-between cursor-pointer hover:shadow-md active:scale-98 transition shadow-xs border border-teal-800/80 group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-600/90 border border-teal-400/40 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Stethoscope className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[12.5px] font-black leading-tight text-white">
                  50 No'lu Mehmet Akif Aile Sağlığı Merkezi
                </span>
                <span className="bg-emerald-400 text-teal-950 font-black text-[8px] px-1.5 py-0.2 rounded uppercase">
                  Mutlular ASM
                </span>
              </div>
              <span className="text-[10px] text-teal-200 block mt-0.5 font-medium">
                Sağlık Raporu • Çukurca Yolu Cd. • Tahlil • Aşı • MHRS
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-teal-200 text-xs font-bold">
            <span className="text-[10px] hidden xs:inline">Rapor & Bilgi</span>
            <ChevronRight className="w-4 h-4 text-teal-300 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      )}

      {/* BUSKİ & UEDAŞ Kesinti Takibi Hızlı Erişim Şeridi */}
      {onOpenKesintiler && (
        <div
          onClick={onOpenKesintiler}
          className="mt-2 bg-gradient-to-r from-amber-950 via-slate-900 to-sky-950 text-white rounded-2xl p-2.5 sm:p-3 flex items-center justify-between cursor-pointer hover:shadow-md active:scale-98 transition shadow-xs border border-amber-900/50 group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-sky-500 p-0.5 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center gap-0.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <Droplets className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[12.5px] font-black leading-tight text-white">
                  Mehmet Akif, Çukurca & Çeltik Kesinti Takibi
                </span>
                <span className="bg-amber-400 text-neutral-950 font-black text-[8px] px-1.5 py-0.2 rounded uppercase">
                  Canlı API
                </span>
              </div>
              <span className="text-[10px] text-slate-300 block mt-0.5 font-medium">
                BUSKİ & UEDAŞ Canlı Takip • Osmangazi • Alo 185 / 186
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-amber-300 text-xs font-bold">
            <span className="text-[10px] hidden xs:inline">Sorgula</span>
            <ChevronRight className="w-4 h-4 text-amber-300 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      )}
    </div>
  );
};
