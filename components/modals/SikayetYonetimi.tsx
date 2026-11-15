import React, { useMemo, useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { CheckCircle2, Flag, Trash2 } from 'lucide-react';
import { db } from '../../firebase';
import { TARGET_LABEL, deleteReport, resolveReport, useReports, type ReportRecord } from '../../services/reportService';

// Personel: kullanıcı şikayetleri. Kurallar gereği yalnızca personel okur/günceller.
const KOLEKSIYON: Record<string, string> = {
  yorum: 'plus_canli_yorumlar',
  ilan: 'plus_ilanlar',
  is: 'plus_isler',
};

export const SikayetYonetimi: React.FC = () => {
  const { reports, hata } = useReports(true);
  const [filtre, setFiltre] = useState<'open' | 'resolved'>('open');
  const [mesaj, setMesaj] = useState('');
  const [busy, setBusy] = useState('');

  const liste = useMemo(() => reports.filter((r) => (r.status || 'open') === filtre), [reports, filtre]);
  const acik = reports.filter((r) => (r.status || 'open') === 'open').length;

  const run = async (r: ReportRecord, fn: () => Promise<unknown>, ok: string) => {
    setBusy(r.id);
    setMesaj('');
    try {
      await fn();
      setMesaj(ok);
    } catch {
      setMesaj('İşlem yapılamadı. Yetkinizi ve bağlantınızı kontrol edin.');
    } finally {
      setBusy('');
    }
  };

  const icerigiKaldir = (r: ReportRecord) => {
    const kol = KOLEKSIYON[r.targetType];
    if (!kol) return;
    if (!window.confirm('Bildirilen içerik kalıcı olarak silinsin mi?')) return;
    run(
      r,
      async () => {
        await deleteDoc(doc(db, kol, r.targetId));
        await resolveReport(r.id, 'İçerik kaldırıldı');
      },
      'İçerik kaldırıldı, şikayet kapatıldı.'
    );
  };

  return (
    <div className="space-y-3">
      <div className="p-3 bg-neutral-800/70 rounded-2xl border border-neutral-700/80">
        <div className="text-[13px] font-extrabold text-white flex items-center gap-1.5">
          <Flag className="w-4 h-4 text-rose-500" />
          <span>Kullanıcı Şikayetleri ({acik} açık)</span>
        </div>
        <div className="text-[11px] text-neutral-400">Kullanıcıların bildirdiği yorum, ilan ve iş ilanları. Uygunsuz içeriği kaldırın ya da şikayeti kapatın.</div>
      </div>

      <div className="flex gap-1.5">
        {([['open', 'Açık'], ['resolved', 'Kapatılan']] as const).map(([v, l]) => (
          <button key={v} type="button" onClick={() => setFiltre(v)} className={`px-3 py-1.5 rounded-xl text-[11px] font-bold ${filtre === v ? 'bg-rose-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
            {l}
          </button>
        ))}
      </div>

      {hata && <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-[11px] text-amber-200">Şikayetler okunamadı (yetki ya da bağlantı sorunu).</div>}
      {mesaj && <div className="p-2.5 rounded-xl bg-neutral-800 text-[11.5px] text-neutral-200" role="status">{mesaj}</div>}

      {liste.length === 0 ? (
        <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-neutral-400 space-y-1">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <p className="text-xs font-bold text-neutral-300">{filtre === 'open' ? 'Açık şikayet yok.' : 'Kapatılmış şikayet yok.'}</p>
        </div>
      ) : (
        liste.map((r) => (
          <div key={r.id} className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9.5px] font-black px-2 py-0.5 rounded shrink-0">{r.reason}</span>
                <span className="text-[10.5px] font-bold text-neutral-300 truncate">{TARGET_LABEL[r.targetType] || 'İçerik'}</span>
              </div>
              <span className="text-[10px] text-neutral-500 shrink-0">{r.createdAtMs ? new Date(r.createdAtMs).toLocaleString('tr-TR') : ''}</span>
            </div>
            {r.targetTitle && <p className="text-[12px] text-neutral-200 bg-neutral-800/70 rounded-xl px-3 py-2 break-words">“{r.targetTitle}”</p>}
            <div className="text-[10.5px] text-neutral-500">
              {r.targetOwnerName ? `Yazan: ${r.targetOwnerName}` : r.targetOwnerUid ? `Yazan uid: ${r.targetOwnerUid}` : 'Yazan bilinmiyor'}
              {r.note ? ` • Not: ${r.note}` : ''}
            </div>
            {filtre === 'resolved' ? (
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] text-emerald-400 font-bold">{r.resolution || 'Kapatıldı'}</span>
                <button type="button" disabled={busy === r.id} onClick={() => run(r, () => deleteReport(r.id), 'Şikayet kaydı silindi.')} className="text-[11px] text-neutral-500 hover:text-rose-400 flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> Sil
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <button type="button" disabled={busy === r.id} onClick={() => run(r, () => resolveReport(r.id, 'İhlal yok'), 'Şikayet kapatıldı (ihlal yok).')} className="px-2.5 py-1.5 rounded-lg border border-neutral-600 text-neutral-300 hover:bg-neutral-800 text-[11px] font-bold disabled:opacity-60">
                  İhlal yok
                </button>
                {KOLEKSIYON[r.targetType] && (
                  <button type="button" disabled={busy === r.id} onClick={() => icerigiKaldir(r)} className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black disabled:opacity-60">
                    İçeriği kaldır
                  </button>
                )}
                {!KOLEKSIYON[r.targetType] && (
                  <button type="button" disabled={busy === r.id} onClick={() => run(r, () => resolveReport(r.id, 'İşlem yapıldı'), 'Şikayet kapatıldı.')} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black disabled:opacity-60">
                    İşlem yapıldı
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};
