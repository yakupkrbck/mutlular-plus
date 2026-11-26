import React, { useEffect, useMemo, useState } from 'react';
import { ImagePlus, Trash2, Sparkles } from 'lucide-react';
import type { ClassifiedItem, NewsItem, ObituaryItem } from '../../types';
import type { KartTuru, KartVeri } from '../../services/paylasimService';
import { PaylasimKartiModal } from '../PaylasimKartiModal';

interface Props {
  newsList: NewsItem[];
  classifiedList: ClassifiedItem[];
  obituaryList: ObituaryItem[];
}

type Bilgi = { etiket: string; deger: string };

const TURLER: { id: KartTuru; ad: string }[] = [
  { id: 'haber', ad: 'Haber' },
  { id: 'kesinti', ad: 'Elektrik kesintisi' },
  { id: 'ilan', ad: 'Öne çıkan ilan' },
  { id: 'vefat', ad: 'Vefat ilanı' },
];

const VARSAYILAN_BILGI: Record<KartTuru, Bilgi[]> = {
  haber: [],
  kesinti: [
    { etiket: 'Tarih', deger: '' },
    { etiket: 'Saat', deger: '' },
    { etiket: 'Süre', deger: '' },
  ],
  ilan: [
    { etiket: 'Fiyat', deger: '' },
    { etiket: 'Konum', deger: '' },
    { etiket: 'Telefon', deger: '' },
  ],
  vefat: [
    { etiket: 'Namaz', deger: '' },
    { etiket: 'Cami', deger: '' },
    { etiket: 'Defin', deger: '' },
  ],
  eczane: [],
  duyuru: [],
};

const YOL: Record<string, string> = { haber: '/', kesinti: '/kesintiler', ilan: '/', vefat: '/' };

const girdi = 'w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-[13px] text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500';

export const KartStudyosu: React.FC<Props> = ({ newsList, classifiedList, obituaryList }) => {
  const [tur, setTur] = useState<KartTuru>('haber');
  const [baslik, setBaslik] = useState('');
  const [altBaslik, setAltBaslik] = useState('');
  const [etiket, setEtiket] = useState('');
  const [bilgiler, setBilgiler] = useState<Bilgi[]>(VARSAYILAN_BILGI.haber);
  const [gorsel, setGorsel] = useState('');
  const [yol, setYol] = useState('/');
  const [acik, setAcik] = useState(false);

  // Yüklenen dosya yalnızca bu cihazda (blob) tutulur; kartı çizmek için ağ gerekmez
  useEffect(() => () => { if (gorsel.startsWith('blob:')) URL.revokeObjectURL(gorsel); }, [gorsel]);

  const kaynaklar = useMemo(() => {
    if (tur === 'haber') return newsList.slice(0, 40).map((n) => ({ id: n.id, ad: n.title }));
    if (tur === 'ilan') return classifiedList.filter((c) => c.status !== 'pending' && c.status !== 'rejected').slice(0, 60).map((c) => ({ id: c.id, ad: c.title }));
    if (tur === 'vefat') return obituaryList.filter((o) => o.status === 'approved').slice(0, 40).map((o) => ({ id: o.id, ad: o.name }));
    return [];
  }, [tur, newsList, classifiedList, obituaryList]);

  const turDegis = (t: KartTuru) => {
    setTur(t);
    setBilgiler(VARSAYILAN_BILGI[t].map((b) => ({ ...b })));
    setBaslik(t === 'kesinti' ? "Mehmet Akif Mahallesi'nde elektrik kesintisi" : '');
    setAltBaslik('');
    setEtiket('');
    setGorsel('');
    setYol(YOL[t] || '/');
  };

  const kaynakSec = (id: string) => {
    if (!id) return;
    if (tur === 'haber') {
      const n = newsList.find((x) => x.id === id);
      if (!n) return;
      setBaslik(n.title);
      setAltBaslik(n.summary || '');
      setEtiket((n.category || '').toLocaleUpperCase('tr-TR'));
      setGorsel(n.image || '');
      setYol(`/haber/${n.id}`);
    } else if (tur === 'ilan') {
      const c = classifiedList.find((x) => x.id === id);
      if (!c) return;
      setBaslik(c.title);
      setAltBaslik(c.description ? c.description.slice(0, 140) : '');
      setBilgiler([
        { etiket: 'Fiyat', deger: c.price || '' },
        { etiket: 'Konum', deger: c.location || '' },
        { etiket: 'Telefon', deger: c.phone || '' },
      ]);
      setGorsel(c.image || '');
      setYol('/');
    } else if (tur === 'vefat') {
      const o = obituaryList.find((x) => x.id === id);
      if (!o) return;
      setBaslik(o.name);
      setAltBaslik([o.hometown, o.fatherName ? `${o.fatherName} oğlu` : ''].filter(Boolean).join(' · '));
      setBilgiler([
        { etiket: 'Namaz', deger: o.date || '' },
        { etiket: 'Cami', deger: o.mosque || '' },
        { etiket: 'Defin', deger: o.cemetery || '' },
      ]);
      setGorsel('');
      setYol('/');
    }
  };

  const dosyaSec = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!f.type.startsWith('image/')) return window.alert('Lütfen bir görsel dosyası seçin.');
    setGorsel(URL.createObjectURL(f));
  };

  const kart: KartVeri = {
    tur,
    baslik: baslik.trim() || 'Başlık',
    altBaslik: altBaslik.trim() || undefined,
    etiket: etiket.trim() || undefined,
    gorsel: gorsel || undefined,
    bilgiler: bilgiler.filter((b) => b.deger.trim()).map((b) => ({ etiket: b.etiket.trim() || '—', deger: b.deger.trim() })),
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-black text-white">Kart Stüdyosu</h3>
        <p className="text-[11px] text-neutral-400 mt-0.5">Story (dikey) ve gönderi (kare) kartı oluşturun. Yalnızca yönetici kullanabilir.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {TURLER.map((t) => (
          <button
            key={t.id}
            onClick={() => turDegis(t.id)}
            className={`py-2.5 rounded-xl text-[12px] font-black border ${tur === t.id ? 'bg-amber-500 text-neutral-950 border-amber-500' : 'border-neutral-700 text-neutral-300'}`}
          >
            {t.ad}
          </button>
        ))}
      </div>

      {kaynaklar.length > 0 && (
        <select defaultValue="" key={tur} onChange={(e) => kaynakSec(e.target.value)} className={girdi}>
          <option value="">Listeden doldur (isteğe bağlı)…</option>
          {kaynaklar.map((k) => (
            <option key={k.id} value={k.id}>
              {k.ad}
            </option>
          ))}
        </select>
      )}

      <div className="space-y-2">
        <input value={baslik} onChange={(e) => setBaslik(e.target.value)} placeholder={tur === 'vefat' ? 'Vefat eden kişinin adı' : 'Başlık'} className={girdi} />
        <textarea value={altBaslik} onChange={(e) => setAltBaslik(e.target.value)} rows={2} placeholder="Alt başlık / özet (isteğe bağlı)" className={girdi} />
        <input value={etiket} onChange={(e) => setEtiket(e.target.value)} placeholder="Etiket (boşsa türün adı yazılır)" className={girdi} />
      </div>

      {bilgiler.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-neutral-400">Bilgi kutuları (boş bırakılan görünmez)</div>
          {bilgiler.map((b, i) => (
            <div key={i} className="grid grid-cols-[96px_1fr] gap-2">
              <input
                value={b.etiket}
                onChange={(e) => setBilgiler((p) => p.map((x, j) => (j === i ? { ...x, etiket: e.target.value } : x)))}
                className={girdi}
              />
              <input
                value={b.deger}
                onChange={(e) => setBilgiler((p) => p.map((x, j) => (j === i ? { ...x, deger: e.target.value } : x)))}
                placeholder="Değer"
                className={girdi}
              />
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <div className="text-[11px] font-bold text-neutral-400">Görsel</div>
        {gorsel ? (
          <div className="flex items-center gap-3">
            <img src={gorsel} alt="" className="w-20 h-20 rounded-xl object-cover border border-neutral-700" />
            <button onClick={() => setGorsel('')} className="flex items-center gap-1.5 text-[12px] font-bold text-rose-400">
              <Trash2 className="w-4 h-4" /> Görseli kaldır
            </button>
          </div>
        ) : null}
        <label className="flex items-center justify-center gap-2 border border-dashed border-neutral-600 rounded-xl py-3 text-[12px] font-bold text-neutral-300 cursor-pointer">
          <ImagePlus className="w-4 h-4" /> {gorsel ? 'Başka görsel yükle' : 'Görsel yükle'}
          <input type="file" accept="image/*" onChange={dosyaSec} className="hidden" />
        </label>
        {tur === 'vefat' && <p className="text-[11px] text-neutral-500">Vefat edenin fotoğrafını ancak yakınlarının onayıyla ekleyin. Taziye telefonu karta eklenmez.</p>}
      </div>

      <button
        onClick={() => setAcik(true)}
        disabled={!baslik.trim()}
        className="w-full bg-gradient-to-r from-rose-600 to-amber-600 disabled:opacity-40 text-white font-black text-sm py-3 rounded-xl flex items-center justify-center gap-2"
      >
        <Sparkles className="w-4 h-4" /> Kartı oluştur (story / gönderi)
      </button>

      <PaylasimKartiModal acik={acik} onKapat={() => setAcik(false)} kart={kart} yol={yol} ozet={altBaslik} kampanya={`studyo_${tur}`} zSinif="z-[500]" />
    </div>
  );
};
