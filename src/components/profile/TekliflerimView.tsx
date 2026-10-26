import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  ChevronRight,
  MapPin,
  Calendar,
  Phone,
  Coins,
  ShieldCheck,
  PlusCircle,
  X,
  Star,
  Check,
  Layers,
  ArrowUpRight,
  Filter,
  Trash2
} from 'lucide-react';
import { UserQuoteRequest, QuoteRequestStatus, MasterOffer } from '../../types';

interface TekliflerimViewProps {
  quotes: UserQuoteRequest[];
  onOpenCreateQuote: () => void;
  onAcceptOffer?: (requestId: string, offer: MasterOffer) => void;
  onCancelRequest?: (requestId: string) => void;
}

export const TekliflerimView: React.FC<TekliflerimViewProps> = ({
  quotes,
  onOpenCreateQuote,
  onAcceptOffer,
  onCancelRequest,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | QuoteRequestStatus>('all');
  const [selectedRequestForOffers, setSelectedRequestForOffers] = useState<UserQuoteRequest | null>(null);

  // Status counts
  const counts = {
    all: quotes.length,
    beklemede: quotes.filter((q) => q.status === 'beklemede').length,
    'teklif-geldi': quotes.filter((q) => q.status === 'teklif-geldi').length,
    tamamlandi: quotes.filter((q) => q.status === 'tamamlandi').length,
  };

  const filteredQuotes = quotes.filter((q) => {
    if (activeFilter === 'all') return true;
    return q.status === activeFilter;
  });

  const getStatusBadge = (status: QuoteRequestStatus, offersCount = 0) => {
    switch (status) {
      case 'beklemede':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black bg-amber-50 text-amber-800 border border-amber-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Beklemede • Ustalar İnceliyor</span>
          </span>
        );
      case 'teklif-geldi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
            <Sparkles className="w-3 h-3 text-emerald-600 fill-emerald-500" />
            <span>Teklif Geldi ({offersCount} Usta)</span>
          </span>
        );
      case 'tamamlandi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black bg-blue-50 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>Tamamlandı</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-3.5 animate-in fade-in duration-200">
      {/* 1. Header Banner & New Request Action */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-3xl p-4 text-white border border-neutral-800 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[14px] font-black text-white leading-tight">
                Teklif Taleplerim
              </h3>
              <p className="text-[10px] text-neutral-400 font-semibold">
                Bölgedeki ustalardan gelen tekliflerin takibi
              </p>
            </div>
          </div>

          <button
            onClick={onOpenCreateQuote}
            className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 font-black text-[11px] px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 text-neutral-950" />
            <span>Yeni Talep</span>
          </button>
        </div>

        {/* Info strip */}
        <div className="bg-white/10 rounded-xl p-2.5 text-[10.5px] text-neutral-300 flex items-center gap-2 border border-white/10">
          <Coins className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Ustalar gönderdiğiniz her talebe teklif sunarken kredi harcar. Böylece doğrudan aranmaz, sadece ciddi teklifler alırsınız.
          </span>
        </div>
      </div>

      {/* 2. Metric Stat Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div
          onClick={() => setActiveFilter('beklemede')}
          className={`p-2.5 rounded-2xl border text-center cursor-pointer transition ${
            activeFilter === 'beklemede'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/20'
              : 'bg-white border-neutral-200 hover:bg-neutral-50 shadow-2xs'
          }`}
        >
          <div className="text-[18px] font-black text-amber-600 leading-tight">
            {counts.beklemede}
          </div>
          <div className="text-[10px] font-black text-neutral-600 mt-0.5">
            Beklemede
          </div>
        </div>

        <div
          onClick={() => setActiveFilter('teklif-geldi')}
          className={`p-2.5 rounded-2xl border text-center cursor-pointer transition ${
            activeFilter === 'teklif-geldi'
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/20'
              : 'bg-white border-neutral-200 hover:bg-neutral-50 shadow-2xs'
          }`}
        >
          <div className="text-[18px] font-black text-emerald-600 leading-tight">
            {counts['teklif-geldi']}
          </div>
          <div className="text-[10px] font-black text-neutral-600 mt-0.5">
            Teklif Geldi
          </div>
        </div>

        <div
          onClick={() => setActiveFilter('tamamlandi')}
          className={`p-2.5 rounded-2xl border text-center cursor-pointer transition ${
            activeFilter === 'tamamlandi'
              ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/20'
              : 'bg-white border-neutral-200 hover:bg-neutral-50 shadow-2xs'
          }`}
        >
          <div className="text-[18px] font-black text-blue-600 leading-tight">
            {counts.tamamlandi}
          </div>
          <div className="text-[10px] font-black text-neutral-600 mt-0.5">
            Tamamlandı
          </div>
        </div>
      </div>

      {/* 3. Filter Segmented Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition active:scale-95 ${
            activeFilter === 'all'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200 shadow-2xs'
          }`}
        >
          Tümü ({counts.all})
        </button>

        <button
          onClick={() => setActiveFilter('beklemede')}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition active:scale-95 flex items-center gap-1.5 ${
            activeFilter === 'beklemede'
              ? 'bg-amber-500 text-neutral-950 font-black shadow-xs'
              : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200 shadow-2xs'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Beklemede ({counts.beklemede})</span>
        </button>

        <button
          onClick={() => setActiveFilter('teklif-geldi')}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition active:scale-95 flex items-center gap-1.5 ${
            activeFilter === 'teklif-geldi'
              ? 'bg-emerald-600 text-white font-black shadow-xs'
              : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200 shadow-2xs'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Teklif Geldi ({counts['teklif-geldi']})</span>
        </button>

        <button
          onClick={() => setActiveFilter('tamamlandi')}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition active:scale-95 flex items-center gap-1.5 ${
            activeFilter === 'tamamlandi'
              ? 'bg-blue-600 text-white font-black shadow-xs'
              : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200 shadow-2xs'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Tamamlandı ({counts.tamamlandi})</span>
        </button>
      </div>

      {/* 4. Quote Requests List */}
      <div className="space-y-3">
        {filteredQuotes.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center space-y-3 border border-neutral-200">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-[14px] font-black text-neutral-800">
                Bu Durumda Teklif Bulunamadı
              </h4>
              <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                {activeFilter === 'all'
                  ? 'Henüz bir teklif talebi oluşturmadınız. Hizmetler sekmesinden veya aşağıdaki butondan talep açabilirsiniz.'
                  : `Seçili filtreye (${activeFilter}) ait bir teklif talebiniz bulunmuyor.`}
              </p>
            </div>
            <button
              onClick={onOpenCreateQuote}
              className="mt-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-neutral-950 font-black text-[12px] py-2 px-4 rounded-xl transition shadow-xs"
            >
              Hemen Teklif İste
            </button>
          </div>
        ) : (
          filteredQuotes.map((req) => {
            const hasOffers = (req.offers && req.offers.length > 0) || req.status === 'teklif-geldi';
            const offersList = req.offers || [];

            return (
              <div
                key={req.id}
                className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs p-3.5 space-y-3 hover:border-amber-400 transition"
              >
                {/* Header: Category, Status & Date */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-neutral-400 block mb-0.5">
                      {req.category}
                    </span>
                    <h4 className="text-[14px] font-black text-neutral-900 leading-tight">
                      {req.subCategory}
                    </h4>
                  </div>
                  <div className="shrink-0 text-right">
                    {getStatusBadge(req.status, req.offersCount || offersList.length)}
                    <span className="text-[9.5px] text-neutral-400 font-medium block mt-1">
                      {req.createdAt}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11.5px] text-neutral-600 leading-relaxed bg-neutral-50 rounded-xl p-2.5 border border-neutral-100">
                  {req.desc}
                </p>

                {/* Details Meta */}
                <div className="flex items-center gap-3 text-[10.5px] text-neutral-500 flex-wrap">
                  <span className="flex items-center gap-1 font-semibold text-neutral-700">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{req.address}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-amber-700">
                    <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Aciliyet: {req.urgency}</span>
                  </span>
                </div>

                {/* Status-specific action card */}
                {req.status === 'teklif-geldi' && (
                  <div className="pt-1">
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[12px] font-black text-emerald-950 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          <span>{offersList.length} Usta Fiyat Teklifi Verdi!</span>
                        </div>
                        <div className="text-[10px] text-emerald-800 font-semibold mt-0.5 truncate">
                          {offersList[0]?.masterTitle} ({offersList[0]?.price}) ve diğerleri
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedRequestForOffers(req)}
                        className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-[11px] py-2 px-3 rounded-xl shadow-xs transition flex items-center gap-1 shrink-0"
                      >
                        <span>Teklifleri İncele</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {req.status === 'beklemede' && (
                  <div className="pt-1">
                    <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 text-amber-900 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        <span>Talebiniz bölgedeki onaylı ustalara duyuruldu.</span>
                      </div>
                      {onCancelRequest && (
                        <button
                          onClick={() => onCancelRequest(req.id)}
                          className="text-[10px] font-bold text-neutral-400 hover:text-rose-600 px-2 py-1 rounded transition"
                        >
                          İptal Et
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {req.status === 'tamamlandi' && req.acceptedOffer && (
                  <div className="pt-1">
                    <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <span className="font-extrabold text-blue-950">
                            Hizmet Alındı: {req.acceptedOffer.masterTitle}
                          </span>
                          <span className="text-[10px] text-blue-800 block">
                            Anlaşılan Tutar: {req.acceptedOffer.price}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9.5px] font-black uppercase text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                        Onaylandı
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 5. Gelen Teklifleri İnceleme Modal (Compare & Accept Offers) */}
      {selectedRequestForOffers && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-4 relative max-h-[88vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="min-w-0 pr-2">
                <span className="text-[9.5px] font-black text-amber-700 uppercase tracking-wider block">
                  Gelen Fiyat Teklifleri
                </span>
                <h3 className="text-[14px] font-black text-neutral-900 leading-tight truncate">
                  {selectedRequestForOffers.subCategory}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequestForOffers(null)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content / Offers list */}
            <div className="py-3 space-y-3 overflow-y-auto">
              <div className="text-[11px] text-neutral-500 font-medium">
                Bu faaliyet talebiniz için bölgedeki onaylı ustalar tarafından sunulan teklifler:
              </div>

              {(!selectedRequestForOffers.offers || selectedRequestForOffers.offers.length === 0) ? (
                <div className="py-8 text-center text-neutral-500 text-xs font-semibold">
                  Henüz bir teklif kaydedilmedi.
                </div>
              ) : (
                selectedRequestForOffers.offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-2.5 hover:border-emerald-500 hover:bg-emerald-50/20 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-[13px] font-black text-neutral-900 leading-tight">
                          {offer.masterTitle}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {offer.rating && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span>{offer.rating}</span>
                            </span>
                          )}
                          <span className="text-[10px] text-neutral-400 font-medium">
                            • Gelme Zamanı: {offer.estimatedTime}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[15px] font-black text-emerald-700 block">
                          {offer.price}
                        </span>
                        <span className="text-[9px] font-bold text-neutral-400 uppercase">
                          Teklif Fiyatı
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-600 bg-white p-2 rounded-xl border border-neutral-100">
                      &quot;{offer.message}&quot;
                    </p>

                    <div className="pt-1 flex items-center gap-2">
                      {onAcceptOffer && (
                        <button
                          onClick={() => {
                            onAcceptOffer(selectedRequestForOffers.id, offer);
                            setSelectedRequestForOffers(null);
                          }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-[11px] py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Bu Teklifi Kabul Et</span>
                        </button>
                      )}

                      {offer.phone && (
                        <a
                          href={`tel:${offer.phone.replace(/\D/g, '')}`}
                          className="px-3 py-2 rounded-xl bg-neutral-900 text-white font-bold text-[11px] flex items-center gap-1 active:scale-95 transition"
                          title="Telefonla Bilgi Al"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Ara</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer Note */}
            <div className="pt-2 border-t border-neutral-100 text-[10px] text-neutral-400 text-center">
              Teklifi kabul ettiğinizde usta sizinle belirtilen zamanda iletişime geçecektir.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
