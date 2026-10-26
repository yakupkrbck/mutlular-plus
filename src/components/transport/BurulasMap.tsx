import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  LocateFixed,
  Maximize2,
  ExternalLink,
  Layers,
  Search,
  Bus,
  MapPin,
  RefreshCw,
  Compass,
} from 'lucide-react';
import { BusLine } from '../../data/busData';
import { BurulasLiveBus, BurulasStop, calculateDistanceMeters } from '../../services/liveApis';

interface ApproachingInfo {
  hasBus: boolean;
  bus: BurulasLiveBus | null;
  closestStopIndex: number;
  targetIndex?: number;
  approachingStop: BurulasStop | null;
  nextStop: BurulasStop | null;
  distanceMeters: number;
  etaMinutes: number;
  isAtStop?: boolean;
}

interface BurulasMapProps {
  selectedLine: BusLine;
  stops: BurulasStop[];
  liveBuses: BurulasLiveBus[];
  approachingInfo: ApproachingInfo | null;
  className?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

type TileSource = 'osm' | 'satellite';

export const BurulasMap: React.FC<BurulasMapProps> = ({
  selectedLine,
  stops,
  liveBuses,
  approachingInfo,
  className = 'h-[520px]',
  onRefresh,
  isLoading = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const markerLookupRef = useRef<Map<number | string, L.Marker>>(new Map());

  const [tileSource, setTileSource] = useState<TileSource>('osm');
  const [mapReady, setMapReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [focusedBusPlate, setFocusedBusPlate] = useState<string | null>(null);

  // Haritayı başlat
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Eğer eski bir Leaflet ID varsa temizle
    if ((container as any)._leaflet_id) {
      try {
        delete (container as any)._leaflet_id;
      } catch {
        // ignore
      }
    }

    // Harita örneği oluştur
    const bursaCenter: [number, number] = [40.22, 29.05];
    const map = L.map(container, {
      center: bursaCenter,
      zoom: 13,
      zoomControl: false, // Özel konumda zoom kontrolü ekleyeceğiz
      attributionControl: true,
    });

    // Zoom kontrolünü sağ üste yerleştir
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Katman grubu oluştur
    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Boyut güncelleme mekanizması
    const invalidate = () => {
      try {
        map.invalidateSize();
      } catch {
        // ignore
      }
    };

    // İlk açılışta boyut hesaplama gecikmelerini önle
    const t1 = setTimeout(invalidate, 100);
    const t2 = setTimeout(invalidate, 300);
    const t3 = setTimeout(invalidate, 700);

    // ResizeObserver ile kapsayıcı boyutu değiştiğinde haritayı uyar
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        invalidate();
      });
      observer.observe(container);
    }

    setMapReady(true);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (observer) {
        observer.disconnect();
      }
      try {
        map.remove();
      } catch (err) {
        console.warn('Map removal error:', err);
      }
      mapInstanceRef.current = null;
      markersGroupRef.current = null;
      tileLayerRef.current = null;
      polylineRef.current = null;
    };
  }, []);

  // Harita altlığı (Tile Layer) güncelleme
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; OpenStreetMap contributors';
    let subdomains: string[] = ['a', 'b', 'c'];
    let maxZoom = 19;

    if (tileSource === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri World Imagery';
      subdomains = ['a', 'b', 'c'];
      maxZoom = 18;
    }

    const newLayer = L.tileLayer(url, {
      attribution,
      subdomains: Array.isArray(subdomains) && subdomains.length > 0 ? subdomains : ['a', 'b', 'c'],
      maxZoom,
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [tileSource, mapReady]);

  // Duraklar, Çizgi ve Otobüsleri Çiz
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup || !mapReady) return;

    // Temizle
    markersGroup.clearLayers();
    markerLookupRef.current.clear();

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const stopCoords: [number, number][] = [];

    // 1. Durakları Ekle
    stops.forEach((stop, index) => {
      const lat = parseFloat(stop.latitude);
      const lon = parseFloat(stop.longitude);
      if (isNaN(lat) || isNaN(lon)) return;

      stopCoords.push([lat, lon]);

      const isTarget = approachingInfo?.approachingStop?.stopId === stop.stopId;
      const isNext = approachingInfo?.nextStop?.stopId === stop.stopId;

      const badgeColor = isTarget
        ? '#10b981' // yeşil
        : isNext
        ? '#3b82f6' // mavi
        : '#1e293b'; // koyu gri

      const borderColor = isTarget ? '#6ee7b7' : isNext ? '#93c5fd' : '#cbd5e1';
      const size = isTarget ? 28 : 20;

      const stopHtml = `
        <div style="display:flex; align-items:center; justify-content:center; transform: translate(-50%, -50%); cursor:pointer;">
          <div style="
            width: ${size}px;
            height: ${size}px;
            background: ${badgeColor};
            color: #ffffff;
            border-radius: 9999px;
            border: 2px solid ${borderColor};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isTarget ? '11px' : '9px'};
            font-weight: 800;
            box-shadow: ${
              isTarget
                ? '0 0 16px rgba(16,185,129,0.9), 0 3px 6px rgba(0,0,0,0.4)'
                : '0 2px 5px rgba(0,0,0,0.3)'
            };
            transition: transform 0.2s;
          ">
            ${index + 1}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-stop-divicon',
        html: stopHtml,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([lat, lon], { icon }).addTo(markersGroup);
      markerLookupRef.current.set(stop.stopId, marker);

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 11px; color: #0f172a; min-width: 160px;">
          <div style="font-weight: 800; color: #2563eb; font-size: 9.5px; margin-bottom: 2px;">
            DURAK #${index + 1}
          </div>
          <div style="font-weight: 700; font-size: 10px; color: #0f172a; line-height: 1.2;">
            ${stop.stopName}
          </div>
          <div style="font-size: 9px; color: #64748b; margin-top: 3px;">
            Durak Kodu: <strong>${stop.stopId}</strong>
          </div>
          ${
            isTarget
              ? `<div style="margin-top: 5px; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 4px 6px; border-radius: 6px;">
                  <div style="color: #065f46; font-weight: 800; font-size: 9.5px;">🎯 Yaklaşılan Durak</div>
                  <div style="font-size: 9px; color: #047857; margin-top: 1px;">Mesafe: ~${approachingInfo?.distanceMeters} m (${approachingInfo?.etaMinutes} dk)</div>
                 </div>`
              : ''
          }
        </div>
      `);
    });

    // 2. Güzergah Çizgisi (Polyline)
    if (stopCoords.length > 1) {
      const polyline = L.polyline(stopCoords, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.85,
        lineJoin: 'round',
        lineCap: 'round',
      }).addTo(map);
      polylineRef.current = polyline;
    }

    // 3. Otobüs İşaretçileri
    const busesToPlot =
      liveBuses.length > 0
        ? liveBuses
        : approachingInfo?.bus
        ? [approachingInfo.bus]
        : [];

    busesToPlot.forEach((bus) => {
      const busHtml = `
        <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%); cursor:pointer;">
          <div style="
            background: linear-gradient(135deg, #1d4ed8, #2563eb);
            color: #ffffff;
            border-radius: 9999px;
            padding: 8px;
            box-shadow: 0 0 22px rgba(37,99,235,0.9), 0 4px 10px rgba(0,0,0,0.5);
            border: 2.5px solid #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse 2s infinite;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 6v6"></path><path d="M15 6v6"></path><path d="M2 12h19.6"></path><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.6-.5-1-1-1H3c-.6 0-1 .4-1 1 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"></path><path d="M4 18v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2"></path><path d="M17 18v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2"></path><path d="M4 11V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5"></path>
            </svg>
          </div>
          <div style="
            background: #090d16;
            color: #ffffff;
            font-size: 10px;
            font-weight: 800;
            padding: 3px 8px;
            border-radius: 8px;
            margin-top: 3px;
            white-space: nowrap;
            border: 1px solid #3b82f6;
            box-shadow: 0 4px 10px rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            <span>${bus.plaka}</span>
            <span style="color:#60a5fa;">• ${bus.hiz} km/s</span>
          </div>
        </div>
      `;

      const busIcon = L.divIcon({
        className: 'custom-bus-live-divicon',
        html: busHtml,
        iconSize: [50, 56],
        iconAnchor: [25, 28],
      });

      const marker = L.marker([bus.enlem, bus.boylam], {
        icon: busIcon,
        zIndexOffset: 2000,
      }).addTo(markersGroup);

      // Her otobüsün yaklaştığı durağı ve mesafesini bağımsız hesapla
      let busClosestStop: BurulasStop | null = null;
      let busMinDist = Infinity;
      stops.forEach((s) => {
        const slat = parseFloat(s.latitude);
        const slon = parseFloat(s.longitude);
        if (!isNaN(slat) && !isNaN(slon)) {
          const d = calculateDistanceMeters(bus.enlem, bus.boylam, slat, slon);
          if (d < busMinDist) {
            busMinDist = d;
            busClosestStop = s;
          }
        }
      });
      const busEta = Math.max(1, Math.round(busMinDist / 350));
      const targetStop = busClosestStop;
      const approachingStopHtml = targetStop
        ? `<div style="margin-top: 8px; padding: 6px 8px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
            <div style="font-size: 9px; color: #1d4ed8; font-weight: 800; text-transform: uppercase;">Yaklaşılan Durak</div>
            <div style="font-weight: 800; font-size: 10.5px; color: #0f172a; margin-top: 1px;">${(targetStop as BurulasStop).stopName}</div>
            <div style="font-size: 9.5px; color: #15803d; font-weight: 800; margin-top: 2px;">~${busMinDist} metre (${busEta} dk)</div>
           </div>`
        : '';

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #0f172a; min-width: 190px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 4px;">
            <div style="font-weight: 800; font-size: 13.5px; color: #1e40af;">🚌 ${bus.plaka}</div>
            <span style="background: #dbeafe; color: #1d4ed8; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">CANLI</span>
          </div>
          <div style="font-size: 11px; color: #475569;">Hat: <strong>${selectedLine.code} (${selectedLine.name})</strong></div>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">Anlık Hız: <strong>${bus.hiz} km/s</strong></div>
          ${bus.surucu ? `<div style="font-size: 11px; color: #475569; margin-top: 1px;">Kaptan: ${bus.surucu}</div>` : ''}
          ${approachingStopHtml}
        </div>
      `);
    });

    // Otomatik odaklanma: Eğer otobüs varsa otobüse, yoksa güzergaha
    setTimeout(() => {
      try {
        map.invalidateSize();
        if (busesToPlot.length > 0) {
          map.setView([busesToPlot[0].enlem, busesToPlot[0].boylam], 14, { animate: false });
        } else if (stopCoords.length > 0) {
          map.fitBounds(L.latLngBounds(stopCoords), { padding: [35, 35], maxZoom: 16 });
        }
      } catch {
        // ignore
      }
    }, 150);
  }, [stops, liveBuses, approachingInfo, selectedLine.code, mapReady]);

  // Odaklanma Fonksiyonları
  const handleFocusOnBus = useCallback(
    (targetBus?: BurulasLiveBus) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      const bus =
        targetBus ||
        (focusedBusPlate ? liveBuses.find((b) => b.plaka === focusedBusPlate) : null) ||
        liveBuses[0] ||
        approachingInfo?.bus;

      if (bus) {
        setFocusedBusPlate(bus.plaka);
        map.setView([bus.enlem, bus.boylam], 15, { animate: true });
      }
    },
    [liveBuses, approachingInfo, focusedBusPlate]
  );

  const handleFocusOnApproachingStop = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || !approachingInfo?.approachingStop) return;

    const lat = parseFloat(approachingInfo.approachingStop.latitude);
    const lon = parseFloat(approachingInfo.approachingStop.longitude);
    if (!isNaN(lat) && !isNaN(lon)) {
      map.setView([lat, lon], 16, { animate: true });
      const marker = markerLookupRef.current.get(approachingInfo.approachingStop.stopId);
      if (marker) marker.openPopup();
    }
  }, [approachingInfo]);

  const handleFitEntireRoute = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || stops.length === 0) return;

    const coords: [number, number][] = stops
      .map((s) => [parseFloat(s.latitude), parseFloat(s.longitude)] as [number, number])
      .filter(([lat, lon]) => !isNaN(lat) && !isNaN(lon));

    if (coords.length > 0) {
      map.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 16 });
    }
  }, [stops]);

  // Durak Arama ve Haritada Atlama
  const handleSelectSearchStop = (stop: BurulasStop) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const lat = parseFloat(stop.latitude);
    const lon = parseFloat(stop.longitude);
    if (!isNaN(lat) && !isNaN(lon)) {
      map.setView([lat, lon], 16, { animate: true });
      const marker = markerLookupRef.current.get(stop.stopId);
      if (marker) marker.openPopup();
    }
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const filteredSearchStops = searchQuery.trim()
    ? stops.filter((s) =>
        s.stopName.toLocaleLowerCase('tr-TR').includes(searchQuery.toLocaleLowerCase('tr-TR'))
      )
    : [];

  // Google Haritalar Aç
  const handleOpenGoogleMaps = () => {
    const bus = liveBuses[0] || approachingInfo?.bus;
    if (bus) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${bus.enlem},${bus.boylam}`,
        '_blank',
        'noopener,noreferrer'
      );
    } else if (stops.length > 0) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${stops[0].latitude},${stops[0].longitude}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  const hasActiveBus = liveBuses.length > 0 || approachingInfo?.hasBus;

  return (
    <div className={`relative flex flex-col w-full rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl ${className}`}>
      {/* Harita Üst Kontrol Çubuğu */}
      <div className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-2.5 z-20 shrink-0">
        
        {/* Sol Taraf: Hat Rozeti & Canlı Durum */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-blue-600/30">
            {selectedLine.code}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white">Canlı Hat Güzergahı</span>
              {hasActiveBus ? (
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Otobüs Çevrimiçi
                </span>
              ) : (
                <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {stops.length} Durak
                </span>
              )}
            </div>
            <p className="text-[10.5px] text-slate-400 hidden sm:block">
              {selectedLine.departure} ➔ {selectedLine.destination}
            </p>
          </div>
        </div>

        {/* Orta/Sağ: Hızlı Aksiyon Butonları */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          
          {/* Durak Ara Butonu */}
          <div className="relative">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                isSearchOpen
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Durak Ara"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Durak Bul</span>
            </button>

            {/* Arama Açılır Menüsü */}
            {isSearchOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Durak adı yazın..."
                    autoFocus
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                  {filteredSearchStops.length > 0 ? (
                    filteredSearchStops.map((st, i) => (
                      <button
                        key={st.stopId + '-' + i}
                        onClick={() => handleSelectSearchStop(st)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-600/20 hover:text-blue-300 text-slate-300 text-xs flex items-center justify-between gap-2 transition"
                      >
                        <span className="truncate">{st.stopName}</span>
                        <span className="text-[10px] text-slate-500 shrink-0">#{st.sequence || i + 1}</span>
                      </button>
                    ))
                  ) : searchQuery.trim() ? (
                    <div className="text-center py-3 text-slate-500 text-xs">Durak bulunamadı</div>
                  ) : (
                    <div className="text-center py-3 text-slate-500 text-xs">Aramak için durak adı yazın</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Otobüslere Odaklanma Butonları (Aynı hatta 1'den fazla araç) */}
          {liveBuses.length > 1 ? (
            <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-xl border border-slate-700/80">
              <span className="text-[9px] font-bold text-slate-400 px-1 hidden sm:inline">Araçlar:</span>
              {liveBuses.map((bus) => {
                const isFocused = focusedBusPlate === bus.plaka;
                return (
                  <button
                    key={bus.plaka}
                    onClick={() => handleFocusOnBus(bus)}
                    className={`px-2 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition active:scale-95 ${
                      isFocused
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                    title={`${bus.plaka} - ${bus.surucu || 'Kaptan'} (${bus.hiz} km/s)`}
                  >
                    <Bus className="w-3 h-3 text-emerald-400" />
                    <span>{bus.plaka}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <button
              onClick={() => handleFocusOnBus()}
              disabled={!hasActiveBus}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-xs"
              title="Haritayı otobüsün anlık konumuna ortala"
            >
              <LocateFixed className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Otobüse Git</span>
            </button>
          )}

          {/* Sıradaki Durağa Odaklan */}
          {approachingInfo?.approachingStop && (
            <button
              onClick={handleFocusOnApproachingStop}
              className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs"
              title="Sıradaki durağa odaklan"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sıradaki Durak</span>
            </button>
          )}

          {/* Tüm Güzergahı Sığdır */}
          <button
            onClick={handleFitEntireRoute}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition active:scale-95"
            title="Tüm hattı ekrana sığdır"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tüm Hat</span>
          </button>

          {/* Altlık / Stil Değiştirici (Sadece OSM ve Uydu) */}
          <div className="flex bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-[10px] font-bold">
            <button
              onClick={() => setTileSource('osm')}
              className={`px-2.5 py-1 rounded-lg transition ${
                tileSource === 'osm'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="OpenStreetMap Klasik"
            >
              OSM
            </button>
            <button
              onClick={() => setTileSource('satellite')}
              className={`px-2.5 py-1 rounded-lg transition ${
                tileSource === 'satellite'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Uydu Fotoğrafı Görünümü"
            >
              Uydu
            </button>
          </div>

          {/* Yenile */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition disabled:opacity-50"
              title="Harita verilerini yenile"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* Google Haritalar Dış Link */}
          <button
            onClick={handleOpenGoogleMaps}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition"
            title="Google Haritalar'da Canlı Konumu Aç"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Harita Gövdesi (Leaflet Canvas Container) */}
      <div className="relative flex-1 w-full min-h-[380px] bg-slate-950">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

        {/* Harita İçi Alt Açıklama Bilgisi */}
        <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-2.5 sm:p-3 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                {selectedLine.code}
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{selectedLine.departure}</span>
                  <span className="text-slate-500">➔</span>
                  <span>{selectedLine.destination}</span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                    Güzergah
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    Hedef Durak
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                    Duraklar ({stops.length})
                  </span>
                </div>
              </div>
            </div>

            {liveBuses.length > 0 ? (
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {liveBuses.map((bus, idx) => (
                  <div
                    key={bus.plaka}
                    onClick={() => handleFocusOnBus(bus)}
                    className="text-right bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-600 transition"
                  >
                    <div className="text-[9px] font-bold text-slate-300 flex items-center justify-end gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{bus.plaka}</span>
                      <span className="text-emerald-400 font-semibold">• {bus.hiz} km/s</span>
                    </div>
                    <div className="text-[9.5px] font-bold text-slate-400 truncate max-w-[130px]">
                      {bus.istikamet || `Araç #${idx + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            ) : approachingInfo?.approachingStop ? (
              <div className="text-right">
                <div className="text-[9px] font-bold text-slate-400 uppercase">Sıradaki Durak</div>
                <div className="text-[10.5px] font-bold text-emerald-400 truncate max-w-[200px]">
                  {approachingInfo.approachingStop.stopName}
                </div>
                <div className="text-[9.5px] text-emerald-300/80 font-bold">
                  ~{approachingInfo.distanceMeters} m ({approachingInfo.etaMinutes} dk)
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
