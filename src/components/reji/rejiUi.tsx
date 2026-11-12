import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Video } from 'lucide-react';
import type { NewsItem } from '../../types';
import type { Kaynak, KaynakTur, RejiAyar, RejiDurum } from '../../services/rejiService';
import { MAX_VIDEO_MB, uploadFile, uploadVideoFile } from '../../services/uploadService';

export const inputCls =
  'w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500';
export const btnBase = 'min-h-[48px] rounded-xl text-sm font-extrabold transition active:scale-[0.98] flex items-center justify-center gap-2 px-3';

/** Sekmeler arasında paylaşılan bağlam */
export interface RejiBaglam {
  token: string;
  durum: RejiDurum;
  ayar: RejiAyar;
  newsList: NewsItem[];
  /** Yayın belgesine yaz (iç içe nesneler birleştirilir) */
  yaz: (patch: Record<string, unknown>, tamam?: string) => Promise<void>;
  calistir: (fn: () => Promise<unknown>, tamam?: string, kilitle?: boolean) => Promise<void>;
  toast: (m: string) => void;
}

export const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="w-full flex items-center justify-between gap-3 text-left p-3 rounded-xl bg-neutral-900/70 border border-neutral-700"
  >
    <span className="text-sm font-bold text-neutral-100">{label}</span>
    <span className={`relative w-11 h-6 rounded-full shrink-0 transition ${checked ? 'bg-rose-600' : 'bg-neutral-600'}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
    </span>
  </button>
);

export const Bolum: React.FC<{ baslik: string; children: React.ReactNode }> = ({ baslik, children }) => (
  <section className="p-4 bg-neutral-800/60 rounded-2xl border border-neutral-700 space-y-3">
    <h3 className="text-[11px] font-black uppercase tracking-wider text-neutral-400">{baslik}</h3>
    {children}
  </section>
);

export const Etiket: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-[11px] font-bold text-neutral-400 mb-1">{children}</div>
);

/** Tek seçimli düğme grubu */
export function Chips<T extends string>({
  secenekler,
  deger,
  onChange,
  etiket,
}: {
  secenekler: { id: T; ad: string }[];
  deger: T;
  onChange: (v: T) => void;
  etiket: string;
}) {
  return (
    <div role="radiogroup" aria-label={etiket} className="flex flex-wrap gap-1.5">
      {secenekler.map((s) => (
        <button
          key={s.id}
          type="button"
          role="radio"
          aria-checked={deger === s.id}
          onClick={() => onChange(s.id)}
          className={`px-3 min-h-[40px] rounded-xl text-xs font-bold border transition ${
            deger === s.id ? 'bg-rose-600 border-rose-500 text-white' : 'bg-neutral-900 border-neutral-700 text-neutral-300'
          }`}
        >
          {s.ad}
        </button>
      ))}
    </div>
  );
}

/** Kaydırıcı: parmağı bırakınca (kısa gecikmeyle) kaydeder; her piksel için yazma yapmaz. */
export const Aralik: React.FC<{
  deger: number;
  min: number;
  max: number;
  adim?: number;
  etiket: string;
  birim?: string;
  onKaydet: (v: number) => void;
}> = ({ deger, min, max, adim = 1, etiket, birim = '', onKaydet }) => {
  const [v, setV] = useState(deger);
  const sonKaydedilen = useRef(deger);
  useEffect(() => {
    setV(deger);
    sonKaydedilen.current = deger;
  }, [deger]);
  useEffect(() => {
    if (v === sonKaydedilen.current) return;
    const t = setTimeout(() => {
      sonKaydedilen.current = v;
      onKaydet(v);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v]);
  return (
    <label className="flex items-center gap-3 text-xs text-neutral-300">
      <span className="w-24 shrink-0">{etiket}</span>
      <input aria-label={etiket} type="range" min={min} max={max} step={adim} value={v} onChange={(e) => setV(Number(e.target.value))} className="flex-1" />
      <span className="w-12 text-right tabular-nums">
        {v}
        {birim}
      </span>
    </label>
  );
};

export const TURLER: { id: KaynakTur; ad: string }[] = [
  { id: 'gorsel', ad: 'Görsel' },
  { id: 'video', ad: 'Video' },
  { id: 'youtube', ad: 'YouTube' },
  { id: 'web', ad: 'Web sayfası' },
];

/**
 * İçerik kaynağı seçici (görüntü içinde görüntü ve bölünmüş ekran için).
 * Görsel/video yüklenebilir ya da https bağlantısı yapıştırılır. YouTube bağlantısı, uygulama (mutlularhaber.com) sayfaları
 * ve https ile açılan web sayfaları gösterilebilir (bazı siteler başka sayfada gösterilmeyi engeller).
 */
export const KaynakAlani: React.FC<{ deger: Kaynak; onChange: (k: Kaynak) => void; toast: (m: string) => void; haberler?: NewsItem[] }> = ({
  deger,
  onChange,
  toast,
  haberler,
}) => {
  const gorselInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const [yuk, setYuk] = useState<string | null>(null);

  const yukle = async (f: File, video: boolean) => {
    setYuk(video ? 'Video yükleniyor 0%' : 'Yükleniyor…');
    try {
      const url = video ? await uploadVideoFile(f, (p) => setYuk(`Video yükleniyor ${p}%`)) : await uploadFile(f);
      onChange({ ...deger, type: video ? 'video' : 'gorsel', url });
      toast('Yüklendi');
    } catch (e: any) {
      toast(e?.message || 'Yüklenemedi.');
    } finally {
      setYuk(null);
    }
  };
  const gecerli = !deger.url || deger.type === 'youtube' || /^https:\/\//i.test(deger.url);
  return (
    <div className="space-y-2">
      <Chips etiket="İçerik türü" secenekler={TURLER} deger={deger.type} onChange={(t) => onChange({ ...deger, type: t })} />
      <input
        aria-label="İçerik bağlantısı"
        value={deger.url}
        onChange={(e) => onChange({ ...deger, url: e.target.value.trim() })}
        placeholder={deger.type === 'youtube' ? 'YouTube bağlantısı' : deger.type === 'web' ? 'https://… (sayfa adresi)' : 'https://… bağlantı veya yükle'}
        className={inputCls}
      />
      {!gecerli && <p className="text-[11px] text-amber-300">Bağlantı https:// ile başlamalı.</p>}
      {(deger.type === 'gorsel' || deger.type === 'video') && (
        <>
          <input ref={gorselInput} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void yukle(f, false); }} />
          <input ref={videoInput} type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void yukle(f, true); }} />
          <div className="grid grid-cols-2 gap-2">
            <button type="button" disabled={!!yuk} onClick={() => gorselInput.current?.click()} className={`${btnBase} bg-neutral-700 text-white disabled:opacity-50`}>
              <ImagePlus className="w-4 h-4" /> Görsel yükle
            </button>
            <button type="button" disabled={!!yuk} onClick={() => videoInput.current?.click()} className={`${btnBase} bg-neutral-700 text-white disabled:opacity-50`}>
              <Video className="w-4 h-4" /> Video yükle
            </button>
          </div>
          <p className="text-[11px] text-neutral-500">Video en fazla {MAX_VIDEO_MB} MB.</p>
        </>
      )}
      {yuk && <p className="text-xs text-emerald-300">{yuk}</p>}
      {(deger.type === 'video' || deger.type === 'youtube') && <Switch checked={!!deger.ses} onChange={(v) => onChange({ ...deger, ses: v })} label="Sesi açık" />}
      {haberler && haberler.length > 0 && (
        <select
          aria-label="Haberden al"
          defaultValue=""
          onChange={(e) => {
            const n = haberler.find((x) => x.id === e.target.value);
            if (!n) return;
            if (n.video && /youtu/.test(n.video)) onChange({ type: 'youtube', url: n.video, ses: deger.ses });
            else if (n.video) onChange({ type: 'video', url: n.video, ses: deger.ses });
            else if (n.image) onChange({ type: 'gorsel', url: n.image });
            else toast('Bu haberde görsel/video yok.');
            e.target.value = '';
          }}
          className={inputCls}
        >
          <option value="">Haberin görselini/videosunu al…</option>
          {haberler.slice(0, 30).map((n) => (
            <option key={n.id} value={n.id}>
              {n.title.slice(0, 60)}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

/** Açılır katman kartı */
export const Kart: React.FC<{ baslik: string; aciklama?: string; acik?: boolean; durum?: boolean; onDurum?: (v: boolean) => void; children: React.ReactNode }> = ({
  baslik,
  aciklama,
  acik = false,
  durum,
  onDurum,
  children,
}) => {
  const [a, setA] = useState(acik);
  return (
    <section className="bg-neutral-800/60 rounded-2xl border border-neutral-700 overflow-hidden">
      <div className="flex items-center gap-2 p-3">
        <button type="button" aria-expanded={a} onClick={() => setA(!a)} className="flex-1 text-left min-h-[44px]">
          <div className="text-sm font-black text-white">{baslik}</div>
          {aciklama && <div className="text-[11px] text-neutral-400">{aciklama}</div>}
        </button>
        {onDurum && (
          <button
            type="button"
            role="switch"
            aria-checked={!!durum}
            aria-label={`${baslik} göster/gizle`}
            onClick={() => onDurum(!durum)}
            className={`relative w-12 h-7 rounded-full shrink-0 transition ${durum ? 'bg-emerald-600' : 'bg-neutral-600'}`}
          >
            <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all ${durum ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        )}
        <button type="button" aria-label={a ? 'Kapat' : 'Aç'} onClick={() => setA(!a)} className="w-9 h-9 text-neutral-400 text-lg">
          {a ? '−' : '+'}
        </button>
      </div>
      {a && <div className="p-3 pt-0 space-y-3 border-t border-neutral-700/60">{children}</div>}
    </section>
  );
};
