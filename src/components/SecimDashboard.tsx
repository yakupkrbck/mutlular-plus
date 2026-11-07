import React, { useEffect, useRef, useState } from 'react';
import { Archive, Crown, Radio, CheckCircle2, User, Users, Vote } from 'lucide-react';
import { SecimVeri, secimHesapla, sayiYaz, yuzdeYaz } from '../services/secimService';

/** Sayı değişince eski değerden yenisine akıcı geçiş (hareket azaltma tercihine saygılı). */
function useAnimatedNumber(target: number, enabled: boolean, ms = 650): number {
  const [val, setVal] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (!enabled || reduce || from.current === target) {
      from.current = target;
      setVal(target);
      return;
    }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(a + (target - a) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, enabled, ms]);
  return val;
}

const Num: React.FC<{ value: number; animate: boolean; pct?: boolean; className?: string }> = ({ value, animate, pct, className }) => {
  const v = useAnimatedNumber(value, animate);
  return <span className={`tabular-nums ${className || ''}`}>{pct ? yuzdeYaz(v) : sayiYaz(v)}</span>;
};

// "1. Aday" gibi sıralı yer tutucu adlarda baş harf yerine kişi simgesi gösterilir
const basHarfler = (ad: string) =>
  /^\d/.test(ad.trim())
    ? ''
    : ad
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toLocaleUpperCase('tr-TR');

const Avatar: React.FC<{ ad: string; foto?: string; renk: string; size?: number }> = ({ ad, foto, renk, size = 52 }) => {
  const [bozuk, setBozuk] = useState(false);
  const stil = { width: size, height: size };
  if (foto && !bozuk) {
    return <img src={foto} alt={ad} onError={() => setBozuk(true)} style={stil} className="rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm" />;
  }
  const harf = basHarfler(ad);
  return (
    <div
      style={{ ...stil, backgroundColor: `${renk}1f`, color: renk }}
      className="rounded-full shrink-0 flex items-center justify-center ring-2 ring-white shadow-sm font-black text-[15px]"
      aria-label={`${ad} (fotoğraf yok)`}
      data-testid="aday-yer-tutucu"
    >
      {harf ? harf : <User className="w-6 h-6" />}
    </div>
  );
};

interface SecimDashboardProps {
  veri: SecimVeri;
  /** Sayı ve çubuk geçiş animasyonları */
  animate?: boolean;
}

export const SecimDashboard: React.FC<SecimDashboardProps> = ({ veri, animate = true }) => {
  const h = secimHesapla(veri);
  const kesin = veri.durum === 'kesin';
  const guncelleme = veri.guncelleme
    ? new Date(veri.guncelleme).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    : null;
  const lider = h.adaylar.find((a) => a.onde);

  return (
    <div className="space-y-3.5" data-testid="secim-dashboard">
      {/* Başlık */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 text-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2.5 py-1 rounded-full ${
              kesin ? 'bg-emerald-400/15 text-emerald-200' : 'bg-sky-400/15 text-sky-200'
            }`}
          >
            {kesin ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Radio className="w-3.5 h-3.5 animate-pulse" />}
            {kesin ? 'Sonuçlar kesinleşti' : 'Sayım sürüyor'}
          </span>
          {guncelleme && <span className="text-[10.5px] text-slate-300">Son güncelleme {guncelleme}</span>}
        </div>
        <h2 className="mt-2.5 text-[18px] font-black leading-snug">{veri.baslik}</h2>
        {h.oyVar && lider && !h.esitlik && (
          <p className="mt-1 text-[12px] text-slate-300">
            {kesin ? 'Seçilen' : 'Önde'}: <b className="text-white">{lider.ad}</b> • {yuzdeYaz(lider.yuzde)}
          </p>
        )}
        {h.esitlik && <p className="mt-1 text-[12px] text-amber-200">Şu an birinci sırada eşitlik var.</p>}
        {!h.oyVar && <p className="mt-1 text-[12px] text-slate-300">Henüz sandık açılmadı, sonuçlar geldikçe burada görünecek.</p>}
      </div>

      {/* Bilgi kartları */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div className="mt-2.5 text-[11px] font-semibold text-slate-500">Toplam Seçmen</div>
          <Num value={h.veri.toplamSecmen} animate={animate} className="block text-[22px] leading-tight font-black text-slate-800" />
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Vote className="w-4 h-4" />
          </div>
          <div className="mt-2.5 text-[11px] font-semibold text-slate-500">Kullanılan Oy</div>
          <Num value={h.kullanilanOy} animate={animate} className="block text-[22px] leading-tight font-black text-slate-800" />
          <div className="mt-0.5 text-[11px] text-slate-500">
            Katılım <Num value={h.katilimYuzde} animate={animate} pct className="font-bold text-teal-700" />
          </div>
        </div>

        <div className="col-span-2 rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Archive className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-slate-500">Açılan Sandık</div>
              <div className="text-[11px] text-slate-400">
                {sayiYaz(h.veri.acilanSandik)} / {sayiYaz(h.veri.toplamSandik)} sandık
              </div>
            </div>
            <Num value={h.acilanSandikYuzde} animate={animate} pct className="text-[24px] leading-none font-black text-slate-800" />
          </div>
          <div className="mt-3 h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-[width] duration-700 ease-out"
              style={{ width: `${h.acilanSandikYuzde}%` }}
              role="progressbar"
              aria-label="Açılan sandık oranı"
              aria-valuenow={Math.round(h.acilanSandikYuzde)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      {/* Adaylar */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-3.5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-black text-slate-800">Adaylar</h3>
          <span className="text-[11px] text-slate-400">Geçerli oy: {sayiYaz(h.gecerliOy)}</span>
        </div>
        <ul className="space-y-3.5">
          {h.adaylar.map((a) => (
            <li
              key={a.id}
              data-testid="aday-satiri"
              className={`rounded-xl p-2.5 -mx-1 transition-colors ${a.onde && !h.esitlik ? 'bg-slate-50 ring-1 ring-slate-200' : ''}`}
            >
              <div className="flex items-center gap-3">
                <Avatar ad={a.ad} foto={a.foto} renk={a.renk} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[11px] font-bold text-slate-400 tabular-nums">{a.sira}.</span>
                    <span className="text-[14px] font-extrabold text-slate-800 truncate">{a.ad}</span>
                    {a.onde && h.oyVar && !h.esitlik && <Crown className="w-4 h-4 text-amber-500 shrink-0" aria-label="Önde" />}
                  </div>
                  <div className="text-[11.5px] text-slate-500">
                    <Num value={a.oy} animate={animate} /> oy
                  </div>
                </div>
                <Num value={a.yuzde} animate={animate} pct className="text-[20px] font-black text-slate-800" />
              </div>
              <div className="mt-2.5 h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{ width: `${a.yuzde}%`, backgroundColor: a.renk }}
                  role="progressbar"
                  aria-label={`${a.ad} oy oranı`}
                  aria-valuenow={Math.round(a.yuzde)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </li>
          ))}
        </ul>

        {h.veri.gecersizOy > 0 && (
          <div className="mt-3.5 pt-3 border-t border-slate-100 text-[11.5px] text-slate-500 flex justify-between">
            <span>Geçersiz oy</span>
            <b className="text-slate-700 tabular-nums">{sayiYaz(h.veri.gecersizOy)}</b>
          </div>
        )}
      </div>

      <p className="text-[10.5px] leading-relaxed text-slate-400 px-1">
        Bu ekrandaki rakamlar mahalle sandık tutanaklarından elle girilmektedir ve resmî sonuç değildir. Kesin sonuçlar İlçe Seçim Kurulu tarafından ilan edilir.
      </p>
    </div>
  );
};
