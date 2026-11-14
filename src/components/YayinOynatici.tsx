import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Maximize2, Minimize2, Pause, Play, Volume2, VolumeX } from 'lucide-react';

// Mutlular Plus yayın oynatıcısı.
// YouTube videosu / yayını ya da yüklenmiş video dosyası, kendi arayüzümüzle (kendi kontrolleri, kendi kapağı) gösterilir.
// YouTube iframe'inin üstünde dokunma kalkanı vardır; başlık/kanal çubuğu, "sonraki videolar" gibi YouTube arayüzü
// kullanıcıya görünmez: oynatma dışında (yükleniyor, duraklatıldı, bitti) bizim kapağımız görünür.

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiSozu: Promise<any> | null = null;
const ytApi = (): Promise<any> => {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiSozu) return apiSozu;
  apiSozu = new Promise((res, rej) => {
    const onceki = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      onceki?.();
      res(window.YT);
    };
    const sc = document.createElement('script');
    sc.src = 'https://www.youtube.com/iframe_api';
    sc.async = true;
    sc.onerror = () => {
      apiSozu = null;
      rej(new Error('yt-api'));
    };
    document.head.appendChild(sc);
    setTimeout(() => {
      if (!window.YT?.Player) {
        apiSozu = null;
        rej(new Error('yt-zaman-asimi'));
      }
    }, 12000);
  });
  return apiSozu;
};

export interface YayinOynaticiProps {
  tur: 'youtube' | 'dosya';
  /** YouTube video kimliği */
  videoId?: string;
  /** Kanalın canlı yayını (UC… kimliği): embed/live_stream?channel= */
  kanalId?: string;
  /** Video dosyası bağlantısı */
  url?: string;
  /** Canlı yayın (ileri-geri sarma ve oynat/duraklat gösterilmez) */
  canli: boolean;
  dongu?: boolean;
  baslik?: string;
}

const dk = (sn: number) => {
  if (!isFinite(sn) || sn < 0) return '0:00';
  const m = Math.floor(sn / 60);
  const s = Math.floor(sn % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

export const YayinOynatici: React.FC<YayinOynaticiProps> = ({ tur, videoId, kanalId, url, canli, dongu, baslik }) => {
  const kapRef = useRef<HTMLDivElement>(null);
  const ytKutuRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ilkRef = useRef(false);
  const gizleRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [durum, setDurum] = useState<'yukleniyor' | 'oynuyor' | 'durdu' | 'bitti' | 'hata'>('yukleniyor');
  const [basladi, setBasladi] = useState(false);
  const [sessiz, setSessiz] = useState(true);
  const [kontrol, setKontrol] = useState(true);
  const [poz, setPoz] = useState(0);
  const [sure, setSure] = useState(0);
  const [tam, setTam] = useState(false);
  const [cssTam, setCssTam] = useState(false);
  const [dikey, setDikey] = useState(false);

  const kontrolGoster = useCallback(() => {
    setKontrol(true);
    clearTimeout(gizleRef.current);
    gizleRef.current = setTimeout(() => setKontrol(false), 3500);
  }, []);

  // ilk oynayışta YouTube'un kısa süreli başlık çubuğu görünmesin diye kapak birkaç saniye daha kalır
  const oynadi = useCallback(() => {
    setDurum('oynuyor');
    if (!ilkRef.current) {
      ilkRef.current = true;
      setTimeout(() => setBasladi(true), tur === 'youtube' ? 2600 : 300);
    }
  }, [tur]);

  // YouTube
  useEffect(() => {
    if (tur !== 'youtube' || !(videoId || kanalId)) return;
    let iptal = false;
    ilkRef.current = false;
    setBasladi(false);
    setDurum('yukleniyor');
    setSessiz(true);
    ytApi()
      .then((YT) => {
        if (iptal || !ytKutuRef.current) return;
        ytKutuRef.current.innerHTML = '';
        let hedef: HTMLElement;
        if (kanalId) {
          // Kanalın o anki canlı yayını: iframe elle kurulur, API ona bağlanır
          const f = document.createElement('iframe');
          const q = new URLSearchParams({ channel: kanalId, autoplay: '1', mute: '1', controls: '0', disablekb: '1', fs: '0', rel: '0', modestbranding: '1', iv_load_policy: '3', playsinline: '1', enablejsapi: '1', origin: window.location.origin });
          f.src = `https://www.youtube.com/embed/live_stream?${q.toString()}`;
          f.allow = 'autoplay; encrypted-media; picture-in-picture';
          f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
          ytKutuRef.current.appendChild(f);
          hedef = f;
        } else {
          hedef = document.createElement('div');
          ytKutuRef.current.appendChild(hedef);
        }
        playerRef.current = new YT.Player(hedef, {
          ...(kanalId ? {} : { videoId, host: 'https://www.youtube-nocookie.com', width: '100%', height: '100%' }),
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            playsinline: 1,
            cc_load_policy: 0,
            loop: dongu ? 1 : 0,
            ...(dongu ? { playlist: videoId } : {}),
            origin: window.location.origin,
          },
          events: {
            onReady: (e: any) => {
              try {
                e.target.mute();
                e.target.playVideo();
              } catch {}
            },
            onStateChange: (e: any) => {
              const k = e.data;
              if (k === 1) oynadi();
              else if (k === 2) setDurum('durdu');
              else if (k === 0) setDurum('bitti');
              else if (k === -1 || k === 3 || k === 5) setDurum((d) => (d === 'oynuyor' && k === 3 ? d : 'yukleniyor'));
            },
            onError: () => setDurum('hata'),
          },
        });
      })
      .catch(() => !iptal && setDurum('hata'));
    return () => {
      iptal = true;
      try {
        playerRef.current?.destroy?.();
      } catch {}
      playerRef.current = null;
    };
  }, [tur, videoId, kanalId, dongu, oynadi]);

  // Kanal yayını başlamadıysa sonsuza dek yükleniyor görünmesin
  useEffect(() => {
    if (!kanalId) return;
    const t = setTimeout(() => {
      if (!ilkRef.current) setDurum('hata');
    }, 30000);
    return () => clearTimeout(t);
  }, [kanalId]);

  // ilerleme (yalnızca kayıtlı videolarda)
  useEffect(() => {
    if (canli || durum !== 'oynuyor') return;
    const t = setInterval(() => {
      try {
        if (tur === 'youtube' && playerRef.current?.getCurrentTime) {
          setPoz(playerRef.current.getCurrentTime() || 0);
          setSure(playerRef.current.getDuration() || 0);
        } else if (videoRef.current) {
          setPoz(videoRef.current.currentTime || 0);
          setSure(videoRef.current.duration || 0);
        }
      } catch {}
    }, 500);
    return () => clearInterval(t);
  }, [canli, durum, tur]);

  useEffect(() => {
    if (basladi) kontrolGoster();
  }, [basladi, kontrolGoster]);

  useEffect(() => () => clearTimeout(gizleRef.current), []);

  const sesAc = () => {
    if (tur === 'youtube') {
      try {
        if (sessiz) {
          playerRef.current?.unMute();
          playerRef.current?.setVolume(100);
        } else playerRef.current?.mute();
      } catch {}
    } else if (videoRef.current) {
      videoRef.current.muted = !sessiz;
      if (sessiz) videoRef.current.volume = 1;
    }
    setSessiz(!sessiz);
    kontrolGoster();
  };

  const oynatDurdur = () => {
    if (tur === 'youtube') {
      try {
        durum === 'oynuyor' ? playerRef.current?.pauseVideo() : playerRef.current?.playVideo();
      } catch {}
    } else if (videoRef.current) {
      videoRef.current.paused ? videoRef.current.play().catch(() => {}) : videoRef.current.pause();
    }
    kontrolGoster();
  };

  const sar = (sn: number) => {
    try {
      if (tur === 'youtube') playerRef.current?.seekTo(sn, true);
      else if (videoRef.current) videoRef.current.currentTime = sn;
      setPoz(sn);
    } catch {}
  };

  // Tam ekran / yatay: önce tarayıcı tam ekranı + yatay kilit; olmazsa (ör. iPhone) CSS ile döndürülmüş tam ekran
  useEffect(() => {
    const kontrolEt = () => setDikey(window.innerHeight > window.innerWidth);
    kontrolEt();
    window.addEventListener('resize', kontrolEt);
    const fs = () => {
      if (!document.fullscreenElement) {
        setTam((t) => (cssTam ? t : false));
        try {
          (screen.orientation as any)?.unlock?.();
        } catch {}
      }
    };
    document.addEventListener('fullscreenchange', fs);
    return () => {
      window.removeEventListener('resize', kontrolEt);
      document.removeEventListener('fullscreenchange', fs);
    };
  }, [cssTam]);

  const tamEkranDegistir = async () => {
    if (tam) {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
      } catch {}
      setCssTam(false);
      setTam(false);
      try {
        (screen.orientation as any)?.unlock?.();
      } catch {}
      return;
    }
    try {
      if (!kapRef.current?.requestFullscreen) throw new Error('yok');
      await kapRef.current.requestFullscreen();
      try {
        await (screen.orientation as any)?.lock?.('landscape');
      } catch {}
      setTam(true);
    } catch {
      setCssTam(true);
      setTam(true);
    }
  };

  const perde = durum === 'hata' || !basladi || durum === 'durdu' || durum === 'bitti';
  const yukleniyor = durum === 'yukleniyor' || (!basladi && durum === 'oynuyor');

  return (
    <div
      ref={kapRef}
      className={`bg-black overflow-hidden select-none ${cssTam ? 'fixed z-[90]' : 'relative w-full h-full'}`}
      style={
        cssTam
          ? dikey
            ? { top: 0, left: 0, width: '100vh', height: '100vw', transformOrigin: 'top left', transform: 'translateX(100vw) rotate(90deg)' }
            : { inset: 0 }
          : undefined
      }
    >
      {tur === 'youtube' ? (
        <div ref={ytKutuRef} className="absolute inset-0 [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0" />
      ) : (
        <video
          ref={videoRef}
          src={url}
          title={baslik}
          className="absolute inset-0 w-full h-full object-contain bg-black"
          autoPlay
          muted
          playsInline
          loop={!!dongu}
          preload="auto"
          onPlaying={oynadi}
          onPause={() => setDurum((d) => (d === 'bitti' ? d : 'durdu'))}
          onEnded={() => setDurum('bitti')}
          onWaiting={() => setDurum((d) => (d === 'oynuyor' ? d : 'yukleniyor'))}
          onError={() => setDurum('hata')}
        />
      )}

      {/* Mutlular Plus kapağı: yükleme, duraklatma, bitiş ve hata durumlarında YouTube arayüzünü gizler */}
      {perde && (
        <div className="absolute inset-0 z-[5] bg-gradient-to-br from-neutral-900 via-neutral-950 to-black flex flex-col items-center justify-center gap-3 text-center px-6">
          <div className="text-[13px] font-semibold text-white/80 tracking-wide">
            Mutlular <span className="text-amber-400 font-black">Plus</span>
          </div>
          {durum === 'hata' ? (
            <p className="text-[12.5px] text-neutral-300 max-w-xs">Yayın şu an oynatılamıyor. İnternet bağlantınızı kontrol edip biraz sonra tekrar deneyin.</p>
          ) : yukleniyor ? (
            <Loader2 className="w-7 h-7 text-white/80 animate-spin" />
          ) : durum === 'bitti' && canli ? (
            <p className="text-[13px] text-neutral-300">Yayın sona erdi</p>
          ) : (
            <button type="button" onClick={oynatDurdur} className="z-20 w-14 h-14 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center" aria-label="Oynat">
              <Play className="w-6 h-6 ml-0.5" />
            </button>
          )}
        </div>
      )}

      {/* Dokunma kalkanı: YouTube'a hiçbir dokunuş ulaşmaz; dokununca kendi kontrollerimiz görünür */}
      <div className="absolute inset-0 z-10" onClick={kontrolGoster} />

      {/* Sesi aç (sessiz başlayan oynatma için belirgin düğme) */}
      {basladi && sessiz && durum === 'oynuyor' && (
        <button
          type="button"
          onClick={sesAc}
          className="absolute z-20 top-3 right-3 inline-flex items-center gap-1.5 bg-black/70 hover:bg-black/85 text-white text-[12px] font-bold px-3 py-2 rounded-full shadow-lg"
        >
          <VolumeX className="w-4 h-4" />
          Sesi aç
        </button>
      )}

      {/* Kontroller */}
      {basladi && (kontrol || durum !== 'oynuyor') && (
        <div className="absolute z-20 inset-x-0 bottom-0 px-3 pb-2.5 pt-8 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-3 text-white">
          {!canli && (
            <button type="button" onClick={oynatDurdur} aria-label={durum === 'oynuyor' ? 'Duraklat' : 'Oynat'} className="w-8 h-8 flex items-center justify-center">
              {durum === 'oynuyor' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
          )}
          {!canli && (
            <>
              <span className="text-[10.5px] tabular-nums w-9 text-right">{dk(poz)}</span>
              <input
                type="range"
                min={0}
                max={Math.max(1, Math.floor(sure))}
                value={Math.min(Math.floor(poz), Math.max(1, Math.floor(sure)))}
                onChange={(e) => sar(Number(e.target.value))}
                aria-label="Konum"
                className="flex-1 accent-rose-500 h-1"
              />
              <span className="text-[10.5px] tabular-nums w-9">{dk(sure)}</span>
            </>
          )}
          {canli && <span className="flex-1" />}
          <button type="button" onClick={tamEkranDegistir} aria-label={tam ? 'Tam ekrandan çık' : 'Tam ekran (yatay)'} className="w-8 h-8 flex items-center justify-center order-last">
            {tam ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button type="button" onClick={sesAc} aria-label={sessiz ? 'Sesi aç' : 'Sesi kapat'} className="w-8 h-8 flex items-center justify-center">
            {sessiz ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      )}
    </div>
  );
};
