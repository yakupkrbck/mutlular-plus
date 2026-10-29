import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { Capacitor } from '@capacitor/core';
import { UserProfile, UserRole } from '../types';
import { ROLE_CONFIGS } from '../data/rolesData';
import { syncUstaFields } from './hizmetAlanlari';

// Kendi kendine kayıtta seçilebilen roller. Editör / Yönetici / Muhtar
// istemciden ASLA atanamaz; yalnızca Firestore'daki `admins/{uid}` kaydıyla gelir.
export const SELF_REGISTER_ROLES: UserRole[] = ['mahalle-sakini', 'esnaf', 'usta'];

const STAFF_ROLES: UserRole[] = ['editor', 'yonetici', 'muhtar'];

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  businessName?: string;
  businessCategory?: string;
  businessAddress?: string;
  activities?: string[];
}

const avatarFor = (name: string, role: UserRole) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${
    role === 'esnaf' ? 'd97706' : role === 'usta' ? '2563eb' : '059669'
  }&color=fff&size=128&bold=true`;

const clean = <T extends Record<string, any>>(obj: T): T => {
  const out: Record<string, any> = {};
  Object.keys(obj).forEach((k) => {
    if (obj[k] !== undefined) out[k] = obj[k];
  });
  return out as T;
};

// Personel rolü (editör/yönetici/muhtar) sadece admins/{uid} belgesinden okunur.
const readStaffRole = async (uid: string): Promise<UserRole | null> => {
  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    if (snap.exists()) {
      const r = snap.data()?.role as string | undefined;
      if (r === 'admin' || r === 'yonetici') return 'yonetici';
      if (r === 'editor') return 'editor';
      if (r === 'muhtar') return 'muhtar';
      return 'yonetici';
    }
  } catch {}
  return null;
};

export const loadProfile = async (user: User): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, 'plus_users', user.uid));
  if (!snap.exists()) return null;
  const data = snap.data() as UserProfile;
  const staffRole = await readStaffRole(user.uid);
  let role: UserRole = data.role;
  if (staffRole) role = staffRole;
  else if (STAFF_ROLES.includes(role)) role = 'mahalle-sakini'; // kayıtta yazılmış sahte personel rolünü yok say
  return {
    ...data,
    uid: user.uid,
    role,
    roleLabel: ROLE_CONFIGS[role].title,
    email: data.email || user.email || undefined,
    avatar: data.avatar || user.photoURL || avatarFor(data.name || 'M', role),
  };
};

export const saveProfile = async (uid: string, profile: UserProfile) => {
  const safeRole: UserRole = SELF_REGISTER_ROLES.includes(profile.role)
    ? profile.role
    : 'mahalle-sakini';
  await setDoc(
    doc(db, 'plus_users', uid),
    clean({
      ...profile,
      role: safeRole,
      roleLabel: ROLE_CONFIGS[safeRole].title,
      uid: undefined,
      updatedAt: serverTimestamp(),
    }),
    { merge: true }
  );
};

export const registerWithEmail = async (input: RegisterInput): Promise<UserProfile> => {
  if (!SELF_REGISTER_ROLES.includes(input.role)) {
    throw new Error('Bu rol ile kendi kendine kayıt yapılamaz.');
  }
  const cred = await createUserWithEmailAndPassword(auth, input.email.trim(), input.password);
  await updateProfile(cred.user, { displayName: input.name });
  const profile: UserProfile = clean({
    name: input.name,
    email: input.email.trim().toLowerCase(),
    phone: input.phone.startsWith('+90') ? input.phone : `+90 ${input.phone}`,
    role: input.role,
    roleLabel: ROLE_CONFIGS[input.role].title,
    avatar: avatarFor(input.name, input.role),
    loginMethod: 'form',
    businessName: input.role === 'esnaf' ? input.businessName : undefined,
    businessCategory: input.role === 'esnaf' ? input.businessCategory : undefined,
    businessAddress: input.role === 'esnaf' ? input.businessAddress : undefined,
    // Esnaf işletmesi yönetici onayına kadar onaysız başlar
    businessApproved: input.role === 'esnaf' ? false : undefined,
    activities: input.role === 'usta' ? input.activities : undefined,
  });
  await saveProfile(cred.user.uid, profile);
  if (input.role === 'usta' && input.activities?.length) {
    // Seçilen alanlar bu andan itibaren herkese görünür ve talep açılabilir olur
    await syncUstaFields(cred.user.uid, input.activities, []).catch((e) => console.warn('[hizmet alanları]', e));
  }
  return (await loadProfile(cred.user)) || profile;
};

export const loginWithEmail = async (email: string, password: string): Promise<UserProfile> => {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  const profile = await loadProfile(cred.user);
  if (!profile) {
    // Hesap var ama profil belgesi yok (ör. eski Haber-2 hesabı): varsayılan profil oluştur
    const name = cred.user.displayName || email.split('@')[0];
    const fresh: UserProfile = clean({
      name,
      email: cred.user.email || email,
      role: 'mahalle-sakini' as UserRole,
      roleLabel: ROLE_CONFIGS['mahalle-sakini'].title,
      avatar: cred.user.photoURL || avatarFor(name, 'mahalle-sakini'),
      loginMethod: 'form' as const,
    });
    await saveProfile(cred.user.uid, fresh);
    return (await loadProfile(cred.user)) || fresh;
  }
  return profile;
};

// Google girişi: önce popup, engellenirse redirect
export const loginWithGoogle = async (): Promise<UserProfile | null> => {
  // Android uygulamasında: Google gömülü WebView'da giriş penceresine izin vermez; yerel giriş kullanılır
  if (Capacitor.isNativePlatform()) {
    const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
    const result = await FirebaseAuthentication.signInWithGoogle();
    const idToken = result.credential?.idToken;
    if (!idToken) throw new Error('Google girişi tamamlanamadı.');
    const cred = await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
    return await finishGoogle(cred.user);
  }
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    return await finishGoogle(cred.user);
  } catch (e: any) {
    if (
      e?.code === 'auth/popup-blocked' ||
      e?.code === 'auth/cancelled-popup-request' ||
      e?.code === 'auth/operation-not-supported-in-this-environment'
    ) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw e;
  }
};

export const finishGoogleRedirect = async (): Promise<UserProfile | null> => {
  const res = await getRedirectResult(auth);
  return res ? finishGoogle(res.user) : null;
};

const finishGoogle = async (user: User): Promise<UserProfile> => {
  const existing = await loadProfile(user);
  if (existing) return existing;
  const name = user.displayName || user.email?.split('@')[0] || 'Mahalle Sakini';
  const fresh: UserProfile = clean({
    name,
    email: user.email || undefined,
    phone: user.phoneNumber || undefined,
    role: 'mahalle-sakini' as UserRole,
    roleLabel: ROLE_CONFIGS['mahalle-sakini'].title,
    avatar: user.photoURL || avatarFor(name, 'mahalle-sakini'),
    loginMethod: 'google' as const,
  });
  await saveProfile(user.uid, fresh);
  return (await loadProfile(user)) || fresh;
};

export const logout = () => signOut(auth);

export const subscribeAuth = (cb: (user: User | null) => void) => onAuthStateChanged(auth, cb);

export const authErrorMessage = (e: any): string => {
  switch (e?.code) {
    case 'auth/email-already-in-use':
      return 'Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyin.';
    case 'auth/invalid-email':
      return 'Geçerli bir e-posta adresi giriniz.';
    case 'auth/weak-password':
      return 'Şifre en az 6 karakter olmalıdır.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-posta veya şifre hatalı.';
    case 'auth/too-many-requests':
      return 'Çok fazla deneme yapıldı. Biraz sonra tekrar deneyin.';
    case 'auth/unauthorized-domain':
      return 'Bu alan adı Firebase\'de yetkili değil. Firebase Console → Authentication → Settings → Authorized domains bölümüne ekleyin.';
    case 'auth/popup-closed-by-user':
      return 'Google giriş penceresi kapatıldı.';
    case 'auth/network-request-failed':
      return 'Ağ hatası. İnternet bağlantınızı kontrol edin.';
    default:
      return e?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.';
  }
};
