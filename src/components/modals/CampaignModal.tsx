import React from 'react';
import { X, Tag, Copy, Check, Sparkles } from 'lucide-react';

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CampaignModal: React.FC<CampaignModalProps> = ({ isOpen, onClose }) => {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const campaigns = [
    {
      id: 'c-1',
      store: 'MUTLULAR YAPI MARKET',
      badge: '%20 İndirim',
      code: 'MPYAPI20',
      title: 'Tüm Boya, Elektrik ve Tesisat Malzemelerinde Geçerli',
      validUntil: '31 Ekim 2026',
      color: 'bg-amber-500',
    },
    {
      id: 'c-2',
      store: 'ANTEPLİ TATLICIM',
      badge: '50 ₺ İndirim',
      code: 'TATLI50',
      title: '250 ₺ ve Üzeri Baklava / Kadayıf Siparişlerinde Net İndirim',
      validUntil: '15 Ekim 2026',
      color: 'bg-rose-600',
    },
    {
      id: 'c-3',
      store: 'MAYDONOZ DÖNER PODİUM',
      badge: '1+1 Menü',
      code: 'MAYDONOZ11',
      title: 'Dürüm Menü Alana İkincisi Yarı Fiyatına!',
      validUntil: '20 Ekim 2026',
      color: 'bg-emerald-600',
    },
    {
      id: 'c-4',
      store: 'CAFE 101 MUTLULAR',
      badge: '%15 İndirim',
      code: 'CAFE101',
      title: 'Öğrenci Kartını Gösterene Tüm Kahvelerde %15 İndirim',
      validUntil: 'Süresiz',
      color: 'bg-indigo-600',
    },
  ];

  if (!isOpen) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-4 relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[14px] font-black text-neutral-900 leading-tight">
                Kuponlar & Fırsatlar
              </h3>
              <p className="text-[10px] text-neutral-500 font-semibold">
                Mutlular Esnafından Özel İndirimler
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

        {/* Content */}
        <div className="py-3 space-y-3 overflow-y-auto">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3 space-y-2 shadow-2xs relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">
                    {camp.store}
                  </span>
                  <h4 className="text-[13px] font-black text-neutral-900 mt-0.5 leading-snug">
                    {camp.title}
                  </h4>
                </div>
                <span
                  className={`text-[10px] font-black text-white px-2 py-0.5 rounded uppercase shrink-0 shadow-2xs ${camp.color}`}
                >
                  {camp.badge}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-neutral-200 text-[11px]">
                <span className="text-[10px] text-neutral-400 font-semibold">
                  Son: {camp.validUntil}
                </span>

                <button
                  onClick={() => handleCopy(camp.code)}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white font-mono font-bold text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-1.5 active:scale-95 transition"
                >
                  {copiedCode === camp.code ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Kopyalandı</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-neutral-400" />
                      <span>{camp.code}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
