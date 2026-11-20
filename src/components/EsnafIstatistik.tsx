import React, { useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// Esnafın kendi işletmesi için istatistikleri: kaç kişi profile baktı, aradı, yol tarifi aldı, WhatsApp'tan yazdı.
// Veri plus_esnaf_istatistik/{işletmeId} belgesinden gelir (kurallar: yalnız işletme sahibi ve yönetici okur).

type Sayac = Record<string, number>;
interface Belge {
  toplam?: Sayac;
  gun?: Record<string, Sayac>;
}

const trGun = (ms: number) => new Date(ms + 3 * 3600 * 1000).toISOString().slice(0, 10);
const sonGunler = (n: number): string[] => {
  const bugun = Date.now();
  return Array.from({ length: n }, (_, i) => trGun(bugun - (n - 1 - i) * 86400000));
};

const ETIKET: { anahtar: string; ad: string; renk: string }[] = [
  { anahtar: 'goruntule', ad: 'Profil görüntüleme', renk: 'text-slate-900' },
  { anahtar: 'ara', ad: 'Arama', renk: 'text-emerald-600' },
  { anahtar: 'yol', ad: 'Yol tarifi', renk: 'text-blue-600' },
  { anahtar: 'whatsapp', ad: 'WhatsApp mesajı', renk: 'text-green-600' },
  { anahtar: 'menu', ad: 'Ürün / menü sorgusu', renk: 'text-amber-600' },
  { anahtar: 'paylas', ad: 'Paylaşım', renk: 'text-rose-600' },
];

export const EsnafIstatistik: React.FC<{ isletmeId?: string }> = ({ isletmeId }) => {
  const [veri, setVeri] = useState<Belge | null>(null);
  const [durum, setDurum] = useState<'yukleniyor' | 'hazir' | 'hata'>('yukleniyor');
  const [aralik, setAralik] = useState(7);

  useEffect(() => {
    if (!isletmeId) {
      setDurum('hazir');
      return;
    }
    const id = isletmeId.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 100);
    return onSnapshot(
      doc(db, 'plus_esnaf_istatistik', id),
      (s) => {
        setVeri(s.exists() ? (s.data() as Belge) : null);
        setDurum('hazir');
      },
      () => setDurum('hata')
    );
  }, [isletmeId]);

  const gunler = useMemo(() => sonGunler(aralik), [aralik]);
  const toplamlar = useMemo(() => {
    const t: Sayac = {};
    gunler.forEach((g) => Object.entries(veri?.gun?.[g] || {}).forEach(([k, v]) => (t[k] = (t[k] || 0) + (Number(v) || 0))));
    return t;
  }, [veri, gunler]);
  const gunluk = useMemo(() => gunler.map((g) => Number(veri?.gun?.[g]?.goruntule) || 0), [veri, gunler]);
  const maks = Math.max(1, ...gunluk);
  const goruntule = toplamlar.goruntule || 0;
  const iletisim = (toplamlar.ara || 0) + (toplamlar.whatsapp || 0) + (toplamlar.yol || 0);

  if (!isletmeId) return <p className="text-xs text-neutral-500 p-4">İstatistik için önce işletmenizi kaydedin.</p>;
  if (durum === 'hata') return <p className="text-xs text-amber-700 p-4">İstatistikler şu an okunamadı. Bir süre sonra tekrar deneyin.</p>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-neutral-900">İşletmeniz nasıl görülüyor?</h3>
          <p className="text-[11px] text-neutral-500">Mutlular Plus'ta müşterilerin işletmenizle etkileşimi</p>
        </div>
        <div className="flex rounded-lg border border-neutral-300 overflow-hidden text-[11px] font-bold">
          {[7, 30].map((n) => (
            <button key={n} onClick={() => setAralik(n)} className={`px-2.5 py-1 ${aralik === n ? 'bg-slate-900 text-white' : 'bg-white text-neutral-600'}`}>
              {n} gün
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {ETIKET.map((e) => (
          <div key={e.anahtar} className="bg-white border border-neutral-200 rounded-2xl p-3">
            <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">{e.ad}</div>
            <div className={`text-2xl font-black mt-0.5 ${e.renk}`}>{toplamlar[e.anahtar] || 0}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-3">
        <div className="flex justify-between text-[11px] font-bold text-neutral-600 mb-2">
          <span>Günlük profil görüntüleme</span>
          <span>
            {goruntule > 0 ? `Görüntüleyenlerin %${Math.round((iletisim / goruntule) * 100)}'i sizinle iletişime geçti` : 'Henüz görüntüleme yok'}
          </span>
        </div>
        <div className="flex items-end gap-0.5 h-20">
          {gunluk.map((v, i) => (
            <div
              key={gunler[i]}
              title={`${gunler[i]}: ${v}`}
              className="flex-1 bg-rose-500/80 rounded-t"
              style={{ height: `${Math.max(v ? 6 : 2, (v / maks) * 100)}%`, opacity: v ? 1 : 0.25 }}
            />
          ))}
        </div>
      </div>

      <p className="text-[10.5px] text-neutral-500">
        Sayılar uygulamayı kullananların işletme sayfanızdaki dokunuşlarıdır; aynı kişinin tekrar dokunuşları kısa sürede bir kez sayılır.
        {durum === 'yukleniyor' ? ' Yükleniyor…' : !veri ? ' Henüz kayıt yok; işletmeniz görüntülendikçe burada birikir.' : ''}
      </p>
    </div>
  );
};
