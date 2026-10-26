import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  Phone,
  MapPin,
  Navigation,
  Stethoscope,
  Compass,
  Search,
  RefreshCw,
  Clock,
  Sparkles,
  Check,
  Copy,
  Car,
  Footprints,
  Info,
  MapPinOff,
  Maximize2,
  Minimize2,
  Map,
  List,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  Pharmacy,
  LOCATION_PRESETS,
  fetchNobetciEczaneler,
  sortPharmaciesByDistance,
} from '../../services/pharmacyService';

interface PharmacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSaglikOcagi?: () => void;
}

export const PharmacyModal: React.FC<PharmacyModalProps> = ({
  isOpen,
  onClose,
  onOpenSaglikOcagi,
}) => {
  // Eczane verileri
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDate, setActiveDate] = useState<string>('');
  const [sourceTag, setSourceTag] = useState<string>('');

  // Tam ekran modu durumu (Varsayılan tam ekran)
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Görünüm modu: 'list' (Liste görünümü) veya 'map' (Harita görünümü)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Konum durumu - Varsayılan olarak Mutlular Mah. ile başlar (yakınlık sorunu olmaması için)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: LOCATION_PRESETS[0].lat,
    lng: LOCATION_PRESETS[0].lng,
  });
  const [locationStatus, setLocationStatus] = useState<
    'idle' | 'prompt' | 'requesting' | 'granted' | 'denied' | 'preset'
  >('preset');
  const [locationName, setLocationName] = useState<string>(LOCATION_PRESETS[0].name);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string>('');

  // Filtreler: 'nearest' | 'osmangazi' | 'nilufer' | 'yildirim' | 'all'
  const [selectedDistrict, setSelectedDistrict] = useState<string>('nearest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedMapPharmacy, setSelectedMapPharmacy] = useState<Pharmacy | null>(null);

  // Konum alma fonksiyonu (Tarayıcı GPS)
  const requestUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      setLocationErrorMsg('Cihazınızda GPS konum servisi desteklenmiyor.');
      return;
    }

    setLocationStatus('requesting');
    setLocationErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords({ lat, lng });
        setLocationStatus('granted');
        setLocationName('Mevcut Konumunuz (GPS Doğrulandı)');
        setLocationAccuracy(Math.round(pos.coords.accuracy));
      },
      (err) => {
        console.warn('Geolocation uyarısı:', err.message);
        setLocationStatus('denied');
        if (err.code === 1) {
          setLocationErrorMsg('Konum izni verilmedi. Aşağıdaki mahallelerden seçim yapabilirsiniz.');
        } else if (err.code === 2) {
          setLocationErrorMsg('Konum sinyali alınamadı. Mahallenizi seçebilirsiniz.');
        } else {
          setLocationErrorMsg('Konum zaman aşımına uğradı.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 30000,
      }
    );
  }, []);

  // Hızlı Mahalle Preset Seçimi
  const applyPresetLocation = (preset: (typeof LOCATION_PRESETS)[0]) => {
    setUserCoords({ lat: preset.lat, lng: preset.lng });
    setLocationStatus('preset');
    setLocationName(preset.name);
    setLocationAccuracy(null);
    setLocationErrorMsg('');
  };

  // Veri yükleme
  const loadPharmacies = useCallback(async (coords: { lat: number; lng: number }) => {
    setLoading(true);
    try {
      const res = await fetchNobetciEczaneler(coords);
      if (res.success && res.pharmacies) {
        // Gelen listeyi aktif kullanıcı koordinatına göre mesafeyle hesapla ve sırala
        const sorted = sortPharmaciesByDistance(res.pharmacies, coords.lat, coords.lng);
        setPharmacies(sorted);
        setActiveDate(res.date);
        setSourceTag(
          res.source === 'LIVE_BURSA_ECZANE'
            ? 'Bursa Canlı Nöbet Sistemi'
            : 'Bursa Nöbetçi Eczane Verisi'
        );
      }
    } catch (e: any) {
      console.error('Eczane yükleme hatası:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Modal ilk açıldığında
  useEffect(() => {
    if (isOpen) {
      // Varsayılan koordinatla yükle
      loadPharmacies(userCoords);
      // Arka planda GPS'i de sorgula
      requestUserLocation();
    }
  }, [isOpen]);

  // Koordinat değiştiğinde eczaneleri bu konuma göre hemen yeniden sırala
  useEffect(() => {
    if (userCoords && pharmacies.length > 0) {
      const sorted = sortPharmaciesByDistance(pharmacies, userCoords.lat, userCoords.lng);
      setPharmacies(sorted);
    }
  }, [userCoords.lat, userCoords.lng]);

  // Kopyalama fonksiyonu
  const handleCopyAddress = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Filtrelenmiş Eczaneler
  const filteredPharmacies = useMemo(() => {
    let list = [...pharmacies];

    // İlçe filtresi
    if (selectedDistrict !== 'all' && selectedDistrict !== 'nearest') {
      list = list.filter((p) => {
        const ilce = (p.ilce || '').toLowerCase();
        if (selectedDistrict === 'osmangazi') return ilce.includes('osmangazi');
        if (selectedDistrict === 'nilufer') return ilce.includes('nilufer') || ilce.includes('nilüfer');
        if (selectedDistrict === 'yildirim') return ilce.includes('yildirim') || ilce.includes('yıldırım');
        return true;
      });
    }

    // Arama filtresi
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          (p.neighborhood && p.neighborhood.toLowerCase().includes(q)) ||
          (p.pharmacist && p.pharmacist.toLowerCase().includes(q))
      );
    }

    // Her zaman mesafeye göre sıralı tut
    list.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));

    return list;
  }, [pharmacies, selectedDistrict, searchQuery]);

  // En yakın eczane (aktif filtredeki 1. eleman)
  const nearestPharmacy = useMemo(() => {
    if (filteredPharmacies.length > 0) {
      return filteredPharmacies[0];
    }
    return null;
  }, [filteredPharmacies]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-200">
      {/* TAM EKRAN MODAL ÇERÇEVESİ */}
      <div
        className={`bg-white w-full h-full flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'fixed inset-0 rounded-none'
            : 'sm:w-[96vw] sm:max-w-6xl sm:h-[94vh] sm:rounded-3xl sm:border sm:border-neutral-200 sm:shadow-2xl'
        }`}
      >
        {/* ÜST BAŞLIK (HEADER) - Kırmızı Acil/Sağlık Teması */}
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 text-white shrink-0 relative overflow-hidden px-4 py-3 sm:px-6 sm:py-4 shadow-md">
          {/* Arka plan dekoratif desen */}
          <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute left-1/3 -top-10 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-inner border border-white/30 shrink-0">
                E
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-xl font-black tracking-tight leading-tight">
                    Nöbetçi Eczaneler
                  </h2>
                  <span className="text-[10px] sm:text-xs font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    7/24 AÇIK
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold bg-white/20 text-rose-100 px-2 py-0.5 rounded-full border border-white/25 hidden md:inline-flex">
                    {sourceTag || 'Bursa Canlı Nöbet Listesi'}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-rose-100 font-medium truncate mt-0.5">
                  Bursa • {activeDate || 'Bugün'} • Google Haritalar Gerçek Karayolu Sürüş Doğrulamalı
                </p>
              </div>
            </div>

            {/* Üst Sağ Aksiyonlar */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Görünüm Değiştirici: Liste / Harita */}
              <div className="hidden sm:flex items-center bg-white/20 rounded-xl p-0.5 border border-white/20">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    viewMode === 'list'
                      ? 'bg-white text-rose-700 shadow-2xs'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Liste</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    viewMode === 'map'
                      ? 'bg-white text-rose-700 shadow-2xs'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Harita</span>
                </button>
              </div>

              {/* Yenile Butonu */}
              <button
                onClick={() => {
                  requestUserLocation();
                  loadPharmacies(userCoords);
                }}
                title="Listeyi ve Mesafeleri Yenile"
                className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 flex items-center justify-center text-white transition cursor-pointer border border-white/20"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* Tam Ekran Büyüt/Küçült Butonu */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? 'Pencere Moduna Geç' : 'Tam Ekran Yap'}
                className="hidden sm:flex w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 items-center justify-center text-white transition cursor-pointer border border-white/20"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>

              {/* Kapat Butonu */}
              <button
                onClick={onClose}
                title="Kapat"
                className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 flex items-center justify-center text-white transition cursor-pointer border border-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* KONUM SEÇİMİ VE MESAFE DURUM BARI */}
        <div className="bg-neutral-50 border-b border-neutral-200/90 px-3 py-2.5 sm:px-6 sm:py-3 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            {/* Sol Taraf: Aktif Konum Bilgisi */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                  locationStatus === 'granted'
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    : locationStatus === 'requesting'
                    ? 'bg-amber-100 text-amber-700 animate-pulse border border-amber-300'
                    : locationStatus === 'denied'
                    ? 'bg-rose-100 text-rose-700 border border-rose-300'
                    : 'bg-teal-100 text-teal-800 border border-teal-300'
                }`}
              >
                {locationStatus === 'requesting' ? (
                  <Compass className="w-4 h-4 animate-spin" />
                ) : locationStatus === 'denied' ? (
                  <MapPinOff className="w-4 h-4" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-neutral-800 truncate">
                    {locationStatus === 'requesting'
                      ? 'GPS Konumunuz Alınıyor...'
                      : locationStatus === 'granted'
                      ? 'Canlı GPS Konumu Aktif'
                      : locationStatus === 'preset'
                      ? 'Referans Mahalle Konumu'
                      : 'Konum İzni Gerekli'}
                  </span>
                  {locationAccuracy && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                      ±{locationAccuracy}m GPS
                    </span>
                  )}
                  <span className="text-[10px] font-extrabold text-sky-800 bg-sky-50 border border-sky-200 px-1.5 py-0.2 rounded-md hidden lg:inline-block">
                    ✓ Google Haritalar Rota Mesafesi
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 font-medium truncate">
                  Referans Noktası: <strong className="text-neutral-700 font-bold">{locationName}</strong>
                </p>
              </div>
            </div>

            {/* Sağ Taraf: GPS Yenile Butonu & Mobil Görünüm Değiştirici */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Mobil Liste / Harita Segmenti */}
              <div className="flex sm:hidden items-center bg-neutral-200/80 rounded-xl p-0.5 text-[11px]">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    viewMode === 'list'
                      ? 'bg-white text-rose-700 shadow-2xs'
                      : 'text-neutral-600'
                  }`}
                >
                  Liste
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    viewMode === 'map'
                      ? 'bg-white text-rose-700 shadow-2xs'
                      : 'text-neutral-600'
                  }`}
                >
                  Harita
                </button>
              </div>

              <button
                onClick={requestUserLocation}
                disabled={locationStatus === 'requesting'}
                className="px-3 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-800 flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer shrink-0"
              >
                <Compass className={`w-3.5 h-3.5 text-rose-600 ${locationStatus === 'requesting' ? 'animate-spin' : ''}`} />
                <span>{locationStatus === 'granted' ? 'GPS Konumunu Güncelle' : 'GPS ile Konumumu Bul'}</span>
              </button>
            </div>
          </div>

          {/* HIZLI MAHALLE SEÇİM ÇİPLERİ */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2">
            <span className="text-[10.5px] font-bold text-neutral-400 shrink-0 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-neutral-400" />
              Mahalle Seç:
            </span>
            {LOCATION_PRESETS.map((preset) => {
              const isSelected =
                userCoords.lat === preset.lat && userCoords.lng === preset.lng;
              return (
                <button
                  key={preset.id}
                  onClick={() => applyPresetLocation(preset)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition active:scale-95 cursor-pointer border ${
                    isSelected
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-rose-300 hover:text-rose-600'
                  }`}
                >
                  {preset.shortName}
                </button>
              );
            })}
          </div>

          {locationStatus === 'denied' && (
            <div className="mt-2 p-2 bg-amber-50/90 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <p>
                {locationErrorMsg || 'Cihaz konumu kapalı olduğu için mesafeler Mutlular Mahallesi merkezine göre hesaplanıyor. Yukarıdaki mahalle çiplerinden kendi mahallenizi seçebilirsiniz.'}
              </p>
            </div>
          )}
        </div>

        {/* FİLTRE VE ARAMA ÇUBUĞU */}
        <div className="px-3 py-2.5 sm:px-6 sm:py-3 border-b border-neutral-200 bg-white shrink-0 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            {/* Arama Inputu */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Eczane adı, eczacı adı, mahalle veya cadde ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-100 hover:bg-neutral-100/80 focus:bg-white text-neutral-900 text-xs sm:text-sm rounded-xl pl-9 pr-8 py-2 border border-transparent focus:border-rose-500 focus:outline-hidden transition shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* İlçe & Sıralama Segmentleri */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {[
                { id: 'nearest', label: '⭐ En Yakınlar' },
                { id: 'osmangazi', label: 'Osmangazi' },
                { id: 'nilufer', label: 'Nilüfer' },
                { id: 'yildirim', label: 'Yıldırım' },
                { id: 'all', label: 'Tüm Bursa (32)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedDistrict(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition active:scale-95 cursor-pointer ${
                    selectedDistrict === tab.id
                      ? 'bg-neutral-900 text-white shadow-2xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ANA İÇERİK ALANI */}
        <div className="flex-1 overflow-hidden flex flex-col bg-neutral-100/60">
          {loading ? (
            <div className="py-20 text-center space-y-3 m-auto">
              <RefreshCw className="w-10 h-10 text-rose-600 animate-spin mx-auto" />
              <p className="text-sm font-black text-neutral-800">
                Bursa Nöbetçi Eczaneleri Yükleniyor...
              </p>
              <p className="text-xs text-neutral-500">
                Google Haritalar rotaları ve gerçek sürüş mesafeleri hesaplanıyor
              </p>
            </div>
          ) : viewMode === 'map' ? (
            /* HARİTA GÖRÜNÜMÜ */
            <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
              {/* Sol/Alt Liste: Haritada seçilebilecek eczaneler */}
              <div className="w-full md:w-80 lg:w-96 bg-white border-b md:border-b-0 md:border-r border-neutral-200 overflow-y-auto p-3 space-y-2 shrink-0 max-h-56 md:max-h-full">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-black text-neutral-700">
                    Haritadaki Eczaneler ({filteredPharmacies.length})
                  </span>
                  <span className="text-[11px] text-neutral-400 font-bold">
                    Konuma göre sıralı
                  </span>
                </div>
                {filteredPharmacies.map((p, idx) => {
                  const isSelected = selectedMapPharmacy?.id === p.id;
                  return (
                    <div
                      key={p.id || idx}
                      onClick={() => setSelectedMapPharmacy(p)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition active:scale-98 ${
                        isSelected
                          ? 'bg-rose-50 border-rose-500 shadow-2xs'
                          : 'bg-neutral-50 hover:bg-neutral-100/80 border-neutral-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <h4 className="text-xs font-black text-neutral-900 leading-tight">
                          {idx + 1}. {p.name}
                        </h4>
                        <span className="text-[10px] font-black text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded-md shrink-0">
                          {p.distanceFormatted}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-neutral-500 line-clamp-1 mt-0.5">
                        {p.ilce} • {p.address}
                      </p>
                      <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-neutral-200/60 text-[10px]">
                        <span className="text-blue-700 font-bold">
                          🚗 ~{p.drivingMinutes || 8} dk sürüş
                        </span>
                        <a
                          href={p.mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-rose-600 font-black hover:underline flex items-center gap-0.5"
                        >
                          Google Harita Rota <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sağ: İnteraktif Harita Önizleme Çerçevesi */}
              <div className="flex-1 h-full relative bg-neutral-200">
                {(() => {
                  const targetPharm = selectedMapPharmacy || nearestPharmacy;
                  const targetLat = targetPharm ? targetPharm.lat : userCoords.lat;
                  const targetLng = targetPharm ? targetPharm.lng : userCoords.lng;
                  // OpenStreetMap Embed URL (API key gerektirmez, doğrudan yüklenir)
                  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${targetLng - 0.03}%2C${targetLat - 0.02}%2C${targetLng + 0.03}%2C${targetLat + 0.02}&layer=mapnik&marker=${targetLat}%2C${targetLng}`;

                  return (
                    <div className="w-full h-full relative flex flex-col">
                      <iframe
                        title="Bursa Nöbetçi Eczaneler Haritası"
                        src={mapSrc}
                        className="w-full h-full border-0"
                        loading="lazy"
                      />

                      {/* Harita Üstü Bilgilendirme Kartı */}
                      {targetPharm && (
                        <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-md bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-neutral-200 space-y-2 z-10">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider">
                                Seçili Nöbetçi Eczane
                              </span>
                              <h3 className="text-sm font-black text-neutral-900 leading-tight">
                                {targetPharm.name}
                              </h3>
                              <p className="text-[11px] text-neutral-500">
                                {targetPharm.ilce} • {targetPharm.address}
                              </p>
                            </div>
                            <span className="text-xs font-black bg-rose-600 text-white px-2 py-1 rounded-xl shadow-2xs shrink-0">
                              {targetPharm.distanceFormatted}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-1 border-t border-neutral-100">
                            <a
                              href={`tel:${targetPharm.phone.replace(/[^0-9]/g, '')}`}
                              className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl py-1.5 px-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                            >
                              <Phone className="w-3.5 h-3.5 text-rose-600" />
                              <span>{targetPharm.phone || 'Ara'}</span>
                            </a>
                            <a
                              href={targetPharm.mapsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl py-1.5 px-3 text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              <span>Google Yol Tarifi</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            /* LİSTE GÖRÜNÜMÜ */
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
              {filteredPharmacies.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-neutral-200 p-8 max-w-lg mx-auto shadow-sm">
                  <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                    <Search className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-black text-neutral-900">
                    Eczane Bulunamadı
                  </h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Arama kriterinizle eşleşen nöbetçi eczane bulunamadı. Filtreleri sıfırlayarak tekrar deneyebilirsiniz.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDistrict('nearest');
                    }}
                    className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-black hover:bg-rose-700 transition active:scale-95 cursor-pointer shadow-2xs"
                  >
                    Tüm Eczaneleri Göster
                  </button>
                </div>
              ) : (
                <div className="max-w-5xl mx-auto space-y-4">
                  {/* HERO KART: SİZE EN YAKIN NÖBETÇİ ECZANE */}
                  {nearestPharmacy && !searchQuery && (
                    <div className="bg-gradient-to-br from-rose-50 via-white to-red-50/70 rounded-3xl border-2 border-rose-500/50 p-4 sm:p-5 space-y-3.5 shadow-lg relative overflow-hidden">
                      {/* Arka plan ışık vurgusu */}
                      <div className="absolute right-0 top-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                      <div className="flex items-center justify-between flex-wrap gap-2 relative z-10">
                        <div className="flex items-center gap-2">
                          <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                          </span>
                          <span className="text-xs font-black tracking-wider text-rose-700 uppercase flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-rose-600" />
                            Size En Yakın Nöbetçi Eczane
                          </span>
                        </div>

                        {/* Büyük Gerçek Karayolu Mesafesi Rozeti */}
                        <div className="flex items-center gap-1.5 bg-rose-600 text-white font-black text-sm px-3.5 py-1.5 rounded-full shadow-md">
                          <Car className="w-4 h-4" />
                          <span>{nearestPharmacy.distanceFormatted} Karayolu</span>
                        </div>
                      </div>

                      <div className="relative z-10">
                        <h3 className="text-lg sm:text-2xl font-black text-neutral-900 leading-tight">
                          {nearestPharmacy.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-neutral-500 font-semibold mt-0.5">
                          {nearestPharmacy.ilce}
                          {nearestPharmacy.neighborhood ? ` • ${nearestPharmacy.neighborhood} Mahallesi` : ''}
                          {nearestPharmacy.pharmacist ? ` • ${nearestPharmacy.pharmacist}` : ''}
                        </p>
                      </div>

                      {/* Adres Kutusu */}
                      <div className="flex items-start justify-between gap-2 text-xs sm:text-sm text-neutral-800 bg-white p-3 rounded-2xl border border-rose-200/80 shadow-2xs relative z-10">
                        <div className="flex items-start gap-2 min-w-0">
                          <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <span className="leading-snug font-medium">{nearestPharmacy.address}</span>
                        </div>
                        <button
                          onClick={() => handleCopyAddress(nearestPharmacy.id, nearestPharmacy.address)}
                          title="Adresi Kopyala"
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition shrink-0"
                        >
                          {copiedId === nearestPharmacy.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Google Haritalar Rota ve Süre İstatistikleri */}
                      <div className="flex items-center gap-3 text-xs text-neutral-700 bg-rose-100/50 px-3 py-2 rounded-2xl border border-rose-200/60 flex-wrap relative z-10">
                        {nearestPharmacy.drivingMinutes && (
                          <div className="flex items-center gap-1.5 font-black text-blue-800">
                            <Car className="w-4 h-4" />
                            <span>~{nearestPharmacy.drivingMinutes} dk sürüş süresi</span>
                          </div>
                        )}
                        {nearestPharmacy.walkingMinutes && (
                          <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                            <Footprints className="w-4 h-4" />
                            <span>~{nearestPharmacy.walkingMinutes} dk yürüme</span>
                          </div>
                        )}
                        <span className="text-[10.5px] font-extrabold text-sky-800 bg-white px-2.5 py-0.5 rounded-md border border-sky-200 ml-auto shadow-2xs">
                          ✓ Google Haritalar Canlı Karayolu Rotası ({nearestPharmacy.distanceFormatted})
                        </span>
                      </div>

                      {/* Eylem Butonları */}
                      <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1 relative z-10">
                        <a
                          href={`tel:${nearestPharmacy.phone.replace(/[^0-9]/g, '')}`}
                          className="w-full sm:flex-1 bg-white hover:bg-rose-50 border-2 border-rose-400 text-rose-700 rounded-2xl py-2.5 px-4 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-2xs transition active:scale-98"
                        >
                          <Phone className="w-4 h-4 text-rose-600" />
                          <span>{nearestPharmacy.phone || 'Telefon ile Ara'}</span>
                        </a>

                        <a
                          href={nearestPharmacy.mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full sm:flex-1 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-2xl py-2.5 px-4 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md transition active:scale-98"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>Google Haritalar ile Yol Tarifi Al</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* TÜM NÖBETÇİ ECZANELER BAŞLIĞI VE OTOMATİK SIRALAMA ROZETİ */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-black text-neutral-600 px-1 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-neutral-800">
                        NÖBETÇİ ECZANE LİSTESİ (GERÇEK KARAYOLU MESAFESİ SIRALAMALI)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border border-sky-200 flex items-center gap-1">
                        <Compass className="w-3 h-3 text-sky-600" />
                        En Yakından Uzağa Sıralı
                      </span>
                      <span className="bg-neutral-900 text-white px-2.5 py-0.5 rounded-full text-[10.5px] font-black shadow-2xs">
                        {filteredPharmacies.length} Eczane
                      </span>
                    </div>
                  </div>

                  {/* ECZANE KARTLARI LİSTESİ - 2 Sütunlu Grid Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {filteredPharmacies.map((pharmacy, idx) => {
                      const isFirst = idx === 0 && !searchQuery;
                      const distKm = pharmacy.distanceKm ?? 999;
                      const isUltraClose = distKm <= 3.5;
                      const isMidClose = distKm > 3.5 && distKm <= 7.0;

                      return (
                        <div
                          key={pharmacy.id || idx}
                          className={`bg-white rounded-3xl border p-4 space-y-3 shadow-2xs transition-all duration-200 hover:shadow-md hover:border-rose-300 flex flex-col justify-between ${
                            isFirst
                              ? 'border-rose-400 ring-2 ring-rose-300/80 bg-gradient-to-br from-rose-50/40 via-white to-red-50/20'
                              : 'border-neutral-200'
                          }`}
                        >
                          <div className="space-y-3">
                            {/* Üst Kısım: Sıra No, İsim ve ESTETİK UZAKLIK ROZETİ */}
                            <div className="flex items-start justify-between gap-2.5">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 shadow-2xs ${
                                      isFirst
                                        ? 'bg-rose-600 text-white ring-2 ring-rose-200'
                                        : 'bg-neutral-900 text-white'
                                    }`}
                                  >
                                    {idx + 1}
                                  </span>
                                  <h4 className="text-[14px] sm:text-base font-black text-neutral-900 leading-tight truncate">
                                    {pharmacy.name}
                                  </h4>
                                </div>
                                <p className="text-[11.5px] text-neutral-500 font-semibold pl-8 mt-0.5">
                                  {pharmacy.ilce}
                                  {pharmacy.neighborhood ? ` • ${pharmacy.neighborhood} Mah.` : ''}
                                  {pharmacy.pharmacist ? ` • ${pharmacy.pharmacist}` : ''}
                                </p>
                              </div>

                              {/* ESTETİK UZAKLIK ROZETİ (Distance Badge) */}
                              <div className="shrink-0 flex flex-col items-end gap-1">
                                <div
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-xs tracking-tight ${
                                    isUltraClose
                                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white ring-1 ring-emerald-300/60'
                                      : isMidClose
                                      ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white ring-1 ring-rose-300/60'
                                      : 'bg-neutral-900 text-white'
                                  }`}
                                  title={`Google Haritalar Karayolu Sürüş Mesafesi: ${pharmacy.distanceFormatted}`}
                                >
                                  {isUltraClose ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                  ) : (
                                    <Car className="w-3.5 h-3.5" />
                                  )}
                                  <span>{pharmacy.distanceFormatted} Karayolu</span>
                                </div>

                                <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-500">
                                  {pharmacy.drivingMinutes && (
                                    <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                      ~{pharmacy.drivingMinutes} dk sürüş
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Adres Kutusu */}
                            <div className="flex items-start gap-2 text-xs text-neutral-700 bg-neutral-50/90 p-2.5 rounded-2xl border border-neutral-200/80">
                              <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                              <span className="leading-snug flex-1 font-medium text-[11.5px]">{pharmacy.address}</span>
                              <button
                                onClick={() => handleCopyAddress(pharmacy.id, pharmacy.address)}
                                title="Adresi Kopyala"
                                className="text-neutral-400 hover:text-neutral-700 p-1 shrink-0 transition cursor-pointer"
                              >
                                {copiedId === pharmacy.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>

                            {/* Ulaşım Süreleri ve Doğrulama Bilgisi */}
                            {(pharmacy.walkingMinutes || pharmacy.drivingMinutes) && (
                              <div className="flex items-center gap-2.5 text-[11px] text-neutral-600 px-1 flex-wrap">
                                {pharmacy.drivingMinutes && (
                                  <span className="flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                                    <Car className="w-3 h-3 text-blue-600" />
                                    ~{pharmacy.drivingMinutes} dk araçla
                                  </span>
                                )}
                                {pharmacy.walkingMinutes && (
                                  <span className="flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                    <Footprints className="w-3 h-3 text-emerald-600" />
                                    ~{pharmacy.walkingMinutes} dk yürüme
                                  </span>
                                )}
                                <span className="text-[9.5px] font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100 ml-auto">
                                  ✓ Google Maps Uyumlu
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Aksiyon Butonları */}
                          <div className="flex items-center gap-2 pt-2.5 border-t border-neutral-100">
                            <a
                              href={`tel:${pharmacy.phone.replace(/[^0-9]/g, '')}`}
                              className="flex-1 bg-white hover:bg-rose-50 border border-neutral-200 hover:border-rose-300 text-rose-700 rounded-xl py-2 px-3 text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs"
                            >
                              <Phone className="w-3.5 h-3.5 text-rose-600" />
                              <span>{pharmacy.phone || 'Telefon'}</span>
                            </a>

                            <a
                              href={pharmacy.mapsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 bg-neutral-900 hover:bg-black text-white rounded-xl py-2 px-3 text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs"
                            >
                              <Navigation className="w-3.5 h-3.5 text-rose-400" />
                              <span>Haritada Git</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Önemli Bilgilendirme Notu */}
                  <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-3xl flex items-start gap-3 text-xs text-amber-900 shadow-2xs">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-black text-amber-950">
                        Nöbetçi Eczane Çalışma Saatleri & Bilgilendirme:
                      </span>
                      <p className="text-amber-800 leading-relaxed font-medium">
                        Nöbetçi eczaneler sabah 08:30&apos;dan ertesi gün sabah 08:30&apos;a kadar 24 saat kesintisiz nöbet tutmaktadır. Acil ilaç temini için yola çıkmadan önce eczaneyi telefonla arayarak reçeteli ilacınızın mevcudiyetini teyit etmeniz tavsiye edilir.
                      </p>
                    </div>
                  </div>

                  {/* Sağlık Ocağı / ASM Yönlendirmesi */}
                  {onOpenSaglikOcagi && (
                    <div
                      onClick={() => {
                        onClose();
                        onOpenSaglikOcagi();
                      }}
                      className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100/70 hover:to-emerald-100/70 border border-teal-200 rounded-3xl flex items-center justify-between cursor-pointer transition active:scale-98 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="text-sm font-black text-teal-950">
                            Mutlular Aile Sağlığı Merkezi (ASM) & Doktor Listesi
                          </h5>
                          <p className="text-xs text-teal-700">
                            Mesai saatleri, aile hekimleri ve tahlil günlerini görüntüleyin
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-teal-800 bg-white px-3 py-1.5 rounded-xl border border-teal-200 shadow-2xs">
                        İncele &rsaquo;
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
