import React, { useEffect, useMemo, useState } from 'react';
import { X, Share2, Download, Copy, Loader2, ImagePlus, Trash2 } from 'lucide-react';
import {
  indir,
  izlemeliLink,
  kartPaylas,
  kartUret,
  KANAL_ETIKET,
  paylasimMetni,
  type KartBicim,
  type KartVeri,
  type PaylasimKanal,
} from '../services/paylasimService';
import { analitikOlay } from '../services/analitikService';

interface Props {
  acik: boolean;
  onKapat: () => void;
  kart: KartVeri;
  /** Sitedeki adres yolu, ör. /haber/abc123 */
  yol: string;
  ozet?: string;
  kampanya?: string;
}

const KANALLAR: PaylasimKanal[] = ['whatsapp', 'instagram', 'facebook', 'telegram', 'twitter'];

export const PaylasimKartiModal: React.FC<Props> = ({ acik, onKapat, kart, yol, ozet, kampanya = 'kart' }) => {
  const [bicim, setBicim] = useState<KartBicim>('kare');
  const [kanal, setKanal] = useState<PaylasimKanal>('whatsapp');
  const [blob, setBlob] = useState<Blob | null>(null);
  const [onizleme, setOnizleme] = useState<string>('');
  const [uretiliyor, setUretiliyor] = useState(false);
  const [bilgi, setBilgi] = useState('');
  // undefined = haberin kendi görseli, null = görselsiz, string = kullanıcının seçtiği dosya
  const [ozelGorsel, setOzelGorsel] = useState<string | null | undefined>(undefined);
  const [odak, setOdak] = useState(0.5);
  const dosyaRef = React.useRef<HTMLInputElement>(null);

  const etkin: KartVeri = useMemo(() => {
    const g = ozelGorsel === undefined ? kart.gorsel : ozelGorsel || undefined;
    return { ...kart, gorsel: g, gorselOdak: odak, gorselZorla: typeof ozelGorsel === 'string' };
  }, [kart, ozelGorsel, odak]);
  const etkinAnahtar = JSON.stringify(etkin);

  const gorselSec = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!f.type.startsWith('image/')) return setBilgi('Lütfen bir görsel dosyası seçin.');
    if (f.size > 15 * 1024 * 1024) return setBilgi('Görsel çok büyük (en fazla 15 MB).');
    setOzelGorsel((eski) => {
      if (typeof eski === 'string') URL.revokeObjectURL(eski);
      return URL.createObjectURL(f);
    });
    setOdak(0.5);
    setBilgi('');
  };

  const link = useMemo(() => izlemeliLink(yol, kanal, kampanya), [yol, kanal, kampanya]);
  const metin = useMemo(() => paylasimMetni(kart.baslik, ozet, link, kanal), [kart.baslik, ozet, link, kanal]);

  useEffect(() => {
    if (!acik) return;
    let iptal = false;
    setUretiliyor(true);
    setBilgi('');
    kartUret(etkin, bicim)
      .then((b) => {
        if (iptal) return;
        setBlob(b);
        setOnizleme((eski) => {
          if (eski) URL.revokeObjectURL(eski);
          return URL.createObjectURL(b);
        });
      })
      .catch(() => !iptal && setBilgi('Kart üretilemedi.'))
      .finally(() => !iptal && setUretiliyor(false));
    return () => {
      iptal = true;
    };
  }, [acik, bicim, etkinAnahtar]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { if (onizleme) URL.revokeObjectURL(onizleme); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!acik) return null;

  const paylas = async () => {
    if (!blob) return;
    analitikOlay(`paylas_kart_${kanal}`);
    const s = await kartPaylas(blob, metin.replace(link, '').trim(), link);
    if (s === 'indirildi') setBilgi('Görsel indirildi. Şimdi seçtiğiniz uygulamada paylaşabilirsiniz; metin kopyalanabilir.');
    if (s === 'hata') setBilgi('Paylaşım açılamadı. Görseli indirip metni kopyalayarak paylaşabilirsiniz.');
  };
  const kopyala = async () => {
    try {
      await navigator.clipboard.writeText(metin);
      setBilgi('Metin kopyalandı.');
    } catch {
      setBilgi('Kopyalanamadı.');
    }
  };

  return (
    <div className="fixed inset-0 z-[96] bg-black/70 flex items-end sm:items-center justify-center" role="dialog" aria-label="Paylaşım kartı">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[94vh] flex flex-col overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-100">
          <h2 className="text-sm font-black text-neutral-900">Sosyal medya kartı</h2>
          <button onClick={onKapat} aria-label="Kapat" className="p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
          <div className="flex justify-center bg-neutral-100 rounded-2xl p-2 min-h-[180px] items-center">
            {uretiliyor || !onizleme ? (
              <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
            ) : (
              <img src={onizleme} alt="Kart önizleme" className={`rounded-xl shadow ${bicim === 'story' ? 'max-h-[44vh]' : 'max-h-[40vh]'} w-auto`} />
            )}
          </div>

          <div className="flex gap-2 text-[12px] font-bold">
            {(['kare', 'story'] as KartBicim[]).map((b) => (
              <button
                key={b}
                onClick={() => setBicim(b)}
                className={`flex-1 py-2 rounded-xl border ${bicim === b ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-300 text-neutral-700'}`}
              >
                {b === 'kare' ? 'Kare (gönderi)' : 'Story (dikey)'}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-neutral-200 p-2.5 space-y-2">
            <div className="flex gap-2">
              <button onClick={() => dosyaRef.current?.click()} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-neutral-900 text-white text-[12px] font-bold">
                <ImagePlus className="w-4 h-4" /> {ozelGorsel ? 'Görseli değiştir' : 'Görsel ekle'}
              </button>
              {(ozelGorsel !== null && (ozelGorsel || kart.gorsel)) && (
                <button onClick={() => setOzelGorsel(null)} className="px-3 flex items-center gap-1.5 py-2 rounded-lg border border-neutral-300 text-[12px] font-bold text-neutral-700">
                  <Trash2 className="w-4 h-4" /> Kaldır
                </button>
              )}
              {ozelGorsel !== undefined && kart.gorsel && (
                <button onClick={() => setOzelGorsel(undefined)} className="px-3 py-2 rounded-lg border border-neutral-300 text-[12px] font-bold text-neutral-700">
                  Haberin görseli
                </button>
              )}
            </div>
            <input ref={dosyaRef} type="file" accept="image/*" className="hidden" onChange={gorselSec} />
            {etkin.gorsel && (
              <label className="flex items-center gap-2 text-[11px] font-bold text-neutral-500">
                Konum
                <input type="range" min={0} max={1} step={0.05} value={odak} onChange={(e) => setOdak(Number(e.target.value))} className="flex-1" />
                <span>{odak < 0.34 ? 'Üst' : odak > 0.66 ? 'Alt' : 'Orta'}</span>
              </label>
            )}
          </div>

          <div>
            <div className="text-[11px] font-bold text-neutral-500 mb-1.5">Nereye paylaşacaksınız? (bağlantı izlenir)</div>
            <div className="flex flex-wrap gap-1.5">
              {KANALLAR.map((k) => (
                <button
                  key={k}
                  onClick={() => setKanal(k)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-bold border ${kanal === k ? 'bg-rose-600 text-white border-rose-600' : 'border-neutral-300 text-neutral-700'}`}
                >
                  {KANAL_ETIKET[k]}
                </button>
              ))}
            </div>
          </div>

          <textarea readOnly value={metin} rows={5} className="w-full text-[12px] border border-neutral-200 rounded-xl p-2.5 bg-neutral-50 text-neutral-700" />
          {bilgi && <p className="text-[11px] font-bold text-amber-700">{bilgi}</p>}
        </div>

        <div className="p-3 border-t border-neutral-100 grid grid-cols-3 gap-2" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
          <button onClick={paylas} disabled={!blob} className="col-span-3 bg-rose-600 disabled:opacity-50 text-white font-black text-sm py-3 rounded-xl flex items-center justify-center gap-2">
            <Share2 className="w-4 h-4" /> Kartı paylaş
          </button>
          <button onClick={() => blob && indir(blob)} disabled={!blob} className="col-span-2 border border-neutral-300 text-neutral-800 font-bold text-[12px] py-2.5 rounded-xl flex items-center justify-center gap-1.5">
            <Download className="w-4 h-4" /> Görseli indir
          </button>
          <button onClick={kopyala} className="border border-neutral-300 text-neutral-800 font-bold text-[12px] py-2.5 rounded-xl flex items-center justify-center gap-1.5">
            <Copy className="w-4 h-4" /> Metin
          </button>
        </div>
      </div>
    </div>
  );
};
