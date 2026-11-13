import React, { useRef, useState } from 'react';
import { Check, ImagePlus, Play, Plus, Save, Trash2, X } from 'lucide-react';
import {
  KATMANLAR,
  PAKETLER,
  YAZI_TIPLERI,
  ayarYaz,
  type Kaynak,
  type KatmanTanim,
  type RejiDurum,
  type RejiKonusmaci,
  type RejiVaryant,
} from '../../services/rejiService';
import { uploadFile } from '../../services/uploadService';
import { Aralik, Bolum, Chips, Etiket, Kart, KaynakAlani, Switch, btnBase, inputCls, type RejiBaglam } from './rejiUi';

const KOSE4 = [
  { id: 'sol-ust', ad: 'Sol üst' },
  { id: 'sag-ust', ad: 'Sağ üst' },
  { id: 'sol-alt', ad: 'Sol alt' },
  { id: 'sag-alt', ad: 'Sağ alt' },
] as const;
const KOSE2 = [
  { id: 'sol-ust', ad: 'Sol üst' },
  { id: 'sag-ust', ad: 'Sağ üst' },
] as const;

const tanim = (a: keyof RejiVaryant): KatmanTanim => KATMANLAR.find((k) => k.anahtar === a)!;

/** Bir katmanın hazır görünümleri (varyantları) */
const Varyant: React.FC<{ k: RejiBaglam; anahtar: keyof RejiVaryant }> = ({ k, anahtar }) => (
  <div>
    <Etiket>Görünüm</Etiket>
    <Chips etiket={`${tanim(anahtar).ad} görünümü`} secenekler={tanim(anahtar).varyantlar} deger={k.durum.v[anahtar]} onChange={(id) => k.yaz({ v: { [anahtar]: id } })} />
  </div>
);

const GorselYukle: React.FC<{ k: RejiBaglam; onUrl: (u: string) => void }> = ({ k, onUrl }) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (f) void k.calistir(async () => onUrl(await uploadFile(f)), 'Görsel yüklendi', true);
        }}
      />
      <button type="button" onClick={() => ref.current?.click()} className={`${btnBase} bg-neutral-700 text-white w-full`}>
        <ImagePlus className="w-4 h-4" /> Görsel yükle
      </button>
    </>
  );
};

/* ---------------------------------------------------------------- KATMANLAR */

const KonusmaciKarti: React.FC<{ k: RejiBaglam }> = ({ k }) => {
  const c = k.durum.konusmaci;
  const [ad, setAd] = useState(c.name);
  const [unvan, setUnvan] = useState(c.title);
  const liste = k.ayar.konusmacilar;
  const yayinla = (n = ad, t = unvan) => {
    if (!n.trim()) return k.toast('Önce bir isim yazın.');
    return k.yaz({ konusmaci: { name: n.trim(), title: t.trim(), visible: true } }, 'İsimlik yayında');
  };
  const kaydet = () => {
    if (!ad.trim()) return k.toast('Önce bir isim yazın.');
    const yeni: RejiKonusmaci = { id: `k${Date.now()}`, name: ad.trim(), title: unvan.trim() };
    return k.calistir(() => ayarYaz({ konusmacilar: [...liste, yeni] }), 'Konuşmacı listeye eklendi');
  };
  return (
    <Kart baslik="Konuşmacı İsimliği" aciklama="Konuşan kişinin adı ve unvanı" durum={c.visible} onDurum={(v) => k.yaz({ konusmaci: { visible: v } })}>
      <Varyant k={k} anahtar="konusmaci" />
      <input aria-label="Konuşmacı adı" value={ad} onChange={(e) => setAd(e.target.value)} placeholder="Ad Soyad" className={inputCls} />
      <input aria-label="Konuşmacı unvanı" value={unvan} onChange={(e) => setUnvan(e.target.value)} placeholder="Unvan (Mahalle Muhtarı)" className={inputCls} />
      <div>
        <Etiket>Konum</Etiket>
        <Chips etiket="İsimlik konumu" secenekler={[{ id: 'sol', ad: 'Sol' }, { id: 'sag', ad: 'Sağ' }]} deger={c.position} onChange={(p) => k.yaz({ konusmaci: { position: p } })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => yayinla()} className={`${btnBase} bg-rose-600 text-white`}>
          <Play className="w-4 h-4" /> Yayına al
        </button>
        <button type="button" onClick={kaydet} className={`${btnBase} bg-neutral-700 text-white`}>
          <Plus className="w-4 h-4" /> Listeye ekle
        </button>
      </div>
      {liste.length > 0 && (
        <ul className="space-y-1.5">
          {liste.map((x) => (
            <li key={x.id} className="flex items-center gap-2 p-2 rounded-xl bg-neutral-900/70 border border-neutral-700">
              <button
                type="button"
                className="flex-1 text-left min-h-[40px]"
                onClick={() => {
                  setAd(x.name);
                  setUnvan(x.title);
                  void yayinla(x.name, x.title);
                }}
              >
                <div className="text-sm font-bold">{x.name}</div>
                <div className="text-[11px] text-neutral-400">{x.title}</div>
              </button>
              <button type="button" aria-label={`Sil: ${x.name}`} onClick={() => k.calistir(() => ayarYaz({ konusmacilar: liste.filter((y) => y.id !== x.id) }), 'Silindi')} className="w-10 h-10 text-rose-300">
                <Trash2 className="w-4 h-4 mx-auto" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Kart>
  );
};

const CanliKarti: React.FC<{ k: RejiBaglam }> = ({ k }) => {
  const t = k.durum.top;
  const [yazi, setYazi] = useState(t.liveText);
  const [konum, setKonum] = useState(t.location);
  return (
    <Kart baslik="Canlı Yayın Etiketi + Konum" aciklama="CANLI rozeti ve konum bilgisi" durum={t.visible} onDurum={(v) => k.yaz({ top: { visible: v } })}>
      <Varyant k={k} anahtar="live" />
      <input aria-label="Canlı etiketi" value={yazi} onChange={(e) => setYazi(e.target.value)} placeholder="Canlı etiketi (CANLI)" className={inputCls} />
      <input aria-label="Konum" value={konum} onChange={(e) => setKonum(e.target.value)} placeholder="Konum (OSMANGAZİ / BURSA)" className={inputCls} />
      <Switch checked={t.showLive} onChange={(v) => k.yaz({ top: { showLive: v } })} label="CANLI rozetini göster" />
      <Switch checked={t.showLoc} onChange={(v) => k.yaz({ top: { showLoc: v } })} label="Konum bilgisini göster" />
      <div>
        <Etiket>Köşe</Etiket>
        <Chips etiket="Canlı etiketi köşesi" secenekler={[...KOSE2]} deger={t.position} onChange={(p) => k.yaz({ top: { position: p } })} />
      </div>
      <button type="button" onClick={() => k.yaz({ top: { liveText: yazi.trim() || 'CANLI', location: konum.trim() } }, 'Kaydedildi')} className={`${btnBase} w-full bg-rose-600 text-white`}>
        <Save className="w-4 h-4" /> Kaydet
      </button>
    </Kart>
  );
};

const LogoKarti: React.FC<{ k: RejiBaglam }> = ({ k }) => {
  const b = k.durum.brand;
  const [ad, setAd] = useState(b.name);
  return (
    <Kart baslik="Kanal Logosu" aciklama="Logo veya kanal adı" durum={b.visible} onDurum={(v) => k.yaz({ brand: { visible: v } })}>
      <Varyant k={k} anahtar="logo" />
      <input aria-label="Kanal adı" value={ad} onChange={(e) => setAd(e.target.value)} placeholder="Kanal adı (logo yoksa görünür)" className={inputCls} />
      <button type="button" onClick={() => k.yaz({ brand: { name: ad.trim() || 'MUTLULAR HABER' } }, 'Kaydedildi')} className={`${btnBase} w-full bg-neutral-700 text-white`}>
        <Save className="w-4 h-4" /> Adı kaydet
      </button>
      <div className="grid grid-cols-2 gap-2">
        <GorselYukle k={k} onUrl={(u) => void k.yaz({ brand: { logo: u } })} />
        {b.logo && (
          <button type="button" onClick={() => k.yaz({ brand: { logo: '' } }, 'Logo kaldırıldı')} className={`${btnBase} bg-neutral-700 text-rose-300`}>
            Logoyu kaldır
          </button>
        )}
      </div>
      <Aralik etiket="Boyut" deger={b.size} min={0.5} max={2} adim={0.1} birim="×" onKaydet={(v) => k.yaz({ brand: { size: v } })} />
      <div>
        <Etiket>Köşe</Etiket>
        <Chips etiket="Logo köşesi" secenekler={[...KOSE2]} deger={b.position} onChange={(p) => k.yaz({ brand: { position: p } })} />
      </div>
    </Kart>
  );
};

const TickerKarti: React.FC<{ k: RejiBaglam }> = ({ k }) => {
  const t = k.durum.ticker;
  const [etiket, setEtiket] = useState(t.label);
  return (
    <Kart baslik="Kayan Yazı" aciklama="Satırları 'Başlık' sekmesinden girersiniz" durum={t.visible} onDurum={(v) => k.yaz({ ticker: { visible: v } })}>
      <Varyant k={k} anahtar="ticker" />
      <Switch checked={t.clock} onChange={(v) => k.yaz({ ticker: { clock: v } })} label="Sağda saati göster" />
      <input aria-label="Kayan yazı etiketi" value={etiket} onChange={(e) => setEtiket(e.target.value)} placeholder="Etiket (SON HABERLER) — 'Etiketli' görünümde çıkar" className={inputCls} />
      <button type="button" onClick={() => k.yaz({ ticker: { label: etiket.trim() } }, 'Kaydedildi')} className={`${btnBase} w-full bg-neutral-700 text-white`}>
        <Save className="w-4 h-4" /> Etiketi kaydet
      </button>
    </Kart>
  );
};

const AltBantKarti: React.FC<{ k: RejiBaglam }> = ({ k }) => (
  <Kart baslik="Alt Bant (ana bant)" aciklama="Başlık içeriğini 'Başlık' sekmesinden girersiniz" durum={k.durum.kj.visible} onDurum={(v) => k.yaz({ kj: { visible: v } })}>
    <Varyant k={k} anahtar="kj" />
  </Kart>
);

const SonDakikaKarti: React.FC<{ k: RejiBaglam }> = ({ k }) => {
  const [metin, setMetin] = useState(k.durum.sd.text);
  return (
    <Kart baslik="Son Dakika Bandı" aciklama="'Son dakika modu' açılınca görünür" durum={k.durum.breaking} onDurum={(v) => k.yaz({ breaking: v })}>
      <Varyant k={k} anahtar="sd" />
      <input aria-label="Son dakika metni" value={metin} onChange={(e) => setMetin(e.target.value)} placeholder="Bant metni (boşsa ana bant başlığı kullanılır)" className={inputCls} />
      <button type="button" onClick={() => k.yaz({ sd: { text: metin.trim() } }, 'Kaydedildi')} className={`${btnBase} w-full bg-neutral-700 text-white`}>
        <Save className="w-4 h-4" /> Metni kaydet
      </button>
    </Kart>
  );
};

const ZamanKarti: React.FC<{ k: RejiBaglam }> = ({ k }) => (
  <Kart baslik="Tarih ve Saat" aciklama="Köşede tarih / saat göstergesi" durum={k.durum.zaman.visible} onDurum={(v) => k.yaz({ zaman: { visible: v } })}>
    <Varyant k={k} anahtar="zaman" />
    <div>
      <Etiket>Gösterilen</Etiket>
      <Chips
        etiket="Tarih saat biçimi"
        secenekler={[{ id: 'saat', ad: 'Saat' }, { id: 'saniye', ad: 'Saat + saniye' }, { id: 'tarih', ad: 'Tarih' }, { id: 'tarihsaat', ad: 'Tarih + saat' }]}
        deger={k.durum.zaman.mode}
        onChange={(m) => k.yaz({ zaman: { mode: m } })}
      />
    </div>
    <div>
      <Etiket>Köşe</Etiket>
      <Chips etiket="Tarih saat köşesi" secenekler={[...KOSE2]} deger={k.durum.zaman.position} onChange={(p) => k.yaz({ zaman: { position: p } })} />
    </div>
  </Kart>
);

const BaslikBandiKarti: React.FC<{ k: RejiBaglam }> = ({ k }) => {
  const b = k.durum.baslik;
  const [metin, setMetin] = useState(b.text);
  return (
    <Kart baslik="Haber Başlığı Bandı" aciklama="Tek satırlık ayrı başlık şeridi" durum={b.visible} onDurum={(v) => k.yaz({ baslik: { visible: v } })}>
      <Varyant k={k} anahtar="baslik" />
      <input aria-label="Başlık bandı metni" value={metin} onChange={(e) => setMetin(e.target.value)} placeholder="Başlık metni" className={inputCls} />
      <div>
        <Etiket>Yer</Etiket>
        <Chips etiket="Başlık bandı yeri" secenekler={[{ id: 'alt', ad: 'Altta' }, { id: 'ust', ad: 'Üstte' }]} deger={b.position} onChange={(p) => k.yaz({ baslik: { position: p } })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => (metin.trim() ? k.yaz({ baslik: { text: metin.trim(), visible: true } }, 'Yayında') : k.toast('Önce metin yazın.'))} className={`${btnBase} bg-rose-600 text-white`}>
          <Play className="w-4 h-4" /> Yayına al
        </button>
        <button type="button" onClick={() => k.yaz({ baslik: { visible: false } })} className={`${btnBase} bg-neutral-700 text-white`}>
          <X className="w-4 h-4" /> Kapat
        </button>
      </div>
    </Kart>
  );
};

export const KatmanlarSekmesi: React.FC<{ k: RejiBaglam }> = ({ k }) => (
  <div className="space-y-3">
    <p className="text-xs text-neutral-400">Her katmanı açıp kapatabilir, hazır görünümlerden birini seçebilir ve ayrıntılarını değiştirebilirsiniz. Değişiklikler yukarıdaki önizlemede anında görünür.</p>
    <AltBantKarti k={k} />
    <TickerKarti k={k} />
    <LogoKarti k={k} />
    <SonDakikaKarti k={k} />
    <KonusmaciKarti k={k} />
    <CanliKarti k={k} />
    <ZamanKarti k={k} />
    <BaslikBandiKarti k={k} />
  </div>
);

/* -------------------------------------------------------------------- EKRAN */

const TamEkranKarti: React.FC<{ k: RejiBaglam }> = ({ k }) => {
  const t = k.durum.tam;
  const [etiket, setEtiket] = useState(t.label);
  const [baslik, setBaslik] = useState(t.title);
  const [metin, setMetin] = useState(t.text);
  const [gorsel, setGorsel] = useState(t.image);
  const [bg, setBg] = useState(t.bg || k.durum.theme.normal);
  const doldur = (id: string) => {
    const n = k.newsList.find((x) => x.id === id);
    if (!n) return;
    setEtiket((n.category || 'GÜNDEM').toLocaleUpperCase('tr-TR'));
    setBaslik(n.title);
    setMetin((n.summary || '').slice(0, 180));
    setGorsel(n.image || '');
  };
  return (
    <Kart baslik="Tam Ekran Haber Grafiği" aciklama="Görüntünün tamamını kaplayan haber kartı" acik durum={t.visible} onDurum={(v) => k.yaz({ tam: { visible: v } })}>
      <Varyant k={k} anahtar="tam" />
      <select aria-label="Haberden doldur" defaultValue="" onChange={(e) => e.target.value && doldur(e.target.value)} className={inputCls}>
        <option value="">Haberlerden doldur…</option>
        {k.newsList.slice(0, 30).map((n) => (
          <option key={n.id} value={n.id}>
            {n.title.slice(0, 70)}
          </option>
        ))}
      </select>
      <input aria-label="Etiket" value={etiket} onChange={(e) => setEtiket(e.target.value)} placeholder="Etiket (ÖZEL HABER)" className={inputCls} />
      <input aria-label="Tam ekran başlık" value={baslik} onChange={(e) => setBaslik(e.target.value)} placeholder="Başlık" className={inputCls} />
      <textarea aria-label="Tam ekran metin" rows={3} value={metin} onChange={(e) => setMetin(e.target.value)} placeholder="Açıklama (isteğe bağlı)" className={inputCls} />
      <input aria-label="Görsel bağlantısı" value={gorsel} onChange={(e) => setGorsel(e.target.value.trim())} placeholder="Görsel bağlantısı (https://…)" className={inputCls} />
      <GorselYukle k={k} onUrl={setGorsel} />
      <label className="flex items-center gap-2 text-xs text-neutral-300">
        Arka plan rengi ('Yalnız yazı' için)
        <input aria-label="Arka plan rengi" type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => (baslik.trim() ? k.yaz({ tam: { label: etiket.trim(), title: baslik.trim(), text: metin.trim(), image: gorsel, bg, visible: true } }, 'Tam ekran yayında') : k.toast('Önce bir başlık yazın.'))}
          className={`${btnBase} bg-rose-600 text-white`}
        >
          <Play className="w-4 h-4" /> Yayına al
        </button>
        <button type="button" onClick={() => k.yaz({ tam: { visible: false } })} className={`${btnBase} bg-neutral-700 text-white`}>
          <X className="w-4 h-4" /> Kapat
        </button>
      </div>
    </Kart>
  );
};

const PipKarti: React.FC<{ k: RejiBaglam }> = ({ k }) => {
  const p = k.durum.pip;
  const [src, setSrc] = useState<Kaynak>(p.src);
  const [etiket, setEtiket] = useState(p.label);
  return (
    <Kart baslik="Görüntü İçinde Görüntü" aciklama="Köşede küçük pencere: görsel, video, YouTube veya sayfa" durum={p.visible} onDurum={(v) => k.yaz({ pip: { visible: v } })}>
      <Varyant k={k} anahtar="pip" />
      <KaynakAlani deger={src} onChange={setSrc} toast={k.toast} haberler={k.newsList} konuklar={k.ayar.konuklar} turler={['konuk', 'video', 'youtube', 'gorsel', 'secim', 'web']} />
      <input aria-label="Pencere etiketi" value={etiket} onChange={(e) => setEtiket(e.target.value)} placeholder="Alt etiket (Muhabir, Canlı bağlantı…)" className={inputCls} />
      <div>
        <Etiket>Köşe</Etiket>
        <Chips etiket="Pencere köşesi" secenekler={[...KOSE4]} deger={p.position} onChange={(v) => k.yaz({ pip: { position: v } })} />
      </div>
      <Aralik etiket="Boyut" deger={p.size} min={14} max={50} birim="%" onKaydet={(v) => k.yaz({ pip: { size: v } })} />
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => (src.url.trim() || src.type === 'secim' ? k.yaz({ pip: { src, label: etiket.trim(), visible: true } }, 'Pencere yayında') : k.toast('Önce bir içerik seçin.'))}
          className={`${btnBase} bg-rose-600 text-white`}
        >
          <Play className="w-4 h-4" /> Yayına al
        </button>
        <button type="button" onClick={() => k.yaz({ pip: { visible: false } })} className={`${btnBase} bg-neutral-700 text-white`}>
          <X className="w-4 h-4" /> Kapat
        </button>
      </div>
    </Kart>
  );
};

export const EkranSekmesi: React.FC<{ k: RejiBaglam }> = ({ k }) => (
  <div className="space-y-3">
    <p className="text-xs text-neutral-400">
      Haber grafiği ve köşe penceresi. Bölünmüş ekran, konuk, video ve seçim için "Sahne" sekmesini kullanın.
    </p>
    <TamEkranKarti k={k} />
    <PipKarti k={k} />
  </div>
);

/* ----------------------------------------------------------------- GÖRÜNÜM */

export const GorunumSekmesi: React.FC<{ k: RejiBaglam }> = ({ k }) => {
  const th = k.durum.theme;
  const [normal, setNormal] = useState(th.normal);
  const [son, setSon] = useState(th.breaking);
  const [vurgu, setVurgu] = useState(th.accent);
  const [koyu, setKoyu] = useState(th.dark);

  const paketUygula = (id: string) => {
    const p = PAKETLER.find((x) => x.id === id);
    if (!p) return;
    setNormal(p.theme.normal);
    setSon(p.theme.breaking);
    setVurgu(p.theme.accent);
    setKoyu(p.theme.dark);
    return k.yaz({ theme: p.theme, look: { font: p.look.font, radius: p.look.radius }, v: p.v }, `"${p.ad}" paketi uygulandı`);
  };
  const paketGecerli = (id: string) => {
    const p = PAKETLER.find((x) => x.id === id)!;
    return JSON.stringify(p.v) === JSON.stringify(k.durum.v) && p.theme.normal === th.normal && p.theme.accent === th.accent;
  };

  return (
    <div className="space-y-4">
      <Bolum baslik="Hazır paketler (tüm katmanlar birlikte)">
        <p className="text-xs text-neutral-400">Bir paket renkleri, yazı tipini ve bütün katmanların görünümünü tek dokunuşla değiştirir. Sonra tek tek özelleştirebilirsiniz.</p>
        <div className="grid grid-cols-2 gap-2">
          {PAKETLER.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => paketUygula(p.id)}
              aria-pressed={paketGecerli(p.id)}
              className={`text-left p-3 rounded-2xl border transition active:scale-[0.98] ${paketGecerli(p.id) ? 'border-rose-500 bg-rose-500/10' : 'border-neutral-700 bg-neutral-900/70'}`}
            >
              <div className="flex gap-1 mb-2">
                {[p.theme.normal, p.theme.breaking, p.theme.accent, p.theme.dark].map((c, i) => (
                  <span key={i} className="w-5 h-5 rounded-full border border-white/20" style={{ background: c }} />
                ))}
                {paketGecerli(p.id) && <Check className="w-4 h-4 text-rose-400 ml-auto" />}
              </div>
              <div className="text-sm font-black">{p.ad}</div>
              <div className="text-[11px] text-neutral-400 leading-snug">{p.aciklama}</div>
            </button>
          ))}
        </div>
      </Bolum>

      <Bolum baslik="Renkler">
        <div className="grid grid-cols-2 gap-3 text-xs text-neutral-300">
          {([
            ['Ana renk', normal, setNormal],
            ['Son dakika', son, setSon],
            ['Vurgu / etiket', vurgu, setVurgu],
            ['Koyu (şerit)', koyu, setKoyu],
          ] as const).map(([ad, v, set]) => (
            <label key={ad} className="flex items-center gap-2">
              <input aria-label={ad} type="color" value={v} onChange={(e) => set(e.target.value)} />
              {ad}
            </label>
          ))}
        </div>
        <button type="button" onClick={() => k.yaz({ theme: { normal, breaking: son, accent: vurgu, dark: koyu } }, 'Renkler kaydedildi')} className={`${btnBase} w-full bg-rose-600 text-white`}>
          <Save className="w-4 h-4" /> Renkleri kaydet
        </button>
      </Bolum>

      <Bolum baslik="Yazı ve şekil">
        <div>
          <Etiket>Yazı tipi</Etiket>
          <Chips etiket="Yazı tipi" secenekler={YAZI_TIPLERI} deger={k.durum.look.font} onChange={(f) => k.yaz({ look: { font: f } })} />
        </div>
        <Aralik etiket="Köşe yuvarlaklığı" deger={k.durum.look.radius} min={0} max={2.4} adim={0.2} onKaydet={(v) => k.yaz({ look: { radius: v } })} />
        <Aralik etiket="Genel boyut" deger={k.durum.look.scale} min={0.7} max={1.4} adim={0.05} birim="×" onKaydet={(v) => k.yaz({ look: { scale: v } })} />
        <div>
          <Etiket>Giriş animasyonu</Etiket>
          <Chips etiket="Animasyon" secenekler={[{ id: 'kay', ad: 'Kayarak' }, { id: 'solma', ad: 'Solarak' }, { id: 'yok', ad: 'Yok' }]} deger={k.durum.look.anim} onChange={(a) => k.yaz({ look: { anim: a } })} />
        </div>
      </Bolum>
    </div>
  );
};

export type { RejiDurum };
