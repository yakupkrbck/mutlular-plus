import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Download, Eye, EyeOff, ListPlus, Pencil, Play, RefreshCw, Send, Siren, SkipBack, SkipForward, Trash2, Upload } from 'lucide-react';
import type { NewsItem } from '../../types';
import {
  KATEGORILER,
  RejiAyar,
  RejiBaslik,
  RejiDurum,
  ayarYaz,
  katmanAdresi,
  panelAdresi,
  rejiKurulum,
  rejiYaz,
  sonrakiIndeks,
  tickerHaberlerden,
  tokenYenile,
  useRejiAyar,
  useRejiYayin,
  yedekCoz,
  yedekOlustur,
} from '../../services/rejiService';
import { Bolum, Switch, btnBase, inputCls, type RejiBaglam } from './rejiUi';
import { EkranSekmesi, GorunumSekmesi, KatmanlarSekmesi } from './RejiKatmanlar';

interface RejiPanelProps {
  /** Haberlerden başlık doldurma ve otomatik kayan yazı için */
  newsList: NewsItem[];
  showToast?: (msg: string) => void;
}

type Sekme = 'yayin' | 'baslik' | 'katman' | 'ekran' | 'gorunum' | 'baglanti';
const SEKMELER: { id: Sekme; ad: string }[] = [
  { id: 'yayin', ad: 'Yayın' },
  { id: 'baslik', ad: 'Başlık' },
  { id: 'katman', ad: 'Katmanlar' },
  { id: 'ekran', ad: 'Ekran' },
  { id: 'gorunum', ad: 'Görünüm' },
  { id: 'baglanti', ad: 'Bağlantı' },
];

/** Hızlı kontrol: [yol, ad] — her biri bir katmanın görünürlüğüdür */
const GORUNURLUK: { k: keyof RejiDurum; ad: string }[] = [
  { k: 'top', ad: 'Canlı etiketi' },
  { k: 'brand', ad: 'Logo' },
  { k: 'kj', ad: 'Alt bant' },
  { k: 'ticker', ad: 'Kayan yazı' },
  { k: 'konusmaci', ad: 'İsimlik' },
  { k: 'zaman', ad: 'Tarih/saat' },
  { k: 'baslik', ad: 'Başlık bandı' },
  { k: 'pip', ad: 'Pencere (PiP)' },
  { k: 'split', ad: 'Bölünmüş' },
  { k: 'tam', ad: 'Tam ekran' },
];

export const RejiPanel: React.FC<RejiPanelProps> = ({ newsList, showToast }) => {
  const { ayar, hazir, hata } = useRejiAyar();
  const token = ayar?.token;
  const durum: RejiDurum | null = useRejiYayin(token);
  const kurulumBasladi = useRef(false);
  const ilkYukleme = useRef(false);

  const [kurulumHata, setKurulumHata] = useState<string | null>(null);
  const [sekme, setSekme] = useState<Sekme>('yayin');
  const [dikey, setDikey] = useState(false);
  const [onizAcik, setOnizAcik] = useState(true);
  const [kat, setKat] = useState('GÜNDEM');
  const [baslik, setBaslik] = useState('');
  const [alt, setAlt] = useState('');
  const [duzenlenen, setDuzenlenen] = useState<string | null>(null);
  const [tickerMetin, setTickerMetin] = useState('');
  const [hiz, setHiz] = useState(8);
  const [busy, setBusy] = useState(false);
  const yedekInput = useRef<HTMLInputElement>(null);

  const toast = (m: string) => showToast?.(m);

  // İlk kurulum: anahtar ve yayın belgesi yoksa oluştur
  useEffect(() => {
    if (hazir && !ayar && !hata && !kurulumBasladi.current) {
      kurulumBasladi.current = true;
      rejiKurulum().catch(() => setKurulumHata('Reji kurulamadı. Yetkinizi ve bağlantınızı kontrol edin.'));
    }
  }, [hazir, ayar, hata]);

  // Kayıtlı değerleri forma bir kez yansıt (yazarken üzerine yazılmasın)
  useEffect(() => {
    if (!durum || ilkYukleme.current) return;
    ilkYukleme.current = true;
    setKat(durum.kj.category || 'GÜNDEM');
    setTickerMetin(durum.ticker.items.join('\n'));
    setHiz(durum.ticker.speed || 8);
  }, [durum]);

  // Otomatik kayan yazı: açıkken son haberlerden (son dakika önce) doldurulur; değişiklik yoksa yazılmaz
  const otomatikSatirlar = useMemo(
    () => (ayar?.tickerOtomatik ? tickerHaberlerden(newsList, ayar.tickerAdet) : null),
    [ayar?.tickerOtomatik, ayar?.tickerAdet, newsList]
  );
  const mevcutSatirlar = durum ? JSON.stringify(durum.ticker.items) : null;
  useEffect(() => {
    if (!token || !otomatikSatirlar || mevcutSatirlar === null) return;
    if (JSON.stringify(otomatikSatirlar) === mevcutSatirlar) return;
    const t = setTimeout(() => {
      rejiYaz(token, { ticker: { items: otomatikSatirlar } }).catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [token, otomatikSatirlar, mevcutSatirlar]);

  // Canlı yayında peş peşe dokunuşlar yutulmaz (son yazılan geçerli olur). Yalnızca ağır işlemler
  // (yükleme, yedek, anahtar yenileme) çift tıklamaya karşı kilitlenir.
  const calistir = async (fn: () => Promise<unknown>, tamam?: string, kilitle = false) => {
    if (kilitle && busy) return;
    if (kilitle) setBusy(true);
    try {
      await fn();
      if (tamam) toast(tamam);
    } catch (e: any) {
      toast(e?.message?.includes('permission') ? 'Bu işlem için yetkiniz yok.' : e?.message && !/firestore|network/i.test(e.message) ? e.message : 'İşlem yapılamadı. Bağlantınızı kontrol edin.');
    } finally {
      if (kilitle) setBusy(false);
    }
  };

  if (hata) return <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-200 text-sm" role="alert">{hata}</div>;
  if (kurulumHata) return <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-200 text-sm" role="alert">{kurulumHata}</div>;
  if (!hazir || !ayar || !token || !durum) return <div className="p-6 text-center text-sm text-neutral-400">Reji hazırlanıyor…</div>;

  const yaz = (patch: Record<string, unknown>, tamam?: string) => calistir(() => rejiYaz(token, patch), tamam);
  const k: RejiBaglam = { token, durum, ayar, newsList, yaz, calistir, toast };

  const playlist = ayar.playlist;
  const gorunur = (key: keyof RejiDurum) => !!(durum[key] as any)?.visible;
  const hepsiGorunur = GORUNURLUK.filter((g) => !['pip', 'split', 'tam', 'konusmaci', 'zaman', 'baslik'].includes(g.k)).every((g) => gorunur(g.k));

  const gonder = () => {
    if (!baslik.trim()) return toast('Önce bir başlık yazın.');
    return yaz({ kj: { category: kat.trim().toLocaleUpperCase('tr-TR') || 'GÜNDEM', title: baslik.trim(), sub: alt.trim(), visible: true } }, 'Yayına gönderildi');
  };
  const haberdenDoldur = (id: string) => {
    const n = newsList.find((x) => x.id === id);
    if (!n) return;
    setKat((n.category || 'GÜNDEM').toLocaleUpperCase('tr-TR'));
    setBaslik(n.title);
    setAlt((n.summary || '').slice(0, 110));
  };
  const listeyeEkle = () => {
    if (!baslik.trim()) return toast('Önce bir başlık yazın.');
    const yeni: RejiBaslik = { id: duzenlenen || `b${Date.now()}`, category: kat.trim().toLocaleUpperCase('tr-TR') || 'GÜNDEM', title: baslik.trim(), sub: alt.trim() };
    const liste = duzenlenen ? playlist.map((p) => (p.id === duzenlenen ? yeni : p)) : [...playlist, yeni];
    setDuzenlenen(null);
    return calistir(() => ayarYaz({ playlist: liste }), duzenlenen ? 'Liste güncellendi' : 'Listeye eklendi');
  };
  const yayinaAl = (i: number) => {
    const p = playlist[i];
    if (!p) return;
    return calistir(async () => {
      await rejiYaz(token, { kj: { category: p.category, title: p.title, sub: p.sub, visible: true } });
      await ayarYaz({ plIndex: i });
    });
  };
  const gez = (d: number) => {
    const i = sonrakiIndeks(ayar.plIndex, playlist.length, d);
    if (i >= 0) yayinaAl(i);
  };
  const sil = (id: string) => {
    const liste = playlist.filter((p) => p.id !== id);
    return calistir(() => ayarYaz({ playlist: liste, plIndex: Math.min(ayar.plIndex, liste.length - 1) }), 'Silindi');
  };
  const tickerKaydet = () => {
    const items = tickerMetin.split('\n').map((x) => x.trim()).filter(Boolean);
    return yaz({ ticker: { items, speed: hiz } }, 'Kayan yazı güncellendi');
  };
  const kopyala = async () => {
    try {
      await navigator.clipboard.writeText(katmanAdresi(token));
      toast('Bağlantı kopyalandı');
    } catch {
      toast('Kopyalanamadı, bağlantıyı elle seçin.');
    }
  };
  const anahtarYenile = () => {
    if (!window.confirm('Yeni anahtar üretilsin mi? Eski bağlantı çalışmaz olur, PRISM/OBS içindeki adresi güncellemeniz gerekir.')) return;
    return calistir(() => tokenYenile(token, durum), 'Yeni anahtar üretildi', true);
  };
  const yedekIndir = () => {
    const blob = new Blob([JSON.stringify(yedekOlustur(ayar as RejiAyar, durum), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reji-yedek.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const yedekYukle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const y = yedekCoz(await f.text());
      await calistir(async () => {
        await ayarYaz({ playlist: y.ayar.playlist, tickerOtomatik: y.ayar.tickerOtomatik, tickerAdet: y.ayar.tickerAdet, konusmacilar: y.ayar.konusmacilar ?? [], plIndex: -1 });
        await rejiYaz(token, { ...y.durum });
      }, 'Yedek yüklendi', true);
    } catch {
      toast('Geçersiz yedek dosyası.');
    }
  };

  const onizleme = `/reji/katman.html?t=${encodeURIComponent(token)}`;

  return (
    <div className="space-y-4 text-white">
      {/* Önizleme (sekmeler değişirken görünür kalır) */}
      <div className="sticky top-0 z-20 -mx-1 px-1 pt-1 pb-2 bg-neutral-950/95 backdrop-blur border-b border-neutral-800">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 flex-1">Yayındaki görüntü</span>
          <button type="button" onClick={() => setDikey(!dikey)} className="text-[11px] font-bold px-2 py-1 rounded-lg bg-neutral-800 text-neutral-300">
            {dikey ? 'Dikey 9:16' : 'Yatay 16:9'}
          </button>
          <button type="button" aria-expanded={onizAcik} onClick={() => setOnizAcik(!onizAcik)} className="text-[11px] font-bold px-2 py-1 rounded-lg bg-neutral-800 text-neutral-300">
            {onizAcik ? 'Gizle' : 'Göster'}
          </button>
        </div>
        {onizAcik && (
          <div
            className={`mx-auto rounded-xl overflow-hidden border border-neutral-700 ${dikey ? 'aspect-[9/16] max-h-[230px]' : 'aspect-video w-full max-w-[420px]'}`}
            style={{ backgroundImage: 'repeating-conic-gradient(#3a3a3a 0% 25%, #2a2a2a 0% 50%)', backgroundSize: '20px 20px' }}
          >
            <iframe title="Yayın önizlemesi" src={onizleme} className="w-full h-full border-0" />
          </div>
        )}
        <div className="mt-2 flex gap-1 overflow-x-auto no-scrollbar" role="tablist" aria-label="Reji bölümleri">
          {SEKMELER.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={sekme === t.id}
              onClick={() => setSekme(t.id)}
              className={`px-3.5 min-h-[40px] rounded-xl text-xs font-black whitespace-nowrap ${sekme === t.id ? 'bg-rose-600 text-white' : 'bg-neutral-800 text-neutral-300'}`}
            >
              {t.ad}
            </button>
          ))}
        </div>
      </div>

      {sekme === 'yayin' && (
        <div className="space-y-4">
          <Bolum baslik="Hızlı kontrol">
            <button
              type="button"
              aria-pressed={durum.breaking}
              onClick={() => yaz({ breaking: !durum.breaking })}
              className={`${btnBase} w-full min-h-[56px] text-base ${durum.breaking ? 'bg-red-600 text-white animate-pulse' : 'bg-neutral-700 text-neutral-100'}`}
            >
              <Siren className="w-5 h-5" />
              {durum.breaking ? 'SON DAKİKA AÇIK (kapatmak için dokun)' : 'SON DAKİKA MODU'}
            </button>
            <div className="grid grid-cols-2 gap-2">
              {GORUNURLUK.map(({ k: key, ad }) => {
                const g = gorunur(key);
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={g}
                    onClick={() => yaz({ [key]: { visible: !g } })}
                    className={`${btnBase} justify-start ${g ? 'bg-emerald-700 text-white' : 'bg-neutral-700 text-neutral-300'}`}
                  >
                    {g ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span className="text-xs">{ad}</span>
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => yaz({ top: { visible: !hepsiGorunur }, brand: { visible: !hepsiGorunur }, kj: { visible: !hepsiGorunur }, ticker: { visible: !hepsiGorunur } })}
                className={`${btnBase} bg-neutral-700 text-neutral-100`}
              >
                {hepsiGorunur ? 'Ana grafikleri gizle' : 'Ana grafikleri göster'}
              </button>
              <button
                type="button"
                onClick={() =>
                  yaz({
                    top: { visible: false }, brand: { visible: false }, kj: { visible: false }, ticker: { visible: false }, konusmaci: { visible: false },
                    zaman: { visible: false }, baslik: { visible: false }, pip: { visible: false }, split: { visible: false }, tam: { visible: false }, breaking: false,
                  }, 'Ekran temizlendi')
                }
                className={`${btnBase} bg-neutral-700 text-rose-300`}
              >
                Temiz görüntü
              </button>
            </div>
            <p className="text-[11px] text-neutral-500">Katmanların görünümünü ve ayrıntılarını "Katmanlar", "Ekran" ve "Görünüm" sekmelerinden değiştirirsiniz.</p>
          </Bolum>
        </div>
      )}

      {sekme === 'baslik' && (
        <div className="space-y-4">
          <Bolum baslik="Haber başlığı (alt bant)">
            <select aria-label="Haberden doldur" defaultValue="" onChange={(e) => e.target.value && haberdenDoldur(e.target.value)} className={inputCls}>
              <option value="">Haberlerden doldur…</option>
              {newsList.slice(0, 30).map((n) => (
                <option key={n.id} value={n.id}>
                  {n.title.slice(0, 70)}
                </option>
              ))}
            </select>
            <input aria-label="Kategori" list="reji-kategoriler" value={kat} onChange={(e) => setKat(e.target.value)} placeholder="Kategori (GÜNDEM)" className={inputCls} />
            <datalist id="reji-kategoriler">
              {KATEGORILER.map((x) => (
                <option key={x} value={x} />
              ))}
            </datalist>
            <input aria-label="Başlık" value={baslik} onChange={(e) => setBaslik(e.target.value)} placeholder="Başlık" className={inputCls} />
            <input aria-label="Alt açıklama" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Alt açıklama (isteğe bağlı)" className={inputCls} />
            <button type="button" onClick={gonder} className={`${btnBase} w-full min-h-[56px] bg-rose-600 hover:bg-rose-500 text-white text-base`}>
              <Send className="w-5 h-5" />
              YAYINA GÖNDER
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={listeyeEkle} className={`${btnBase} bg-neutral-700 text-neutral-100`}>
                <ListPlus className="w-4 h-4" />
                {duzenlenen ? 'Listeyi güncelle' : 'Listeye ekle'}
              </button>
              <button type="button" onClick={() => yaz({ kj: { title: '', sub: '' } }, 'Alt bant temizlendi')} className={`${btnBase} bg-neutral-700 text-neutral-100`}>
                Bandı temizle
              </button>
            </div>
          </Bolum>

          <Bolum baslik={`Hazır başlıklar (${playlist.length})`}>
            {playlist.length === 0 && <p className="text-xs text-neutral-500">Listede başlık yok. Yukarıdan yazıp "Listeye ekle" deyin.</p>}
            <ul className="space-y-2">
              {playlist.map((p, i) => (
                <li key={p.id} className={`p-3 rounded-xl border ${i === ayar.plIndex ? 'border-rose-500 bg-rose-500/10' : 'border-neutral-700 bg-neutral-900/60'}`}>
                  <div className="text-[10px] font-black text-neutral-400">{p.category}</div>
                  <div className="text-sm font-bold">{p.title}</div>
                  {p.sub && <div className="text-xs text-neutral-400">{p.sub}</div>}
                  <div className="flex gap-2 mt-2">
                    <button type="button" aria-label={`Yayına al: ${p.title}`} onClick={() => yayinaAl(i)} className={`${btnBase} flex-1 bg-emerald-700 text-white`}>
                      <Play className="w-4 h-4" />
                      Yayına al
                    </button>
                    <button
                      type="button"
                      aria-label={`Düzenle: ${p.title}`}
                      onClick={() => {
                        setKat(p.category);
                        setBaslik(p.title);
                        setAlt(p.sub);
                        setDuzenlenen(p.id);
                      }}
                      className={`${btnBase} bg-neutral-700 text-white`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button type="button" aria-label={`Sil: ${p.title}`} onClick={() => sil(p.id)} className={`${btnBase} bg-neutral-700 text-rose-300`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {playlist.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => gez(-1)} className={`${btnBase} bg-neutral-700 text-white`}>
                  <SkipBack className="w-4 h-4" />
                  Önceki
                </button>
                <button type="button" onClick={() => gez(1)} className={`${btnBase} bg-neutral-700 text-white`}>
                  Sonraki
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            )}
          </Bolum>

          <Bolum baslik="Kayan yazı satırları">
            <Switch
              checked={ayar.tickerOtomatik}
              onChange={(v) => calistir(() => ayarYaz({ tickerOtomatik: v }), v ? 'Son haberlerden otomatik dolacak' : 'Otomatik doldurma kapandı')}
              label="Son haberlerden otomatik doldur"
            />
            {ayar.tickerOtomatik ? (
              <label className="flex items-center gap-2 text-xs text-neutral-300">
                Satır sayısı
                <select aria-label="Satır sayısı" value={ayar.tickerAdet} onChange={(e) => calistir(() => ayarYaz({ tickerAdet: Number(e.target.value) }))} className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1">
                  {[3, 5, 8, 10, 15].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                (son dakika haberler öne alınır; panel açıkken güncellenir)
              </label>
            ) : (
              <>
                <textarea aria-label="Kayan yazı satırları" rows={5} value={tickerMetin} onChange={(e) => setTickerMetin(e.target.value)} placeholder="Her satıra bir haber" className={inputCls} />
                <label className="flex items-center gap-3 text-xs text-neutral-300">
                  Hız
                  <input aria-label="Kayan yazı hızı" type="range" min={3} max={20} value={hiz} onChange={(e) => setHiz(Number(e.target.value))} className="flex-1" />
                  {hiz}
                </label>
                <button type="button" onClick={tickerKaydet} className={`${btnBase} w-full bg-neutral-700 text-white`}>
                  Kayan yazıyı güncelle
                </button>
              </>
            )}
            <div className="text-[11px] text-neutral-500">Şu an yayında: {durum.ticker.items.length} satır</div>
          </Bolum>
        </div>
      )}

      {sekme === 'katman' && <KatmanlarSekmesi k={k} />}
      {sekme === 'ekran' && <EkranSekmesi k={k} />}
      {sekme === 'gorunum' && <GorunumSekmesi k={k} />}

      {sekme === 'baglanti' && (
        <div className="space-y-4">
          <Bolum baslik="Yayın programına bağlama (PRISM / OBS)">
            <input aria-label="Katman bağlantısı" readOnly value={katmanAdresi(token)} onFocus={(e) => e.currentTarget.select()} className={`${inputCls} text-xs font-mono`} />
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={kopyala} className={`${btnBase} bg-neutral-700 text-white`}>
                <Copy className="w-4 h-4" />
                Bağlantıyı kopyala
              </button>
              <button type="button" onClick={anahtarYenile} className={`${btnBase} bg-neutral-700 text-rose-300`}>
                <RefreshCw className="w-4 h-4" />
                Yeni anahtar
              </button>
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-[11.5px] text-neutral-400 leading-snug">
              <li>PRISM Live Studio / OBS'de kaynak ekle → <b>Web (Browser / Widget) kaynağı</b>.</li>
              <li>Yukarıdaki bağlantıyı yapıştır. Yatay yayında <b>1920×1080</b>, dikey yayında <b>1080×1920</b> yaz.</li>
              <li>Arka plan şeffaf gelir; kamera görüntüsünün üstüne biner. Panelden yaptığın değişiklikler birkaç saniye içinde yansır (çoğunlukla anında).</li>
              <li>Önce bağlantının sonuna <b>&amp;demo=1</b> ekleyerek örnek grafikle deneyebilirsin. <b>&amp;debug=1</b> ile sağ kenarda bağlantı durumu ("canlı" / "yoklama") yazar.</li>
              <li>Bu bağlantıyı kimseyle paylaşma; paylaşıldıysa "Yeni anahtar" ile değiştir.</li>
            </ol>
            <div className="text-[11px] text-neutral-500">Reji paneli adresi (ikinci telefon için): {panelAdresi()}</div>
          </Bolum>

          <Bolum baslik="Yedek">
            <input ref={yedekInput} type="file" accept="application/json,.json" className="hidden" onChange={yedekYukle} />
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={yedekIndir} className={`${btnBase} bg-neutral-700 text-white`}>
                <Download className="w-4 h-4" />
                Yedek indir
              </button>
              <button type="button" onClick={() => yedekInput.current?.click()} className={`${btnBase} bg-neutral-700 text-white`}>
                <Upload className="w-4 h-4" />
                Yedek yükle
              </button>
            </div>
          </Bolum>
        </div>
      )}
    </div>
  );
};
