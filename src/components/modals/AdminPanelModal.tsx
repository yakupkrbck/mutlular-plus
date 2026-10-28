import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Trash2,
  PlusCircle,
  FileText,
  Tag,
  MessageSquare,
  Store,
  Eye,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  Users,
  Radio,
  Clock,
  MapPin,
  Phone,
  Image as ImageIcon,
  Edit3,
  Save,
  Shield,
  UserCheck,
  BellRing,
  Megaphone,
  Send,
  Zap,
  LayoutDashboard,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  CheckSquare,
  Layers,
  HeartCrack,
} from 'lucide-react';
import {
  ClassifiedItem,
  NewsItem, HeroBannerItem,
  ObituaryItem,
  ClassifiedMainCategory,
  ClassifiedSubCategory,
  AssignedEditor,
  UserNotification,
} from '../../types';
import {
  sendAndroidAppNotification,
  AndroidPayloadType,
} from '../../services/androidNotificationService';
import { PLACEHOLDER_IMG } from '../../utils/placeholder';
import { ImageCropField } from '../ImageCropField';

export interface PendingAdItem extends ClassifiedItem {
  status: 'pending' | 'approved' | 'rejected';
  submittedBy?: string;
  submitDate?: string;
  rejectReason?: string;
}

export interface ModerateCommentItem {
  id: string;
  channel: string;
  author: string;
  text: string;
  time: string;
  reportsCount: number;
  status: 'active' | 'deleted' | 'flagged';
}

export interface PendingMerchantItem {
  id: string;
  businessName: string;
  category: string;
  ownerName: string;
  phone: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Live state from App
  classifiedList: ClassifiedItem[];
  newsList: NewsItem[];
  heroBanners?: HeroBannerItem[];
  pendingAds?: ClassifiedItem[];
  onRejectAd?: (adId: string) => void;
  onAddHeroBanner?: (b: HeroBannerItem) => void;
  onDeleteHeroBanner?: (id: string) => void;
  obituaryList?: ObituaryItem[];
  merchantsList?: PendingMerchantItem[];
  onApproveAd: (ad: ClassifiedItem) => void;
  onDeleteAd: (adId: string) => void;
  onUpdateAd?: (ad: ClassifiedItem) => void;
  onAddNewNews: (news: NewsItem) => void;
  onUpdateNews?: (news: NewsItem) => void;
  onDeleteNews: (newsId: string) => void;
  onBroadcastNotification?: (notif: UserNotification) => void;
  onApproveObituary?: (obId: string) => void;
  onRejectObituary?: (obId: string) => void;
  onDeleteObituary?: (obId: string) => void;
  onApproveMerchant?: (mId: string) => void;
  onRejectMerchant?: (mId: string) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  classifiedList,
  newsList,
  heroBanners = [],
  pendingAds: pendingAdsProp = [],
  onRejectAd,
  onAddHeroBanner,
  onDeleteHeroBanner,
  obituaryList = [],
  merchantsList: propMerchantsList,
  onApproveAd,
  onDeleteAd,
  onUpdateAd,
  onAddNewNews,
  onUpdateNews,
  onDeleteNews,
  onBroadcastNotification,
  onApproveObituary,
  onRejectObituary,
  onDeleteObituary,
  onApproveMerchant: onPropApproveMerchant,
  onRejectMerchant: onPropRejectMerchant,
}) => {
  // Tabs: 'dashboard' | 'onay-ilanlar' | 'cenaze-onay' | 'haber-yonetimi' | 'yorum-denetimi' | 'esnaf-onay' | 'editor-yonetimi' | 'istatistik' | 'bildirim-masasi'
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'onay-ilanlar' | 'cenaze-onay' | 'haber-yonetimi' | 'vitrin-afisleri' | 'yorum-denetimi' | 'esnaf-onay' | 'editor-yonetimi' | 'istatistik' | 'bildirim-masasi'
  >('dashboard');

  // Vitrin afişi formu
  const [bannerImage, setBannerImage] = useState('');
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerTag, setBannerTag] = useState('');
  const handleAddBanner = () => {
    if (!bannerImage) {
      window.alert('Lütfen afiş fotoğrafı yükleyin.');
      return;
    }
    if (!bannerTitle.trim()) {
      window.alert('Lütfen afiş başlığını yazın.');
      return;
    }
    onAddHeroBanner?.({
      id: `banner-${Date.now()}`,
      image: bannerImage,
      title: bannerTitle.trim(),
      tag: bannerTag.trim(),
    });
    setBannerImage('');
    setBannerTitle('');
    setBannerTag('');
  };

  // Push Broadcast Form States
  const [broadcastType, setBroadcastType] = useState<AndroidPayloadType>('duyuru');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastActionTab, setBroadcastActionTab] = useState('profil');
  const [broadcastBadgeText, setBroadcastBadgeText] = useState('YÖNETİCİ');
  const [isSendingPush, setIsSendingPush] = useState(false);

  // Assigned Editors (Yönetici Tarafından Atanan Yardımcı Editörler)
  const [assignedEditors, setAssignedEditors] = useState<AssignedEditor[]>([]);
  const [isAddingEditor, setIsAddingEditor] = useState(false);
  const [newEdName, setNewEdName] = useState('');
  const [newEdEmail, setNewEdEmail] = useState('');
  const [newEdPhone, setNewEdPhone] = useState('');
  const [newEdDuties, setNewEdDuties] = useState<string[]>([
    'İlan Onaylama & Denetim',
    'Esnaf Başvuru Onayı',
  ]);

  // 1. Pending / Active Ads State for admin moderation
  // Onay bekleyen ilanlar canlı veriden gelir (Firestore: status === 'pending')
  const pendingAds = pendingAdsProp as PendingAdItem[];

  // Editing state for active ads
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [editAdForm, setEditAdForm] = useState<{
    title: string;
    price: string;
    location: string;
    mainCategory: ClassifiedMainCategory;
    subCategory: ClassifiedSubCategory;
    description: string;
  }>({
    title: '',
    price: '',
    location: '',
    mainCategory: 'satilik',
    subCategory: 'ev',
    description: '',
  });

  // Editing state for news
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [editNewsForm, setEditNewsForm] = useState<{
    title: string;
    summary: string;
    category: string;
    urgent: boolean;
    image: string;
  }>({
    title: '',
    summary: '',
    category: 'Şehir & Yaşam',
    urgent: false,
    image: '',
  });

  // 2. Comments Moderation State
  const [commentsList, setCommentsList] = useState<ModerateCommentItem[]>([]);

  // 3. Pending Business / Merchant registrations
  const [localMerchantsList, setLocalMerchantsList] = useState<PendingMerchantItem[]>([]);
  const merchantsList = propMerchantsList || localMerchantsList;

  // 4. New News Form State
  const [newNewsTitle, setNewNewsTitle] = useState('');
  const [newNewsSummary, setNewNewsSummary] = useState('');
  const [newNewsCategory, setNewNewsCategory] = useState('Şehir & Yaşam');
  const [newNewsImage, setNewNewsImage] = useState('');
  const [newNewsUrgent, setNewNewsUrgent] = useState(false);
  const [newsSuccessToast, setNewsSuccessToast] = useState(false);

  // Search inside admin lists
  const [adFilterQuery, setAdFilterQuery] = useState('');
  const [newsFilterQuery, setNewsFilterQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Actions for Ads Moderation
  const handleApproveAdItem = (ad: PendingAdItem) => {
    onApproveAd(ad);
    showToast(`✓ "${ad.title.slice(0, 24)}..." ilanı onaylandı ve yayına alındı!`);
  };

  const handleRejectAdItem = (adId: string) => {
    onRejectAd?.(adId);
    showToast(`✕ İlan reddedildi.`);
  };

  const handleDeleteActiveAd = (adId: string, title: string) => {
    if (window.confirm(`"${title}" ilanını siteden tamamen silmek ve kaldırmak istediğinize emin misiniz?`)) {
      onDeleteAd(adId);
      showToast(`✓ İlan silindi: "${title.slice(0, 24)}..."`);
    }
  };

  const handleStartEditAd = (ad: ClassifiedItem) => {
    setEditingAdId(ad.id);
    setEditAdForm({
      title: ad.title,
      price: ad.price,
      location: ad.location,
      mainCategory: ad.mainCategory || 'satilik',
      subCategory: ad.subCategory || 'ev',
      description: ad.description,
    });
  };

  const handleSaveEditAd = (ad: ClassifiedItem) => {
    if (onUpdateAd) {
      onUpdateAd({
        ...ad,
        title: editAdForm.title,
        price: editAdForm.price,
        location: editAdForm.location,
        mainCategory: editAdForm.mainCategory,
        subCategory: editAdForm.subCategory,
        description: editAdForm.description,
      });
      showToast('✓ İlan başarıyla güncellendi!');
    }
    setEditingAdId(null);
  };

  // Actions for News Management
  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNewsTitle.trim() || !newNewsSummary.trim()) {
      alert('Lütfen haber başlığı ve özetini doldurunuz.');
      return;
    }

    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(
      now.getMonth() + 1
    ).padStart(2, '0')}.${now.getFullYear()} ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;

    const created: NewsItem = {
      id: `admin-news-${Date.now()}`,
      title: newNewsTitle.trim(),
      summary: newNewsSummary.trim(),
      category: newNewsCategory,
      date: formattedDate,
      urgent: newNewsUrgent,
      image: newNewsImage,
      readCount: '1 Okunma',
    };

    onAddNewNews(created);
    if (created.urgent) {
      sendAndroidAppNotification({
        title: `🚨 SON DAKİKA: ${created.title}`,
        body: created.summary,
        type: 'son_dakika',
        actionTab: 'haber',
        badgeText: 'SON DAKİKA',
        timestamp: Date.now(),
      });
      if (onBroadcastNotification) {
        onBroadcastNotification({
          id: `news-urgent-${Date.now()}`,
          type: 'haber',
          title: `Son Dakika: ${created.title}`,
          message: created.summary,
          date: 'Şimdi',
          read: false,
          badgeText: 'Son Dakika',
          sender: 'Haber Masası',
          actionTab: 'haber',
        });
      }
    }
    setNewNewsTitle('');
    setNewNewsSummary('');
      setNewNewsImage('');
    setNewsSuccessToast(true);
    showToast(`✓ Yeni haber "${created.title.slice(0, 22)}..." başarıyla yayınlandı!`);
    setTimeout(() => setNewsSuccessToast(false), 3000);
  };

  const handleDeleteNewsItem = (newsId: string, title: string) => {
    if (window.confirm(`"${title}" haberini siteden tamamen silmek istediğinize emin misiniz?`)) {
      onDeleteNews(newsId);
      showToast(`✓ Haber silindi.`);
    }
  };

  const handleStartEditNews = (item: NewsItem) => {
    setEditingNewsId(item.id);
    setEditNewsForm({
      title: item.title,
      summary: item.summary,
      category: item.category,
      urgent: !!item.urgent,
      image: item.image || '',
    });
  };

  const handleSaveEditNews = (item: NewsItem) => {
    if (onUpdateNews) {
      onUpdateNews({
        ...item,
        title: editNewsForm.title,
        summary: editNewsForm.summary,
        category: editNewsForm.category,
        urgent: editNewsForm.urgent,
        image: editNewsForm.image || item.image,
      });
      showToast('✓ Haber başarıyla güncellendi!');
    }
    setEditingNewsId(null);
  };

  // Actions for Comments Moderation
  const handleDeleteComment = (commentId: string) => {
    setCommentsList((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, status: 'deleted' } : c))
    );
    showToast(`✓ Yorum başarıyla silindi ve yayından kaldırıldı.`);
  };

  const handleApproveComment = (commentId: string) => {
    setCommentsList((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, status: 'active', reportsCount: 0 } : c))
    );
    showToast(`✓ Yorum incelendi ve güvenli olarak onaylandı.`);
  };

  // Actions for Merchants
  const handleApproveMerchant = (id: string, name: string) => {
    if (onPropApproveMerchant) {
      onPropApproveMerchant(id);
    }
    setLocalMerchantsList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'approved' } : m))
    );
    showToast(`✓ "${name}" esnafı onaylandı ve sisteme eklendi.`);
  };

  const handleRejectMerchant = (id: string) => {
    if (onPropRejectMerchant) {
      onPropRejectMerchant(id);
    }
    setLocalMerchantsList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'rejected' } : m))
    );
    showToast(`✕ Esnaf başvurusu reddedildi.`);
  };

  // Filtered lists and dashboard metrics
  const pendingCount = pendingAds.filter((a) => a.status === 'pending').length;
  const flaggedCommentsCount = commentsList.filter(
    (c) => c.status === 'flagged' || c.reportsCount > 0
  ).length;
  const pendingMerchantsCount = merchantsList.filter((m) => m.status === 'pending').length;
  const pendingObituariesCount = obituaryList.filter((o) => o.status === 'pending').length;
  const totalPendingCount =
    pendingCount + pendingMerchantsCount + flaggedCommentsCount + pendingObituariesCount;

  // Category counts and ratios
  const kiralikCount = classifiedList.filter((c) => c.mainCategory === 'kiralik').length;
  const satilikCount = classifiedList.filter((c) => c.mainCategory === 'satilik').length;
  const ikinciElCount = classifiedList.filter((c) => c.mainCategory === 'ikinci-el').length;
  const totalAdsSafe = classifiedList.length || 1;
  const kiralikPct = Math.round((kiralikCount / totalAdsSafe) * 100);
  const satilikPct = Math.round((satilikCount / totalAdsSafe) * 100);
  const ikinciElPct = Math.max(0, 100 - kiralikPct - satilikPct);

  const filteredClassifiedList = classifiedList.filter(
    (ad) =>
      !adFilterQuery.trim() ||
      ad.title.toLowerCase().includes(adFilterQuery.toLowerCase()) ||
      ad.location.toLowerCase().includes(adFilterQuery.toLowerCase()) ||
      ad.price.toLowerCase().includes(adFilterQuery.toLowerCase())
  );

  const filteredNewsList = newsList.filter(
    (n) =>
      !newsFilterQuery.trim() ||
      n.title.toLowerCase().includes(newsFilterQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(newsFilterQuery.toLowerCase()) ||
      n.summary.toLowerCase().includes(newsFilterQuery.toLowerCase())
  );

  // Push Notification Dispatchers for Admin
  const handleBroadcastAdPush = async (ad: ClassifiedItem) => {
    await sendAndroidAppNotification({
      title: `🏷️ Öne Çıkan İlan: ${ad.title}`,
      body: `${ad.price} • ${ad.location} - İlanı incelemek için dokunun.`,
      type: 'ilan',
      actionTab: 'alim_satim',
      relatedId: ad.id,
      badgeText: ad.mainCategory?.toUpperCase() || 'İLAN',
      timestamp: Date.now(),
    });

    if (onBroadcastNotification) {
      onBroadcastNotification({
        id: `ad-push-${Date.now()}`,
        type: 'ilan',
        title: `🏷️ Öne Çıkan İlan: ${ad.title}`,
        message: `${ad.price} • ${ad.location} - İlan detayını incelemek için dokunun.`,
        date: 'Şimdi',
        read: false,
        relatedId: ad.id,
        badgeText: ad.mainCategory?.toUpperCase() || 'Öne Çıkan İlan',
        sender: 'Mutlular İlan Masası',
        actionTab: 'alim_satim',
      });
    }

    showToast(`📢 "${ad.title}" ilanı tüm kullanıcılara push bildirim olarak iletildi!`);
  };

  const handleBroadcastNewsPush = async (item: NewsItem) => {
    await sendAndroidAppNotification({
      title: `🚨 SON DAKİKA: ${item.title}`,
      body: item.summary,
      type: 'son_dakika',
      actionTab: 'haber',
      relatedId: item.id,
      badgeText: 'SON DAKİKA',
      timestamp: Date.now(),
    });

    if (onBroadcastNotification) {
      onBroadcastNotification({
        id: `news-push-${Date.now()}`,
        type: 'haber',
        title: `🚨 SON DAKİKA: ${item.title}`,
        message: item.summary,
        date: 'Şimdi',
        read: false,
        relatedId: item.id,
        badgeText: 'SON DAKİKA',
        sender: 'Mutlular Haber & Basın',
        actionTab: 'haber',
      });
    }

    showToast(`🚨 "${item.title}" haberi Son Dakika bildirimi olarak gönderildi!`);
  };

  const handleSendCustomPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) {
      showToast('Lütfen başlık ve mesaj alanını doldurun.');
      return;
    }

    setIsSendingPush(true);
    await sendAndroidAppNotification({
      title: broadcastTitle,
      body: broadcastBody,
      type: broadcastType,
      actionTab: broadcastActionTab,
      badgeText: broadcastBadgeText || 'DUYURU',
      timestamp: Date.now(),
    });

    if (onBroadcastNotification) {
      onBroadcastNotification({
        id: `admin-broadcast-${Date.now()}`,
        type:
          broadcastType === 'son_dakika' || broadcastType === 'haber'
            ? 'haber'
            : broadcastType === 'canli_yayin'
            ? 'canli_yayin'
            : broadcastType === 'vefat'
            ? 'vefat'
            : broadcastType === 'ilan'
            ? 'ilan'
            : broadcastType === 'duyuru'
            ? 'duyuru'
            : broadcastType === 'usta_talep' || broadcastType === 'kullanici_teklif'
            ? 'teklif'
            : 'ozel',
        title: broadcastTitle,
        message: broadcastBody,
        date: 'Şimdi',
        read: false,
        badgeText: broadcastBadgeText || 'Yönetici',
        sender: 'Mutlular Yönetim & Muhtarlık',
        actionTab: broadcastActionTab,
      });
    }

    setTimeout(() => {
      setIsSendingPush(false);
      showToast('🚀 Bildirim tüm Android cihazlara ve Heads-up merkezine iletildi!');
      setBroadcastTitle('');
      setBroadcastBody('');
    }, 500);
  };

  const applyPresetTemplate = (preset: {
    type: AndroidPayloadType;
    title: string;
    body: string;
    actionTab: string;
    badgeText: string;
  }) => {
    setBroadcastType(preset.type);
    setBroadcastTitle(preset.title);
    setBroadcastBody(preset.body);
    setBroadcastActionTab(preset.actionTab);
    setBroadcastBadgeText(preset.badgeText);
    showToast(`"${preset.badgeText}" şablonu yüklendi.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 text-white flex flex-col w-full h-full overflow-hidden animate-in fade-in duration-200">
      <div className="bg-neutral-900 text-white w-full h-full flex flex-col overflow-hidden border-0">
        {/* Admin Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-neutral-950 via-neutral-900 to-rose-950 border-b border-neutral-800 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-inner shrink-0">
              <ShieldCheck className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  TAM DENETİM & YÖNETİM MERKEZİ
                </h2>
                <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  SÜPER ADMİN
                </span>
                <span className="bg-white/10 text-neutral-300 text-[9px] font-bold px-2 py-0.5 rounded-full hidden sm:inline-block">
                  Tam Ekran Görünüm
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-medium">
                Tüm İlanlar, Haberler, Cenaze Duyuruları, Esnaf Onayları ve Topluluk Moderasyonu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center justify-center transition active:scale-95"
              title="Paneli Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Toast Notification inside panel */}
        {toastMessage && (
          <div className="bg-emerald-500 text-neutral-950 px-4 py-2 text-xs font-black flex items-center gap-2 animate-in slide-in-from-top duration-150">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-neutral-950/80 p-1.5 border-b border-neutral-800 flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-2 rounded-xl text-[11px] font-black flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md ring-1 ring-white/20'
                : 'text-blue-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-blue-300" />
            <span>📊 Özet Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('onay-ilanlar')}
            className={`px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'onay-ilanlar'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Tüm İlanlar ({classifiedList.length})</span>
            {pendingCount > 0 && (
              <span className="bg-amber-400 text-neutral-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                {pendingCount} onay bekliyor
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('cenaze-onay')}
            className={`px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'cenaze-onay'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <HeartCrack className="w-3.5 h-3.5 text-rose-400" />
            <span>Cenaze İlanları ({obituaryList.length})</span>
            {pendingObituariesCount > 0 && (
              <span className="bg-amber-400 text-neutral-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                {pendingObituariesCount} bekliyor
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('vitrin-afisleri')}
            className={`px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'vitrin-afisleri'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Vitrin Afişleri ({heroBanners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('haber-yonetimi')}
            className={`px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'haber-yonetimi'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Tüm Haberler ({newsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('yorum-denetimi')}
            className={`px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'yorum-denetimi'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Yorum & Sohbet Silme</span>
            {flaggedCommentsCount > 0 && (
              <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                {flaggedCommentsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('esnaf-onay')}
            className={`px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'esnaf-onay'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Esnaf Başvuruları</span>
            {pendingMerchantsCount > 0 && (
              <span className="bg-amber-400 text-neutral-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                {pendingMerchantsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('editor-yonetimi')}
            className={`px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'editor-yonetimi'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Editör & Yardımcılar ({assignedEditors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('istatistik')}
            className={`px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'istatistik'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Genel Rapor</span>
          </button>

          <button
            onClick={() => setActiveTab('bildirim-masasi')}
            className={`px-3 py-2 rounded-xl text-[11px] font-black flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'bildirim-masasi'
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md'
                : 'text-amber-300 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <BellRing className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>📢 Bildirim Masası (Push Gönder)</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-neutral-200">
          {/* TAB 0: ADMIN ÖZET DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Hero Status Bar */}
              <div className="p-4 bg-gradient-to-r from-neutral-900 via-indigo-950/40 to-neutral-900 rounded-2xl border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-black text-white tracking-tight">
                        Admin Özet Dashboard
                      </h3>
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Canlı Senkronize
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-medium">
                      Günlük Kullanıcı Hacmi • İlan Dağılımı • Bekleyen Moderasyon Başvuruları
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-semibold bg-neutral-950/60 px-3 py-1.5 rounded-xl border border-neutral-800">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Nilüfer / Bursa • 11 Ekim 2026</span>
                </div>
              </div>

              {/* 3 KEY VISUAL METRIC CARDS (Requested by User) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* CARD 1: GERÇEK İÇERİK ÖZETİ (canlı veriden) */}
                <div className="p-4 rounded-2xl bg-neutral-800/80 border border-blue-500/30 relative overflow-hidden flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-300">
                      Platform Özeti
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
                    <div className="p-2 rounded-lg bg-neutral-900/60">
                      <div className="text-neutral-400 font-medium">Haber</div>
                      <div className="font-black text-white text-lg">{newsList.length}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-neutral-900/60">
                      <div className="text-neutral-400 font-medium">Onaylı Esnaf</div>
                      <div className="font-black text-amber-400 text-lg">
                        {(propMerchantsList || []).filter((m) => m.status === 'approved').length}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-neutral-900/60">
                      <div className="text-neutral-400 font-medium">Vefat İlanı</div>
                      <div className="font-black text-blue-400 text-lg">{obituaryList.length}</div>
                    </div>
                  </div>
                </div>

                {/* CARD 2: TOPLAM İLAN SAYISI */}
                <div className="p-4 rounded-2xl bg-neutral-800/80 border border-emerald-500/30 hover:border-emerald-500/60 transition shadow-md flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                          <Tag className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                          Toplam İlan Sayısı
                        </span>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {classifiedList.length} Aktif
                      </span>
                    </div>

                    {/* Main KPI Value */}
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-black text-white tracking-tight">
                        {classifiedList.length}
                      </span>
                      <span className="text-xs text-neutral-400 font-bold">yayında ilan</span>
                    </div>

                    {/* Sub-metric */}
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-300 font-semibold mt-1">
                      <span className="text-emerald-400 font-bold">+{kiralikCount}</span> kiralık daire •
                      <span className="text-rose-400 font-bold">+{satilikCount}</span> satılık •
                      <span className="text-amber-400 font-bold">+{ikinciElCount}</span> 2. el
                    </div>

                    {/* Segmented Category Progress Bar */}
                    <div className="mt-3 pt-3 border-t border-neutral-700/60 space-y-2">
                      <div className="flex items-center justify-between text-[9.5px] font-bold text-neutral-400 uppercase">
                        <span>Kategori Dağılım Oranları</span>
                        <span className="text-emerald-300 font-black">
                          %{kiralikPct} Kiralık Baskın
                        </span>
                      </div>

                      {/* Stacked Progress Bar */}
                      <div className="w-full h-3 rounded-full bg-neutral-900 overflow-hidden flex p-0.5 gap-0.5">
                        <div
                          style={{ width: `${Math.max(kiralikPct, 5)}%` }}
                          title={`Kiralık: ${kiralikCount} ilan (%${kiralikPct})`}
                          className="h-full bg-emerald-500 rounded-l-full transition-all"
                        />
                        <div
                          style={{ width: `${Math.max(satilikPct, 5)}%` }}
                          title={`Satılık: ${satilikCount} ilan (%${satilikPct})`}
                          className="h-full bg-rose-500 transition-all"
                        />
                        <div
                          style={{ width: `${Math.max(ikinciElPct, 5)}%` }}
                          title={`2. El / Eşya: ${ikinciElCount} ilan (%${ikinciElPct})`}
                          className="h-full bg-amber-500 rounded-r-full transition-all"
                        />
                      </div>

                      {/* Legend Details */}
                      <div className="grid grid-cols-3 gap-1 pt-1 text-[10px]">
                        <div className="p-1.5 rounded-lg bg-neutral-900/60 border border-emerald-500/20">
                          <div className="flex items-center gap-1 text-emerald-400 font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Kiralık</span>
                          </div>
                          <div className="font-black text-white mt-0.5">
                            {kiralikCount} ({kiralikPct}%)
                          </div>
                        </div>

                        <div className="p-1.5 rounded-lg bg-neutral-900/60 border border-rose-500/20">
                          <div className="flex items-center gap-1 text-rose-400 font-bold">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            <span>Satılık</span>
                          </div>
                          <div className="font-black text-white mt-0.5">
                            {satilikCount} ({satilikPct}%)
                          </div>
                        </div>

                        <div className="p-1.5 rounded-lg bg-neutral-900/60 border border-amber-500/20">
                          <div className="flex items-center gap-1 text-amber-400 font-bold">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>2. El</span>
                          </div>
                          <div className="font-black text-white mt-0.5">
                            {ikinciElCount} ({ikinciElPct}%)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Direct Action Button */}
                  <div className="mt-3 pt-2.5 border-t border-neutral-700/60">
                    <button
                      onClick={() => setActiveTab('onay-ilanlar')}
                      className="w-full py-1.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-black flex items-center justify-center gap-1.5 transition active:scale-98"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>İlan Listesini & Fiyatları Düzenle →</span>
                    </button>
                  </div>
                </div>

                {/* CARD 3: BEKLEYEN BAŞVURU SAYISI */}
                <div className="p-4 rounded-2xl bg-neutral-800/80 border border-amber-500/30 hover:border-amber-500/60 transition shadow-md flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                          <Clock className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                          Bekleyen Başvuru Sayısı
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                          totalPendingCount > 0
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {totalPendingCount > 0 ? 'İnceleme Bekliyor' : 'Kuyruk Temiz'}
                      </span>
                    </div>

                    {/* Main KPI Value */}
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-black text-amber-400 tracking-tight">
                        {totalPendingCount}
                      </span>
                      <span className="text-xs text-neutral-400 font-bold">toplam onay kuyruğu</span>
                    </div>

                    {/* Sub-metric */}
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-300 font-semibold mt-1">
                      <span className="text-amber-400 font-bold">{pendingCount}</span> ilan •
                      <span className="text-blue-400 font-bold">{pendingMerchantsCount}</span> esnaf kaydı •
                      <span className="text-rose-400 font-bold">{flaggedCommentsCount}</span> şikayetli içerik
                    </div>

                    {/* Breakdown Matrix Cards */}
                    <div className="mt-3 pt-3 border-t border-neutral-700/60 space-y-1.5">
                      <div className="text-[9.5px] font-bold text-neutral-400 uppercase tracking-wider mb-1 flex justify-between">
                        <span>Moderasyon Kalemleri</span>
                        <span className="text-neutral-400">Ort. Süre: ~12 dk</span>
                      </div>

                      {/* Pending Ad Item */}
                      <button
                        onClick={() => setActiveTab('onay-ilanlar')}
                        className="w-full p-2 rounded-xl bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-700/70 flex items-center justify-between text-left transition"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          <span className="text-[11px] font-bold text-neutral-200">
                            Onay Bekleyen İlanlar
                          </span>
                        </div>
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {pendingCount} Adet
                        </span>
                      </button>

                      {/* Pending Merchant Registration */}
                      <button
                        onClick={() => setActiveTab('esnaf-onay')}
                        className="w-full p-2 rounded-xl bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-700/70 flex items-center justify-between text-left transition"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-400" />
                          <span className="text-[11px] font-bold text-neutral-200">
                            Esnaf Dükkan Başvuruları
                          </span>
                        </div>
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {pendingMerchantsCount} Esnaf
                        </span>
                      </button>

                      {/* Flagged Comments */}
                      <button
                        onClick={() => setActiveTab('yorum-denetimi')}
                        className="w-full p-2 rounded-xl bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-700/70 flex items-center justify-between text-left transition"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-rose-400" />
                          <span className="text-[11px] font-bold text-neutral-200">
                            Şikayet Edilen Yorumlar
                          </span>
                        </div>
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {flaggedCommentsCount} Yorum
                        </span>
                      </button>

                      {/* Pending Obituaries */}
                      <button
                        onClick={() => setActiveTab('cenaze-onay')}
                        className="w-full p-2 rounded-xl bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-700/70 flex items-center justify-between text-left transition"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          <span className="text-[11px] font-bold text-neutral-200">
                            Onay Bekleyen Cenaze İlanları
                          </span>
                        </div>
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {pendingObituariesCount} Cenaze
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Direct Action Button */}
                  <div className="mt-3 pt-2.5 border-t border-neutral-700/60">
                    <button
                      onClick={() =>
                        setActiveTab(pendingCount > 0 ? 'onay-ilanlar' : 'esnaf-onay')
                      }
                      className="w-full py-1.5 px-3 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-[11px] font-black flex items-center justify-center gap-1.5 transition active:scale-98"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Onay Bekleyenleri İncele & Karara Bağla →</span>
                    </button>
                  </div>
                </div>
              </div>

              

              {/* QUICK ADMIN ACTIONS & CONVERSION METRICS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Moderation Funnel Performance */}
                <div className="p-3.5 bg-neutral-800/80 rounded-2xl border border-neutral-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Onay & Moderasyon Performansı</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-extrabold">%94.2 Başarılı</span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div>
                      <div className="flex justify-between font-semibold text-neutral-300 mb-0.5">
                        <span>İlan Onay Oranı</span>
                        <span className="text-white font-black">%96 (24/25)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-neutral-900 overflow-hidden">
                        <div className="w-[96%] h-full bg-emerald-500 rounded-full" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold text-neutral-300 mb-0.5">
                        <span>Esnaf Kabul Oranı</span>
                        <span className="text-white font-black">%92 (11/12)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-neutral-900 overflow-hidden">
                        <div className="w-[92%] h-full bg-blue-500 rounded-full" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold text-neutral-300 mb-0.5">
                        <span>Spam / Şikayet Temizleme</span>
                        <span className="text-white font-black">%100 Temizlendi</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-neutral-900 overflow-hidden">
                        <div className="w-full h-full bg-rose-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="p-3.5 bg-neutral-800/80 rounded-2xl border border-neutral-700 space-y-2">
                  <span className="text-[11px] font-black text-white uppercase tracking-wider block">
                    ⚡ Yönetici Hızlı Aksiyonları
                  </span>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold">
                    <button
                      onClick={() => setActiveTab('bildirim-masasi')}
                      className="p-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition text-left"
                    >
                      <BellRing className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">Push Gönder</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('onay-ilanlar')}
                      className="p-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition text-left"
                    >
                      <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">İlanları Yönet</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('haber-yonetimi')}
                      className="p-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 flex items-center gap-1.5 transition text-left"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">Haber Ekle</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('esnaf-onay')}
                      className="p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition text-left"
                    >
                      <Store className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">Esnaf Onayı ({pendingMerchantsCount})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: İLANLARI DÜZENLEME, SİLME VE ONAYLAMA */}
          {activeTab === 'onay-ilanlar' && (
            <div className="space-y-4">
              {/* Summary & Search banner */}
              <div className="p-3 bg-neutral-800/80 rounded-2xl border border-neutral-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-extrabold text-white flex items-center gap-1.5">
                      <span>Tüm İlanları Yönet, Düzenle & Sil</span>
                      <span className="text-amber-400">({classifiedList.length} Yayında)</span>
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Sayfadaki mevcut her ilanı tek tıkla silebilir veya içeriğini düzenleyebilirsiniz.
                    </div>
                  </div>
                </div>

                <div className="relative pt-1">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 mt-0.5" />
                  <input
                    type="text"
                    value={adFilterQuery}
                    onChange={(e) => setAdFilterQuery(e.target.value)}
                    placeholder="İlan başlığı, mahalle veya fiyat ara..."
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Pending Ads queue */}
              {pendingAds.filter((a) => a.status === 'pending').length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Onay Bekleyen Yeni İlanlar</span>
                  </div>

                  <div className="space-y-2.5">
                    {pendingAds
                      .filter((a) => a.status === 'pending')
                      .map((ad) => (
                        <div
                          key={ad.id}
                          className="p-3 rounded-2xl border bg-neutral-800/90 border-amber-500/40"
                        >
                          <div className="flex gap-3">
                            <img
                              src={ad.image}
                              alt={ad.title}
                              className="w-16 h-16 rounded-xl object-cover shrink-0 bg-neutral-900 border border-neutral-700"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[9px] font-black px-2 py-0.2 rounded uppercase bg-amber-500 text-neutral-950">
                                  {ad.mainCategory?.toUpperCase() || 'İLAN'}
                                </span>
                                <span className="text-[10px] text-neutral-400">
                                  {ad.submittedBy}
                                </span>
                              </div>
                              <h4 className="text-[12.5px] font-black text-white leading-tight truncate">
                                {ad.title}
                              </h4>
                              <div className="text-[11.5px] font-extrabold text-amber-400">
                                {ad.price}
                              </div>

                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() => handleApproveAdItem(ad)}
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10.5px] py-1.5 rounded-xl flex items-center justify-center gap-1 transition"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Onayla ve Yayınla</span>
                                </button>
                                <button
                                  onClick={() => handleRejectAdItem(ad.id)}
                                  className="bg-neutral-700 hover:bg-neutral-600 text-rose-300 font-bold text-[10.5px] py-1.5 px-3 rounded-xl flex items-center justify-center gap-1 transition"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Reddet</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* All Live Classifieds List with Live Edit & Live Delete */}
              <div className="space-y-2 pt-1 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-black text-neutral-300 uppercase tracking-wider">
                    Sitedeki Mevcut Tüm İlanlar ({filteredClassifiedList.length})
                  </div>
                  <span className="text-[10px] text-rose-400 font-bold">
                    Yönetici Düzenleyebilir & Silebilir
                  </span>
                </div>

                <div className="space-y-2.5">
                  {filteredClassifiedList.map((ad) => {
                    const isEditing = editingAdId === ad.id;

                    if (isEditing) {
                      return (
                        <div
                          key={ad.id}
                          className="p-3 bg-neutral-800 border-2 border-rose-500/70 rounded-2xl space-y-2.5 animate-in fade-in"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-rose-400 flex items-center gap-1">
                              <Edit3 className="w-3.5 h-3.5" />
                              İlanı Düzenle: {ad.id}
                            </span>
                            <button
                              onClick={() => setEditingAdId(null)}
                              className="text-neutral-400 hover:text-white text-xs"
                            >
                              İptal
                            </button>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">
                                İlan Başlığı
                              </label>
                              <input
                                type="text"
                                value={editAdForm.title}
                                onChange={(e) =>
                                  setEditAdForm((prev) => ({ ...prev, title: e.target.value }))
                                }
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">
                                  Fiyat
                                </label>
                                <input
                                  type="text"
                                  value={editAdForm.price}
                                  onChange={(e) =>
                                    setEditAdForm((prev) => ({ ...prev, price: e.target.value }))
                                  }
                                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">
                                  Konum
                                </label>
                                <input
                                  type="text"
                                  value={editAdForm.location}
                                  onChange={(e) =>
                                    setEditAdForm((prev) => ({ ...prev, location: e.target.value }))
                                  }
                                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">
                                  Üst Kategori
                                </label>
                                <select
                                  value={editAdForm.mainCategory}
                                  onChange={(e) =>
                                    setEditAdForm((prev) => ({
                                      ...prev,
                                      mainCategory: e.target.value as ClassifiedMainCategory,
                                    }))
                                  }
                                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-white"
                                >
                                  <option value="kiralik">Kiralık</option>
                                  <option value="satilik">Satılık</option>
                                  <option value="ikinci-el">2. El</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">
                                  Alt Kategori
                                </label>
                                <select
                                  value={editAdForm.subCategory}
                                  onChange={(e) =>
                                    setEditAdForm((prev) => ({
                                      ...prev,
                                      subCategory: e.target.value as ClassifiedSubCategory,
                                    }))
                                  }
                                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-white"
                                >
                                  <option value="ev">Ev / Konut</option>
                                  <option value="tarla">Tarla</option>
                                  <option value="arsa">Arsa</option>
                                  <option value="depo">Depo</option>
                                  <option value="arac">Araç</option>
                                  <option value="elektronik">Elektronik</option>
                                  <option value="diger">Diğer / Her Şey</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">
                                Açıklama
                              </label>
                              <textarea
                                rows={2}
                                value={editAdForm.description}
                                onChange={(e) =>
                                  setEditAdForm((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                  }))
                                }
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white"
                              />
                            </div>
                          </div>

                          <button
                            onClick={() => handleSaveEditAd(ad)}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Save className="w-4 h-4" />
                            <span>Değişiklikleri Kaydet & Yayına Al</span>
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={ad.id}
                        className="p-3 bg-neutral-800/60 hover:bg-neutral-800 rounded-xl border border-neutral-700/60 flex items-center justify-between gap-3 transition"
                      >
                        <img
                          src={ad.image}
                          alt={ad.title}
                          className="w-14 h-14 rounded-xl object-cover bg-neutral-900 shrink-0 border border-neutral-700"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span
                              className={`text-[8.5px] font-black px-1.5 py-0.2 rounded uppercase ${
                                ad.mainCategory === 'kiralik'
                                  ? 'bg-emerald-600 text-white'
                                  : ad.mainCategory === 'satilik'
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-amber-600 text-white'
                              }`}
                            >
                              {ad.mainCategory?.toUpperCase() || 'İLAN'}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-semibold truncate">
                              {ad.location}
                            </span>
                          </div>
                          <div className="text-[12.5px] font-bold text-white truncate leading-tight">
                            {ad.title}
                          </div>
                          <div className="text-[11px] text-amber-400 font-extrabold mt-0.5">
                            {ad.price}
                          </div>
                        </div>

                        {/* Push, Edit and Delete Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleBroadcastAdPush(ad)}
                            title="Bu İlanı Android Push Bildirimi Olarak Gönder"
                            className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-neutral-950 border border-amber-500/30 transition flex items-center gap-1 text-[10.5px] font-bold"
                          >
                            <BellRing className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Push</span>
                          </button>
                          <button
                            onClick={() => handleStartEditAd(ad)}
                            title="İlanı Düzenle"
                            className="p-2 rounded-lg bg-neutral-700 hover:bg-amber-600 text-neutral-200 hover:text-neutral-950 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteActiveAd(ad.id, ad.title)}
                            title="İlanı Yayından Tamamen Sil"
                            className="p-2 rounded-lg bg-rose-900/60 hover:bg-rose-600 text-rose-200 hover:text-white transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CENAZE VE VEFAT İLANLARI ONAY & YÖNETİM MASASI */}
          {activeTab === 'cenaze-onay' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-neutral-800/80 rounded-2xl border border-neutral-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <HeartCrack className="w-4 h-4 text-rose-400" />
                      <span>CENAZE & VEFAT İLANLARI ONAY MASASI</span>
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Kayıtlı sakinlerin gönderdiği vefat ilanlarını denetleyin, onaylayın veya vitrinden kaldırın.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {pendingObituariesCount} Onay Bekliyor
                  </span>
                </div>
              </div>

              {/* BEKLEYEN CENAZE İLANLARI */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                    ONAY BEKLEYEN İLANLAR ({pendingObituariesCount})
                  </h4>
                </div>

                {obituaryList.filter((o) => o.status === 'pending').length === 0 ? (
                  <div className="p-6 rounded-2xl bg-neutral-800/40 border border-neutral-700/60 text-center text-neutral-400 space-y-1">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                    <p className="text-xs font-bold text-white">Onay bekleyen cenaze ilanı bulunmuyor.</p>
                    <p className="text-[11px]">Mahalle sakinlerinin paylaştığı tüm ilanlar incelenmiştir.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {obituaryList
                      .filter((o) => o.status === 'pending')
                      .map((ob) => {
                        return (
                          <div
                            key={ob.id}
                            className="p-4 rounded-2xl bg-neutral-800/90 border border-amber-500/40 space-y-3 shadow-md"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h5 className="text-[14px] font-black text-white">{ob.name}</h5>
                                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    İnceleme Bekliyor
                                  </span>
                                </div>
                                <p className="text-[11px] text-neutral-300 mt-0.5">
                                  Memleketi: <strong className="text-rose-300">{ob.hometown}</strong> | Gönderen: {ob.submittedBy?.name || 'Kayıtlı Sakin'} ({ob.submittedBy?.phone || ob.phone})
                                </p>
                              </div>
                              <span className="text-[10px] text-neutral-400 font-semibold">{ob.submittedBy?.date || 'Bugün'}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-neutral-900/80 p-3 rounded-xl border border-neutral-700 text-neutral-300">
                              <div>
                                <div><strong className="text-white">Babasının İsmi:</strong> {ob.fatherName}</div>
                                {ob.sonName && <div><strong className="text-white">Oğlu / Yakınları:</strong> {ob.sonName}</div>}
                                <div><strong className="text-white">Cenaze Namazı:</strong> {ob.date}</div>
                              </div>
                              <div>
                                <div><strong className="text-white">Cami:</strong> {ob.mosque}</div>
                                <div><strong className="text-white">Defin Mezarlığı:</strong> {ob.cemetery}</div>
                                <div><strong className="text-white">Taziye Telefonu:</strong> <a href={`tel:${ob.phone}`} className="text-emerald-400 font-bold underline">{ob.phone}</a></div>
                              </div>
                            </div>

                            {ob.notes && (
                              <div className="text-[11px] text-neutral-300 bg-neutral-900/50 p-2 rounded-lg border border-neutral-700/60">
                                <span className="font-bold text-neutral-400">Not: </span>
                                {ob.notes}
                              </div>
                            )}

                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => {
                                  if (onApproveObituary) {
                                    onApproveObituary(ob.id);
                                    showToast(`✓ "${ob.name}" cenaze ilanı onaylandı ve vitrinde yayınlandı.`);
                                  }
                                }}
                                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Onayla & Vitrinde Yayınla</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (onRejectObituary) {
                                    onRejectObituary(ob.id);
                                    showToast(`✕ Cenaze ilanı başvurusu reddedildi.`);
                                  }
                                }}
                                className="py-2 px-3 rounded-xl bg-neutral-700 hover:bg-rose-900/60 text-rose-300 hover:text-white border border-neutral-600 hover:border-rose-500 font-bold text-xs flex items-center gap-1 transition"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reddet</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* VİTRİNDE YAYINDA OLAN CENAZE İLANLARI */}
              <div className="space-y-3 pt-3 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                      VİTRİNDE YAYINDAKİ CENAZE İLANLARI ({obituaryList.filter((o) => o.status === 'approved').length})
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {obituaryList
                    .filter((o) => o.status === 'approved')
                    .map((ob) => (
                      <div
                        key={ob.id}
                        className="p-3.5 rounded-2xl bg-neutral-800/70 border border-neutral-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-[13px] font-black text-white">{ob.name}</h5>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Yayında
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-300 mt-0.5">
                            Memleketi: <strong>{ob.hometown}</strong> • Babası: {ob.fatherName} {ob.sonName ? `• Oğlu: ${ob.sonName}` : ''}
                          </p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            Namaz: {ob.date} ({ob.mosque}) • Mezarlık: {ob.cemetery} • Tel: {ob.phone}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={async () => {
                              await sendAndroidAppNotification({
                                title: `🕊️ Vefat & Taziye: ${ob.name}`,
                                body: `Cenazesi ${ob.date} vakti ${ob.mosque} camiinden kaldırılacaktır. Memleketi: ${ob.hometown}. Taziye: ${ob.phone}.`,
                                type: 'vefat',
                                actionTab: 'vefat',
                                badgeText: 'VEFAT & TAZİYE',
                                timestamp: Date.now(),
                              });
                              showToast(`🕊️ "${ob.name}" için mahalleye taziye bildirimi iletildi.`);
                            }}
                            className="py-1.5 px-3 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-bold flex items-center gap-1.5 transition"
                            title="Tüm mahalleye tekrar push bildirimi gönder"
                          >
                            <BellRing className="w-3.5 h-3.5 text-rose-400" />
                            <span>Tekrar Bildir</span>
                          </button>

                          {onDeleteObituary && (
                            <button
                              onClick={() => {
                                onDeleteObituary(ob.id);
                                showToast(`✓ İlan vitrinden silindi.`);
                              }}
                              className="p-2 rounded-xl bg-neutral-700/60 hover:bg-rose-900/50 text-neutral-400 hover:text-rose-300 border border-neutral-700 hover:border-rose-500/50 transition"
                              title="İlanı Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TÜM HABERLERİ YÖNETME, DÜZENLEME, SİLME VE YENİ HABER GİRME */}
          {activeTab === 'vitrin-afisleri' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-800/80 border border-neutral-700 space-y-3">
                <h3 className="text-sm font-black text-white">Yeni Vitrin Afişi</h3>
                <p className="text-[11px] text-neutral-400">
                  Ana sayfanın en üstündeki kayan alanda haberlerden önce gösterilir.
                </p>
                <div className="bg-white rounded-xl p-2">
                  <ImageCropField
                    value={bannerImage}
                    onChange={setBannerImage}
                    aspect={16 / 10}
                    outputWidth={1200}
                    hint="Galeriden yükleyin, kadrajı ayarlayın."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-300 uppercase mb-1">Başlık *</label>
                  <input
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    maxLength={80}
                    placeholder="Örn: Mahalle Pazarı Cumartesi Kuruluyor"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-300 uppercase mb-1">
                    Etiket (isteğe bağlı)
                  </label>
                  <input
                    value={bannerTag}
                    onChange={(e) => setBannerTag(e.target.value)}
                    maxLength={30}
                    placeholder="Örn: Duyuru"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddBanner}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl py-2.5"
                >
                  Afişi Yayınla
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-black text-white">Yayındaki Afişler ({heroBanners.length})</h3>
                {heroBanners.length === 0 && (
                  <p className="text-[11px] text-neutral-400">Henüz afiş yok. Ana sayfada yalnızca haberler görünür.</p>
                )}
                {heroBanners.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700">
                    <img src={b.image} alt="" className="w-20 h-12 object-cover rounded-lg shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">{b.title}</div>
                      {b.tag && <div className="text-[10px] text-amber-300">{b.tag}</div>}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Bu afiş silinsin mi?')) onDeleteHeroBanner?.(b.id);
                      }}
                      className="shrink-0 text-[11px] font-black text-rose-400 hover:text-rose-300 px-2 py-1"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'haber-yonetimi' && (
            <div className="space-y-4">
              {/* Add New News Box */}
              <div className="p-4 bg-neutral-800/80 rounded-2xl border border-neutral-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-rose-500" />
                    <h3 className="text-[13px] font-black text-white">
                      YENİ HABER YAYINLA
                    </h3>
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    Haber vitrinine ve haberler sekmesine canlı aktarılır
                  </span>
                </div>

                <form onSubmit={handleCreateNews} className="space-y-3">
                  <div>
                    <label className="block text-[10.5px] font-bold text-neutral-300 uppercase mb-1">
                      Haber Başlığı *
                    </label>
                    <input
                      type="text"
                      value={newNewsTitle}
                      onChange={(e) => setNewNewsTitle(e.target.value)}
                      placeholder="Örn: Burulaş Otobüs Seferlerinde Yeni Güzergahlar Açıldı"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-neutral-300 uppercase mb-1">
                      Haber Özeti & Detayı *
                    </label>
                    <textarea
                      rows={2}
                      value={newNewsSummary}
                      onChange={(e) => setNewNewsSummary(e.target.value)}
                      placeholder="Haber içeriği ve detaylı bilgilendirme metni..."
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 font-medium"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-300 uppercase mb-1">
                        Kategori
                      </label>
                      <select
                        value={newNewsCategory}
                        onChange={(e) => setNewNewsCategory(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                      >
                        <option value="Şehir & Yaşam">Şehir & Yaşam</option>
                        <option value="Eğitim & Kampüs">Eğitim & Kampüs</option>
                        <option value="Esnaf & Ekonomi">Esnaf & Ekonomi</option>
                        <option value="Kültür & Turizm">Kültür & Turizm</option>
                        <option value="Spor">Spor</option>
                        <option value="Belediye Duyurusu">Belediye Duyurusu</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-300 uppercase mb-1">
                        Haber Fotoğrafı
                      </label>
                      <div className="bg-white rounded-xl p-2">
                        <ImageCropField
                          value={newNewsImage}
                          onChange={setNewNewsImage}
                          aspect={16 / 9}
                          outputWidth={1200}
                          hint="Galeriden yükleyin, kadrajı ayarlayın."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-300">
                      <input
                        type="checkbox"
                        checked={newNewsUrgent}
                        onChange={(e) => setNewNewsUrgent(e.target.checked)}
                        className="w-4 h-4 text-rose-600 rounded bg-neutral-900 border-neutral-700"
                      />
                      <span className="text-rose-400 font-bold">Acil / Son Dakika Rozeti Ekle</span>
                    </label>

                    <button
                      type="submit"
                      className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md"
                    >
                      <Check className="w-4 h-4" />
                      <span>Haberi Yayınla</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* News list with Edit & Delete */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-black text-neutral-300 uppercase tracking-wider">
                    Sitedeki Mevcut Tüm Haberler ({filteredNewsList.length})
                  </div>
                  <span className="text-[10px] text-neutral-500">
                    Düzenleme ve Anında Silme Yetkisi
                  </span>
                </div>

                <div className="space-y-2">
                  {filteredNewsList.map((item) => {
                    const isEditing = editingNewsId === item.id;

                    if (isEditing) {
                      return (
                        <div
                          key={item.id}
                          className="p-3 bg-neutral-800 border-2 border-rose-500/70 rounded-2xl space-y-2.5 animate-in fade-in"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-rose-400 flex items-center gap-1">
                              <Edit3 className="w-3.5 h-3.5" />
                              Haberi Düzenle: {item.id}
                            </span>
                            <button
                              onClick={() => setEditingNewsId(null)}
                              className="text-neutral-400 hover:text-white text-xs"
                            >
                              İptal
                            </button>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">
                                Haber Başlığı
                              </label>
                              <input
                                type="text"
                                value={editNewsForm.title}
                                onChange={(e) =>
                                  setEditNewsForm((prev) => ({ ...prev, title: e.target.value }))
                                }
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">
                                Haber Özeti
                              </label>
                              <textarea
                                rows={2}
                                value={editNewsForm.summary}
                                onChange={(e) =>
                                  setEditNewsForm((prev) => ({
                                    ...prev,
                                    summary: e.target.value,
                                  }))
                                }
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">
                                  Kategori
                                </label>
                                <select
                                  value={editNewsForm.category}
                                  onChange={(e) =>
                                    setEditNewsForm((prev) => ({
                                      ...prev,
                                      category: e.target.value,
                                    }))
                                  }
                                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-white"
                                >
                                  <option value="Şehir & Yaşam">Şehir & Yaşam</option>
                                  <option value="Eğitim & Kampüs">Eğitim & Kampüs</option>
                                  <option value="Esnaf & Ekonomi">Esnaf & Ekonomi</option>
                                  <option value="Kültür & Turizm">Kültür & Turizm</option>
                                  <option value="Spor">Spor</option>
                                  <option value="Belediye Duyurusu">Belediye Duyurusu</option>
                                </select>
                              </div>

                              <div className="flex items-center pt-4">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-300">
                                  <input
                                    type="checkbox"
                                    checked={editNewsForm.urgent}
                                    onChange={(e) =>
                                      setEditNewsForm((prev) => ({
                                        ...prev,
                                        urgent: e.target.checked,
                                      }))
                                    }
                                    className="w-4 h-4 text-rose-600 rounded bg-neutral-900 border-neutral-700"
                                  />
                                  <span className="text-rose-400 font-bold">Flaş / Acil Haber</span>
                                </label>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleSaveEditNews(item)}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Save className="w-4 h-4" />
                            <span>Haberi Güncelle & Vitrine Yansıt</span>
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={item.id}
                        className="p-3 bg-neutral-800/60 rounded-xl border border-neutral-700/70 flex items-center justify-between gap-3"
                      >
                        <img
                          src={
                            item.image ||
                            PLACEHOLDER_IMG
                          }
                          alt={item.title}
                          className="w-14 h-14 rounded-lg object-cover bg-neutral-900 shrink-0 border border-neutral-700"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {item.urgent && (
                              <span className="bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded">
                                SON DAKİKA
                              </span>
                            )}
                            <span className="text-[9.5px] text-neutral-400 font-bold">
                              {item.category}
                            </span>
                            <span className="text-[9.5px] text-neutral-500 ml-auto">
                              {item.date}
                            </span>
                          </div>
                          <h4 className="text-[12px] font-bold text-white leading-tight truncate">
                            {item.title}
                          </h4>
                          <p className="text-[10.5px] text-neutral-400 line-clamp-1 mt-0.5">
                            {item.summary}
                          </p>
                        </div>

                        {/* Push, Edit and Delete buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleBroadcastNewsPush(item)}
                            title="Son Dakika Push Bildirimi Gönder"
                            className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 transition flex items-center gap-1 text-[10.5px] font-bold"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Son Dakika Push</span>
                          </button>
                          <button
                            onClick={() => handleStartEditNews(item)}
                            title="Haberi Düzenle"
                            className="p-2 rounded-lg bg-neutral-700 hover:bg-amber-600 text-neutral-200 hover:text-neutral-950 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteNewsItem(item.id, item.title)}
                            title="Haberi Siteden Sil"
                            className="p-2 rounded-lg bg-rose-900/60 hover:bg-rose-600 text-rose-200 hover:text-white transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: YORUM VE İÇERİK DENETİMİ (SİLME) */}
          {activeTab === 'yorum-denetimi' && (
            <div className="space-y-4">
              <div className="p-3 bg-neutral-800/70 rounded-2xl border border-neutral-700/80 flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-extrabold text-white flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <span>Yorum & Sohbet Denetimi Masası</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Mutlular Canlı TV ve Halk Kürsüsü yorumlarını filtreleyin, uygunsuzları tek tıkla silin.
                  </div>
                </div>
              </div>

              {/* Comments list */}
              <div className="space-y-2.5">
                {commentsList.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-neutral-400 space-y-1">
                    <p className="text-xs font-bold text-neutral-300">İncelenecek veya şikayet edilen yorum bulunmuyor.</p>
                    <p className="text-[10.5px]">Kullanıcı yorumları geldiğinde burada anlık listelenecektir.</p>
                  </div>
                ) : (
                  commentsList.map((c) => {
                    const isDeleted = c.status === 'deleted';
                    const isFlagged = c.status === 'flagged' || c.reportsCount > 0;

                    return (
                      <div
                        key={c.id}
                        className={`p-3.5 rounded-2xl border transition ${
                          isDeleted
                            ? 'bg-neutral-900/60 border-neutral-800 opacity-40'
                            : isFlagged
                            ? 'bg-rose-950/20 border-rose-500/40'
                            : 'bg-neutral-800/70 border-neutral-700/70'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-black text-rose-400">
                                @{c.author}
                              </span>
                              <span className="text-[10px] text-neutral-500">
                                • {c.channel}
                              </span>
                              <span className="text-[10px] text-neutral-500">• {c.time}</span>
                              {c.reportsCount > 0 && (
                                <span className="bg-rose-600/30 text-rose-300 border border-rose-500/40 text-[9px] font-black px-1.5 py-0.2 rounded">
                                  {c.reportsCount} Şikayet
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-xs mt-1 leading-snug ${
                                isDeleted
                                  ? 'line-through text-neutral-500'
                                  : 'text-neutral-200 font-medium'
                              }`}
                            >
                              &ldquo;{c.text}&rdquo;
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            {!isDeleted ? (
                              <>
                                {isFlagged && (
                                  <button
                                    onClick={() => handleApproveComment(c.id)}
                                    title="Güvenli Onayla"
                                    className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition text-xs flex items-center gap-1"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline text-[10px]">Onayla</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteComment(c.id)}
                                  title="Yorumu Sil"
                                  className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition text-xs flex items-center gap-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span className="text-[10px] font-bold">Yorumu Sil</span>
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] font-bold text-neutral-500">
                                Silindi
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ESNAF BAŞVURULARI VE ONAY */}
          {activeTab === 'esnaf-onay' && (
            <div className="space-y-4">
              <div className="p-3 bg-neutral-800/70 rounded-2xl border border-neutral-700/80 flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-extrabold text-white flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-amber-500" />
                    <span>Esnaf Başvuruları & Doğrulama</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Mutlular esnaf portalına katılmak isteyen işletmelerin başvurularını onaylayın.
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {merchantsList.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-neutral-400 space-y-1">
                    <p className="text-xs font-bold text-neutral-300">Onay bekleyen esnaf başvurusu bulunmuyor.</p>
                    <p className="text-[10.5px]">Mahalle esnafları kayıt olduğunda burada listelenecektir.</p>
                  </div>
                ) : (
                  merchantsList.map((m) => {
                  const isPending = m.status === 'pending';
                  const isApproved = m.status === 'approved';
                  const isRejected = m.status === 'rejected';

                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-2xl border transition ${
                        isPending
                          ? 'bg-neutral-800/90 border-amber-500/40'
                          : isApproved
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : 'bg-rose-950/20 border-rose-500/30 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13px] font-black text-white">
                              {m.businessName}
                            </span>
                            <span className="text-[9.5px] bg-neutral-700 text-neutral-300 px-2 py-0.2 rounded font-bold">
                              {m.category}
                            </span>
                            <span
                              className={`text-[9.5px] px-2 py-0.2 rounded font-black flex items-center gap-1 ${
                                (m.category || '').toLowerCase().includes('yemek') ||
                                (m.category || '').toLowerCase().includes('restoran') ||
                                (m.category || '').toLowerCase().includes('döner') ||
                                (m.category || '').toLowerCase().includes('cafe') ||
                                (m.category || '').toLowerCase().includes('lokanta')
                                  ? 'bg-amber-950/70 text-amber-300 border border-amber-500/30'
                                  : 'bg-blue-950/70 text-blue-300 border border-blue-500/30'
                              }`}
                            >
                              {(m.category || '').toLowerCase().includes('yemek') ||
                              (m.category || '').toLowerCase().includes('restoran') ||
                              (m.category || '').toLowerCase().includes('döner') ||
                              (m.category || '').toLowerCase().includes('cafe') ||
                              (m.category || '').toLowerCase().includes('lokanta')
                                ? '🍽️ QR Menü'
                                : '🛍️ Mağaza Vitrini'}
                            </span>
                          </div>

                          <div className="text-[11px] text-neutral-400 flex flex-wrap gap-x-3 gap-y-0.5">
                            <span>Yetkili: <strong className="text-neutral-200">{m.ownerName}</strong></span>
                            <span>Tel: <strong className="text-neutral-200">{m.phone}</strong></span>
                            <span>Tarih: {m.date}</span>
                          </div>

                          <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
                            <span>{m.address}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="shrink-0 flex items-center gap-1.5">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleApproveMerchant(m.id, m.businessName)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] py-1.5 px-3 rounded-xl flex items-center gap-1 transition shadow-xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Onayla</span>
                              </button>
                              <button
                                onClick={() => handleRejectMerchant(m.id)}
                                className="bg-neutral-700 hover:bg-neutral-600 text-rose-300 font-bold text-[11px] py-1.5 px-3 rounded-xl flex items-center gap-1 transition"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reddet</span>
                              </button>
                            </>
                          ) : (
                            <span
                              className={`text-[11px] font-bold px-2 py-1 rounded-lg ${
                                isApproved
                                  ? 'text-emerald-400 bg-emerald-950/40'
                                  : 'text-rose-400 bg-rose-950/40'
                              }`}
                            >
                              {isApproved ? '✓ Onaylı Esnaf' : '✕ Reddedildi'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              </div>
            </div>
          )}

          {/* TAB: EDİTÖR & YARDIMCI YÖNETİMİ */}
          {activeTab === 'editor-yonetimi' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-800">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span>Yönetici Tarafından Atanan Yardımcı Editörler</span>
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Platformda onaylama, denetim ve moderasyon yetkisi verilen editörler
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingEditor(!isAddingEditor)}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition self-start sm:self-auto shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Yeni Editör / Yardımcı Ata</span>
                </button>
              </div>

              {/* Add Editor Form */}
              {isAddingEditor && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newEdName.trim() || !newEdEmail.trim()) return;
                    const newEd: AssignedEditor = {
                      id: `ed-${Date.now()}`,
                      name: newEdName,
                      email: newEdEmail,
                      phone: newEdPhone,
                      assignedDate: 'Bugün',
                      status: 'active',
                      assignedBy: 'Süper Admin Yakup',
                      duties: newEdDuties.length > 0 ? newEdDuties : ['İlan Onaylama & Denetim'],
                    };
                    setAssignedEditors([newEd, ...assignedEditors]);
                    setIsAddingEditor(false);
                    setNewEdName('');
                    setNewEdEmail('');
                    setNewEdPhone('');
                    showToast(`${newEdName} başarıyla yardımcı editör olarak atandı!`);
                  }}
                  className="p-4 bg-neutral-900 border border-purple-500/40 rounded-2xl space-y-3 animate-in fade-in duration-200"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <span className="text-xs font-black text-purple-300 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4" />
                      Yeni Editör Yetkilendirme Formu
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingEditor(false)}
                      className="text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                        Adı Soyadı
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: Ayşe Demir"
                        value={newEdName}
                        onChange={(e) => setNewEdName(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                        E-Posta (Giriş için)
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="ayse@mutlular.org"
                        value={newEdEmail}
                        onChange={(e) => setNewEdEmail(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                        Telefon Numarası
                      </label>
                      <input
                        type="tel"
                        placeholder="0533 123 45 67"
                        value={newEdPhone}
                        onChange={(e) => setNewEdPhone(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1.5">
                      Atanacak Görevler & Denetim Alanları
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        'İlan Onaylama & Denetim',
                        'Esnaf Başvuru Onayı',
                        'Yorum Moderasyonu',
                        'Haber & Duyuru Denetimi',
                      ].map((duty) => {
                        const isChecked = newEdDuties.includes(duty);
                        return (
                          <button
                            key={duty}
                            type="button"
                            onClick={() => {
                              setNewEdDuties((prev) =>
                                prev.includes(duty)
                                  ? prev.filter((d) => d !== duty)
                                  : [...prev, duty]
                              );
                            }}
                            className={`p-2 rounded-xl text-left border text-[10px] font-bold transition flex items-center justify-between ${
                              isChecked
                                ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                                : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-600'
                            }`}
                          >
                            <span className="truncate">{duty}</span>
                            {isChecked ? (
                              <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 ml-1" />
                            ) : (
                              <span className="w-3 h-3 rounded-full border border-neutral-600 shrink-0 ml-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2 px-4 rounded-xl transition shadow-xs flex items-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Editör Olarak Kaydet & Yetki Ver</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Editors List */}
              <div className="space-y-2.5">
                {assignedEditors.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-neutral-400 space-y-1">
                    <p className="text-xs font-bold text-neutral-300">Henüz atanmış yardımcı editör bulunmuyor.</p>
                    <p className="text-[10.5px]">Yukarıdaki form ile güvenilir mahalle sakinlerine moderasyon yetkisi verebilirsiniz.</p>
                  </div>
                ) : (
                  assignedEditors.map((editor) => (
                  <div
                    key={editor.id}
                    className="p-3.5 bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 rounded-2xl transition space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold text-sm shrink-0">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-white">
                              {editor.name}
                            </h4>
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded">
                              Aktif Görevli
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-400 mt-0.5">
                            {editor.email} • {editor.phone} • Atayan: {editor.assignedBy} ({editor.assignedDate})
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setAssignedEditors(assignedEditors.filter((e) => e.id !== editor.id));
                          showToast(`${editor.name} editörlük yetkisi geri alındı.`);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition text-[11px] font-bold flex items-center gap-1"
                        title="Yetkiyi Geri Al"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Yetkiyi Al</span>
                      </button>
                    </div>

                    {/* Duties badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-neutral-800/80">
                      <span className="text-[10px] text-neutral-500 font-bold">
                        Görev Alanları:
                      </span>
                      {editor.duties.map((duty, idx) => (
                        <span
                          key={idx}
                          className="bg-neutral-800 text-purple-300 border border-neutral-700 text-[9.5px] font-bold px-2 py-0.5 rounded-md"
                        >
                          ✓ {duty}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
              </div>

              {/* Informative footer */}
              <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-2xl text-[11px] text-purple-200 space-y-1">
                <strong>Editörlük Mekanizması:</strong> Editörler halka açık kayıt formundan doğrudan üye olamaz. Yalnızca platform yöneticisi (Süper Admin) tarafından bu panel üzerinden atanabilir. Atanan editörler giriş yaptıklarında &quot;Editör Denetim &amp; Onay Masası&quot; üzerinden kendilerine verilen onay ve moderasyon görevlerini yerine getirirler.
              </div>
            </div>
          )}

          {/* TAB 5: İSTATİSTİK & SİSTEM ÖZETİ */}
          {activeTab === 'istatistik' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-neutral-800/80 rounded-2xl border border-neutral-700">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase">
                    Toplam İlanlar
                  </div>
                  <div className="text-xl font-black text-white mt-1">
                    {classifiedList.length}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">
                    {pendingCount} onay bekliyor
                  </div>
                </div>

                <div className="p-3 bg-neutral-800/80 rounded-2xl border border-neutral-700">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase">
                    Aktif Haberler
                  </div>
                  <div className="text-xl font-black text-rose-500 mt-1">
                    {newsList.length}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    Haber vitrini senkronize
                  </div>
                </div>

                <div className="p-3 bg-neutral-800/80 rounded-2xl border border-neutral-700 col-span-2 sm:col-span-1">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase">
                    Kayıtlı Esnaf
                  </div>
                  <div className="text-xl font-black text-amber-400 mt-1">
                    {merchantsList.length}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    {merchantsList.filter((m) => m.status === 'approved').length} onaylı dükkan
                  </div>
                </div>
              </div>

              {/* Quick Actions Guide for Admin */}
              <div className="p-3.5 bg-neutral-800/60 rounded-2xl border border-neutral-700 space-y-2">
                <div className="text-[12px] font-black text-white">
                  Yönetici Denetim ve Silme Yetkileri
                </div>
                <ul className="text-[11px] text-neutral-300 space-y-1.5 list-disc list-inside">
                  <li>
                    <strong>Tüm İlanları Kaldırma & Düzenleme:</strong> Sitede bulunan her ilanın başlığını, fiyatını, konumunu düzenleyebilir veya tek tıkla kalıcı olarak silebilirsiniz.
                  </li>
                  <li>
                    <strong>Tüm Haberleri Kaldırma & Düzenleme:</strong> Haber vitrini ve haberler sekmesindeki her haberi güncelleyebilir veya yayından silebilirsiniz.
                  </li>
                  <li>
                    <strong>Yorum & Sohbet Silme:</strong> Şehir sakinlerinin güvenliği için küfür, hakaret ve spam içeren tüm yorumları anında silebilirsiniz.
                  </li>
                  <li>
                    <strong>Esnaf Başvuruları:</strong> Esnaf dükkan onaylarını yönetebilirsiniz.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 7: BİLDİRİM MASASI (PROFESYONEL ANDROID PUSH VE HEADS-UP YÖNETİMİ) */}
          {activeTab === 'bildirim-masasi' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Info Header Banner */}
              <div className="p-3.5 bg-gradient-to-r from-neutral-900 via-rose-950/40 to-neutral-900 rounded-2xl border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                      <BellRing className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-black text-white">
                        Android Push & Heads-up Bildirim Masası
                      </h3>
                      <p className="text-[10.5px] text-neutral-300">
                        Play Store uygulamasında bildirim izinli tüm cihazlara anlık iletilir.
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full uppercase">
                    CANLI PUSH MOTORU
                  </span>
                </div>
              </div>

              {/* Ready Preset Templates */}
              <div className="space-y-2">
                <div className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Hazır Bildirim Şablonları (1-Tıkla Doldur)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      applyPresetTemplate({
                        type: 'son_dakika',
                        title: '🚨 SON DAKİKA: Nilüfer Çayı Park Projesi Başladı',
                        body: 'Belediye ekipleri sahil yürüyüş ve rekreasyon alanı çalışmalarına başladı.',
                        actionTab: 'haber',
                        badgeText: 'SON DAKİKA',
                      })
                    }
                    className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 hover:border-rose-500/60 text-left transition flex flex-col gap-0.5"
                  >
                    <span className="text-[11px] font-extrabold text-rose-400">🚨 Son Dakika</span>
                    <span className="text-[9.5px] text-neutral-400 truncate">Nilüfer Parkı Haberi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      applyPresetTemplate({
                        type: 'canli_yayin',
                        title: '🔴 Mutlular Canlı Yayın Başladı!',
                        body: 'Mutlular TV Mahalle Meclisi Canlı Yayını başladı. İzlemek için dokunun.',
                        actionTab: 'canli_yayin',
                        badgeText: 'CANLI YAYIN',
                      })
                    }
                    className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 hover:border-red-500/60 text-left transition flex flex-col gap-0.5"
                  >
                    <span className="text-[11px] font-extrabold text-red-400">🔴 Canlı Yayın</span>
                    <span className="text-[9.5px] text-neutral-400 truncate">Mutlular TV Yayını</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      applyPresetTemplate({
                        type: 'vefat',
                        title: '🕊️ Vefat & Taziye: Mahalle Sakinimiz Hakka Yürüdü',
                        body: 'Cenazesi bugün İkindi namazını müteakip Mehmet Akif Camii\'nden kaldırılacaktır.',
                        actionTab: 'vefat',
                        badgeText: 'VEFAT & TAZİYE',
                      })
                    }
                    className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-left transition flex flex-col gap-0.5"
                  >
                    <span className="text-[11px] font-extrabold text-neutral-300">🕊️ Vefat Haberi</span>
                    <span className="text-[9.5px] text-neutral-400 truncate">Cenaze & Taziye</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      applyPresetTemplate({
                        type: 'duyuru',
                        title: '📢 BUSKİ Planlı Su Kesintisi Duyurusu',
                        body: 'Ana hat yenileme çalışması nedeniyle yarın 09:00 - 15:00 saatleri arasında su verilemeyecektir.',
                        actionTab: 'profil',
                        badgeText: 'SU KESİNTİSİ',
                      })
                    }
                    className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 hover:border-blue-500/60 text-left transition flex flex-col gap-0.5"
                  >
                    <span className="text-[11px] font-extrabold text-blue-400">📢 Su Kesintisi</span>
                    <span className="text-[9.5px] text-neutral-400 truncate">BUSKİ Duyurusu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      applyPresetTemplate({
                        type: 'duyuru',
                        title: '⚡ UEDAŞ Elektrik Bakım Kesintisi',
                        body: 'Şebeke iyileştirme çalışmaları nedeniyle Mutlular Caddesi genelinde planlı kesinti yapılacaktır.',
                        actionTab: 'profil',
                        badgeText: 'ELEKTRİK KESİNTİSİ',
                      })
                    }
                    className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-500/60 text-left transition flex flex-col gap-0.5"
                  >
                    <span className="text-[11px] font-extrabold text-amber-400">⚡ Elektrik Kesintisi</span>
                    <span className="text-[9.5px] text-neutral-400 truncate">UEDAŞ Duyurusu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      applyPresetTemplate({
                        type: 'ilan',
                        title: '🏷️ Öne Çıkan İlan: Satılık 3+1 Bahçeli Daire',
                        body: '3.450.000 ₺ • Mutlular Merkez. Yönetici onaylı fırsat ilanı inceleyin.',
                        actionTab: 'alim_satim',
                        badgeText: 'ÖNE ÇIKAN İLAN',
                      })
                    }
                    className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 hover:border-emerald-500/60 text-left transition flex flex-col gap-0.5"
                  >
                    <span className="text-[11px] font-extrabold text-emerald-400">🏷️ İlan Push</span>
                    <span className="text-[9.5px] text-neutral-400 truncate">Satılık Konut</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      applyPresetTemplate({
                        type: 'usta_talep',
                        title: '🔨 Yeni Usta Talebi: Sıhhi Tesisat & Su Kaçağı',
                        body: 'Mehmet Akif Mahallesinden acil su kaçağı için talep geldi. Teklif vermek için tıklayın.',
                        actionTab: 'hizmet',
                        badgeText: 'YENİ TALEP',
                      })
                    }
                    className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-500/60 text-left transition flex flex-col gap-0.5"
                  >
                    <span className="text-[11px] font-extrabold text-amber-300">🔨 Ustaya Talep</span>
                    <span className="text-[9.5px] text-neutral-400 truncate">İş & Fiyat Talebi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      applyPresetTemplate({
                        type: 'kullanici_teklif',
                        title: '💼 Ustanızdan Teklif Geldi!',
                        body: 'Bölge ustanız su kaçağı talebinize 1 yıl garantili fiyat teklifi iletti.',
                        actionTab: 'tekliflerim',
                        badgeText: 'TEKLİF GELDİ',
                      })
                    }
                    className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 hover:border-cyan-500/60 text-left transition flex flex-col gap-0.5"
                  >
                    <span className="text-[11px] font-extrabold text-cyan-300">💼 Müşteriye Teklif</span>
                    <span className="text-[9.5px] text-neutral-400 truncate">Teklif Detayı</span>
                  </button>
                </div>
              </div>

              {/* Main Custom Push Composer Form */}
              <form
                onSubmit={handleSendCustomPush}
                className="p-4 bg-neutral-800/90 rounded-2xl border border-neutral-700 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-black text-white flex items-center gap-1.5">
                    <Megaphone className="w-4 h-4 text-rose-500" />
                    <span>Özel Bildirim Oluştur & Gönder</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    Kilit Ekranı + Ses + Titreşim
                  </span>
                </div>

                {/* Notification Category */}
                <div>
                  <label className="block text-[10.5px] font-bold text-neutral-300 uppercase mb-1.5">
                    Bildirim Kategorisi (Kanal Türü)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                      { id: 'son_dakika', label: '🚨 Son Dakika', color: 'border-rose-500 text-rose-300' },
                      { id: 'canli_yayin', label: '🔴 Canlı Yayın', color: 'border-red-500 text-red-300' },
                      { id: 'vefat', label: '🕊️ Vefat & Taziye', color: 'border-neutral-500 text-neutral-200' },
                      { id: 'duyuru', label: '📢 Yönetici Duyurusu', color: 'border-blue-500 text-blue-300' },
                      { id: 'ilan', label: '🏷️ İlan / Fırsat', color: 'border-emerald-500 text-emerald-300' },
                      { id: 'usta_talep', label: '🔨 Ustaya Talep', color: 'border-amber-500 text-amber-300' },
                      { id: 'kullanici_teklif', label: '💼 Müşteriye Teklif', color: 'border-cyan-500 text-cyan-300' },
                      { id: 'ozel', label: '💬 Özel Bildirim', color: 'border-purple-500 text-purple-300' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setBroadcastType(cat.id as AndroidPayloadType)}
                        className={`p-2 rounded-xl text-[11px] font-black text-left border transition ${
                          broadcastType === cat.id
                            ? `bg-white/10 ${cat.color} shadow-sm ring-1 ring-white/20`
                            : 'bg-neutral-900/60 border-neutral-700 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[10.5px] font-bold text-neutral-300 uppercase mb-1">
                    Bildirim Başlığı *
                  </label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="Örn: 🔴 Mutlular TV Canlı Yayını Başladı!"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 font-semibold"
                    required
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="block text-[10.5px] font-bold text-neutral-300 uppercase mb-1">
                    Bildirim Mesajı / Detayı *
                  </label>
                  <textarea
                    rows={2}
                    value={broadcastBody}
                    onChange={(e) => setBroadcastBody(e.target.value)}
                    placeholder="Cihaz bildirim çubuğunda ve Heads-up penceresinde görünecek açıklama..."
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 font-medium"
                    required
                  />
                </div>

                {/* Target Navigation & Badge */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-300 uppercase mb-1">
                      Tıklanınca Açılacak Sayfa
                    </label>
                    <select
                      value={broadcastActionTab}
                      onChange={(e) => setBroadcastActionTab(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="haber">Haberler Sekmesi</option>
                      <option value="canli_yayin">Mutlular Canlı TV</option>
                      <option value="vefat">Vefat & Taziye Listesi</option>
                      <option value="alim_satim">İlanlar (Alım-Satım)</option>
                      <option value="hizmet">Hizmet & Ustalar</option>
                      <option value="tekliflerim">Tekliflerim</option>
                      <option value="profil">Profil & Bildirim Merkezi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-300 uppercase mb-1">
                      Rozet Metni (Badge)
                    </label>
                    <input
                      type="text"
                      value={broadcastBadgeText}
                      onChange={(e) => setBroadcastBadgeText(e.target.value)}
                      placeholder="Örn: SON DAKİKA, CANLI YAYIN"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 font-medium"
                    />
                  </div>
                </div>

                {/* Submit Push button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSendingPush}
                    className="w-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 active:scale-99 text-white font-black text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {isSendingPush
                        ? 'İletiliyor...'
                        : '🚀 Gerçek Android Push & Heads-up Bildirimi Gönder'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Admin Footer */}
        <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-neutral-400 font-medium">
              Sistem Durumu: <strong>Tüm Düzenleme ve Silme Yetkileri Aktif</strong>
            </span>
          </div>

          <button
            onClick={onClose}
            className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
          >
            Paneli Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
