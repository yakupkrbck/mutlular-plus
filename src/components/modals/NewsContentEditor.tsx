import React, { useRef, useState } from 'react';
import { ImagePlus, Plus, Trash2, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { blokAyir, blokBirlestir, dosyadanKucukGorsel, hafifGorsel, type HaberBlok } from '../../utils/gorsel';
import { uploadDataUrl } from '../../services/uploadService';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const inputCls =
  'w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 font-medium';

/** Haber metni editörü: paragraf ve görsel blokları. Çıktı düz metindir (görseller [[img:url|alt yazı]] satırı). */
export const NewsContentEditor: React.FC<Props> = ({ value, onChange }) => {
  // Boş paragraf satırı da düzenlenebilsin diye yerel blok listesi tutulur; dışarıya birleştirilmiş metin gider.
  const [bloklar, setBloklar] = useState<HaberBlok[]>(() => {
    const b = blokAyir(value);
    return b.length ? b : [{ t: 'p', metin: '' }];
  });
  const [yukleniyor, setYukleniyor] = useState<number | null>(null);
  const [hata, setHata] = useState('');
  const dosyaRef = useRef<HTMLInputElement>(null);
  const hedef = useRef(0);

  const yaz = (yeni: HaberBlok[]) => {
    setBloklar(yeni);
    onChange(blokBirlestir(yeni));
  };
  const guncelle = (i: number, b: HaberBlok) => yaz(bloklar.map((x, k) => (k === i ? b : x)));
  const sil = (i: number) => yaz(bloklar.filter((_, k) => k !== i));
  const tasi = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= bloklar.length) return;
    const k = [...bloklar];
    [k[i], k[j]] = [k[j], k[i]];
    yaz(k);
  };
  const paragrafEkle = (i: number) => {
    const k = [...bloklar];
    k.splice(i, 0, { t: 'p', metin: '' });
    setBloklar(k); // boş paragraf metne yansımaz
  };

  const gorselSec = (i: number) => {
    hedef.current = i;
    dosyaRef.current?.click();
  };
  const dosyaGeldi = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!f.type.startsWith('image/')) return setHata('Lütfen bir fotoğraf seçin.');
    if (f.size > 20 * 1024 * 1024) return setHata('Fotoğraf çok büyük (en fazla 20 MB).');
    setHata('');
    const i = hedef.current;
    setYukleniyor(i);
    try {
      const url = await uploadDataUrl(await dosyadanKucukGorsel(f));
      const k = [...bloklar];
      k.splice(i, 0, { t: 'img', url, yazi: '' });
      yaz(k);
    } catch (err: any) {
      setHata(err?.message || 'Fotoğraf yüklenemedi.');
    } finally {
      setYukleniyor(null);
    }
  };

  const EkleSerit: React.FC<{ i: number }> = ({ i }) => (
    <div className="flex gap-1.5">
      <button
        type="button"
        onClick={() => gorselSec(i)}
        disabled={yukleniyor !== null}
        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-rose-500/70 text-rose-300 hover:text-white hover:border-rose-400 text-[11px] font-bold disabled:opacity-50"
      >
        {yukleniyor === i ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
        {yukleniyor === i ? 'Yükleniyor…' : 'Buraya görsel ekle'}
      </button>
      <button
        type="button"
        onClick={() => paragrafEkle(i)}
        className="px-3 flex items-center gap-1 py-1.5 rounded-lg border border-dashed border-neutral-600 text-neutral-400 hover:text-white text-[11px] font-bold"
      >
        <Plus className="w-3.5 h-3.5" /> Paragraf
      </button>
    </div>
  );

  return (
    <div className="space-y-1.5">
      <input ref={dosyaRef} type="file" accept="image/*" className="hidden" onChange={dosyaGeldi} />
      <EkleSerit i={0} />
      {bloklar.map((b, i) => (
        <React.Fragment key={i}>
          {b.t === 'p' ? (
            <div className="relative">
              <textarea
                rows={4}
                value={b.metin}
                onChange={(e) => guncelle(i, { t: 'p', metin: e.target.value })}
                placeholder="Paragraf metni…"
                className={inputCls}
              />
              <div className="absolute right-1.5 top-1.5 flex gap-0.5">
                <button type="button" onClick={() => tasi(i, -1)} className="p-1 rounded bg-neutral-800 text-neutral-300" aria-label="Yukarı">
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button type="button" onClick={() => tasi(i, 1)} className="p-1 rounded bg-neutral-800 text-neutral-300" aria-label="Aşağı">
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button type="button" onClick={() => sil(i)} className="p-1 rounded bg-neutral-800 text-rose-300" aria-label="Sil">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-500/60 bg-amber-500/10 p-2 space-y-1.5">
              <div className="flex items-start gap-2">
                <img src={hafifGorsel(b.url, 320)} alt="" className="w-24 h-16 rounded-lg object-cover bg-neutral-800 shrink-0" />
                <input
                  type="text"
                  value={b.yazi}
                  maxLength={120}
                  onChange={(e) => guncelle(i, { ...b, yazi: e.target.value })}
                  placeholder="Alt yazı (isteğe bağlı)"
                  className={inputCls}
                />
              </div>
              <div className="flex justify-end gap-1">
                <button type="button" onClick={() => tasi(i, -1)} className="p-1.5 rounded bg-neutral-800 text-neutral-300" aria-label="Yukarı">
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => tasi(i, 1)} className="p-1.5 rounded bg-neutral-800 text-neutral-300" aria-label="Aşağı">
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => sil(i)} className="p-1.5 rounded bg-neutral-800 text-rose-300" aria-label="Sil">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
          <EkleSerit i={i + 1} />
        </React.Fragment>
      ))}
      {hata && <p className="text-[11px] text-rose-300 font-semibold">{hata}</p>}
      <p className="text-[10.5px] text-neutral-500 leading-snug">Görseller yüklenmeden önce otomatik küçültülür (en uzun kenar 1600 px).</p>
    </div>
  );
};
