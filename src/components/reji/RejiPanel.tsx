import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Eye, EyeOff, ListPlus, Pencil, Play, RefreshCw, SkipBack, SkipForward, Trash2, Download, Upload, Send, Siren } from 'lucide-react';
import type { NewsItem } from '../../types';
import { uploadFile } from '../../services/uploadService';
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

interface RejiPanelProps {
  /** Haberlerden başlık doldurma ve otomatik kayan yazı için */
  newsList: NewsItem[];
  showToast?: (msg: string) => void;
}

const inputCls =
  'w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500';
const btnBase = 'min-h-[48px] rounded-xl text-sm font-extrabold transition active:scale-[0.98] flex items-center justify-center gap-2 px-3';

const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
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

const Bolum: React.FC<{ baslik: string; children: React.ReactNode }> = ({ baslik, children }) => (
  <section className="p-4 bg-neutral-800/60 rounded-2xl border border-neutral-700 space-y-3">
    <h3 className="text-[11px] font-black uppercase tracking-wider text-neutral-400">{baslik}</h3>
    {children}
  </section>
);

export const RejiPanel: React.FC<RejiPanelProps> = ({ newsList, showToast }) => {
  const { ayar, hazir, hata } = useRejiAyar();
  const token = ayar?.token;
  const durum: RejiDurum | null = useRejiYayin(token);
  const kurulumBasladi = useRef(false);
  const ilkYukleme = useRef(false);

  const [kurulumHata, setKurulumHata] = useState<string | null>(null);
  const [dikey, setDikey] = useState(false);
  const [kat, setKat] = useState('GÜNDEM');
  const [baslik, setBaslik] = useState('');
  const [alt, setAlt] = useState('');
  const [duzenlenen, setDuzenlenen] = useState<string | null>(null);
  const [tickerMetin, setTickerMetin] = useState('');
  const [hiz, setHiz] = useState(8);
  const [markaAd, setMarkaAd] = useState('');
  const [konum, setKonum] = useState('');
  const [canliYazi, setCanliYazi] = useState('');
  const [renkNormal, setRenkNormal] = useState('#0b3d91');
  const [renkSon, setRenkSon] = useState('#c8102e');
  const [busy, setBusy] = useState(false);
  const yedekInput = useRef<HTMLInputElement>(null);
  const logoInput = useRef<HTMLInputElement>(null);

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
    setMarkaAd(durum.brand.name);
    setKonum(durum.top.location);
    setCanliYazi(durum.top.liveText);
    setRenkNormal(durum.theme.normal);
    setRenkSon(durum.theme.breaking);
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
  // (logo yükleme, yedek yükleme, anahtar yenileme) çift tıklamaya karşı kilitlenir.
  const calistir = async (fn: () => Promise<unknown>, tamam?: string, kilitle = false) => {
    if (kilitle && busy) return;
    if (kilitle) setBusy(true);
    try {
      await fn();
      if (tamam) toast(tamam);
    } catch (e: any) {
      toast(e?.message?.includes('permission') ? 'Bu işlem için yetkiniz yok.' : 'İşlem yapılamadı. Bağlantınızı kontrol edin.');
    } finally {
      if (kilitle) setBusy(false);
    }
  };

  if (hata) return <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-200 text-sm" role="alert">{hata}</div>;
  if (kurulumHata) return <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-200 text-sm" role="alert">{kurulumHata}</div>;
  if (!hazir || !ayar || !token || !durum) return <div className="p-6 text-center text-sm text-neutral-400">Reji hazırlanıyor…</div>;

  const playlist = ayar.playlist;
  const hepsiGorunur = durum.top.visible && durum.kj.visible && durum.ticker.visible;

  const gonder = () => {
    if (!baslik.trim()) return toast('Önce bir başlık yazın.');
    return calistir(
      () => rejiYaz(token, { kj: { category: kat.trim().toLocaleUpperCase('tr-TR') || 'GÜNDEM', title: baslik.trim(), sub: alt.trim(), visible: true } }),
      'Yayına gönderildi'
    );
  };
  const havaDoldur = (id: string) => {
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
    return calistir(() => rejiYaz(token, { ticker: { items, speed: hiz } }), 'Kayan yazı güncellendi');
  };
  const ayarKaydet = () =>
    calistir(
      () => rejiYaz(token, { brand: { name: markaAd.trim() || 'MUTLULAR HABER' }, top: { location: konum.trim(), liveText: canliYazi.trim() || 'CANLI' }, theme: { normal: renkNormal, breaking: renkSon } }),
      'Ayarlar kaydedildi'
    );
  const logoSec = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    await calistir(async () => {
      const url = await uploadFile(f);
      await rejiYaz(token, { brand: { logo: url } });
    }, 'Logo yüklendi', true);
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
        await ayarYaz({ playlist: y.ayar.playlist, tickerOtomatik: y.ayar.tickerOtomatik, tickerAdet: y.ayar.tickerAdet, plIndex: -1 });
        await rejiYaz(token, { ...y.durum });
      }, 'Yedek yüklendi', true);
    } catch {
      toast('Geçersiz yedek dosyası.');
    }
  };

  const onizleme = `/reji/katman.html?t=${encodeURIComponent(token)}`;

  return (
    <div className="space-y-4 text-white">
      {/* Önizleme */}
      <Bolum baslik="Yayındaki görüntü (önizleme)">
        <div className="flex gap-1 p-1 rounded-xl bg-neutral-900 border border-neutral-700" role="radiogroup" aria-label="Önizleme yönü">
          {([[false, 'Yatay 16:9'], [true, 'Dikey 9:16']] as const).map(([v, t]) => (
            <button key={t} type="button" role="radio" aria-checked={dikey === v} onClick={() => setDikey(v)} className={`flex-1 py-2 rounded-lg text-xs font-bold ${dikey === v ? 'bg-rose-600 text-white' : 'text-neutral-400'}`}>
              {t}
            </button>
          ))}
        </div>
        <div
          className={`mx-auto rounded-xl overflow-hidden border border-neutral-700 ${dikey ? 'aspect-[9/16] max-w-[210px]' : 'aspect-video w-full'}`}
          style={{ backgroundImage: 'repeating-conic-gradient(#3a3a3a 0% 25%, #2a2a2a 0% 50%)', backgroundSize: '20px 20px' }}
        >
          <iframe title="Yayın önizlemesi" src={onizleme} className="w-full h-full border-0" />
        </div>
      </Bolum>

      {/* Hızlı kontrol */}
      <Bolum baslik="Hızlı kontrol">
        <button
          type="button"
          aria-pressed={durum.breaking}
          onClick={() => calistir(() => rejiYaz(token, { breaking: !durum.breaking }))}
          className={`${btnBase} w-full min-h-[56px] text-base ${durum.breaking ? 'bg-red-600 text-white animate-pulse' : 'bg-neutral-700 text-neutral-100'}`}
        >
          <Siren className="w-5 h-5" />
          {durum.breaking ? 'SON DAKİKA AÇIK (kapatmak için dokun)' : 'SON DAKİKA MODU'}
        </button>
        <div className="grid grid-cols-3 gap-2">
          {([
            ['top', 'Üst bant', durum.top.visible],
            ['kj', 'Ana bant', durum.kj.visible],
            ['ticker', 'Kayan yazı', durum.ticker.visible],
          ] as const).map(([k, t, g]) => (
            <button
              key={k}
              type="button"
              aria-pressed={g}
              onClick={() => calistir(() => rejiYaz(token, { [k]: { visible: !g } }))}
              className={`${btnBase} flex-col ${g ? 'bg-emerald-700 text-white' : 'bg-neutral-700 text-neutral-300'}`}
            >
              {g ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="text-xs">{t}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => calistir(() => rejiYaz(token, { top: { visible: !hepsiGorunur }, kj: { visible: !hepsiGorunur }, ticker: { visible: !hepsiGorunur } }))}
          className={`${btnBase} w-full bg-neutral-700 text-neutral-100`}
        >
          {hepsiGorunur ? 'Hepsini gizle (tam ekran görüntü)' : 'Hepsini göster'}
        </button>
      </Bolum>

      {/* Haber başlığı */}
      <Bolum baslik="Haber başlığı (ana bant)">
        <select aria-label="Haberden doldur" defaultValue="" onChange={(e) => e.target.value && havaDoldur(e.target.value)} className={inputCls}>
          <option value="">Haberlerden doldur…</option>
          {newsList.slice(0, 30).map((n) => (
            <option key={n.id} value={n.id}>
              {n.title.slice(0, 70)}
            </option>
          ))}
        </select>
        <input aria-label="Kategori" list="reji-kategoriler" value={kat} onChange={(e) => setKat(e.target.value)} placeholder="Kategori (GÜNDEM)" className={inputCls} />
        <datalist id="reji-kategoriler">
          {KATEGORILER.map((k) => (
            <option key={k} value={k} />
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
          <button type="button" onClick={() => calistir(() => rejiYaz(token, { kj: { title: '', sub: '' } }), 'Ana bant temizlendi')} className={`${btnBase} bg-neutral-700 text-neutral-100`}>
            Bandı temizle
          </button>
        </div>
      </Bolum>

      {/* Playlist */}
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

      {/* Kayan yazı */}
      <Bolum baslik="Kayan yazı">
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
            (son dakika haberler öne alınır)
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

      {/* Kanal ayarları */}
      <Bolum baslik="Kanal ayarları">
        <input aria-label="Kanal adı" value={markaAd} onChange={(e) => setMarkaAd(e.target.value)} placeholder="Kanal adı" className={inputCls} />
        <input aria-label="Konum" value={konum} onChange={(e) => setKonum(e.target.value)} placeholder="Konum (OSMANGAZİ / BURSA)" className={inputCls} />
        <input aria-label="Canlı etiketi" value={canliYazi} onChange={(e) => setCanliYazi(e.target.value)} placeholder="Canlı etiketi (CANLI)" className={inputCls} />
        <div className="grid grid-cols-2 gap-2 text-xs text-neutral-300">
          <label className="flex items-center gap-2">
            Normal renk
            <input aria-label="Normal renk" type="color" value={renkNormal} onChange={(e) => setRenkNormal(e.target.value)} />
          </label>
          <label className="flex items-center gap-2">
            Son dakika
            <input aria-label="Son dakika rengi" type="color" value={renkSon} onChange={(e) => setRenkSon(e.target.value)} />
          </label>
        </div>
        <input ref={logoInput} type="file" accept="image/*" className="hidden" onChange={logoSec} />
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => logoInput.current?.click()} className={`${btnBase} bg-neutral-700 text-white`}>
            {durum.brand.logo ? 'Logoyu değiştir' : 'Logo yükle'}
          </button>
          {durum.brand.logo && (
            <button type="button" onClick={() => calistir(() => rejiYaz(token, { brand: { logo: '' } }), 'Logo kaldırıldı')} className={`${btnBase} bg-neutral-700 text-rose-300`}>
              Logoyu kaldır
            </button>
          )}
        </div>
        <button type="button" onClick={ayarKaydet} className={`${btnBase} w-full bg-rose-600 text-white`}>
          Ayarları kaydet
        </button>
      </Bolum>

      {/* Bağlantılar */}
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
          <li>PRISM Live Studio / OBS'de kaynak ekle → <b>Web (Browser) kaynağı</b>.</li>
          <li>Yukarıdaki bağlantıyı yapıştır. Yatay yayında <b>1920×1080</b>, dikey yayında <b>1080×1920</b> yaz.</li>
          <li>Arka plan şeffaf gelir; kamera görüntüsünün üstüne biner. Bu panelden yaptığın her değişiklik anında yansır.</li>
          <li>Önce <b>?demo=1</b> ekleyerek (bağlantının sonuna) örnek grafikle deneyebilirsin.</li>
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
  );
};
