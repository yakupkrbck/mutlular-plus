import React, { useState, useMemo } from 'react';
import {
  X,
  Stethoscope,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  TestTube2,
  Syringe,
  FileCheck2,
  ShieldCheck,
  AlertTriangle,
  Info,
  CalendarCheck,
  FileText,
  Building2,
  Navigation,
  CheckCircle,
} from 'lucide-react';
import {
  MEHMET_AKIF_50_ASM,
  SAGLIK_RAPORLARI_DATA,
  SaglikRaporuTuru,
} from '../../data/saglikOcagiData';

interface SaglikOcagiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPharmacy?: () => void;
}

type ModalTab = 'merkez' | 'raporlar' | 'tahlil-asi';

export const SaglikOcagiModal: React.FC<SaglikOcagiModalProps> = ({
  isOpen,
  onClose,
  onOpenPharmacy,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('merkez');
  const [selectedReportId, setSelectedReportId] = useState<string>('ehliyet-raporu');

  // Çalışma saati kontrolü (canlı durum)
  const isCurrentlyOpen = useMemo(() => {
    const now = new Date();
    const day = now.getDay(); // 0: Pazar, 6: Cumartesi
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentMinutes = hours * 60 + minutes;

    // Hafta sonu kapalı
    if (day === 0 || day === 6) return false;

    // 08:00 (480) - 17:00 (1020), öğle molası 12:30 (750) - 13:30 (810)
    if (currentMinutes >= 480 && currentMinutes < 1020) {
      if (currentMinutes >= 750 && currentMinutes < 810) {
        return 'ogle';
      }
      return true;
    }
    return false;
  }, []);

  if (!isOpen) return null;

  const selectedReport: SaglikRaporuTuru =
    SAGLIK_RAPORLARI_DATA.find((r) => r.id === selectedReportId) ||
    SAGLIK_RAPORLARI_DATA[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white text-neutral-900 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-neutral-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-800 via-emerald-800 to-teal-900 text-white flex items-center justify-between border-b border-teal-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 text-white flex items-center justify-center shadow-inner shrink-0">
              <Stethoscope className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-[14px] sm:text-[15px] font-black tracking-tight text-white leading-tight">
                  {MEHMET_AKIF_50_ASM.kisaAd}
                </h3>
                <span className="bg-emerald-400 text-teal-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  MUTLULAR
                </span>
                {isCurrentlyOpen === true && (
                  <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    Şu an Açık
                  </span>
                )}
                {isCurrentlyOpen === 'ogle' && (
                  <span className="bg-amber-500/30 text-amber-200 border border-amber-400/40 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    Öğle Arası
                  </span>
                )}
                {isCurrentlyOpen === false && (
                  <span className="bg-white/20 text-teal-100 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    Şu an Kapalı
                  </span>
                )}
              </div>
              <p className="text-[11px] text-teal-100/90 font-medium mt-0.5">
                {MEHMET_AKIF_50_ASM.bolge} • Mehmet Akif & Mutlular Mah.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-teal-800/80 hover:bg-teal-700 text-teal-100 hover:text-white flex items-center justify-center transition shrink-0 ml-2 cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hızlı Aksiyon Barı */}
        <div className="bg-teal-50/70 border-b border-teal-100 px-3 py-2.5 flex items-center justify-between gap-2 overflow-x-auto text-[11px] font-bold shrink-0 no-scrollbar">
          <a
            href={MEHMET_AKIF_50_ASM.telefonHref}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition shrink-0"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>0224 246 87 01</span>
          </a>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              MEHMET_AKIF_50_ASM.haritaAdres
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-teal-800 border border-teal-200 hover:bg-teal-100/50 transition shrink-0"
          >
            <Navigation className="w-3.5 h-3.5 text-teal-600" />
            <span>Yol Tarifi</span>
          </a>

          <a
            href="https://www.mhrs.gov.tr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-teal-800 border border-teal-200 hover:bg-teal-100/50 transition shrink-0"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>MHRS Randevu</span>
          </a>

          <a
            href="https://enabiz.gov.tr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white text-teal-800 border border-teal-200 hover:bg-teal-100/50 transition shrink-0"
          >
            <ExternalLink className="w-3 h-3 text-teal-600" />
            <span>e-Nabız</span>
          </a>
        </div>

        {/* Tab Butonları */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-3 pt-2 gap-1.5 shrink-0 text-[12px] font-bold">
          <button
            onClick={() => setActiveTab('merkez')}
            className={`py-2 px-3 rounded-t-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'merkez'
                ? 'bg-white text-teal-900 border-t-2 border-teal-600 shadow-2xs font-black'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Merkez & İletişim</span>
          </button>

          <button
            onClick={() => setActiveTab('raporlar')}
            className={`py-2 px-3 rounded-t-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'raporlar'
                ? 'bg-white text-teal-900 border-t-2 border-teal-600 shadow-2xs font-black'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Sağlık Raporları</span>
          </button>

          <button
            onClick={() => setActiveTab('tahlil-asi')}
            className={`py-2 px-3 rounded-t-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tahlil-asi'
                ? 'bg-white text-teal-900 border-t-2 border-teal-600 shadow-2xs font-black'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <TestTube2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Tahlil & Aşı</span>
          </button>
        </div>

        {/* İçerik Alanı */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-3.5 flex-1 text-[13px]">
          {/* TAB 1: MERKEZ & İLETİŞİM */}
          {activeTab === 'merkez' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {/* Temel Bilgi Kartı */}
              <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200/80 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-neutral-900 text-[12.5px]">Resmi Adres:</div>
                    <div className="text-neutral-700 text-[12px] leading-relaxed">
                      {MEHMET_AKIF_50_ASM.adres}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-neutral-200">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-[12px] space-y-0.5">
                    <div className="font-bold text-neutral-900">Çalışma Saatleri:</div>
                    <div className="text-neutral-700">{MEHMET_AKIF_50_ASM.calismaSaatleri.haftaIci}</div>
                    <div className="text-amber-700 font-medium text-[11px]">{MEHMET_AKIF_50_ASM.calismaSaatleri.ogleMolasi}</div>
                    <div className="text-neutral-500 text-[11px]">{MEHMET_AKIF_50_ASM.calismaSaatleri.haftaSonu}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-neutral-200">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-[12px]">
                    <span className="font-bold text-neutral-900">Telefon: </span>
                    <a href={MEHMET_AKIF_50_ASM.telefonHref} className="text-emerald-700 font-bold hover:underline">
                      {MEHMET_AKIF_50_ASM.telefon}
                    </a>
                  </div>
                </div>
              </div>

              {/* Aile Hekimi Sistemi Bilgilendirmesi (Net ve Gerçek) */}
              <div className="bg-teal-50/60 rounded-2xl p-3.5 border border-teal-200/70 space-y-2">
                <div className="flex items-center gap-2 text-teal-900 font-black text-[12.5px]">
                  <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>Kayıtlı Aile Hekimi Sistemi</span>
                </div>
                <p className="text-neutral-700 text-[12px] leading-relaxed">
                  Sağlık Bakanlığı kuralları uyarınca muayene, reçete yazımı ve sağlık raporu işlemleri yalnızca{' '}
                  <strong className="text-neutral-900">sisteme kayıtlı olduğunuz aile hekimi</strong> tarafından yapılır.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11.5px]">
                  <a
                    href="https://enabiz.gov.tr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-xl bg-white border border-teal-200 text-teal-900 hover:bg-teal-100/50 transition font-medium"
                  >
                    <span>1. e-Nabız'dan Hekiminizi Görün</span>
                    <ChevronRight className="w-3.5 h-3.5 text-teal-600" />
                  </a>
                  <a
                    href="https://www.mhrs.gov.tr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-xl bg-white border border-teal-200 text-teal-900 hover:bg-teal-100/50 transition font-medium"
                  >
                    <span>2. MHRS / 182 ile Randevu Alın</span>
                    <ChevronRight className="w-3.5 h-3.5 text-teal-600" />
                  </a>
                </div>
              </div>

              {/* Verilen Temel Hizmetler */}
              <div className="bg-white rounded-2xl p-3.5 border border-neutral-200 space-y-2">
                <div className="font-bold text-neutral-900 text-[12.5px] flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Merkezde Sunulan Sağlık Hizmetleri</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11.5px] text-neutral-700">
                  {MEHMET_AKIF_50_ASM.hizmetler.map((hizmet, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-neutral-50 px-2.5 py-1.5 rounded-lg border border-neutral-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="line-clamp-1">{hizmet}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nöbetçi / Acil Yönlendirme */}
              <div className="bg-amber-50/70 rounded-2xl p-3 border border-amber-200 flex items-start gap-2.5 text-[11.5px] text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold">Mesai Dışı & Hafta Sonu Durumu:</span>
                  <p className="text-amber-800 leading-relaxed">
                    ASM hafta sonları ve akşam 17:00 sonrasında kapalıdır. Acil durumlar için en yakın hastaneler olan Çekirge Devlet Hastanesi veya Bursa Şehir Hastanesi Acil Servislerine başvurunuz. İlaç ihtiyaçlarınız için nöbetçi eczaneleri kontrol edebilirsiniz.
                  </p>
                  {onOpenPharmacy && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenPharmacy();
                      }}
                      className="mt-1 text-teal-800 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Nöbetçi Eczaneleri Görüntüle</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SAĞLIK RAPORLARI REHBERİ */}
          {activeTab === 'raporlar' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {/* Rapor Seçim Butonları */}
              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                  Rapor Türünü Seçin:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {SAGLIK_RAPORLARI_DATA.map((rep) => {
                    const isSelected = rep.id === selectedReportId;
                    return (
                      <button
                        key={rep.id}
                        onClick={() => setSelectedReportId(rep.id)}
                        className={`text-left p-2 rounded-xl border text-[11.5px] font-bold transition flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                            : 'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        <span className="line-clamp-1">{rep.title}</span>
                        <span
                          className={`text-[9.5px] font-semibold mt-1 px-1.5 py-0.5 rounded-md inline-block self-start ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : rep.asmDurumu === 'Verilir'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rep.asmDurumu}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seçilen Rapor Detayı */}
              <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200 space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-neutral-200 pb-2.5">
                  <div>
                    <h4 className="text-[13.5px] font-black text-neutral-900 leading-tight">
                      {selectedReport.title}
                    </h4>
                    <p className="text-[11.5px] text-neutral-600 mt-0.5">
                      {selectedReport.shortDesc}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-black px-2 py-1 rounded-lg shrink-0 border ${selectedReport.badgeTone}`}
                  >
                    {selectedReport.badge}
                  </span>
                </div>

                {/* Özet ve Geçerlilik */}
                <div className="space-y-1 text-[12px]">
                  <p className="text-neutral-700 leading-relaxed font-medium">
                    {selectedReport.ozet}
                  </p>
                  <div className="text-[11px] text-neutral-500 pt-1">
                    <strong className="text-neutral-700">Geçerlilik Süresi:</strong> {selectedReport.validity}
                  </div>
                </div>

                {/* Ön Şartlar & Belgeler */}
                <div className="bg-white rounded-xl p-3 border border-neutral-200/90 space-y-1.5">
                  <div className="text-[11.5px] font-bold text-neutral-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-teal-700" />
                    <span>Ön Şartlar ve Gerekli Belgeler:</span>
                  </div>
                  <ul className="space-y-1 text-[11.5px] text-neutral-700">
                    {selectedReport.onSartlar.map((sart, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-teal-600 font-bold shrink-0">•</span>
                        <span>{sart}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Adım Adım İşlem Sırası */}
                <div className="bg-white rounded-xl p-3 border border-neutral-200/90 space-y-1.5">
                  <div className="text-[11.5px] font-bold text-neutral-900 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Nasıl Alınır? (İşlem Adımları):</span>
                  </div>
                  <ol className="space-y-1 text-[11.5px] text-neutral-700">
                    {selectedReport.adimlar.map((adim, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="font-bold text-neutral-900 shrink-0">{i + 1}.</span>
                        <span>{adim.replace(/^\d+\.\s*/, '')}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Önemli Uyarı / Mevzuat Notu */}
                {selectedReport.onemliNot && (
                  <div className="bg-amber-50 rounded-xl p-2.5 border border-amber-200/80 flex items-start gap-2 text-[11.5px] text-amber-900">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{selectedReport.onemliNot}</p>
                  </div>
                )}

                {/* e-Devlet Link Butonu */}
                {selectedReport.eDevletUrl && (
                  <a
                    href={selectedReport.eDevletUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-teal-800 text-white font-bold text-[12px] hover:bg-teal-900 transition shadow-xs"
                  >
                    <span>e-Devlet Form Başvurusu Sayfasını Aç</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TAHLİL & AŞI BİLGİLERİ */}
          {activeTab === 'tahlil-asi' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {/* Kan & İdrar Tahlilleri */}
              <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200 space-y-2.5">
                <div className="flex items-center gap-2 text-neutral-900 font-bold text-[13px] border-b border-neutral-200 pb-2">
                  <TestTube2 className="w-4 h-4 text-blue-600" />
                  <span>Kan ve İdrar Tahlili Alma Saatleri</span>
                </div>
                <div className="space-y-1.5 text-[12px] text-neutral-700">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900">Tahlil Günleri:</span>
                    <span className="font-bold text-teal-800">{MEHMET_AKIF_50_ASM.tahlilSaatleri.gunler}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900">Örnek Alım Saati:</span>
                    <span className="font-bold text-rose-700">{MEHMET_AKIF_50_ASM.tahlilSaatleri.saat} (Sabah)</span>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11.5px] text-blue-900">
                    <strong>Açlık Şartı:</strong> {MEHMET_AKIF_50_ASM.tahlilSaatleri.aclikNotu}
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11.5px] text-amber-900">
                    <strong>Cuma Günü Uyarısı:</strong> {MEHMET_AKIF_50_ASM.tahlilSaatleri.cumaNotu}
                  </div>
                  <div className="text-[11.5px] text-neutral-600 pt-1">
                    <strong>Sonuçlar Ne Zaman Çıkar?</strong> {MEHMET_AKIF_50_ASM.tahlilSaatleri.sonucVakti}
                  </div>
                </div>

                <a
                  href="https://enabiz.gov.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-white border border-neutral-300 text-teal-900 font-bold text-[11.5px] hover:bg-neutral-100 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-teal-700" />
                  <span>Tahlil Sonuçlarımı e-Nabız'dan Gör</span>
                </a>
              </div>

              {/* Aşı & Bebek / Gebe İzlem */}
              <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200 space-y-2.5">
                <div className="flex items-center gap-2 text-neutral-900 font-bold text-[13px] border-b border-neutral-200 pb-2">
                  <Syringe className="w-4 h-4 text-emerald-600" />
                  <span>Aşı ve Gebe / Bebek İzlem Takvimi</span>
                </div>
                <div className="space-y-1.5 text-[12px] text-neutral-700">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900">Aşı Günleri:</span>
                    <span className="font-bold text-teal-800">{MEHMET_AKIF_50_ASM.asiSaatleri.gunler}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900">Uygulama Saatleri:</span>
                    <span className="font-bold text-neutral-900">{MEHMET_AKIF_50_ASM.asiSaatleri.saatler}</span>
                  </div>
                  <p className="text-[11.5px] text-neutral-600 pt-1 leading-relaxed">
                    Sağlık Bakanlığı Ulusal Çocukluk Dönemi Aşı Takvimi kapsamındaki aşılar ve gebe tetanos/izlemleri aile hekimliği birimi aşı odasında ücretsiz olarak uygulanır.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Alt Footer */}
        <div className="p-3 bg-neutral-100/90 border-t border-neutral-200 text-center text-[11px] text-neutral-500 shrink-0">
          Osmangazi 50 No'lu Mehmet Akif Aile Sağlığı Merkezi • {MEHMET_AKIF_50_ASM.adres}
        </div>
      </div>
    </div>
  );
};
