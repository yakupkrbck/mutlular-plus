import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  HeartCrack,
  MapPin,
  Calendar,
  MessageSquare,
  Send,
  Plus,
  BellRing,
  CheckCircle2,
  Clock,
  Phone,
  ShieldCheck,
  Building,
  User,
  Check,
  Ban,
  Search,
  ExternalLink,
  Maximize2,
  Minimize2,
  Newspaper,
} from 'lucide-react';
import { ObituaryItem, UserProfile } from '../../types';
import { sendAndroidAppNotification } from '../../services/androidNotificationService';
import {
  EDEVLET_BURSA_VEFAT_URL,
  GENC_GAZETE_VEFAT_URL,
} from '../../services/vefat_dogrulama_servisi';

interface VefatModalProps {
  isOpen: boolean;
  onClose: () => void;
  obituaries: ObituaryItem[];
  onAddNewObituary: (ob: ObituaryItem) => void;
  onApproveObituary?: (obId: string) => void;
  onRejectObituary?: (obId: string) => void;
  onDeleteObituary?: (obId: string) => void;
  userProfile?: UserProfile | null;
  isLoggedIn: boolean;
  onOpenLogin: () => void;
  initialTab?: 'vitrin' | 'ilan-ver' | 'onay-bekleyenler';
}

export const VefatModal: React.FC<VefatModalProps> = ({
  isOpen,
  onClose,
  obituaries,
  onAddNewObituary,
  onApproveObituary,
  onRejectObituary,
  userProfile,
  isLoggedIn,
  onOpenLogin,
  initialTab = 'vitrin',
}) => {
  // All hooks MUST be declared before any conditional return
  const [activeTab, setActiveTab] = useState<'vitrin' | 'ilan-ver' | 'onay-bekleyenler'>(initialTab);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedObituary, setSelectedObituary] = useState<ObituaryItem | null>(null);
  const [condolenceText, setCondolenceText] = useState('');
  const [broadcastedId, setBroadcastedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for adding new funeral notice
  const [newName, setNewName] = useState('');
  const [newHometown, setNewHometown] = useState('Bursa / Osmangazi / Mehmet Akif Mahallesi');
  const [newFatherName, setNewFatherName] = useState('');
  const [newSonName, setNewSonName] = useState('');
  const [newDate, setNewDate] = useState('Bugün İkindi Namazı');
  const [newMosque, setNewMosque] = useState('Osmangazi Mehmet Akif Mah. Fatih Camii');
  const [newCemetery, setNewCemetery] = useState('Hamitler Kent Mezarlığı');
  const [newPhone, setNewPhone] = useState(userProfile?.phone || '');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isStaff = userProfile?.role === 'yonetici' || userProfile?.role === 'editor';
  const approvedList = useMemo(() => obituaries.filter((o) => o.status === 'approved'), [obituaries]);
  const pendingList = useMemo(() => obituaries.filter((o) => o.status === 'pending'), [obituaries]);

  // Vitrin filtering
  const filteredApproved = useMemo(() => {
    if (!searchQuery.trim()) return approvedList;
    const q = searchQuery.toLowerCase();
    return approvedList.filter((ob) => {
      return (
        ob.name.toLowerCase().includes(q) ||
        ob.hometown.toLowerCase().includes(q) ||
        ob.mosque.toLowerCase().includes(q) ||
        ob.cemetery.toLowerCase().includes(q) ||
        ob.fatherName.toLowerCase().includes(q) ||
        (ob.sonName && ob.sonName.toLowerCase().includes(q))
      );
    });
  }, [approvedList, searchQuery]);

  // Early return if modal is closed
  if (!isOpen) return null;

  const handleBroadcastVefat = async (ob: ObituaryItem) => {
    await sendAndroidAppNotification({
      title: `🕊️ Vefat & Taziye: ${ob.name}`,
      body: `Cenazesi ${ob.date} vakti ${ob.mosque} camiinden kaldırılacaktır. Defin: ${ob.cemetery}. Taziye Tel: ${ob.phone}.`,
      type: 'vefat',
      actionTab: 'vefat',
      badgeText: 'VEFAT & TAZİYE',
      timestamp: Date.now(),
    });
    setBroadcastedId(ob.id);
    showToast('🕊️ Tüm mahalleye vefat & taziye bildirimi gönderildi!');
    setTimeout(() => setBroadcastedId(null), 3000);
  };

  const handleCreateNewObituary = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      onOpenLogin();
      return;
    }

    if (!newName.trim() || !newHometown.trim() || !newFatherName.trim() || !newPhone.trim()) {
      showToast('Lütfen cenazenin adı soyadı, memleketi, baba adı ve telefon bilgilerini eksiksiz doldurunuz.');
      return;
    }

    const status = isStaff ? 'approved' : 'pending';

    const newOb: ObituaryItem = {
      id: `ob-${Date.now()}`,
      name: newName.trim(),
      hometown: newHometown.trim(),
      fatherName: newFatherName.trim(),
      sonName: newSonName.trim() || undefined,
      date: newDate.trim(),
      mosque: newMosque.trim(),
      cemetery: newCemetery.trim(),
      phone: newPhone.trim(),
      relative: newSonName.trim() ? `Oğlu: ${newSonName.trim()}` : `İletişim: ${newPhone.trim()}`,
      status,
      mapLocationUrl: `https://maps.google.com/?q=${encodeURIComponent(newCemetery + ' Bursa')}`,
      submittedBy: {
        name: userProfile?.name || 'Kayıtlı Mahalle Sakini',
        phone: userProfile?.phone || newPhone.trim(),
        role: userProfile?.role || 'mahalle-sakini',
        date: 'Bugün',
      },
      approvedBy: isStaff ? `${userProfile?.role === 'yonetici' ? 'Yönetici' : 'Editör'} (${userProfile?.name || 'Yetkili'})` : undefined,
      notes: newNotes.trim() || undefined,
      condolences: [],
    };

    onAddNewObituary(newOb);

    if (status === 'approved') {
      sendAndroidAppNotification({
        title: `🕊️ Yeni Cenaze İlanı: ${newOb.name}`,
        body: `Cenazesi ${newOb.date} vakti ${newOb.mosque} camiinden kaldırılacaktır. Defin: ${newOb.cemetery}.`,
        type: 'vefat',
        actionTab: 'vefat',
        badgeText: 'VEFAT & TAZİYE',
        timestamp: Date.now(),
      });
      showToast('✓ Cenaze ilanı onaylandı ve vitrinde yayınlandı!');
      setActiveTab('vitrin');
    } else {
      showToast('✓ Cenaze ilanınız alındı! Yönetici veya editör onayından sonra vitrinde yayınlanacaktır.');
      setActiveTab('onay-bekleyenler');
    }

    // Reset Form
    setNewName('');
    setNewFatherName('');
    setNewSonName('');
    setNewNotes('');
  };

  const handleSendCondolence = (obId: string) => {
    if (!condolenceText.trim()) return;
    const author = userProfile?.name || 'Mahalle Sakini';
    const target = obituaries.find((o) => o.id === obId);
    if (target) {
      if (!target.condolences) target.condolences = [];
      target.condolences.push({
        id: `cond-${Date.now()}`,
        author,
        message: condolenceText.trim(),
        date: 'Az önce',
      });
      setCondolenceText('');
      showToast('🕊️ Başsağlığı mesajınız iletildi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-60 bg-neutral-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-2xl border border-neutral-700 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      <div
        className={`bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 border border-neutral-200 ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-4xl max-h-[92vh]'
        }`}
      >
        {/* Modal Top Header */}
        <div className="p-3.5 sm:p-4 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-neutral-800 border border-neutral-700 text-rose-400 flex items-center justify-center shadow-xs">
              <HeartCrack className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-white">
                  Vefat & Taziye İlanları
                </h3>
                <span className="bg-rose-500/20 text-rose-300 font-bold text-[10px] px-2 py-0.5 rounded-full border border-rose-500/30">
                  Mehmet Akif Mah.
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Bursa Osmangazi Mehmet Akif Mahallesi Cenaze ve Taziye Masası
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href="tel:188"
              className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 text-xs font-bold transition flex items-center gap-1.5"
              title="Bursa Cenaze Hizmetleri Çağrı Merkezi"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">ALO 188</span>
            </a>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition"
              title={isFullscreen ? 'Küçült' : 'Tam Ekran'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-3 sm:px-4 py-2.5 bg-neutral-100/90 border-b border-neutral-200 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-2">
            {/* TAB 1: Vitrin */}
            <button
              onClick={() => setActiveTab('vitrin')}
              className={`px-3.5 py-2 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition shrink-0 ${
                activeTab === 'vitrin'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-white text-neutral-700 hover:text-neutral-950 border border-neutral-200'
              }`}
            >
              <span>Vefat İlanları</span>
              <span className="bg-rose-500/20 text-rose-700 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {approvedList.length}
              </span>
            </button>

            {/* TAB 2: İlan Ver */}
            <button
              onClick={() => setActiveTab('ilan-ver')}
              className={`px-3.5 py-2 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition shrink-0 ${
                activeTab === 'ilan-ver'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-neutral-700 hover:text-neutral-950 border border-neutral-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cenaze İlanı Paylaş</span>
            </button>

            {/* TAB 3: Onay Süreci */}
            <button
              onClick={() => setActiveTab('onay-bekleyenler')}
              className={`px-3.5 py-2 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition shrink-0 ${
                activeTab === 'onay-bekleyenler'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-neutral-700 hover:text-neutral-950 border border-neutral-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Onay Masası</span>
              {pendingList.length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {pendingList.length}
                </span>
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-neutral-500 font-semibold shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Mahalle Muhtarlığı & Aile Teyitli</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 bg-neutral-50/50">
          {/* =========================================================================
              TAB 1: VITRIN (APPROVED FUNERAL NOTICES)
             ========================================================================= */}
          {activeTab === 'vitrin' && (
            <div className="space-y-4">
              {/* Bilgilendirme ve İlan Paylaşma Çağrısı */}
              <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-slate-900 text-white rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-neutral-800">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 text-rose-400 flex items-center justify-center shrink-0">
                    <HeartCrack className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-white">
                      Bursa Osmangazi Mehmet Akif Mahallesi Vefat Masası
                    </h4>
                    <p className="text-[11px] text-neutral-300">
                      Mahalle sakinlerimizin ve komşularımızın vefat duyuruları ve cenaze vakitleri burada paylaşılmaktadır.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('ilan-ver')}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Cenaze İlanı Bildir</span>
                  </button>
                  <a
                    href="tel:188"
                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 font-bold text-xs rounded-xl border border-neutral-700 transition flex items-center gap-1.5"
                    title="Bursa Cenaze İşleri"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>ALO 188</span>
                  </a>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Merhum adı, memleketi, camii veya mezarlık ile ara..."
                  className="w-full bg-white border border-neutral-300 rounded-2xl pl-10 pr-3.5 py-2.5 text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 shadow-xs"
                />
              </div>

              {filteredApproved.length === 0 ? (
                <div className="py-8 px-4 sm:px-6 bg-white rounded-2xl border border-neutral-200/90 shadow-sm text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600">
                    <HeartCrack className="w-7 h-7 text-neutral-400" />
                  </div>
                  <div className="max-w-lg mx-auto space-y-1.5">
                    <h3 className="text-base font-black text-neutral-900">
                      Bursa Osmangazi Mehmet Akif Mahallesi'nde Onaylı Cenaze İlanı Yok
                    </h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Sistemimizde <strong>saygı ve güven</strong> ilkeleri gereğince <strong>kurgusal veya uydurma vefat kaydı kesinlikle yayınlanmamaktadır</strong>. Yalnızca mahalle sakinleri ve muhtarlık tarafından bildirilen doğrulanmış ilanlar yer alır.
                    </p>
                  </div>

                  {/* Direct official & press links inside empty state */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-2xl mx-auto text-left pt-2">
                    <a
                      href={EDEVLET_BURSA_VEFAT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-red-50 hover:bg-red-100/80 border border-red-200 rounded-xl transition flex items-center justify-between group shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-red-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                          TR
                        </span>
                        <div>
                          <div className="text-xs font-black text-red-950 group-hover:underline flex items-center gap-1">
                            e-Devlet Vefat
                          </div>
                          <div className="text-[10px] text-red-700">Resmi T.C. Ekranı</div>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-red-700 shrink-0" />
                    </a>

                    <a
                      href="tel:188"
                      className="p-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl transition flex items-center justify-between group shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                          188
                        </span>
                        <div>
                          <div className="text-xs font-black text-emerald-950 group-hover:underline flex items-center gap-1">
                            ALO 188 Cenaze
                          </div>
                          <div className="text-[10px] text-emerald-700">Bursa BŞB 7/24</div>
                        </div>
                      </div>
                      <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    </a>

                    <a
                      href={GENC_GAZETE_VEFAT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-xl transition flex items-center justify-between group shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-amber-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                          <Newspaper className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="text-xs font-black text-amber-950 group-hover:underline flex items-center gap-1">
                            Genç Gazete
                          </div>
                          <div className="text-[10px] text-amber-800">Günlük Vefat Listesi</div>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    </a>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => setActiveTab('ilan-ver')}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Cenaze İlanı Paylaş</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredApproved.map((ob) => {
                    const isBroadcasted = broadcastedId === ob.id;
                    const isCondolenceOpen = selectedObituary?.id === ob.id;

                    return (
                      <div
                        key={ob.id}
                        className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-4 space-y-3 hover:border-neutral-300 hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          {/* Title and Top Status */}
                          <div className="flex items-start justify-between gap-2 pb-2 border-b border-neutral-100">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-[15px] font-black text-neutral-900 leading-snug">
                                  {ob.name}
                                </h4>
                                <span className="text-[9.5px] font-bold bg-neutral-900 text-white px-2 py-0.5 rounded-full shrink-0">
                                  Vefat
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 font-semibold mt-0.5 flex-wrap">
                                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span>
                                  İkamet: <strong className="text-neutral-800">{ob.hometown}</strong>
                                </span>
                                {ob.hometown.toLowerCase().includes('mehmet akif') && (
                                  <span className="bg-amber-100 text-amber-900 font-black text-[9px] px-1.5 py-0.2 rounded border border-amber-300">
                                    📍 Osmangazi Mehmet Akif Mah.
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Broadcast Push Button (For Staff or Admins) */}
                            {isStaff && (
                              <button
                                onClick={() => handleBroadcastVefat(ob)}
                                title="Tüm Mahalleye Android Bildirimi Gönder"
                                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl border flex items-center gap-1 transition shrink-0 ${
                                  isBroadcasted
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                                }`}
                              >
                                {isBroadcasted ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                    <span>Gönderildi</span>
                                  </>
                                ) : (
                                  <>
                                    <BellRing className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Mahalleye Bildir</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {/* Family & Service Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                            <div className="space-y-1">
                              <div className="text-neutral-700">
                                <span className="font-bold text-neutral-900">Babasının İsmi:</span>{' '}
                                <span>{ob.fatherName}</span>
                              </div>
                              {ob.sonName && (
                                <div className="text-neutral-700">
                                  <span className="font-bold text-neutral-900">Oğlu & Yakınları:</span>{' '}
                                  <span>{ob.sonName}</span>
                                </div>
                              )}
                              <div className="text-neutral-700 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>
                                  <strong>Namaz Vakti:</strong> {ob.date}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="text-neutral-700 flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                                <span>
                                  <strong>Cami:</strong> {ob.mosque}
                                </span>
                              </div>
                              <div className="text-neutral-700 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                                <span>
                                  <strong>Defin:</strong> {ob.cemetery}
                                </span>
                              </div>
                              <div className="text-neutral-700 flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>
                                  <strong>Taziye Tel:</strong>{' '}
                                  <a
                                    href={`tel:${ob.phone}`}
                                    className="text-emerald-700 font-bold underline hover:text-emerald-800"
                                  >
                                    {ob.phone}
                                  </a>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Notes */}
                          {ob.notes && (
                            <div className="text-[11px] text-neutral-600 bg-amber-50/70 border border-amber-200/60 p-2 rounded-xl font-medium">
                              <span className="font-bold text-amber-900">Taziye & Defin Notu: </span>
                              {ob.notes}
                            </div>
                          )}
                        </div>

                        {/* Action buttons (Call, WhatsApp, Condolence) */}
                        <div className="pt-2 border-t border-neutral-100 space-y-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <a
                              href={`tel:${ob.phone}`}
                              className="flex-1 py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-[10.5px] font-bold flex items-center justify-center gap-1 transition"
                            >
                              <Phone className="w-3 h-3 text-emerald-400" />
                              <span>Aileyi Ara</span>
                            </a>

                            <a
                              href={`https://wa.me/90${ob.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                `İnna lillahi ve inna ileyhi raciun. ${ob.name} büyüğümüzün vefatını derin bir teessürle öğrendik. Merhuma Allah'tan rahmet, kederli ailenize sabırlar dilerim.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10.5px] font-bold flex items-center justify-center gap-1 transition"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>

                            <button
                              onClick={() => setSelectedObituary(isCondolenceOpen ? null : ob)}
                              className="py-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-[10.5px] font-bold flex items-center justify-center gap-1 transition"
                            >
                              <Send className="w-3 h-3" />
                              <span>Taziye ({ob.condolences?.length || 0})</span>
                            </button>
                          </div>

                          {/* Condolence Accordion */}
                          {isCondolenceOpen && (
                            <div className="pt-2 border-t border-neutral-100 space-y-2 animate-in fade-in duration-150">
                              <div className="text-[11px] font-extrabold text-neutral-900 flex items-center gap-1">
                                <MessageSquare className="w-3.5 h-3.5 text-rose-600" />
                                <span>Taziye Defteri</span>
                              </div>

                              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                                {ob.condolences && ob.condolences.length > 0 ? (
                                  ob.condolences.map((c) => (
                                    <div
                                      key={c.id}
                                      className="p-2 bg-neutral-50 rounded-xl border border-neutral-100 text-[10.5px] space-y-0.5"
                                    >
                                      <div className="flex items-center justify-between text-[10px]">
                                        <strong className="text-neutral-800">{c.author}</strong>
                                        <span className="text-neutral-400">{c.date}</span>
                                      </div>
                                      <p className="text-neutral-700">{c.message}</p>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-[10.5px] text-neutral-400 italic">
                                    Henüz taziye mesajı yazılmamış. İlk mesajı siz iletin.
                                  </p>
                                )}
                              </div>

                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  value={condolenceText}
                                  onChange={(e) => setCondolenceText(e.target.value)}
                                  placeholder="Başsağlığı mesajınızı yazın..."
                                  className="flex-1 bg-white border border-neutral-200 rounded-xl px-2.5 py-1 text-xs text-neutral-800 outline-none focus:border-rose-500"
                                />
                                <button
                                  onClick={() => handleSendCondolence(ob.id)}
                                  className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl flex items-center gap-1"
                                >
                                  <span>İlet</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 2: ILAN VER (SUBMIT NOTICE FORM)
             ========================================================================= */}
          {activeTab === 'ilan-ver' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              {!isLoggedIn ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-900">
                      Kayıtlı Kullanıcı Girişi Gereklidir
                    </h4>
                    <p className="text-xs text-amber-700 mt-1 max-w-sm mx-auto">
                      Cenaze ilanı paylaşabilmek için Mutlular platformuna kayıtlı mahalle sakini, esnaf veya muhtarlık temsilcisi olarak giriş yapmalısınız.
                    </p>
                  </div>
                  <button
                    onClick={onOpenLogin}
                    className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm"
                  >
                    <User className="w-4 h-4" />
                    <span>Giriş Yap veya Kayıt Ol</span>
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleCreateNewObituary}
                  className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                    <div>
                      <h4 className="text-sm font-black text-neutral-900 uppercase tracking-wide">
                        Yeni Cenaze İlanı Bildirim Formu
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        Girilen vefat ilanı muhtarlık / yönetici denetiminden geçerek mahalle vitrininde yayınlanır.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                      Onaylı Süreç
                    </span>
                  </div>

                  {/* 1. Cenaze Adı Soyadı */}
                  <div>
                    <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                      Cenazenin Adı Soyadı *
                    </label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Örn: Hacı Hasan Mutlu (Yaş 78)"
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* 2. Memleketi */}
                  <div>
                    <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                      İkametgah / Memleketi *
                    </label>
                    <input
                      type="text"
                      required
                      value={newHometown}
                      onChange={(e) => setNewHometown(e.target.value)}
                      placeholder="Örn: Bursa / Osmangazi / Mehmet Akif Mahallesi"
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* 3. Babasının İsmi & 4. Oğlu ve Yakınları */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                        Babasının İsmi *
                      </label>
                      <input
                        type="text"
                        required
                        value={newFatherName}
                        onChange={(e) => setNewFatherName(e.target.value)}
                        placeholder="Örn: Merhum Hüseyin Mutlu"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                        Oğlu ve Yakınlarının İsmi
                      </label>
                      <input
                        type="text"
                        value={newSonName}
                        onChange={(e) => setNewSonName(e.target.value)}
                        placeholder="Örn: Ahmet ve Mustafa Mutlu"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {/* 5. Namaz Vakti & 8. İrtibat Telefonu */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                        Cenaze Namazı Vakti *
                      </label>
                      <input
                        type="text"
                        required
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        placeholder="Örn: Bugün İkindi Namazı"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                        Taziye / İrtibat Telefonu *
                      </label>
                      <input
                        type="tel"
                        required
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="Örn: 0532 111 22 33"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {/* 6. Cami & 7. Mezarlık */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                        Kaldırılacağı Cami *
                      </label>
                      <input
                        type="text"
                        required
                        value={newMosque}
                        onChange={(e) => setNewMosque(e.target.value)}
                        placeholder="Örn: Mehmet Akif Mah. Fatih Camii"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                        Defnedileceği Mezarlık *
                      </label>
                      <input
                        type="text"
                        required
                        value={newCemetery}
                        onChange={(e) => setNewCemetery(e.target.value)}
                        placeholder="Örn: Hamitler Kent Mezarlığı"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {/* 9. Taziye Kabul Yeri / Açıklama */}
                  <div>
                    <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                      Taziye Kabul Yeri & Ek Açıklama (Opsiyonel)
                    </label>
                    <textarea
                      rows={2}
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      placeholder="Örn: Taziyeler Mehmet Akif Mahallesi taziye evi ve aile evinde kabul edilecektir."
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* Information Alert */}
                  <div className="p-3 bg-neutral-100 border border-neutral-200 rounded-xl text-[11px] text-neutral-700 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Güvenilir Mahalle Teyidi</span>
                    </div>
                    <p className="text-[10.5px] text-neutral-600">
                      Yanıltıcı veya hatalı bildirimleri önlemek adına girilen kayıtlar muhtarlık veya yönetici incelemesinden geçerek onaylanır ve ardından tüm mahalleye taziye bildirimi gönderilir.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-neutral-950 hover:bg-neutral-800 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <Send className="w-4 h-4 text-rose-400" />
                    <span>
                      {isStaff
                        ? 'İlanı Yayınla & Vitrine Ekle'
                        : 'Cenaze İlanını Onaya Gönder'}
                    </span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 3: ONAY BEKLEYENLER (APPROVAL DESK)
             ========================================================================= */}
          {activeTab === 'onay-bekleyenler' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-2.5">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-amber-900">
                    Onay Bekleyen Cenaze İlanları ({pendingList.length})
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Mahalle sakinleri tarafından gönderilen cenaze ilanları burada listelenir. Yönetici veya editör tarafından onaylandığında vitrinde yayına girer.
                  </p>
                </div>
              </div>

              {pendingList.length === 0 ? (
                <div className="py-12 text-center text-neutral-400 space-y-2 bg-white rounded-2xl border border-neutral-200 p-6">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
                  <p className="text-sm font-bold text-neutral-800">Şu anda onay bekleyen cenaze ilanı yok.</p>
                  <p className="text-xs text-neutral-500">Tüm başvurular incelenmiş ve vitrinde yayındadır.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {pendingList.map((ob) => {
                    return (
                      <div
                        key={ob.id}
                        className="bg-white border border-amber-200/90 rounded-2xl p-4 shadow-sm space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-neutral-900">{ob.name}</h4>
                              <span className="text-[9.5px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
                                Onay Bekliyor
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-600 mt-0.5">
                              Memleketi: <strong>{ob.hometown}</strong> • Gönderen: {ob.submittedBy?.name || 'Mahalle Sakini'}
                            </div>
                          </div>

                          <span className="text-[10px] text-neutral-400 font-semibold">
                            {ob.submittedBy?.date || 'Bugün'}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="text-[11px] bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 space-y-1">
                          <div><strong>Babasının İsmi:</strong> {ob.fatherName}</div>
                          {ob.sonName && <div><strong>Oğlu / Yakınları:</strong> {ob.sonName}</div>}
                          <div><strong>Namaz Vakti:</strong> {ob.date} ({ob.mosque})</div>
                          <div><strong>Defin Mezarlığı:</strong> {ob.cemetery}</div>
                          <div><strong>İrtibat Telefonu:</strong> {ob.phone}</div>
                          {ob.notes && <div className="text-neutral-500 italic">Not: {ob.notes}</div>}
                        </div>

                        {/* Staff Moderation Actions */}
                        {isStaff ? (
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => {
                                onApproveObituary && onApproveObituary(ob.id);
                                showToast(`✓ ${ob.name} cenaze ilanı onaylandı ve vitrine alındı!`);
                              }}
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Onayla & Vitrinde Yayınla</span>
                            </button>

                            <button
                              onClick={() => {
                                onRejectObituary && onRejectObituary(ob.id);
                                showToast(`✕ ${ob.name} ilanı reddedildi.`);
                              }}
                              className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Reddet</span>
                            </button>
                          </div>
                        ) : (
                          <div className="text-[11px] text-neutral-500 italic bg-neutral-100 p-2 rounded-xl text-center">
                            İlanınız editör ve yönetici onay masasında beklemektedir.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
