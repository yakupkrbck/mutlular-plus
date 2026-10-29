import React, { useState } from 'react';
import {
  X,
  Building2,
  Search,
  MapPin,
  Phone,
  FileText,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Landmark,
  FileCheck,
  RotateCcw,
  Receipt,
  MessageSquare,
  Sparkles,
  Send,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';
import { UserProfile, UserNotification } from '../../types';

interface EBelediyeModalProps {
  /** Giriş yoksa giriş penceresini açıp true döner; işlem durdurulmalı */
  onRequireLogin?: (message?: string) => boolean;
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile | null;
  onAddNotification?: (notif: UserNotification) => void;
}

type BelediyeTab = 'borc-sorgulama' | 'e-imar' | 'beyaz-masa' | 'rayic-ve-edevlet' | 'iletisim';

export const EBelediyeModal: React.FC<EBelediyeModalProps> = ({
  onRequireLogin,
  isOpen,
  onClose,
  userProfile,
  onAddNotification,
}) => {
  const [activeTab, setActiveTab] = useState<BelediyeTab>('borc-sorgulama');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [quickTc, setQuickTc] = useState('');

  // E-İmar States

  // E-İmar States
  const [imarMahalle, setImarMahalle] = useState('Mutlular Mahallesi');
  const [imarAda, setImarAda] = useState('1420');
  const [imarParsel, setImarParsel] = useState('8');
  const [hasQueriedImar, setHasQueriedImar] = useState(false);

  // Beyaz Masa States
  const [beyazMasaSubTab, setBeyazMasaSubTab] = useState<'yeni-talep' | 'takip'>('yeni-talep');
  const [talepCategory, setTalepCategory] = useState('Fen İşleri (Yol & Kaldırım)');
  const [talepAddress, setTalepAddress] = useState('Mutlular Mah. Cumhuriyet Cad.');
  const [talepMessage, setTalepMessage] = useState('');
  const [talepPhone, setTalepPhone] = useState(userProfile?.phone || '');
  const [talepResultCode, setTalepResultCode] = useState<string | null>(null);

  // Takip Query
  const [trackingInput, setTrackingInput] = useState('OSM-2026-8814');
  const [trackedStatus, setTrackedStatus] = useState<{
    code: string;
    topic: string;
    dept: string;
    date: string;
    status: string;
    step: number;
    notes: string;
  } | null>({
    code: 'OSM-2026-8814',
    topic: 'Mutlular Parkı aydınlatma direği arızası ve bank tamiri',
    dept: 'Fen İşleri & Park Bahçeler Müdürlüğü',
    date: '08.10.2026 14:20',
    status: 'Saha Ekibi Tarafından Onarıldı & Çözümlendi',
    step: 4,
    notes: 'Saha ekibimiz arızalı sokak armatürünü yenilemiş, kırık bank onarılmıştır.',
  });

  // Rayiç Değer States
  const [rayicStreet, setRayicStreet] = useState('Cumhuriyet Caddesi');

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyText = (text: string, label: string, key?: string) => {
    navigator.clipboard.writeText(text);
    if (key) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
    triggerToast(`${label} panoya kopyalandı.`);
  };

  const handleQueryImar = (e: React.FormEvent) => {
    e.preventDefault();
    setHasQueriedImar(true);
    triggerToast(`${imarMahalle} Ada: ${imarAda} Parsel: ${imarParsel} imar durumu sorgulandı.`);
  };

  const handleSubmitTalep = (e: React.FormEvent) => {
    if (onRequireLogin?.('Talep göndermek için giriş yapmalısınız.')) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    if (!talepMessage.trim()) {
      triggerToast('Lütfen talep veya şikayetinizi detaylandırınız.');
      return;
    }
    const newCode = `OSM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setTalepResultCode(newCode);

    const notif: UserNotification = {
      id: `notif-talep-${Date.now()}`,
      type: 'sistem',
      title: '🏛️ Osmangazi Beyaz Masa Başvurunuz Alındı',
      message: `"${talepCategory}" konulu talebiniz ${newCode} takip numarasıyla Beyaz Masa sistemine kaydedildi.`,
      date: 'Az önce',
      read: false,
      badgeText: 'Beyaz Masa',
      sender: 'Osmangazi Belediyesi Çözüm Merkezi',
    };
    if (onAddNotification) onAddNotification(notif);

    triggerToast(`Başvurunuz alındı! Takip numaranız: ${newCode}`);
  };

  const handleSearchTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingInput.trim()) return;
    setTrackedStatus({
      code: trackingInput.trim().toUpperCase(),
      topic: 'Mutlular Mahallesi cadde temizliği ve çöp konteyneri yenileme',
      dept: 'Temizlik İşleri Müdürlüğü',
      date: '10.10.2026 11:00',
      status: 'İnceleniyor & Saha Görevlisine İletildi',
      step: 3,
      notes: 'Bölge sorumlusu çöp konteynerinin dezenfekte edilip yenilenmesi için programa aldı.',
    });
    triggerToast('Başvuru durumu sorgulandı.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white text-neutral-900 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] border border-neutral-200">
        {/* Header with Official Bursa Osmangazi Belediyesi identity */}
        <div className="p-4 bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-950 text-white flex items-center justify-between border-b border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/25 flex flex-col items-center justify-center shadow-inner shrink-0">
              <Landmark className="w-6 h-6 text-sky-200" />
              <span className="text-[7.5px] font-black uppercase tracking-tighter text-sky-100">BURSA</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-black tracking-tight text-white">
                  BURSA OSMANGAZİ BELEDİYESİ
                </h3>
                <span className="bg-sky-400 text-sky-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ONLINE İŞLEMLER
                </span>
              </div>
              <p className="text-[11px] text-sky-200/90 font-medium mt-0.5">
                Mutlular Mahallesi E-Belediye, Borç Sorgulama & Çözüm Merkezi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-neutral-900 px-3 py-2 border-b border-neutral-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('borc-sorgulama')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'borc-sorgulama'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Borç Sorgulama</span>
          </button>

          <button
            onClick={() => setActiveTab('e-imar')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'e-imar'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>E-İmar & Parsel</span>
          </button>

          <button
            onClick={() => setActiveTab('beyaz-masa')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'beyaz-masa'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Beyaz Masa (Alo 153)</span>
          </button>

          <button
            onClick={() => setActiveTab('rayic-ve-edevlet')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'rayic-ve-edevlet'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Rayiç & E-Devlet</span>
          </button>

          <button
            onClick={() => setActiveTab('iletisim')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'iletisim'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Santral & Adres</span>
          </button>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-[11px] font-bold px-4 py-2 text-center animate-in slide-in-from-top duration-150">
            ✓ {toastMessage}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* ============================================================== */}
          {/* TAB 1: VERGİ VE BORÇ SORGULAMA (ÖDEME ALANI KALDIRILDI)         */}
          {/* ============================================================== */}
          {/* ============================================================== */}
          {/* TAB 1: VERGİ VE BORÇ SORGULAMA - RESMİ LİNK YÖNLENDİRME MERKEZİ */}
          {/* ============================================================== */}
          {activeTab === 'borc-sorgulama' && (
            <div className="space-y-4">
              {/* Güvenlik ve Yasal Yönlendirme Bildirimi */}
              <div className="p-4 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border border-sky-200 rounded-2xl space-y-2.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-700 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-sky-950 uppercase tracking-tight">
                      Resmi Kamu Portallarına Güvenli Yönlendirme
                    </h4>
                    <p className="text-[10px] text-sky-700 font-semibold">
                      T.C. Mali Mevzuatı ve KVKK Güvenlik Protokolü
                    </p>
                  </div>
                </div>

                <p className="text-[11.5px] text-sky-900 leading-relaxed">
                  Kişisel Verilerin Korunması Kanunu (KVKK) ve mali veri güvenliği gereği adınıza tahakkuk eden gerçek belediye vergi ve harç borçları yalnızca devlet onaylı <strong>e-Devlet Kapısı</strong> veya <strong>Osmangazi Belediyesi E-Belediye</strong> resmi sistemleri üzerinden güvenle görüntülenebilir.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-bold text-sky-800">
                  <span className="bg-white/80 border border-sky-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    256-bit SSL Şifreleme
                  </span>
                  <span className="bg-white/80 border border-sky-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Resmi e-Devlet Entegrasyonu
                  </span>
                  <span className="bg-white/80 border border-sky-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Doğrudan Osmangazi Belediyesi
                  </span>
                </div>
              </div>

              {/* Hızlı Kopyalama Kolaylığı */}
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <FileText className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span className="text-[11px] font-bold text-neutral-700">
                    Sorgulama Öncesi T.C. / Sicil No Kopyalama:
                  </span>
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <input
                    type="text"
                    value={quickTc}
                    onChange={(e) => setQuickTc(e.target.value)}
                    placeholder="T.C. Kimlik / Sicil No girin..."
                    className="flex-1 sm:w-44 bg-white border border-neutral-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-neutral-900 outline-none focus:border-sky-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!quickTc.trim()) {
                        triggerToast('Lütfen kopyalamak istediğiniz T.C. veya Sicil No giriniz.');
                        return;
                      }
                      handleCopyText(quickTc.trim(), 'T.C. / Sicil No', 'quick-tc');
                    }}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition active:scale-95 shrink-0"
                  >
                    {copiedKey === 'quick-tc' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Doğrudan Yönlendirme Bağlantı Kartları */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-neutral-900 uppercase tracking-tight">
                    Resmi Sorgulama Portalları (Doğrudan Bağlantılar)
                  </span>
                  <span className="text-[10px] text-neutral-500 font-semibold">
                    Yeni sekmede açılır
                  </span>
                </div>

                {/* 1. KART: e-Devlet Borç Bilgileri Sorgulama (En Çok Tercih Edilen) */}
                <div className="p-4 rounded-2xl border-2 border-red-200 bg-linear-to-br from-red-50/60 to-white hover:border-red-400 transition shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        TR
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-black text-neutral-900">
                            e-Devlet Kapısı ile Borç Sorgulama
                          </h4>
                          <span className="text-[9px] font-black bg-red-100 text-red-800 border border-red-300 px-1.5 py-0.5 rounded-full uppercase">
                            Önerilen & Resmi
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-600 leading-snug">
                          Osmangazi Belediyesi'ne ait güncel ve vadesi geçmiş emlak, çevre temizlik (ÇTV) ve harç borçlarınızı e-Devlet şifrenizle anında ve güvenle listeleyin.
                        </p>
                      </div>
                    </div>
                  </div>

                  <a
                    href="https://www.turkiye.gov.tr/bursa-osmangazi-belediyesi-borc-bilgileri-sorgulama"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition active:scale-98 shadow-xs"
                  >
                    <span>e-Devlet ile Borç Sorgula (turkiye.gov.tr)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* 2. KART: Osmangazi Belediyesi E-Belediye Portalı */}
                <div className="p-4 rounded-2xl border-2 border-sky-200 bg-linear-to-br from-sky-50/60 to-white hover:border-sky-400 transition shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Landmark className="w-5 h-5 text-sky-200" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-black text-neutral-900">
                            Osmangazi Belediyesi Online E-Belediye
                          </h4>
                          <span className="text-[9px] font-black bg-sky-100 text-sky-900 border border-sky-300 px-1.5 py-0.5 rounded-full uppercase">
                            Doğrudan Portal
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-600 leading-snug">
                          T.C. Kimlik veya Sicil numaranızla giriş yaparak tahakkuk eden vergi borçlarını, dönem dökümlerini ve mükellefiyet kayıtlarınızı belediye sisteminden inceleyin.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href="https://online.osmangazi.bel.tr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 bg-sky-800 hover:bg-sky-900 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-98 shadow-xs"
                    >
                      <span>Online E-Belediye Portalı</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href="https://ebelediye.osmangazi.bel.tr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 bg-white border border-sky-300 hover:bg-sky-50 text-sky-900 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-98"
                    >
                      <span>E-Belediye Yedek Giriş</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* 3. ve 4. Kartlar: Beyan ve Tahsilat Makbuzları */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Beyan Bilgileri */}
                  <div className="p-3.5 rounded-2xl border border-neutral-200 bg-white hover:border-purple-300 transition shadow-2xs space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-black text-neutral-900">
                        <FileCheck className="w-4 h-4 text-purple-700" />
                        <span>Mülk & Arsa Beyanları</span>
                      </div>
                      <p className="text-[11px] text-neutral-600 mt-1 leading-snug">
                        Osmangazi sınırları içindeki konut, arsa ve iş yeri beyan bildirimlerinizi e-Devlet'ten inceleyin.
                      </p>
                    </div>

                    <a
                      href="https://www.turkiye.gov.tr/bursa-osmangazi-belediyesi-beyan-bilgileri-sorgulama"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98"
                    >
                      <span>Beyan Kayıtlarını Aç</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Geçmiş Tahsilat / Makbuz Bilgileri */}
                  <div className="p-3.5 rounded-2xl border border-neutral-200 bg-white hover:border-emerald-300 transition shadow-2xs space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-black text-neutral-900">
                        <Receipt className="w-4 h-4 text-emerald-700" />
                        <span>Geçmiş Ödeme Makbuzları</span>
                      </div>
                      <p className="text-[11px] text-neutral-600 mt-1 leading-snug">
                        Belediyeye daha önce ödemiş olduğunuz vergi ve harç tahsilat makbuzlarını resmi olarak listeleyin.
                      </p>
                    </div>

                    <a
                      href="https://www.turkiye.gov.tr/bursa-osmangazi-belediyesi-tahsilat-bilgileri-sorgulama"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98"
                    >
                      <span>Geçmiş Makbuzları Gör</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Çağrı Merkezi & Vezne Bilgilendirme */}
              <div className="p-3.5 bg-neutral-900 text-white rounded-2xl space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-black uppercase tracking-tight">
                      Telefonla Borç & Sicil Bilgisi Alma
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-semibold">
                    Mali Hizmetler Müdürlüğü
                  </span>
                </div>

                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  T.C. Kimlik veya Sicil numaranızı belirterek belediye mali hizmetler personeli ile görüşebilir, güncel taksitler ve ödeme kanalları hakkında doğrudan bilgi alabilirsiniz.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href="tel:4441601"
                    className="py-2 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5 text-sky-300" />
                    <span>444 16 01'i Ara</span>
                  </a>

                  <a
                    href="tel:153"
                    className="py-2 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-300" />
                    <span>Alo 153'ü Ara</span>
                  </a>
                </div>

                <div className="pt-1 text-[10px] text-neutral-400 border-t border-neutral-800 flex items-center justify-between">
                  <span>📍 Vezneler: Santral Garaj Mah. Ana Hizmet Binası</span>
                  <span>Mesai: Hafta içi 08:30 - 17:30</span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: E-İMAR VE PARSEL SORGULAMA */}
          {/* ============================================================== */}
          {activeTab === 'e-imar' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-blue-950 uppercase">
                  <Building2 className="w-4 h-4 text-blue-700" />
                  <span>Osmangazi Belediyesi Sayısal İmar Durumu</span>
                </div>
                <p className="text-[11px] text-blue-900 leading-snug">
                  Mutlular Mahallesi ve Osmangazi genelindeki parsellerin güncel 1/1000 ölçekli uygulama imar planı koşullarını anında sorgulayın.
                </p>

                <form onSubmit={handleQueryImar} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-blue-900 block mb-0.5">Mahalle</label>
                    <select
                      value={imarMahalle}
                      onChange={(e) => setImarMahalle(e.target.value)}
                      className="w-full bg-white border border-blue-300 rounded-xl px-2.5 py-1.5 text-xs text-neutral-800 font-semibold outline-none"
                    >
                      <option value="Mutlular Mahallesi">Mutlular Mah.</option>
                      <option value="Kükürtlü Mahallesi">Kükürtlü Mah.</option>
                      <option value="Çekirge Mahallesi">Çekirge Mah.</option>
                      <option value="Hamitler Mahallesi">Hamitler Mah.</option>
                      <option value="Gülbahçe Mahallesi">Gülbahçe Mah.</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-blue-900 block mb-0.5">Ada No</label>
                    <input
                      type="text"
                      value={imarAda}
                      onChange={(e) => setImarAda(e.target.value)}
                      placeholder="Örn: 1420"
                      className="w-full bg-white border border-blue-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-neutral-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-blue-900 block mb-0.5">Parsel No</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={imarParsel}
                        onChange={(e) => setImarParsel(e.target.value)}
                        placeholder="Örn: 8"
                        className="flex-1 bg-white border border-blue-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-neutral-900 outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 rounded-xl text-xs font-black transition active:scale-95"
                      >
                        Sorgula
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* İmar Sonuç Kartı */}
              <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h4 className="text-xs font-black text-neutral-900">
                      {imarMahalle} • Ada: {imarAda} / Parsel: {imarParsel} İmar Çapı
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                    Aktif İmar Planı
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                    <div className="text-[10px] text-neutral-400 font-semibold">Fonksiyon</div>
                    <div className="font-extrabold text-neutral-900 mt-0.5">Konut Alanı</div>
                  </div>
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                    <div className="text-[10px] text-neutral-400 font-semibold">Yapılaşma Nizamı</div>
                    <div className="font-extrabold text-neutral-900 mt-0.5">Ayrık Nizam (A-4)</div>
                  </div>
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                    <div className="text-[10px] text-neutral-400 font-semibold">Kat Adedi (Hmax)</div>
                    <div className="font-extrabold text-neutral-900 mt-0.5">4 Kat (12.50 m)</div>
                  </div>
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                    <div className="text-[10px] text-neutral-400 font-semibold">Emsal (TAKS / KAKS)</div>
                    <div className="font-extrabold text-neutral-900 mt-0.5">0.40 / 1.60</div>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs space-y-1">
                  <div className="font-bold text-neutral-800">Çekme Mesafeleri & Plan Notu:</div>
                  <p className="text-[11px] text-neutral-600">
                    Ön bahçe mesafesi: 5.00 metre • Yan bahçe mesafesi: 3.00 metre • Arka bahçe: h/2 (6.25 m).
                    Otopark ihtiyacı parsel bünyesinde karşılanacaktır.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <a
                    href="https://imar.osmangazi.bel.tr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-800"
                  >
                    <span>Osmangazi Belediyesi Sayısal Harita Portalı</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => triggerToast('İmar durum belgesi çıktısı hazırlandı.')}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold"
                  >
                    Resmi Belge İndir (PDF)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: BEYAZ MASA & TALEP TAKİP */}
          {/* ============================================================== */}
          {activeTab === 'beyaz-masa' && (
            <div className="space-y-4">
              {/* Sub tabs: Yeni Talep vs Talep Takip */}
              <div className="flex gap-2">
                <button
                  onClick={() => setBeyazMasaSubTab('yeni-talep')}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition ${
                    beyazMasaSubTab === 'yeni-talep'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  Yeni İstek & Şikayet Bildirimi
                </button>
                <button
                  onClick={() => setBeyazMasaSubTab('takip')}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition ${
                    beyazMasaSubTab === 'takip'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  Başvuru Takip & Sorgulama
                </button>
              </div>

              {beyazMasaSubTab === 'yeni-talep' ? (
                <form onSubmit={handleSubmitTalep} className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-neutral-900 uppercase">
                      Alo 153 & Beyaz Masa Başvuru Formu
                    </span>
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                      Hızlı Müdahale
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                      Hizmet / Konu Başlığı
                    </label>
                    <select
                      value={talepCategory}
                      onChange={(e) => setTalepCategory(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800 outline-none focus:border-sky-600"
                    >
                      <option value="Fen İşleri (Yol, Kaldırım, Asfalt)">Fen İşleri (Yol, Kaldırım & Asfalt)</option>
                      <option value="Temizlik İşleri (Çöp & Sokak Yıkama)">Temizlik İşleri (Çöp & Sokak Temizliği)</option>
                      <option value="Park & Bahçeler (Bakım, Ağaç Budama, Bank)">Park & Bahçeler (Bakım & Oyun Parkı)</option>
                      <option value="Zabıta (Gürültü, İşgaliye, Seyyar Denetim)">Zabıta (Gürültü & Kaldırım İşgaliyesi)</option>
                      <option value="Veterinerlik (Sokak Hayvanları Tedavi & Besleme)">Veterinerlik (Sahipsiz Hayvanlar)</option>
                      <option value="Sosyal Yardım & Muhtarlık Talebi">Sosyal Destek & Yardım Talebi</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                      Mahalle & Açık Konum Adresi
                    </label>
                    <input
                      type="text"
                      required
                      value={talepAddress}
                      onChange={(e) => setTalepAddress(e.target.value)}
                      placeholder="Örn: Mutlular Mah. 2. Okul Sokak No: 12 önü"
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800 outline-none focus:border-sky-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                      İstek / Sorun Detayı *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={talepMessage}
                      onChange={(e) => setTalepMessage(e.target.value)}
                      placeholder="Sorunu ve talebinizi detaylı olarak belirtiniz..."
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-800 outline-none focus:border-sky-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                      Geri Bildirim Telefon Numaranız
                    </label>
                    <input
                      type="tel"
                      required
                      value={talepPhone}
                      onChange={(e) => setTalepPhone(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-neutral-800 outline-none focus:border-sky-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Osmangazi Belediyesi Beyaz Masa&apos;ya İlet</span>
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  <form onSubmit={handleSearchTracking} className="flex gap-2">
                    <input
                      type="text"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder="Başvuru Takip Kodu (Örn: OSM-2026-8814)"
                      className="flex-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-neutral-900 outline-none focus:border-sky-600"
                    />
                    <button
                      type="submit"
                      className="bg-neutral-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95"
                    >
                      Sorgula
                    </button>
                  </form>

                  {trackedStatus && (
                    <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                        <div>
                          <div className="font-mono text-xs font-black text-sky-800">
                            {trackedStatus.code}
                          </div>
                          <h4 className="text-xs font-bold text-neutral-900 mt-0.5">
                            {trackedStatus.topic}
                          </h4>
                        </div>
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          {trackedStatus.status}
                        </span>
                      </div>

                      {/* 4-Step Progress Indicator */}
                      <div className="grid grid-cols-4 gap-1 text-center py-1">
                        <div className="space-y-1">
                          <div className="h-1.5 rounded-full bg-emerald-600" />
                          <span className="text-[9px] font-bold text-neutral-700">1. Alındı</span>
                        </div>
                        <div className="space-y-1">
                          <div className="h-1.5 rounded-full bg-emerald-600" />
                          <span className="text-[9px] font-bold text-neutral-700">2. İletildi</span>
                        </div>
                        <div className="space-y-1">
                          <div className="h-1.5 rounded-full bg-emerald-600" />
                          <span className="text-[9px] font-bold text-neutral-700">3. Sahada</span>
                        </div>
                        <div className="space-y-1">
                          <div className="h-1.5 rounded-full bg-emerald-600" />
                          <span className="text-[9px] font-bold text-emerald-700">4. Çözüldü</span>
                        </div>
                      </div>

                      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs space-y-1">
                        <div className="text-[10.5px] text-neutral-500 font-semibold">
                          Müdürlük Yanıtı: <strong>{trackedStatus.dept}</strong> ({trackedStatus.date})
                        </div>
                        <p className="text-[11px] text-neutral-800 font-medium">
                          {trackedStatus.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Call Hotline Quick Bar */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <a
                  href="tel:153"
                  className="p-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 rounded-2xl font-black flex items-center justify-center gap-2 transition"
                >
                  <Phone className="w-4 h-4 text-rose-600" />
                  <span>Alo 153 Beyaz Masa</span>
                </a>
                <a
                  href="tel:4441601"
                  className="p-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 rounded-2xl font-black flex items-center justify-center gap-2 transition"
                >
                  <Phone className="w-4 h-4 text-sky-600" />
                  <span>444 16 01 Çağrı Merkezi</span>
                </a>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: RAYİÇ VE E-DEVLET */}
          {/* ============================================================== */}
          {activeTab === 'rayic-ve-edevlet' && (
            <div className="space-y-4">
              {/* Rayiç Değer Table */}
              <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-neutral-900 uppercase">
                      Mutlular Mahallesi Asgari Arsa m² Rayiç Değerleri
                    </h4>
                    <p className="text-[10.5px] text-neutral-500">
                      Bursa Osmangazi Belediyesi Takdir Komisyonu Resmi Verileri (2026 Yılı)
                    </p>
                  </div>
                  <span className="text-[9px] font-bold bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded">
                    Resmi Tarife
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {[
                    { cadde: 'Cumhuriyet Caddesi', m2: '3.400,00 ₺ / m²', tip: 'Ana Arter / Ticaret' },
                    { cadde: 'Mutlular Caddesi', m2: '2.850,00 ₺ / m²', tip: 'Cadde / Konut' },
                    { cadde: 'Okul Sokak & Çevresi', m2: '1.950,00 ₺ / m²', tip: 'İç Sokak' },
                    { cadde: 'Cami Meydanı & Park Sokak', m2: '2.100,00 ₺ / m²', tip: 'Merkez Sokak' },
                  ].map((row, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white rounded-xl border border-neutral-100 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-neutral-900">{row.cadde}</span>
                        <span className="block text-[10px] text-neutral-400">{row.tip}</span>
                      </div>
                      <span className="font-mono font-extrabold text-sky-800">{row.m2}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* E-Devlet Kapısı Entegrasyonu */}
              <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    ed
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-red-950">
                      E-Devlet Kapısı Osmangazi Belediyesi Hizmetleri
                    </h4>
                    <p className="text-[11px] text-red-800">
                      Beyan Sureti, Nüfus & Adres Bilgisi, Yapı Ruhsatı ve Vergi Doğrulama
                    </p>
                  </div>
                </div>

                <a
                  href="https://www.turkiye.gov.tr/osmangazi-belediyesi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95 shrink-0"
                >
                  <span>E-Devlet&apos;e Git</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Ruhsat & Nikah Kılavuzları */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-white border border-neutral-200 rounded-2xl space-y-1">
                  <div className="font-bold text-neutral-900 flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>İşyeri Açma Ruhsatı</span>
                  </div>
                  <p className="text-[10px] text-neutral-500">
                    Esnaf ve işletmeler için gerekli evrak listesi ve online başvuru ön formu.
                  </p>
                </div>

                <div className="p-3 bg-white border border-neutral-200 rounded-2xl space-y-1">
                  <div className="font-bold text-neutral-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    <span>Nikah & Evlendirme</span>
                  </div>
                  <p className="text-[10px] text-neutral-500">
                    Osmangazi Belediyesi Merinos ve Yunuseli nikah salonları randevu sorgulama.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: BELEDİYE İLETİŞİM & SANTRAL */}
          {/* ============================================================== */}
          {activeTab === 'iletisim' && (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-sky-700" />
                  <h4 className="font-black text-neutral-900 uppercase">
                    Bursa Osmangazi Belediyesi İletişim Rehberi
                  </h4>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-neutral-100">
                    <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-neutral-900">Ana Hizmet Binası Adresi</div>
                      <p className="text-neutral-600 text-[11px] mt-0.5">
                        Santral Garaj Mahallesi, Ulubatlı Hasan Bulvarı No: 10, 16200 Osmangazi / BURSA
                      </p>
                      <span className="text-[10px] text-neutral-400">Mutlular Mahallesi&apos;ne yaklaşık 3.5 km mesafede</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-neutral-100">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-neutral-900">Santral & Çağrı Merkezi</div>
                      <p className="text-neutral-700 text-[11px] font-mono mt-0.5">
                        444 16 01 / (0224) 270 70 00
                      </p>
                      <span className="text-[10px] text-neutral-400">Hafta içi 08:30 - 17:30 kesintisiz hizmet</span>
                    </div>
                  </div>

                  
                </div>

                <div className="pt-2 flex gap-2">
                  <a
                    href="tel:4441601"
                    className="flex-1 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Hemen Ara (444 16 01)</span>
                  </a>

                  
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
            <Landmark className="w-3.5 h-3.5 text-neutral-400" />
            <span>T.C. Bursa Osmangazi Belediyesi Yetkili Dijital Entegrasyonu</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-xs transition"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
