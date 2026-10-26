import React, { useState } from 'react';
import { X, MapPin, Calendar, Heart, Share2, Phone, BellRing, CheckCircle2 } from 'lucide-react';
import { ClassifiedItem } from '../../types';
import { sendAndroidAppNotification } from '../../services/androidNotificationService';

interface ClassifiedDetailModalProps {
  ad: ClassifiedItem | null;
  onClose: () => void;
}

export const ClassifiedDetailModal: React.FC<ClassifiedDetailModalProps> = ({
  ad,
  onClose,
}) => {
  const [pushSent, setPushSent] = useState(false);

  if (!ad) return null;

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Merhaba, Mutlular Plus uygulamasındaki "${ad.title}" başlıklı ${ad.price} tutarındaki ilanınız hakkında bilgi almak istiyorum.`
    );
    window.open(`https://wa.me/${ad.phone}?text=${text}`, '_blank');
  };

  const handleBroadcastAd = async () => {
    await sendAndroidAppNotification({
      title: `🏷️ Öne Çıkan İlan: ${ad.title}`,
      body: `${ad.price} • ${ad.location} - İlanı incelemek için dokunun.`,
      type: 'ilan',
      actionTab: 'alim_satim',
      relatedId: ad.id,
      badgeText: ad.mainCategory?.toUpperCase() || 'ÖNE ÇIKAN İLAN',
      timestamp: Date.now(),
    });
    setPushSent(true);
    setTimeout(() => setPushSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ad Image */}
        <div className="relative h-60 w-full bg-neutral-900 shrink-0">
          <img
            src={ad.image}
            alt={ad.title}
            className="w-full h-full object-cover"
          />
          <span
            className={`absolute top-3 left-3 text-white text-[10px] font-black px-2.5 py-1 rounded shadow-xs uppercase ${
              ad.mainCategory === 'kiralik' || ad.tag?.includes('KİRALIK')
                ? 'bg-emerald-600'
                : ad.mainCategory === 'ikinci-el' || ad.tag?.includes('2. EL')
                ? 'bg-amber-600'
                : 'bg-rose-600'
            }`}
          >
            {ad.tag}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          <div>
            <div
              className={`text-[20px] font-black ${
                ad.mainCategory === 'kiralik'
                  ? 'text-emerald-600'
                  : ad.mainCategory === 'ikinci-el'
                  ? 'text-amber-700'
                  : 'text-rose-600'
              }`}
            >
              {ad.price}
            </div>
            <h2 className="text-[16px] font-extrabold text-neutral-900 leading-snug mt-1">
              {ad.title}
            </h2>

            {ad.agency && (
              <div className="text-[12px] font-black text-neutral-700 mt-1 uppercase">
                {ad.agency}
              </div>
            )}

            {/* Specs row if available */}
            {(ad.rooms || ad.area || ad.floor) && (
              <div className="flex items-center gap-2.5 bg-neutral-50 p-2 rounded-xl border border-neutral-200 mt-2 text-[11px] font-bold text-neutral-800">
                {ad.rooms && <span>{ad.rooms}</span>}
                {ad.area && <span>• {ad.area}</span>}
                {ad.floor && <span>• {ad.floor}</span>}
              </div>
            )}

            <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-semibold mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                {ad.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {ad.date}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-100">
            <h3 className="text-[12px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Açıklama
            </h3>
            <p className="text-[12px] text-neutral-600 leading-relaxed">
              {ad.description}
            </p>
          </div>

          <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-[11px] space-y-1">
            <div className="flex justify-between font-medium">
              <span className="text-neutral-500">İlan No:</span>
              <span className="font-bold text-neutral-800">MP-849201</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-neutral-500">Konum:</span>
              <span className="font-bold text-neutral-800">Mutlular, Merkez</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-neutral-500">Durum:</span>
              <span className="font-bold text-emerald-600">Aktif İlan</span>
            </div>
          </div>
        </div>

        {/* Admin Broadcast Button */}
        <div className="px-3 pt-2 bg-white">
          <button
            onClick={handleBroadcastAd}
            className={`w-full py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 font-black text-xs transition border shadow-xs ${
              pushSent
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border-amber-300'
            }`}
          >
            {pushSent ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>✓ İlan Android Bildirimi Olarak Gönderildi!</span>
              </>
            ) : (
              <>
                <BellRing className="w-4 h-4 text-amber-600" />
                <span>📢 Bu İlanı Tüm Mahalleye Bildir (Push)</span>
              </>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2">
          <a
            href={`tel:${ad.phone}`}
            className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-[12px] py-2.5 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <Phone className="w-4 h-4 text-neutral-600" />
            <span>Ara</span>
          </a>

          <button
            onClick={handleWhatsApp}
            className="flex-[2] bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white font-black text-[12px] py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            <span>WhatsApp ile Yaz</span>
          </button>
        </div>
      </div>
    </div>
  );
};
