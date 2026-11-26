import React, { useEffect, useState } from 'react';
import { Zap, Droplets, X, Share2 } from 'lucide-react';
import { PaylasimKartiModal } from './PaylasimKartiModal';
import { fetchUedasOutages, fetchBuskiOutages } from '../services/kesintiService';
import { isMehmetAkifUedasOutage, isMehmetAkifBuskiOutage, type UedasOutage, type BuskiItem } from '../data/kesintiData';

// Uygulama açılınca Mehmet Akif Mahallesi için planlı elektrik veya su kesintisi varsa ekrana uyarı çıkarır:
// gün, saat aralığı ve tahmini süre. Uygulama her açıldığında (kesinti sürdükçe) gösterilir; çarpı ile kapatılır.

interface Uyari {
  id: string;
  tur: 'elektrik' | 'su';
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
  return hazirlaOrtak('elektrik', o.id, o.tarih, o.saat, o.neden, (o.sokaklar || []).slice(0, 6).join(', ') || o.rawSokak || '', simdi);
}

function hazirlaSu(o: BuskiItem, simdi: number): Uyari | null {
  const detay = (o.icerik || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return hazirlaOrtak('su', o.id, o.tarih, o.saat, o.baslik || '', detay.length > 220 ? detay.slice(0, 217) + '…' : detay, simdi);
}

function hazirlaOrtak(tur: 'elektrik' | 'su', id: string, tarih: string, saat: string, neden: string, sokaklar: string, simdi: number): Uyari | null {
  const gun = tarihAyir(tarih || '');
  if (!gun) return null;
  const sa = saatAyir(saat || '');
  const bas = gun.getTime() + (sa ? sa[0] : 0) * 60000;
  let bit = gun.getTime() + (sa ? sa[1] : 24 * 60) * 60000;
  if (sa && bit <= bas) bit += 24 * 3600000; // gece yarısını aşan kesinti
  if (bit < simdi) return null; // bitmiş
  if (bas - simdi > 7 * 24 * 3600000) return null; // 1 haftadan uzak
  return { id, tur, tarih, saat, neden, sokaklar, baslangic: bas, bitis: bit, sureSaat: sa ? Math.round((bit - bas) / 60000) : null };
}

export const KesintiUyariModal: React.FC<{ onDetay: () => void; yonetici?: boolean }> = ({ onDetay, yonetici = false }) => {
  const [liste, setListe] = useState<Uyari[]>([]);
  const [paylas, setPaylas] = useState<Uyari | null>(null);

  useEffect(() => {
    let iptal = false;
    const t = setTimeout(async () => {
      try {
        const [e, su] = await Promise.allSettled([fetchUedasOutages(), fetchBuskiOutages()]);
        const simdi = Date.now();
        const adaylar: Uyari[] = [];
        if (e.status === 'fulfilled' && e.value?.success && e.value.source !== 'LOCAL_FALLBACK') {
          (e.value.outages || []).filter(isMehmetAkifUedasOutage).forEach((o) => { const u = hazirla(o, simdi); if (u) adaylar.push(u); });
        }
        if (su.status === 'fulfilled' && su.value?.success && su.value.source !== 'LOCAL_FALLBACK') {
          (su.value.items || []).filter(isMehmetAkifBuskiOutage).forEach((o) => { const u = hazirlaSu(o, simdi); if (u) adaylar.push(u); });
        }
        adaylar.sort((x, y) => x.baslangic - y.baslangic);
        if (!iptal) setListe(adaylar);
      } catch {}
    }, 2500);
    return () => {
      iptal = true;
      clearTimeout(t);
    };
  }, []);

  if (!liste.length) return null;

  const kapat = () => setListe([]);

  const simdi = Date.now();
  const elektrikVar = liste.some((u) => u.tur === 'elektrik');
  const suVar = liste.some((u) => u.tur === 'su');
  const baslikMetni = elektrikVar && suVar ? 'elektrik ve su kesintisi' : suVar ? 'su kesintisi' : 'elektrik kesintisi';
  const ustRenk = elektrikVar && suVar ? 'bg-rose-600' : suVar ? 'bg-sky-600' : 'bg-amber-500';
  return (
    <div className="fixed inset-0 z-[95] bg-black/60 flex items-center justify-center p-4" role="alertdialog" aria-label="Kesinti uyarısı">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className={`${ustRenk} text-white px-5 py-4 flex items-center gap-3`}>
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            {suVar && !elektrikVar ? <Droplets className="w-6 h-6" fill="currentColor" /> : <Zap className="w-6 h-6" fill="currentColor" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-black uppercase tracking-wide opacity-90">Uyarı</div>
            <div className="text-base font-black leading-tight">Mehmet Akif Mahallesi'nde {baslikMetni}</div>
          </div>
          <button onClick={kapat} aria-label="Kapat" className="p-2 -mr-2 rounded-full bg-white/20 active:bg-white/30">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto">
          {liste.map((u) => {
            const gun = tarihAyir(u.tarih);
            const suAn = u.baslangic <= simdi && simdi <= u.bitis;
            return (
              <div key={u.id} className={`rounded-2xl border p-3 ${u.tur === 'su' ? 'border-sky-200 bg-sky-50' : 'border-amber-200 bg-amber-50'}`}>
                <div className={`flex items-center gap-1 text-[10px] font-black uppercase mb-1 ${u.tur === 'su' ? 'text-sky-700' : 'text-amber-700'}`}>
                  {u.tur === 'su' ? <Droplets className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                  {u.tur === 'su' ? 'Su kesintisi' : 'Elektrik kesintisi'}
                </div>
                {suAn && <div className="text-[10px] font-black uppercase text-rose-600 mb-1">Şu an devam ediyor</div>}
                <div className="text-sm font-black text-neutral-900">
                  {gun ? `${gun.getDate()} ${AY[gun.getMonth()]} ${GUN[gun.getDay()]}` : u.tarih}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-white rounded-xl p-2 border border-white">
                    <div className="text-[10px] font-bold text-neutral-500 uppercase">Saat</div>
                    <div className="text-sm font-black text-neutral-900">{u.saat || '—'}</div>
                  </div>
                  <div className="bg-white rounded-xl p-2 border border-white">
                    <div className="text-[10px] font-bold text-neutral-500 uppercase">Süre</div>
                    <div className="text-sm font-black text-neutral-900">{u.sureSaat !== null ? sureMetni(u.sureSaat) : 'Belirtilmemiş'}</div>
                  </div>
                </div>
                {u.neden && <div className="text-[11px] text-neutral-600 mt-2">{u.tur === 'su' ? u.neden : `Neden: ${u.neden}`}</div>}
                {u.sokaklar && <div className="text-[11px] text-neutral-500 mt-1">{u.tur === 'su' ? u.sokaklar : `Etkilenen yerler: ${u.sokaklar}`}</div>}
                {yonetici && (
                  <button onClick={() => setPaylas(u)} className="mt-2 flex items-center gap-1.5 text-[11px] font-black text-neutral-800 underline">
                    <Share2 className="w-3.5 h-3.5" /> Kart oluştur
                  </button>
                )}
              </div>
            );
          })}
          <p className="text-[10px] text-neutral-400">Kaynak: UEDAŞ / BUSKİ planlı kesinti duyuruları. Süre, duyurulan saat aralığından hesaplanır; gerçek süre değişebilir.</p>
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
            baslik: `Mehmet Akif Mahallesi'nde ${paylas.tur === 'su' ? 'su' : 'elektrik'} kesintisi`,
            etiket: paylas.tur === 'su' ? 'SU KESİNTİSİ' : undefined,
            altBaslik: paylas.sokaklar ? (paylas.tur === 'su' ? paylas.sokaklar : `Etkilenen yerler: ${paylas.sokaklar}`) : undefined,
            bilgiler: [
              { etiket: 'Tarih', deger: paylas.tarih },
              { etiket: 'Saat', deger: paylas.saat || '—' },
              { etiket: 'Süre', deger: paylas.sureSaat !== null ? sureMetni(paylas.sureSaat).replace('yaklaşık ', '~') : '—' },
            ],
          }}
          yol="/kesintiler"
          ozet={`${paylas.tur === 'su' ? 'Su' : 'Elektrik'} kesintisi: ${paylas.tarih} ${paylas.saat}`.trim()}
          kampanya="kesinti"
        />
      )}
    </div>
  );
};
