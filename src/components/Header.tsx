import React from 'react';
import { Search, Menu, User, Sparkles, ShieldCheck, Download } from 'lucide-react';
import { UserProfile } from '../types';
import { ROLE_CONFIGS } from '../data/rolesData';
import { NavTab } from './BottomNav';

interface HeaderProps {
  currentTab: NavTab;
  onOpenSearch: () => void;
  onOpenLogin: () => void;
  onOpenProfile: () => void;
  onOpenMenu: () => void;
  onOpenAdmin?: () => void;
  onOpenMuhtar?: () => void;
  onGoHome?: () => void;
  onOpenExportCode?: () => void;
  isLoggedIn?: boolean;
  userProfile?: UserProfile | null;
  unreadNotificationCount?: number;
  pendingMuhtarApplicationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenSearch,
  onOpenLogin,
  onOpenProfile,
  onOpenMenu,
  onOpenAdmin,
  onOpenMuhtar,
  onGoHome,
  onOpenExportCode,
  isLoggedIn,
  userProfile,
  unreadNotificationCount = 0,
  pendingMuhtarApplicationsCount = 0,
}) => {
  const isYonetici = isLoggedIn && userProfile?.role === 'yonetici';

  // Determine top title according to requested specification:
  // - 'haber'     => "MUTLULAR HABER"
  // - 'alim-satim'=> "MUTLULAR ALIM SATIM" (Kiralık • Satılık • 2. El)
  // - 'hizmet'    => "MUTLULAR HİZMET"
  // - 'yemek'     => "MUTLULAR ESNAF"
  // - 'anasayfa'  => "MUTLULAR PLUS" (Altında: "Şehrin Dijital Merkezi")
  const renderHeaderTitle = () => {
    if (currentTab === 'haber') {
      return (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 leading-none whitespace-nowrap">
            <span className="text-[13.5px] sm:text-[15px] font-black tracking-tight text-neutral-900">
              MUTLULAR
            </span>
            <span className="text-[13.5px] sm:text-[15px] font-black tracking-tight text-rose-600">
              HABER
            </span>
          </div>
          <span className="text-[7.5px] sm:text-[8.5px] font-bold text-neutral-400 tracking-wider uppercase mt-0.5 whitespace-nowrap leading-none">
            Yerel Haber Masası & Gelişmeler
          </span>
        </div>
      );
    }

    if (currentTab === 'alim-satim') {
      return (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1 leading-none whitespace-nowrap">
            <span className="text-[12px] sm:text-[13.5px] font-black tracking-tight text-neutral-900">
              MUTLULAR
            </span>
            <span className="text-[11px] sm:text-[12.5px] font-black tracking-tight text-rose-600">
              ALIM SATIM
            </span>
          </div>
          <span className="text-[7.5px] sm:text-[8px] font-bold text-neutral-400 tracking-wider uppercase mt-0.5 whitespace-nowrap leading-none">
            Kiralık • Satılık • 2. El
          </span>
        </div>
      );
    }

    if (currentTab === 'hizmet') {
      return (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 leading-none whitespace-nowrap">
            <span className="text-[13.5px] sm:text-[15px] font-black tracking-tight text-neutral-900">
              MUTLULAR
            </span>
            <span className="text-[13.5px] sm:text-[15px] font-black tracking-tight text-amber-500">
              HİZMET
            </span>
          </div>
          <span className="text-[7.5px] sm:text-[8.5px] font-bold text-neutral-400 tracking-wider uppercase mt-0.5 whitespace-nowrap leading-none">
            Faaliyet Rehberi & Fiyat Teklifi
          </span>
        </div>
      );
    }

    if (currentTab === 'yemek') {
      return (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 leading-none whitespace-nowrap">
            <span className="text-[13.5px] sm:text-[15px] font-black tracking-tight text-neutral-900">
              MUTLULAR
            </span>
            <span className="text-[13.5px] sm:text-[15px] font-black tracking-tight text-rose-600">
              ESNAF
            </span>
          </div>
          <span className="text-[7.5px] sm:text-[8.5px] font-bold text-neutral-400 tracking-wider uppercase mt-0.5 whitespace-nowrap leading-none">
            Şehir Esnafı & Mağazalar
          </span>
        </div>
      );
    }

    if (currentTab === 'mp-hub') {
      return (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 leading-none whitespace-nowrap">
            <span className="text-[13.5px] sm:text-[15px] font-black tracking-tight text-neutral-900">
              MUTLULAR
            </span>
            <span className="text-[13.5px] sm:text-[15px] font-black tracking-tight text-rose-600">
              PLUS HUB
            </span>
          </div>
          <span className="text-[7.5px] sm:text-[8.5px] font-bold text-neutral-400 tracking-wider uppercase mt-0.5 whitespace-nowrap leading-none">
            Şehrin Dijital Merkezi
          </span>
        </div>
      );
    }

    if (currentTab === 'profil') {
      return (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 leading-none whitespace-nowrap">
            <span className="text-[13.5px] sm:text-[15px] font-black tracking-tight text-neutral-900">
              MUTLULAR
            </span>
            <span className="text-[13.5px] sm:text-[15px] font-black tracking-tight text-rose-600">
              PROFİL
            </span>
          </div>
          <span className="text-[7.5px] sm:text-[8.5px] font-bold text-neutral-400 tracking-wider uppercase mt-0.5 whitespace-nowrap leading-none">
            Kullanıcı & Vasıf Merkezi
          </span>
        </div>
      );
    }

    // Default Anasayfa
    return (
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1 leading-none whitespace-nowrap">
          <span className="text-[13.5px] sm:text-[15px] font-black tracking-tight text-neutral-900">
            MUTLULAR
          </span>
          <span className="text-[13.5px] sm:text-[15px] font-black tracking-tight text-rose-600">
            PLUS
          </span>
        </div>
        <span className="text-[7.5px] sm:text-[8px] font-bold text-neutral-400 tracking-wider uppercase mt-0.5 whitespace-nowrap leading-none">
          Şehrin Dijital Merkezi
        </span>
      </div>
    );
  };

  const handleLogoClick = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] px-3 sm:px-4 py-2 sm:py-2.5">
      <div className="max-w-md mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Logo and Dynamic Title */}
        <div
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none min-w-0 group"
          onClick={handleLogoClick}
          title={currentTab !== 'anasayfa' ? 'Anasayfaya dönmek için tıklayın' : 'Mutlular Plus Anasayfa'}
        >
          {/* Logo Mark: stylized MP */}
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 bg-neutral-900 rounded-lg flex items-center justify-center text-white font-black tracking-tighter shadow-sm overflow-hidden group-hover:scale-105 transition-transform shrink-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950 via-neutral-900 to-rose-700 opacity-90" />
            <div className="relative flex items-center font-extrabold text-[15px] sm:text-[17px] tracking-tight">
              <span className="text-white">M</span>
              <span className="text-rose-500 -ml-0.5">P</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-amber-400 rounded-full blur-[1px] opacity-75" />
          </div>

          {renderHeaderTitle()}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Search Button */}
          <button
            onClick={onOpenSearch}
            aria-label="Ara"
            className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 active:scale-95 transition flex items-center justify-center text-neutral-700"
          >
            <Search className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Admin Panel Quick Access Button when Logged In as Yönetici */}
          {isYonetici && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              aria-label="Yönetim Paneli"
              title="Yönetim & Denetim Paneli"
              className="h-8 px-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] flex items-center gap-1.5 shadow-sm active:scale-95 transition animate-in fade-in"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Yönetim</span>
            </button>
          )}

          {/* Muhtar Panel Quick Access Button when Logged In as Muhtar (Resmi Yetkili) */}
          {userProfile?.role === 'muhtar' && onOpenMuhtar && (
            <button
              onClick={onOpenMuhtar}
              aria-label="Muhtarlık Masası"
              title="Mehmet Akif Mahalle Muhtarlığı Resmi Yetkili Masası"
              className="h-8 px-2.5 rounded-full bg-red-700 hover:bg-red-800 text-white font-black text-[11px] flex items-center gap-1.5 shadow-sm active:scale-95 transition animate-in fade-in border border-red-500/50"
            >
              <span className="text-xs">🏛️</span>
              <span className="hidden sm:inline">Muhtarlık</span>
              {pendingMuhtarApplicationsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white text-red-700 text-[9px] font-black animate-pulse">
                  {pendingMuhtarApplicationsCount}
                </span>
              )}
            </button>
          )}

          {/* Kod Dışa Aktar Butonu */}
          {onOpenExportCode && (
            <button
              onClick={onOpenExportCode}
              aria-label="Projeyi İndir / Dışa Aktar"
              title="Tüm Proje Kodlarını İndir (.ZIP / .TXT)"
              className="h-8 px-2 sm:px-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-extrabold text-[11px] flex items-center gap-1.5 shadow-2xs active:scale-95 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Kodları İndir</span>
            </button>
          )}

          {/* Giriş Yap / Profil Button */}
          {isLoggedIn && userProfile ? (
            <button
              onClick={onOpenProfile}
              aria-label="Profil ve Hesap"
              title={`${userProfile.name} • ${userProfile.title || userProfile.roleLabel}`}
              className={`relative w-8.5 h-8.5 rounded-full overflow-hidden border-2 border-white ring-2 ${
                userProfile.role === 'muhtar' ? 'ring-red-600' : 'ring-neutral-300'
              } hover:ring-rose-500 active:scale-95 transition shadow-xs flex items-center justify-center bg-neutral-900 group shrink-0`}
            >
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-rose-600 text-white font-black text-xs">
                  {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'M'}
                </div>
              )}
              {userProfile.role === 'muhtar' && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-red-700 border border-white rounded-full flex items-center justify-center text-[7.5px] text-white">
                  🏛️
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="relative h-8 px-3 rounded-full border border-rose-600 hover:bg-rose-50 text-rose-600 active:scale-95 transition text-[12px] font-bold shadow-xs flex items-center justify-center"
            >
              <span>Giriş Yap</span>
            </button>
          )}

          {/* Hamburger Menu */}
          <button
            onClick={onOpenMenu}
            aria-label="Menü"
            className="relative w-9 h-9 flex flex-col items-center justify-center gap-1 rounded-lg text-neutral-800 hover:bg-neutral-100 active:scale-95 transition p-1"
          >
            <span className="w-5 h-[2.5px] bg-neutral-800 rounded-full"></span>
            <span className="w-5 h-[2.5px] bg-neutral-800 rounded-full"></span>
            <span className="w-5 h-[2.5px] bg-neutral-800 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
};
