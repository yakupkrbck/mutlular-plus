import { UserRole } from '../types';

export interface RoleConfig {
  id: UserRole;
  title: string;
  badge: string;
  desc: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  icon: string;
  permissions: string[];
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  'mahalle-sakini': {
    id: 'mahalle-sakini',
    title: 'Mahalle Sakini',
    badge: 'Mahalle Sakini',
    desc: 'Şehir sakini • Talep oluşturabilir, alışveriş yapabilir, ilan verebilir',
    color: '#059669',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    icon: '🏡',
    permissions: ['İlan Verme', 'Sipariş Verme', 'Kürsüye Yazma', 'Hizmet Talebi'],
  },
  'esnaf': {
    id: 'esnaf',
    title: 'Esnaf',
    badge: 'Esnaf / İşletme',
    desc: 'Doğrulanmış esnaf • Dükkan yönetimi, kampanya ve kupon yayınlama',
    color: '#d97706',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    icon: '🏪',
    permissions: ['İşletme Profili', 'Kupon Oluşturma', 'Sipariş Kabul', 'Vitrin İlanı'],
  },
  'usta': {
    id: 'usta',
    title: 'Usta',
    badge: 'Usta & Hizmet Veren',
    desc: 'Hizmet sağlayıcı • Gelen hizmet taleplerine fiyat teklifi verme',
    color: '#2563eb',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    icon: '🛠️',
    permissions: ['Teklif Verme', 'Talep İnceleme', 'Müşteri İletişimi', 'Usta Rozeti'],
  },
  'editor': {
    id: 'editor',
    title: 'Editör',
    badge: 'Haber Editörü',
    desc: 'Haber masası • İhbarları doğrulama, haber ve bülten yayınlama',
    color: '#7c3aed',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    icon: '✍️',
    permissions: ['Haber Ekleme', 'İhbar İnceleme', 'Canlı Yayın Başlatma', 'Duyuru Yayınlama'],
  },
  'yonetici': {
    id: 'yonetici',
    title: 'Yönetici',
    badge: 'Platform Yöneticisi',
    desc: 'Sistem yetkilisi • Moderasyon, onaylar, istatistik ve denetim',
    color: '#e11d48',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    icon: '🛡️',
    permissions: ['Tam Yetki', 'Esnaf Onaylama', 'Kullanıcı Yönetimi', 'Raporlar'],
  },
  'muhtar': {
    id: 'muhtar',
    title: 'Mahalle Muhtarı (Resmi Yetkili)',
    badge: '🏛️ Resmi Yetkili • Mahalle Muhtarı',
    desc: 'T.C. Resmi Mahalle Temsilcisi • Vatandaş başvurularını inceler, resmi duyuruları yönetir',
    color: '#b91c1c',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-700',
    badgeBorder: 'border-red-200',
    icon: '🏛️',
    permissions: [
      'Resmi Yetkili Rozeti',
      'Vatandaş Başvuruları & Talepler',
      'Muhtarlık Duyurusu Yayınlama',
      'Tebligat & Evrak Takibi',
      'Belediye Koordinasyonu',
    ],
  },
};
