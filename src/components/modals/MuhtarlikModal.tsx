import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Building2,
  Navigation,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
  Check,
  Zap,
  Droplets,
  Flame,
  User,
  Inbox,
  Share2,
  Calendar,
  FileCheck,
  HelpCircle,
  Mail,
  Award,
  Sparkles,
  Copy,
} from 'lucide-react';
import { UserProfile, MuhtarlikApplication } from '../../types';
import { sendAndroidAppNotification } from '../../services/androidNotificationService';
import { useMuhtarInfo, saveMuhtarInfo, MuhtarInfo, telHref, waHref, mapsHref, telDigits } from '../../services/muhtarInfo';

interface MuhtarlikModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSaglikOcagi?: () => void;
  userProfile?: UserProfile | null;
  initialTab?: 'iletisim' | 'talep' | 'evrak' | 'rehber' | 'basvurular';
  applications?: MuhtarlikApplication[];
  onNewApplication?: (app: MuhtarlikApplication) => void;
  onUpdateApplicationStatus?: (
    id: string,
    newStatus: MuhtarlikApplication['status'],
    notes?: string
  ) => void;
}

type TabType = 'iletisim' | 'talep' | 'evrak' | 'rehber' | 'basvurular';

const DEFAULT_SAMPLE_APPLICATIONS: MuhtarlikApplication[] = [];

export const MuhtarlikModal: React.FC<MuhtarlikModalProps> = ({
  isOpen,
  onClose,
  onOpenSaglikOcagi,
  userProfile,
  initialTab,
  applications: externalApps,
  onNewApplication,
  onUpdateApplicationStatus,
}) => {
  const isMuhtar = userProfile?.role === 'muhtar';
  const isYonetici = userProfile?.role === 'yonetici';
  const canAccessMuhtarDesk = isMuhtar || isYonetici;

  // Muhtarlık iletişim bilgileri (Firestore'dan canlı; yönetici/muhtar düzenleyebilir)
  const info = useMuhtarInfo();
  const canEditInfo = isMuhtar || isYonetici;
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoDraft, setInfoDraft] = useState<MuhtarInfo>(info);
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);
  const startEditInfo = () => {
    setInfoDraft(info);
    setInfoError(null);
    setEditingInfo(true);
  };
  const submitInfo = async () => {
    if (!infoDraft.ad.trim() || !infoDraft.telefon.trim()) {
      setInfoError('Ad soyad ve telefon boş bırakılamaz.');
      return;
    }
    setInfoSaving(true);
    setInfoError(null);
    try {
      await saveMuhtarInfo({
        ad: infoDraft.ad.trim(),
        unvan: infoDraft.unvan.trim() || 'Mahalle Muhtarı',
        telefon: infoDraft.telefon.trim(),
        whatsapp: infoDraft.whatsapp.trim(),
        eposta: infoDraft.eposta.trim(),
        adres: infoDraft.adres.trim(),
        mesai: infoDraft.mesai.trim(),
      });
      setEditingInfo(false);
    } catch (e: any) {
      setInfoError(e?.code === 'permission-denied' ? 'Bu işlem için yetkiniz yok.' : 'Kaydedilemedi. Tekrar deneyin.');
    } finally {
      setInfoSaving(false);
    }
  };

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (initialTab) return initialTab;
    if (isMuhtar) return 'basvurular';
    return 'iletisim';
  });

  // Local applications state (synced with parent or localStorage)
  const [localApplications, setLocalApplications] = useState<MuhtarlikApplication[]>(() => {
    try {
      const saved = localStorage.getItem('mutlular_muhtarlik_applications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (p: MuhtarlikApplication) => !['MAKIF-1042', 'MAKIF-2089', 'MAKIF-3115'].includes(p.id)
          );
        }
      }
    } catch {}
    return DEFAULT_SAMPLE_APPLICATIONS;
  });

  // Keep synced if external applications prop is provided
  useEffect(() => {
    if (externalApps && externalApps.length > 0) {
      setLocalApplications(externalApps);
    }
  }, [externalApps]);

  // If initialTab changes, update activeTab
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    } else if (isMuhtar && activeTab !== 'basvurular') {
      setActiveTab('basvurular');
    }
  }, [initialTab, isMuhtar]);

  // Talep formu state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    category: 'Aydınlatma',
    message: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  // Muhtar Desk Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'bekliyor' | 'inceleniyor' | 'belediyeye_iletildi' | 'tamamlandi'>('all');
  const [activeEditingNoteId, setActiveEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyText = (text: string, key: string, label: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(text);
      }
      setCopiedKey(key);
      showToast(`${label} kopyalandı.`);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {}
  };

  const pendingCount = useMemo(() => {
    return localApplications.filter((a) => a.status === 'bekliyor').length;
  }, [localApplications]);

  // Filtered applications for the Muhtar Desk
  const filteredApplications = useMemo(() => {
    return localApplications.filter((app) => {
      if (statusFilter !== 'all' && app.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = app.citizenName.toLowerCase().includes(q);
        const matchPhone = app.phone.toLowerCase().includes(q);
        const matchStreet = app.street.toLowerCase().includes(q);
        const matchCategory = app.category.toLowerCase().includes(q);
        const matchId = app.id.toLowerCase().includes(q);
        const matchMsg = app.message.toLowerCase().includes(q);
        return matchName || matchPhone || matchStreet || matchCategory || matchId || matchMsg;
      }
      return true;
    });
  }, [localApplications, statusFilter, searchQuery]);

  // Citizen Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) return;

    const generatedId = `MAKIF-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) + ', Bugün';

    const newApp: MuhtarlikApplication = {
      id: generatedId,
      citizenName: formData.name,
      phone: formData.phone,
      street: formData.street || 'Mehmet Akif Mah.',
      category: formData.category,
      message: formData.message,
      createdAt: nowStr,
      status: 'bekliyor',
    };

    // Update local state and persistence
    const updatedList = [newApp, ...localApplications];
    setLocalApplications(updatedList);
    try {
      localStorage.setItem('mutlular_muhtarlik_applications', JSON.stringify(updatedList));
    } catch {}

    // Notify parent
    if (onNewApplication) {
      onNewApplication(newApp);
    }

    // Play native notification chime & vibration
    try {
      await sendAndroidAppNotification({
        id: `push-muhtar-${Date.now()}`,
        title: '🏛️ Yeni Muhtarlık Başvurusu & Talebi Geldi!',
        body: `${formData.name} (${formData.street || 'Mehmet Akif Mah.'}): ${formData.category} - "${formData.message.slice(0, 75)}..."`,
        type: 'muhtarlik',
        badgeText: 'RESMİ TALEP',
        actionTab: 'muhtar_paneli',
        relatedId: generatedId,
      });
    } catch (err) {
      console.warn('Push error:', err);
    }

    setTicketId(generatedId);
    setFormSubmitted(true);
    showToast('Talebiniz Muhtarlık sistemine kaydedildi ve bildirim gönderildi.');
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      phone: '',
      street: '',
      category: 'Aydınlatma',
      message: '',
    });
    setFormSubmitted(false);
    setTicketId('');
  };

  // Muhtar Status Update
  const handleStatusChange = (appId: string, newStatus: MuhtarlikApplication['status']) => {
    const updated = localApplications.map((app) =>
      app.id === appId
        ? {
            ...app,
            status: newStatus,
            updatedAt: 'Az önce',
          }
        : app
    );
    setLocalApplications(updated);
    try {
      localStorage.setItem('mutlular_muhtarlik_applications', JSON.stringify(updated));
    } catch {}

    if (onUpdateApplicationStatus) {
      onUpdateApplicationStatus(appId, newStatus);
    }

    const statusLabels: Record<MuhtarlikApplication['status'], string> = {
      bekliyor: 'Beklemede',
      inceleniyor: 'İnceleniyor olarak işaretlendi',
      belediyeye_iletildi: 'Osmangazi Belediyesine Sevk Edildi',
      tamamlandi: 'Çözüldü / Tamamlandı',
    };
    showToast(`Talep durumu güncellendi: ${statusLabels[newStatus]}`);
  };

  // Save Muhtar Official Note
  const handleSaveNote = (appId: string) => {
    const updated = localApplications.map((app) =>
      app.id === appId
        ? {
            ...app,
            officialNotes: noteDraft.trim() || undefined,
            updatedAt: 'Az önce',
          }
        : app
    );
    setLocalApplications(updated);
    try {
      localStorage.setItem('mutlular_muhtarlik_applications', JSON.stringify(updated));
    } catch {}

    if (onUpdateApplicationStatus) {
      const target = updated.find((a) => a.id === appId);
      if (target) {
        onUpdateApplicationStatus(appId, target.status, noteDraft.trim());
      }
    }

    setActiveEditingNoteId(null);
    setNoteDraft('');
    showToast('Muhtarlık resmi notu kaydedildi.');
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Aydınlatma':
        return '💡';
      case 'Temizlik':
        return '🧹';
      case 'Asfalt':
        return '🚧';
      case 'Sosyal Yardım':
        return '📦';
      case 'Evrak':
        return '📄';
      case 'Park':
        return '🌳';
      default:
        return '✍️';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 text-neutral-900 flex flex-col w-full h-full overflow-hidden animate-in fade-in duration-200">
      <div className="bg-white w-full h-full flex flex-col overflow-hidden relative">
        
        {/* TOAST MESSAGE */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white text-xs font-black px-4 py-2 rounded-2xl shadow-xl border border-white/20 animate-in fade-in slide-in-from-top-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ÜST BAŞLIK (HEADER) - Resmi T.C. Kırmızı & Beyaz Teması */}
        <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white p-4 sm:p-5 shrink-0 relative overflow-hidden shadow-md">
          {/* Arka plan dekoratif hareler */}
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute left-1/4 -top-10 w-28 h-28 bg-white/5 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10 gap-3">
            <div className="flex items-center gap-3">
              {/* T.C. Mühür / Bayrak Rozeti */}
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black text-2xl shadow-inner border border-white/30 shrink-0">
                🏛️
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                    Mehmet Akif Mahallesi Muhtarlığı
                  </h2>
                  
                </div>
                <p className="text-[11px] sm:text-xs text-rose-100 font-medium mt-0.5">
                  Mehmet Akif Mahallesi • İletişim ve Başvuru
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              title="Kapat"
              className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 flex items-center justify-center text-white transition cursor-pointer border border-white/20 shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Muhtar Resmi Yetkili Girişi Bildirimi */}
          {canAccessMuhtarDesk && (
            <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 text-rose-100">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-extrabold text-white">
                  {userProfile?.name || info.ad}
                </span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-black border border-white/30">
                  {userProfile?.title || 'Resmi Yetkili • Mahalle Muhtarı'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-white/90">
                <span>{pendingCount > 0 ? `⚠️ ${pendingCount} Bekleyen Talep Var` : '✅ Tüm Talepler İncelendi'}</span>
              </div>
            </div>
          )}

          {/* HIZLI SEKMELER */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3 mt-1">
            {[
              { id: 'iletisim', label: '📞 İletişim & Konum' },
              { id: 'talep', label: '✉️ Talep & İstek Bildir' },
              {
                id: 'basvurular',
                label: `📥 Gelen Başvurular`,
                badge: pendingCount > 0 ? pendingCount : undefined,
                highlight: true,
              },
              { id: 'evrak', label: '📄 Tebligat & Evraklar' },
              { id: 'rehber', label: '🏢 Kurumlar & Acil' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-white text-red-700 shadow-xs'
                    : tab.id === 'basvurular'
                    ? 'bg-red-950/40 text-rose-100 border border-white/20 hover:bg-white/25'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                      activeTab === tab.id
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-white text-red-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* İÇERİK ALANI */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-neutral-50/70">
          
          {/* SEKME 1: İLETİŞİM & KONUM */}
          {activeTab === 'iletisim' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* MUHTAR İLETİŞİM KARTI: bilgiler Firestore'dan gelir, yönetici düzenleyebilir */}
              <div className="bg-white rounded-3xl p-5 border border-red-200/90 shadow-md space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10.5px] font-black uppercase tracking-wider text-red-700">
                      {info.unvan}
                    </span>
                    <h3 className="text-xl font-black text-neutral-900 leading-tight mt-0.5">{info.ad}</h3>
                  </div>
                  {canEditInfo && !editingInfo && (
                    <button
                      type="button"
                      onClick={startEditInfo}
                      className="shrink-0 text-[11px] font-black text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-100"
                    >
                      Bilgileri Düzenle
                    </button>
                  )}
                </div>

                {editingInfo ? (
                  <div className="space-y-2.5">
                    {([
                      ['ad', 'Ad Soyad'],
                      ['unvan', 'Unvan'],
                      ['telefon', 'Telefon'],
                      ['whatsapp', 'WhatsApp (boşsa telefon kullanılır)'],
                      ['eposta', 'E-posta'],
                      ['adres', 'Adres'],
                      ['mesai', 'Çalışma saatleri (isteğe bağlı)'],
                    ] as [keyof MuhtarInfo, string][]).map(([key, label]) => (
                      <label key={key} className="block">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase">{label}</span>
                        <input
                          value={infoDraft[key]}
                          onChange={(e) => setInfoDraft({ ...infoDraft, [key]: e.target.value })}
                          className="mt-0.5 w-full border border-neutral-300 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-red-500"
                        />
                      </label>
                    ))}
                    {infoError && <p className="text-[11px] font-bold text-rose-600">{infoError}</p>}
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        disabled={infoSaving}
                        onClick={submitInfo}
                        className="flex-1 bg-red-700 hover:bg-red-800 disabled:opacity-60 text-white rounded-xl py-2.5 text-xs font-black"
                      >
                        {infoSaving ? 'Kaydediliyor…' : 'Kaydet'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingInfo(false)}
                        className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl py-2.5 text-xs font-black"
                      >
                        Vazgeç
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-neutral-200/80">
                      {info.telefon && (
                        <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200/80 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                              <Phone className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-neutral-400 uppercase block">Telefon</span>
                              <a href={telHref(info.telefon)} className="text-xs font-black text-neutral-900 truncate block">
                                {info.telefon}
                              </a>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyText(telDigits(info.telefon), 'tel', 'Telefon numarası')}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
                            title="Numarayı Kopyala"
                          >
                            {copiedKey === 'tel' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}

                      {info.eposta && (
                        <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200/80 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                              <Mail className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-neutral-400 uppercase block">E-posta</span>
                              <a href={`mailto:${info.eposta}`} className="text-xs font-black text-neutral-900 truncate block">
                                {info.eposta}
                              </a>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyText(info.eposta, 'mail', 'E-posta adresi')}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
                            title="E-postayı Kopyala"
                          >
                            {copiedKey === 'mail' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}

                      {info.adres && (
                        <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200/80 flex items-center justify-between gap-2 sm:col-span-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-neutral-400 uppercase block">Adres</span>
                              <span className="text-xs font-black text-neutral-900 block">{info.adres}</span>
                            </div>
                          </div>
                          <a
                            href={mapsHref(info.adres)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Google Haritalar'da Aç"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}

                      {info.mesai && (
                        <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200/80 sm:col-span-2 text-xs font-bold text-neutral-800">
                          🕒 {info.mesai}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {info.telefon && (
                        <a href={telHref(info.telefon)} className="bg-red-700 hover:bg-red-800 text-white rounded-2xl py-2.5 px-3 text-xs font-black flex items-center justify-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          <span>Hemen Ara</span>
                        </a>
                      )}
                      {(info.whatsapp || info.telefon) && (
                        <a
                          href={waHref(info.whatsapp || info.telefon, 'Merhaba Muhtarım, Mehmet Akif Mahallesi sakinlerindenim.')}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-2.5 px-3 text-xs font-black flex items-center justify-center gap-1.5"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      {info.eposta && (
                        <a href={`mailto:${info.eposta}`} className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl py-2.5 px-3 text-xs font-black flex items-center justify-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-rose-300" />
                          <span>E-Posta</span>
                        </a>
                      )}
                      {info.adres && (
                        <a
                          href={mapsHref(info.adres)}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-rose-50 hover:bg-rose-100 text-red-700 border border-red-200 rounded-2xl py-2.5 px-3 text-xs font-black flex items-center justify-center gap-1.5"
                        >
                          <Navigation className="w-3.5 h-3.5 text-red-600" />
                          <span>Yol Tarifi</span>
                        </a>
                      )}
                    </div>
                  </>
                )}

                <div className="pt-2 border-t border-neutral-200/80 flex items-center justify-between gap-2 text-xs text-neutral-600 font-bold">
                  <button type="button" onClick={() => setActiveTab('talep')} className="text-red-700 hover:underline flex items-center gap-1 cursor-pointer">
                    <Send className="w-3.5 h-3.5" />
                    <span>Muhtara Doğrudan Talep Bildir &rsaquo;</span>
                  </button>
                  <button type="button" onClick={() => setActiveTab('evrak')} className="text-neutral-600 hover:underline flex items-center gap-1 cursor-pointer">
                    <FileCheck className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Askıdaki Tebligatlar &rsaquo;</span>
                  </button>
                </div>
              </div>

              {/* Sağlık Ocağı Entegrasyonu */}
              {onOpenSaglikOcagi && (
                <div
                  onClick={onOpenSaglikOcagi}
                  className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer hover:shadow-xs transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                      🏥
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-teal-950">
                        Mutlular Aile Sağlığı Merkezi (Sağlık Ocağı)
                      </h4>
                      <p className="text-[11px] text-teal-800">
                        Mehmet Akif Aile Sağlığı Merkezi hakkında bilgiler
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-teal-800 bg-white px-2.5 py-1 rounded-lg border border-teal-200">
                    İncele &rsaquo;
                  </span>
                </div>
              )}
            </div>
          )}

          {/* SEKME 2: TALEP & İSTEK BİLDİR */}
          {activeTab === 'talep' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {formSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-emerald-950">
                      Talebiniz Muhtarlığa İletildi!
                    </h3>
                    <p className="text-xs text-emerald-800 mt-1 max-w-md mx-auto">
                      Sayın <strong className="font-bold">{formData.name}</strong>, başvurunuz resmi muhtarlık kayıtlarına alındı. Mahalle Muhtarı {info.ad} veya ilgili belediye birimi inceleme yapacaktır.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-emerald-200 inline-block shadow-2xs">
                    <span className="text-[11px] font-bold text-neutral-400 block">
                      Talep Takip Referansı
                    </span>
                    <span className="text-sm font-black text-emerald-800 tracking-wider">
                      {ticketId}
                    </span>
                  </div>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <button
                      onClick={handleResetForm}
                      className="px-4 py-2 bg-emerald-700 text-white text-xs font-black rounded-xl hover:bg-emerald-800 transition active:scale-95 shadow-xs"
                    >
                      Yeni Talep Gönder
                    </button>
                    <button
                      onClick={() => setActiveTab('basvurular')}
                      className="px-4 py-2 bg-white border border-emerald-300 text-emerald-800 text-xs font-black rounded-xl hover:bg-emerald-50 transition active:scale-95 shadow-xs"
                    >
                      Gelen Başvuruları İncele
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="bg-white rounded-3xl p-4 sm:p-5 border border-neutral-200/90 shadow-xs space-y-3">
                  <div>
                    <h3 className="text-sm font-black text-neutral-900">
                      Muhtara Doğrudan Talep & Şikayet Bildir
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Mahallemizdeki arıza, sokak aydınlatması, çöp, asfalt, yeşil alan veya sosyal destek taleplerinizi iletin. Talebiniz anında muhtara bildirim olarak iletilir.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        Adınız Soyadınız *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: Ahmet Yılmaz"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-neutral-50 text-neutral-900 text-xs rounded-xl p-2.5 border border-neutral-200 focus:bg-white focus:border-red-500 focus:outline-hidden transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        Telefon Numaranız *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="05XX XXX XX XX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-neutral-50 text-neutral-900 text-xs rounded-xl p-2.5 border border-neutral-200 focus:bg-white focus:border-red-500 focus:outline-hidden transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        Sokak / Cadde / Kapı No
                      </label>
                      <input
                        type="text"
                        placeholder="Örn: Fındıklı Sok. No:12"
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        className="w-full bg-neutral-50 text-neutral-900 text-xs rounded-xl p-2.5 border border-neutral-200 focus:bg-white focus:border-red-500 focus:outline-hidden transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        Talep Türü
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-neutral-50 text-neutral-900 text-xs rounded-xl p-2.5 border border-neutral-200 focus:bg-white focus:border-red-500 focus:outline-hidden transition"
                      >
                        <option value="Aydınlatma">💡 Sokak Aydınlatması / Lamba Arızası</option>
                        <option value="Temizlik">🧹 Çöp Konteyneri / Mahalle Temizliği</option>
                        <option value="Asfalt">🚧 Asfalt, Çukur & Kaldırım Onarımı</option>
                        <option value="Sosyal Yardım">📦 Erzak & Sosyal Destek Başvurusu</option>
                        <option value="Evrak">📄 Tebligat & Evrak Teslimatı</option>
                        <option value="Park">🌳 Park Bakımı & Yeşil Alanlar</option>
                        <option value="Öneri">✍️ Mahalle Güzelleştirme & Öneri</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      Talep / Mesaj Detayı *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Lütfen talebinizi veya mahalleyle ilgili konuyu detaylı olarak yazınız..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-neutral-50 text-neutral-900 text-xs rounded-xl p-2.5 border border-neutral-200 focus:bg-white focus:border-red-500 focus:outline-hidden transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-2.5 px-4 text-xs font-black flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Talebi Muhtarlığa Gönder (Bildirim İlet)</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* SEKME 3: GELEN BAŞVURULAR & MUHTARLIK YÖNETİM MASASI */}
          {activeTab === 'basvurular' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              
              {/* Muhtar Resmi Yetkili Üst Banner */}
              <div className="bg-gradient-to-r from-red-900 via-neutral-900 to-rose-950 text-white p-4 rounded-3xl border border-red-500/40 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-red-600/30 backdrop-blur-md border border-red-400/40 text-white flex items-center justify-center font-black text-xl shadow-inner">
                      🏛️
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                          Resmi Yetkili Masası
                        </span>
                        <span className="text-[10px] text-rose-200 font-bold">
                          T.C. Osmangazi
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-white mt-0.5">
                        Gelen Vatandaş Başvuruları & Talepler
                      </h3>
                      <p className="text-[11px] text-rose-200/90 font-medium line-clamp-1">
                        Mehmet Akif ve Mutlular mahalle sakinlerinden gelen anlık başvuruları inceleyin, durumu güncelleyin ve vatandaşa yanıt verin.
                      </p>
                    </div>
                  </div>
                </div>

                {/* İstatistik Rozetleri */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3 border-t border-white/10 text-center">
                  <div className="bg-white/10 p-2 rounded-xl backdrop-blur-xs">
                    <span className="text-[10px] text-rose-200 block font-bold">Toplam Başvuru</span>
                    <span className="text-base font-black text-white">{localApplications.length}</span>
                  </div>
                  <div className="bg-red-500/20 p-2 rounded-xl border border-red-500/30">
                    <span className="text-[10px] text-red-200 block font-bold">Bekleyen</span>
                    <span className="text-base font-black text-white">{pendingCount}</span>
                  </div>
                  <div className="bg-amber-500/20 p-2 rounded-xl border border-amber-500/30">
                    <span className="text-[10px] text-amber-200 block font-bold">İşlemde</span>
                    <span className="text-base font-black text-white">
                      {localApplications.filter((a) => a.status === 'inceleniyor' || a.status === 'belediyeye_iletildi').length}
                    </span>
                  </div>
                  <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-200 block font-bold">Çözülen</span>
                    <span className="text-base font-black text-white">
                      {localApplications.filter((a) => a.status === 'tamamlandi').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Arama ve Filtre Çubuğu */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Vatandaş adı, telefon, sokak veya talep içeriğinde ara..."
                    className="w-full bg-white text-neutral-900 text-xs rounded-2xl pl-9 pr-3 py-2.5 border border-neutral-200 shadow-2xs focus:border-red-500 focus:outline-hidden"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs font-bold"
                    >
                      Temizle
                    </button>
                  )}
                </div>

                {/* Filtre Butonları */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
                  {[
                    { id: 'all', label: 'Tümü' },
                    { id: 'bekliyor', label: '⏳ Bekleyen', count: pendingCount },
                    { id: 'inceleniyor', label: '🔍 İnceleniyor' },
                    { id: 'belediyeye_iletildi', label: '🏛️ Belediyeye İletildi' },
                    { id: 'tamamlandi', label: '✅ Çözüldü' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setStatusFilter(filter.id as typeof statusFilter)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer flex items-center gap-1 ${
                        statusFilter === filter.id
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <span>{filter.label}</span>
                      {filter.count !== undefined && filter.count > 0 && (
                        <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded-full font-black">
                          {filter.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Başvuru Kartları Listesi */}
              <div className="space-y-3">
                {filteredApplications.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 border border-neutral-200 text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center text-xl">
                      📭
                    </div>
                    <h4 className="text-sm font-black text-neutral-800">Başvuru Bulunamadı</h4>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                      {searchQuery
                        ? 'Arama kriterlerinize uyan başvuru bulunamadı.'
                        : 'Seçili filtrede henüz kayıtlı başvuru yok.'}
                    </p>
                  </div>
                ) : (
                  filteredApplications.map((app) => {
                    const isPending = app.status === 'bekliyor';
                    const isInProgress = app.status === 'inceleniyor';
                    const isSentToBelediye = app.status === 'belediyeye_iletildi';
                    const isDone = app.status === 'tamamlandi';
                    const cleanPhone = app.phone.replace(/\D/g, '').replace(/^0/, '');

                    return (
                      <div
                        key={app.id}
                        className={`bg-white rounded-3xl p-4 border transition shadow-xs space-y-3 relative overflow-hidden ${
                          isPending
                            ? 'border-red-300 ring-1 ring-red-100 hover:border-red-400'
                            : isDone
                            ? 'border-emerald-200 hover:border-emerald-300'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        {isPending && (
                          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-red-600 animate-pulse" />
                        )}

                        {/* Kart Üst Bilgisi */}
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center text-lg shrink-0 border border-neutral-200">
                              {getCategoryIcon(app.category)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs sm:text-sm font-black text-neutral-900 truncate">
                                  {app.citizenName}
                                </h4>
                                <span className="text-[10px] font-bold text-neutral-400 font-mono">
                                  #{app.id}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-neutral-500 flex-wrap">
                                <span className="font-bold text-neutral-700">{app.street}</span>
                                <span>•</span>
                                <span>{app.createdAt}</span>
                              </div>
                            </div>
                          </div>

                          {/* Durum Rozeti */}
                          <div>
                            {isPending && (
                              <span className="text-[10.5px] font-black bg-red-100 text-red-800 border border-red-200 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                                Beklemede (Yeni)
                              </span>
                            )}
                            {isInProgress && (
                              <span className="text-[10.5px] font-black bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full">
                                🔍 İnceleniyor
                              </span>
                            )}
                            {isSentToBelediye && (
                              <span className="text-[10.5px] font-black bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-full">
                                🏛️ Belediyeye İletildi
                              </span>
                            )}
                            {isDone && (
                              <span className="text-[10.5px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Çözüldü
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Talep Metni */}
                        <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-100 text-xs text-neutral-800 leading-relaxed">
                          <div className="flex items-center gap-1.5 font-bold text-neutral-500 text-[10px] uppercase mb-1">
                            <span>Kategori:</span>
                            <span className="text-red-700 font-black">{app.category}</span>
                          </div>
                          <p className="font-medium text-neutral-700 select-text">
                            &ldquo;{app.message}&rdquo;
                          </p>
                        </div>

                        {/* Muhtar Notu Varsa */}
                        {app.officialNotes && activeEditingNoteId !== app.id && (
                          <div className="p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-1">
                            <div className="flex items-center justify-between text-[10.5px] font-black text-amber-900">
                              <span>🏛️ Muhtarlık Resmi Notu:</span>
                              <button
                                onClick={() => {
                                  setActiveEditingNoteId(app.id);
                                  setNoteDraft(app.officialNotes || '');
                                }}
                                className="text-amber-700 hover:underline font-bold text-[10px]"
                              >
                                Düzenle
                              </button>
                            </div>
                            <p className="text-[11.5px] text-amber-800 font-medium">
                              {app.officialNotes}
                            </p>
                          </div>
                        )}

                        {/* Not Düzenleme Formu */}
                        {activeEditingNoteId === app.id && (
                          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 space-y-2">
                            <label className="block text-[11px] font-bold text-amber-950">
                              Muhtar Notu / İşlem Açıklaması:
                            </label>
                            <textarea
                              rows={2}
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              placeholder="Örn: Fen işleri müdürlüğü bilgilendirildi, yarın sabah asfalt ekibi girecek..."
                              className="w-full bg-white text-neutral-900 text-xs rounded-xl p-2 border border-amber-300 focus:outline-hidden"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setActiveEditingNoteId(null)}
                                className="px-2.5 py-1 text-xs text-neutral-600 hover:text-neutral-900"
                              >
                                Vazgeç
                              </button>
                              <button
                                onClick={() => handleSaveNote(app.id)}
                                className="px-3 py-1 bg-amber-700 text-white rounded-lg text-xs font-bold hover:bg-amber-800 transition"
                              >
                                Notu Kaydet
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Alt Aksiyon Çubuğu: Durum Değiştirme & İletişim */}
                        <div className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                          {/* Durum Değiştirme Butonları */}
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-[10px] font-bold text-neutral-400 mr-1">
                              Durum:
                            </span>
                            <button
                              onClick={() => handleStatusChange(app.id, 'inceleniyor')}
                              className={`px-2 py-1 rounded-lg text-[10.5px] font-bold transition ${
                                app.status === 'inceleniyor'
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                              }`}
                            >
                              İncele
                            </button>
                            <button
                              onClick={() => handleStatusChange(app.id, 'belediyeye_iletildi')}
                              className={`px-2 py-1 rounded-lg text-[10.5px] font-bold transition ${
                                app.status === 'belediyeye_iletildi'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                              }`}
                            >
                              Belediyeye İlet
                            </button>
                            <button
                              onClick={() => handleStatusChange(app.id, 'tamamlandi')}
                              className={`px-2 py-1 rounded-lg text-[10.5px] font-bold transition ${
                                app.status === 'tamamlandi'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                              }`}
                            >
                              Çözüldü
                            </button>
                          </div>

                          {/* İletişim & Not Butonları */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {activeEditingNoteId !== app.id && !app.officialNotes && (
                              <button
                                onClick={() => {
                                  setActiveEditingNoteId(app.id);
                                  setNoteDraft('');
                                }}
                                className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl text-[11px] transition"
                              >
                                + Not Ekle
                              </button>
                            )}

                            <a
                              href={`tel:${app.phone.replace(/[^0-9]/g, '')}`}
                              className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-black rounded-xl text-[11px] flex items-center gap-1 transition"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Ara</span>
                            </a>

                            <a
                              href={`https://wa.me/90${cleanPhone}?text=Merhaba%20Say%C4%B1n%20${encodeURIComponent(
                                app.citizenName
                              )}%2C%20Mehmet%20Akif%20Mahallesi%20Muhtar%C4%B1m%C4%B1z%20${encodeURIComponent(info.ad)}%20ad%C4%B1na%20${encodeURIComponent(
                                app.id
                              )}%20nolu%20${encodeURIComponent(app.category)}%20talebinizle%20ilgili%20bilgilendirmek%20isteriz.`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-[11px] flex items-center gap-1 shadow-2xs transition"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* SEKME 4: TEBLİGAT & RESMİ EVRAKLAR */}
          {activeTab === 'evrak' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-3xl space-y-1.5 text-xs text-amber-900">
                <div className="flex items-center gap-1.5 font-black text-amber-950">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Askıdaki Tebligatlar Hakkında Önemli Bilgi</span>
                </div>
                <p className="text-amber-800 leading-relaxed font-medium">
                  PTT tarafından adresinizde bulunamadığınızda resmi mahkeme, vergi, icra veya idari tebligatlar Tebligat Kanunu&apos;nun 21. maddesi gereğince mahalle muhtarlığına teslim edilir. Kapınıza ihbarname bırakıldığı tarihten itibaren teslim alınması yasal süreler açısından kritiktir.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  {
                    title: 'Tebligat Teslim Alma Koşulları',
                    desc: 'Tebligatınızı bizzat kimlik kartınız (T.C. Kimlik) ile veya resmi vekaletnameye sahip yakınınız teslim alabilir.',
                    badge: 'Şahsen Teslim',
                  },
                  {
                    title: 'İkametgah & Adres Beyanı',
                    desc: 'Adres değişiklikleri öncelikli olarak E-Devlet kapısı veya Osmangazi İlçe Nüfus Müdürlüğü üzerinden yapılmaktadır.',
                    badge: 'E-Devlet / Nüfus',
                  },
                  {
                    title: 'Sosyal Yardım Muhtarlık İncelemesi',
                    desc: 'Osmangazi Belediyesi veya Kaymakamlık SYDV yardım başvurularında muhtarlık hane durum onayı yapmaktadır.',
                    badge: 'Sosyal Destek',
                  },
                  {
                    title: 'Nüfus Cüzdanı Kayıp & Yenileme',
                    desc: 'Kimlik yenileme randevuları Alo 199 veya randevu.nvi.gov.tr adresinden alınmaktadır.',
                    badge: 'Nüfus İşlemleri',
                  },
                ].map((item, i) => (
                  <div key={i} className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-neutral-900">{item.title}</h4>
                      <span className="text-[10px] font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-neutral-600 font-medium leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEKME 5: KURUMLAR & ACİL NUMARALAR */}
          {activeTab === 'rehber' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    name: 'Osmangazi Belediyesi Beyaz Masa',
                    phone: '444 16 01',
                    desc: 'Belediye talep, temizlik, zabıta ve fen işleri',
                    icon: Building2,
                    color: 'text-blue-700 bg-blue-50',
                  },
                  {
                    name: 'Bursa Büyükşehir Çağrı Merkezi',
                    phone: '153',
                    desc: 'Ulaşım, ana cadde bakımı ve su arıza',
                    icon: Building2,
                    color: 'text-indigo-700 bg-indigo-50',
                  },
                  {
                    name: 'UEDAŞ Elektrik Arıza',
                    phone: '186',
                    desc: 'Sokak aydınlatması ve elektrik kesintileri',
                    icon: Zap,
                    color: 'text-amber-700 bg-amber-50',
                  },
                  {
                    name: 'BUSKİ Su & Kanalizasyon',
                    phone: '185',
                    desc: 'Su arızaları ve kanal onarımları',
                    icon: Droplets,
                    color: 'text-cyan-700 bg-cyan-50',
                  },
                  {
                    name: 'Bursagaz Doğalgaz Acil',
                    phone: '187',
                    desc: 'Doğalgaz kaçağı ve acil müdahale',
                    icon: Flame,
                    color: 'text-orange-700 bg-orange-50',
                  },
                  {
                    name: '112 Acil Çağrı Merkezi',
                    phone: '112',
                    desc: 'Ambulans, Polis, İtfaiye, Jandarma tek hat',
                    icon: ShieldCheck,
                    color: 'text-red-700 bg-red-50',
                  },
                ].map((org, i) => {
                  const Icon = org.icon;
                  return (
                    <div
                      key={i}
                      className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-2xs flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${org.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-neutral-900 truncate">
                            {org.name}
                          </h4>
                          <p className="text-[10px] text-neutral-500 truncate">
                            {org.desc}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`tel:${org.phone.replace(/[^0-9]/g, '')}`}
                        className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-black shrink-0 transition active:scale-95"
                      >
                        {org.phone}
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* ALT BİLGİLENDİRME ÇUBUĞU */}
        <div className="bg-neutral-100/80 px-4 py-2.5 border-t border-neutral-200 shrink-0 flex items-center justify-between text-[11px] text-neutral-500">
          <span>Mehmet Akif Mahallesi Muhtarlığı</span>
          <span className="font-bold text-neutral-700">{info.telefon ? `İletişim: ${info.telefon}` : ''}</span>
        </div>

      </div>
    </div>
  );
};
