import React, { useState } from 'react';
import { Copy, MessageCircle, Play, Save, Trash2, UserPlus, X } from 'lucide-react';
import {
  KAYNAK_TURLERI,
  SAHNE_DUZENLERI,
  SAHNE_SABLONLARI,
  ayarYaz,
  konukDavetAdresi,
  konukIzlemeAdresi,
  sahneEksikleri,
  yeniKonuk,
  type KayitliSahne,
  type RejiSahne,
  type SahneAlan,
  type SahneDuzen,
} from '../../services/rejiService';
import { Bolum, Chips, Etiket, Kart, KaynakAlani, btnBase, inputCls, yeniKaynak, type RejiBaglam } from './rejiUi';

type Taslak = Omit<RejiSahne, 'visible'>;

/** Düzenin küçük çizimi */
const DuzenCizim: React.FC<{ id: SahneDuzen; secili: boolean }> = ({ id, secili }) => {
  const k = `rounded-[2px] ${secili ? 'bg-rose-400' : 'bg-neutral-500'}`;
  const kutu = 'w-11 h-7 grid gap-[2px] p-[2px] rounded bg-neutral-900 border border-neutral-600';
  switch (id) {
    case 'tek':
      return <div className={kutu}><div className={k} /></div>;
    case 'yan2':
      return <div className={`${kutu} grid-cols-2`}><div className={k} /><div className={k} /></div>;
    case 'yan2b':
      return <div className={kutu} style={{ gridTemplateColumns: '3fr 2fr' }}><div className={k} /><div className={k} /></div>;
    case 'uclu':
      return <div className={`${kutu} grid-cols-3`}><div className={k} /><div className={k} /><div className={k} /></div>;
    case 'buyukkucuk':
      return (
        <div className={kutu} style={{ gridTemplateColumns: '2fr 1fr', gridTemplateRows: '1fr 1fr' }}>
          <div className={k} style={{ gridRow: '1 / 3' }} /><div className={k} /><div className={k} />
        </div>
      );
    case 'dortlu':
      return <div className={`${kutu} grid-cols-2 grid-rows-2`}><div className={k} /><div className={k} /><div className={k} /><div className={k} /></div>;
    case 'pip':
      return (
        <div className={`${kutu} relative`}>
          <div className={`${k} absolute inset-[2px]`} />
          <div className="absolute right-[3px] bottom-[3px] w-4 h-3 rounded-[2px] bg-white/80" />
        </div>
      );
  }
};

const taslakBaslangic = (k: RejiBaglam): Taslak => {
  const s = k.durum.sahne;
  if (s.slots.length) return { layout: s.layout, bg: s.bg, frame: s.frame, gap: s.gap, slots: s.slots };
  return SAHNE_SABLONLARI[0].sahne;
};

const kopyala = async (metin: string, k: RejiBaglam, tamam: string) => {
  try {
    await navigator.clipboard.writeText(metin);
    k.toast(tamam);
  } catch {
    k.toast('Kopyalanamadı.');
  }
};

/* ------------------------------------------------------------ ONLINE KONUKLAR */

const Konuklar: React.FC<{ k: RejiBaglam }> = ({ k }) => {
  const [ad, setAd] = useState('');
  const liste = k.ayar.konuklar;
  const ekle = () => {
    if (!ad.trim()) return k.toast('Önce konuğun adını yazın.');
    const yeni = yeniKonuk(ad);
    setAd('');
    return k.calistir(() => ayarYaz({ konuklar: [...liste, yeni] }), 'Konuk eklendi');
  };
  return (
    <Bolum baslik={`Online konuklar (${liste.length})`}>
      <p className="text-xs text-neutral-400 leading-snug">
        Konuğa kendi bağlantısını gönderirsiniz. Telefonunda açıp kamera ve mikrofona izin vermesi yeter; uygulama kurmaz. Konuk bağlanınca "Konuk" kutusunda görüntüsü ve sesi yayına gelir.
      </p>
      <div className="flex gap-2">
        <input aria-label="Konuk adı" value={ad} onChange={(e) => setAd(e.target.value)} placeholder="Konuk adı (Ahmet Bey)" className={inputCls} />
        <button type="button" onClick={ekle} className={`${btnBase} bg-rose-600 text-white shrink-0`}>
          <UserPlus className="w-4 h-4" /> Ekle
        </button>
      </div>
      <ul className="space-y-2">
        {liste.map((g) => (
          <li key={g.id} className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-700 space-y-2">
            <div className="text-sm font-black">{g.ad}</div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => kopyala(konukDavetAdresi(g), k, 'Davet bağlantısı kopyalandı')} className={`${btnBase} bg-neutral-700 text-white`}>
                <Copy className="w-4 h-4" /> Davet linki
              </button>
              <button
                type="button"
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Mutlular Haber canlı yayın daveti. Bağlantıyı telefonunda aç, kamera ve mikrofona izin ver, kulaklık tak:\n${konukDavetAdresi(g)}`)}`, '_blank', 'noopener')}
                className={`${btnBase} bg-emerald-700 text-white`}
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp'la gönder
              </button>
              <button type="button" onClick={() => window.open(konukIzlemeAdresi(g), '_blank', 'noopener')} className={`${btnBase} bg-neutral-700 text-white`}>
                Bağlantıyı dene
              </button>
              <button type="button" aria-label={`Sil: ${g.ad}`} onClick={() => k.calistir(() => ayarYaz({ konuklar: liste.filter((x) => x.id !== g.id) }), 'Konuk silindi')} className={`${btnBase} bg-neutral-700 text-rose-300`}>
                <Trash2 className="w-4 h-4" /> Sil
              </button>
            </div>
          </li>
        ))}
      </ul>
      <ul className="list-disc pl-5 space-y-1 text-[11.5px] text-neutral-400 leading-snug">
        <li>Konuk <b>kulaklık</b> takmalı; yoksa kendi sesini duyar (yankı).</li>
        <li>Davet bağlantısı kişiye özeldir, kimseyle paylaşılmamalı. Konuk işi bitince "Sil" ile bağlantıyı iptal edebilirsiniz.</li>
        <li>Yayından önce konuğun kendisini bağlayıp "Bağlantıyı dene" ile görüntü ve sesin geldiğini kontrol edin.</li>
      </ul>
    </Bolum>
  );
};

/* ------------------------------------------------------------------- SAHNE */

export const SahneSekmesi: React.FC<{ k: RejiBaglam }> = ({ k }) => {
  const canli = k.durum.sahne.visible;
  const [taslak, setTaslak] = useState<Taslak>(() => taslakBaslangic(k));
  const [ad, setAd] = useState('');

  const adet = SAHNE_DUZENLERI.find((d) => d.id === taslak.layout)?.alan ?? 1;
  const slotlar: SahneAlan[] = Array.from({ length: adet }, (_, i) => taslak.slots[i] ?? { src: yeniKaynak('kamera'), label: '', sub: '' });
  const tam = (t: Taslak): Taslak => ({ ...t, slots: Array.from({ length: SAHNE_DUZENLERI.find((d) => d.id === t.layout)?.alan ?? 1 }, (_, i) => t.slots[i] ?? { src: yeniKaynak('kamera'), label: '', sub: '' }) });

  const slotDegistir = (i: number, yama: Partial<SahneAlan>) => setTaslak((t) => ({ ...t, slots: slotlar.map((s, j) => (j === i ? { ...s, ...yama } : s)) }));

  const yayinaAl = (t: Taslak = taslak) => {
    const n = tam(t);
    const eksik = sahneEksikleri(n);
    if (eksik.length) return k.toast(eksik[0]);
    return k.yaz({ sahne: { ...n, visible: true } }, 'Sahne yayında');
  };
  const kapat = () => k.yaz({ sahne: { visible: false } }, 'Sahne kapatıldı');
  const kaydet = () => {
    if (!ad.trim()) return k.toast('Sahne için bir ad yazın.');
    const yeni: KayitliSahne = { id: `s${Date.now()}`, ad: ad.trim(), sahne: tam(taslak) };
    setAd('');
    return k.calistir(() => ayarYaz({ sahneler: [...k.ayar.sahneler, yeni] }), 'Sahne kaydedildi');
  };
  const eksikler = sahneEksikleri(tam(taslak));

  return (
    <div className="space-y-4">
      {/* Yayındaki sahne durumu */}
      <div className={`p-3 rounded-2xl border flex items-center gap-3 ${canli ? 'border-rose-500 bg-rose-500/10' : 'border-neutral-700 bg-neutral-800/60'}`}>
        <div className="flex-1">
          <div className="text-sm font-black">{canli ? 'Sahne yayında' : 'Sahne kapalı'}</div>
          <div className="text-[11px] text-neutral-400">{canli ? `${SAHNE_DUZENLERI.find((d) => d.id === k.durum.sahne.layout)?.ad} düzeni ekranda` : 'Kamera görüntüsü normal görünüyor'}</div>
        </div>
        {canli && (
          <button type="button" onClick={kapat} className={`${btnBase} bg-rose-600 text-white`}>
            <X className="w-4 h-4" /> Kapat
          </button>
        )}
      </div>

      {/* Kayıtlı sahneler: tek dokunuşla yayına */}
      {k.ayar.sahneler.length > 0 && (
        <Bolum baslik="Kayıtlı sahnelerim (dokun = yayına al)">
          <ul className="grid grid-cols-1 gap-2">
            {k.ayar.sahneler.map((s) => (
              <li key={s.id} className="flex gap-2">
                <button type="button" onClick={() => yayinaAl(s.sahne)} className={`${btnBase} flex-1 min-h-[56px] bg-emerald-700 text-white justify-start`}>
                  <Play className="w-4 h-4" /> {s.ad}
                </button>
                <button type="button" aria-label={`Düzenlemeye al: ${s.ad}`} onClick={() => setTaslak(s.sahne)} className={`${btnBase} bg-neutral-700 text-white`}>
                  Düzenle
                </button>
                <button type="button" aria-label={`Sil: ${s.ad}`} onClick={() => k.calistir(() => ayarYaz({ sahneler: k.ayar.sahneler.filter((x) => x.id !== s.id) }), 'Silindi')} className={`${btnBase} bg-neutral-700 text-rose-300`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </Bolum>
      )}

      {/* Şablonlar */}
      <Bolum baslik="1 · Hazır şablon seç">
        <div className="grid grid-cols-2 gap-2">
          {SAHNE_SABLONLARI.map((t) => (
            <button key={t.id} type="button" onClick={() => setTaslak(t.sahne)} className="text-left p-3 rounded-2xl border border-neutral-700 bg-neutral-900/70 active:scale-[0.98] transition">
              <div className="mb-2"><DuzenCizim id={t.sahne.layout} secili={false} /></div>
              <div className="text-sm font-black">{t.ad}</div>
              <div className="text-[11px] text-neutral-400 leading-snug">{t.aciklama}</div>
            </button>
          ))}
        </div>
      </Bolum>

      {/* Düzenleyici */}
      <Bolum baslik="2 · Düzen ve kutular">
        <div>
          <Etiket>Düzen</Etiket>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Sahne düzeni">
            {SAHNE_DUZENLERI.map((d) => (
              <button
                key={d.id}
                type="button"
                role="radio"
                aria-checked={taslak.layout === d.id}
                onClick={() => setTaslak((t) => ({ ...t, layout: d.id }))}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${taslak.layout === d.id ? 'border-rose-500 bg-rose-500/10' : 'border-neutral-700 bg-neutral-900'}`}
              >
                <DuzenCizim id={d.id} secili={taslak.layout === d.id} />
                <span className="text-[10px] font-bold text-neutral-300">{d.ad}</span>
              </button>
            ))}
          </div>
        </div>

        {slotlar.map((s, i) => (
          <Kart key={`${taslak.layout}-${i}`} acik={i === 0} baslik={`Kutu ${i + 1} · ${KAYNAK_TURLERI.find((x) => x.id === s.src.type)?.ad}${s.label ? ` · ${s.label}` : ''}`}>
            <KaynakAlani deger={s.src} onChange={(src) => slotDegistir(i, { src })} toast={k.toast} haberler={k.newsList} konuklar={k.ayar.konuklar} />
            <input aria-label={`Kutu ${i + 1} etiketi`} value={s.label} onChange={(e) => slotDegistir(i, { label: e.target.value })} placeholder="İsim etiketi (Ahmet Yılmaz)" className={inputCls} />
            <input aria-label={`Kutu ${i + 1} alt etiketi`} value={s.sub} onChange={(e) => slotDegistir(i, { sub: e.target.value })} placeholder="Unvan (Mahalle Muhtarı)" className={inputCls} />
          </Kart>
        ))}

        <div>
          <Etiket>Zemin</Etiket>
          <Chips etiket="Sahne zemini" secenekler={[{ id: 'koyu', ad: 'Koyu mavi stüdyo' }, { id: 'renk', ad: 'Kanal rengi' }, { id: 'seffaf', ad: 'Şeffaf' }]} deger={taslak.bg} onChange={(bg) => setTaslak((t) => ({ ...t, bg }))} />
        </div>
        <div>
          <Etiket>Kutu çerçevesi</Etiket>
          <Chips etiket="Kutu çerçevesi" secenekler={[{ id: 'yuvarlak', ad: 'Yuvarlak' }, { id: 'kare', ad: 'Köşeli' }, { id: 'cerceve', ad: 'Kalın renkli' }, { id: 'yok', ad: 'Çerçevesiz' }]} deger={taslak.frame} onChange={(frame) => setTaslak((t) => ({ ...t, frame }))} />
        </div>
      </Bolum>

      <Bolum baslik="3 · Yayına al">
        {eksikler.length > 0 && <p className="text-xs text-amber-300">Eksik: {eksikler.join(' · ')}</p>}
        <button type="button" onClick={() => yayinaAl()} className={`${btnBase} w-full min-h-[60px] text-base bg-rose-600 hover:bg-rose-500 text-white`}>
          <Play className="w-5 h-5" /> {canli ? 'SAHNEYİ GÜNCELLE' : 'SAHNEYİ YAYINA AL'}
        </button>
        <div className="flex gap-2">
          <input aria-label="Sahne adı" value={ad} onChange={(e) => setAd(e.target.value)} placeholder="Sahne adı (Konuk görüşmesi)" className={inputCls} />
          <button type="button" onClick={kaydet} className={`${btnBase} bg-neutral-700 text-white shrink-0`}>
            <Save className="w-4 h-4" /> Kaydet
          </button>
        </div>
        <p className="text-[11px] text-neutral-500">Kaydedilen sahneler yukarıda tek dokunuşla yayına alınır. Konuk, video, seçim gibi içerikler sahne kapanınca otomatik durur.</p>
      </Bolum>

      <Konuklar k={k} />

      <Bolum baslik="Ses nasıl yayına gider?">
        <ul className="list-disc pl-5 space-y-1 text-[11.5px] text-neutral-400 leading-snug">
          <li>Konuğun sesi ve videonun sesi, katman sayfasının sesi olarak çıkar. Yayın programının (PRISM/OBS) <b>web kaynağının sesini yayına alması</b> gerekir.</li>
          <li><b>Bilgisayarda OBS</b>: Web kaynağı özelliklerinde "Sesi OBS ile denetle" kutusunu işaretle; ses ölçeri hareket etmeli.</li>
          <li><b>PRISM mobil</b>: web widget'ının sesi yayına verip vermediği belgelerde yer almıyor. Yayından önce konukla ve videoyla kısa bir deneme yapıp yayını kendi hesabında dinleyerek doğrula.</li>
          <li>Ses gelmezse katman bağlantısına <b>&amp;debug=1</b> ekle; "video sesi engellendi" yazıyorsa tarayıcı sesi kapatmıştır.</li>
        </ul>
      </Bolum>
    </div>
  );
};

