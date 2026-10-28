import React, { useState } from 'react';
import {
  X,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Check,
  Ban,
  Trash2,
  Store,
  FileText,
  MessageSquare,
  Sparkles,
  HelpCircle,
  Building2,
  UserCheck,
  BellRing,
  HeartCrack,
} from 'lucide-react';
import { ClassifiedItem, NewsItem, ObituaryItem, PendingMerchantItem, UserProfile } from '../../types';
import { sendAndroidAppNotification } from '../../services/androidNotificationService';

interface EditorPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile | null;
  classifiedList?: ClassifiedItem[];
  newsList?: NewsItem[];
  obituaryList?: ObituaryItem[];
  merchantsList?: PendingMerchantItem[];
  pendingAds?: ClassifiedItem[];
  onRejectAd?: (adId: string) => void;
  onApproveAd?: (ad: ClassifiedItem) => void;
  onDeleteAd?: (adId: string) => void;
  onApproveObituary?: (obId: string) => void;
  onRejectObituary?: (obId: string) => void;
  onDeleteObituary?: (obId: string) => void;
  onApproveMerchant?: (merchant: any) => void;
  onRejectMerchant?: (mId: string) => void;
}

export const EditorPanelModal: React.FC<EditorPanelModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  classifiedList = [],
  pendingAds = [],
  onRejectAd,
  newsList = [],
  obituaryList = [],
  merchantsList: propMerchantsList,
  onApproveAd,
  onDeleteAd,
  onApproveObituary,
  onRejectObituary,
  onDeleteObituary,
  onApproveMerchant: onPropApproveMerchant,
  onRejectMerchant: onPropRejectMerchant,
}) => {
  const [activeTab, setActiveTab] = useState<'ilanlar' | 'cenaze' | 'esnaf' | 'yorumlar' | 'haberler'>('ilanlar');

  // Pending Ads to Moderate
  // Onay bekleyen ilanlar canlı veriden gelir (prop)

  // Pending Merchants to Approve
  const [localPendingMerchants, setLocalPendingMerchants] = useState([]);

  const pendingMerchants = propMerchantsList
    ? propMerchantsList.filter((m) => m.status === 'pending')
    : localPendingMerchants;

  // Flagged comments to moderate
  const [flaggedComments, setFlaggedComments] = useState([]);

  // Feedback toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const pendingObituaries = obituaryList.filter((o) => o.status === 'pending');

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleApprovePendingAd = (ad: any) => {
    // Mevcut ilan kaydı onaylanır (yeni kayıt uydurulmaz)
    onApproveAd?.(ad);
    showToast(`✓ "${String(ad.title).slice(0, 24)}" ilanı onaylandı ve yayına alındı.`);
  };

  const handleRejectPendingAd = (adId: string) => {
    onRejectAd?.(adId);
    showToast('İlan editör tarafından reddedildi.');
  };

  const handleApproveMerchant = (merchant: any) => {
    if (onPropApproveMerchant) {
      onPropApproveMerchant(merchant);
    }
    setLocalPendingMerchants(localPendingMerchants.filter((m) => m.id !== merchant.id));
    showToast(`"${merchant.businessName}" esnaf başvurusu onaylandı.`);
  };

  const handleRejectMerchant = (mId: string) => {
    if (onPropRejectMerchant) {
      onPropRejectMerchant(mId);
    }
    setLocalPendingMerchants(localPendingMerchants.filter((m) => m.id !== mId));
    showToast('Esnaf başvurusu reddedildi.');
  };

  const handleRemoveComment = (cId: string) => {
    setFlaggedComments(flaggedComments.filter((c) => c.id !== cId));
    showToast('Şikayetli yorum sistemden kaldırıldı.');
  };

  const handleKeepComment = (cId: string) => {
    setFlaggedComments(flaggedComments.filter((c) => c.id !== cId));
    showToast('Yorum incelendi ve onaylandı.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 text-neutral-900 flex flex-col w-full h-full overflow-hidden animate-in fade-in duration-200">
      <div className="bg-neutral-50 w-full h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-neutral-950 via-purple-950 to-neutral-900 text-white shrink-0 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight text-white">
                  Editör Denetim & Onay Masası
                </h2>
                <span className="bg-purple-500/20 text-purple-200 border border-purple-400/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Yardımcı Yetkili
                </span>
                <span className="bg-white/10 text-purple-200 text-[9px] font-bold px-2 py-0.5 rounded-full hidden sm:inline-block">
                  Tam Ekran Görünüm
                </span>
              </div>
              <p className="text-[11px] text-purple-200/90 font-medium">
                {userProfile?.name || 'Yetkili Editör'} • Yönetici tarafından atanmış onay ve moderasyon yetkisi
              </p>
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
            onClick={() => setActiveTab('ilanlar')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ilanlar'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>İlan Onay ({pendingAds.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('cenaze')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'cenaze'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <HeartCrack className="w-4 h-4 text-rose-400" />
            <span>Cenaze Onay ({pendingObituaries.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('esnaf')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'esnaf'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Esnaf Onay ({pendingMerchants.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('yorumlar')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'yorumlar'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Yorum Denetim ({flaggedComments.length})</span>
          </button>
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
          {/* TAB 1: İLAN ONAYLAMA & DENETİM */}
          {/* ============================================================== */}
          {activeTab === 'ilanlar' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-[13px] font-black text-neutral-900 leading-tight">
                  Onay Bekleyen Mahalle İlanları
                </h3>
                <p className="text-[10.5px] text-neutral-500 font-medium">
                  Sakinlerin gönderdiği ilanları inceleyip onaylayın veya reddedin
                </p>
              </div>

              {pendingAds.length === 0 ? (
                <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-[12px] font-black text-neutral-800">
                    Bekleyen ilan bulunmuyor!
                  </p>
                  <p className="text-[10.5px] text-neutral-500">
                    Tüm mahalle ilanları incelendi ve denetim tamamlandı.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pendingAds.map((ad) => (
                    <div
                      key={ad.id}
                      className="p-3.5 rounded-2xl border border-neutral-200 bg-white hover:border-purple-300 transition space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={ad.image}
                          alt={ad.title}
                          className="w-20 h-20 rounded-xl object-cover shrink-0 border border-neutral-100"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="bg-purple-100 text-purple-900 text-[9px] font-black px-2 py-0.5 rounded">
                              {ad.category}
                            </span>
                            <span className="text-[9.5px] text-neutral-400 font-medium ml-auto">
                              {ad.date}
                            </span>
                          </div>
                          <h4 className="text-[12.5px] font-black text-neutral-900 mt-1 leading-snug">
                            {ad.title}
                          </h4>
                          <div className="text-[13px] font-black text-purple-700 mt-0.5">
                            {ad.price}
                          </div>
                          <p className="text-[10.5px] text-neutral-500 font-medium line-clamp-1 mt-0.5">
                            {ad.desc}
                          </p>
                          <div className="text-[10px] text-neutral-400 mt-1">
                            İlan Sahibi: {ad.seller}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                        <button
                          type="button"
                          onClick={() => handleRejectPendingAd(ad.id)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold transition flex items-center gap-1"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Reddet</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprovePendingAd(ad)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black transition flex items-center gap-1.5 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Onayla & Yayınla</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: CENAZE İLANLARI ONAYI */}
          {/* ============================================================== */}
          {activeTab === 'cenaze' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[13px] font-black text-neutral-900 leading-tight">
                    Onay Bekleyen Cenaze & Vefat İlanları
                  </h3>
                  <p className="text-[10.5px] text-neutral-500 font-medium">
                    Kayıtlı sakinlerin gönderdiği cenaze ilanlarını inceleyip onaylayarak vitrinde yayınlayın
                  </p>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-rose-100 text-rose-700 uppercase">
                  {pendingObituaries.length} Bekleyen
                </span>
              </div>

              {pendingObituaries.length === 0 ? (
                <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                  <HeartCrack className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-neutral-600">Onay bekleyen cenaze ilanı bulunmuyor</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Tüm vefat ilanları denetlenmiştir</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingObituaries.map((ob) => (
                    <div
                      key={ob.id}
                      className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-[13px] font-black text-neutral-900 leading-tight">
                              {ob.name}
                            </h4>
                            <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                              Onay Bekliyor
                            </span>
                          </div>
                          <p className="text-[10.5px] text-neutral-500 mt-0.5">
                            Memleketi: <strong>{ob.hometown}</strong> | Gönderen: {ob.submittedBy?.name || 'Mahalle Sakini'} ({ob.submittedBy?.phone || ob.phone})
                          </p>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-semibold">{ob.submittedBy?.date || 'Bugün'}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-neutral-200 text-neutral-700">
                        <div>
                          <div><strong>Babasının İsmi:</strong> {ob.fatherName}</div>
                          {ob.sonName && <div><strong>Oğlu / Yakınları:</strong> {ob.sonName}</div>}
                          <div><strong>Cenaze Namazı:</strong> {ob.date}</div>
                        </div>
                        <div>
                          <div><strong>Cami:</strong> {ob.mosque}</div>
                          <div><strong>Defin Mezarlığı:</strong> {ob.cemetery}</div>
                          <div><strong>Taziye Tel:</strong> <a href={`tel:${ob.phone}`} className="text-emerald-700 font-bold underline">{ob.phone}</a></div>
                        </div>
                      </div>

                      {ob.notes && (
                        <div className="text-[10.5px] text-neutral-600 bg-neutral-100/80 p-2 rounded-lg">
                          <span className="font-bold">Not: </span>{ob.notes}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (onRejectObituary) {
                              onRejectObituary(ob.id);
                              showToast('Cenaze ilanı reddedildi');
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-neutral-200 text-[11px] font-bold transition flex items-center gap-1"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Reddet</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (onApproveObituary) {
                              onApproveObituary(ob.id);
                              showToast(`"${ob.name}" cenaze ilanı onaylandı ve vitrinde yayınlandı`);
                            }
                          }}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black transition flex items-center gap-1.5 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Onayla & Vitrinde Yayınla</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: ESNAF BAŞVURU ONAYI */}
          {/* ============================================================== */}
          {activeTab === 'esnaf' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-[13px] font-black text-neutral-900 leading-tight">
                  Onay Bekleyen Esnaf & İşletme Kayıtları
                </h3>
                <p className="text-[10.5px] text-neutral-500 font-medium">
                  Kayıt olan esnafları denetleyin ve sisteme mağaza yetkisi verin
                </p>
              </div>

              {pendingMerchants.length === 0 ? (
                <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-[12px] font-black text-neutral-800">
                    Bekleyen esnaf kaydı bulunmuyor.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pendingMerchants.map((merchant) => (
                    <div
                      key={merchant.id}
                      className="p-3.5 rounded-2xl border border-neutral-200 bg-white hover:border-amber-300 transition space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-amber-100 text-amber-900 text-[9px] font-black px-2 py-0.5 rounded">
                              {merchant.category}
                            </span>
                            <span className="text-[9.5px] text-neutral-400 font-medium">
                              {merchant.date}
                            </span>
                          </div>
                          <h4 className="text-[13px] font-black text-neutral-900 mt-1">
                            {merchant.businessName}
                          </h4>
                          <p className="text-[11px] text-neutral-600 font-medium mt-0.5">
                            Yetkili: <strong>{merchant.ownerName}</strong> • {merchant.phone}
                          </p>
                          <p className="text-[10.5px] text-neutral-500">
                            Adres: {merchant.address}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                        <button
                          type="button"
                          onClick={() => handleRejectMerchant(merchant.id)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold transition flex items-center gap-1"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Reddet</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApproveMerchant(merchant)}
                          className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-black transition flex items-center gap-1.5 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Esnafı Onayla & Mağazayı Aç</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: YORUM VE ŞİKAYET MODERASYONU */}
          {/* ============================================================== */}
          {activeTab === 'yorumlar' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-[13px] font-black text-neutral-900 leading-tight">
                  Şikayet Edilen Yorum ve İçerik Denetimi
                </h3>
                <p className="text-[10.5px] text-neutral-500 font-medium">
                  Topluluk kurallarını ihlal eden mesajları inceleyin
                </p>
              </div>

              {flaggedComments.length === 0 ? (
                <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-[12px] font-black text-neutral-800">
                    Şikayet edilen yorum kalmadı!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {flaggedComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="bg-rose-200 text-rose-900 text-[9px] font-black px-2 py-0.5 rounded">
                            {comment.reason}
                          </span>
                          <span className="text-[10.5px] font-black text-neutral-900">
                            {comment.author}
                          </span>
                        </div>
                        <span className="text-[9.5px] text-neutral-400 font-medium">
                          {comment.time}
                        </span>
                      </div>

                      <p className="p-2.5 rounded-xl bg-white border border-neutral-200 text-[11px] text-neutral-800 font-medium">
                        &quot;{comment.text}&quot;
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-neutral-500 font-medium">
                          Konum: {comment.location}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleKeepComment(comment.id)}
                            className="px-2.5 py-1 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-[10.5px] font-bold"
                          >
                            İhlal Yok (Koru)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveComment(comment.id)}
                            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10.5px] font-black"
                          >
                            Yorumu Kaldır
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: HABER YÖNETİMİ & SON DAKİKA PUSH BİLDİRİMİ */}
          {/* ============================================================== */}
          {activeTab === 'haberler' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[13px] font-black text-neutral-900 leading-tight">
                    Haberler & Son Dakika Push Gönderimi
                  </h3>
                  <p className="text-[10.5px] text-neutral-500 font-medium">
                    Haberleri inceleyin veya flaş son dakika bildirimlerini kullanıcılara iletin
                  </p>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-rose-100 text-rose-700 uppercase">
                  {newsList.length} Haber
                </span>
              </div>

              <div className="space-y-2">
                {newsList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl border border-neutral-200 bg-neutral-50 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {item.urgent && (
                          <span className="bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded">
                            SON DAKİKA
                          </span>
                        )}
                        <span className="text-[9.5px] text-neutral-500 font-bold">
                          {item.category}
                        </span>
                      </div>
                      <h4 className="text-[12px] font-black text-neutral-900 leading-tight truncate">
                        {item.title}
                      </h4>
                      <p className="text-[10.5px] text-neutral-500 line-clamp-1 mt-0.5 font-medium">
                        {item.summary}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBroadcastNewsPush(item)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[10.5px] font-black transition flex items-center gap-1 shrink-0 shadow-xs active:scale-95"
                    >
                      <BellRing className="w-3.5 h-3.5" />
                      <span>Son Dakika Bildir</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
