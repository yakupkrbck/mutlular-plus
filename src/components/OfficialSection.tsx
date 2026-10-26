import React, { useMemo } from 'react';
import {
  ChevronRight,
  Phone,
  Clock,
  MapPin,
  Send,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';

interface OfficialSectionProps {
  onOpenMuhtar?: () => void;
  onSelectItem?: (item: string) => void;
  onViewAll?: () => void;
}

export const OfficialSection: React.FC<OfficialSectionProps> = ({
  onOpenMuhtar,
}) => {
  // Çalışma saati kontrolü (canlı durum: Hafta içi 08:30 - 17:00)
  const isCurrentlyOpen = useMemo(() => {
    const now = new Date();
    const day = now.getDay(); // 0: Pazar, 6: Cumartesi
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentMinutes = hours * 60 + minutes;

    if (day === 0 || day === 6) return false;
    const isWorkingHours = currentMinutes >= 510 && currentMinutes < 1020;
    const isLunchBreak = currentMinutes >= 750 && currentMinutes < 810;
    return isWorkingHours && !isLunchBreak;
  }, []);

  return (
    <div className="px-3 py-2 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-4 bg-red-600 rounded-full" />
          <h2 className="text-[15px] font-black tracking-tight text-neutral-900">
            RESMİ & KURUMSAL
          </h2>
        </div>
        <button
          onClick={onOpenMuhtar}
          className="text-[12px] font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5 transition cursor-pointer"
        >
          <span>Muhtarlık Portalı</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* MEHMET AKİF MAHALLE MUHTARLIĞI RESMİ İLETİŞİM KARTI */}
      <div
        onClick={onOpenMuhtar}
        className="bg-gradient-to-br from-red-700 via-rose-700 to-red-800 rounded-3xl p-4 text-white shadow-md relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-99 group border border-red-600/50"
      >
        {/* Dekoratif Işık Efektleri */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -top-10 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black text-2xl shadow-inner border border-white/30 shrink-0 group-hover:scale-105 transition-transform">
              🏛️
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full border border-white/20">
                  T.C. Osmangazi
                </span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs ${
                    isCurrentlyOpen ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-neutral-900'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  {isCurrentlyOpen ? 'ŞU AN AÇIK' : 'MESAİ DIŞI'}
                </span>
              </div>
              <h3 className="text-base font-black text-white leading-tight mt-1 truncate">
                Mehmet Akif Mahalle Muhtarlığı
              </h3>
              <p className="text-[11.5px] text-rose-100 font-medium line-clamp-1 mt-0.5">
                Resmi iletişim, tebligat sorgulama, sokak arıza & online talep modülü
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white text-red-700 font-black text-xs px-3 py-1.5 rounded-xl shadow-xs shrink-0 group-hover:bg-rose-50 transition">
            <span>İncele</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>

        {/* Hızlı Bilgi & Aksiyon Rozetleri */}
        <div className="mt-3 pt-2.5 border-t border-white/20 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-rose-100 font-medium relative z-10">
          <div className="flex items-center gap-1.5 truncate">
            <Phone className="w-3.5 h-3.5 text-rose-200 shrink-0" />
            <span className="truncate">0224 246 16 16</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Clock className="w-3.5 h-3.5 text-rose-200 shrink-0" />
            <span className="truncate">Hafta içi 08:30 – 17:00</span>
          </div>
          <div className="flex items-center gap-1.5 truncate col-span-2 sm:col-span-1 justify-end text-white font-bold underline">
            <Send className="w-3 h-3 shrink-0" />
            <span>Muhtara Talep Bildir &rsaquo;</span>
          </div>
        </div>
      </div>
    </div>
  );
};
