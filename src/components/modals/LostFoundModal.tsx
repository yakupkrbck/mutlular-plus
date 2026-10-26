import React, { useState } from 'react';
import { X, Search, MapPin, Phone, Plus, CheckCircle2 } from 'lucide-react';

interface LostFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LostFoundModal: React.FC<LostFoundModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'kayiplar' | 'ekle'>('kayiplar');
  const [submitted, setSubmitted] = useState(false);

  const items = [
    {
      id: 'lf-1',
      type: 'Kayıp Evcil Hayvan',
      title: 'Tekir Kedi "Duman" Kayıp',
      location: 'Meydan Parkı civarı',
      date: 'Bugün',
      desc: 'Tasmada mavi çıngırak var, uysaldır. Görenlerin insaniyet namına aramasını rica ederiz.',
      phone: '0555 444 33 22',
      badgeColor: 'bg-red-100 text-red-700',
    },
    {
      id: 'lf-2',
      type: 'Buluntu Eşya',
      title: 'Siyah Deri Cüzdan ve Anahtarlık Bulundu',
      location: 'Belediye Otobüsü (1A Hattı)',
      date: 'Dün',
      desc: 'İçerisinde kimlik ve kartlar bulunan cüzdan şoför mahalline teslim edilmiştir.',
      phone: '0318 224 55 00',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-4 relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Search className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-[14px] font-black text-neutral-900 leading-tight">
                Kayıp & Buluntu
              </h3>
              <p className="text-[10px] text-neutral-500 font-semibold">
                Mutlular Yardımlaşma Ağı
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
            onClick={() => setActiveTab('kayiplar')}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition ${
              activeTab === 'kayiplar' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
            }`}
          >
            İlanlar
          </button>
          <button
            onClick={() => setActiveTab('ekle')}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition ${
              activeTab === 'ekle' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
            }`}
          >
            + İlan Oluştur
          </button>
        </div>

        {/* Content */}
        {activeTab === 'kayiplar' ? (
          <div className="space-y-3 overflow-y-auto py-1">
            {items.map((it) => (
              <div
                key={it.id}
                className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3 space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${it.badgeColor}`}>
                    {it.type}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-medium">
                    {it.date}
                  </span>
                </div>

                <h4 className="text-[13px] font-black text-neutral-900">
                  {it.title}
                </h4>

                <p className="text-[11px] text-neutral-600 leading-snug">
                  {it.desc}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-neutral-200 text-[11px]">
                  <div className="flex items-center gap-1 text-neutral-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{it.location}</span>
                  </div>
                  <a
                    href={`tel:${it.phone}`}
                    className="flex items-center gap-1 font-bold text-rose-600 hover:text-rose-700"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Ara</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : submitted ? (
          <div className="py-10 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-[14px] font-black text-neutral-900">
              İlanınız Yayına Alındı!
            </h4>
            <p className="text-[11px] text-neutral-500">
              Şehir sakinleri bilgilendirildi.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
              setTimeout(() => {
                setSubmitted(false);
                setActiveTab('kayiplar');
              }, 1800);
            }}
            className="py-2 space-y-2.5 overflow-y-auto"
          >
            <div>
              <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                İlan Türü
              </label>
              <select className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-amber-500 focus:bg-white">
                <option>Kayıp Eşya</option>
                <option>Kayıp Evcil Hayvan</option>
                <option>Buluntu Eşya</option>
                <option>Buluntu Evcil Hayvan</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                Başlık
              </label>
              <input
                required
                type="text"
                placeholder="Örn: Mavi Anahtarlık Kayıp"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                Kaybolduğu / Bulunduğu Yer
              </label>
              <input
                required
                type="text"
                placeholder="Örn: Stadyum önü, Otogar"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                İletişim Telefonu
              </label>
              <input
                required
                type="tel"
                placeholder="0555 000 00 00"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-[12px] py-2.5 rounded-xl transition shadow-xs"
            >
              İlanı Yayınla
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
