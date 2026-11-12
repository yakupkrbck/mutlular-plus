import React, { useEffect, useState } from 'react';
import { Loader2, LogOut } from 'lucide-react';
import type { User } from 'firebase/auth';
import { authErrorMessage, loadProfile, loginWithEmail, loginWithGoogle, logout, subscribeAuth } from '../../services/authService';
import { useSyncedList } from '../../services/useSyncedList';
import type { NewsItem, UserProfile } from '../../types';
import { RejiPanel } from './RejiPanel';

const inputCls = 'w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500';

/** Ayrı web sayfası olarak reji paneli (/reji): giriş + yetki denetimi, ardından panel. */
export const RejiStandalone: React.FC = () => {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [profil, setProfil] = useState<UserProfile | null | undefined>(undefined);
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [haberler] = useSyncedList<NewsItem>('plus_haberler', { enabled: true });

  useEffect(() => subscribeAuth((u) => setUser(u)), []);
  useEffect(() => {
    let iptal = false;
    if (!user) {
      setProfil(user === null ? null : undefined);
      return;
    }
    setProfil(undefined);
    loadProfile(user)
      .then((p) => !iptal && setProfil(p))
      .catch(() => !iptal && setProfil(null));
    return () => {
      iptal = true;
    };
  }, [user]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const giris = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setHata(null);
    try {
      await fn();
    } catch (e: any) {
      setHata(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const yetkili = !!profil && (profil.role === 'yonetici' || profil.role === 'editor');

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-xl mx-auto p-4 space-y-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)' }}>
        <header className="flex items-center justify-between">
          <h1 className="font-black text-lg">Mutlular Haber • Reji</h1>
          {user && (
            <button onClick={() => logout()} className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white" aria-label="Çıkış">
              <LogOut className="w-4 h-4" />
              Çıkış
            </button>
          )}
        </header>

        {user === undefined || (user && profil === undefined) ? (
          <div className="flex justify-center py-16 text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : !user ? (
          <div className="p-4 bg-neutral-800/60 rounded-2xl border border-neutral-700 space-y-3">
            <p className="text-sm text-neutral-300">Reji paneline yalnızca yönetici ve editörler girebilir.</p>
            <button disabled={busy} onClick={() => giris(loginWithGoogle)} className="w-full min-h-[48px] rounded-xl bg-white text-neutral-900 font-extrabold text-sm">
              Google ile giriş
            </button>
            <form
              className="space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                giris(() => loginWithEmail(email.trim(), sifre));
              }}
            >
              <input aria-label="E-posta" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-posta" className={inputCls} autoComplete="username" />
              <input aria-label="Şifre" type="password" value={sifre} onChange={(e) => setSifre(e.target.value)} placeholder="Şifre" className={inputCls} autoComplete="current-password" />
              <button disabled={busy} type="submit" className="w-full min-h-[48px] rounded-xl bg-rose-600 font-extrabold text-sm">
                Giriş yap
              </button>
            </form>
            {hata && (
              <p className="text-xs text-rose-300 font-semibold" role="alert">
                {hata}
              </p>
            )}
          </div>
        ) : !yetkili ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-sm text-amber-200" role="alert">
            Bu hesabın reji paneline yetkisi yok. Yönetici veya editör hesabıyla giriş yapın.
          </div>
        ) : (
          <RejiPanel newsList={haberler} showToast={setToast} />
        )}
      </div>
      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-6 bg-neutral-100 text-neutral-900 text-sm font-bold px-4 py-2.5 rounded-full shadow-lg z-50" role="status">
          {toast}
        </div>
      )}
    </div>
  );
};
