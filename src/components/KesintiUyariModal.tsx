import React, { useEffect, useState } from 'react';
import { Zap, X, Share2 } from 'lucide-react';
import { PaylasimKartiModal } from './PaylasimKartiModal';
import { fetchUedasOutages } from '../services/kesintiService';
import { isMehmetAkifUedasOutage, type UedasOutage } from '../data/kesintiData';

// Uygulama açılınca Mehmet Akif Mahallesi için planlı elektrik kesintisi varsa ekrana uyarı çıkarır:
// gün, saat aralığı ve tahmini süre. Aynı kesinti günde bir kez gösterilir.

interface Uyari {
  id: string;
  tarih: string;
  saat: string;
  neden: string;
  sokaklar: string;
  baslangic: number;
  bitis: number;
  sureSaat: number | null;
}

const GUN = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

/** "20.11.2026" / "20/11/2026" → yerel gün başlangıcı (ms) */
function tarihAyir(t: string): Date | null {
  const m = t.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return isNaN(d.getTime()) ? null : d;
}

/** "09:00 - 13:00" → [başlangıç dk, bitiş dk] */
function saatAyir(s: string): [number, number] | null {
  const m = [...s.matchAll(/(\d{1,2})[:.](\d{2})/g)];
  if (m.length < 2) return null;
  return [Number(m[0][1]) * 60 + Number(m[0][2]), Number(m[1][1]) * 60 + Number(m[1][2])];
}

export function sureMetni(dk: number): string {
  const s = Math.floor(dk / 60);
  const d = dk % 60;
  if (s && d) return `yaklaşık ${s} saat ${d} dk`;
  if (s) return `yaklaşık ${s} saat`;
  return `yaklaşık ${d} dk`;
}

function hazirla(o: UedasOutage, simdi: number): Uyari | null {
  const gun = tarihAyir(o.tarih || '');
  if (!gun) return null;
  const sa = saatAyir(o.saat || '');
  const bas = gun.getTime() + (sa ? sa[0] : 0) * 60000;
  let bit = gun.getTime() + (sa ? sa[1] : 24 * 60) * 60000;
  if (sa && bit <= bas) bit += 24 * 3600000; // gece yarısını aşan kesinti
  if (bit < simdi) return null; // bitmiş
  if (bas - simdi > 7 * 24 * 3600000) return null; // 1 haftadan uzak
  return {
    id: o.id,
    tarih: o.tarih,
    saat: o.saat,
    neden: o.neden,
    sokaklar: (o.sokaklar || []).slice(0, 6).join(', ') || o.rawSokak || '',
    baslangic: bas,
    bitis: bit,
    sureSaat: sa ? Math.round((bit - bas) / 60000) : null,
  };
}

const imza = (u: Uyari) => `${u.tarih}|${u.saat}`;
const bugunAnahtar = () => new Date().toISOString().slice(0, 10);

export const KesintiUyariModal: React.FC<{ onDetay: () => void }> = ({ onDetay }) => {
  const [liste, setListe] = useState<Uyari[]>([]);
  const [paylas, setPaylas] = useState<Uyari | null>(null);

  useEffect(() => {
    let iptal = false;
    const t = setTimeout(async () => {
      try {
        const r = await fetchUedasOutages();
        if (iptal || !r?.success || r.source === 'LOCAL_FALLBACK') return;
        const simdi = Date.now();
        let gorulen: Record<string, string> = {};
        try {
          gorulen = JSON.parse(localStorage.getItem('mp_kesinti_uyari') || '{}');
        } catch {}
        const adaylar = (r.outages || [])
          .filter(isMehmetAkifUedasOutage)
          .map((o) => hazirla(o, simdi))
          .filter((u): u is Uyari => !!u)
          .filter((u) => gorulen[imza(u)] !== bugunAnahtar())
          .sort((a, b) => a.baslangic - b.baslangic);
        if (!iptal) setListe(adaylar);
      } catch {}
    }, 2500);
    return () => {
      iptal = true;
      clearTimeout(t);
    };
  }, []);

  if (!liste.length) return null;

  const kapat = () => {
    try {
      const g = JSON.parse(localStorage.getItem('mp_kesinti_uyari') || '{}');
      liste.forEach((u) => (g[imza(u)] = bugunAnahtar()));
      localStorage.setItem('mp_kesinti_uyari', JSON.stringify(g));
    } catch {}
    setListe([]);
  };

  const simdi = Date.now();
  return (
    <div className="fixed inset-0 z-[95] bg-black/60 flex items-center justify-center p-4" role="alertdialog" aria-label="Elektrik kesintisi uyarısı">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="bg-amber-500 text-white px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6" fill="currentColor" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-black uppercase tracking-wide opacity-90">Uyarı</div>
            <div className="text-base font-black leading-tight">Mehmet Akif Mahallesi'nde elektrik kesintisi</div>
          </div>
          <button onClick={kapat} aria-label="Kapat" className="p-1 -mr-1 opacity-90">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto">
          {liste.map((u) => {
            const gun = tarihAyir(u.tarih);
            const suAn = u.baslangic <= simdi && simdi <= u.bitis;
            return (
              <div key={u.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                {suAn && <div className="text-[10px] font-black uppercase text-rose-600 mb-1">Şu an devam ediyor</div>}
                <div className="text-sm font-black text-neutral-900">
                  {gun ? `${gun.getDate()} ${AY[gun.getMonth()]} ${GUN[gun.getDay()]}` : u.tarih}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-white rounded-xl p-2 border border-amber-100">
                    <div className="text-[10px] font-bold text-neutral-500 uppercase">Saat</div>
                    <div className="text-sm font-black text-neutral-900">{u.saat || '—'}</div>
                  </div>
                  <div className="bg-white rounded-xl p-2 border border-amber-100">
                    <div className="text-[10px] font-bold text-neutral-500 uppercase">Süre</div>
                    <div className="text-sm font-black text-neutral-900">{u.sureSaat !== null ? sureMetni(u.sureSaat) : 'Belirtilmemiş'}</div>
                  </div>
                </div>
                {u.neden && <div className="text-[11px] text-neutral-600 mt-2">Neden: {u.neden}</div>}
                {u.sokaklar && <div className="text-[11px] text-neutral-500 mt-1">Etkilenen yerler: {u.sokaklar}</div>}
                <button onClick={() => setPaylas(u)} className="mt-2 flex items-center gap-1.5 text-[11px] font-black text-amber-800 underline">
                  <Share2 className="w-3.5 h-3.5" /> Komşulara paylaş
                </button>
              </div>
            );
          })}
          <p className="text-[10px] text-neutral-400">Kaynak: UEDAŞ planlı kesinti duyurusu. Süre, duyurulan saat aralığından hesaplanır; gerçek süre değişebilir.</p>
        </div>
        <div className="p-3 border-t border-neutral-100 flex gap-2">
          <button onClick={kapat} className="flex-1 py-3 rounded-xl bg-neutral-900 text-white text-sm font-black">
            Tamam
          </button>
          <button
            onClick={() => {
              kapat();
              onDetay();
            }}
            className="flex-1 py-3 rounded-xl border border-neutral-300 text-sm font-black text-neutral-800"
          >
            Tüm kesintiler
          </button>
        </div>
      </div>
      {paylas && (
        <PaylasimKartiModal
          acik
          onKapat={() => setPaylas(null)}
          kart={{
            tur: 'kesinti',
            baslik: "Mehmet Akif Mahallesi'nde elektrik kesintisi",
            altBaslik: paylas.sokaklar ? `Etkilenen yerler: ${paylas.sokaklar}` : undefined,
            bilgiler: [
              { etiket: 'Tarih', deger: paylas.tarih },
              { etiket: 'Saat', deger: paylas.saat || '—' },
              { etiket: 'Süre', deger: paylas.sureSaat !== null ? sureMetni(paylas.sureSaat).replace('yaklaşık ', '~') : '—' },
            ],
          }}
          yol="/kesintiler"
          ozet={`Elektrik kesintisi: ${paylas.tarih} ${paylas.saat}`.trim()}
          kampanya="kesinti"
        />
      )}
    </div>
  );
};
