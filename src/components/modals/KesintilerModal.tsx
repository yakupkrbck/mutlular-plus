import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  Zap,
  Droplets,
  AlertTriangle,
  Phone,
  MessageSquare,
  Search,
  RefreshCw,
  Clock,
  Calendar,
  ExternalLink,
  Info,
  ShieldAlert,
  Building2,
  CheckCircle2,
  MapPin,
  Check,
  Bell,
  BellRing,
  LocateFixed,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import {
  fetchUedasOutages,
  fetchBuskiOutages,
  UedasResponse,
  BuskiResponse,
} from '../../services/kesintiService';
import {
  BURSA_DISTRICTS,
  KESINTI_CONTACTS,
  MEHMET_AKIF_INFO,
  isMehmetAkifUedasOutage,
  isMehmetAkifBuskiOutage,
  isCukurcaUedasOutage,
  isCeltikUedasOutage,
  isCukurcaBuskiOutage,
  isCeltikBuskiOutage,
  UedasOutage,
  BuskiItem,
  BURSA_NEIGHBORHOODS,
  NeighborhoodItem,
  findNearestNeighborhood,
  isOutageForNeighborhood,
  normalizeTurkishText,
} from '../../data/kesintiData';
import {
  sendAndroidAppNotification,
  requestAndroidNotificationPermission,
  getAndroidNotificationPermission,
} from '../../services/androidNotificationService';

export type KesintiModalTab = 'tumu' | 'uedas' | 'buski' | 'ariza' | 'ayarlar';

interface KesintilerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: KesintiModalTab;
}

export const KesintilerModal: React.FC<KesintilerModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'tumu',
}) => {
  const [activeTab, setActiveTab] = useState<KesintiModalTab>(initialTab);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<NeighborhoodItem>(
    BURSA_NEIGHBORHOODS[0]
  );
  const [onlyMahallem, setOnlyMahallem] = useState<boolean>(true);
  const [selectedIlceId, setSelectedIlceId] = useState<string>('1832'); // Osmangazi
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Geolocation detection states
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [locationFeedback, setLocationFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
    neighborhoodId?: string;
  } | null>(null);

  // Subscriptions & Notification Alarm State
  const [subscriptions, setSubscriptions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kesinti_mahalle_subscriptions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['mehmet_akif']; // Mehmet Akif subscribed by default
  });
  const [neighborhoodSearch, setNeighborhoodSearch] = useState<string>('');
  const [testNotificationSent, setTestNotificationSent] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<string>(() =>
    getAndroidNotificationPermission()
  );

  // Data states
  const [uedasData, setUedasData] = useState<UedasResponse | null>(null);
  const [buskiData, setBuskiData] = useState<BuskiResponse | null>(null);
  const [loadingUedas, setLoadingUedas] = useState<boolean>(false);
  const [loadingBuski, setLoadingBuski] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Sync initial tab when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setOnlyMahallem(true);
      setNotificationPermission(getAndroidNotificationPermission());
    }
  }, [isOpen, initialTab]);

  // Load UEDAŞ data
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoadingUedas(true);
    fetchUedasOutages(selectedIlceId)
      .then((res) => {
        if (isMounted) {
          setUedasData(res);
          setLastUpdated(
            new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
          );
        }
      })
      .finally(() => {
        if (isMounted) setLoadingUedas(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedIlceId]);

  // Load BUSKİ data
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoadingBuski(true);
    fetchBuskiOutages()
      .then((res) => {
        if (isMounted) {
          setBuskiData(res);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingBuski(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleRefresh = () => {
    setLoadingUedas(true);
    setLoadingBuski(true);
    Promise.allSettled([fetchUedasOutages(selectedIlceId), fetchBuskiOutages()]).then(
      ([uedasRes, buskiRes]) => {
        if (uedasRes.status === 'fulfilled') setUedasData(uedasRes.value);
        if (buskiRes.status === 'fulfilled') setBuskiData(buskiRes.value);
        setLoadingUedas(false);
        setLoadingBuski(false);
        setLastUpdated(
          new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        );
      }
    );
  };

  // Automated Kesinti Alarmı: Send push notification when outage occurs in subscribed neighborhood
  useEffect(() => {
    if (!isOpen) return;
    if (
      (!uedasData?.outages || uedasData.outages.length === 0) &&
      (!buskiData?.items || buskiData.items.length === 0)
    ) {
      return;
    }

    try {
      const rawNotified = sessionStorage.getItem('kesinti_notified_alarms') || '[]';
      const notifiedIds: string[] = JSON.parse(rawNotified);
      const newNotifiedIds = [...notifiedIds];

      // Check UEDAŞ outages
      if (uedasData?.outages) {
        for (const outage of uedasData.outages) {
          if (notifiedIds.includes(outage.id)) continue;

          const matchingNeighborhood = BURSA_NEIGHBORHOODS.find(
            (n) =>
              subscriptions.includes(n.id) &&
              isOutageForNeighborhood(
                `${outage.mahalle} ${outage.rawSokak} ${(outage.sokaklar || []).join(' ')}`,
                n
              )
          );

          if (matchingNeighborhood) {
            sendAndroidAppNotification({
              title: `⚡ Kesinti Alarmı: ${matchingNeighborhood.name}`,
              body: `${outage.saat} saatlerinde planlı elektrik kesintisi: ${
                outage.neden || 'Bakım onarım'
              }`,
              type: 'acil',
              channelId: 'yonetici_duyuru',
            });
            newNotifiedIds.push(outage.id);
          }
        }
      }

      // Check BUSKİ outages
      if (buskiData?.items) {
        for (const item of buskiData.items) {
          if (notifiedIds.includes(item.id)) continue;

          const matchingNeighborhood = BURSA_NEIGHBORHOODS.find(
            (n) =>
              subscriptions.includes(n.id) &&
              isOutageForNeighborhood(`${item.baslik} ${item.icerik} ${item.ilce}`, n)
          );

          if (matchingNeighborhood) {
            sendAndroidAppNotification({
              title: `💧 Kesinti Alarmı: ${matchingNeighborhood.name}`,
              body: `${item.baslik} (${item.saat || 'Duyuru'})`,
              type: 'acil',
              channelId: 'yonetici_duyuru',
            });
            newNotifiedIds.push(item.id);
          }
        }
      }

      sessionStorage.setItem('kesinti_notified_alarms', JSON.stringify(newNotifiedIds));
    } catch (e) {
      console.error('Kesinti alarmı gönderim hatası:', e);
    }
  }, [isOpen, uedasData, buskiData, subscriptions]);

  // Geolocation detector: Automatically selects user's neighborhood based on coordinates
  const handleDetectLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationFeedback({
        type: 'error',
        text: 'Tarayıcınız coğrafi konum servisini desteklemiyor.',
      });
      return;
    }

    setIsDetectingLocation(true);
    setLocationFeedback(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsDetectingLocation(false);
        const { latitude, longitude } = position.coords;
        const { neighborhood, distanceKm } = findNearestNeighborhood(latitude, longitude);

        setSelectedNeighborhood(neighborhood);
        setOnlyMahallem(true);

        const distanceText =
          distanceKm < 1
            ? `${Math.round(distanceKm * 1000)} m`
            : `${distanceKm.toFixed(1)} km`;

        setLocationFeedback({
          type: 'success',
          text: `Konumunuz algılandı: ${neighborhood.name} (${distanceText} mesafede). Mahalle filtreleri güncellendi.`,
          neighborhoodId: neighborhood.id,
        });
      },
      (error) => {
        setIsDetectingLocation(false);
        let errorMsg = 'Konum bilgisi alınamadı.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Konum erişim izni verilmedi. Tarayıcı ayarlarından konuma izin veriniz.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'GPS veya ağ konum servisine erişilemedi.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Konum tespiti zaman aşımına uğradı. Lütfen tekrar deneyin.';
        }
        setLocationFeedback({
          type: 'error',
          text: errorMsg,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Subscriptions handlers
  const handleToggleSubscription = (neighborhoodId: string) => {
    setSubscriptions((prev) => {
      const next = prev.includes(neighborhoodId)
        ? prev.filter((id) => id !== neighborhoodId)
        : [...prev, neighborhoodId];
      try {
        localStorage.setItem('kesinti_mahalle_subscriptions', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleSubscribeOnlyMehmetAkif = () => {
    const next = ['mehmet_akif'];
    setSubscriptions(next);
    try {
      localStorage.setItem('kesinti_mahalle_subscriptions', JSON.stringify(next));
    } catch {}
  };

  const handleSubscribeAll = () => {
    const next = BURSA_NEIGHBORHOODS.map((n) => n.id);
    setSubscriptions(next);
    try {
      localStorage.setItem('kesinti_mahalle_subscriptions', JSON.stringify(next));
    } catch {}
  };

  const handleUnsubscribeAll = () => {
    setSubscriptions([]);
    try {
      localStorage.setItem('kesinti_mahalle_subscriptions', JSON.stringify([]));
    } catch {}
  };

  const handleTestNotification = async () => {
    const status = await requestAndroidNotificationPermission();
    setNotificationPermission(status);
    sendAndroidAppNotification({
      title: `🔔 Kesinti Alarmı: ${selectedNeighborhood.name}`,
      body: 'Kesinti alarm sistemi aktif. Bu mahallede planlı bakım veya kesinti olduğunda anında bildirim alacaksınız.',
      type: 'duyuru',
      channelId: 'yonetici_duyuru',
    });
    setTestNotificationSent(true);
    setTimeout(() => setTestNotificationSent(false), 3500);
  };

  // UEDAŞ outages strictly for the 3 target neighborhoods
  const allTargetUedasOutages = useMemo(() => {
    if (!uedasData?.outages) return [];
    return uedasData.outages.filter(
      (o) => isMehmetAkifUedasOutage(o) || isCukurcaUedasOutage(o) || isCeltikUedasOutage(o)
    );
  }, [uedasData]);

  const localUedasOutages = useMemo(() => {
    if (!uedasData?.outages) return [];
    if (selectedNeighborhood.id === 'mehmet_akif') {
      return uedasData.outages.filter(isMehmetAkifUedasOutage);
    }
    if (selectedNeighborhood.id === 'cukurca') {
      return uedasData.outages.filter(isCukurcaUedasOutage);
    }
    if (selectedNeighborhood.id === 'celtik') {
      return uedasData.outages.filter(isCeltikUedasOutage);
    }
    return uedasData.outages.filter((o) =>
      isOutageForNeighborhood(
        `${o.mahalle} ${o.rawSokak} ${(o.sokaklar || []).join(' ')}`,
        selectedNeighborhood
      )
    );
  }, [uedasData, selectedNeighborhood]);

  const displayedUedasOutages = useMemo(() => {
    if (!uedasData?.outages) return [];
    let list = onlyMahallem ? localUedasOutages : allTargetUedasOutages;
    if (searchQuery.trim()) {
      const q = normalizeTurkishText(searchQuery);
      list = list.filter(
        (o) =>
          normalizeTurkishText(o.mahalle).includes(q) ||
          normalizeTurkishText(o.rawSokak).includes(q) ||
          normalizeTurkishText(o.neden).includes(q) ||
          normalizeTurkishText(o.tarih).includes(q) ||
          normalizeTurkishText(o.saat).includes(q) ||
          (o.sokaklar || []).some((s) => normalizeTurkishText(s).includes(q))
      );
    }
    return list;
  }, [uedasData, onlyMahallem, localUedasOutages, allTargetUedasOutages, searchQuery]);

  // BUSKİ announcements strictly for the 3 target neighborhoods
  const allTargetBuskiOutages = useMemo(() => {
    if (!buskiData?.items) return [];
    return buskiData.items.filter(
      (b) => isMehmetAkifBuskiOutage(b) || isCukurcaBuskiOutage(b) || isCeltikBuskiOutage(b)
    );
  }, [buskiData]);

  const localBuskiOutages = useMemo(() => {
    if (!buskiData?.items) return [];
    if (selectedNeighborhood.id === 'mehmet_akif') {
      return buskiData.items.filter(isMehmetAkifBuskiOutage);
    }
    if (selectedNeighborhood.id === 'cukurca') {
      return buskiData.items.filter(isCukurcaBuskiOutage);
    }
    if (selectedNeighborhood.id === 'celtik') {
      return buskiData.items.filter(isCeltikBuskiOutage);
    }
    return buskiData.items.filter((b) =>
      isOutageForNeighborhood(`${b.baslik} ${b.icerik}`, selectedNeighborhood)
    );
  }, [buskiData, selectedNeighborhood]);

  const displayedBuskiOutages = useMemo(() => {
    if (!buskiData?.items) return [];
    let list = onlyMahallem ? localBuskiOutages : allTargetBuskiOutages;
    if (searchQuery.trim()) {
      const q = normalizeTurkishText(searchQuery);
      list = list.filter(
        (b) =>
          normalizeTurkishText(b.baslik).includes(q) ||
          normalizeTurkishText(b.icerik).includes(q) ||
          normalizeTurkishText(b.ilce).includes(q) ||
          normalizeTurkishText(b.tarih).includes(q)
      );
    }
    return list;
  }, [buskiData, onlyMahallem, localBuskiOutages, allTargetBuskiOutages, searchQuery]);

  // Calculate outage counts for each neighborhood in settings
  const getOutageCountForNeighborhood = useCallback(
    (neighborhood: NeighborhoodItem) => {
      let count = 0;
      if (uedasData?.outages) {
        count += uedasData.outages.filter((o) =>
          isOutageForNeighborhood(
            `${o.mahalle} ${o.rawSokak} ${(o.sokaklar || []).join(' ')}`,
            neighborhood
          )
        ).length;
      }
      if (buskiData?.items) {
        count += buskiData.items.filter((b) =>
          isOutageForNeighborhood(`${b.baslik} ${b.icerik}`, neighborhood)
        ).length;
      }
      return count;
    },
    [uedasData, buskiData]
  );

  const filteredNeighborhoods = useMemo(() => {
    if (!neighborhoodSearch.trim()) return BURSA_NEIGHBORHOODS;
    const q = normalizeTurkishText(neighborhoodSearch);
    return BURSA_NEIGHBORHOODS.filter(
      (n) =>
        normalizeTurkishText(n.name).includes(q) ||
        normalizeTurkishText(n.shortName).includes(q) ||
        normalizeTurkishText(n.district).includes(q)
    );
  }, [neighborhoodSearch]);

  const hasAnyLocalAlert = localUedasOutages.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-neutral-100">
        {/* ============================================================ */}
        {/* 1. KOMPAKT & ŞIK ÜST HEADER                                 */}
        {/* ============================================================ */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-sky-950 text-white px-3 py-2 sm:px-4 sm:py-2.5 shrink-0 border-b border-white/10">
          <div className="flex items-center justify-between gap-2">
            {/* Sol: İkon + Başlık + Konum tek blokta */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-sky-500 p-0.5 flex items-center justify-center shadow-xs shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center gap-0.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <Droplets className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap leading-none">
                  <h2 className="text-xs sm:text-sm font-black text-white tracking-tight truncate">
                    {selectedNeighborhood.name} Kesinti Takibi
                  </h2>
                  <span className="text-[9px] font-black text-emerald-300 bg-emerald-950/70 px-1.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Canlı
                  </span>
                  {subscriptions.includes(selectedNeighborhood.id) && (
                    <span className="text-[9px] font-black text-purple-300 bg-purple-950/70 px-1.5 py-0.5 rounded-full border border-purple-500/40 flex items-center gap-1 shrink-0">
                      <BellRing className="w-2.5 h-2.5" />
                      Alarm Açık
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-300 truncate mt-0.5">
                  <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                  <span className="truncate">
                    {selectedNeighborhood.id === 'mehmet_akif'
                      ? 'Çukurca Yolu Cd. • 16190 Osmangazi'
                      : `${selectedNeighborhood.name} • ${selectedNeighborhood.district}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Sağ: Hızlı Arama Butonları + Yenile + Kapat */}
            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={KESINTI_CONTACTS.buski.callCenterHref}
                title="Alo 185 BUSKİ Su Arıza"
                className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/30 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
              >
                <Droplets className="w-3 h-3 text-sky-300" />
                <span>185</span>
              </a>
              <a
                href={KESINTI_CONTACTS.uedas.callCenterHref}
                title="Alo 186 UEDAŞ Elektrik Arıza"
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
              >
                <Zap className="w-3 h-3 text-amber-300" />
                <span>186</span>
              </a>
              <button
                onClick={handleRefresh}
                title="Yenile"
                disabled={loadingUedas || loadingBuski}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${loadingUedas || loadingBuski ? 'animate-spin' : ''}`}
                />
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. KONUM ALGILAMA & HIZLI MAHALLE SEÇİM ÇUBUĞU               */}
        {/* ============================================================ */}
        <div className="bg-slate-900/90 text-white px-2.5 py-1.5 border-b border-white/10 flex items-center justify-between gap-1.5 text-xs shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10.5px] text-slate-300 shrink-0 font-medium">Seçili Bölge:</span>
            <div className="relative inline-block">
              <select
                value={selectedNeighborhood.id}
                onChange={(e) => {
                  const target = BURSA_NEIGHBORHOODS.find((n) => n.id === e.target.value);
                  if (target) {
                    setSelectedNeighborhood(target);
                    setLocationFeedback(null);
                  }
                }}
                className="bg-slate-800 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg border border-slate-700 outline-none appearance-none pr-5 hover:bg-slate-750 cursor-pointer"
              >
                {BURSA_NEIGHBORHOODS.map((n) => (
                  <option key={n.id} value={n.id} className="bg-slate-900 text-white">
                    {n.name} {n.id === 'mehmet_akif' ? '(Merkez)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* DETECT MY LOCATION BUTONU */}
          <button
            onClick={handleDetectLocation}
            disabled={isDetectingLocation}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-bold bg-sky-500/20 text-sky-200 hover:bg-sky-500/30 border border-sky-400/30 transition active:scale-95 disabled:opacity-50 shrink-0"
            title="Tarayıcı konumunuzu kullanarak mahallenizi otomatik tespit edin"
          >
            <LocateFixed
              className={`w-3 h-3 ${isDetectingLocation ? 'animate-spin text-sky-300' : 'text-sky-300'}`}
            />
            <span>{isDetectingLocation ? 'Konum Algılanıyor...' : 'Konumumu Algıla'}</span>
          </button>
        </div>

        {/* GEOLOCATION FEEDBACK BANNER */}
        {locationFeedback && (
          <div
            className={`px-3 py-1.5 text-[11px] font-semibold flex items-center justify-between gap-2 border-b transition animate-in fade-in shrink-0 ${
              locationFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              {locationFeedback.type === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              )}
              <span className="truncate">{locationFeedback.text}</span>
            </div>
            <button
              onClick={() => setLocationFeedback(null)}
              className="p-0.5 text-neutral-400 hover:text-neutral-700 shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* 3. İŞLEVSEL SEKME VE FİLTRE ÇUBUĞU                         */}
        {/* ============================================================ */}
        <div className="bg-neutral-100 px-2 py-1.5 border-b border-neutral-200 flex items-center justify-between gap-1 text-[11px] font-bold shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('tumu')}
              className={`py-1 px-2.5 rounded-lg transition flex items-center gap-1 shrink-0 ${
                activeTab === 'tumu'
                  ? 'bg-slate-900 text-white font-black shadow-xs'
                  : 'text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>{selectedNeighborhood.shortName}</span>
              {hasAnyLocalAlert && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('uedas')}
              className={`py-1 px-2 rounded-lg transition flex items-center gap-1 shrink-0 ${
                activeTab === 'uedas'
                  ? 'bg-amber-500 text-neutral-950 font-black shadow-xs'
                  : 'text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Elektrik</span>
              <span className="text-[9px] bg-black/15 text-neutral-900 px-1 py-0.2 rounded-full font-black">
                {displayedUedasOutages.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('buski')}
              className={`py-1 px-2 rounded-lg transition flex items-center gap-1 shrink-0 ${
                activeTab === 'buski'
                  ? 'bg-sky-600 text-white font-black shadow-xs'
                  : 'text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <Droplets className="w-3 h-3" />
              <span>Su</span>
              <span className="text-[9px] bg-white/25 text-white px-1 py-0.2 rounded-full font-black">
                {displayedBuskiOutages.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ariza')}
              className={`py-1 px-2 rounded-lg transition flex items-center gap-1 shrink-0 ${
                activeTab === 'ariza'
                  ? 'bg-rose-600 text-white font-black shadow-xs'
                  : 'text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <ShieldAlert className="w-3 h-3" />
              <span>İhbar</span>
            </button>

            {/* BİLDİRİM AYARLARIM SEKME BUTONU */}
            <button
              onClick={() => setActiveTab('ayarlar')}
              className={`py-1 px-2.5 rounded-lg transition flex items-center gap-1 shrink-0 ${
                activeTab === 'ayarlar'
                  ? 'bg-purple-700 text-white font-black shadow-xs'
                  : 'text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200/60'
              }`}
            >
              <Bell className="w-3 h-3" />
              <span>Bildirim Ayarlarım</span>
              <span className="text-[9px] bg-purple-900/30 text-purple-100 px-1 py-0.2 rounded-full font-black">
                {subscriptions.length}
              </span>
            </button>
          </div>

          {/* Sadece Mahallemiz / Seçili Bölge Filtre Butonu */}
          <button
            onClick={() => setOnlyMahallem(!onlyMahallem)}
            className={`px-2 py-1 rounded-lg text-[10.5px] font-bold transition flex items-center gap-1 shrink-0 border ${
              onlyMahallem
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50'
            }`}
            title={`Sadece ${selectedNeighborhood.name} verilerini filtrele`}
          >
            <div
              className={`w-3 h-3 rounded flex items-center justify-center border ${
                onlyMahallem ? 'border-white bg-white text-emerald-600' : 'border-neutral-400'
              }`}
            >
              {onlyMahallem && <Check className="w-2.5 h-2.5 stroke-[3]" />}
            </div>
            <span>Sadece {selectedNeighborhood.shortName}</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* 4. ANA İÇERİK ALANI                                          */}
        {/* ============================================================ */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-3.5 bg-neutral-50/70 space-y-2.5 min-h-0">
          {/* TAB 1: MAHALLEMİZ SU & ELEKTRİK (ÖZET PANELİ) */}
          {activeTab === 'tumu' && (
            <div className="space-y-2.5">
              {/* Kompakt Durum Şeridi */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-2.5 sm:p-3 rounded-xl border border-emerald-800/40 shadow-xs">
                <div className="flex items-center justify-between gap-1 text-[11px] mb-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-black text-emerald-300">
                      {selectedNeighborhood.name} Şebeke Durumu
                    </span>
                  </div>
                  {/* Hızlı Alarm Aboneliği Durumu / Butonu */}
                  {subscriptions.includes(selectedNeighborhood.id) ? (
                    <span className="text-[9.5px] font-bold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <BellRing className="w-2.5 h-2.5" />
                      Alarm Açık
                    </span>
                  ) : (
                    <button
                      onClick={() => handleToggleSubscription(selectedNeighborhood.id)}
                      className="text-[9.5px] font-bold text-purple-200 bg-purple-900/60 hover:bg-purple-850 px-2 py-0.5 rounded-full border border-purple-400/40 flex items-center gap-1 transition active:scale-95"
                    >
                      <Bell className="w-2.5 h-2.5" />
                      Alarma Abone Ol
                    </button>
                  )}
                </div>

                {/* 2 Kompakt Kutu */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] text-amber-300 font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-amber-300" />
                        Elektrik
                      </span>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                          localUedasOutages.length > 0
                            ? 'bg-amber-400 text-neutral-950'
                            : 'bg-emerald-500/30 text-emerald-300'
                        }`}
                      >
                        {localUedasOutages.length > 0 ? 'Planlı Bakım' : 'Kesinti Yok'}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-white mt-0.5 truncate">
                      {localUedasOutages.length > 0
                        ? `${localUedasOutages.length} planlı çalışma`
                        : 'Şebeke Normal (Kesinti Yok)'}
                    </div>
                  </div>

                  <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] text-sky-300 font-bold flex items-center gap-1">
                        <Droplets className="w-3 h-3 fill-sky-300" />
                        Su
                      </span>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                          localBuskiOutages.length > 0
                            ? 'bg-sky-400 text-neutral-950'
                            : 'bg-emerald-500/30 text-emerald-300'
                        }`}
                      >
                        {localBuskiOutages.length > 0 ? 'Kesinti Var' : 'Kesinti Yok'}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-white mt-0.5 truncate">
                      {localBuskiOutages.length > 0
                        ? `${localBuskiOutages.length} aktif kesinti`
                        : 'Standart Basınç (Kesinti Yok)'}
                    </div>
                  </div>
                </div>
              </div>

              {/* LOCAL OUTAGES CARDS */}
              {localUedasOutages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-[11px] font-black text-amber-900">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{selectedNeighborhood.name} Planlı Kesintisi:</span>
                  </div>

                  {localUedasOutages.map((loc) => (
                    <div
                      key={loc.id}
                      className="bg-amber-50/90 border border-amber-400 rounded-xl p-3 space-y-2 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[9px] font-black uppercase bg-amber-500 text-neutral-950 px-1.5 py-0.5 rounded">
                            ⚡ {loc.mahalle}
                          </span>
                          <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                            {loc.ilce}
                          </span>
                          <span className="text-[9px] font-black bg-rose-600 text-white px-1.5 py-0.5 rounded animate-pulse">
                            Mahalleniz
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-neutral-800">
                          {loc.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-bold bg-white p-2 rounded-lg border border-amber-200">
                        <div className="flex items-center gap-1 text-neutral-800">
                          <Calendar className="w-3 h-3 text-amber-600" />
                          <span>{loc.tarih}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-800">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>{loc.saat}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-neutral-800 bg-white p-2 rounded-lg border border-amber-200">
                        <span className="text-neutral-500 font-bold block text-[9.5px] uppercase">
                          Çalışma Nedeni:
                        </span>
                        <span className="font-semibold">{loc.neden}</span>
                      </div>

                      {loc.sokaklar.length > 0 ? (
                        <div className="text-[11px] text-neutral-800 bg-white p-2 rounded-lg border border-amber-200 space-y-1">
                          <span className="text-neutral-500 font-bold block text-[9.5px] uppercase">
                            Etkilenen Sokaklar:
                          </span>
                          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                            {loc.sokaklar.map((s, idx) => (
                              <span
                                key={idx}
                                className="bg-amber-100/70 text-neutral-900 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-300/50"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-neutral-800 bg-white p-2 rounded-lg border border-amber-200 flex items-center justify-between">
                          <span className="text-neutral-500 font-bold text-[9.5px] uppercase">
                            Etkilenen Bölge:
                          </span>
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded border border-amber-300">
                            Tüm Mahalle / Şebeke Geneli (Orta Gerilim Şebeke)
                          </span>
                        </div>
                      )}

                      <div className="pt-0.5 flex items-center justify-between text-[11px]">
                        <span className="text-[10px] text-neutral-500">{loc.kaynak}</span>
                        <a
                          href="tel:186"
                          className="font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 bg-amber-200/60 px-2 py-0.5 rounded"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Alo 186 UEDAŞ</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Elektrik Kesintisi Durum Kartı (Kesinti Yoksa Net Şekilde Bildirir) */}
              {localUedasOutages.length === 0 && (
                <div className="bg-white rounded-xl p-3 border border-emerald-200 flex items-start gap-2.5 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-black text-neutral-900">
                        ⚡ {selectedNeighborhood.name}’nde Elektrik Kesintisi Yok
                      </h4>
                      <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-300">
                        Kesinti Yok • Şebeke Normal
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600 leading-snug">
                      UEDAŞ resmi şebeke kayıtlarında <strong>{selectedNeighborhood.name}</strong> için bildirilmiş planlı veya acil bir elektrik kesintisi bulunmamaktadır.
                    </p>
                  </div>
                </div>
              )}

              {/* BUSKİ Su Kesintisi Durum Kartı */}
              {localBuskiOutages.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-[11px] font-black text-sky-900">
                    <AlertTriangle className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>{selectedNeighborhood.name} Su Kesintisi Duyurusu:</span>
                  </div>
                  {localBuskiOutages.map((loc) => (
                    <div key={loc.id} className="bg-sky-50/90 border border-sky-400 rounded-xl p-3 space-y-2 shadow-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[9px] font-black uppercase bg-sky-600 text-white px-1.5 py-0.5 rounded">
                            💧 {loc.tip}
                          </span>
                          <span className="text-[9px] font-bold text-sky-900 bg-sky-100 px-1.5 py-0.5 rounded border border-sky-300">
                            {loc.ilce}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-sky-800">{loc.tarih}</span>
                      </div>
                      <h4 className="text-xs font-black text-neutral-900">{loc.baslik}</h4>
                      <p className="text-[11px] text-neutral-700 bg-white p-2 rounded-lg border border-sky-200">{loc.icerik}</p>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-[10px] text-neutral-500">Saat: {loc.saat}</span>
                        <a href="tel:185" className="font-bold text-sky-800 flex items-center gap-1 bg-sky-100 px-2 py-0.5 rounded">
                          <Phone className="w-3 h-3" />
                          <span>Alo 185 BUSKİ</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-3 border border-sky-200/80 shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-md bg-sky-100 flex items-center justify-center text-sky-700">
                        <Droplets className="w-3.5 h-3.5 fill-sky-700" />
                      </div>
                      <span className="text-xs font-black text-neutral-900">
                        BUSKİ İçme Suyu Şebekesi
                      </span>
                    </div>
                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded">
                      Kesinti Yok
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-700 leading-relaxed bg-sky-50/50 p-2 rounded-lg border border-sky-100">
                    <strong>{selectedNeighborhood.name}</strong> ana isale hattında şu an için aktif veya planlı bir su kesintisi bulunmamaktadır. Şebeke suyu standart basınçta ve normal debide verilmektedir.
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <a
                      href={KESINTI_CONTACTS.buski.whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 text-[11px]"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp İhbar</span>
                    </a>
                    <a
                      href="tel:185"
                      className="font-black text-sky-700 hover:text-sky-900 flex items-center gap-1 text-[11px]"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Alo 185 Ara</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Hatırlatmalar */}
              <div className="bg-neutral-100/80 rounded-xl p-2.5 border border-neutral-200 space-y-1 text-[11px] text-neutral-700">
                <h5 className="font-bold text-neutral-900 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-slate-700" />
                  <span>Önemli Hatırlatma</span>
                </h5>
                <p className="text-[10.5px] text-neutral-600 leading-normal">
                  Elektrik kesintisi öncesi buzdolabı ve kombiyi fişten çekmeniz, su kesintisi
                  sonrası ilk 1-2 dakika musluğu akıtmanız tavsiye edilir.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: UEDAŞ ELEKTRİK KESİNTİLERİ */}
          {activeTab === 'uedas' && (
            <div className="space-y-2.5">
              {/* Search Bar */}
              <div className="flex items-center gap-1.5 bg-white rounded-xl px-2.5 py-1.5 border border-neutral-200">
                <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  placeholder={
                    onlyMahallem
                      ? `${selectedNeighborhood.shortName} sokak veya çalışma ara...`
                      : 'Osmangazi mahalle veya sokak ara...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-[11.5px] font-medium text-neutral-900 outline-none w-full placeholder-neutral-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-neutral-400 hover:text-neutral-600 text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Loading */}
              {loadingUedas && (
                <div className="bg-white rounded-xl p-6 border border-neutral-200 text-center space-y-1.5">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-neutral-700">
                    UEDAŞ kesinti verisi sorgulanıyor...
                  </p>
                </div>
              )}

              {/* Empty */}
              {!loadingUedas && displayedUedasOutages.length === 0 && (
                <div className="bg-white rounded-xl p-5 border border-emerald-200 text-center space-y-1.5">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-black text-neutral-900">
                    {onlyMahallem
                      ? `⚡ ${selectedNeighborhood.name}’nde Planlı Elektrik Kesintisi Yok`
                      : '⚡ Mehmet Akif, Çukurca ve Çeltik Mahallelerinde Elektrik Kesintisi Yok'}
                  </h4>
                  <p className="text-[11px] text-neutral-600 max-w-sm mx-auto">
                    {onlyMahallem
                      ? `${selectedNeighborhood.name} genelinde UEDAŞ tarafından bildirilmiş planlı bir elektrik kesintisi görünmemektedir.`
                      : 'Mehmet Akif, Çukurca ve Çeltik mahalleleri genelinde UEDAŞ tarafından bildirilmiş planlı bir elektrik kesintisi bulunmamaktadır.'}
                  </p>
                  <div className="pt-1">
                    <a
                      href="tel:186"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 hover:bg-amber-100"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Anlık Arıza: Alo 186</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Outage Cards */}
              {!loadingUedas && displayedUedasOutages.length > 0 && (
                <div className="space-y-2">
                  {displayedUedasOutages.map((item) => {
                    const isLocal = isOutageForNeighborhood(
                      `${item.mahalle} ${item.rawSokak} ${(item.sokaklar || []).join(' ')}`,
                      selectedNeighborhood
                    );
                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-xl p-3 border transition shadow-xs ${
                          isLocal
                            ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20'
                            : 'border-neutral-200 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-[9.5px] font-black uppercase bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200">
                              ⚡ {item.mahalle}
                            </span>
                            <span className="text-[9.5px] font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                              {item.ilce}
                            </span>
                            {isLocal && (
                              <span className="text-[9px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded animate-pulse">
                                Seçili Mahalleniz
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-neutral-500">
                            {item.il}
                          </span>
                        </div>

                        {/* Date and Time Bar */}
                        <div className="flex items-center gap-2.5 mt-1.5 text-[11px] font-bold text-neutral-800 flex-wrap">
                          <div className="flex items-center gap-1 text-neutral-700">
                            <Calendar className="w-3 h-3 text-amber-600" />
                            <span>{item.tarih}</span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
                            <Clock className="w-3 h-3" />
                            <span>{item.saat}</span>
                          </div>
                        </div>

                        {/* Reason */}
                        <div className="mt-1.5 text-[11px] font-semibold text-neutral-800 bg-neutral-100/70 p-1.5 rounded-lg">
                          <span className="text-neutral-500 font-bold block text-[9.5px] uppercase">
                            Kesinti Nedeni:
                          </span>
                          <span>{item.neden}</span>
                        </div>

                        {/* Streets */}
                        {item.sokaklar.length > 0 ? (
                          <div className="mt-1.5 text-[10.5px] text-neutral-600">
                            <span className="font-bold text-neutral-700 block text-[9.5px] mb-0.5">
                              Etkilenen Sokaklar:
                            </span>
                            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1 bg-neutral-50 rounded-lg border border-neutral-150">
                              {item.sokaklar.map((s, idx) => (
                                <span
                                  key={idx}
                                  className="bg-white px-1.5 py-0.2 rounded text-[10px] font-medium text-neutral-700 border border-neutral-200"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1.5 text-[10.5px] text-neutral-600 bg-amber-50/70 p-2 rounded-lg border border-amber-200 flex items-center justify-between">
                            <span className="font-bold text-neutral-700 text-[9.5px] uppercase">
                              Etkilenen Bölge:
                            </span>
                            <span className="text-amber-900 text-[10px] font-black">
                              Tüm Mahalle / Şebeke Geneli (Orta Gerilim Çalışması)
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BUSKİ SU KESİNTİLERİ */}
          {activeTab === 'buski' && (
            <div className="space-y-2">
              {/* Loading */}
              {loadingBuski && (
                <div className="bg-white rounded-xl p-6 border border-neutral-200 text-center space-y-1.5">
                  <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-neutral-700">
                    BUSKİ duyuruları sorgulanıyor...
                  </p>
                </div>
              )}

              {/* Buski Announcements List */}
              {!loadingBuski && displayedBuskiOutages.length > 0 && (
                <div className="space-y-2">
                  {displayedBuskiOutages.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl p-3 border border-neutral-200 shadow-xs hover:border-sky-300 transition"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[9.5px] font-black uppercase bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded border border-sky-200">
                            💧 {item.tip}
                          </span>
                          <span className="text-[9.5px] font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                            {item.ilce}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200/50">
                          {item.tarih}
                        </span>
                      </div>

                      <h4 className="text-xs font-black text-neutral-900 mt-1.5 leading-snug">
                        {item.baslik}
                      </h4>

                      <div className="mt-1.5 p-2 bg-neutral-50 rounded-lg text-[11px] text-neutral-700 leading-relaxed font-medium">
                        {item.icerik}
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-neutral-100 flex items-center justify-between gap-1 text-[11px] flex-wrap">
                        <div className="text-[10px] text-neutral-500 font-medium">
                          Saat: <strong className="text-neutral-800">{item.saat}</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={
                              item.whatsapp
                                ? `https://wa.me/90${item.whatsapp.replace(/\D/g, '')}`
                                : '#'
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10.5px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                          <span className="text-neutral-300">•</span>
                          <a
                            href="tel:185"
                            className="text-[10.5px] font-black text-sky-700 hover:text-sky-800 flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>185 Ara</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state when no water outage */}
              {!loadingBuski && displayedBuskiOutages.length === 0 && (
                <div className="bg-white rounded-xl p-5 border border-sky-200 text-center space-y-1.5">
                  <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center mx-auto text-sky-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-black text-neutral-900">
                    {onlyMahallem
                      ? `💧 ${selectedNeighborhood.name}’nde Planlı veya Acil Su Kesintisi Yok`
                      : '💧 Mehmet Akif, Çukurca ve Çeltik Mahallelerinde Su Kesintisi Yok'}
                  </h4>
                  <p className="text-[11px] text-neutral-600 max-w-sm mx-auto">
                    {onlyMahallem
                      ? `BUSKİ veri tabanında ${selectedNeighborhood.name} için bildirilmiş aktif veya planlı bir su kesintisi bulunmamaktadır. Şebeke suyu standart basınçtadır.`
                      : 'BUSKİ veri tabanında Mehmet Akif, Çukurca ve Çeltik mahalleleri için bildirilmiş aktif veya planlı bir su kesintisi bulunmamaktadır.'}
                  </p>
                  <div className="pt-1 flex items-center justify-center gap-2 flex-wrap">
                    <a
                      href="tel:185"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 hover:bg-sky-100"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Arıza İhbarı: Alo 185</span>
                    </a>
                    <a
                      href={KESINTI_CONTACTS.buski.whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp İhbar</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ARIZA BİLDİRİMİ */}
          {activeTab === 'ariza' && (
            <div className="space-y-2.5">
              <div className="bg-white rounded-xl p-3 border border-neutral-200 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700 shrink-0">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-neutral-900">
                      BUSKİ Su & Kanalizasyon
                    </h4>
                    <span className="text-[10px] text-neutral-500">
                      Boru patlağı, su kesintisi, sayaç arızası
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <a
                    href="tel:185"
                    className="flex items-center justify-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-2 px-2.5 rounded-lg transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Alo 185 Ara</span>
                  </a>
                  <a
                    href={KESINTI_CONTACTS.buski.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-2.5 rounded-lg transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp İhbar</span>
                  </a>
                </div>
              </div>

              <div className="bg-white rounded-xl p-3 border border-neutral-200 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-neutral-900">
                      UEDAŞ Elektrik Arıza
                    </h4>
                    <span className="text-[10px] text-neutral-500">
                      Trafo patlaması, elektrik kesintisi, sokak lambası
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <a
                    href="tel:186"
                    className="flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs py-2 px-2.5 rounded-lg transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Alo 186 Ara</span>
                  </a>
                  <a
                    href={KESINTI_CONTACTS.uedas.onlineNotice}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs py-2 px-2.5 rounded-lg transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Online İhbar</span>
                  </a>
                </div>
              </div>

              {/* Osmangazi Belediyesi Beyaz Masa */}
              <div className="bg-white rounded-xl p-3 border border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <span className="text-xs font-black text-neutral-900 block">
                      Osmangazi Beyaz Masa
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      Belediye & altyapı talepleri
                    </span>
                  </div>
                </div>
                <a
                  href="tel:153"
                  className="text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 hover:bg-rose-100"
                >
                  Alo 153
                </a>
              </div>
            </div>
          )}

          {/* TAB 5: BİLDİRİM AYARLARIM (MAHALLE BAZLI KESİNTİ ALARMI YÖNETİMİ) */}
          {activeTab === 'ayarlar' && (
            <div className="space-y-3">
              {/* Header Card: Push Notification Alarm Dashboard */}
              <div className="bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white p-3 sm:p-3.5 rounded-2xl border border-purple-800/40 shadow-xs space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
                      <BellRing className="w-4 h-4 animate-bounce" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                        <span>Kesinti Alarmı & Bildirim Ayarları</span>
                        <span className="text-[9px] font-black uppercase bg-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded border border-purple-400/30">
                          Push Bildirim
                        </span>
                      </h3>
                      <p className="text-[10.5px] text-purple-200/80 mt-0.5 leading-snug">
                        Abone olduğunuz mahallelerde yeni bir su veya elektrik kesintisi
                        olduğunda anında bildirim gönderilir.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Bar & Test Action */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-0.5">
                  <div className="bg-white/10 p-2 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[9.5px] text-slate-300 block font-medium">
                        Takip Edilen
                      </span>
                      <span className="text-xs font-black text-emerald-300">
                        {subscriptions.length} Mahalle
                      </span>
                    </div>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.5 rounded-full font-bold">
                      Aktif
                    </span>
                  </div>

                  <div className="bg-white/10 p-2 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[9.5px] text-slate-300 block font-medium">
                        Tarayıcı Durumu
                      </span>
                      <span className="text-[11px] font-black text-white">
                        {notificationPermission === 'granted'
                          ? 'İzin Verildi'
                          : notificationPermission === 'denied'
                          ? 'Engellendi'
                          : 'Hazır'}
                      </span>
                    </div>
                    <button
                      onClick={handleTestNotification}
                      className="text-[10px] font-bold bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded-lg transition active:scale-95 shadow-2xs flex items-center gap-1"
                      title="Test push bildirimi gönder"
                    >
                      <Bell className="w-3 h-3" />
                      <span>Test Et</span>
                    </button>
                  </div>
                </div>

                {testNotificationSent && (
                  <div className="bg-emerald-500/20 text-emerald-300 text-[11px] px-2.5 py-1.5 rounded-lg border border-emerald-400/30 flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Test kesinti alarmı gönderildi! Cihaz bildirimlerinizi kontrol ediniz.</span>
                  </div>
                )}
              </div>

              {/* Neighborhood Filter & Quick Preset Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1 text-xs font-bold text-neutral-800">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
                    <span>
                      Mahalle Abonelikleri ({subscriptions.length}/{BURSA_NEIGHBORHOODS.length})
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleSubscribeAll}
                      className="text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-lg transition shadow-2xs"
                    >
                      3 Mahalleye de Abone Ol
                    </button>
                    <button
                      onClick={handleSubscribeOnlyMehmetAkif}
                      className="text-[10px] font-bold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 px-2 py-0.5 rounded-lg transition shadow-2xs"
                    >
                      Sadece Mehmet Akif
                    </button>
                    {subscriptions.length > 0 && (
                      <button
                        onClick={handleUnsubscribeAll}
                        className="text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-lg transition shadow-2xs"
                      >
                        Temizle
                      </button>
                    )}
                  </div>
                </div>

                {/* Search Input for Neighborhoods */}
                <div className="flex items-center gap-1.5 bg-white rounded-xl px-2.5 py-1.5 border border-neutral-200 shadow-2xs">
                  <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Mahalle ara (Mehmet Akif, Çukurca, Çeltik)..."
                    value={neighborhoodSearch}
                    onChange={(e) => setNeighborhoodSearch(e.target.value)}
                    className="bg-transparent text-[11.5px] font-medium text-neutral-900 outline-none w-full placeholder-neutral-400"
                  />
                  {neighborhoodSearch && (
                    <button
                      onClick={() => setNeighborhoodSearch('')}
                      className="text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Neighborhoods List with Toggles */}
              <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                {filteredNeighborhoods.map((n) => {
                  const isSubscribed = subscriptions.includes(n.id);
                  const outageCount = getOutageCountForNeighborhood(n);
                  const isCurrentSelected = selectedNeighborhood.id === n.id;

                  return (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2.5 shadow-2xs ${
                        isSubscribed
                          ? 'bg-purple-50/50 border-purple-300 ring-1 ring-purple-400/20'
                          : 'bg-white border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSubscribed
                              ? 'bg-purple-600 text-white shadow-2xs'
                              : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-neutral-900 truncate">
                              {n.name}
                            </span>
                            {n.id === 'mehmet_akif' && (
                              <span className="text-[9px] font-black bg-amber-100 text-amber-900 px-1 py-0.2 rounded border border-amber-300">
                                Merkez
                              </span>
                            )}
                            {isCurrentSelected && (
                              <span className="text-[9px] font-bold bg-sky-100 text-sky-800 px-1 py-0.2 rounded">
                                Seçili
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-0.5">
                            <span>{n.district} / Bursa</span>
                            <span>•</span>
                            {outageCount > 0 ? (
                              <span className="font-bold text-amber-700 bg-amber-50 px-1 rounded">
                                ⚡ {outageCount} Aktif Kesinti
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-medium">Kesinti Yok</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Toggle Button: Abone Ol / Aboneliği İptal Et */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleSubscription(n.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition active:scale-95 border ${
                            isSubscribed
                              ? 'bg-purple-700 text-white border-purple-800 shadow-2xs'
                              : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                          }`}
                          aria-pressed={isSubscribed}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-white transition ${
                              isSubscribed ? 'bg-purple-900' : 'bg-neutral-300'
                            }`}
                          >
                            {isSubscribed ? (
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          <span>{isSubscribed ? 'Aboneliği İptal Et' : 'Abone Ol'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-3 py-2 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between text-[10.5px] text-neutral-500 shrink-0">
          <span>
            {selectedNeighborhood.name} • <strong>UEDAŞ & BUSKİ Canlı API</strong>
          </span>
          <button
            onClick={onClose}
            className="bg-neutral-900 text-white font-bold px-3 py-1 rounded-lg hover:bg-neutral-800 transition text-xs ml-auto"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
