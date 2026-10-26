import React from 'react';
import {
  X,
  User,
  ShoppingBag,
  Car,
  Home,
  Wrench,
  Bus,
  Heart,
  Mic,
  Camera,
  HeartCrack,
  Radio,
  Tv,
  Tag,
  Gift,
  Building2,
  ChevronRight,
  ShieldAlert,
  Search,
  Sparkles,
  PhoneCall,
  Info,
  ShieldCheck,
  Briefcase,
  Stethoscope,
  Download,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { ROLE_CONFIGS } from '../../data/rolesData';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  onOpenPharmacy: () => void;
  onOpenPrayers: () => void;
  onOpenCampus: () => void;
  onOpenCoupons: () => void;
  onOpenBus: () => void;
  onOpenEmergency: () => void;
  onOpenNewsTip: () => void;
  onOpenDavet: () => void;
  onOpenKursu: () => void;
  onOpenLostFound: () => void;
  onOpenLiveStream: () => void;
  onOpenCredit: () => void;
  onOpenQuoteWizard: () => void;
  onOpenMarketListing: () => void;
  onOpenBusinessRegister: () => void;
  onOpenVefat: () => void;
  onOpenBelediye?: () => void;
  onOpenSaglikOcagi?: () => void;
  onOpenMuhtarlik?: () => void;
  onOpenJobs?: () => void;
  onOpenAlimSatim?: () => void;
  onOpenAdmin?: () => void;
  onOpenProfile?: () => void;
  onGoHome?: () => void;
  currentTab?: string;
  isLoggedIn?: boolean;
  userName?: string;
  userProfile?: UserProfile | null;
  unreadNotificationCount?: number;
  onOpenExportCode?: () => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  onOpenLogin,
  onOpenPharmacy,
  onOpenPrayers,
  onOpenCampus,
  onOpenCoupons,
  onOpenBus,
  onOpenEmergency,
  onOpenNewsTip,
  onOpenDavet,
  onOpenKursu,
  onOpenLostFound,
  onOpenLiveStream,
  onOpenCredit,
  onOpenQuoteWizard,
  onOpenMarketListing,
  onOpenBusinessRegister,
  onOpenVefat,
  onOpenBelediye,
  onOpenSaglikOcagi,
  onOpenMuhtarlik,
  onOpenJobs,
  onOpenAlimSatim,
  onOpenAdmin,
  onOpenProfile,
  onGoHome,
  currentTab,
  isLoggedIn,
  userName,
  userProfile,
  unreadNotificationCount = 0,
  onOpenExportCode,
}) => {
  if (!isOpen) return null;

  const handleAction = (callback: () => void) => {
    onClose();
    callback();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-[85%] max-w-xs h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        <div>
          {/* Top Brand Header */}
          <div className="p-4 bg-gradient-to-r from-neutral-900 to-rose-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-lg">
                <span className="text-white">M</span>
                <span className="text-rose-400">P</span>
              </div>
              <div>
                <h3 className="text-[14px] font-black leading-tight">MUTLULAR PLUS</h3>
                <p className="text-[9px] text-white/70 uppercase tracking-wider font-semibold">
                  Şehrin Dijital Merkezi
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Status Bar */}
          <div className="p-3 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between">
            {isLoggedIn ? (
              <div
                onClick={() => onOpenProfile && handleAction(onOpenProfile)}
                className={`flex items-center justify-between w-full ${
                  onOpenProfile ? 'cursor-pointer hover:bg-neutral-100/60 p-1 -m-1 rounded-xl transition' : ''
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                    {userProfile?.avatar ? (
                      <img
                        src={userProfile.avatar}
                        alt={userName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{userName ? userName.charAt(0).toUpperCase() : 'M'}</span>
                    )}
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-600 rounded-full border-2 border-white animate-pulse" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12px] font-black text-neutral-800 leading-tight truncate">
                      {userName || 'Mutlular Sakini'}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {userProfile ? (
                        <span
                          className={`text-[9.5px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1 shadow-2xs ${
                            userProfile.role === 'muhtar'
                              ? 'bg-red-50 text-red-700 border-red-300'
                              : `${ROLE_CONFIGS[userProfile.role]?.badgeBg || 'bg-emerald-50'} ${
                                  ROLE_CONFIGS[userProfile.role]?.badgeText || 'text-emerald-700'
                                } ${ROLE_CONFIGS[userProfile.role]?.badgeBorder || 'border-emerald-200'}`
                          }`}
                        >
                          <span>{userProfile.role === 'muhtar' ? '🏛️' : ROLE_CONFIGS[userProfile.role]?.icon}</span>
                          <span>{userProfile.title || userProfile.roleLabel}</span>
                        </span>
                      ) : (
                        <span className="text-[9.5px] text-emerald-600 font-bold">
                          Doğrulanmış Üye
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {onOpenProfile && (
                  <div className="flex items-center gap-1 shrink-0 text-neutral-400">
                    {unreadNotificationCount > 0 && (
                      <span className="text-[9.5px] font-black bg-rose-600 text-white px-1.5 py-0.2 rounded-full animate-pulse">
                        {unreadNotificationCount}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-[12px] font-bold text-neutral-700">
                  Hesabınız var mı?
                </span>
                <button
                  onClick={() => handleAction(onOpenLogin)}
                  className="bg-rose-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full hover:bg-rose-700"
                >
                  Giriş Yap
                </button>
              </div>
            )}
          </div>

          {/* Admin Exclusive Quick Banner */}
          {userProfile?.role === 'yonetici' && onOpenAdmin && (
            <div className="p-3 bg-gradient-to-r from-neutral-900 to-rose-950 border-b border-rose-900/40 text-white">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <span className="text-[11px] font-black tracking-wide text-white">
                    DENETİM YÖNETİM PANELİ
                  </span>
                </div>
                <span className="bg-rose-600 text-[8px] font-black px-1.5 py-0.2 rounded text-white animate-pulse">
                  AKTİF
                </span>
              </div>
              <p className="text-[10px] text-neutral-300 leading-tight mb-2">
                İlan onaylama, haber girme, yorum silme ve esnaf denetimi.
              </p>
              <button
                onClick={() => handleAction(onOpenAdmin)}
                className="w-full bg-rose-600 hover:bg-rose-500 active:scale-98 text-white font-extrabold text-[11px] py-1.5 rounded-xl transition flex items-center justify-center gap-1 shadow-sm"
              >
                <span>Yönetim Paneline Git</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Menu Items List */}
          <div className="p-3 space-y-1">
            {/* Anasayfa Hızlı Erişim Butonu */}
            {onGoHome && (
              <button
                onClick={() => handleAction(onGoHome)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition text-left mb-2 ${
                  currentTab === 'anasayfa'
                    ? 'bg-rose-50 text-rose-700 font-black border border-rose-200/80 shadow-2xs'
                    : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 font-bold'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center font-black ${
                      currentTab === 'anasayfa'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-neutral-900 text-white'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[12.5px] font-black leading-tight block">
                      Anasayfa
                    </span>
                    <span className="text-[9.5px] text-neutral-500 font-medium leading-none">
                      Şehrin vitrini & akışı
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    currentTab === 'anasayfa'
                      ? 'bg-rose-200/80 text-rose-800'
                      : 'bg-white text-neutral-600 border border-neutral-200'
                  }`}
                >
                  {currentTab === 'anasayfa' ? 'Aktif' : 'Git'}
                </span>
              </button>
            )}

            <div className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider px-2 py-1">
              Şehir & Hizmetler
            </div>

            {onOpenBelediye && (
              <button
                onClick={() => handleAction(onOpenBelediye)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-black text-xs">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[12px] font-bold text-neutral-800 block leading-tight">
                      Osmangazi E-Belediye
                    </span>
                    <span className="text-[9.5px] text-neutral-400 font-medium block">
                      Vergi & borç sorgulama, imar & 153
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </button>
            )}

            <button
              onClick={() => handleAction(onOpenPharmacy)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-black text-xs">
                  E
                </div>
                <span className="text-[12px] font-bold text-neutral-800">
                  Nöbetçi Eczaneler
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            {onOpenSaglikOcagi && (
              <button
                onClick={() => handleAction(onOpenSaglikOcagi)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-black text-xs">
                    <Stethoscope className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[12px] font-bold text-neutral-800 block leading-tight">
                      Sağlık Ocağı & ASM
                    </span>
                    <span className="text-[9.5px] text-neutral-400 font-medium block">
                      Mutlular ASM, hekimler & tahlil
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </button>
            )}

            <button
              onClick={() => handleAction(onOpenBus)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                  <Bus className="w-3.5 h-3.5" />
                </div>
                <span className="text-[12px] font-bold text-neutral-800">
                  Ulaşım & Otobüs Saatleri
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            <button
              onClick={() => handleAction(onOpenQuoteWizard)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
                <span className="text-[12px] font-bold text-neutral-800">
                  Hizmet İste / Teklif Al
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            {onOpenAlimSatim && (
              <button
                onClick={() => handleAction(onOpenAlimSatim)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <Home className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[12px] font-bold text-neutral-800">
                    Alım Satım (Emlak & Vasıta)
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </button>
            )}

            <button
              onClick={() => handleAction(onOpenMarketListing)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
                <span className="text-[12px] font-bold text-neutral-800">
                  İlan Ver (Pazar & Vasıta)
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            {onOpenJobs && (
              <button
                onClick={() => handleAction(onOpenJobs)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[12px] font-bold text-neutral-800 block leading-tight">
                      İş & Eleman İlanları
                    </span>
                    <span className="text-[9.5px] text-neutral-400 font-medium block">
                      Usta ve esnaf iş fırsatları
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </button>
            )}

            <button
              onClick={() => handleAction(onOpenVefat)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center">
                  <HeartCrack className="w-3.5 h-3.5 text-rose-600" />
                </div>
                <span className="text-[12px] font-bold text-neutral-800">
                  Vefat & Taziye İlanları
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            <button
              onClick={() => handleAction(onOpenPrayers)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-[12px] font-bold text-neutral-800">
                  Namaz Vakitleri
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            <div className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider px-2 pt-2.5 pb-1">
              Topluluk & İletişim
            </div>

            <button
              onClick={() => handleAction(onOpenNewsTip)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-50 text-rose-600 flex items-center justify-center">
                  <Camera className="w-3.5 h-3.5" />
                </div>
                <span className="text-[12px] font-bold text-neutral-800">
                  Haber İhbar Hattı
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            <button
              onClick={() => handleAction(onOpenDavet)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                  <Heart className="w-3.5 h-3.5" />
                </div>
                <span className="text-[12px] font-bold text-neutral-800">
                  Davetiyeler (Düğün/Sünnet)
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            <button
              onClick={() => handleAction(onOpenMuhtarlik || onOpenKursu)}
              className={`w-full flex items-center justify-between p-2 rounded-xl transition text-left ${
                userProfile?.role === 'muhtar'
                  ? 'bg-red-50/80 hover:bg-red-100/80 border border-red-200'
                  : 'hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shadow-2xs">
                  🏛️
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-bold text-neutral-800">
                      Mehmet Akif Mahalle Muhtarlığı
                    </span>
                    {userProfile?.role === 'muhtar' && (
                      <span className="text-[8.5px] font-black bg-red-600 text-white px-1.5 py-0.2 rounded-full uppercase">
                        Yetkili
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-500 font-medium">
                    {userProfile?.role === 'muhtar' ? 'Resmi Yetkili Masası & Başvurular' : 'İletişim & Talep Bildirimi'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            <button
              onClick={() => handleAction(onOpenKursu)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Mic className="w-3.5 h-3.5" />
                </div>
                <span className="text-[12px] font-bold text-neutral-800">
                  Halk Kürsüsü & Mahalle Sözü
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            <button
              onClick={() => handleAction(onOpenLostFound)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <span className="text-[12px] font-bold text-neutral-800">
                  Kayıp & Buluntu
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            <button
              onClick={() => handleAction(onOpenLiveStream)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
                  <Tv className="w-3.5 h-3.5 text-red-600" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-bold text-neutral-800">
                    Mutlular Canlı TV
                  </span>
                  <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase flex items-center gap-1">
                    <span className="w-1 h-1 bg-white rounded-full animate-ping" />
                    CANLI
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            <button
              onClick={() => handleAction(onOpenCoupons)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <span className="text-[12px] font-bold text-neutral-800">
                  Kuponlar & Kampanyalar
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            <button
              onClick={() => handleAction(onOpenCredit)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                  <Gift className="w-3.5 h-3.5" />
                </div>
                <span className="text-[12px] font-bold text-neutral-800">
                  Para Puan & Kredim
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            <button
              onClick={() => handleAction(onOpenEmergency)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-rose-50 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                  <PhoneCall className="w-3.5 h-3.5" />
                </div>
                <span className="text-[12px] font-bold text-rose-700">
                  112 Acil Numaralar
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-400" />
            </button>

            {userProfile?.role === 'yonetici' && onOpenAdmin && (
              <button
                onClick={() => handleAction(onOpenAdmin)}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-rose-50 hover:bg-rose-100 transition text-left border border-rose-200 mt-1"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[12px] font-black text-rose-700">
                    Denetim & Yönetim Masası
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-600" />
              </button>
            )}

            {/* Proje Kodlarını İndir */}
            <div className="pt-2 mt-2 border-t border-neutral-100">
              {onOpenExportCode ? (
                <button
                  onClick={() => handleAction(onOpenExportCode)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Download className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[12px] font-black text-emerald-950 block leading-tight">
                        Proje Kodlarını İndir (.ZIP)
                      </span>
                      <span className="text-[9.5px] text-emerald-700 font-semibold block truncate">
                        Tüm dosyalar • ZIP, TAR.GZ & TXT
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              ) : (
                <a
                  href="/mutlular-plus-kaynak-kodlar.zip"
                  download="mutlular-plus-kaynak-kodlar.zip"
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition text-left group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Download className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[12px] font-black text-emerald-950 block leading-tight">
                        Proje Kodlarını İndir (.ZIP)
                      </span>
                      <span className="text-[9.5px] text-emerald-700 font-semibold block truncate">
                        Tüm dosyalar • 2.3 MB
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-100 bg-neutral-50 text-center">
          <p className="text-[10px] text-neutral-400 font-bold">
            Mutlular Plus • Şehrin Dijital Merkezi v1.2
          </p>
          <p className="text-[9px] text-neutral-400 mt-0.5">
            Tüm hakları saklıdır © 2026
          </p>
        </div>
      </div>
    </div>
  );
};
