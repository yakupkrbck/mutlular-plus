import React, { useState } from 'react';
import { X, Heart, Calendar, MapPin, Share2, Plus, CheckCircle2 } from 'lucide-react';

interface DavetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DavetModal: React.FC<DavetModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'liste' | 'ekle'>('liste');
  const [created, setCreated] = useState(false);

  const davetListesi = [
    {
      id: 'd-1',
      title: 'Zeynep & Emre Düğün Töreni',
      tag: 'Düğün',
      date: '18 Ekim 2026, Pazar 19:00',
      venue: 'Mutlular Grand Düğün Sarayı, Salon 1',
      note: 'Bu mutlu günümüzde siz değerli dostlarımızı aramızda görmekten onur duyarız.',
      families: 'Güneş & Çelik Aileleri',
    },
    {
      id: 'd-2',
      title: 'Mert Ali Sünnet Merasimi',
      tag: 'Sünnet',
      date: '25 Ekim 2026, Pazar 14:00',
      venue: 'Kültür Merkezi Açık Hava Bahçesi',
      note: 'Oğlumuzun sünnet düğününe tüm akraba ve hemşehrilerimiz davetlidir.',
      families: 'Kaya Ailesi',
    },
    {
      id: 'd-3',
      title: 'Mutlular Gurme Şarküteri Açılışı',
      tag: 'Açılış',
      date: '12 Ekim 2026, Pazartesi 13:00',
      venue: 'Meydan Cad. No: 18 (Kiraathane Yanı)',
      note: 'Açılışımıza özel ikramlar ve %30 indirim fırsatlarıyla sizleri bekliyoruz.',
      families: 'İşletme Sahibi: Mustafa Mutlu',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-4 relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pink-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h3 className="text-[14px] font-black text-neutral-900 leading-tight">
                Davetiyeler & Cemiyet
              </h3>
              <p className="text-[10px] text-neutral-500 font-semibold">
                Düğün, Sünnet, Nişan ve Açılışlar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="bg-neutral-100 p-1 rounded-xl flex items-center gap-1 my-2.5">
          <button
            onClick={() => setActiveTab('liste')}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition ${
              activeTab === 'liste' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
            }`}
          >
            Güncel Davetiyeler
          </button>
          <button
            onClick={() => setActiveTab('ekle')}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition ${
              activeTab === 'ekle' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
            }`}
          >
            + Davetiye Yayınla
          </button>
        </div>

        {/* Content */}
        {activeTab === 'liste' ? (
          <div className="space-y-3 overflow-y-auto py-1">
            {davetListesi.map((davet) => (
              <div
                key={davet.id}
                className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3 space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-pink-100 text-pink-700">
                    {davet.tag}
                  </span>
                  <span className="text-[10px] font-semibold text-neutral-500">
                    {davet.families}
                  </span>
                </div>

                <h4 className="text-[13px] font-black text-neutral-900">
                  {davet.title}
                </h4>

                <p className="text-[11px] text-neutral-600 italic">
                  &ldquo;{davet.note}&rdquo;
                </p>

                <div className="text-[11px] text-neutral-700 space-y-1 pt-1 border-t border-neutral-200">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                    <span>{davet.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-neutral-500">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{davet.venue}</span>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Davetiye paylaşıldı: ${davet.title}`)}
                  className="w-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 font-bold text-[11px] py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition mt-1"
                >
                  <Share2 className="w-3 h-3 text-pink-600" />
                  <span>Davetiyeyi Paylaş</span>
                </button>
              </div>
            ))}
          </div>
        ) : created ? (
          <div className="py-10 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-[14px] font-black text-neutral-900">
              Davetiyeniz İletildi!
            </h4>
            <p className="text-[11px] text-neutral-500">
              Editör onayı sonrası şehrin tüm sakinleriyle paylaşılacaktır.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setCreated(true);
              setTimeout(() => {
                setCreated(false);
                setActiveTab('liste');
              }, 1800);
            }}
            className="py-2 space-y-2.5 overflow-y-auto"
          >
            <div>
              <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                Davetiye Başlığı
              </label>
              <input
                required
                type="text"
                placeholder="Örn: Ayşe & Can Düğünü"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-pink-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                Tarih ve Saat
              </label>
              <input
                required
                type="text"
                placeholder="Örn: 20 Ekim Pazar 19:30"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-pink-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                Salon / Adres
              </label>
              <input
                required
                type="text"
                placeholder="Örn: Kültür Park Düğün Salonu"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-pink-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                Davet Mesajı
              </label>
              <textarea
                rows={2}
                placeholder="Sevdikleriniz için kısa bir not yazın..."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-pink-600 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-[12px] py-2.5 rounded-xl transition shadow-xs"
            >
              Yayın Talebi Gönder
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
