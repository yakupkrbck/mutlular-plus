import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  Shield,
  Briefcase,
  Wrench,
  Store,
  ChevronRight,
  Mail,
  Building2,
  Layers,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  Check,
  UserCheck,
  KeyRound,
  FileCheck2,
} from 'lucide-react';
import { UserRole, UserProfile } from '../../types';
import { ROLE_CONFIGS } from '../../data/rolesData';
import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  SELF_REGISTER_ROLES,
  authErrorMessage,
} from '../../services/authService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (profile: UserProfile) => void;
  onNotifyAdminMerchant?: (merchant: {
    businessName: string;
    category: string;
    ownerName: string;
    phone: string;
    address: string;
  }) => void;
}

// Usta selectable activities (Multi-select)
export const USTA_ACTIVITIES = [
  'Sıhhi Tesisat & Su Kaçağı',
  'Elektrik, Aydınlatma & Sigorta',
  'Kombi, Klima & Isıtma',
  'Boya, Badana & Dekorasyon',
  'Mobilya, Marangoz & Montaj',
  'Çilingir, Kapı & Kilit',
  'Temizlik, Koltuk & Halı Yıkama',
  'Cam Balkon, PVC & Panjur',
  'Alçı, Sıva & Fayans Tadilat',
  'Beyaz Eşya & Cihaz Servisi',
];

// Esnaf categories
export const ESNAF_CATEGORIES = [
  'Kasap & Şarküteri',
  'Market & Bakkal',
  'Fırın & Unlu Mamuller',
  'Cafe & Restoran & Döner',
  'Kuaför & Berber & Güzellik',
  'Kırtasiye & Kitap & Fotokopi',
  'Terzi & Kuru Temizleme',
  'Eczane & Medikal',
  'Oto Bakım, Yıkama & Lastik',
  'Çiçek & Hediyelik & Züccaciye',
  'Manav & Doğal Köy Ürünleri',
  'Diğer Mahalle Esnafı',
];

export interface RegisteredAccount {
  identifier: string; // email or phone
  email?: string;
  phone?: string;
  password?: string;
  profile: UserProfile;
}

export const INITIAL_REGISTERED_ACCOUNTS: RegisteredAccount[] = [];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  onNotifyAdminMerchant,
}) => {
  // Main tabs: 'login' | 'register'
  const [mainTab, setMainTab] = useState<'login' | 'register'>('register');

  // Selected membership type during registration:
  // 'mahalle-sakini' | 'esnaf' | 'usta' | 'editor'
  const [registerRole, setRegisterRole] = useState<UserRole>('mahalle-sakini');

  // Common Registration Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Esnaf specific fields
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState(ESNAF_CATEGORIES[0]);
  const [businessAddress, setBusinessAddress] = useState('');

  // Usta specific fields: Birden çok faaliyet seçebilir (Multi-select)
  const [selectedActivities, setSelectedActivities] = useState<string[]>([
    'Sıhhi Tesisat & Su Kaçağı',
  ]);

  // Login form fields (ONLY email/phone and password, NO role picker!)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Status & error states
  const [formError, setFormError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    title: string;
    message: string;
    badge?: string;
  } | null>(null);

  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  // Toggle multi-select activity for Usta
  const toggleActivity = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  };

  // Kayıt: Firebase Authentication + Firestore users/{uid}
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (busy) return;

    if (!fullName.trim()) {
      setFormError('Lütfen adınızı ve soyadınızı giriniz.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Lütfen geçerli bir e-posta (imail) adresi giriniz.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setFormError('Lütfen geçerli bir telefon numarası giriniz.');
      return;
    }
    if (password.length < 6) {
      setFormError('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }
    if (password !== passwordConfirm) {
      setFormError('Girdiğiniz şifreler birbiriyle eşleşmiyor.');
      return;
    }
    if (!SELF_REGISTER_ROLES.includes(registerRole)) {
      setFormError('Editör ve yönetici hesapları yalnızca yönetim tarafından atanır.');
      return;
    }
    if (registerRole === 'esnaf' && !businessName.trim()) {
      setFormError('Lütfen işletmenizin / dükkanınızın adını giriniz.');
      return;
    }
    if (registerRole === 'usta' && selectedActivities.length === 0) {
      setFormError('Lütfen en az bir faaliyet alanı seçiniz (Birden çok seçebilirsiniz).');
      return;
    }

    setBusy(true);
    try {
      const newProfile = await registerWithEmail({
        name: fullName.trim(),
        email,
        phone,
        password,
        role: registerRole,
        businessName,
        businessCategory,
        businessAddress,
        activities: selectedActivities,
      });

      if (registerRole === 'esnaf' && onNotifyAdminMerchant) {
        onNotifyAdminMerchant({
          businessName,
          category: businessCategory,
          ownerName: fullName,
          phone,
          address: businessAddress || 'Mutlular Mah.',
        });
      }

      if (registerRole === 'esnaf') {
        setSuccessInfo({
          title: 'Esnaf Kaydınız Alındı!',
          message:
            'İşletmeniz yönetim onayına iletildi. Onaylandığında vitrininiz yayına girer.',
          badge: '🏪 Esnaf Başvurusu Alındı',
        });
      } else if (registerRole === 'usta') {
        setSuccessInfo({
          title: 'Usta Kaydınız Tamamlandı!',
          message: `${selectedActivities.length} faaliyet alanınız profilinize işlendi.`,
          badge: '🛠️ Usta Paneli Aktif',
        });
      } else {
        setSuccessInfo({
          title: 'Mahalle Sakini Kaydı Tamamlandı!',
          message: 'Mutlular Mahallesi sakinler ağına kaydınız oluşturuldu. Hoş geldiniz!',
          badge: '🏡 Mahalle Sakini',
        });
      }

      setTimeout(() => {
        onSuccessLogin(newProfile);
        setSuccessInfo(null);
        onClose();
      }, 1500);
    } catch (err) {
      setFormError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  // Giriş: Firebase Authentication (rol Firestore'dan otomatik yüklenir)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (busy) return;

    const cleanInput = loginIdentifier.trim().toLowerCase();
    if (!cleanInput) {
      setFormError('Lütfen e-posta adresinizi giriniz.');
      return;
    }
    if (!cleanInput.includes('@')) {
      setFormError('Giriş için kayıt olduğunuz e-posta adresini kullanın.');
      return;
    }
    if (!loginPassword.trim()) {
      setFormError('Lütfen şifrenizi giriniz.');
      return;
    }

    setBusy(true);
    try {
      const profile = await loginWithEmail(cleanInput, loginPassword);
      const roleCfg = ROLE_CONFIGS[profile.role];
      setSuccessInfo({
        title: 'Giriş Başarılı!',
        message: `${profile.name} • Hesabınız "${roleCfg.title}" rolüyle aktif edildi.`,
        badge: `${roleCfg.icon} ${roleCfg.title}`,
      });
      setTimeout(() => {
        onSuccessLogin(profile);
        setSuccessInfo(null);
        onClose();
      }, 1000);
    } catch (err) {
      setFormError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setFormError(null);
    if (busy) return;
    setBusy(true);
    try {
      const profile = await loginWithGoogle();
      if (profile) {
        onSuccessLogin(profile);
        onClose();
      }
      // profile null → yönlendirme (redirect) başladı; sayfa yeniden yüklenecek
    } catch (err) {
      setFormError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-5 relative max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-neutral-900 to-rose-700 mx-auto flex items-center justify-center text-white font-black text-xl mb-1.5 shadow-md">
            <span>M</span>
            <span className="text-rose-400">P</span>
          </div>
          <h2 className="text-[17px] font-black text-neutral-900 tracking-tight leading-tight">
            Mutlular Plus Hesabı
          </h2>
          <p className="text-[11px] text-neutral-500 font-medium">
            Mahalle Sakini, Esnaf ve Usta Dijital Portalı
          </p>
        </div>

        {/* Success Screen */}
        {successInfo ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-[16px] font-black text-neutral-900">
              {successInfo.title}
            </h3>
            {successInfo.badge && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200 bg-neutral-50 text-[12px] font-black text-neutral-800 shadow-2xs">
                <span>{successInfo.badge}</span>
              </div>
            )}
            <p className="text-[11.5px] text-neutral-600 max-w-xs mx-auto leading-relaxed">
              {successInfo.message}
            </p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 space-y-3.5 pr-0.5">
            {/* Top Switcher: Kayıt Ol vs Giriş Yap */}
            <div className="bg-neutral-100 p-1 rounded-2xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setMainTab('register');
                  setFormError(null);
                }}
                className={`flex-1 py-2 text-[12px] font-black rounded-xl transition flex items-center justify-center gap-1.5 ${
                  mainTab === 'register'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Kayıt Ol</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMainTab('login');
                  setFormError(null);
                }}
                className={`flex-1 py-2 text-[12px] font-black rounded-xl transition flex items-center justify-center gap-1.5 ${
                  mainTab === 'login'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Giriş Yap</span>
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* Google ile giriş / kayıt */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={busy}
              className="w-full bg-white border border-neutral-300 hover:bg-neutral-50 disabled:opacity-60 text-neutral-800 font-bold text-[12.5px] py-2.5 rounded-2xl flex items-center justify-center gap-2 transition active:scale-98"
            >
              <span className="font-black text-[14px]" style={{ color: '#4285F4' }}>G</span>
              <span>Google ile devam et</span>
            </button>

            {/* ============================================================== */}
            {/* TAB: KAYIT OL (REGISTER) */}
            {/* ============================================================== */}
            {mainTab === 'register' && (
              <div className="space-y-3">
                {/* 1. Vasıf / Rol Seçimi */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10.5px] font-black text-neutral-500 uppercase tracking-wider">
                      1. Üyelik Türünüzü Seçin
                    </label>
                    <span className="text-[10px] font-black text-rose-600">
                      {registerRole === 'mahalle-sakini' && '🏡 Mahalle Sakini'}
                      {registerRole === 'esnaf' && '🏪 Mahalle Esnafı'}
                      {registerRole === 'usta' && '🛠️ Bölge Ustası'}
                      {registerRole === 'editor' && '✍️ Atanmış Editör'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {/* Mahalle Sakini */}
                    <button
                      type="button"
                      onClick={() => {
                        setRegisterRole('mahalle-sakini');
                        setFormError(null);
                      }}
                      className={`p-2.5 rounded-2xl text-left border transition active:scale-98 flex items-start gap-2 ${
                        registerRole === 'mahalle-sakini'
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-2xs ring-1 ring-emerald-600'
                          : 'border-neutral-200 bg-neutral-50 hover:bg-white'
                      }`}
                    >
                      <span className="text-xl">🏡</span>
                      <div className="min-w-0">
                        <div
                          className={`text-[11.5px] font-black leading-tight ${
                            registerRole === 'mahalle-sakini'
                              ? 'text-emerald-800'
                              : 'text-neutral-900'
                          }`}
                        >
                          Mahalle Sakini
                        </div>
                        <div className="text-[9.5px] text-neutral-500 font-medium truncate mt-0.5">
                          Vatandaş & Bireysel
                        </div>
                      </div>
                    </button>

                    {/* Esnaf */}
                    <button
                      type="button"
                      onClick={() => {
                        setRegisterRole('esnaf');
                        setFormError(null);
                      }}
                      className={`p-2.5 rounded-2xl text-left border transition active:scale-98 flex items-start gap-2 ${
                        registerRole === 'esnaf'
                          ? 'border-amber-600 bg-amber-50/70 shadow-2xs ring-1 ring-amber-600'
                          : 'border-neutral-200 bg-neutral-50 hover:bg-white'
                      }`}
                    >
                      <span className="text-xl">🏪</span>
                      <div className="min-w-0">
                        <div
                          className={`text-[11.5px] font-black leading-tight ${
                            registerRole === 'esnaf'
                              ? 'text-amber-900'
                              : 'text-neutral-900'
                          }`}
                        >
                          Esnaf / Dükkan
                        </div>
                        <div className="text-[9.5px] text-neutral-500 font-medium truncate mt-0.5">
                          İşletme & Mağaza Paneli
                        </div>
                      </div>
                    </button>

                    {/* Usta */}
                    <button
                      type="button"
                      onClick={() => {
                        setRegisterRole('usta');
                        setFormError(null);
                      }}
                      className={`p-2.5 rounded-2xl text-left border transition active:scale-98 flex items-start gap-2 ${
                        registerRole === 'usta'
                          ? 'border-blue-600 bg-blue-50/70 shadow-2xs ring-1 ring-blue-600'
                          : 'border-neutral-200 bg-neutral-50 hover:bg-white'
                      }`}
                    >
                      <span className="text-xl">🛠️</span>
                      <div className="min-w-0">
                        <div
                          className={`text-[11.5px] font-black leading-tight ${
                            registerRole === 'usta'
                              ? 'text-blue-900'
                              : 'text-neutral-900'
                          }`}
                        >
                          Usta / Hizmet
                        </div>
                        <div className="text-[9.5px] text-neutral-500 font-medium truncate mt-0.5">
                          Çoklu Faaliyet & Teklif
                        </div>
                      </div>
                    </button>

                    {/* Editör */}
                    <button
                      type="button"
                      onClick={() => {
                        setRegisterRole('editor');
                        setFormError(null);
                      }}
                      className={`p-2.5 rounded-2xl text-left border transition active:scale-98 flex items-start gap-2 ${
                        registerRole === 'editor'
                          ? 'border-purple-600 bg-purple-50/70 shadow-2xs ring-1 ring-purple-600'
                          : 'border-neutral-200 bg-neutral-50 hover:bg-white'
                      }`}
                    >
                      <span className="text-xl">✍️</span>
                      <div className="min-w-0">
                        <div
                          className={`text-[11.5px] font-black leading-tight ${
                            registerRole === 'editor'
                              ? 'text-purple-900'
                              : 'text-neutral-900'
                          }`}
                        >
                          Editör / Denetim
                        </div>
                        <div className="text-[9.5px] text-neutral-500 font-medium truncate mt-0.5">
                          Yönetici Tarafından Atanır
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* MAHALLE SAKİNİ İŞARET KUTUSU BİLGİLENDİRMESİ */}
                {registerRole === 'mahalle-sakini' && (
                  <div className="p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs">
                      ✓
                    </span>
                    <span className="text-[11px] font-bold text-emerald-950">
                      Mahalle sakini olarak kaydoluyorsunuz. Formu doldurarak hemen başlayabilirsiniz.
                    </span>
                  </div>
                )}

                {/* SPECIAL NOTICE FOR EDITOR ROLE */}
                {registerRole === 'editor' ? (
                  <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-[12.5px] font-black text-purple-900">
                          Editör Hesabı Yönetici Tarafından Atanır
                        </h4>
                        <p className="text-[11px] text-purple-700 leading-relaxed mt-1 font-medium">
                          Editörler sistem yöneticisi (Süper Admin) tarafından yardımcı olarak atanır.
                          Görevleri: <strong>İlanları Onaylama</strong>, <strong>Esnaf Denetimi</strong> ve <strong>Yorum Moderasyonudur</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-purple-200/70 flex flex-col gap-2">
                      <p className="text-[11px] text-purple-800 font-semibold text-center bg-purple-100/70 p-2 rounded-xl">
                        Editör yetkisi mahalle meclisi ve sistem yöneticisi onayı ile verilir.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setRegisterRole('mahalle-sakini');
                        }}
                        className="w-full bg-purple-600 hover:bg-purple-700 active:scale-98 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs text-center"
                      >
                        Mahalle Sakini Olarak Kayıt Ol
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-3">
                    {/* İsim Soyisim */}
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                        {registerRole === 'esnaf'
                          ? 'İşletme Yetkilisi / Esnaf Adı Soyadı'
                          : registerRole === 'usta'
                          ? 'Usta Adı Soyadı'
                          : 'İsim Soyisim'}
                      </label>
                      <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 focus-within:border-rose-600 focus-within:bg-white transition">
                        <User className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                        <input
                          type="text"
                          required
                          placeholder="Örn: Ahmet Yılmaz"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-transparent text-[12px] font-medium outline-none text-neutral-800"
                        />
                      </div>
                    </div>

                    {/* Email (İmail) & Telefon */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                          E-Posta (İmail)
                        </label>
                        <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-2 focus-within:border-rose-600 focus-within:bg-white transition">
                          <Mail className="w-3.5 h-3.5 text-neutral-400 mr-1.5 shrink-0" />
                          <input
                            type="email"
                            required
                            placeholder="ornek@mail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-transparent text-[11.5px] font-medium outline-none text-neutral-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                          Telefon Numarası
                        </label>
                        <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-2 focus-within:border-rose-600 focus-within:bg-white transition">
                          <Phone className="w-3.5 h-3.5 text-neutral-400 mr-1.5 shrink-0" />
                          <input
                            type="tel"
                            required
                            placeholder="0555 123 45 67"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-transparent text-[11.5px] font-medium outline-none text-neutral-800"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Şifre ve Şifre Tekrarı */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                          Şifre
                        </label>
                        <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-2 focus-within:border-rose-600 focus-within:bg-white transition">
                          <Lock className="w-3.5 h-3.5 text-neutral-400 mr-1.5 shrink-0" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-transparent text-[11.5px] font-medium outline-none text-neutral-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                          Şifre Tekrarı
                        </label>
                        <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-2 focus-within:border-rose-600 focus-within:bg-white transition">
                          <Lock className="w-3.5 h-3.5 text-neutral-400 mr-1.5 shrink-0" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="••••••••"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            className="w-full bg-transparent text-[11.5px] font-medium outline-none text-neutral-800"
                          />
                        </div>
                      </div>
                    </div>

                    {/* ========================================================== */}
                    {/* ESNAF SPECIFIC FIELDS: İŞLETME ADI VE FAALİYETİ */}
                    {/* ========================================================== */}
                    {registerRole === 'esnaf' && (
                      <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-2.5 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2 pb-1.5 border-b border-amber-200/70">
                          <Store className="w-4 h-4 text-amber-700" />
                          <h4 className="text-[11.5px] font-black text-amber-900">
                            Esnaf & Dükkan Bilgileri
                          </h4>
                          <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-bold ml-auto">
                            Zorunlu
                          </span>
                        </div>

                        {/* İşletme Adı */}
                        <div>
                          <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">
                            İşletme / Dükkan Adı
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Örn: Mutlular Kasabı & Şarküteri"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-[12px] font-bold outline-none focus:border-amber-600 text-neutral-800"
                          />
                        </div>

                        {/* İşletme Faaliyeti */}
                        <div>
                          <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">
                            İşletme Faaliyeti (Sektör)
                          </label>
                          <select
                            value={businessCategory}
                            onChange={(e) => setBusinessCategory(e.target.value)}
                            className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-[11.5px] font-bold outline-none focus:border-amber-600 text-neutral-800"
                          >
                            {ESNAF_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Dükkan Adresi */}
                        <div>
                          <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">
                            Dükkan Adresi / Konum
                          </label>
                          <input
                            type="text"
                            placeholder="Örn: Cumhuriyet Cad. No: 14/B Mutlular"
                            value={businessAddress}
                            onChange={(e) => setBusinessAddress(e.target.value)}
                            className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-[11.5px] font-medium outline-none focus:border-amber-600 text-neutral-800"
                          />
                        </div>

                        {/* Yönetim Onayı & Mağaza Paneli Açıklaması */}
                        <div className="p-2.5 rounded-xl bg-amber-100/80 border border-amber-300 text-[10.5px] text-amber-950 flex items-start gap-2 font-medium">
                          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <div>
                            <strong>Yönetim Onay Süreci:</strong> Başvurunuz sistem yöneticisi veya editör denetiminden geçecektir. Onay sonrasında size tahsis edilecek <strong>Mağaza Yönetim Paneli</strong> üzerinden vitrin ürünlerinizi ve indirim kampanyalarınızı yönetebileceksiniz.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ========================================================== */}
                    {/* USTA SPECIFIC FIELDS: BİRDEN ÇOK FAALİYET ALANI (MULTI-SELECT) */}
                    {/* ========================================================== */}
                    {registerRole === 'usta' && (
                      <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200/90 space-y-2.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between pb-1.5 border-b border-blue-200/70">
                          <div className="flex items-center gap-1.5">
                            <Wrench className="w-4 h-4 text-blue-700" />
                            <h4 className="text-[11.5px] font-black text-blue-900">
                              Usta Faaliyet Alanları
                            </h4>
                          </div>
                          <span className="text-[9.5px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded-md font-black">
                            {selectedActivities.length} Alan Seçildi
                          </span>
                        </div>

                        <p className="text-[10px] text-blue-800 font-medium">
                          Hizmet verdiğiniz branşları işaretleyin (Birden çok faaliyet seçebilirsiniz):
                        </p>

                        {/* Multi-select activity pills */}
                        <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                          {USTA_ACTIVITIES.map((activity) => {
                            const isSelected = selectedActivities.includes(activity);
                            return (
                              <button
                                key={activity}
                                type="button"
                                onClick={() => toggleActivity(activity)}
                                className={`p-2 rounded-xl text-left border text-[10.5px] font-bold transition flex items-center justify-between gap-1 ${
                                  isSelected
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                    : 'bg-white text-neutral-800 border-blue-200 hover:border-blue-400'
                                }`}
                              >
                                <span className="truncate">{activity}</span>
                                {isSelected ? (
                                  <Check className="w-3.5 h-3.5 shrink-0 text-white" />
                                ) : (
                                  <span className="w-3 h-3 rounded-full border border-neutral-300 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Usta Paneli Açıklaması */}
                        <div className="p-2.5 rounded-xl bg-blue-100/80 border border-blue-300 text-[10.5px] text-blue-950 flex items-start gap-2 font-medium">
                          <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                          <div>
                            <strong>Usta Yönetim Paneli:</strong> Kayıt sonrası seçtiğiniz faaliyet alanlarına düşen teklif taleplerini inceleyebilir, fiyat teklifi verebilir ve verdiğiniz tüm tekliflerin durumunu panelinizden izleyebilirsiniz.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Terms Checkbox */}
                    <label className="flex items-start gap-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-[10px] text-neutral-600 font-medium leading-tight">
                        {registerRole === 'mahalle-sakini'
                          ? 'Mutlular Mahallesi sakiniyim. Kullanıcı Sözleşmesi ve KVKK metnini onaylıyorum.'
                          : 'Mutlular Plus Esnaf/Usta iş ahlakı kuralları ve platform koşullarını onaylıyorum.'}
                      </span>
                    </label>

                    {/* Submit Register Button */}
                    <button
                      type="submit"
                      disabled={!agreeTerms || busy}
                      className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 disabled:opacity-50 text-white font-extrabold text-[12.5px] py-3 rounded-2xl flex items-center justify-center gap-2 transition active:scale-98 shadow-md mt-2"
                    >
                      <span>
                        {registerRole === 'esnaf'
                          ? 'Esnaf Başvurusunu Tamamla & Mağaza Aç'
                          : registerRole === 'usta'
                          ? 'Usta Kaydını Tamamla & Panele Geç'
                          : 'Mahalle Sakini Olarak Kayıt Ol'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB: GİRİŞ YAP (LOGIN) */}
            {/* ============================================================== */}
            {/* RÖLLER KALDIRILMIŞTIR: HESAP HANGİ ROL İLE AÇILDI İSE O AKTİF OLUR */}
            {mainTab === 'login' && (
              <div className="space-y-3.5">
                {/* Standard Form Login without any role selection */}
                <form onSubmit={handleLogin} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                      E-Posta (İmail) Adresi
                    </label>
                    <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 focus-within:border-rose-600 focus-within:bg-white transition">
                      <Mail className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                      <input
                        type="text"
                        required
                        placeholder="ornek@mail.com"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className="w-full bg-transparent text-[12px] font-medium outline-none text-neutral-800"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-neutral-600 uppercase">
                        Şifre
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[10px] text-neutral-500 hover:text-neutral-800 font-bold flex items-center gap-1"
                      >
                        {showPassword ? (
                          <>
                            <EyeOff className="w-3 h-3" /> Gizle
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" /> Göster
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 focus-within:border-rose-600 focus-within:bg-white transition">
                      <Lock className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full bg-transparent text-[12px] font-medium outline-none text-neutral-800"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span>Beni hatırla</span>
                    </label>
                    <span className="text-[10.5px] text-neutral-400">
                      Rolünüz hesabınızdan otomatik yüklenir
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full disabled:opacity-60 bg-neutral-900 hover:bg-black text-white font-black text-[12.5px] py-3 rounded-2xl flex items-center justify-center gap-2 transition active:scale-98 shadow-md"
                  >
                    <span>Giriş Yap</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Bilgilendirme Kartı */}
                <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-[10.5px] text-neutral-600 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong>Otomatik Rol Tanıma:</strong> Kayıt sırasında hesabınıza atanan vasıf (Mahalle Sakini, Esnaf, Usta veya Editör) giriş yaptığınızda doğrudan aktif olacaktır.
                  </span>
                </div>

              </div>
            )}

            <p className="text-[9.5px] text-neutral-400 text-center leading-relaxed mt-2 pt-2 border-t border-neutral-100">
              Devam ederek Mutlular Plus Kullanıcı Sözleşmesi ve KVKK Gizlilik Politikasını kabul etmiş olursunuz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
