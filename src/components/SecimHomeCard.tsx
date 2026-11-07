import React from 'react';
import { ChevronRight, Radio, CheckCircle2, Vote } from 'lucide-react';
import { SecimVeri, secimHesapla, yuzdeYaz } from '../services/secimService';

/** Ana sayfadaki kısa seçim kartı (yalnızca sonuçlar "yayında" ise gösterilir). */
export const SecimHomeCard: React.FC<{ veri: SecimVeri; onOpen: () => void }> = ({ veri, onOpen }) => {
  if (!veri.yayinda) return null;
  const h = secimHesapla(veri);
  const kesin = veri.durum === 'kesin';
  const lider = h.adaylar.find((a) => a.onde);
  return (
    <div className="px-3">
      <button
        type="button"
        onClick={onOpen}
        className="w-full text-left rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 text-white p-3.5 shadow-sm active:scale-[0.99] transition"
        aria-label="Muhtarlık seçimi sonuçlarını aç"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-slate-200">
            <Vote className="w-3.5 h-3.5" />
            {veri.baslik}
          </span>
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${kesin ? 'bg-emerald-400/15 text-emerald-200' : 'bg-sky-400/15 text-sky-200'}`}>
            {kesin ? <CheckCircle2 className="w-3 h-3" /> : <Radio className="w-3 h-3 animate-pulse" />}
            {kesin ? 'Kesinleşti' : 'Canlı'}
          </span>
        </div>
        <div className="mt-2.5 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] text-slate-300">Açılan sandık</div>
            <div className="text-[22px] leading-tight font-black tabular-nums">{yuzdeYaz(h.acilanSandikYuzde)}</div>
          </div>
          <div className="text-right min-w-0">
            {h.oyVar && lider && !h.esitlik ? (
              <>
                <div className="text-[11px] text-slate-300">{kesin ? 'Seçilen' : 'Önde'}</div>
                <div className="text-[13px] font-extrabold truncate max-w-[170px]">
                  {lider.ad} <span className="text-slate-300 font-bold">{yuzdeYaz(lider.yuzde)}</span>
                </div>
              </>
            ) : (
              <div className="text-[11.5px] text-slate-300">{h.esitlik ? 'Birinci sırada eşitlik' : 'Sonuçlar bekleniyor'}</div>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 mb-0.5" />
        </div>
        <div className="mt-2.5 h-1.5 rounded-full bg-white/15 overflow-hidden">
          <div className="h-full rounded-full bg-amber-300 transition-[width] duration-700" style={{ width: `${h.acilanSandikYuzde}%` }} />
        </div>
      </button>
    </div>
  );
};
