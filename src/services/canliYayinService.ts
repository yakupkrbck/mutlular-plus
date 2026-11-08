import { useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { API_BASE } from '../config/api';
import { youtubeId } from '../utils/newsVideo';

// ---------------------------------------------------------------------------
// YouTube canlı yayın (vitrin + tam ekran izleme)
// Ayarlar : Firestore `plus_ayarlar/canli` (yönetim panelinden girilir)
// Algılama: Worker `/api/live` (YouTube API'sini 60 sn önbellekle sorgular; kullanıcı başına istek atmaz)
// Elle    : YouTube API anahtarı yoksa/yayın hemen gösterilmek istenirse yönetici "elle yayın"ı açar.
// ---------------------------------------------------------------------------
export interface CanliAyar {
  /** Kanal: UC… kimliği, @kullanıcıadı ya da kanal bağlantısı */
  kanal?: string;
  /** Her seferinde aynı bağlantıyla yayın yapılıyorsa o videonun bağlantısı (anında algılanır) */
  sabitVideo?: string;
  /** Elle yayın: açıkken algılamadan bağımsız olarak aşağıdaki video vitrinde canlı gösterilir */
  elleAktif?: boolean;
  elleVideo?: string;
  elleBaslik?: string;
}

export interface CanliDurum {
  live: boolean;
  videoId?: string;
  title?: string;
  viewers?: number;
  kaynak?: 'otomatik' | 'elle';
  /** Worker'da YouTube anahtarı / kanal tanımlı mı? */
  configured?: boolean;
  reason?: 'no_api_key' | 'no_channel';
  upcoming?: { videoId: string; title: string };
  error?: string;
}

export const CANLI_YOK: CanliDurum = { live: false };

/** Bağlantı ya da 11 haneli kimlikten video kimliği ("" = geçersiz). */
export const youtubeVideoId = (input?: string): string => {
  const t = (input || '').trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(t)) return t;
  return youtubeId(t) || '';
};

/** YouTube oynatıcı adresi */
export const youtubeEmbed = (videoId: string, o: { autoplay?: boolean; muted?: boolean; controls?: boolean } = {}): string => {
  const p = new URLSearchParams({
    autoplay: o.autoplay === false ? '0' : '1',
    mute: o.muted ? '1' : '0',
    controls: o.controls === false ? '0' : '1',
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
    iv_load_policy: '3',
  });
  return `https://www.youtube.com/embed/${videoId}?${p.toString()}`;
};

export const youtubeThumb = (videoId: string): string => `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

/** Elle yayın açıksa o geçerlidir; değilse Worker'ın algıladığı durum. */
export const birlestirCanli = (ayar: CanliAyar | null | undefined, otomatik: CanliDurum | null | undefined): CanliDurum => {
  const elle = youtubeVideoId(ayar?.elleVideo);
  if (ayar?.elleAktif && elle) {
    return { live: true, videoId: elle, title: ayar.elleBaslik?.trim() || 'Canlı Yayın', kaynak: 'elle', configured: true };
  }
  if (otomatik?.live && otomatik.videoId) return { ...otomatik, kaynak: 'otomatik' };
  return otomatik ? { ...otomatik, live: false } : CANLI_YOK;
};

export async function fetchLiveStatus(): Promise<CanliDurum | null> {
  try {
    const res = await fetch(`${API_BASE}/api/live`);
    if (!res.ok) return null;
    return (await res.json()) as CanliDurum;
  } catch {
    return null;
  }
}

export const saveCanliAyar = (ayar: CanliAyar) => setDoc(doc(db, 'plus_ayarlar', 'canli'), ayar);

const POLL_MS = 60_000;

/** Canlı yayın durumunu izler: ayarlar canlı dinlenir, algılama yalnızca kanal tanımlıysa dakikada bir sorgulanır. */
export function useCanliYayin(): { ayar: CanliAyar | null; durum: CanliDurum; otomatik: CanliDurum | null; yenile: () => void } {
  const [ayar, setAyar] = useState<CanliAyar | null>(null);
  const [otomatik, setOtomatik] = useState<CanliDurum | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'plus_ayarlar', 'canli'),
      (snap) => setAyar(snap.exists() ? (snap.data() as CanliAyar) : null),
      () => setAyar(null)
    );
    return () => unsub();
  }, []);

  const izle = !!(ayar?.kanal || ayar?.sabitVideo);
  useEffect(() => {
    if (!izle) {
      setOtomatik(null);
      return;
    }
    let iptal = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const dongu = async () => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        const d = await fetchLiveStatus();
        if (iptal) return;
        if (d) setOtomatik(d);
        // Sunucuda anahtar/kanal yoksa boşuna sormaya devam etme
        if (d && d.configured === false) return;
      }
      timer = setTimeout(dongu, POLL_MS);
    };
    dongu();
    return () => {
      iptal = true;
      if (timer) clearTimeout(timer);
    };
  }, [izle, tick]);

  const durum = useMemo(() => birlestirCanli(ayar, otomatik), [ayar, otomatik]);
  return { ayar, durum, otomatik, yenile: () => setTick((t) => t + 1) };
}
