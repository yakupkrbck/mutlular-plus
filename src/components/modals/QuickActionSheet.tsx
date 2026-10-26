import React from 'react';
import {
  X,
  Wrench,
  PlusCircle,
  Camera,
  HeartCrack,
  Mail,
  ChevronRight,
  PhoneCall,
  Store,
  Bus,
  Home,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface QuickActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onGoHome?: () => void;
  onOpenEmergency: () => void;
  onOpenQuoteWizard: () => void;
  onOpenMarketListing: () => void;
  onOpenNewsTip: () => void;
  onOpenPharmacy: () => void;
  onOpenBus: () => void;
  onOpenDavet: () => void;
  onOpenKursu?: () => void;
  onOpenBusinessRegister: () => void;
  onOpenCredit?: () => void;
  onOpenLiveStream?: () => void;
  onOpenCoupons?: () => void;
  onOpenAdmin?: () => void;
  onOpenVefat?: (tab?: 'vitrin' | 'ilan-ver') => void;
  onOpenBelediye?: () => void;
  onOpenSaglikOcagi?: () => void;
  onOpenKesintiler?: () => void;
  onOpenQrMenu?: () => void;
  onOpenMagazalar?: () => void;
  onOpenQrScanner?: () => void;
  onOpenExportCode?: () => void;
  userProfile?: UserProfile | null;
}

export const QuickActionSheet: React.FC<QuickActionSheetProps> = ({
  isOpen,
  onClose,
  onGoHome,
  onOpenEmergency,
  onOpenQuoteWizard,
  onOpenMarketListing,
  onOpenNewsTip,
  onOpenPharmacy,
  onOpenBus,
  onOpenDavet,
  onOpenBusinessRegister,
  onOpenAdmin,
  onOpenVefat,
  onOpenExportCode,
  userProfile,
}) => {
  if (!isOpen) return null;

  // 5 Ana Temel İşlem (Net ve Anlaşılır Tasarım)
  const primaryActions = [
    {
      id: 'hizmet',
      title: 'Hizmet İste',
      tag: 'USTA & TEKLİF AL',
      desc: 'Tesisatçı, elektrikçi, boyacı, nakliyat ve tüm ustalar için ücretsiz teklif iste',
      icon: Wrench,
      gradient: 'from-amber-500 to-orange-500 text-white',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
      borderHover: 'hover:border-amber-400 hover:shadow-amber-500/10',
      onClick: () => {
        onClose();
        onOpenQuoteWizard();
      },
    },
    {
      id: 'ilan',
      title: 'İlan Paylaş',
      tag: 'ÜCRETSİZ İLAN VER',
      desc: 'Satılık / kiralık konut, vasıta, tarla veya 2. el eşya ilanını anında yayına al',
      icon: PlusCircle,
      gradient: 'from-emerald-500 to-teal-600 text-white',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      borderHover: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
      onClick: () => {
        onClose();
        onOpenMarketListing();
      },
    },
    {
      id: 'ihbar',
      title: 'Haber İhbar',
      tag: 'FOTOĞRAF & HABER',
      desc: 'Mahalledeki sıcak gelişmeyi, fotoğraf veya videolu olayı editöre ilet',
      icon: Camera,
      gradient: 'from-rose-500 to-red-600 text-white',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
      borderHover: 'hover:border-rose-400 hover:shadow-rose-500/10',
      onClick: () => {
        onClose();
        onOpenNewsTip();
      },
    },
    {
      id: 'vefat',
      title: 'Vefat İlanı & MEBİS',
      tag: 'CENAZE & MEBİS DEFİN',
      desc: 'Vefat ilanları, Bursa BŞB MEBİS kabir & mezar sorgulama, taziye defteri',
      icon: HeartCrack,
      gradient: 'from-neutral-800 to-neutral-950 text-rose-400',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      borderHover: 'hover:border-emerald-600 hover:shadow-emerald-500/10',
      onClick: () => {
        onClose();
        if (onOpenVefat) onOpenVefat('vitrin');
      },
    },
    {
      id: 'davetiye',
      title: 'Davetiyeler Gir',
      tag: 'DÜĞÜN & CEMİYET',
      desc: 'Düğün, sünnet, nişan, kına veya açılış davetiyeni mahalleye duyur',
      icon: Mail,
      gradient: 'from-fuchsia-600 to-pink-600 text-white',
      badgeBg: 'bg-pink-100 text-pink-800 border-pink-200',
      borderHover: 'hover:border-pink-400 hover:shadow-pink-500/10',
      onClick: () => {
        onClose();
        onOpenDavet();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-300 border border-neutral-200">
        
        {/* Üst Başlık & Anasayfa Bildirimi */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-neutral-950 text-white flex items-center justify-center font-black text-base shadow-md ring-2 ring-rose-500/20">
              <span>M</span>
              <span className="text-rose-500 -ml-0.5">P</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-neutral-900 leading-tight">
                  MP Hızlı İşlemler
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Anasayfadasınız
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                Ne yapmak istiyorsunuz? Bir işlem seçin:
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 active:scale-95 flex items-center justify-center text-neutral-600 transition"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 5 Temel Net ve Anlaşılır İşlem Kartı Listesi */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2.5 flex-1">
          {primaryActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className={`w-full p-3 sm:p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs hover:shadow-md transition-all active:scale-[0.99] flex items-center gap-3.5 text-left group ${action.borderHover}`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm bg-gradient-to-br group-hover:scale-105 transition-transform ${action.gradient}`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-black text-neutral-900 tracking-tight group-hover:text-rose-600 transition-colors">
                      {action.title}
                    </span>
                    <span
                      className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${action.badgeBg}`}
                    >
                      {action.tag}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-neutral-600 leading-snug line-clamp-2 mt-0.5">
                    {action.desc}
                  </p>
                </div>

                <div className="w-8 h-8 rounded-full bg-neutral-100 group-hover:bg-rose-50 text-neutral-400 group-hover:text-rose-600 flex items-center justify-center shrink-0 transition">
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}

          {/* Proje Kodlarını İndir (.ZIP) Kartı */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenExportCode) {
                onOpenExportCode();
              } else {
                window.location.href = '/mutlular-plus-kaynak-kodlar.zip';
              }
            }}
            className="w-full p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/60 border border-emerald-300 shadow-2xs hover:shadow-md transition-all active:scale-[0.99] flex items-center gap-3.5 text-left group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm bg-gradient-to-br from-emerald-600 to-teal-700 text-white group-hover:scale-105 transition-transform">
              <Download className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-emerald-950 tracking-tight group-hover:text-emerald-700 transition-colors">
                  Tüm Proje Kodlarını Dışa Aktar
                </span>
                <span className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border bg-emerald-100 text-emerald-800 border-emerald-300">
                  ZIP • TXT • TAR.GZ
                </span>
              </div>
              <p className="text-[11.5px] text-emerald-800 leading-snug line-clamp-2 mt-0.5 font-medium">
                Tüm kaynak dosyalar (src, public, server.ts, PWA, README.md, paketler) tek tıkla cihazınıza iner.
              </p>
            </div>

            <div className="w-8 h-8 rounded-full bg-white shadow-xs group-hover:bg-emerald-600 group-hover:text-white text-emerald-700 flex items-center justify-center shrink-0 transition">
              <Download className="w-4 h-4" />
            </div>
          </button>

          {/* Hızlı Yardımcı Kısayollar (Kompakt 4'lü Bar) */}
          <div className="pt-2 border-t border-neutral-100">
            <div className="text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider px-1 mb-2">
              Diğer Hızlı Kısayollar
            </div>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenBusinessRegister();
                }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 active:scale-95 transition border border-neutral-200/60"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-1">
                  <Store className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-neutral-800 text-center truncate w-full">
                  Esnaf Kayıt
                </span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenEmergency();
                }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 active:scale-95 transition border border-neutral-200/60"
              >
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mb-1">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-neutral-800 text-center truncate w-full">
                  112 Acil
                </span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenBus();
                }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 active:scale-95 transition border border-neutral-200/60"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-1">
                  <Bus className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-neutral-800 text-center truncate w-full">
                  Otobüs
                </span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenPharmacy();
                }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 active:scale-95 transition border border-neutral-200/60"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center mb-1 font-black text-xs">
                  E
                </div>
                <span className="text-[10px] font-bold text-neutral-800 text-center truncate w-full">
                  Eczane
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Alt Kısım: Anasayfayı Gör & Kapat */}
        <div className="p-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              if (onGoHome) onGoHome();
              else onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Anasayfaya Dön & Akışı İncele</span>
          </button>
        </div>

      </div>
    </div>
  );
};
