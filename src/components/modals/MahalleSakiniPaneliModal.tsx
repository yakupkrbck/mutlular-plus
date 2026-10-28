import React, { useState } from 'react';
import {
  X,
  User,
  Home,
  Wrench,
  Tag,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Phone,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Inbox,
  FileText,
  Calendar,
  MessageSquare,
  Search,
  ExternalLink,
  Coins,
  Check,
  Trash2,
  Bell,
  RefreshCw,
  Maximize2,
} from 'lucide-react';
import {
  UserProfile,
  UserQuoteRequest,
  ClassifiedItem,
  MuhtarlikApplication,
} from '../../types';

interface MahalleSakiniPaneliModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile | null;
  userQuotes?: UserQuoteRequest[];
  classifiedList?: ClassifiedItem[];
  muhtarApplications?: MuhtarlikApplication[];
  onOpenQuoteWizard?: () => void;
  onOpenMarketListing?: () => void;
  onOpenMuhtarRequest?: () => void;
  onOpenKursu?: () => void;
  onOpenPharmacy?: () => void;
  onOpenKesintiler?: () => void;
  onOpenBelediye?: () => void;
}

export const MahalleSakiniPaneliModal: React.FC<MahalleSakiniPaneliModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  userQuotes = [],
  classifiedList = [],
  muhtarApplications = [],
  onOpenQuoteWizard,
  onOpenMarketListing,
  onOpenMuhtarRequest,
  onOpenKursu,
  onOpenPharmacy,
  onOpenKesintiler,
  onOpenBelediye,
}) => {
  const [activeTab, setActiveTab] = useState<'ozet' | 'muhtarlik' | 'ustalar' | 'ilanlarim' | 'rehber' | 'ayarlar'>('ozet');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const citizenName = userProfile?.name || 'Mahalle Sakini';
  const citizenPhone = userProfile?.phone || '';
  const citizenStreet = 'Mutlular Mah. Fındıklı Sokak No: 12, Osmangazi / Bursa';

  // Sample or live user's own ads
  const myAds = classifiedList.filter(
    (ad) =>
      ad.agency === 'SAHİBİNDEN' ||
      ad.phone === citizenPhone ||
      ad.id.startsWith('ad-user') ||
      ad.id.includes('1')
  );

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 text-neutral-900 flex flex-col w-full h-full overflow-hidden animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs font-black px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top duration-150">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BAR / HEADER (FULLSCREEN DESKTOP & MOBILE) */}
      <header className="bg-gradient-to-r from-neutral-900 via-slate-900 to-emerald-950 text-white border-b border-neutral-800 shrink-0 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-900/40 shrink-0">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight text-white">
                Mahalle Sakini Dijital Yönetim Masası
              </h1>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Doğrulanmış Sakin
              </span>
              <span className="bg-white/10 text-white text-[9px] font-bold px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1">
                <Maximize2 className="w-2.5 h-2.5" /> Tam Ekran
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 font-medium">
              Mutlular Mahallesi, Osmangazi / Bursa • {citizenName} ({citizenPhone})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Bilgileriniz ve talepleriniz güncellendi.')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition border border-neutral-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Yenile</span>
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95"
            title="Paneli Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* HORIZONTAL NAVIGATION TABS */}
      <nav className="bg-neutral-900 border-b border-neutral-800 px-4 sm:px-6 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
        {[
          { id: 'ozet', label: 'Genel Bakış', icon: Sparkles, count: undefined },
          { id: 'muhtarlik', label: 'Muhtarlık Taleplerim', icon: Building2, count: muhtarApplications.length },
          { id: 'ustalar', label: 'Usta & Hizmet Teklifleri', icon: Wrench, count: userQuotes.length },
          { id: 'ilanlarim', label: 'Pazar İlanlarım', icon: Tag, count: myAds.length },
          { id: 'rehber', label: 'Mahalle Hizmetleri', icon: Bell, count: undefined },
          { id: 'ayarlar', label: 'İkametgah & Hesap', icon: User, count: undefined },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive ? 'bg-white text-emerald-800' : 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* MAIN CONTENT AREA (SCROLLABLE & FULL VIEWPORT PRESENCE) */}
      <main className="flex-1 overflow-y-auto bg-neutral-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* ======================================================== */}
          {/* TAB 1: GENEL BAKIŞ (ÖZET KARTLARI & HIZLI İŞLEMLER)       */}
          {/* ======================================================== */}
          {activeTab === 'ozet' && (
            <div className="space-y-6">
              {/* Quick Stat Highlights */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-neutral-500 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Muhtarlık Taleplerim</span>
                    <Building2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-neutral-900">{muhtarApplications.length}</span>
                    <span className="text-xs font-bold text-emerald-600">Takipte</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('muhtarlik')}
                    className="mt-3 text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1 text-left"
                  >
                    <span>Durumları İncele</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-neutral-500 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Usta Teklifleri</span>
                    <Wrench className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-neutral-900">{userQuotes.length}</span>
                    <span className="text-xs font-bold text-blue-600">Aktif İstek</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('ustalar')}
                    className="mt-3 text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 text-left"
                  >
                    <span>Teklif Havuzunu Aç</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-neutral-500 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Pazar İlanlarım</span>
                    <Tag className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-neutral-900">{myAds.length}</span>
                    <span className="text-xs font-bold text-neutral-500">İlan</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('ilanlarim')}
                    className="mt-3 text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1 text-left"
                  >
                    <span>İlanları Yönet</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-neutral-500 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Mahalle Katkısı</span>
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-neutral-900">4</span>
                    <span className="text-xs font-bold text-amber-600">Kürsü / Yorum</span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenKursu) onOpenKursu();
                    }}
                    className="mt-3 text-[11px] font-bold text-amber-600 hover:underline flex items-center gap-1 text-left"
                  >
                    <span>Kürsüde Paylaş</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Hub Banner */}
              <div className="bg-gradient-to-r from-emerald-900 via-neutral-900 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                      Sakin İşlem Merkezi
                    </span>
                    <span className="text-xs text-neutral-400">Mutlular Mahalle Portalı</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight">
                    Mahallenizle İlgili Her İşlemi Tek Noktadan Yönetin
                  </h2>
                  <p className="text-xs text-neutral-300">
                    Sokak lambası arızasından tesisat ustası bulmaya, ikinci el satıştan nöbetçi eczane öğrenmeye kadar tüm mahalle servisleriniz elinizin altında.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenMuhtarRequest) onOpenMuhtarRequest();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition shadow-md flex items-center gap-1.5 active:scale-98"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Muhtara Talep İlet</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenQuoteWizard) onOpenQuoteWizard();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition shadow-md flex items-center gap-1.5 active:scale-98"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Usta / Hizmet Çağır</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenMarketListing) onOpenMarketListing();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-md flex items-center gap-1.5 active:scale-98"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Pazarda İlan Ver</span>
                  </button>
                </div>
              </div>

              {/* Two Column Section: Recent Muhtar Applications & Recent Quotes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Muhtarlık Requests */}
                <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-neutral-900">Muhtarlık Taleplerim</h3>
                        <p className="text-[10px] text-neutral-500 font-medium">Mahalleniz için ilettiğiniz resmi talepler</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('muhtarlik')}
                      className="text-xs font-bold text-red-600 hover:underline flex items-center gap-0.5"
                    >
                      <span>Tümü</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {muhtarApplications.slice(0, 3).map((app) => (
                      <div
                        key={app.id}
                        className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 hover:border-red-200 transition space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black text-neutral-900 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-600" />
                            {app.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              app.status === 'tamamlandi'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.status === 'belediyeye_iletildi'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {app.status === 'tamamlandi'
                              ? 'Çözüldü'
                              : app.status === 'belediyeye_iletildi'
                              ? 'Belediyeye İletildi'
                              : 'İnceleniyor'}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 line-clamp-2">{app.message}</p>
                        <div className="text-[10px] text-neutral-400 flex items-center justify-between pt-1">
                          <span>📍 {app.street}</span>
                          <span>🕒 {app.createdAt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Quotes from Masters */}
                <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-neutral-900">Usta Hizmet Taleplerim</h3>
                        <p className="text-[10px] text-neutral-500 font-medium">Bölge ustalarından gelen fiyat teklifleri</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('ustalar')}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      <span>Tümü</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {userQuotes.length > 0 ? (
                      userQuotes.slice(0, 3).map((q) => (
                        <div
                          key={q.id}
                          className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 hover:border-blue-200 transition space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-black text-neutral-900">
                              {q.category} • {q.subCategory}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                              {q.offers?.length || 0} Teklif Geldi
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 line-clamp-2">{q.desc}</p>
                          <div className="text-[10px] text-neutral-400 flex items-center justify-between pt-1">
                            <span>🕒 {q.createdAt}</span>
                            <span className="font-bold text-blue-700">Aciliyet: {q.urgency}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-neutral-400 space-y-2">
                        <Wrench className="w-8 h-8 mx-auto opacity-30" />
                        <p className="text-xs">Henüz açılmış bir usta talebiniz yok.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: MUHTARLIK TALEPLERİM                               */}
          {/* ======================================================== */}
          {activeTab === 'muhtarlik' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-black text-neutral-900">Mahalle Muhtarlığı Başvurularım</h2>
                  <p className="text-xs text-neutral-500">
                    Muhtarımıza ilettiğiniz mahalle sorunları, sokak arızaları ve sosyal yardım bildirimleri
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenMuhtarRequest) onOpenMuhtarRequest();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Talep Aç</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {muhtarApplications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl p-5 border border-neutral-200/90 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                            {app.id}
                          </span>
                          <span className="text-xs font-black text-neutral-900">{app.category}</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
                          {app.street} • {app.createdAt}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                          app.status === 'tamamlandi'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'belediyeye_iletildi'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {app.status === 'tamamlandi'
                          ? '✅ Çözüldü'
                          : app.status === 'belediyeye_iletildi'
                          ? '🏛️ Belediyeye İletildi'
                          : '⏳ İnceleniyor'}
                      </span>
                    </div>

                    <div className="bg-neutral-50 rounded-xl p-3 text-xs text-neutral-700 font-medium leading-relaxed">
                      "{app.message}"
                    </div>

                    {app.officialNotes && (
                      <div className="bg-red-50/80 border border-red-200 rounded-xl p-3 text-xs text-red-900 space-y-1">
                        <div className="font-black flex items-center gap-1 text-[11px] text-red-800">
                          <span>🏛️ Muhtarın Resmi Yanıtı:</span>
                        </div>
                        <p className="text-neutral-800">{app.officialNotes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: USTA & HİZMET TEKLİFLERİ                           */}
          {/* ======================================================== */}
          {activeTab === 'ustalar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-black text-neutral-900">Usta & Hizmet Taleplerim</h2>
                  <p className="text-xs text-neutral-500">
                    Açtığınız tamirat, tadilat ve usta talepleri ile mahalle ustalarından gelen fiyat teklifleri
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenQuoteWizard) onOpenQuoteWizard();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Hizmet Talebi Aç</span>
                </button>
              </div>

              <div className="space-y-4">
                {userQuotes.map((q) => (
                  <div
                    key={q.id}
                    className="bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-xs space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-neutral-900">{q.category}</span>
                          <span className="text-xs text-neutral-400 font-semibold">• {q.subCategory}</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Tarih: {q.createdAt} • Aciliyet: <span className="font-bold text-neutral-800">{q.urgency}</span>
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800">
                        {q.offers?.length || 0} Teklif Alındı
                      </span>
                    </div>

                    <p className="text-xs text-neutral-700 bg-neutral-50 p-3 rounded-xl border border-neutral-200/60">
                      {q.desc}
                    </p>

                    {/* Master Offers Carousel / List */}
                    {q.offers && q.offers.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <h4 className="text-xs font-black text-neutral-800 uppercase tracking-tight">
                          Gelen Usta Teklifleri:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.offers.map((offer) => (
                            <div
                              key={offer.id}
                              className="p-3.5 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-white flex flex-col justify-between gap-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-neutral-900">{offer.masterTitle}</span>
                                <span className="text-sm font-black text-emerald-700">{offer.price}</span>
                              </div>
                              <p className="text-[11px] text-neutral-600">{offer.message}</p>
                              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[10px]">
                                <span className="text-neutral-500">Varış: {offer.estimatedTime}</span>
                                <button
                                  onClick={() => showToast(`Usta ${offer.masterTitle} ile iletişime geçildi.`)}
                                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                >
                                  Teklifi Seç & Ara
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: PAZAR İLANLARIM                                    */}
          {/* ======================================================== */}
          {activeTab === 'ilanlarim' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-black text-neutral-900">Mahalle Pazarı İlanlarım</h2>
                  <p className="text-xs text-neutral-500">
                    Mutlular alım-satım pazarında yayınladığınız emlak, vasıta ve ikinci el eşya ilanları
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenMarketListing) onOpenMarketListing();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni İlan Paylaş</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myAds.map((ad) => (
                  <div
                    key={ad.id}
                    className="bg-white rounded-2xl overflow-hidden border border-neutral-200/90 shadow-xs flex flex-col justify-between"
                  >
                    <div className="relative aspect-video bg-neutral-100">
                      <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {ad.tag}
                      </div>
                      <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                        Yayında
                      </div>
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-black text-neutral-900 line-clamp-1">{ad.title}</h4>
                        <p className="text-sm font-black text-emerald-700 mt-1">{ad.price}</p>
                        <p className="text-[11px] text-neutral-500 mt-1">{ad.location}</p>
                      </div>

                      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => showToast('İlan bilgileri güncellendi.')}
                          className="flex-1 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition text-center"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => showToast('İlan satıldı olarak işaretlendi ve kaldırıldı.')}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                          title="Kaldır"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: MAHALLE REHBERİ & HIZLI SERVİSLER                  */}
          {/* ======================================================== */}
          {activeTab === 'rehber' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-neutral-900">Mahalle Servisleri & Hızlı Kısayollar</h2>
                <p className="text-xs text-neutral-500">
                  Nöbetçi eczaneler, elektrik/su kesintileri ve Osmangazi Belediyesi online işlemleri
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  onClick={() => {
                    onClose();
                    if (onOpenPharmacy) onOpenPharmacy();
                  }}
                  className="bg-white p-5 rounded-2xl border border-neutral-200/90 hover:border-red-300 transition cursor-pointer shadow-xs space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-black">
                    💊
                  </div>
                  <h3 className="text-sm font-black text-neutral-900 group-hover:text-red-600 transition">
                    Nöbetçi Eczaneler
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Bugün Mutlular ve çevresinde açık olan nöbetçi eczaneleri inceleyin.
                  </p>
                </div>

                <div
                  onClick={() => {
                    onClose();
                    if (onOpenKesintiler) onOpenKesintiler();
                  }}
                  className="bg-white p-5 rounded-2xl border border-neutral-200/90 hover:border-amber-300 transition cursor-pointer shadow-xs space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                    ⚡
                  </div>
                  <h3 className="text-sm font-black text-neutral-900 group-hover:text-amber-600 transition">
                    Elektrik & Su Kesintileri
                  </h3>
                  <p className="text-xs text-neutral-500">
                    UEDAŞ ve BUSKİ planlı bakım ve arıza kesintilerini anlık takip edin.
                  </p>
                </div>

                <div
                  onClick={() => {
                    onClose();
                    if (onOpenBelediye) onOpenBelediye();
                  }}
                  className="bg-white p-5 rounded-2xl border border-neutral-200/90 hover:border-blue-300 transition cursor-pointer shadow-xs space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                    🏛️
                  </div>
                  <h3 className="text-sm font-black text-neutral-900 group-hover:text-blue-600 transition">
                    E-Belediye İşlemleri
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Osmangazi Belediyesi online vergi ödeme, imar durumu ve şikayet masası.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: İKAMETGAH & HESAP AYARLARI                         */}
          {/* ======================================================== */}
          {activeTab === 'ayarlar' && (
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-xs max-w-2xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-900">{citizenName}</h3>
                  <p className="text-xs text-neutral-500 font-medium">Kayıtlı Mahalle Sakini Profili</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-neutral-700 uppercase text-[10px] mb-1">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    defaultValue={citizenName}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 uppercase text-[10px] mb-1">
                    Telefon Numarası
                  </label>
                  <input
                    type="text"
                    defaultValue={citizenPhone}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 uppercase text-[10px] mb-1">
                    Kayıtlı Mahalle Adresi
                  </label>
                  <input
                    type="text"
                    defaultValue={citizenStreet}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 font-medium outline-none"
                  />
                </div>
              </div>

              <button
                onClick={() => showToast('Profil ve adres bilgileriniz güncellendi!')}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-md"
              >
                Bilgileri Kaydet
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
