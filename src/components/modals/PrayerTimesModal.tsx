import React, { useState, useEffect } from 'react';
import { X, Clock, Radio, RefreshCw } from 'lucide-react';
import { getLiveBursaPrayerTimes, LivePrayerTimesData } from '../../services/liveApis';

interface PrayerTimesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrayerTimesModal: React.FC<PrayerTimesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [prayerData, setPrayerData] = useState<LivePrayerTimesData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getLiveBursaPrayerTimes()
        .then((data) => setPrayerData(data))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleRefresh = () => {
    setLoading(true);
    getLiveBursaPrayerTimes()
      .then((data) => setPrayerData(data))
      .finally(() => setLoading(false));
  };

  if (!isOpen) return null;

  const displayList = prayerData?.times || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#881337] flex items-center justify-center text-white font-black text-sm">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-[14px] font-black text-neutral-900 leading-tight">
                  Namaz Vakitleri
                </h3>
                {prayerData?.source === 'api' && (
                  <span className="inline-flex items-center gap-1 text-[8.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                    <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-600" />
                    Diyanet API
                  </span>
                )}
              </div>
              <p className="text-[10px] text-neutral-500 font-semibold">
                Bursa • Osmangazi (Diyanet Standartları)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleRefresh}
              title="Yenile"
              className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Times list */}
        <div className="py-3 space-y-2">
          {displayList.length === 0 && !loading && (
            <p className="text-center text-[12px] font-semibold text-neutral-500 py-6">
              Namaz vakitleri şu an alınamadı. İnternetinizi kontrol edip yenileyin.
            </p>
          )}
          {displayList.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-3 rounded-xl transition ${
                item.next
                  ? 'bg-rose-50 border border-rose-200 text-rose-800 font-extrabold shadow-2xs'
                  : 'bg-neutral-50 text-neutral-800 font-bold border border-neutral-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[13px]">{item.name}</span>
                {item.next && (
                  <span className="text-[9px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded uppercase">
                    Sıradaki
                  </span>
                )}
              </div>
              <span className="text-[15px] font-black">{item.time}</span>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400 font-medium">
          <span>{prayerData?.hijriDate || 'Hicri Takvim'}</span>
          <span>Son güncelleme: {prayerData?.lastUpdated || '-'}</span>
        </div>
      </div>
    </div>
  );
};
