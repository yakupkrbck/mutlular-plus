import React, { useState, useEffect } from 'react';
import { X, Wrench, Calendar, MapPin, CheckCircle2, ChevronRight, Send, Phone, Coins, ShieldCheck, Tag } from 'lucide-react';

interface QuoteWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillCategory?: string;
  prefillSubCategory?: string;
  onRequestCreated?: (request: {
    id: string;
    category: string;
    subCategory: string;
    urgency: string;
    desc: string;
    address: string;
    phone: string;
    createdAt: string;
  }) => void;
}

export const QuoteWizardModal: React.FC<QuoteWizardModalProps> = ({
  isOpen,
  onClose,
  prefillCategory,
  prefillSubCategory,
  onRequestCreated,
}) => {
  const [step, setStep] = useState(prefillCategory ? 2 : 1);
  const [category, setCategory] = useState(prefillCategory || 'Sıhhi Tesisat & Su Sistemleri');
  const [subCategory, setSubCategory] = useState(prefillSubCategory || 'Genel Tesisat Hizmeti');
  const [urgency, setUrgency] = useState('Hemen (1-2 Gün)');
  const [desc, setDesc] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('0 (5');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (prefillCategory) {
        setCategory(prefillCategory);
        setSubCategory(prefillSubCategory || 'Genel Hizmet Talebi');
        setStep(2);
      } else {
        setStep(1);
      }
      setSubmitted(false);
    }
  }, [isOpen, prefillCategory, prefillSubCategory]);

  const categories = [
    'Sıhhi Tesisat & Su Sistemleri',
    'Elektrik, Aydınlatma & Otomasyon',
    'Kombi, Klima & Isıtma Sistemleri',
    'Boya, Badana & Dekorasyon',
    'Mobilya, Marangoz & İç Kapı',
    'Nakliyat, Taşıma & Depolama',
    'Çilingir, Kilit & Demir Doğrama',
    'Temizlik, İlaçlama & Koltuk Yıkama',
    'Cam Balkon, Sineklik & PVC Doğrama',
    'Bahçe Bakımı, Peyzaj & Çit',
  ];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (onRequestCreated) {
      onRequestCreated({
        id: `talep-${Date.now()}`,
        category,
        subCategory,
        urgency,
        desc,
        address,
        phone,
        createdAt: 'Şimdi',
      });
    }

    setTimeout(() => {
      setSubmitted(false);
      setStep(1);
      setDesc('');
      onClose();
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-4 relative max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center font-bold text-sm shadow-xs">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[14px] font-black text-neutral-900 leading-tight">
                Hizmet Teklifi Talep Et
              </h3>
              <p className="text-[10px] text-neutral-500 font-semibold">
                Mutlular Onaylı Usta Teklif Havuzu
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

        {submitted ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5] animate-bounce" />
            </div>
            <div className="space-y-1">
              <h4 className="text-[16px] font-black text-neutral-900">
                Talebiniz Usta Havuzuna İletildi!
              </h4>
              <p className="text-[11.5px] text-neutral-600 max-w-xs mx-auto leading-relaxed">
                <span className="font-bold text-neutral-900">{subCategory || category}</span> talebiniz bölgedeki onaylı ustalara bildirildi. Ustalar tekliflerini en kısa sürede iletecektir.
              </p>
            </div>

            <div className="bg-amber-50 rounded-xl p-2.5 text-[10.5px] text-amber-900 font-semibold border border-amber-200/80">
              ⚡ Teklifler geldiğinde SMS ve bildirim ile bilgilendirileceksiniz.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="py-3 space-y-3 overflow-y-auto">
            {step === 1 && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-black text-neutral-700 uppercase mb-1.5">
                    Hangi Ana Faaliyete İhtiyacınız Var?
                  </label>
                  <div className="grid grid-cols-1 gap-1.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                    {categories.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCategory(c);
                          setSubCategory(c);
                        }}
                        className={`p-2.5 rounded-xl text-[11.5px] font-bold text-left border transition flex items-center justify-between ${
                          category === c
                            ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-2xs'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        <span>{c}</span>
                        {category === c && <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-[12px] py-2.5 rounded-xl transition flex items-center justify-center gap-1 shadow-sm mt-3"
                >
                  <span>Devam Et: İş Detayı Belirt</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                {/* Preselected Activities Summary */}
                <div className="p-2.5 bg-amber-50/90 rounded-2xl border border-amber-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-black uppercase text-amber-800 tracking-wider">
                      Seçilen Faaliyet Alanı
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[10px] font-extrabold text-amber-900 underline"
                    >
                      Değiştir
                    </button>
                  </div>
                  <div className="text-[12.5px] font-black text-neutral-900 leading-tight">
                    {subCategory || category}
                  </div>
                  {category !== subCategory && (
                    <div className="text-[10.5px] font-semibold text-neutral-600">
                      Ana Kategori: {category}
                    </div>
                  )}
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-[10.5px] font-black text-neutral-700 uppercase mb-1">
                    İşin Aciliyeti Nedir?
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-semibold outline-none focus:border-amber-500 focus:bg-white"
                  >
                    <option>Hemen (1-2 Gün İçinde)</option>
                    <option>Acil (Bugün / Hemen)</option>
                    <option>Bu Hafta İçi</option>
                    <option>Önümüzdeki Ay / İleri Tarihli</option>
                    <option>Fiyat Araştırması Yapıyorum</option>
                  </select>
                </div>

                {/* Job description */}
                <div>
                  <label className="block text-[10.5px] font-black text-neutral-700 uppercase mb-1">
                    Yapılacak İşin Detayı
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Örn: 3+1 daire tavanlar dahil boyanacak / Banyo lavabo gideri su kaçırıyor..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-amber-500 focus:bg-white placeholder-neutral-400"
                  />
                </div>

                {/* Neighborhood / Address */}
                <div>
                  <label className="block text-[10.5px] font-black text-neutral-700 uppercase mb-1">
                    Hizmet Yeri (Mahalle / Adres)
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Örn: Mutlular Mah. Nilüfer / Bursa"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>

                {/* Phone number */}
                <div>
                  <label className="block text-[10.5px] font-black text-neutral-700 uppercase mb-1">
                    İletişim Numaranız (Teklif Bildirimi İçin)
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      required
                      type="tel"
                      placeholder="0 (5XX) XXX XX XX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-8.5 pr-3 py-2 text-[12px] font-semibold outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>
                  <span className="text-[9.5px] text-neutral-400 font-medium mt-0.5 block">
                    Numaranız ustalara doğrudan verilmez; teklif bildirimleri sistem üzerinden iletilir.
                  </span>
                </div>

                {/* Assurance note */}
                <div className="p-2 rounded-xl bg-neutral-100 text-[10px] text-neutral-600 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Teklif almak sizin için <strong>tamamen ücretsizdir</strong>. Ustalar teklif başına katılım sağlar.
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-[12px] py-2.5 rounded-xl transition"
                  >
                    Geri
                  </button>
                  <button
                    type="submit"
                    className="flex-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-[12px] py-2.5 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-neutral-950" />
                    <span>Teklif Talebini Gönder</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
