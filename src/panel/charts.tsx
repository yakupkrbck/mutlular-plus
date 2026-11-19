import React from 'react';

export const RENKLER = ['#e11d48', '#2563eb', '#059669', '#d97706', '#7c3aed', '#0891b2', '#64748b'];

export const Kart: React.FC<{ baslik?: string; alt?: string; sag?: React.ReactNode; className?: string; children: React.ReactNode }> = ({
  baslik,
  alt,
  sag,
  className = '',
  children,
}) => (
  <section className={`bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 ${className}`}>
    {(baslik || sag) && (
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          {baslik && <h3 className="text-sm font-black text-neutral-900">{baslik}</h3>}
          {alt && <p className="text-[11px] text-neutral-500 mt-0.5">{alt}</p>}
        </div>
        {sag}
      </div>
    )}
    {children}
  </section>
);

export const Gosterge: React.FC<{ baslik: string; deger: string | number; alt?: string; renk?: string }> = ({ baslik, deger, alt, renk = 'text-neutral-900' }) => (
  <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4">
    <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">{baslik}</div>
    <div className={`text-3xl font-black mt-1 ${renk}`}>{deger}</div>
    {alt && <div className="text-[11px] text-neutral-500 mt-1">{alt}</div>}
  </div>
);

export const Bos: React.FC<{ metin?: string }> = ({ metin = 'Henüz veri yok. Uygulama kullanıldıkça burada görünecek.' }) => (
  <div className="text-center text-[12px] text-neutral-400 py-8">{metin}</div>
);

/** Çok serili çizgi grafik (SVG) */
export const Cizgi: React.FC<{
  etiketler: string[];
  seriler: { ad: string; renk: string; veri: number[] }[];
  yukseklik?: number;
}> = ({ etiketler, seriler, yukseklik = 200 }) => {
  const W = 720;
  const H = yukseklik;
  const p = { l: 34, r: 10, t: 10, b: 22 };
  const n = etiketler.length;
  const max = Math.max(1, ...seriler.flatMap((s) => s.veri));
  // Eksen üst sınırı 4'ün katı: ara çizgiler her zaman tam sayı olur
  const ust = Math.max(4, Math.ceil((max * 1.1) / 4) * 4);
  const x = (i: number) => p.l + (n <= 1 ? 0 : (i / (n - 1)) * (W - p.l - p.r));
  const y = (v: number) => p.t + (1 - v / ust) * (H - p.t - p.b);
  const adim = Math.max(1, Math.ceil(n / 8));
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img">
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line x1={p.l} x2={W - p.r} y1={y(ust * f)} y2={y(ust * f)} stroke="#e5e7eb" strokeWidth="1" />
            <text x={p.l - 6} y={y(ust * f) + 3} textAnchor="end" fontSize="10" fill="#9ca3af">
              {Math.round(ust * f)}
            </text>
          </g>
        ))}
        {etiketler.map((e, i) =>
          i % adim === 0 || i === n - 1 ? (
            <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#9ca3af">
              {e}
            </text>
          ) : null
        )}
        {seriler.map((s) => (
          <g key={s.ad}>
            <polyline fill="none" stroke={s.renk} strokeWidth="2.2" strokeLinejoin="round" points={s.veri.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />
            {n <= 40 && s.veri.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="2.4" fill={s.renk}><title>{`${etiketler[i]}: ${v}`}</title></circle>)}
          </g>
        ))}
      </svg>
      <div className="flex gap-4 mt-1">
        {seriler.map((s) => (
          <span key={s.ad} className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-600">
            <i className="w-3 h-1 rounded-full inline-block" style={{ background: s.renk }} />
            {s.ad}
          </span>
        ))}
      </div>
    </div>
  );
};

/** Yatay çubuk listesi */
export const Cubuklar: React.FC<{
  veri: { ad: string; deger: number; ek?: string }[];
  renk?: string;
  toplam?: number;
  maks?: number;
  yuzdeGoster?: boolean;
}> = ({ veri, renk = '#e11d48', toplam, maks, yuzdeGoster }) => {
  if (!veri.length) return <Bos />;
  const m = maks ?? Math.max(1, ...veri.map((v) => v.deger));
  const t = toplam ?? veri.reduce((a, b) => a + b.deger, 0);
  return (
    <ul className="space-y-2">
      {veri.map((v) => (
        <li key={v.ad}>
          <div className="flex justify-between text-[12px] mb-0.5 gap-2">
            <span className="font-bold text-neutral-700 truncate">{v.ad}</span>
            <span className="text-neutral-500 shrink-0">
              {v.deger.toLocaleString('tr-TR')}
              {yuzdeGoster && t > 0 ? ` · %${Math.round((v.deger / t) * 100)}` : ''}
              {v.ek ? ` · ${v.ek}` : ''}
            </span>
          </div>
          <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${Math.max(2, (v.deger / m) * 100)}%`, background: renk }} />
          </div>
        </li>
      ))}
    </ul>
  );
};

/** Gün × saat ısı matrisi */
export const IsiMatrisi: React.FC<{ matris: number[][] }> = ({ matris }) => {
  const gunler = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const max = Math.max(1, ...matris.flat());
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        <div className="grid" style={{ gridTemplateColumns: '34px repeat(24, 1fr)' }}>
          <span />
          {Array.from({ length: 24 }, (_, h) => (
            <span key={h} className="text-[9px] text-neutral-400 text-center">
              {h % 3 === 0 ? h : ''}
            </span>
          ))}
          {matris.map((satir, d) => (
            <React.Fragment key={d}>
              <span className="text-[10px] font-bold text-neutral-500 leading-6">{gunler[d]}</span>
              {satir.map((v, h) => (
                <span
                  key={h}
                  title={`${gunler[d]} ${String(h).padStart(2, '0')}:00 — ${v} etkinlik`}
                  className="h-6 m-px rounded-sm"
                  style={{ background: v === 0 ? '#f3f4f6' : `rgba(225,29,72,${0.12 + 0.88 * (v / max)})` }}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

/** Basit halka grafik */
export const Halka: React.FC<{ veri: { ad: string; deger: number }[] }> = ({ veri }) => {
  const t = veri.reduce((a, b) => a + b.deger, 0);
  if (!t) return <Bos />;
  const R = 44;
  const C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 120 120" className="w-28 h-28 shrink-0 -rotate-90">
        <circle cx="60" cy="60" r={R} fill="none" stroke="#f3f4f6" strokeWidth="16" />
        {veri.map((v, i) => {
          const len = (v.deger / t) * C;
          const el = (
            <circle key={v.ad} cx="60" cy="60" r={R} fill="none" stroke={RENKLER[i % RENKLER.length]} strokeWidth="16" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc}>
              <title>{`${v.ad}: ${v.deger}`}</title>
            </circle>
          );
          acc += len;
          return el;
        })}
      </svg>
      <ul className="text-[12px] space-y-1 min-w-0">
        {veri.map((v, i) => (
          <li key={v.ad} className="flex items-center gap-2">
            <i className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: RENKLER[i % RENKLER.length] }} />
            <span className="font-bold text-neutral-700 truncate">{v.ad}</span>
            <span className="text-neutral-500">
              {v.deger} · %{Math.round((v.deger / t) * 100)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
