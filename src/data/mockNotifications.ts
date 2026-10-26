import { UserNotification } from '../types';

export const INITIAL_USER_NOTIFICATIONS: UserNotification[] = [
  {
    id: 'notif-welcome',
    type: 'sistem',
    title: 'Mutlular Plus Mahalle Platformuna Hoş Geldiniz',
    message: 'Mahallemizin dijital platformu gerçek kullanıma açılmıştır. İlan verebilir, esnafları keşfedebilir veya usta talebinde bulunabilirsiniz.',
    date: 'Şimdi',
    read: false,
    badgeText: 'HOŞ GELDİNİZ',
    sender: 'Mutlular Plus Yönetim',
    actionTab: 'profil',
  },
];
