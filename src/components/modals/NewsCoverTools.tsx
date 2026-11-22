import React, { useEffect, useRef, useState } from 'react';
import { Film, Wand2, Upload, Loader2, ImagePlus } from 'lucide-react';
import { ImageCropField } from '../ImageCropField';
import { kapakUret, dosyaOku } from '../../utils/kapak';
import { gorselKucult } from '../../utils/gorsel';
import { youtubeId } from '../../utils/newsVideo';

interface Props {
  video: string;
  /** Şu anki kapak (data: veya adres) */
  kapak: string;
  baslik: string;
  kategori: string;
  onKapak: (v: string) => void;
}

type Sekme = 'kare' | 'hazirla' | 'yukle';

const Anahtar: React.FC<{ acik: boolean; onClick: () => void; children: React.ReactNode }> = ({ acik, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition ${
      acik ? 'bg-rose-600 text-white border-rose-600' : 'bg-neutral-900 text-neutral-300 border-neutral-700'
    }`}
  >
    {children}
  </button>
);

/** Video haberlerin kapak görseli: videodan kare seç, uygulamada hazırla ya da hazır görsel yükle. */
export const NewsCoverTools: React.FC<Props> = ({ video, kapak, baslik, kategori, onKapak }) => {
  const yt = !!youtubeId(video);
  const [sekme, setSekme] = useState<Sekme>(yt ? 'hazirla' : 'kare');
  const [hata, setHata] = useState('');
  const [mesgul, setMesgul] = useState(false);

  // --- Videodan kare ---
  const vRef = useRef<HTMLVideoElement>(null);
  const [sure, setSure] = useState(0);
  const [konum, setKonum] = useState(0);
  const [kare, setKare] = useState<string | null>(null);

  // --- Hazırla ---
  const [taban, setTaban] = useState<string | null>(null);
  const [baslikGoster, setBaslikGoster] = useState(true);
  const [etiketGoster, setEtiketGoster] = useState(true);
  const [logoGoster, setLogoGoster] = useState(true);
  const [onizleme, setOnizleme] = useState('');
  const dosyaRef = useRef<HTMLInputElement>(null);

  const kareAl = (): string | null => {
    const v = vRef.current;
    if (!v || !v.videoWidth) return null;
    const c = document.createElement('canvas');
    const oran = Math.min(1, 1280 / v.videoWidth);
    c.width = Math.round(v.videoWidth * oran);
    c.height = Math.round(v.videoHeight * oran);
    c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height);
    try {
      return c.toDataURL('image/jpeg', 0.88); // CORS izni yoksa burada hata verir
    } catch {
      return null;
    }
  };

  // Seçilen kare, üstüne yalnızca oynat simgesi konarak doğrudan kapak olur
  const karesiniKapakYap = async () => {
    setHata('');
    const k = kareAl();
    if (!k) return setHata('Bu videodan kare alınamadı. "Hazır görsel yükle" sekmesini kullanın.');
    setKare(k);
    try {
      onKapak(await kapakUret({ taban: k, baslik: '', kategori: '', baslikGoster: false, etiketGoster: false, logoGoster: false }));
    } catch (e: any) {
      setHata(e?.message || 'Kapak hazırlanamadı.');
    }
  };
  const karesiniSablonaAl = () => {
    setHata('');
    const k = kareAl();
    if (!k) return setHata('Bu videodan kare alınamadı. "Hazırla" sekmesinde dosyadan görsel seçin.');
    setKare(k);
    setTaban(k);
    setSekme('hazirla');
  };

  // Şablon önizlemesi (taban veya seçenekler değişince)
  useEffect(() => {
    if (sekme !== 'hazirla') return;
    let iptal = false;
    setMesgul(true);
    kapakUret({ taban, baslik, kategori, baslikGoster, etiketGoster, logoGoster })
      .then((u) => {
        if (!iptal) {
          setOnizleme(u);
          setHata('');
        }
      })
      .catch((e) => !iptal && setHata(e?.message || 'Kapak hazırlanamadı.'))
      .finally(() => !iptal && setMesgul(false));
    return () => {
      iptal = true;
    };
  }, [sekme, taban, baslik, kategori, baslikGoster, etiketGoster, logoGoster]);

  const dosyaSec = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!f.type.startsWith('image/')) return setHata('Lütfen bir görsel seçin.');
    setTaban(await gorselKucult(await dosyaOku(f), 1600));
  };

  const uygula = () => {
    if (onizleme) {
      onKapak(onizleme);
      setHata('');
    }
  };

  return (
    <div className="rounded-xl border border-neutral-700 bg-neutral-900/60 p-2.5 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-black text-neutral-200">Kapak görseli</span>
        {kapak && <img src={kapak} alt="Mevcut kapak" className="h-9 aspect-video object-cover rounded border border-neutral-600" />}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Anahtar acik={sekme === 'kare'} onClick={() => setSekme('kare')}>
          <Film className="w-3 h-3 inline -mt-0.5 mr-1" />
          Videodan kare
        </Anahtar>
        <Anahtar acik={sekme === 'hazirla'} onClick={() => setSekme('hazirla')}>
          <Wand2 className="w-3 h-3 inline -mt-0.5 mr-1" />
          Hazırla
        </Anahtar>
        <Anahtar acik={sekme === 'yukle'} onClick={() => setSekme('yukle')}>
          <Upload className="w-3 h-3 inline -mt-0.5 mr-1" />
          Hazır görsel yükle
        </Anahtar>
      </div>

      {sekme === 'kare' &&
        (yt ? (
          <p className="text-[11px] text-neutral-400 leading-snug">
            YouTube videolarından kare alınamaz (tarayıcı izin vermiyor). "Hazırla" sekmesinde bir fotoğraf seçip başlıklı kapak yapabilir ya da hazır görsel yükleyebilirsiniz.
          </p>
        ) : (
          <div className="space-y-2">
            <video
              ref={vRef}
              src={video}
              crossOrigin="anonymous"
              muted
              playsInline
              preload="auto"
              onLoadedMetadata={(e) => setSure((e.currentTarget as HTMLVideoElement).duration || 0)}
              className="w-full rounded-lg bg-black aspect-video"
            />
            <input
              type="range"
              min={0}
              max={Math.max(0.1, sure)}
              step={0.1}
              value={konum}
              onChange={(e) => {
                const t = Number(e.target.value);
                setKonum(t);
                if (vRef.current) vRef.current.currentTime = t;
              }}
              className="w-full"
              aria-label="Video karesi"
            />
            <div className="text-[10.5px] text-neutral-400">{konum.toFixed(1)} sn / {sure ? sure.toFixed(1) : '…'} sn</div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={karesiniKapakYap} className="py-2 rounded-lg bg-rose-600 text-white text-[11.5px] font-bold">
                Bu kareyi kapak yap (oynat simgeli)
              </button>
              <button type="button" onClick={karesiniSablonaAl} className="py-2 rounded-lg bg-neutral-700 text-white text-[11.5px] font-bold">
                Şablona al (başlık ekle)
              </button>
            </div>
          </div>
        ))}

      {sekme === 'hazirla' && (
        <div className="space-y-2">
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
            {onizleme ? <img src={onizleme} alt="Kapak önizleme" className="w-full h-full object-cover" /> : null}
            {mesgul && <Loader2 className="w-5 h-5 animate-spin text-white absolute" />}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" onClick={() => dosyaRef.current?.click()} className="px-2.5 py-1.5 rounded-lg bg-neutral-700 text-white text-[11px] font-bold flex items-center gap-1">
              <ImagePlus className="w-3.5 h-3.5" /> {taban ? 'Görseli değiştir' : 'Fotoğraf seç'}
            </button>
            {kare && (
              <button type="button" onClick={() => setTaban(kare)} className="px-2.5 py-1.5 rounded-lg bg-neutral-700 text-white text-[11px] font-bold">
                Seçtiğim video karesi
              </button>
            )}
            {taban && (
              <button type="button" onClick={() => setTaban(null)} className="px-2.5 py-1.5 rounded-lg border border-neutral-600 text-neutral-300 text-[11px] font-bold">
                Görselsiz (renkli zemin)
              </button>
            )}
            <input ref={dosyaRef} type="file" accept="image/*" className="hidden" onChange={dosyaSec} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Anahtar acik={baslikGoster} onClick={() => setBaslikGoster((v) => !v)}>Başlık</Anahtar>
            <Anahtar acik={etiketGoster} onClick={() => setEtiketGoster((v) => !v)}>Kategori etiketi</Anahtar>
            <Anahtar acik={logoGoster} onClick={() => setLogoGoster((v) => !v)}>Logo</Anahtar>
          </div>
          <button type="button" onClick={uygula} disabled={!onizleme || mesgul} className="w-full py-2 rounded-lg bg-rose-600 disabled:opacity-50 text-white text-[12px] font-black">
            Bu kapağı kullan
          </button>
        </div>
      )}

      {sekme === 'yukle' && (
        <div className="bg-white rounded-lg p-2">
          <ImageCropField value={kapak} onChange={onKapak} aspect={16 / 9} outputWidth={1280} hint="Hazır görselinizi seçin, 16:9 kadrajı ayarlayın." />
        </div>
      )}

      {hata && <p className="text-[11px] text-rose-300 font-semibold">{hata}</p>}
      <p className="text-[10.5px] text-neutral-500 leading-snug">Kapak; haber listesinde, video başlamadan önce ve paylaşım kartında görünür. Kaydedince otomatik küçültülüp yüklenir.</p>
    </div>
  );
};
