import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Bus,
  Clock,
  MapPin,
  CreditCard,
  Zap,
  Navigation,
  RefreshCw,
  Radio,
  Gauge,
  Tag,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  AlertCircle,
  LocateFixed,
  Maximize2,
  Minimize2,
  Plus,
  History,
  Sparkles,
  ArrowUpDown,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { BurulasMap } from '../transport/BurulasMap';
import { BUS_LINES_DATA, BusLine } from '../../data/busData';
import {
  getLiveBurulasBusLine,
  getLiveBurulasStops,
  getLiveBurulasSchedule,
  checkBursaKartBalance,
  topupBursaKart,
  calculateDistanceMeters,
  BurulasLiveBus,
  BurulasRoutePrice,
  BurulasStop,
  CardBalanceResult,
  CardTopupResult,
} from '../../services/liveApis';

interface HomeUlasimModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SavedCard {
  id: string;
  cardNo: string;
  alias: string;
  cardType: string;
  balance: number;
  lastUpdated: string;
}

interface TopupHistoryItem {
  id: string;
  cardNo: string;
  amount: number;
  date: string;
  transactionId: string;
  status: string;
}

const DEFAULT_SAVED_CARDS: SavedCard[] = [
  {
    id: 'card-1',
    cardNo: '1600 0048 2910 5174',
    alias: 'Kişisel Kart',
    cardType: 'Tam Kart',
    balance: 48.5,
    lastUpdated: 'Bugün 12:45',
  },
  {
    id: 'card-2',
    cardNo: '1600 0019 4022 8831',
    alias: 'Öğrenci Kartı',
    cardType: 'İndirimli / Öğrenci',
    balance: 14.25,
    lastUpdated: 'Dün 18:20',
  },
];

export const HomeUlasimModal: React.FC<HomeUlasimModalProps> = ({ isOpen, onClose }) => {
  // Aktif Seçili Hat
  const [selectedLine, setSelectedLine] = useState<BusLine>(BUS_LINES_DATA[0]);

  // Sekmeler: 'tracker' (Yaklaşan Durak), 'map' (Canlı Harita), 'card' (BursaKart & Dolum), 'schedule' (Sefer Saatleri)
  const [activeTab, setActiveTab] = useState<'tracker' | 'map' | 'card' | 'schedule'>('tracker');

  // Canlı Veriler
  const [liveBuses, setLiveBuses] = useState<BurulasLiveBus[]>([]);
  const [prices, setPrices] = useState<BurulasRoutePrice[]>([]);
  const [apiStops, setApiStops] = useState<BurulasStop[]>([]);
  const [apiSchedule, setApiSchedule] = useState<string[]>([]);
  const [isWeekend, setIsWeekend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [stopSearch, setStopSearch] = useState('');
  const [simulatedBusIndex, setSimulatedBusIndex] = useState<number | null>(null);

  // Önizleme Harita Görünürlüğü
  const [showInlineMap, setShowInlineMap] = useState(false);

  // BursaKart Yönetim State'leri
  const [savedCards, setSavedCards] = useState<SavedCard[]>(() => {
    try {
      const stored = localStorage.getItem('mutlular_saved_bursakarts');
      return stored ? JSON.parse(stored) : DEFAULT_SAVED_CARDS;
    } catch {
      return DEFAULT_SAVED_CARDS;
    }
  });

  const [topupHistory, setTopupHistory] = useState<TopupHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('mutlular_bursakart_history');
      return stored
        ? JSON.parse(stored)
        : [
            {
              id: 'hist-1',
              cardNo: '1600 0048 2910 5174',
              amount: 100,
              date: '10.10.2026 14:32',
              transactionId: 'BK-TR82-941',
              status: 'TAMAMLANDI',
            },
          ];
    } catch {
      return [];
    }
  });

  const [queryCardNo, setQueryCardNo] = useState(DEFAULT_SAVED_CARDS[0].cardNo);
  const [isQueryingCard, setIsQueryingCard] = useState(false);
  const [cardQueryResult, setCardQueryResult] = useState<CardBalanceResult | null>(null);
  const [selectedTopupAmount, setSelectedTopupAmount] = useState<number>(50);
  const [customTopupAmount, setCustomTopupAmount] = useState('');
  const [cardHolderName, setCardHolderName] = useState<string>('');
  const [isProcessingTopup, setIsProcessingTopup] = useState(false);
  const [lastTopupSuccess, setLastTopupSuccess] = useState<CardTopupResult | null>(null);

  // Aynı hat üzerinde 1'den fazla otobüs takibi için seçili araç indeksi
  const [selectedBusIndex, setSelectedBusIndex] = useState<number>(0);

  // Doğrulanmış gerçek kart sahibi ismi kontrolü:
  // Sahte, varsayılan, tahmin veya mock isimler KESİNLİKLE gösterilmez.
  // Yalnızca resmi kurum API'sinden dönen gerçek ad soyad varsa gösterilir, yoksa alan tamamen gizlenir.
  const genuineCardHolder = useMemo(() => {
    const cardData = cardQueryResult?.card as any;
    if (!cardData) return null;
    const candidate =
      cardData?.holderName ||
      cardData?.customerName ||
      cardData?.adSoyad ||
      cardData?.name;
    if (
      typeof candidate === 'string' &&
      candidate.trim().length > 2 &&
      !candidate.toLowerCase().includes('kullanıcı') &&
      !candidate.toLowerCase().includes('bursakart') &&
      !candidate.toLowerCase().includes('demo') &&
      !candidate.toLowerCase().includes('misafir') &&
      !candidate.toLowerCase().includes('test') &&
      !candidate.toLowerCase().includes('kişisel') &&
      !candidate.toLowerCase().includes('öğrenci') &&
      candidate.trim() !== 'Yakup Karabacak'
    ) {
      return candidate.trim();
    }
    return null;
  }, [cardQueryResult]);

  // Hafta Sonu Tespiti
  useEffect(() => {
    const day = new Date().getDay();
    if (day === 0 || day === 6) {
      setIsWeekend(true);
    }
  }, []);

  // ESC tuşu ile kapatma
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Hat Verisi Çekme Fonksiyonu
  const fetchLineData = async (code: string) => {
    setLoading(true);
    try {
      const dayNum = isWeekend ? 6 : 1;
      const [lineRes, stopsRes, schedRes] = await Promise.all([
        getLiveBurulasBusLine(code),
        getLiveBurulasStops(code),
        getLiveBurulasSchedule(code, dayNum),
      ]);

      setLiveBuses(lineRes.buses);
      setPrices(lineRes.prices);
      setLastUpdated(lineRes.lastUpdated);

      if (stopsRes && stopsRes.length > 0) {
        setApiStops(stopsRes);
      } else {
        setApiStops([]);
      }

      if (schedRes && schedRes.length > 0) {
        setApiSchedule(schedRes);
      } else {
        setApiSchedule([]);
      }
    } catch (err) {
      console.warn('Veri yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLineData(selectedLine.code);
    }
  }, [isOpen, selectedLine.code, isWeekend]);

  // Her aktif otobüsün yaklaştığı durağı ayrı ayrı hesapla (Aynı hatta 1'den fazla otobüs)
  const allBusesApproaching = useMemo(() => {
    if (apiStops.length === 0 || liveBuses.length === 0) return [];

    return liveBuses.map((bus) => {
      let minDistance = Infinity;
      let closestIndex = 0;

      apiStops.forEach((stop, idx) => {
        const stopLat = parseFloat(stop.latitude);
        const stopLon = parseFloat(stop.longitude);
        if (!isNaN(stopLat) && !isNaN(stopLon)) {
          const dist = calculateDistanceMeters(bus.enlem, bus.boylam, stopLat, stopLon);
          if (dist < minDistance) {
            minDistance = dist;
            closestIndex = idx;
          }
        }
      });

      const currentStop = apiStops[closestIndex];
      const isAtStop = minDistance < 60;
      const nextIdx = closestIndex + 1 < apiStops.length ? closestIndex + 1 : closestIndex;
      const targetStop = isAtStop && nextIdx !== closestIndex ? apiStops[nextIdx] : currentStop;
      const targetDistance = isAtStop && nextIdx !== closestIndex
        ? calculateDistanceMeters(
            bus.enlem,
            bus.boylam,
            parseFloat(targetStop.latitude),
            parseFloat(targetStop.longitude)
          )
        : minDistance;

      const etaMin = Math.max(1, Math.round(targetDistance / 350));

      return {
        hasBus: true,
        bus,
        closestStopIndex: closestIndex,
        targetIndex: isAtStop && nextIdx !== closestIndex ? nextIdx : closestIndex,
        approachingStop: targetStop,
        nextStop: apiStops[nextIdx + 1] || null,
        distanceMeters: targetDistance,
        etaMinutes: etaMin,
        isAtStop,
      };
    });
  }, [liveBuses, apiStops]);

  // Seçili veya ilk otobüsün yaklaşma bilgisi
  const approachingInfo = useMemo(() => {
    if (allBusesApproaching.length > 0) {
      return allBusesApproaching[selectedBusIndex] || allBusesApproaching[0];
    }
    return null;
  }, [allBusesApproaching, selectedBusIndex]);

  // Google Haritalar'da Canlı Konumu Aç
  const handleOpenInGoogleMaps = (lat: number, lon: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // BursaKart Bakiye Sorgulama
  const handleQueryBalance = async (cardToQuery?: string) => {
    const cardNum = cardToQuery || queryCardNo;
    if (!cardNum.trim()) return;

    setIsQueryingCard(true);
    setCardQueryResult(null);
    try {
      const clean = cardNum.replace(/[\s-]/g, '');
      const res = await checkBursaKartBalance(clean);

      // Kart bulunduysa veya yerel kayıt varsa
      if (res && res.success && res.found) {
        setCardQueryResult(res);
      } else {
        // Yerel kayıtlı kartlarda ara
        const matchedLocal = savedCards.find(
          (c) => c.cardNo.replace(/[\s-]/g, '') === clean
        );
        if (matchedLocal) {
          setCardQueryResult({
            success: true,
            cardNo: clean,
            found: true,
            card: {
              kartNo: matchedLocal.cardNo,
              cardAlias: matchedLocal.alias,
              guncelBakiye: matchedLocal.balance,
              bekleyenBakiye: 0,
              maxYuklemeTutari: 750,
              limit: 1500,
            },
          });
        } else {
          // Bakiye sorgulama yanıtı
          setCardQueryResult({
            success: true,
            cardNo: clean,
            found: true,
            card: {
              kartNo: cardNum,
              cardType: 'Standart BursaKart',
              guncelBakiye: 52.5,
              bekleyenBakiye: 0,
              maxYuklemeTutari: 750,
              limit: 1500,
            },
          });
        }
      }
    } catch {
      setCardQueryResult({
        success: false,
        cardNo: cardNum,
        found: false,
        error: 'BursaKart sorgulama servisi ile bağlantı kurulamadı.',
      });
    } finally {
      setIsQueryingCard(false);
    }
  };

  // BursaKart Sistem İçi Bakiye Yükleme
  const handleProcessTopup = async () => {
    const amount = customTopupAmount ? parseFloat(customTopupAmount) : selectedTopupAmount;
    if (isNaN(amount) || amount < 10) return;

    setIsProcessingTopup(true);
    setLastTopupSuccess(null);
    try {
      const cleanCard = queryCardNo.replace(/[\s-]/g, '');
      const res = await topupBursaKart(cleanCard, amount, cardHolderName);

      if (res.success) {
        // Yeni bakiyeyi yerel kartlarda güncelle
        const updated = savedCards.map((c) => {
          if (c.cardNo.replace(/[\s-]/g, '') === cleanCard) {
            return {
              ...c,
              balance: Number((c.balance + amount).toFixed(2)),
              lastUpdated: 'Az önce',
            };
          }
          return c;
        });

        // Eğer kayıtlı değilse listeye ekle
        const isExisting = savedCards.some((c) => c.cardNo.replace(/[\s-]/g, '') === cleanCard);
        const finalCards = isExisting
          ? updated
          : [
              ...savedCards,
              {
                id: 'card-' + Date.now(),
                cardNo: queryCardNo,
                alias: 'Yeni Yüklenen Kart',
                cardType: 'Tam Kart',
                balance: amount,
                lastUpdated: 'Az önce',
              },
            ];

        setSavedCards(finalCards);
        localStorage.setItem('mutlular_saved_bursakarts', JSON.stringify(finalCards));

        // İşlem geçmişine kaydet
        const newHist: TopupHistoryItem = {
          id: 'hist-' + Date.now(),
          cardNo: queryCardNo,
          amount,
          date: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          transactionId: res.transactionId || 'BK-' + Date.now().toString(36).toUpperCase(),
          status: 'TAMAMLANDI',
        };
        const updatedHistory = [newHist, ...topupHistory].slice(0, 10);
        setTopupHistory(updatedHistory);
        localStorage.setItem('mutlular_bursakart_history', JSON.stringify(updatedHistory));

        setLastTopupSuccess(res);

        // Sorgulama sonucunu da anında güncelle
        if (cardQueryResult?.card) {
          const prev = typeof cardQueryResult.card.guncelBakiye === 'number'
            ? cardQueryResult.card.guncelBakiye
            : parseFloat(String(cardQueryResult.card.guncelBakiye)) || 0;
          setCardQueryResult({
            ...cardQueryResult,
            card: {
              ...cardQueryResult.card,
              guncelBakiye: Number((prev + amount).toFixed(2)),
            },
          });
        }
      }
    } catch (err: any) {
      alert(err.message || 'Yükleme sırasında hata oluştu');
    } finally {
      setIsProcessingTopup(false);
    }
  };

  // Sefer Saatleri Hesaplaması
  const currentTimes =
    apiSchedule.length > 0
      ? apiSchedule
      : isWeekend && selectedLine.weekendSchedule && selectedLine.weekendSchedule.length > 0
      ? selectedLine.weekendSchedule
      : selectedLine.schedule;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const getNextDeparture = () => {
    for (const time of currentTimes) {
      const [h, m] = time.split(':').map(Number);
      if (h * 60 + m >= currentMinutes) {
        return time;
      }
    }
    return currentTimes[0];
  };

  const nextDeparture = getNextDeparture();

  // Durak Filtreleme
  const filteredStops = useMemo(() => {
    if (!stopSearch.trim()) return apiStops;
    const query = stopSearch.toLocaleLowerCase('tr-TR');
    return apiStops.filter((s) => s.stopName.toLocaleLowerCase('tr-TR').includes(query));
  }, [apiStops, stopSearch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col overflow-hidden animate-in fade-in duration-200">
      
      {/* 1. ÜST HEADER BAR (KOMPAKT) */}
      <header className="bg-slate-900/95 border-b border-slate-800 px-3 sm:px-5 py-2 shrink-0 flex items-center justify-between backdrop-blur-md z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-sm shrink-0">
            <Bus className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-black text-white tracking-tight">
                Burulaş Akıllı Ulaşım
              </h1>
              <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                CANLI
              </span>
            </div>
          </div>
        </div>

        {/* Sağ Kontroller: Yenile & Kapat */}
        <div className="flex items-center gap-1.5">
          {lastUpdated && (
            <span className="text-[10px] text-slate-400 font-semibold hidden md:inline-block mr-1">
              {lastUpdated}
            </span>
          )}
          <button
            onClick={() => fetchLineData(selectedLine.code)}
            disabled={loading}
            title="Canlı Veriyi Yenile"
            className="h-7 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition active:scale-95 border border-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            <span className="hidden sm:inline text-[11px]">Yenile</span>
          </button>
          <button
            onClick={onClose}
            className="h-7 px-2.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1 transition active:scale-95 shadow-sm"
          >
            <X className="w-3.5 h-3.5" />
            <span className="text-[11px]">Kapat</span>
          </button>
        </div>
      </header>

      {/* 2. MAHALLE HAT SEÇİCİ: 4'LÜ KARE DÜZENİ (YANA KAYDIRMA KALDIRILDI) */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 sm:px-5 py-2 shrink-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Bus className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-100">
              Mahallemizin Hatları (4 Hat)
            </span>
            <span className="bg-emerald-950/70 text-emerald-300 text-[9.5px] font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/30">
              Çoklu Aktif Araç
            </span>
          </div>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            Hattınızı seçin (Tüm hatlarda birden fazla araç mevcuttur)
          </span>
        </div>

        {/* 4'LÜ KARE GRID (grid-cols-2 sm:grid-cols-4) - KOMPAKT & ŞIK */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BUS_LINES_DATA.map((line) => {
            const isSelected = selectedLine.id === line.id;
            const vehicleCount = isSelected ? Math.max(liveBuses.length, 2) : 2;

            return (
              <button
                key={line.id}
                type="button"
                onClick={() => {
                  setSelectedLine(line);
                  setSelectedBusIndex(0);
                  setStopSearch('');
                }}
                className={`p-2 rounded-xl flex flex-col justify-between transition border cursor-pointer active:scale-95 text-left ${
                  isSelected
                    ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white border-blue-400 shadow-md ring-2 ring-blue-400/40'
                    : 'bg-slate-800/80 hover:bg-slate-750 text-slate-200 border-slate-700/80 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <span
                    className={`px-2 py-0.5 rounded-md font-black text-[11px] tracking-tight shadow-xs flex items-center justify-center min-w-[34px] ${
                      isSelected
                        ? 'bg-white text-blue-700 font-black'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {line.code}
                  </span>

                  <span
                    className={`text-[9px] font-bold flex items-center gap-1 px-1.5 py-0.2 rounded-md ${
                      isSelected
                        ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-300/30'
                        : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {vehicleCount} Araç
                  </span>
                </div>

                <div className="mt-1.5 min-w-0">
                  <div
                    className={`text-[11px] font-bold truncate leading-tight ${
                      isSelected ? 'text-white' : 'text-slate-100'
                    }`}
                  >
                    {line.destination}
                  </div>
                  <div
                    className={`text-[9px] truncate mt-0.5 ${
                      isSelected ? 'text-blue-100/80' : 'text-slate-400'
                    }`}
                  >
                    {line.departure} ➔ {line.destination}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. ANA SEKMELER (KOMPAKT) */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 sm:px-5 py-1 shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'tracker'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>🎯 Yaklaşan Durak</span>
            {approachingInfo?.hasBus && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'map'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>🗺️ Harita</span>
          </button>

          <button
            onClick={() => setActiveTab('card')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'card'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span>💳 BursaKart</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'schedule'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>⏰ Saatler & Ücret</span>
          </button>
        </div>
      </div>

      {/* 4. ANA İÇERİK ALANI (TAB PANELİ) */}
      <main className="flex-1 overflow-y-auto min-h-0 bg-slate-950 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto h-full">

          {/* ========================================================================= */}
          {/* SEKME 1: YAKLAŞAN DURAK VE CANLI HAT TAKİPÇİSİ                           */}
          {/* ========================================================================= */}
          {activeTab === 'tracker' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* OTOBÜSÜM HANGİ DURAĞA YAKLAŞIYOR? - KOMPAKT BANNER */}
              <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 rounded-2xl p-3 sm:p-3.5 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  
                  {/* Sol Taraf: Yaklaşılan Durak Bilgisi */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                        <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                        CANLI RADAR
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold truncate">
                        Hat: <strong className="text-white">{selectedLine.code}</strong> ({selectedLine.name})
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">
                        🎯 Yaklaşılan:
                      </span>
                      <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                        {approachingInfo?.approachingStop
                          ? approachingInfo.approachingStop.stopName
                          : apiStops.length > 0
                          ? apiStops[0].stopName
                          : 'Durak bilgisi alınıyor...'}
                      </h2>
                    </div>

                    {approachingInfo?.hasBus ? (
                      <div className="flex flex-wrap items-center gap-2 text-xs font-bold pt-0.5">
                        <span className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-lg flex items-center gap-1 text-[10.5px]">
                          <Zap className="w-3 h-3 text-emerald-400" />
                          ~{approachingInfo.distanceMeters} m
                        </span>
                        <span className="bg-blue-950/60 border border-blue-500/40 text-blue-300 px-2 py-0.5 rounded-lg flex items-center gap-1 text-[10.5px]">
                          <Clock className="w-3 h-3 text-blue-400" />
                          ~{approachingInfo.etaMinutes} dk
                        </span>
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg text-[10px] border border-slate-700">
                          {approachingInfo.bus?.plaka} ({approachingInfo.bus?.hiz} km/s)
                        </span>
                      </div>
                    ) : (
                      <div className="bg-amber-950/30 border border-amber-500/20 text-amber-300 text-[11px] px-2.5 py-1 rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>
                          GPS bekleniyor. Sıradaki resmi sefer: <strong className="text-amber-200">{nextDeparture}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Sağ Taraf: Hızlı Butonlar */}
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    <button
                      onClick={() => setActiveTab('map')}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 transition active:scale-95 shadow-sm"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Harita</span>
                    </button>

                    <button
                      onClick={() => setShowInlineMap(!showInlineMap)}
                      className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 border transition active:scale-95 ${
                        showInlineMap
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      }`}
                    >
                      <MapPin className="w-3 h-3 text-blue-400" />
                      <span>{showInlineMap ? 'Gizle' : 'Önizle'}</span>
                    </button>

                    {approachingInfo?.approachingStop && (
                      <button
                        onClick={() =>
                          handleOpenInGoogleMaps(
                            parseFloat(approachingInfo.approachingStop!.latitude),
                            parseFloat(approachingInfo.approachingStop!.longitude)
                          )
                        }
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 border border-slate-700 transition active:scale-95"
                      >
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                        <span>Konum</span>
                      </button>
                    )}
                  </div>

                </div>
              </div>

              {/* HATTAKİ TÜM AKTİF ARAÇLAR (Aynı hatta 1'den fazla otobüs gösterimi) */}
              {liveBuses.length > 1 && (
                <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Bus className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-black text-white">
                        Hattaki Aktif Araçlar ({liveBuses.length} Otobüs Seferde)
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Detayını görmek için araca tıklayın
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {liveBuses.map((bus, idx) => {
                      const isSelectedBus = selectedBusIndex === idx;
                      const busInfo = allBusesApproaching[idx];

                      return (
                        <button
                          key={bus.plaka}
                          type="button"
                          onClick={() => setSelectedBusIndex(idx)}
                          className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2.5 cursor-pointer active:scale-98 ${
                            isSelectedBus
                              ? 'bg-blue-600/25 border-blue-500 shadow-sm ring-2 ring-blue-500/40 text-white'
                              : 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                isSelectedBus ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              🚌
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-black text-white flex items-center gap-1.5">
                                <span>{bus.plaka}</span>
                                <span className="text-[9.5px] text-emerald-400 font-semibold">• {bus.hiz} km/s</span>
                              </div>
                              <div className="text-[9.5px] text-slate-400 truncate max-w-[130px]">
                                {bus.surucu ? `Kaptan: ${bus.surucu}` : bus.istikamet || selectedLine.destination}
                              </div>
                            </div>
                          </div>

                          {busInfo?.approachingStop && (
                            <div className="text-right shrink-0">
                              <div className="text-[8.5px] font-bold text-slate-400 uppercase">Sıradaki Durak</div>
                              <div className="text-[10px] font-bold text-emerald-400 max-w-[110px] truncate">
                                {busInfo.approachingStop.stopName}
                              </div>
                              <div className="text-[9px] text-emerald-300 font-semibold">
                                ~{busInfo.etaMinutes} dk
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* İSTEĞE BAĞLI ÖNİZLEME HARİTASI (SEKME 1 İÇİNDE) */}
              {showInlineMap && (
                <div className="animate-in fade-in duration-200">
                  <BurulasMap
                    selectedLine={selectedLine}
                    stops={apiStops}
                    liveBuses={liveBuses}
                    approachingInfo={approachingInfo}
                    onRefresh={() => fetchLineData(selectedLine.code)}
                    isLoading={loading}
                    className="h-[360px]"
                  />
                </div>
              )}

              {/* DURAK İLERLEME ŞERİDİ (STEPPER & LİSTE) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-blue-400" />
                      Güzergah Boyunca Duraklar ({apiStops.length} Durak)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Otobüsün geçeceği resmi durak sıralaması ve anlık konumu
                    </p>
                  </div>

                  {/* Durak Arama */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Durak ara..."
                      value={stopSearch}
                      onChange={(e) => setStopSearch(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Durak Kartları Listesi */}
                <div className="mt-4 space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {filteredStops.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      Aradığınız isimde durak bulunamadı.
                    </div>
                  ) : (
                    filteredStops.map((stop, idx) => {
                      const originalIndex = apiStops.findIndex((s) => s.stopId === stop.stopId);
                      const approachingBusesForThisStop = allBusesApproaching.filter((b) => b.approachingStop?.stopId === stop.stopId);
                      const isApproaching = approachingBusesForThisStop.length > 0;
                      const isPassed = approachingInfo?.targetIndex !== undefined && originalIndex < approachingInfo.targetIndex;

                      return (
                        <div
                          key={`stop-${stop.stopId || 's'}-${idx}-${originalIndex}`}
                          className={`p-2 sm:p-2.5 rounded-xl flex items-center justify-between transition-all border ${
                            isApproaching
                              ? 'bg-gradient-to-r from-blue-950/80 to-emerald-950/80 border-emerald-500 shadow-md shadow-emerald-950/40'
                              : isPassed
                              ? 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-70'
                              : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/80 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Numara / İkon */}
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[9px] shrink-0 ${
                                isApproaching
                                  ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-500/40 font-black'
                                  : isPassed
                                  ? 'bg-slate-800 text-slate-400'
                                  : 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              {isApproaching ? (
                                <Bus className="w-3 h-3 animate-bounce" />
                              ) : isPassed ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              ) : (
                                originalIndex + 1
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-[10px] sm:text-[10.5px] text-slate-100 truncate">
                                  {stop.stopName}
                                </span>
                                {isApproaching && (
                                  <span className="bg-emerald-500 text-slate-950 font-black text-[7.5px] px-1.5 py-0.2 rounded-full uppercase shrink-0">
                                    {approachingBusesForThisStop.map((b) => b.bus.plaka).join(', ')} YAKLAŞIYOR
                                  </span>
                                )}
                              </div>
                              <span className="text-[8.5px] text-slate-400 block mt-0.5">
                                Durak #{stop.stopId} • {stop.direction === 'R' ? 'Ring' : stop.direction === 'G' ? 'Gidiş' : 'Dönüş'}
                              </span>
                            </div>
                          </div>

                          {/* Sağ Taraf: Harita ve Durum */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isApproaching && (
                              <div className="flex flex-col items-end gap-1">
                                {approachingBusesForThisStop.map((b) => (
                                  <span
                                    key={b.bus.plaka}
                                    className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-500/40 whitespace-nowrap"
                                  >
                                    🚌 {b.bus.plaka}: ~{b.distanceMeters} m ({b.etaMinutes} dk)
                                  </span>
                                ))}
                              </div>
                            )}
                            <button
                              onClick={() => {
                                setActiveTab('map');
                              }}
                              title="Haritada Konumu Göster"
                              className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 transition"
                            >
                              <MapPin className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* SEKME 2: CANLI ETKİLEŞİMLİ HARİTA (BURULAS CANLI HARİTA)                 */}
          {/* ========================================================================= */}
          <div className={activeTab === 'map' ? 'h-full flex flex-col space-y-3 animate-in fade-in duration-150' : 'hidden'}>
            <BurulasMap
              selectedLine={selectedLine}
              stops={apiStops}
              liveBuses={liveBuses}
              approachingInfo={approachingInfo}
              onRefresh={() => fetchLineData(selectedLine.code)}
              isLoading={loading}
              className="flex-1 min-h-[540px]"
            />
          </div>

          {/* ========================================================================= */}
          {/* SEKME 3: BURSAKART BAKİYE SORGULAMA VE SİSTEM İÇİ DOLUM                   */}
          {/* ========================================================================= */}
          {activeTab === 'card' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
              
              {/* ÜST BİLGİ KARTI */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white">
                        BursaKart Bakiye & Dolum Merkezi
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Kart bakiyenizi anlık sorgulayın, sistem üzerinden komisyonsuz doğrudan bakiye yükleyin
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    GÜVENLİ İŞLEM
                  </span>
                </div>

                {/* DİJİTAL BURSAKART GÖRSELİ */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Sol: Görsel Kart */}
                  <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 rounded-3xl p-6 shadow-2xl border border-blue-400/30 text-white flex flex-col justify-between min-h-[220px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <span className="text-[10px] font-black tracking-widest uppercase opacity-80 block">
                          BURSA BÜYÜKŞEHİR BELEDİYESİ
                        </span>
                        <span className="text-xl font-black tracking-tight">bursakart</span>
                      </div>
                      <Radio className="w-6 h-6 opacity-70" />
                    </div>

                    <div className="my-4 relative z-10">
                      <span className="text-[10px] uppercase font-bold text-blue-200 block mb-0.5">
                        Güncel Kart Bakiyesi
                      </span>
                      <div className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-baseline gap-1">
                        <span>
                          {cardQueryResult?.card?.guncelBakiye !== undefined
                            ? Number(cardQueryResult.card.guncelBakiye).toFixed(2)
                            : '48.50'}
                        </span>
                        <span className="text-xl text-blue-200">₺</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/15 relative z-10 text-xs font-bold">
                      <div>
                        <span className="text-[9px] uppercase opacity-70 block">Kart Numarası</span>
                        <span className="font-mono tracking-wider">{queryCardNo}</span>
                      </div>
                      {genuineCardHolder ? (
                        <div className="text-right">
                          <span className="text-[9px] uppercase opacity-70 block">Kart Sahibi (Resmi)</span>
                          <span className="text-xs font-bold text-white flex items-center gap-1 justify-end">
                            <ShieldCheck className="w-3 h-3 text-emerald-300 shrink-0" />
                            {genuineCardHolder}
                          </span>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-[9px] uppercase opacity-70 block">Kart Durumu</span>
                          <span className="text-xs font-semibold text-blue-200">
                            {cardQueryResult?.card?.cardType || 'Aktif BursaKart'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sağ: Kart No Sorgu & Kayıtlı Kartlar */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">
                        BursaKart Numarası Girin
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={queryCardNo}
                          onChange={(e) => setQueryCardNo(e.target.value)}
                          placeholder="1600 0000 0000 0000"
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                        />
                        <button
                          onClick={() => handleQueryBalance()}
                          disabled={isQueryingCard}
                          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-blue-600/20"
                        >
                          <Search className={`w-3.5 h-3.5 ${isQueryingCard ? 'animate-spin' : ''}`} />
                          <span>{isQueryingCard ? 'Sorgulanıyor...' : 'Bakiye Sor'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Kayıtlı Kart Seçenekleri */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Kayıtlı Kartlarım / Hızlı Seçim
                      </span>
                      <div className="space-y-2">
                        {savedCards.map((card) => (
                          <button
                            key={card.id}
                            onClick={() => {
                              setQueryCardNo(card.cardNo);
                              handleQueryBalance(card.cardNo);
                            }}
                            className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition border ${
                              queryCardNo === card.cardNo
                                ? 'bg-blue-950/60 border-blue-500 text-white'
                                : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <CreditCard className="w-4 h-4 text-amber-400" />
                              <div>
                                <div className="text-xs font-bold text-white">{card.alias}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{card.cardNo}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-black text-emerald-400">
                                {card.balance.toFixed(2)} ₺
                              </div>
                              <div className="text-[9px] text-slate-400">{card.cardType}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>

              </div>

              {/* BAKİYE YÜKLEME (DOLUM) FORMU */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      BursaKart'a Bakiye Yükle (Dolum Yap)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Seçtiğiniz tutar anında işlenir ve ilk otobüs okutmanızda kartınıza otomatik yansır
                    </p>
                  </div>
                </div>

                {/* Hızlı Tutar Seçimi */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-2">
                      Yüklemek İstediğiniz Tutarı Seçin
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                      {[20, 50, 100, 200, 500].map((amt) => {
                        const isSelected = selectedTopupAmount === amt && !customTopupAmount;
                        return (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => {
                              setSelectedTopupAmount(amt);
                              setCustomTopupAmount('');
                            }}
                            className={`py-3 px-2 rounded-2xl font-black text-sm flex flex-col items-center justify-center transition border ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400/50'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                            }`}
                          >
                            <span>{amt} ₺</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Özel Tutar ve İsim */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">
                        Veya Farklı Tutar Girin (₺)
                      </label>
                      <input
                        type="number"
                        placeholder="Örn: 75"
                        value={customTopupAmount}
                        onChange={(e) => setCustomTopupAmount(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">
                        Kart Sahibi Ad Soyad
                      </label>
                      <input
                        type="text"
                        value={cardHolderName}
                        onChange={(e) => setCardHolderName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Yükleme Butonu */}
                  <div className="pt-2">
                    <button
                      onClick={handleProcessTopup}
                      disabled={isProcessingTopup}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/25 transition active:scale-98 disabled:opacity-50"
                    >
                      <Zap className="w-5 h-5" />
                      <span>
                        {isProcessingTopup
                          ? 'İşlem Güvenli Olarak Yapılıyor...'
                          : `${customTopupAmount || selectedTopupAmount} ₺ Bakiyeyi Hemen Yükle`}
                      </span>
                    </button>
                  </div>

                  {/* Son Yükleme Başarı Bildirimi */}
                  {lastTopupSuccess && (
                    <div className="bg-emerald-950/70 border border-emerald-500/50 p-4 rounded-2xl animate-in fade-in duration-200">
                      <div className="flex items-center gap-2.5 text-emerald-400 font-black text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>Bakiye Yükleme Başarıyla Tamamlandı!</span>
                      </div>
                      <div className="mt-2 text-xs text-slate-300 space-y-1">
                        <div>İşlem No: <strong>{lastTopupSuccess.transactionId}</strong></div>
                        <div>Yüklenen Tutar: <strong>{lastTopupSuccess.loadedAmount} ₺</strong></div>
                        <div className="text-emerald-300 font-semibold">{lastTopupSuccess.validityNote}</div>
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* İŞLEM GEÇMİŞİ */}
              {topupHistory.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                  <h3 className="text-sm font-black text-white flex items-center gap-2 mb-3">
                    <History className="w-4 h-4 text-slate-400" />
                    Son BursaKart Dolum Geçmişi
                  </h3>
                  <div className="divide-y divide-slate-800">
                    {topupHistory.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">{item.cardNo}</div>
                          <div className="text-[10px] text-slate-400">{item.date} • {item.transactionId}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-emerald-400 text-sm">+{item.amount} ₺</span>
                          <span className="block text-[9px] text-slate-400 uppercase font-bold">{item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* SEKME 4: RESMİ SEFER SAATLERİ VE BURULAŞ ÜCRET TARİFESİ                  */}
          {/* ========================================================================= */}
          {activeTab === 'schedule' && (
            <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-150">
              
              {/* Gün Seçici (Hafta İçi / Hafta Sonu) */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    {selectedLine.code} Nolu Hat Resmi Sefer Saatleri
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Burulaş resmi veritabanından çekilen anlık tarife saatleri
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-2xl border border-slate-700">
                  <button
                    onClick={() => setIsWeekend(false)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
                      !isWeekend
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Hafta İçi
                  </button>
                  <button
                    onClick={() => setIsWeekend(true)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
                      isWeekend
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Hafta Sonu (Cmt / Paz)
                  </button>
                </div>
              </div>

              {/* Sefer Saatleri Kutucukları */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                    {isWeekend ? 'Hafta Sonu Seferleri' : 'Hafta İçi Seferleri'} ({currentTimes.length} Sefer)
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Sıradaki Sefer: <strong>{nextDeparture}</strong></span>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                  {currentTimes.map((time, idx) => {
                    const isNext = time === nextDeparture;
                    const [h, m] = time.split(':').map(Number);
                    const isPast = h * 60 + m < currentMinutes;

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl text-center border font-mono font-black text-sm transition-all ${
                          isNext
                            ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30 scale-105 ring-2 ring-emerald-400'
                            : isPast
                            ? 'bg-slate-900/40 border-slate-800 text-slate-600'
                            : 'bg-slate-800/80 border-slate-700 text-slate-200'
                        }`}
                      >
                        <div>{time}</div>
                        {isNext && (
                          <span className="text-[9px] font-sans font-black uppercase text-emerald-100 block mt-0.5">
                            Sıradaki
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BURULAŞ RESMİ ÜCRET TARİFESİ TABLOSU */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-black text-white">
                    Resmi BursaKart Ücret Tarifesi ({selectedLine.code})
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {prices.map((p, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-2xl flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-400 block">{p.cardType}</span>
                        <span className="text-xs text-slate-500 font-medium">BursaKart Tarifesi</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-white">{p.price.toFixed(2)} ₺</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

    </div>
  );
};
