import React, { useEffect, useState } from 'react';
import { Loader2, BellRing, ChevronDown } from 'lucide-react';
import { CanliAyar, CanliDurum, saveCanliAyar, youtubeVideoId } from '../../services/canliYayinService';

interface CanliAdminProps {
  ayar: CanliAyar | null;
  /** Elle yayın dahil birleşik durum */
  durum: CanliDurum;
  /** Worker'ın algıladığı durum (anahtar/kanal eksikse nedenini içerir) */
  otomatik: CanliDurum | null;
  showToast: (msg: string) => void;
  onNotify: (durum: CanliDurum) => void;
  /** Kaydedince durumu hemen yeniden sorgula */
  onSaved?: () => void;
}

const inputCls =
  'w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 font-medium';

export const CanliAdmin: React.FC<CanliAdminProps> = ({ ayar, durum, otomatik, showToast, onNotify, onSaved }) => {
  const [kanal, setKanal] = useState(ayar?.kanal || '');
  const [sabitVideo, setSabitVideo] = useState(ayar?.sabitVideo || '');
  const [elleAktif, setElleAktif] = useState(!!ayar?.elleAktif);
  const [elleVideo, setElleVideo] = useState(ayar?.elleVideo || '');
  const [elleBaslik, setElleBaslik] = useState(ayar?.elleBaslik || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rehber, setRehber] = useState(false);

  // Kayıtlı ayar sonradan (ilk yüklemeden sonra) gelirse forma yansıt
  useEffect(() => {
    if (!ayar) return;
    setKanal(ayar.kanal || '');
    setSabitVideo(ayar.sabitVideo || '');
    setElleAktif(!!ayar.elleAktif);
    setElleVideo(ayar.elleVideo || '');
    setElleBaslik(ayar.elleBaslik || '');
  }, [ayar?.kanal, ayar?.sabitVideo, ayar?.elleAktif, ayar?.elleVideo, ayar?.elleBaslik]);

  const kaydet = async () => {
    if (busy) return;
    setError(null);
    if (sabitVideo.trim() && !youtubeVideoId(sabitVideo)) return setError('Sabit video bağlantısı geçersiz.');
    if (elleAktif && !youtubeVideoId(elleVideo)) return setError('Elle yayın için geçerli bir YouTube video bağlantısı girin.');
    setBusy(true);
    try {
      await saveCanliAyar({ kanal: kanal.trim(), sabitVideo: sabitVideo.trim(), elleAktif, elleVideo: elleVideo.trim(), elleBaslik: elleBaslik.trim() });
      showToast('✓ Canlı yayın ayarları kaydedildi.');
      onSaved?.();
    } catch {
      setError('Kaydedilemedi. Yetkinizi ve bağlantınızı kontrol edin.');
    } finally {
      setBusy(false);
    }
  };

  const durumKutusu = () => {
    if (durum.live) {
      return (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-200 text-xs space-y-0.5" role="status">
          <div className="font-black">● CANLI — vitrinde gösteriliyor</div>
          <div>{durum.title}</div>
          <div className="text-emerald-300/80">
            Kaynak: {durum.kaynak === 'elle' ? 'elle yayın' : 'otomatik algılama'}
            {durum.viewers ? ` • ${durum.viewers.toLocaleString('tr-TR')} izleyici` : ''}
          </div>
        </div>
      );
    }
    if (otomatik?.configured === false && otomatik.reason === 'no_api_key') {
      return (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs" role="status">
          Otomatik algılama kapalı: Worker'da <b>YOUTUBE_API_KEY</b> tanımlı değil. Aşağıdaki rehberi uygulayın. O zamana kadar "Elle yayın" ile vitrinde canlı yayın gösterebilirsiniz.
        </div>
      );
    }
    if (otomatik?.configured === false && otomatik.reason === 'no_channel') {
      return <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs" role="status">Kanal veya sabit video girip kaydedin.</div>;
    }
    if (otomatik?.error) {
      return <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-200 text-xs" role="status">YouTube sorgusu başarısız oldu. API anahtarını ve kotayı kontrol edin.</div>;
    }
    return (
      <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-700 text-neutral-300 text-xs" role="status">
        Şu an canlı yayın yok.
        {otomatik?.upcoming ? ` Planlanan yayın: ${otomatik.upcoming.title}` : ''}
      </div>
    );
  };

  return (
    <div className="p-4 bg-neutral-800/60 rounded-2xl border border-neutral-700 space-y-4">
      <h3 className="text-[13px] font-black text-white">Canlı Yayın (YouTube)</h3>
      {durumKutusu()}

      <section className="space-y-2">
        <div className="text-[10.5px] font-black uppercase tracking-wider text-neutral-400">Otomatik algılama</div>
        <input type="text" aria-label="YouTube kanalı" value={kanal} onChange={(e) => setKanal(e.target.value)} placeholder="Kanal: @kullaniciadi  veya  UC… kimliği  veya kanal bağlantısı" className={inputCls} />
        <input type="text" aria-label="Sabit yayın bağlantısı" value={sabitVideo} onChange={(e) => setSabitVideo(e.target.value)} placeholder="Sabit yayın bağlantısı (isteğe bağlı)" className={inputCls} />
        <p className="text-[10.5px] text-neutral-500 leading-snug">
          Yayın başlayınca vitrin 1–2 dakika içinde kendiliğinden canlıya geçer. Her yayında aynı bağlantıyı kullanıyorsanız onu "sabit yayın" olarak yazın, o zaman anında algılanır.
        </p>
      </section>

      <section className="space-y-2">
        <div className="text-[10.5px] font-black uppercase tracking-wider text-neutral-400">Elle yayın</div>
        <button
          type="button"
          role="switch"
          aria-checked={elleAktif}
          onClick={() => setElleAktif(!elleAktif)}
          className="w-full flex items-center justify-between gap-3 text-left p-2.5 rounded-xl bg-neutral-900/70 border border-neutral-700 hover:border-neutral-500 transition"
        >
          <span>
            <span className="block text-xs font-bold text-neutral-100">Bu videoyu vitrinde canlı göster</span>
            <span className="block text-[10.5px] text-neutral-400 mt-0.5">Açıkken algılamadan bağımsız olarak hemen gösterilir. Yayın bitince kapatmayı unutmayın.</span>
          </span>
          <span className={`relative w-10 h-6 rounded-full shrink-0 transition ${elleAktif ? 'bg-rose-600' : 'bg-neutral-600'}`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${elleAktif ? 'left-[18px]' : 'left-0.5'}`} />
          </span>
        </button>
        <input type="text" aria-label="Elle yayın bağlantısı" value={elleVideo} onChange={(e) => setElleVideo(e.target.value)} placeholder="YouTube yayın bağlantısı" className={inputCls} />
        <input type="text" aria-label="Elle yayın başlığı" value={elleBaslik} maxLength={120} onChange={(e) => setElleBaslik(e.target.value)} placeholder="Başlık (isteğe bağlı)" className={inputCls} />
      </section>

      {error && <p className="text-[11px] text-rose-300 font-semibold">{error}</p>}
      <button type="button" onClick={kaydet} disabled={busy} className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5">
        {busy && <Loader2 className="w-4 h-4 animate-spin" />}
        Kaydet
      </button>
      <button
        type="button"
        disabled={!durum.live}
        onClick={() => onNotify(durum)}
        className="w-full bg-neutral-700 hover:bg-neutral-600 disabled:opacity-40 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
      >
        <BellRing className="w-4 h-4" />
        "Canlı yayın başladı" bildirimi gönder
      </button>

      <div className="border-t border-neutral-700 pt-3">
        <button type="button" onClick={() => setRehber(!rehber)} className="w-full flex items-center justify-between text-xs font-bold text-neutral-300">
          Otomatik algılama için kurulum rehberi
          <ChevronDown className={`w-4 h-4 transition ${rehber ? 'rotate-180' : ''}`} />
        </button>
        {rehber && (
          <ol className="mt-2 list-decimal pl-5 space-y-1.5 text-[11px] text-neutral-400 leading-snug">
            <li>console.cloud.google.com adresinde bir proje açın → <b>API'ler ve Hizmetler</b> → <b>YouTube Data API v3</b>'ü etkinleştirin.</li>
            <li><b>Kimlik bilgileri</b> → <b>API anahtarı oluştur</b>. Anahtarı "API kısıtlaması: YouTube Data API v3" ile kısıtlayın.</li>
            <li>Cloudflare → Workers → <b>mutlular-plus-api</b> → Settings → <b>Variables and Secrets</b> → <b>Secret</b> ekleyin: ad <b>YOUTUBE_API_KEY</b>, değer anahtarınız. Kaydedip yeniden deploy edin.</li>
            <li>Yukarıdaki kutuya kanalınızı yazıp <b>Kaydet</b>'e basın. Durum kutusu "Şu an canlı yayın yok" veya "CANLI" göstermelidir.</li>
          </ol>
        )}
      </div>
    </div>
  );
};
