import React from 'react';
import {
  Flame,
  ChevronRight,
  UtensilsCrossed,
  Wrench,
  Bus,
  Store,
  Building2,
  Car,
  Briefcase,
  HeartCrack,
  Stethoscope,
  Zap,
  Droplets,
} from 'lucide-react';
import { PopularService } from '../types';

interface PopularServicesProps {
  services: PopularService[];
  onSelectService: (service: PopularService) => void;
  onViewAll?: () => void;
}

interface ServiceVisualConfig {
  logo: React.ReactNode;
  bgGradient: string;
  shadowColor: string;
  borderAccent: string;
  subTitle: string;
  badge?: string;
  badgeTone?: string;
}

const SERVICE_CONFIGS: Record<string, ServiceVisualConfig> = {
  yemek: {
    logo: <UtensilsCrossed className="w-5 h-5 text-white stroke-[2.4]" />,
    bgGradient: 'from-amber-500 via-orange-500 to-rose-500',
    shadowColor: 'shadow-orange-500/30',
    borderAccent: 'group-hover:border-orange-300',
    subTitle: 'Sipariş & Menü',
    badge: 'Öne Çıkan',
    badgeTone: 'bg-amber-50 text-amber-700 border-amber-200/80',
  },
  hizmet: {
    logo: <Wrench className="w-5 h-5 text-white stroke-[2.4]" />,
    bgGradient: 'from-blue-600 via-indigo-600 to-blue-700',
    shadowColor: 'shadow-blue-500/30',
    borderAccent: 'group-hover:border-blue-300',
    subTitle: 'Usta & Tamir',
  },
  ulasim: {
    logo: <Bus className="w-5 h-5 text-white stroke-[2.4]" />,
    bgGradient: 'from-emerald-500 via-teal-600 to-emerald-700',
    shadowColor: 'shadow-emerald-500/30',
    borderAccent: 'group-hover:border-emerald-300',
    subTitle: 'Hat & Sefer',
    badge: 'BURULAŞ',
    badgeTone: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  },
  esnaf: {
    logo: <Store className="w-5 h-5 text-white stroke-[2.4]" />,
    bgGradient: 'from-purple-600 via-violet-600 to-fuchsia-600',
    shadowColor: 'shadow-purple-500/30',
    borderAccent: 'group-hover:border-purple-300',
    subTitle: 'Çarşı & Pazar',
  },
  eczane: {
    logo: (
      <div className="flex items-center justify-center font-black text-white text-xl tracking-tighter leading-none select-none">
        E
      </div>
    ),
    bgGradient: 'from-rose-600 via-red-600 to-rose-700',
    shadowColor: 'shadow-red-500/35',
    borderAccent: 'group-hover:border-rose-300',
    subTitle: '7/24 Nöbetçi',
    badge: 'NÖBETÇİ',
    badgeTone: 'bg-rose-50 text-rose-700 border-rose-200/80',
  },
  saglik: {
    logo: <Stethoscope className="w-5 h-5 text-white stroke-[2.4]" />,
    bgGradient: 'from-teal-600 via-emerald-600 to-teal-700',
    shadowColor: 'shadow-teal-500/35',
    borderAccent: 'group-hover:border-teal-300',
    subTitle: 'Aile Hekimi & Rapor',
    badge: 'ASM',
    badgeTone: 'bg-teal-50 text-teal-700 border-teal-200/80',
  },
  kesinti: {
    logo: (
      <div className="flex items-center gap-0.5">
        <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
        <Droplets className="w-3.5 h-3.5 text-sky-200 fill-sky-200" />
      </div>
    ),
    bgGradient: 'from-amber-600 via-orange-600 to-sky-700',
    shadowColor: 'shadow-orange-500/35',
    borderAccent: 'group-hover:border-orange-300',
    subTitle: 'Mehmet Akif Su & Elektrik',
    badge: 'CANLI',
    badgeTone: 'bg-amber-50 text-amber-800 border-amber-300 font-extrabold',
  },
  emlak: {
    logo: <Building2 className="w-5 h-5 text-white stroke-[2.4]" />,
    bgGradient: 'from-sky-500 via-blue-600 to-indigo-600',
    shadowColor: 'shadow-sky-500/30',
    borderAccent: 'group-hover:border-sky-300',
    subTitle: 'Konut & Arsa',
  },
  vefat: {
    logo: <HeartCrack className="w-5 h-5 text-rose-300 stroke-[2.4]" />,
    bgGradient: 'from-neutral-900 via-neutral-800 to-rose-950',
    shadowColor: 'shadow-neutral-900/35',
    borderAccent: 'group-hover:border-rose-400',
    subTitle: 'Taziye & Defin',
    badge: 'VEFAT',
    badgeTone: 'bg-neutral-100 text-neutral-800 border-neutral-300',
  },
  vasita: {
    logo: <Car className="w-5 h-5 text-white stroke-[2.4]" />,
    bgGradient: 'from-red-500 via-rose-600 to-amber-600',
    shadowColor: 'shadow-rose-500/30',
    borderAccent: 'group-hover:border-rose-300',
    subTitle: 'Oto & Araç',
  },
  'is-ilanlari': {
    logo: <Briefcase className="w-5 h-5 text-white stroke-[2.4]" />,
    bgGradient: 'from-slate-700 via-neutral-800 to-zinc-900',
    shadowColor: 'shadow-neutral-900/30',
    borderAccent: 'group-hover:border-neutral-400',
    subTitle: 'İş & Kariyer',
  },
};

export const PopularServices: React.FC<PopularServicesProps> = ({
  services,
  onSelectService,
  onViewAll,
}) => {
  return (
    <div className="px-3 py-2">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
          <h2 className="text-[16px] font-black tracking-tight text-neutral-900">
            Popüler Hizmetler
          </h2>
        </div>
        <button
          onClick={onViewAll}
          className="text-[12px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-0.5 transition cursor-pointer"
        >
          <span>Tümünü Gör</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* 4x2 Logo Emblems Grid (Clean Logo Badges, Zero Photo Clutter) */}
      <div className="grid grid-cols-4 gap-2">
        {services.map((item) => {
          const config = SERVICE_CONFIGS[item.id] || {
            logo: <Store className="w-5 h-5 text-white stroke-[2.4]" />,
            bgGradient: 'from-neutral-700 to-neutral-900',
            shadowColor: 'shadow-neutral-900/20',
            borderAccent: 'group-hover:border-neutral-300',
            subTitle: 'Hizmet',
          };

          const isPharmacy = item.isPharmacy || item.id === 'eczane';
          const badgeText = config.badge || item.badge;

          return (
            <div
              key={item.id}
              onClick={() => onSelectService(item)}
              className={`group relative h-[94px] rounded-2xl bg-white border border-neutral-200/80 hover:border-neutral-300 p-2 flex flex-col items-center justify-between cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md active:scale-95 transition-all select-none overflow-hidden ${config.borderAccent}`}
            >
              {/* Top micro badge if present */}
              {badgeText && (
                <div
                  className={`absolute top-1 right-1 text-[7px] font-black uppercase px-1 py-0.2 rounded-md border flex items-center gap-0.5 tracking-tighter ${
                    config.badgeTone || 'bg-rose-50 text-rose-700 border-rose-200/80'
                  }`}
                >
                  {isPharmacy && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                  <span>{badgeText}</span>
                </div>
              )}

              {/* Service Brand Logo Emblem */}
              <div
                className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${config.bgGradient} flex items-center justify-center shadow-md ${config.shadowColor} group-hover:scale-105 transition-transform duration-200 shrink-0 mt-0.5`}
              >
                {config.logo}
              </div>

              {/* Service Titles */}
              <div className="w-full text-center mt-1">
                <span className="block text-[10.5px] font-black text-neutral-800 uppercase tracking-tight truncate leading-tight group-hover:text-rose-600 transition-colors">
                  {item.title}
                </span>
                <span className="block text-[8px] font-semibold text-neutral-400 tracking-tight leading-none truncate mt-0.5">
                  {config.subTitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
