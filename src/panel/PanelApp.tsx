import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Bell,
  CalendarClock,
  ClipboardCheck,
  AlertTriangle,
  Bug,
  Database,
  Filter,
  Store,
  Loader2,
  LogOut,
  Radio,
  Share2,
  MapPin,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react';
import { onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { birlestir } from './analiz';
import { panelVerisiYukle, type PanelVeri } from './veri';
import {
  BildirimSayfasi,
  BolgeSayfasi,
  CanliSayfasi,
  EsnafSayfasi,
  EtkinlikZamani,
  HatalarSayfasi,
  HunilerSayfasi,
  UyarilarSayfasi,
  uyarilar,
  GenelBakis,
  IcerikIlgi,
  Katilimcilar,
  OnayKuyrugu,
  TrafikKaynaklari,
  VeriDurumu,
} from './ekranlar';

type Bolum = 'uyari' | 'huni' | 'esnaf' | 'hata' | 'genel' | 'canli' | 'kaynak' | 'katilimci' | 'zaman' | 'icerik' | 'bolge' | 'bildirim' | 'onay' | 'veri';

const MENU: { id: Bolum; ad: string; ikon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'uyari', ad: 'Uyarılar', ikon: AlertTriangle },
  { id: 'genel', ad: 'Genel Bakış', ikon: BarChart3 },
  { id: 'canli', ad: 'Canlı', ikon: Radio },
  { id: 'kaynak', ad: 'Trafik Kaynakları', ikon: Share2 },
  { id: 'katilimci', ad: 'Katılımcılar', ikon: Users },
  { id: 'zaman', ad: 'Etkinlik Zamanı', ikon: CalendarClock },
  { id: 'icerik', ad: 'İçerik & Arama', ikon: Search },
  { id: 'huni', ad: 'Huniler', ikon: Filter },
  { id: 'esnaf', ad: 'Esnaf Performansı', ikon: Store },
  { id: 'bolge', ad: 'Bölge Haritası', ikon: MapPin },
  { id: 'bildirim', ad: 'Bildirimler', ikon: Bell },
  { id: 'onay', ad: 'Onay Kuyruğu', ikon: ClipboardCheck },
  { id: 'hata', ad: 'Hatalar', ikon: Bug },
  { id: 'veri', ad: 'Veri Durumu', ikon: Database },
];

type Yetki = 'bekliyor' | 'yok' | 'var';

/** Yönetici = admins/{uid} belgesi var ve role yok / admin / yonetici (Firestore kurallarıyla aynı mantık) */
async function yoneticiMi(uid: string): Promise<boolean> {
  try {
    const s = await getDoc(doc(db, 'admins', uid));
    if (!s.exists()) return false;
    const r = s.data()?.role;
    return r === undefined || r === 'admin' || r === 'yonetici';
  } catch {
    return false;
  }
}

const girisHata = (e: any): string => {
  switch (e?.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-posta veya şifre hatalı.';
    case 'auth/too-many-requests':
      return 'Çok fazla deneme. Biraz bekleyip tekrar deneyin.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Giriş penceresi kapatıldı.';
    case 'auth/popup-blocked':
      return 'Tarayıcı açılır pencereyi engelledi. Pencere iznini açıp tekrar deneyin.';
    default:
      return e?.message || 'Giriş yapılamadı.';
  }
};

const GirisEkrani: React.FC<{ mesaj?: string; cikis?: () => void }> = ({ mesaj, cikis }) => {
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState<string | null>(null);
  const [mesgul, setMesgul] = useState(false);
  const inp =
    'w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500';
  const dene = async (fn: () => Promise<unknown>) => {
    setHata(null);
    setMesgul(true);
    try {
      await fn();
    } catch (e) {
      setHata(girisHata(e));
    } finally {
      setMesgul(false);
    }
  };
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 text-white font-black text-xl">
            M<span className="text-rose-500">P</span>
          </div>
          <h1 className="text-white font-black text-lg mt-3">Mutlular Plus Yönetim Paneli</h1>
          <p className="text-neutral-500 text-xs mt-1">Yalnızca yöneticiler</p>
        </div>
        {mesaj && (
          <div className="mb-3 rounded-xl border border-amber-600/40 bg-amber-950/40 text-amber-200 text-xs p-3">
            {mesaj}
            {cikis && (
              <button onClick={cikis} className="block mt-2 font-bold underline">
                Başka hesapla giriş yap
              </button>
            )}
          </div>
        )}
        {!cikis && (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void dene(() => signInWithEmailAndPassword(auth, email.trim(), sifre));
            }}
          >
            <input className={inp} type="email" autoComplete="username" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className={inp} type="password" autoComplete="current-password" placeholder="Şifre" value={sifre} onChange={(e) => setSifre(e.target.value)} required />
            {hata && <p className="text-rose-400 text-xs">{hata}</p>}
            <button disabled={mesgul} className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-black rounded-xl py-3 text-sm">
              {mesgul ? 'Giriş yapılıyor…' : 'Giriş yap'}
            </button>
            <div className="flex items-center gap-3 text-neutral-600 text-[11px]">
              <span className="flex-1 h-px bg-neutral-800" />
              veya
              <span className="flex-1 h-px bg-neutral-800" />
            </div>
            <button
              type="button"
              disabled={mesgul}
              onClick={() => void dene(() => signInWithPopup(auth, googleProvider))}
              className="w-full bg-white hover:bg-neutral-100 disabled:opacity-60 text-neutral-900 font-black rounded-xl py-3 text-sm"
            >
              Google ile giriş yap
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export const PanelApp: React.FC = () => {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [yetki, setYetki] = useState<Yetki>('bekliyor');
  const [bolum, setBolum] = useState<Bolum>(() => {
    const h = window.location.hash.replace('#', '') as Bolum;
    return MENU.some((m) => m.id === h) ? h : 'uyari';
  });
  const [aralik, setAralik] = useState(30);
  const [veri, setVeri] = useState<PanelVeri | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u)), []);
  useEffect(() => {
    if (!user) {
      setYetki('bekliyor');
      setVeri(null);
      return;
    }
    let iptal = false;
    setYetki('bekliyor');
    yoneticiMi(user.uid).then((v) => !iptal && setYetki(v ? 'var' : 'yok'));
    return () => {
      iptal = true;
    };
  }, [user]);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      setVeri(await panelVerisiYukle());
    } finally {
      setYukleniyor(false);
    }
  }, []);
  useEffect(() => {
    if (yetki === 'var') void yukle();
  }, [yetki, yukle]);

  // Panel açıkken uyarıların güncel kalması için 2 dakikada bir yenile
  useEffect(() => {
    if (yetki !== 'var') return;
    const t = setInterval(() => void yukle(), 2 * 60 * 1000);
    return () => clearInterval(t);
  }, [yetki, yukle]);

  useEffect(() => {
    window.location.hash = bolum;
  }, [bolum]);

  const kisiler = useMemo(() => (veri ? birlestir(veri.ziyaretciler) : []), [veri]);

  if (user === undefined || (user && yetki === 'bekliyor')) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }
  if (!user) return <GirisEkrani />;
  if (yetki === 'yok') {
    return <GirisEkrani mesaj="Bu hesabın yönetim paneline erişim yetkisi yok." cikis={() => void signOut(auth)} />;
  }

  const props = { veri: veri!, kisiler, aralik };
  const uyariSayisi = veri ? uyarilar(veri, kisiler).filter((u) => u.seviye !== 'bilgi').length : 0;
  const aktifAd = MENU.find((m) => m.id === bolum)?.ad;
  return (
    <div className="min-h-screen bg-neutral-100 flex">
      <aside className="hidden md:flex w-56 shrink-0 bg-neutral-950 text-neutral-300 flex-col sticky top-0 h-screen">
        <div className="p-4 flex items-center gap-2.5 border-b border-neutral-800">
          <span className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white font-black text-sm">
            M<span className="text-rose-500">P</span>
          </span>
          <span className="text-white font-black text-sm leading-tight">
            Yönetim
            <br />
            Paneli
          </span>
        </div>
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {MENU.map((m) => {
            const I = m.ikon;
            const a = bolum === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setBolum(m.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-bold transition ${
                  a ? 'bg-rose-600 text-white' : 'hover:bg-neutral-900 text-neutral-400'
                }`}
              >
                <I className="w-4 h-4" />
                {m.ad}
                {m.id === 'uyari' && uyariSayisi > 0 && <span className="ml-auto bg-amber-500 text-white text-[10px] font-black rounded-full px-1.5 py-0.5">{uyariSayisi}</span>}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-neutral-800 text-[11px]">
          <div className="truncate text-neutral-500 mb-2">{user.email}</div>
          <button onClick={() => void signOut(auth)} className="flex items-center gap-1.5 font-bold text-neutral-400 hover:text-white">
            <LogOut className="w-3.5 h-3.5" /> Çıkış
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-neutral-200 px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-base font-black text-neutral-900 truncate">{aktifAd}</h1>
            <select
              className="md:hidden text-xs font-bold border border-neutral-300 rounded-lg px-2 py-1"
              value={bolum}
              onChange={(e) => setBolum(e.target.value as Bolum)}
            >
              {MENU.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.ad}{m.id === 'uyari' && uyariSayisi > 0 ? ` (${uyariSayisi})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-neutral-300 overflow-hidden text-[12px] font-bold">
              {[7, 30, 90].map((n) => (
                <button key={n} onClick={() => setAralik(n)} className={`px-3 py-1.5 ${aralik === n ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}>
                  {n} gün
                </button>
              ))}
            </div>
            <button
              onClick={() => void yukle()}
              disabled={yukleniyor}
              className="flex items-center gap-1.5 text-[12px] font-bold border border-neutral-300 rounded-lg px-3 py-1.5 bg-white hover:bg-neutral-50 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${yukleniyor ? 'animate-spin' : ''}`} />
              Yenile
            </button>
          </div>
        </header>

        <main className="p-4 md:p-6 max-w-[1400px]">
          {!veri ? (
            <div className="flex items-center justify-center py-24 text-neutral-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <>
              {bolum === 'uyari' && <UyarilarSayfasi {...props} git={(b) => setBolum(b as Bolum)} />}
              {bolum === 'huni' && <HunilerSayfasi {...props} />}
              {bolum === 'esnaf' && <EsnafSayfasi {...props} />}
              {bolum === 'hata' && <HatalarSayfasi {...props} />}
              {bolum === 'genel' && <GenelBakis {...props} />}
              {bolum === 'canli' && <CanliSayfasi {...props} />}
              {bolum === 'kaynak' && <TrafikKaynaklari {...props} />}
              {bolum === 'katilimci' && <Katilimcilar {...props} />}
              {bolum === 'zaman' && <EtkinlikZamani {...props} />}
              {bolum === 'icerik' && <IcerikIlgi {...props} />}
              {bolum === 'bolge' && <BolgeSayfasi {...props} />}
              {bolum === 'bildirim' && <BildirimSayfasi veri={props.veri} />}
              {bolum === 'onay' && <OnayKuyrugu {...props} />}
              {bolum === 'veri' && <VeriDurumu {...props} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
