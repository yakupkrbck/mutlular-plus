import React, { useState } from 'react';
import { X, Mic, ThumbsUp, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

interface KursuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KursuModal: React.FC<KursuModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'talepler' | 'yaz'>('talepler');
  const [submitted, setSubmitted] = useState(false);

  const talepler = [
    {
      id: 'k-1',
      author: 'Mehmet K. (Yeni Mahalle)',
      title: 'Millet Bahçesi Çocuk Parkı Işıklandırması',
      desc: 'Akşam saatlerinde çocuk parkının ışıkları yetersiz kalıyor, aydınlatma direklerinin kontrol edilmesini rica ediyoruz.',
      likes: 42,
      status: 'Belediye İnceliyor',
      date: '2 gün önce',
    },
    {
      id: 'k-2',
      author: 'Fatma S. (Çarşı Mahallesi)',
      title: 'Salı Pazarı Girişine Ek Çöp Konteyneri',
      desc: 'Pazar kurulduğu günlerde çöpler taşıyor, giriş ve çıkış noktalarına ek konteyner konulması çevre temizliği için iyi olur.',
      likes: 28,
      status: 'Çözüm Sırasında',
      date: '3 gün önce',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-4 relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[14px] font-black text-neutral-900 leading-tight">
                Halk Kürsüsü & Talepler
              </h3>
              <p className="text-[10px] text-neutral-500 font-semibold">
                Söz Vatandaşta • Belediye & Muhtarlık
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
            onClick={() => setActiveTab('talepler')}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition ${
              activeTab === 'talepler' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
            }`}
          >
            Vatandaş Talepleri
          </button>
          <button
            onClick={() => setActiveTab('yaz')}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition ${
              activeTab === 'yaz' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
            }`}
          >
            + Söz Hakkı Al / Yaz
          </button>
        </div>

        {/* Content */}
        {activeTab === 'talepler' ? (
          <div className="space-y-3 overflow-y-auto py-1">
            {talepler.map((talep) => (
              <div
                key={talep.id}
                className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3 space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-neutral-700">
                    {talep.author}
                  </span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {talep.status}
                  </span>
                </div>

                <h4 className="text-[12px] font-black text-neutral-900">
                  {talep.title}
                </h4>

                <p className="text-[11px] text-neutral-600 leading-snug">
                  {talep.desc}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-neutral-200 text-[10px] text-neutral-500">
                  <span>{talep.date}</span>
                  <button
                    onClick={() => alert('Destek oyu verildi! 👍')}
                    className="flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Destekle ({talep.likes})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : submitted ? (
          <div className="py-10 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-[14px] font-black text-neutral-900">
              Talebiniz Kürsüye Eklendi!
            </h4>
            <p className="text-[11px] text-neutral-500">
              Mahalle muhtarınız ve ilgili belediye birimi bilgilendirildi.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
              setTimeout(() => {
                setSubmitted(false);
                setActiveTab('talepler');
              }, 1800);
            }}
            className="py-2 space-y-2.5 overflow-y-auto"
          >
            <div>
              <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                Mahalleniz
              </label>
              <select className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-indigo-600 focus:bg-white">
                <option>Yeni Mahalle</option>
                <option>Çarşı Mahallesi</option>
                <option>Bahçelievler</option>
                <option>Sanayi Bölgesi</option>
                <option>Kampüs Çevresi</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                Talep / Sorun Başlığı
              </label>
              <input
                required
                type="text"
                placeholder="Örn: Yol onarımı, Sokak lambası vb."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                Açıklama & Çözüm Öneriniz
              </label>
              <textarea
                rows={3}
                required
                placeholder="Yetkililere iletmek istediğiniz detayları yazın..."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[12px] py-2.5 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kürsüde Yayınla</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
