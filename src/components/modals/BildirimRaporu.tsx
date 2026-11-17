import React from 'react';
import { AlertTriangle, CheckCircle2, Eye, Loader2, MousePointerClick, RefreshCw, Send, Smartphone } from 'lucide-react';
import { useBildirimRaporu, type BildirimRapor } from '../../services/bildirimIstatistikService';

const yuzde = (a: number | null, b: number) => (a === null || !b ? '—' : `%${Math.min(100, Math.round((a / b) * 100))}`);

const zaman = (ms: number) =>
  ms ? new Date(ms).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';

const Kutu: React.FC<{ icon: React.ReactNode; baslik: string; deger: React.ReactNode; alt?: string }> = ({ icon, baslik, deger, alt }) => (
  <div className="bg-neutral-800/70 border border-neutral-700/60 rounded-xl p-2 text-center">
    <div className="flex items-center justify-center gap-1 text-[9.5px] font-bold text-neutral-400 uppercase">{icon}{baslik}</div>
    <div className="text-[15px] font-black text-white leading-tight mt-0.5">{deger}</div>
    {alt && <div className="text-[9.5px] text-neutral-500">{alt}</div>}
  </div>
);

const Satir: React.FC<{ r: BildirimRapor }> = ({ r }) => (
  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div className="text-[12px] font-extrabold text-white break-words">{r.title}</div>
        {r.message && <div className="text-[10.5px] text-neutral-400 line-clamp-2 break-words">{r.message}</div>}
      </div>
      <div className="shrink-0 text-right">
        <div className="text-[10px] text-neutral-500">{zaman(r.createdAtMs)}</div>
        {r.durum === 'gonderildi' && (
          <div className="text-[10px] font-bold text-emerald-400 flex items-center justify-end gap-0.5"><CheckCircle2 className="w-3 h-3" /> Gönderildi</div>
        )}
        {r.durum === 'gonderiliyor' && (
          <div className="text-[10px] font-bold text-amber-400 flex items-center justify-end gap-0.5"><Loader2 className="w-3 h-3 animate-spin" /> Gönderiliyor</div>
        )}
        {r.durum === 'hata' && (
          <div className="text-[10px] font-bold text-rose-400 flex items-center justify-end gap-0.5"><AlertTriangle className="w-3 h-3" /> Gönderilemedi</div>
        )}
      </div>
    </div>
    <div className="grid grid-cols-4 gap-1.5">
      <Kutu icon={<Smartphone className="w-3 h-3" />} baslik="Cihaz" deger={r.hedefCihaz || '—'} alt="hedef" />
      <Kutu icon={<Send className="w-3 h-3" />} baslik="Kullanıcı" deger={r.hedefKullanici || '—'} alt="hedef" />
      <Kutu icon={<Eye className="w-3 h-3" />} baslik="Gördü" deger={r.goren === null ? '…' : r.goren} alt={yuzde(r.goren, r.hedefKullanici)} />
      <Kutu icon={<MousePointerClick className="w-3 h-3" />} baslik="Dokundu" deger={r.dokunan === null ? '…' : r.dokunan} alt={yuzde(r.dokunan, r.hedefKullanici)} />
    </div>
    {r.durum === 'hata' && r.hata && <div className="text-[10.5px] text-rose-300 break-words">Hata: {r.hata}</div>}
    {r.durum === 'gonderildi' && (r.denemeSayisi || 0) > 1 && (
      <div className="text-[10px] text-neutral-500">İlk denemede ulaşılamadı; {r.denemeSayisi}. denemede gönderildi.</div>
    )}
  </div>
);

/** Yönetim: son bildirimler, kaç cihaza/kullanıcıya gitti, kaç kişi gördü/dokundu. */
export const BildirimRaporu: React.FC = () => {
  const { liste, hata, yenileniyor, yenile } = useBildirimRaporu(true);
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[13px] font-extrabold text-white">Bildirim Raporu</div>
          <div className="text-[10.5px] text-neutral-400">Son 30 bildirim • sayılar 30 saniyede bir yenilenir</div>
        </div>
        <button type="button" onClick={yenile} className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-bold flex items-center gap-1">
          <RefreshCw className={`w-3.5 h-3.5 ${yenileniyor ? 'animate-spin' : ''}`} /> Yenile
        </button>
      </div>
      {hata && <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-[11px] text-amber-200">Rapor okunamadı (yetki ya da bağlantı sorunu). Firestore kurallarının son sürümünü yayınlayın.</div>}
      <div className="p-2.5 rounded-xl bg-neutral-800/50 border border-neutral-700/50 text-[10.5px] text-neutral-400 space-y-0.5">
        <div><b className="text-neutral-300">Cihaz / Kullanıcı:</b> gönderim anında kayıtlı (son 45 günde açılmış) cihaz ve kullanıcı sayısı. Google, konu bildirimlerinde cihaz bazlı teslim raporu vermez; bu sayı hedef sayısıdır.</div>
        <div><b className="text-neutral-300">Gördü:</b> Bildirim Merkezi'ni açıp bildirimi görenler. <b className="text-neutral-300">Dokundu:</b> bildirime dokunarak açanlar.</div>
        <div>Bildirim gelmeden önce kaydı olmayan eski gönderimlerde sayılar boş kalır.</div>
      </div>
      {liste.length === 0 && !hata ? (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-[12px] text-neutral-400">Henüz kayıtlı bildirim yok. Gönderdiğiniz bildirimler burada görünür.</div>
      ) : (
        liste.map((r) => <Satir key={r.id} r={r} />)
      )}
    </div>
  );
};
