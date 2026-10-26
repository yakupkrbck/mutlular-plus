import React, { useState, useMemo } from 'react';
import {
  X,
  Wrench,
  CheckCircle2,
  Clock,
  Send,
  Phone,
  Coins,
  MapPin,
  Calendar,
  AlertCircle,
  Sparkles,
  Tag,
  Star,
  ChevronRight,
  Plus,
  Check,
  Filter,
  Briefcase,
} from 'lucide-react';
import { UstaSubmittedOffer, UserProfile, UserQuoteRequest } from '../../types';
import { USTA_ACTIVITIES } from './LoginModal';

interface UstaPaneliModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile | null;
  quoteRequests?: UserQuoteRequest[];
  onOpenJobs?: () => void;
  onUstaSubmitOffer?: (offerData: {
    requestId: string;
    customerName: string;
    price: string;
    estimatedTime: string;
    message: string;
  }) => void;
}

export const UstaPaneliModal: React.FC<UstaPaneliModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  quoteRequests = [],
  onOpenJobs,
  onUstaSubmitOffer,
}) => {
  const [activeTab, setActiveTab] = useState<'tekliflerim' | 'talepler' | 'faaliyetler'>('tekliflerim');

  // Usta Profile Data
  const ustaName = userProfile?.name || 'Kayıtlı Bölge Ustası';
  const ustaPhone = userProfile?.phone || '';

  // Activities (Multi-select)
  const [activities, setActivities] = useState<string[]>(
    userProfile?.activities && userProfile.activities.length > 0
      ? userProfile.activities
      : []
  );

  const myUid = userProfile?.uid;

  // Açık havuz: başkalarının açtığı, henüz kabul edilmemiş ve benim teklif vermediğim talepler
  const openPoolRequests = useMemo(
    () =>
      quoteRequests
        .filter(
          (q) =>
            q.status !== 'tamamlandi' &&
            q.ownerUid !== myUid &&
            !(q.offers || []).some((o) => o.ustaUid === myUid)
        )
        .map((q) => ({
          id: q.id,
          customerName: q.ownerName || 'Mahalle Sakini',
          customerPhone: q.phone,
          category: q.category,
          subCategory: q.subCategory,
          address: q.address,
          desc: q.desc,
          urgency: q.urgency,
          createdAt: q.createdAt,
        })),
    [quoteRequests, myUid]
  );

  // Verdiğim teklifler: talepler üzerindeki gerçek teklif kayıtlarından türetilir
  const submittedOffers: UstaSubmittedOffer[] = useMemo(() => {
    const list: UstaSubmittedOffer[] = [];
    quoteRequests.forEach((q) => {
      (q.offers || []).forEach((o) => {
        if (o.ustaUid !== myUid) return;
        const accepted = q.acceptedOffer?.id === o.id;
        list.push({
          id: o.id,
          requestId: q.id,
          customerName: q.ownerName || 'Mahalle Sakini',
          // Müşteri telefonu yalnızca teklifim kabul edilince gösterilir
          customerPhone: accepted ? q.phone : undefined,
          category: q.category,
          subCategory: q.subCategory,
          customerAddress: q.address,
          customerDesc: q.desc,
          offeredPrice: o.price,
          estimatedTime: o.estimatedTime,
          offerNote: o.message,
          status: accepted
            ? 'kabul-edildi'
            : q.status === 'tamamlandi'
            ? 'reddedildi'
            : 'beklemede',
          submittedAt: 'Gönderildi',
        });
      });
    });
    return list;
  }, [quoteRequests, myUid]);

  // Giving Offer Form State
  const [offeringRequestId, setOfferingRequestId] = useState<string | null>(null);
  const [offerPriceInput, setOfferPriceInput] = useState('');
  const [offerTimeInput, setOfferTimeInput] = useState('Bugün 2 Saat İçinde');
  const [offerMessageInput, setOfferMessageInput] = useState('');

  // Status Filter for Submitted Offers
  const [statusFilter, setStatusFilter] = useState<'all' | 'beklemede' | 'kabul-edildi' | 'tamamlandi'>('all');

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const toggleActivity = (act: string) => {
    setActivities((prev) =>
      prev.includes(act) ? prev.filter((a) => a !== act) : [...prev, act]
    );
  };

  const handleOpenOfferForm = (reqId: string) => {
    setOfferingRequestId(reqId);
    setOfferPriceInput('');
    setOfferMessageInput('');
  };

  const handleSubmitOffer = (e: React.FormEvent, targetReq: any) => {
    e.preventDefault();
    if (!offerPriceInput.trim()) return;

    const formattedPrice = offerPriceInput.includes('₺')
      ? offerPriceInput
      : `${offerPriceInput} ₺`;

    setOfferingRequestId(null);

    if (onUstaSubmitOffer) {
      onUstaSubmitOffer({
        requestId: targetReq.id,
        customerName: targetReq.customerName,
        price: formattedPrice,
        estimatedTime: offerTimeInput,
        message: offerMessageInput,
      });
    }

    showToast(`Teklifiniz ${targetReq.customerName} adlı kullanıcıya iletildi!`);
    setActiveTab('tekliflerim');
  };

  const filteredOffers = submittedOffers.filter((o) => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 text-neutral-900 flex flex-col w-full h-full overflow-hidden animate-in fade-in duration-200">
      <div className="bg-neutral-50 w-full h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-neutral-950 via-slate-900 to-blue-950 text-white shrink-0 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight text-white">
                  {ustaName}
                </h2>
                <div className="flex items-center gap-1 bg-amber-400 text-neutral-950 text-[10px] font-black px-1.5 py-0.5 rounded">
                  <Star className="w-3 h-3 fill-current" />
                  <span>Kayıtlı Usta</span>
                </div>
                <span className="bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Doğrulanmış Usta
                </span>
                <span className="bg-white/10 text-blue-200 text-[9px] font-bold px-2 py-0.5 rounded-full hidden sm:inline-block">
                  Tam Ekran Görünüm
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1 text-[10.5px] text-blue-200/90 font-medium">
                <span>{ustaPhone}</span>
                <span>•</span>
                <span>{activities.slice(0, 3).join(', ')}{activities.length > 3 ? ` +${activities.length - 3}` : ''}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95"
              title="Paneli Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="bg-neutral-900 border-b border-neutral-800 px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab('tekliflerim')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tekliflerim'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Verdiğim Teklifler ({submittedOffers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('talepler')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'talepler'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Gelen Talepler & Teklif Ver ({openPoolRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('faaliyetler')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'faaliyetler'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Faaliyet Alanlarım ({activities.length})</span>
          </button>

          {onOpenJobs && (
            <button
              onClick={() => {
                onClose();
                onOpenJobs();
              }}
              className="ml-auto px-3 py-1.5 rounded-xl text-xs font-black bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs shrink-0"
            >
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              <span>Çırak / Eleman İlanı Ver</span>
            </button>
          )}
        </nav>

        {/* Feedback Toast */}
        {toastMsg && (
          <div className="bg-emerald-600 text-white text-[11px] font-bold px-4 py-2 text-center animate-in slide-in-from-top duration-150">
            ✓ {toastMsg}
          </div>
        )}

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* ============================================================== */}
          {/* TAB 1: VERDİĞİM TEKLİFLER */}
          {/* ============================================================== */}
          {activeTab === 'tekliflerim' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[13px] font-black text-neutral-900 leading-tight">
                    Müşterilere Gönderdiğim Teklifler
                  </h3>
                  <p className="text-[10.5px] text-neutral-500 font-medium">
                    Mahalle sakinlerinin taleplerine sunduğunuz fiyat ve süreler
                  </p>
                </div>

                {/* Filter pills */}
                <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      statusFilter === 'all'
                        ? 'bg-white text-neutral-900 shadow-2xs'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Tümü ({submittedOffers.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('kabul-edildi')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      statusFilter === 'kabul-edildi'
                        ? 'bg-emerald-50 text-emerald-800 shadow-2xs'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Kabul ({submittedOffers.filter((o) => o.status === 'kabul-edildi').length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('beklemede')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      statusFilter === 'beklemede'
                        ? 'bg-amber-50 text-amber-800 shadow-2xs'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Bekleyen ({submittedOffers.filter((o) => o.status === 'beklemede').length})
                  </button>
                </div>
              </div>

              {filteredOffers.length === 0 ? (
                <div className="text-center py-10 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                  <Clock className="w-8 h-8 text-neutral-400 mx-auto" />
                  <p className="text-[12px] font-bold text-neutral-700">
                    Bu filtrede henüz teklifiniz bulunmuyor.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredOffers.map((offer) => (
                    <div
                      key={offer.id}
                      className="p-3.5 rounded-2xl border border-neutral-200 bg-white hover:border-blue-300 transition space-y-2 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2 pb-2 border-b border-neutral-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-[12.5px] font-black text-neutral-900">
                              {offer.subCategory}
                            </h4>
                            <span
                              className={`text-[9.5px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 ${
                                offer.status === 'kabul-edildi'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : offer.status === 'tamamlandi'
                                  ? 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {offer.status === 'kabul-edildi' && (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Teklif Kabul Edildi!</span>
                                </>
                              )}
                              {offer.status === 'beklemede' && (
                                <>
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Kullanıcı Değerlendiriyor</span>
                                </>
                              )}
                              {offer.status === 'tamamlandi' && (
                                <>
                                  <Check className="w-3 h-3 text-neutral-600" />
                                  <span>İş Tamamlandı</span>
                                </>
                              )}
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-500 font-medium mt-0.5">
                            {offer.category} • Müşteri: <strong>{offer.customerName}</strong> • {offer.customerAddress}
                          </p>
                        </div>

                        {/* Price Badge */}
                        <div className="text-right shrink-0">
                          <span className="text-[14px] font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200 inline-block">
                            {offer.offeredPrice}
                          </span>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-neutral-50 text-[11px] text-neutral-700 font-medium">
                        <strong className="text-neutral-900">Teklif Açıklamanız:</strong> {offer.offerNote}
                        <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-3">
                          <span>⏱️ Tahmini Süre: {offer.estimatedTime}</span>
                          <span>📅 Gönderilme: {offer.submittedAt}</span>
                        </div>
                      </div>

                      {offer.status === 'kabul-edildi' && (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-800">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Müşteri İletişim: {offer.customerPhone}</span>
                          </div>
                          <a
                            href={`tel:${offer.customerPhone}`}
                            className="bg-emerald-600 text-white text-[10.5px] font-black px-3 py-1 rounded-lg hover:bg-emerald-700 transition"
                          >
                            Hemen Ara
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: GELEN TALEPLER & TEKLİF VER */}
          {/* ============================================================== */}
          {activeTab === 'talepler' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-[13px] font-black text-neutral-900 leading-tight">
                  Mahalleden Gelen Açık Hizmet Talepleri
                </h3>
                <p className="text-[10.5px] text-neutral-500 font-medium">
                  Branşlarınıza uygun işleri inceleyin ve doğrudan teklif verin
                </p>
              </div>

              <div className="space-y-2.5">
                {openPoolRequests.length === 0 ? (
                  <div className="text-center py-10 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                    <Wrench className="w-8 h-8 text-neutral-400 mx-auto" />
                    <p className="text-[12px] font-bold text-neutral-700">
                      Şu anda mahalleden açık talep bulunmuyor.
                    </p>
                    <p className="text-[10px] text-neutral-500">
                      Mahalle sakinleri usta talebi oluşturduğunda burada listelenecektir.
                    </p>
                  </div>
                ) : (
                  openPoolRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-2xl border border-neutral-200 bg-white hover:border-blue-300 transition space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-900 text-[9.5px] font-black px-2 py-0.5 rounded-md">
                            {req.category}
                          </span>
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-bold px-1.5 py-0.2 rounded">
                            {req.urgency}
                          </span>
                          <span className="text-[9.5px] text-neutral-400 font-medium ml-auto">
                            {req.createdAt}
                          </span>
                        </div>
                        <h4 className="text-[12.5px] font-black text-neutral-900 mt-1">
                          {req.subCategory}
                        </h4>
                        <p className="text-[10.5px] text-neutral-500 font-medium">
                          {req.address} • {req.customerName}
                        </p>
                      </div>
                    </div>

                    <p className="p-2 rounded-xl bg-neutral-50 text-[11px] text-neutral-700 font-medium leading-relaxed">
                      &quot;{req.desc}&quot;
                    </p>

                    {/* Offering Box inside item */}
                    {offeringRequestId === req.id ? (
                      <form
                        onSubmit={(e) => handleSubmitOffer(e, req)}
                        className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 space-y-2.5 animate-in fade-in duration-150"
                      >
                        <div className="flex items-center justify-between pb-1 border-b border-blue-200">
                          <span className="text-[11px] font-black text-blue-900">
                            Fiyat Teklifi Hazırla
                          </span>
                          <button
                            type="button"
                            onClick={() => setOfferingRequestId(null)}
                            className="text-neutral-400 hover:text-neutral-700"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9.5px] font-bold text-neutral-600 uppercase mb-1">
                              Teklif Ettiğiniz Ücret (₺)
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Örn: 750 ₺"
                              value={offerPriceInput}
                              onChange={(e) => setOfferPriceInput(e.target.value)}
                              className="w-full bg-white border border-blue-200 rounded-xl px-2.5 py-1.5 text-[12px] font-bold outline-none focus:border-blue-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[9.5px] font-bold text-neutral-600 uppercase mb-1">
                              Tahmini Başlama / Bitiş
                            </label>
                            <input
                              type="text"
                              value={offerTimeInput}
                              onChange={(e) => setOfferTimeInput(e.target.value)}
                              className="w-full bg-white border border-blue-200 rounded-xl px-2.5 py-1.5 text-[11.5px] font-medium outline-none focus:border-blue-600"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9.5px] font-bold text-neutral-600 uppercase mb-1">
                            Müşteriye Not / Usta Mesajı
                          </label>
                          <input
                            type="text"
                            placeholder="Örn: Malzeme dahil garantili montaj yapabilirim."
                            value={offerMessageInput}
                            onChange={(e) => setOfferMessageInput(e.target.value)}
                            className="w-full bg-white border border-blue-200 rounded-xl px-2.5 py-1.5 text-[11.5px] font-medium outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setOfferingRequestId(null)}
                            className="px-3 py-1.5 text-[10.5px] font-bold text-neutral-600 hover:text-neutral-900"
                          >
                            İptal
                          </button>
                          <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black px-4 py-1.5 rounded-xl transition shadow-xs flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Teklifi Gönder</span>
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleOpenOfferForm(req.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>Bu Talebe Teklif Ver</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: FAALİYET ALANLARIM (MULTI-SELECT) */}
          {/* ============================================================== */}
          {activeTab === 'faaliyetler' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-[13px] font-black text-neutral-900 leading-tight">
                  Usta Faaliyet ve Hizmet Alanları
                </h3>
                <p className="text-[10.5px] text-neutral-500 font-medium">
                  Mahallede hizmet verdiğiniz alanları işaretleyin (Birden çok seçilebilir)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {USTA_ACTIVITIES.map((act) => {
                  const isSelected = activities.includes(act);
                  return (
                    <button
                      key={act}
                      type="button"
                      onClick={() => toggleActivity(act)}
                      className={`p-3 rounded-2xl text-left border transition flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 shadow-2xs text-blue-900'
                          : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700'
                      }`}
                    >
                      <span className="text-[11.5px] font-black">{act}</span>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-neutral-300 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                <h4 className="text-[11.5px] font-black text-neutral-900">
                  Usta Ayarları & Acil Çağrı
                </h4>
                <div className="flex items-center justify-between text-[11px] font-medium text-neutral-700">
                  <span>Mutlular Mahallesinde Acil Çağrı Kabul Et</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-blue-600 w-4 h-4"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-medium text-neutral-700">
                  <span>Yeni Teklif Taleplerinde SMS / Bildirim Gönder</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-blue-600 w-4 h-4"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => showToast('Faaliyet alanlarınız başarıyla güncellendi.')}
                className="w-full bg-neutral-900 hover:bg-black text-white font-black text-[12px] py-2.5 rounded-xl transition shadow-xs"
              >
                Faaliyet Alanlarını Kaydet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
