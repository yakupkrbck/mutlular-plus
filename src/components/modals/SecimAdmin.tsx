import React, { useMemo, useState } from 'react';
import { Plus, Trash2, Loader2, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { ImageCropField } from '../ImageCropField';
import { SecimDashboard } from '../SecimDashboard';
import { DEFAULT_SECIM, MAX_ADAY, SecimVeri, saveSecim, secimHesapla } from '../../services/secimService';

interface SecimAdminProps {
  /** Kayıtlı (yayındaki) veri */
  kayitli: SecimVeri;
  showToast: (msg: string) => void;
  /** Kaydedildi; bildirim işaretliyse sendPush true */
  onSaved: (veri: SecimVeri, sendPush: boolean) => void;
}

const inputCls =
  'w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 font-medium disabled:opacity-60';

const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }> = ({ checked, onChange, label, hint }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="w-full flex items-center justify-between gap-3 text-left p-2.5 rounded-xl bg-neutral-900/70 border border-neutral-700 hover:border-neutral-500 transition"
  >
    <span className="min-w-0">
      <span className="block text-xs font-bold text-neutral-100">{label}</span>
      {hint && <span className="block text-[10.5px] text-neutral-400 mt-0.5 leading-snug">{hint}</span>}
    </span>
    <span className={`relative w-10 h-6 rounded-full shrink-0 transition ${checked ? 'bg-rose-600' : 'bg-neutral-600'}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`} />
    </span>
  </button>
);

/** Sayı kutusu: yalnızca rakam alır; boşken 0 sayılır. */
const SayiKutusu: React.FC<{ label: string; value: number; onChange: (n: number) => void; disabled?: boolean; hint?: string }> = ({ label, value, onChange, disabled, hint }) => (
  <label className="block">
    <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">{label}</span>
    <input
      type="text"
      inputMode="numeric"
      aria-label={label}
      value={value ? String(value) : ''}
      placeholder="0"
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, '').slice(0, 9)) || 0)}
      className={inputCls}
    />
    {hint && <span className="block text-[10px] text-neutral-500 mt-0.5">{hint}</span>}
  </label>
);

export const SecimAdmin: React.FC<SecimAdminProps> = ({ kayitli, showToast, onSaved }) => {
  const [veri, setVeri] = useState<SecimVeri>(kayitli);
  const [fotoAcik, setFotoAcik] = useState<string | null>(null);
  const [sendPush, setSendPush] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = (p: Partial<SecimVeri>) => setVeri((v) => ({ ...v, ...p }));
  const setAday = (id: string, p: Partial<SecimVeri['adaylar'][number]>) =>
    setVeri((v) => ({ ...v, adaylar: v.adaylar.map((a) => (a.id === id ? { ...a, ...p } : a)) }));

  const hesap = useMemo(() => secimHesapla(veri), [veri]);
  const onizleme: SecimVeri = { ...veri, kullanilanOy: hesap.kullanilanOy };
  const degisti = JSON.stringify({ ...kayitli, guncelleme: 0 }) !== JSON.stringify({ ...veri, guncelleme: 0 });

  const adayEkle = () =>
    setVeri((v) => (v.adaylar.length >= MAX_ADAY ? v : { ...v, adaylar: [...v.adaylar, { id: `a${Date.now()}`, ad: '', oy: 0 }] }));

  const kaydet = async () => {
    if (busy) return;
    if (veri.adaylar.length < 2) {
      setError('En az 2 aday olmalı.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await saveSecim(veri);
      onSaved(veri, sendPush);
      setSendPush(false);
      showToast(veri.yayinda ? '✓ Seçim sonuçları kaydedildi, ekranlar güncellendi.' : '✓ Kaydedildi (henüz yayında değil).');
    } catch {
      setError('Kaydedilemedi. Yetkinizi ve bağlantınızı kontrol edin.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-neutral-800/60 rounded-2xl border border-neutral-700 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[13px] font-black text-white">Muhtarlık Seçimi Sonuçları</h3>
          {degisti && <span className="text-[10px] font-black bg-amber-400 text-neutral-950 px-2 py-0.5 rounded-full">Kaydedilmedi</span>}
        </div>

        <section className="space-y-2">
          <input type="text" aria-label="Başlık" value={veri.baslik} maxLength={90} onChange={(e) => patch({ baslik: e.target.value })} placeholder="Başlık" className={inputCls} />
          <Switch checked={veri.yayinda} onChange={(v) => patch({ yayinda: v })} label="Yayında" hint="Açıkken ana sayfada seçim kartı görünür; kapalıyken kimse görmez." />
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-neutral-900 border border-neutral-700" role="radiogroup" aria-label="Durum">
            {([['devam', 'Sayım sürüyor'], ['kesin', 'Sonuçlar kesinleşti']] as const).map(([k, t]) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={veri.durum === k}
                onClick={() => patch({ durum: k })}
                className={`py-1.5 rounded-lg text-xs font-bold transition ${veri.durum === k ? 'bg-rose-600 text-white' : 'text-neutral-400 hover:text-white'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <div className="text-[10.5px] font-black uppercase tracking-wider text-neutral-400">Genel sayılar</div>
          <div className="grid grid-cols-2 gap-2">
            <SayiKutusu label="Toplam seçmen" value={veri.toplamSecmen} onChange={(n) => patch({ toplamSecmen: n })} />
            <SayiKutusu label="Geçersiz oy" value={veri.gecersizOy} onChange={(n) => patch({ gecersizOy: n })} />
            <SayiKutusu label="Toplam sandık" value={veri.toplamSandik} onChange={(n) => patch({ toplamSandik: n })} />
            <SayiKutusu label="Açılan sandık" value={veri.acilanSandik} onChange={(n) => patch({ acilanSandik: n })} />
          </div>
          <SayiKutusu
            label="Kullanılan oy"
            value={veri.oyuOtomatikHesapla ? hesap.kullanilanOy : veri.kullanilanOy}
            onChange={(n) => patch({ kullanilanOy: n })}
            disabled={veri.oyuOtomatikHesapla}
          />
          <Switch
            checked={veri.oyuOtomatikHesapla}
            onChange={(v) => patch({ oyuOtomatikHesapla: v, kullanilanOy: v ? veri.kullanilanOy : hesap.kullanilanOy })}
            label="Kullanılan oyu otomatik hesapla"
            hint="Aday oyları + geçersiz oy. Tutanakta ayrı bir toplam varsa kapatıp elle yazın."
          />
        </section>

        <section className="space-y-2">
          <div className="text-[10.5px] font-black uppercase tracking-wider text-neutral-400">Adaylar ({veri.adaylar.length}/{MAX_ADAY})</div>
          {veri.adaylar.map((a, i) => (
            <div key={a.id} className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-700 space-y-2">
              <div className="flex items-center gap-1.5">
                <input type="text" aria-label={`Aday ${i + 1} adı`} value={a.ad} maxLength={60} onChange={(e) => setAday(a.id, { ad: e.target.value })} placeholder={`${i + 1}. aday adı soyadı`} className={inputCls} />
                {veri.adaylar.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setVeri((v) => ({ ...v, adaylar: v.adaylar.filter((x) => x.id !== a.id) }))}
                    className="p-2 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-neutral-200 shrink-0"
                    aria-label={`Aday ${i + 1} sil`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex items-end gap-1.5">
                <div className="flex-1">
                  <SayiKutusu label="Aldığı oy" value={a.oy} onChange={(n) => setAday(a.id, { oy: n })} />
                </div>
                {[1, 10].map((d) => (
                  <button key={d} type="button" onClick={() => setAday(a.id, { oy: a.oy + d })} className="px-2.5 py-2 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-bold shrink-0" aria-label={`${a.ad || `Aday ${i + 1}`} +${d} oy`}>
                    +{d}
                  </button>
                ))}
                <button type="button" onClick={() => setFotoAcik(fotoAcik === a.id ? null : a.id)} className={`px-2.5 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 ${a.foto ? 'bg-emerald-700 text-white' : 'bg-neutral-700 text-neutral-200 hover:bg-neutral-600'}`} aria-label={`Aday ${i + 1} fotoğrafı`}>
                  <ImageIcon className="w-3.5 h-3.5" />
                </button>
              </div>
              {fotoAcik === a.id && (
                <div className="bg-white rounded-xl p-2">
                  <ImageCropField value={a.foto} onChange={(v) => setAday(a.id, { foto: v })} aspect={1} outputWidth={400} hint="Kare fotoğraf; yüz ortada olsun." />
                </div>
              )}
            </div>
          ))}
          {veri.adaylar.length < MAX_ADAY && (
            <button type="button" onClick={adayEkle} className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-dashed border-neutral-600 text-neutral-300 hover:text-white hover:border-neutral-400 flex items-center gap-1">
              <Plus className="w-3 h-3" />
              Aday ekle
            </button>
          )}
        </section>

        {hesap.uyarilar.length > 0 && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-[11px] text-amber-200 space-y-0.5" role="alert">
            {hesap.uyarilar.map((u) => (
              <div key={u} className="flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {u}
              </div>
            ))}
          </div>
        )}

        <Switch checked={sendPush} onChange={setSendPush} label="Kaydederken bildirim gönder" hint="Tüm cihazlara 'sonuçlar güncellendi' bildirimi gider (aday adı içermez)." />
        {error && <p className="text-[11px] text-rose-300 font-semibold">{error}</p>}
        <button type="button" onClick={kaydet} disabled={busy} className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5">
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          Kaydet ve ekranlara yansıt
        </button>
        <button type="button" onClick={() => { setVeri(DEFAULT_SECIM); setFotoAcik(null); }} className="w-full text-[11px] text-neutral-500 hover:text-neutral-300 font-semibold">
          Formu sıfırla (kaydedilene kadar yayını etkilemez)
        </button>
      </div>

      <div>
        <div className="text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">Canlı önizleme</div>
        <div className="rounded-2xl bg-slate-100 p-3">
          {/* Önizlemede sayılar anında güncellenir (hızlı veri girişinde gecikme olmasın); çubuklar yine akıcı kayar */}
          <SecimDashboard veri={onizleme} animate={false} />
        </div>
      </div>
    </div>
  );
};
