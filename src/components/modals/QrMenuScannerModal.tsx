import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  Camera,
  UtensilsCrossed,
  Sparkles,
  CheckCircle2,
  BellRing,
  CreditCard,
  Printer,
  Share2,
  Copy,
  ChevronRight,
  Store,
  Info,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import { RestaurantItem } from '../../types';

interface QrMenuScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurants: RestaurantItem[];
  onSelectRestaurantAndTable: (restaurant: RestaurantItem, tableNo: number | 'paket') => void;
}

export const QrMenuScannerModal: React.FC<QrMenuScannerModalProps> = ({
  isOpen,
  onClose,
  restaurants,
  onSelectRestaurantAndTable,
}) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'manual' | 'qr_card'>('scan');
  const [selectedRestId, setSelectedRestId] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<number | 'paket'>(1);
  const [isScanning, setIsScanning] = useState(true);
  const [detectedFeedback, setDetectedFeedback] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter only food / cafe places supporting QR menu
  const qrRestaurants = restaurants.filter(
    (r) =>
      r.businessMode === 'qr_menu' ||
      r.category === 'yemek' ||
      r.tag?.toLowerCase().includes('döner') ||
      r.tag?.toLowerCase().includes('tatlı') ||
      r.tag?.toLowerCase().includes('cafe') ||
      r.tag?.toLowerCase().includes('restoran')
  );

  const activeVenue =
    qrRestaurants.find((r) => r.id === selectedRestId) || qrRestaurants[0] || restaurants[0];

  useEffect(() => {
    if (qrRestaurants.length > 0 && !selectedRestId) {
      setSelectedRestId(qrRestaurants[0].id);
    }
  }, [qrRestaurants, selectedRestId]);

  if (!isOpen) return null;

  // Simulate scanning detection
  const handleSimulateScan = (rest: RestaurantItem, tableNum: number | 'paket') => {
    setIsScanning(false);
    setDetectedFeedback(`${rest.name} • ${tableNum === 'paket' ? 'Paket Servis' : `Masa #${tableNum}`} algılandı!`);
    setTimeout(() => {
      onSelectRestaurantAndTable(rest, tableNum);
      onClose();
      setIsScanning(true);
      setDetectedFeedback(null);
    }, 1100);
  };

  const handleCopyQrLink = () => {
    const fakeUrl = `https://mutlular.plus/menu/${activeVenue.id}?masa=${selectedTable}`;
    navigator.clipboard?.writeText(fakeUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col relative animate-in slide-in-from-bottom duration-300 border border-neutral-200">
        
        {/* Header */}
        <div className="px-4 py-3 bg-neutral-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center shadow-xs">
              <QrCode className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-black leading-tight flex items-center gap-1.5">
                <span>Masa QR Menü Okutucu</span>
                <span className="text-[9.5px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-400/30">
                  CANLI
                </span>
              </h3>
              <p className="text-[10.5px] text-neutral-400">
                Temassız Masadan Sipariş & Menü İnceleme
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 text-white flex items-center justify-center hover:bg-neutral-700 transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-neutral-100 p-1.5 flex items-center gap-1 border-b border-neutral-200 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'scan'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-rose-600" />
            <span>Kamera ile Tara</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'manual'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />
            <span>Masa & Dükkan Seç</span>
          </button>

          <button
            onClick={() => setActiveTab('qr_card')}
            className={`flex-1 py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'qr_card'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            <span>Masa Karekodu</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: CAMERA SCANNER SIMULATOR */}
          {activeTab === 'scan' && (
            <div className="space-y-3.5 text-center">
              {/* Simulated Viewfinder */}
              <div className="relative w-full aspect-square max-w-[280px] mx-auto bg-neutral-950 rounded-3xl overflow-hidden border-2 border-neutral-800 shadow-inner flex flex-col items-center justify-center p-4">
                {/* Background Camera Noise Simulation */}
                <div className="absolute inset-0 bg-radial from-neutral-800/40 via-neutral-950 to-black opacity-80" />

                {/* Laser Scanning Beam */}
                {isScanning && (
                  <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.9)]" />
                )}

                {/* QR Target Reticle Frame */}
                <div className="relative w-48 h-48 border-2 border-amber-400/70 rounded-2xl flex flex-col items-center justify-center p-3 bg-amber-400/5 backdrop-blur-[1px]">
                  {/* Reticle Corner Accents */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

                  {/* Center QR Graphic */}
                  <div className="w-24 h-24 bg-white/90 p-2 rounded-xl flex items-center justify-center shadow-lg">
                    <QrCode className="w-18 h-18 text-neutral-900" />
                  </div>

                  <span className="text-[10px] font-bold text-amber-300 mt-2 bg-black/60 px-2 py-0.5 rounded-full">
                    Karekodu Çerçeveye Hizalayın
                  </span>
                </div>

                {/* Feedback overlay when detected */}
                {detectedFeedback && (
                  <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 animate-in zoom-in-95 duration-200">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
                    <span className="text-sm font-black text-center">{detectedFeedback}</span>
                    <span className="text-xs text-emerald-300 mt-1">Dijital menü açılıyor...</span>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 text-left space-y-1">
                <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Nasıl Kullanılır?</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Restoran veya kafede masanızın üzerindeki Mutlular QR etiketine kameranızı tutun veya aşağıdaki hazır masalardan birini seçerek menüyü anında açın.
                </p>
              </div>

              {/* Quick Preset Restaurants Scan Simulation */}
              <div className="space-y-2 text-left pt-1">
                <span className="text-[11px] font-black text-neutral-700 uppercase tracking-wider block">
                  Hızlı Demo Menüleri (Tek Tıkla Tara):
                </span>
                <div className="space-y-2">
                  {qrRestaurants.slice(0, 3).map((venue) => (
                    <div
                      key={venue.id}
                      className="bg-white p-2.5 rounded-2xl border border-neutral-200 hover:border-amber-400 flex items-center justify-between gap-3 shadow-2xs transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={venue.image}
                          alt={venue.name}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-neutral-100"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-neutral-900 truncate">
                            {venue.name}
                          </h4>
                          <span className="text-[10px] text-neutral-500 font-semibold block">
                            {venue.tag} • Masa #3 Hazır
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSimulateScan(venue, 3)}
                        className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-1 transition active:scale-95 shrink-0 shadow-2xs"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Masa 3 Olarak Aç</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL VENUE & TABLE PICKER */}
          {activeTab === 'manual' && (
            <div className="space-y-3.5">
              {/* Select Venue */}
              <div>
                <label className="text-xs font-black text-neutral-900 block mb-1.5">
                  1. İşletme / Restoran Seçin:
                </label>
                <div className="space-y-2">
                  {qrRestaurants.map((venue) => (
                    <div
                      key={venue.id}
                      onClick={() => setSelectedRestId(venue.id)}
                      className={`p-2.5 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                        venue.id === activeVenue.id
                          ? 'bg-amber-50 border-amber-500 shadow-xs'
                          : 'bg-white border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={venue.image}
                          alt={venue.name}
                          className="w-10 h-10 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-neutral-900 truncate">
                            {venue.name}
                          </h4>
                          <span className="text-[10px] text-neutral-500 font-medium block truncate">
                            {venue.address || venue.tag}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1">
                        <span className="text-[10.5px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                          {venue.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Select Table Number */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-neutral-900">
                    2. Masa Numarası Seçin:
                  </label>
                  <span className="text-[11px] font-black text-amber-700 bg-amber-100 px-2 py-0.2 rounded-full">
                    {selectedTable === 'paket' ? 'Paket Servis' : `Masa #${selectedTable}`}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                    <button
                      key={num}
                      onClick={() => setSelectedTable(num)}
                      className={`py-2 rounded-xl text-xs font-black transition ${
                        selectedTable === num
                          ? 'bg-amber-500 text-neutral-950 shadow-xs'
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      Masa {num}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedTable('paket')}
                  className={`mt-2 w-full py-2 rounded-xl text-xs font-black transition border ${
                    selectedTable === 'paket'
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                      : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                  }`}
                >
                  🥡 Paket / Gel-Al (Masa Dışı Sipariş)
                </button>
              </div>

              {/* Action Button: Open QR Menu */}
              <button
                onClick={() => {
                  if (activeVenue) {
                    onSelectRestaurantAndTable(activeVenue, selectedTable);
                    onClose();
                  }
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 active:scale-98 text-neutral-950 font-black text-xs sm:text-[13px] py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md transition"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>
                  {activeVenue.name} • {selectedTable === 'paket' ? 'Paket' : `Masa #${selectedTable}`} Menüsünü Aç
                </span>
              </button>
            </div>
          )}

          {/* TAB 3: PRINTABLE QR CARD FOR MERCHANTS & TABLES */}
          {activeTab === 'qr_card' && (
            <div className="space-y-4 text-center">
              <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 text-white p-5 rounded-3xl shadow-xl space-y-3 relative overflow-hidden border border-neutral-800">
                {/* Brand Header on Card */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-1.5 font-black text-xs tracking-tighter">
                    <span>MUTLULAR</span>
                    <span className="text-rose-500">PLUS</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                    DİJİTAL MASA MENÜSÜ
                  </span>
                </div>

                {/* Venue Name & Table Number */}
                <div>
                  <h4 className="text-base font-black text-white">{activeVenue.name}</h4>
                  <div className="inline-block mt-1 bg-amber-500 text-neutral-950 font-black text-xs px-3 py-1 rounded-full shadow-md">
                    {selectedTable === 'paket' ? 'PAKET / GEL-AL SİPARİŞ' : `MASA #${selectedTable}`}
                  </div>
                </div>

                {/* Big QR Code Card */}
                <div className="w-40 h-40 mx-auto bg-white p-3 rounded-2xl shadow-inner flex flex-col items-center justify-center border-4 border-amber-400">
                  <QrCode className="w-32 h-32 text-neutral-950" />
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] text-neutral-300 font-semibold">
                    Telefonunuzun kamerasını karekoda tutun, masanıza temassız sipariş verin.
                  </p>
                  <div className="flex items-center justify-center gap-3 text-[10px] text-amber-300/90 pt-1 font-bold">
                    <span className="flex items-center gap-1">
                      <BellRing className="w-3 h-3" /> Garson Çağır
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> Hesap İste
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyQrLink}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5 text-neutral-600" />
                  <span>{copiedLink ? 'Link Kopyalandı!' : 'Masa Linkini Kopyala'}</span>
                </button>

                <button
                  onClick={() => {
                    if (activeVenue) {
                      onSelectRestaurantAndTable(activeVenue, selectedTable);
                      onClose();
                    }
                  }}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Bu Menüyü Aç</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="bg-neutral-50 px-4 py-2 border-t border-neutral-200 flex items-center justify-between text-[11px] text-neutral-500">
          <span className="font-semibold">Mutlular Plus QR Ekosistemi</span>
          <span className="font-bold text-rose-600">{qrRestaurants.length} Restoran Aktif</span>
        </div>
      </div>
    </div>
  );
};
