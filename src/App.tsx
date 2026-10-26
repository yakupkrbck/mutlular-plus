import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { doc as fsDoc, updateDoc, arrayUnion, increment, where } from 'firebase/firestore';
import { db } from './firebase';
import { useSyncedList } from './services/useSyncedList';
import {
  parseCurrentPath,
  findMatchingRestaurant,
  findMatchingNews,
  findMatchingAd,
  generateCanonicalPath,
  syncUrlToBrowser,
  slugify,
} from './utils/urlRouter';
import { subscribeAuth, loadProfile, saveProfile, logout as firebaseLogout, finishGoogleRedirect } from './services/authService';
import { Header } from './components/Header';
import { HaberVitrini } from './components/HaberVitrini';
import { HomepageSearchBar } from './components/HomepageSearchBar';
import { StoryCategories } from './components/StoryCategories';
import { PopularServices } from './components/PopularServices';
import { PromoCarBanner } from './components/PromoCarBanner';
import { CampusCard } from './components/CampusCard';
import { CouponsSection } from './components/CouponsSection';
import { CityServices } from './components/CityServices';
import { OfficialSection } from './components/OfficialSection';
import { WeatherWidget } from './components/WeatherWidget';
import { NewsSection } from './components/NewsSection';
import { FeaturedClassifieds } from './components/FeaturedClassifieds';
import { JobsSection } from './components/JobsSection';
import { FoodSection } from './components/FoodSection';
import { BottomNav, NavTab } from './components/BottomNav';
import { AlimSatimScreen } from './components/AlimSatimScreen';
import { HaberScreen } from './components/HaberScreen';
import { HizmetScreen } from './components/HizmetScreen';

// Modals synchronized with Mutlular-Haber-GUNCEL zip
import { SearchModal } from './components/modals/SearchModal';
import { LoginModal } from './components/modals/LoginModal';
import {
  BusinessRegisterModal,
  RegisteredBusinessPayload,
} from './components/modals/BusinessRegisterModal';
import { LiveSupportModal } from './components/modals/LiveSupportModal';
import { SideDrawer } from './components/modals/SideDrawer';
import { PharmacyModal } from './components/modals/PharmacyModal';
import { PrayerTimesModal } from './components/modals/PrayerTimesModal';
import { StoreDetailModal } from './components/modals/StoreDetailModal';
import { ClassifiedDetailModal } from './components/modals/ClassifiedDetailModal';
import { GenericInfoModal } from './components/modals/GenericInfoModal';
import { NewsTipModal } from './components/modals/NewsTipModal';
import { DavetModal } from './components/modals/DavetModal';
import { KursuModal } from './components/modals/KursuModal';
import { LostFoundModal } from './components/modals/LostFoundModal';
import { CampaignModal } from './components/modals/CampaignModal';
import { EmergencyModal } from './components/modals/EmergencyModal';
import { LiveStreamModal } from './components/modals/LiveStreamModal';
import { CreditModal } from './components/modals/CreditModal';
import { QuoteWizardModal } from './components/modals/QuoteWizardModal';
import { HomeUlasimModal } from './components/modals/HomeUlasimModal';
import { MarketListingModal } from './components/modals/MarketListingModal';
import { NewsDetailView } from './components/modals/NewsDetailView';
import { VefatModal } from './components/modals/VefatModal';
import { EBelediyeModal } from './components/modals/EBelediyeModal';
import { SaglikOcagiModal } from './components/modals/SaglikOcagiModal';
import { MuhtarlikModal } from './components/modals/MuhtarlikModal';
import { KesintilerModal } from './components/modals/KesintilerModal';
import { QuickActionSheet } from './components/modals/QuickActionSheet';
import { AdminPanelModal } from './components/modals/AdminPanelModal';
import { EsnafPaneliModal } from './components/modals/EsnafPaneliModal';
import { UstaPaneliModal } from './components/modals/UstaPaneliModal';
import { EditorPanelModal } from './components/modals/EditorPanelModal';
import { JobsModal } from './components/modals/JobsModal';
import { QrMenuScannerModal } from './components/modals/QrMenuScannerModal';
import { StoryViewerModal } from './components/modals/StoryViewerModal';
import { EsnafStoryShareModal } from './components/modals/EsnafStoryShareModal';
import { MahalleSakiniPaneliModal } from './components/modals/MahalleSakiniPaneliModal';
import { ExportCodeModal } from './components/modals/ExportCodeModal';
import { TekliflerimView } from './components/profile/TekliflerimView';
import { BildirimMerkeziView } from './components/profile/BildirimMerkeziView';
import { AndroidHeadsUpNotification } from './components/AndroidHeadsUpNotification';
import {
  registerAndroidServiceWorker,
  sendAndroidAppNotification,
  updateAppIconBadge,
} from './services/androidNotificationService';

// Data
import {
  STORIES_DATA,
  POPULAR_SERVICES,
  CLASSIFIED_ADS,
  JOB_ADS,
  RESTAURANTS_DATA,
  NEWS_LIST,
  OBITUARY_LIST,
} from './data/mockData';
import { INITIAL_USER_QUOTES } from './data/mockQuotes';
import { INITIAL_USER_NOTIFICATIONS } from './data/mockNotifications';
import { ROLE_CONFIGS } from './data/rolesData';
import {
  ClassifiedItem,
  JobItem,
  JobApplication,
  RestaurantItem,
  NewsItem,
  ObituaryItem,
  PendingMerchantItem,
  StoryItem,
  UserProfile,
  UserRole,
  UserQuoteRequest,
  MasterOffer,
  UserNotification,
  NotificationType,
  StoreShowcaseProduct,
  BusinessTypeMode,
  MuhtarlikApplication,
} from './types';
import {
  Smartphone,
  PhoneCall,
  Sparkles,
  Award,
  HelpCircle,
  PlusCircle,
  CheckCircle,
  Briefcase,
  Store,
  User,
  Bell,
  Shield,
  Layers,
  Wrench,
  PenTool,
  Home,
  CheckCircle2,
  LogOut,
  LogIn,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  // Navigation State (URL Senkronizasyonu & Deep-linking)
  const [currentTab, setCurrentTab] = useState<NavTab>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseCurrentPath(window.location.pathname);
      return parsed.tab;
    }
    return 'anasayfa';
  });

  // Register Android Service Worker on mount
  useEffect(() => {
    registerAndroidServiceWorker();
  }, []);

  // User Profile & Role State (Mahalle Sakini, Esnaf, Usta, Editör, Yönetici)
  // Oturum ve rol artık Firebase Authentication + Firestore (users/{uid}, admins/{uid}) üzerinden gelir.
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const authUidRef = useRef<string | null>(null);

  useEffect(() => {
    finishGoogleRedirect().catch(() => {});
    const unsub = subscribeAuth(async (user) => {
      if (!user) {
        authUidRef.current = null;
        setUserProfile(null);
        setIsLoggedIn(false);
        setAuthReady(true);
        return;
      }
      authUidRef.current = user.uid;
      try {
        const profile = await loadProfile(user);
        if (profile) {
          setUserProfile(profile);
          setIsLoggedIn(true);
        }
      } catch {}
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const currentRole: UserRole = userProfile ? userProfile.role : 'mahalle-sakini';
  const userName = userProfile?.name || 'Misafir Kullanıcı';

  const handleSuccessLogin = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsLoggedIn(true);
    setIsLoginOpen(false);
    setCurrentTab('profil');
  };

  const handleLogout = () => {
    firebaseLogout().catch(() => {});
    setIsLoggedIn(false);
    setUserProfile(null);
  };

  // Classified Ads list with live add support
  const [classifiedList, setClassifiedList] = useSyncedList<ClassifiedItem>('plus_ilanlar', { stampOwner: true });

  // News list with live add & remove support (Haber vitrini & akışı)
  const [newsList, setNewsList] = useSyncedList<NewsItem>('plus_haberler', { stampOwner: true });

  // Admin Panel Modal Open State
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Modals Open/Close States (Matched with Zip)
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isBusinessRegisterOpen, setIsBusinessRegisterOpen] = useState(false);
  const [isLiveSupportOpen, setIsLiveSupportOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPharmacyOpen, setIsPharmacyOpen] = useState(false);
  const [isPrayersOpen, setIsPrayersOpen] = useState(false);
  const [isNewsTipOpen, setIsNewsTipOpen] = useState(false);
  const [isDavetOpen, setIsDavetOpen] = useState(false);
  const [isKursuOpen, setIsKursuOpen] = useState(false);
  const [isLostFoundOpen, setIsLostFoundOpen] = useState(false);
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isLiveStreamOpen, setIsLiveStreamOpen] = useState(false);
  const [isCreditOpen, setIsCreditOpen] = useState(false);
  const [isQuoteWizardOpen, setIsQuoteWizardOpen] = useState(false);
  const [quotePrefill, setQuotePrefill] = useState<{ category?: string; subCategory?: string } | null>(null);
  const myUid = userProfile?.uid || null;
  const isStaffRole = currentRole === 'editor' || currentRole === 'yonetici' || currentRole === 'muhtar';
  const canSeeAllQuotes = isStaffRole || currentRole === 'usta';

  // Hizmet talepleri: sakin sadece kendi taleplerini, usta/yönetim tüm açık talepleri görür
  const [quotesAll, setUserQuotes, quotesReady] = useSyncedList<UserQuoteRequest>('plus_talepler', {
    enabled: !!myUid,
    stampOwner: true,
    key: `${myUid}-${canSeeAllQuotes}`,
    constraints: canSeeAllQuotes || !myUid ? [] : [where('ownerUid', '==', myUid)],
  });
  const userQuotes = useMemo(
    () => quotesAll.filter((q) => q.ownerUid === myUid),
    [quotesAll, myUid]
  );

  // Kişisel bildirimler (plus_users/{uid}/bildirimler) + yönetim duyuruları (plus_duyurular)
  const [personalNotifs, setUserNotifications] = useSyncedList<UserNotification>(
    `plus_users/${myUid || '_'}/bildirimler`,
    { enabled: !!myUid }
  );
  const [announcements, setAnnouncements] = useSyncedList<UserNotification>('plus_duyurular', {
    enabled: !!myUid,
  });
  const [readAnn, setReadAnn] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('mutlular_read_announcements') || '[]');
    } catch {
      return [];
    }
  });
  const [hiddenAnn, setHiddenAnn] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('mutlular_hidden_announcements') || '[]');
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('mutlular_read_announcements', JSON.stringify(readAnn));
      localStorage.setItem('mutlular_hidden_announcements', JSON.stringify(hiddenAnn));
    } catch {}
  }, [readAnn, hiddenAnn]);
  const userNotifications = useMemo<UserNotification[]>(
    () =>
      [
        ...personalNotifs,
        ...announcements
          .filter((a) => !hiddenAnn.includes(a.id))
          .map((a) => ({ ...a, read: readAnn.includes(a.id) })),
      ].sort((a: any, b: any) => (b.createdAtMs || 0) - (a.createdAtMs || 0)),
    [personalNotifs, announcements, readAnn, hiddenAnn]
  );

  // Senkron/yetki hataları için bildirim şeridi
  const [syncError, setSyncError] = useState<string | null>(null);
  useEffect(() => {
    const h = (e: Event) => {
      setSyncError((e as CustomEvent).detail || 'Bir hata oluştu.');
      setTimeout(() => setSyncError(null), 4500);
    };
    window.addEventListener('mp-sync-error', h);
    return () => window.removeEventListener('mp-sync-error', h);
  }, []);
  const [profileSubTab, setProfileSubTab] = useState<'profil' | 'tekliflerim' | 'bildirimler'>('profil');
  const [isBusOpen, setIsBusOpen] = useState(false);
  const [isMarketListingOpen, setIsMarketListingOpen] = useState(false);
  const [isVefatOpen, setIsVefatOpen] = useState(false);
  const [isEBelediyeOpen, setIsEBelediyeOpen] = useState(false);
  const [isSaglikOcagiOpen, setIsSaglikOcagiOpen] = useState(false);
  const [isMuhtarlikOpen, setIsMuhtarlikOpen] = useState(false);
  const [muhtarlikInitialTab, setMuhtarlikInitialTab] = useState<'iletisim' | 'talep' | 'basvurular' | 'evrak' | 'rehber'>('iletisim');
  const [muhtarlikApplications, setMuhtarlikApplications] = useSyncedList<MuhtarlikApplication>('plus_muhtarlik', {
    enabled: !!myUid,
    stampOwner: true,
    key: `${myUid}-${isStaffRole}`,
    constraints: isStaffRole || !myUid ? [] : [where('ownerUid', '==', myUid)],
  });
  const [isKesintilerOpen, setIsKesintilerOpen] = useState(false);
  const [vefatModalInitialTab, setVefatModalInitialTab] = useState<'vitrin' | 'ilan-ver' | 'onay-bekleyenler'>('vitrin');
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isEsnafPaneliOpen, setIsEsnafPaneliOpen] = useState(false);
  const [isUstaPaneliOpen, setIsUstaPaneliOpen] = useState(false);
  const [isEditorPanelOpen, setIsEditorPanelOpen] = useState(false);
  const [isMahalleSakiniPaneliOpen, setIsMahalleSakiniPaneliOpen] = useState(false);
  const [isJobsModalOpen, setIsJobsModalOpen] = useState(false);
  const [jobList, setJobList] = useSyncedList<JobItem>('plus_isler', { stampOwner: true });
  const [obituaryList, setObituaryList] = useSyncedList<ObituaryItem>('plus_vefat', { stampOwner: true });
  // Tüm işletmeler (herkes okur). Onaysız/reddedilenler yalnızca sahibine ve yönetime görünür.
  const [allRestaurants, setRestaurantsList, restaurantsReady] = useSyncedList<RestaurantItem>('plus_isletmeler', {
    stampOwner: true,
  });
  const restaurantsList = useMemo(
    () =>
      allRestaurants.filter(
        (r) =>
          !r.approvalStatus ||
          r.approvalStatus === 'approved' ||
          (!!myUid && r.ownerUid === myUid) ||
          isStaffRole
      ),
    [allRestaurants, myUid, isStaffRole]
  );
  const ownStore = useMemo(
    () => (myUid ? allRestaurants.find((r) => r.ownerUid === myUid) || null : null),
    [allRestaurants, myUid]
  );

  // Esnaf başvuruları: yönetim hepsini, esnaf yalnızca kendi başvurusunu görür
  const [merchantsList, setMerchantsList, merchantsReady] = useSyncedList<PendingMerchantItem>('plus_esnaf_basvurulari', {
    enabled: !!myUid,
    stampOwner: true,
    key: `${myUid}-${isStaffRole}`,
    constraints: isStaffRole || !myUid ? [] : [where('ownerUid', '==', myUid)],
  });

  // Esnaf Hikaye Sistemi (Tam Ekran Video / Görsel Paylaşımı)
  const [storiesList, setStoriesList] = useSyncedList<StoryItem>('plus_hikayeler', { stampOwner: true });
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [isEsnafStoryShareOpen, setIsEsnafStoryShareOpen] = useState(false);
  const [storySharePrefill, setStorySharePrefill] = useState<{
    title?: string;
    badge?: string;
  } | null>(null);
  const [isExportCodeOpen, setIsExportCodeOpen] = useState(false);

  const handlePublishEsnafStory = (newStory: StoryItem) => {
    setStoriesList((prev) => [newStory, ...prev]);
    setSelectedStoryIndex(0);
    setIsStoryViewerOpen(true);
  };

  // Selected Item Detail Modals (URL ile çift yönlü senkronize)
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantItem | null>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseCurrentPath(window.location.pathname);
      if (parsed.esnafSlug) {
        return findMatchingRestaurant(parsed.esnafSlug, restaurantsList) || null;
      }
    }
    return null;
  });
  const [selectedTableForModal, setSelectedTableForModal] = useState<number | 'paket'>(1);
  const [selectedModeForStoreModal, setSelectedModeForStoreModal] = useState<'qr_menu' | 'magaza_vitrini'>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseCurrentPath(window.location.pathname);
      if (parsed.esnafSlug) {
        const match = findMatchingRestaurant(parsed.esnafSlug, restaurantsList);
        if (match?.businessMode) return match.businessMode;
      }
    }
    return 'qr_menu';
  });
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [esnafSectionDefaultMode, setEsnafSectionDefaultMode] = useState<'all' | 'qr_menu' | 'magaza_vitrini'>('all');
  const [selectedAd, setSelectedAd] = useState<ClassifiedItem | null>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseCurrentPath(window.location.pathname);
      if (parsed.adId) {
        return findMatchingAd(parsed.adId, classifiedList) || null;
      }
    }
    return null;
  });
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseCurrentPath(window.location.pathname);
      if (parsed.newsId) {
        return findMatchingNews(parsed.newsId, newsList) || null;
      }
    }
    return null;
  });

  // Generic Info Modal
  const [genericModalData, setGenericModalData] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    content: React.ReactNode;
  }>({
    isOpen: false,
    title: '',
    content: null,
  });

  // Sync Android App Icon Badge on Home Screen
  useEffect(() => {
    const unread = userNotifications.filter((n) => !n.read).length;
    updateAppIconBadge(unread);
  }, [userNotifications]);

  // Handle incoming Android Push Notification clicks and deep links
  useEffect(() => {
    // 1. Check URL parameters on mount (if opened from cold notification click or shortcut)
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const subTabParam = params.get('subTab');
      const actionParam = params.get('action');

      if (actionParam === 'ulasim') {
        setIsBusOpen(true);
      }
      if (tabParam) {
        if (tabParam === 'tekliflerim') {
          setCurrentTab('profil');
          setProfileSubTab('tekliflerim');
        } else if (tabParam === 'bildirimler') {
          setCurrentTab('profil');
          setProfileSubTab('bildirimler');
        } else if (['anasayfa', 'esnaf', 'hizmet', 'haberler', 'alim-satim', 'profil'].includes(tabParam)) {
          setCurrentTab(tabParam as NavTab);
          if (subTabParam && (subTabParam === 'tekliflerim' || subTabParam === 'bildirimler' || subTabParam === 'profil')) {
            setProfileSubTab(subTabParam);
          }
        }
      }
    } catch (e) {}

    // 2. Service Worker push click postMessage event listener
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const messageHandler = (event: MessageEvent) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
          const payload = event.data.payload || {};
          const actionTab = payload.actionTab;
          const subTab = payload.subTab;

          if (actionTab === 'canli_yayin') {
            setIsLiveStreamOpen(true);
          } else if (actionTab === 'vefat') {
            setIsVefatOpen(true);
          } else if (actionTab === 'tekliflerim') {
            setCurrentTab('profil');
            setProfileSubTab('tekliflerim');
          } else if (actionTab === 'bildirimler') {
            setCurrentTab('profil');
            setProfileSubTab('bildirimler');
          } else if (actionTab === 'haber' || actionTab === 'haberler') {
            setCurrentTab('haber');
          } else if (actionTab === 'alim_satim' || actionTab === 'alim-satim') {
            setCurrentTab('alim-satim');
          } else if (actionTab === 'hizmet') {
            setCurrentTab('hizmet');
          } else if (actionTab && ['anasayfa', 'esnaf', 'hizmet', 'haber', 'alim-satim', 'profil'].includes(actionTab)) {
            setCurrentTab(actionTab as NavTab);
            if (subTab && (subTab === 'tekliflerim' || subTab === 'bildirimler' || subTab === 'profil')) {
              setProfileSubTab(subTab);
            }
          }
        }
      };

      navigator.serviceWorker.addEventListener('message', messageHandler);
      return () => {
        navigator.serviceWorker.removeEventListener('message', messageHandler);
      };
    }
  }, []);

  // 3. Tarayıcı İleri / Geri butonları (popstate) dinleyicisi
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const route = parseCurrentPath(window.location.pathname);
      setCurrentTab(route.tab);

      if (route.esnafSlug) {
        const matched = findMatchingRestaurant(route.esnafSlug, restaurantsList);
        setSelectedRestaurant(matched || null);
        if (matched) {
          setSelectedTableForModal(1);
          setSelectedModeForStoreModal(matched.businessMode || 'qr_menu');
        }
      } else {
        setSelectedRestaurant(null);
      }

      if (route.newsId) {
        const matchedNews = findMatchingNews(route.newsId, newsList);
        setSelectedNews(matchedNews || null);
      } else {
        setSelectedNews(null);
      }

      if (route.adId) {
        const matchedAd = findMatchingAd(route.adId, classifiedList);
        setSelectedAd(matchedAd || null);
      } else {
        setSelectedAd(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [restaurantsList, newsList, classifiedList]);

  // 4. Durum değiştikçe Tarayıcı URL çubuğunu temiz / semantik adreslerle güncelle (Www.mutlularhaber.com/...)
  const isInitialUrlSync = useRef(true);
  useEffect(() => {
    const { path, title } = generateCanonicalPath({
      tab: currentTab,
      selectedRestaurant,
      selectedNews,
      selectedAd,
    });

    if (isInitialUrlSync.current) {
      isInitialUrlSync.current = false;
      syncUrlToBrowser(path, title, true); // İlk açılışta replaceState ile URL'yi temizle
    } else {
      syncUrlToBrowser(path, title, false); // Kullanıcı etkileşimlerinde pushState ile geçmişe yaz
    }
  }, [currentTab, selectedRestaurant, selectedNews, selectedAd]);

  // Action Handlers
  const handleOpenSearchWithQuery = (q: string) => {
    setSearchInitialQuery(q);
    setIsSearchOpen(true);
  };

  const handleSelectService = (service: any) => {
    if (service.isPharmacy || service.id === 'eczane') {
      setIsPharmacyOpen(true);
    } else if (service.id === 'saglik' || service.id === 'asm' || service.id === 'saglik-ocagi') {
      setIsSaglikOcagiOpen(true);
    } else if (service.id === 'kesinti' || service.id === 'buski' || service.id === 'uedas') {
      setIsKesintilerOpen(true);
    } else if (service.id === 'yemek') {
      setEsnafSectionDefaultMode('qr_menu');
      setCurrentTab('yemek');
    } else if (service.id === 'hizmet') {
      setIsQuoteWizardOpen(true);
    } else if (service.id === 'taksi' || service.id === 'ulasim') {
      setIsBusOpen(true);
    } else if (service.id === 'esnaf') {
      setEsnafSectionDefaultMode('magaza_vitrini');
      setCurrentTab('yemek');
    } else if (service.id === 'vefat') {
      setVefatModalInitialTab('vitrin');
      setIsVefatOpen(true);
    } else if (service.id === 'vasita') {
      const firstCar = classifiedList.find((c) => c.categoryType === 'vasita' || c.subCategory === 'arac') || classifiedList[0];
      if (firstCar) setSelectedAd(firstCar);
      else setCurrentTab('alim-satim');
    } else if (service.id === 'emlak') {
      const flat = classifiedList.find((c) => c.categoryType === 'emlak' || c.subCategory === 'ev') || classifiedList[0];
      if (flat) setSelectedAd(flat);
      else setCurrentTab('alim-satim');
    } else if (service.id === 'is-ilanlari') {
      setIsJobsModalOpen(true);
    } else {
      setGenericModalData({
        isOpen: true,
        title: `${service.title} Hizmetleri`,
        subtitle: 'Mutlular Plus Şehir Rehberi',
        content: (
          <p>
            {service.title} kategorisinde Mutlular ve çevresinde onaylı işletmeler, iletişim bilgileri ve fırsatlar listelenmektedir.
          </p>
        ),
      });
    }
  };

  const handleOpenBelediye = () => {
    setIsEBelediyeOpen(true);
  };

  const handleApplyJob = (job: JobItem) => {
    setIsJobsModalOpen(true);
  };

  const handleAddNewJob = (newJob: JobItem) => {
    setJobList((prev) => [newJob, ...prev]);
    const notif: UserNotification = {
      id: `job-notif-${Date.now()}`,
      type: 'duyuru',
      title: `Yeni Eleman Talebi: ${newJob.title}`,
      message: `${newJob.company} yeni bir eleman ilanı açtı (${newJob.salary || newJob.type}).`,
      date: 'Az önce',
      read: false,
      badgeText: newJob.isUrgent ? 'ACİL ELEMAN' : 'İŞ İLANI',
      sender: newJob.company,
      actionTab: 'hizmet',
    };
    setUserNotifications((prev) => [notif, ...prev]);
  };

  const handleApplyJobToSystem = (jobId: string, application: JobApplication) => {
    setJobList((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
              ...job,
              applications: [application, ...(job.applications || [])],
            }
          : job
      )
    );

    const targetJob = jobList.find((j) => j.id === jobId);
    const notif: UserNotification = {
      id: `app-notif-${Date.now()}`,
      type: 'teklif',
      title: `İş Başvurunuz İletildi`,
      message: `"${targetJob?.title || 'İlan'}" başvurunuz işverene iletildi. İlgili usta/esnaf sizinle iletişime geçecektir.`,
      date: 'Az önce',
      read: false,
      badgeText: 'BAŞVURU',
      actionTab: 'profil',
    };
    setUserNotifications((prev) => [notif, ...prev]);
  };

  const handleAddNewAd = (newAd: ClassifiedItem) => {
    setClassifiedList((prev) => [newAd, ...prev]);
  };

  // Notification handlers
  const unreadNotificationCount = userNotifications.filter((n) => !n.read).length;
  const pendingMuhtarApplicationsCount = muhtarlikApplications.filter((a) => a.status === 'bekliyor').length;

  const handleNewMuhtarlikApplication = async (newApp: MuhtarlikApplication) => {
    setMuhtarlikApplications((prev) => [newApp, ...prev]);

    const notif: UserNotification = {
      id: `notif-muhtar-${Date.now()}`,
      type: 'muhtarlik',
      title: '🏛️ Yeni Muhtarlık Başvurusu & Talebi Geldi!',
      message: `${newApp.citizenName} (${newApp.street}): ${newApp.category} talebi iletildi: "${newApp.message}"`,
      date: 'Az önce',
      read: false,
      relatedId: newApp.id,
      badgeText: 'RESMİ TALEP',
      sender: 'Mehmet Akif Mahalle Muhtarlığı',
      actionTab: 'muhtar_paneli',
    };
    setUserNotifications((prev) => [notif, ...prev]);

    try {
      await sendAndroidAppNotification({
        id: `push-muhtar-${Date.now()}`,
        title: '🏛️ T.C. Mahalle Muhtarlığı - Yeni Başvuru!',
        body: `${newApp.citizenName} (${newApp.street}): ${newApp.category} - "${newApp.message.slice(0, 75)}..."`,
        type: 'muhtarlik',
        badgeText: 'RESMİ TALEP',
        actionTab: 'muhtar_paneli',
        relatedId: newApp.id,
      });
    } catch {}
  };

  const handleUpdateMuhtarlikApplicationStatus = (
    id: string,
    newStatus: MuhtarlikApplication['status'],
    notes?: string
  ) => {
    setMuhtarlikApplications((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
              officialNotes: notes !== undefined ? notes : item.officialNotes,
              updatedAt: 'Az önce',
            }
          : item
      )
    );
  };

  const isAnnouncementId = (id: string) => announcements.some((a) => a.id === id);

  const handleMarkAsRead = (id: string) => {
    if (isAnnouncementId(id)) {
      setReadAnn((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
      return;
    }
    setUserNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setReadAnn(announcements.map((a) => a.id));
    setUserNotifications((prev) => prev.map((n) => (n.read ? n : { ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    if (isAnnouncementId(id)) {
      setHiddenAnn((prev) => [...prev, id]);
      return;
    }
    setUserNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    setHiddenAnn(announcements.map((a) => a.id));
    setUserNotifications([]);
  };

  const handleAddTestNotification = (type: NotificationType) => {
    const title =
      type === 'teklif'
        ? 'Yeni Usta Teklifi Geldi!'
        : type === 'ilan'
        ? 'İlanınız Onaylandı!'
        : 'Sistem Duyurusu';
    const message =
      type === 'teklif'
        ? 'Mutlular Bölge Ustası talebinize 750 ₺ teklif iletti. Detayları inceleyebilirsiniz.'
        : type === 'ilan'
        ? 'Verdiğiniz ilan denetimden geçti ve Alım Satım vitrininde yayına alındı.'
        : 'Mutlular Plus güncel mahalle duyuruları ve servisleri aktif.';

    const newNotif: UserNotification = {
      id: `notif-${Date.now()}`,
      type,
      title,
      message,
      date: 'Az önce',
      read: false,
      badgeText: type === 'teklif' ? '750 ₺ Teklif' : type === 'ilan' ? 'Yayında' : 'Bilgi',
      sender: type === 'teklif' ? 'Bölge Ustası' : 'Yönetim Masası',
      actionTab: type === 'teklif' ? 'tekliflerim' : 'alim-satim',
    };
    setUserNotifications((prev) => [newNotif, ...prev]);

    // Send native Android notification + sound + haptic vibration
    sendAndroidAppNotification({
      title: `📲 ${title}`,
      body: message,
      type,
      tag: `notif-${type}`,
      badgeText: newNotif.badgeText,
      actionTab: newNotif.actionTab,
    });
  };

  // Admin moderation handlers
  const handleAdminApproveAd = (approvedAd: ClassifiedItem) => {
    // If ad is already in list, do not duplicate; otherwise prepend
    setClassifiedList((prev) => {
      const exists = prev.some((item) => item.id === approvedAd.id);
      if (exists) return prev;
      return [approvedAd, ...prev];
    });

    // Notify user of approved ad
    const notif: UserNotification = {
      id: `notif-appr-${Date.now()}`,
      type: 'ilan',
      title: `İlanınız Yayında: ${approvedAd.title.slice(0, 28)}...`,
      message: `"${approvedAd.title}" ilanınız yönetici tarafından onaylandı ve yayına alındı.`,
      date: 'Az önce',
      read: false,
      relatedId: approvedAd.id,
      badgeText: 'Yayında',
      sender: 'Yönetim Masası',
      actionTab: 'alim-satim',
    };
    setUserNotifications((prev) => [notif, ...prev]);
  };

  const handleAdminDeleteAd = (adId: string) => {
    setClassifiedList((prev) => prev.filter((item) => item.id !== adId));
  };

  const handleAdminAddNewNews = (newNews: NewsItem) => {
    setNewsList((prev) => [newNews, ...prev]);
  };

  const handleAdminUpdateNews = (updatedNews: NewsItem) => {
    setNewsList((prev) =>
      prev.map((item) => (item.id === updatedNews.id ? updatedNews : item))
    );
  };

  const handleAdminDeleteNews = (newsId: string) => {
    setNewsList((prev) => prev.filter((item) => item.id !== newsId));
  };

  const handleAddNewObituary = (newOb: ObituaryItem) => {
    setObituaryList((prev) => [newOb, ...prev]);
  };

  const handleApproveObituary = async (obId: string) => {
    let approvedItem: ObituaryItem | null = null;
    setObituaryList((prev) =>
      prev.map((item) => {
        if (item.id === obId) {
          approvedItem = {
            ...item,
            status: 'approved',
            approvedBy: userProfile?.name || 'Yönetici / Editör',
          };
          return approvedItem;
        }
        return item;
      })
    );

    if (approvedItem) {
      const ob: ObituaryItem = approvedItem;
      await sendAndroidAppNotification({
        title: `🕊️ Vefat & Taziye: ${ob.name}`,
        body: `Cenazesi ${ob.date} vakti ${ob.mosque} camiinden kaldırılacaktır. Memleketi: ${ob.hometown}. Taziye: ${ob.phone}. Başsağlığı dileriz.`,
        type: 'vefat',
        actionTab: 'vefat',
        badgeText: 'VEFAT & TAZİYE',
        timestamp: Date.now(),
      });
    }
  };

  const handleRejectObituary = (obId: string) => {
    setObituaryList((prev) =>
      prev.map((item) => (item.id === obId ? { ...item, status: 'rejected' } : item))
    );
  };

  const handleDeleteObituary = (obId: string) => {
    setObituaryList((prev) => prev.filter((item) => item.id !== obId));
  };

  const applyMerchantDecision = (mId: string, decision: 'approved' | 'rejected') => {
    const merchant = merchantsList.find((m) => m.id === mId);
    setMerchantsList((prev) => prev.map((m) => (m.id === mId ? { ...m, status: decision } : m)));
    if (merchant?.storeId) {
      setRestaurantsList((prev) =>
        prev.map((r) => (r.id === merchant.storeId ? { ...r, approvalStatus: decision } : r))
      );
    }
    if (merchant?.ownerUid) {
      updateDoc(fsDoc(db, 'plus_users', merchant.ownerUid), {
        businessApproved: decision === 'approved',
      }).catch(() => {});
    }
  };

  const handleApproveMerchant = (mId: string) => applyMerchantDecision(mId, 'approved');

  const handleRejectMerchant = (mId: string) => applyMerchantDecision(mId, 'rejected');

  // Esnaf hesabı için işletme kaydı yoksa (ör. üyelikte esnaf seçilmişse) onay bekleyen kayıt oluştur
  useEffect(() => {
    if (!myUid || !userProfile || userProfile.role !== 'esnaf') return;
    if (!restaurantsReady || !merchantsReady) return;
    if (!userProfile.businessName) return;
    if (allRestaurants.some((r) => r.ownerUid === myUid)) return;
    const mode: BusinessTypeMode = userProfile.businessMode || 'magaza_vitrini';
    const storeId = `rest-${myUid}`;
    setRestaurantsList((prev) =>
      prev.some((r) => r.id === storeId)
        ? prev
        : [
            {
              id: storeId,
              approvalStatus: 'pending',
              slug: slugify(userProfile.businessName || 'isletme'),
              name: userProfile.businessName || 'İşletme',
              tag: userProfile.businessCategory || 'Esnaf',
              rating: 0,
              time: mode === 'qr_menu' ? 'QR Menü' : 'Mağaza',
              deliveryFee: mode === 'qr_menu' ? 'Masada Sipariş' : 'Mağazada Deneme',
              minOrder: mode === 'qr_menu' ? 'QR Menü Aktif' : 'Yeni Sezon',
              image: '',
              category: mode === 'qr_menu' ? 'yemek' : 'diger',
              businessMode: mode,
              orderType: mode === 'qr_menu' ? 'online' : 'store_only',
              phone: userProfile.phone,
              address: userProfile.businessAddress,
              products: [],
              menu: [],
            } as RestaurantItem,
            ...prev,
          ]
    );
    setMerchantsList((prev) =>
      prev.some((m) => m.id === `merch-${myUid}`)
        ? prev
        : [
            {
              id: `merch-${myUid}`,
              storeId,
              businessName: userProfile.businessName || 'İşletme',
              category: userProfile.businessCategory || 'Esnaf',
              ownerName: userProfile.name,
              phone: userProfile.phone || '',
              address: userProfile.businessAddress || 'Mutlular Mah.',
              status: 'pending',
              date: 'Az önce',
            },
            ...prev,
          ]
    );
  }, [myUid, userProfile?.role, userProfile?.businessName, restaurantsReady, merchantsReady, allRestaurants.length]);

  // Onay durumu işletme kaydından profile yansısın (yönetici onaylayınca esnaf panelinde görünür)
  useEffect(() => {
    if (!ownStore || !userProfile || userProfile.role !== 'esnaf') return;
    const ok = ownStore.approvalStatus === 'approved' || !ownStore.approvalStatus;
    if (userProfile.businessApproved !== ok) {
      setUserProfile((p) => (p ? { ...p, businessApproved: ok } : p));
    }
  }, [ownStore?.approvalStatus]);

  // Canlı hizmet talebi bildirimleri: usta yeni talep, sakin yeni teklif görür
  const quoteSeenRef = useRef<{ uid: string | null; map: Map<string, number> } | null>(null);
  useEffect(() => {
    if (!quotesReady || !myUid) {
      quoteSeenRef.current = null;
      return;
    }
    const map = new Map<string, number>(quotesAll.map((q) => [q.id, (q.offers || []).length]));
    const prevSeen = quoteSeenRef.current;
    if (prevSeen && prevSeen.uid === myUid) {
      quotesAll.forEach((q) => {
        const before = prevSeen.map.get(q.id);
        if (before === undefined && q.ownerUid !== myUid && canSeeAllQuotes) {
          sendAndroidAppNotification({
            title: `🔨 Yeni Usta Talebi: ${q.category}`,
            body: `"${q.subCategory}" için mahalleden yeni talep geldi (${q.urgency}). Teklif vermek için tıklayın.`,
            type: 'usta_talep',
            channelId: 'usta_talep',
            actionTab: 'hizmet',
            badgeText: 'YENİ TALEP',
            timestamp: Date.now(),
          });
        }
        if (before !== undefined && q.ownerUid === myUid && (q.offers || []).length > before) {
          const last = (q.offers || [])[(q.offers || []).length - 1];
          sendAndroidAppNotification({
            title: `💼 Ustanızdan Teklif Geldi! (${last?.price || ''})`,
            body: `${last?.masterTitle || 'Usta'} "${q.subCategory}" talebinize teklif iletti.`,
            type: 'kullanici_teklif',
            channelId: 'kullanici_teklif',
            actionTab: 'tekliflerim',
            badgeText: 'YENİ TEKLİF',
            relatedId: q.id,
            timestamp: Date.now(),
          });
        }
      });
    }
    quoteSeenRef.current = { uid: myUid, map };
  }, [quotesAll, quotesReady, myUid, canSeeAllQuotes]);

  // Doğrudan bağlantılar (esnaf / haber / ilan) veri yüklendikten sonra açılsın
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const parsed = parseCurrentPath(window.location.pathname);
    if (parsed.esnafSlug && !selectedRestaurant && restaurantsList.length > 0) {
      const found = findMatchingRestaurant(parsed.esnafSlug, restaurantsList);
      if (found) setSelectedRestaurant(found);
    }
  }, [restaurantsList.length]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const parsed = parseCurrentPath(window.location.pathname);
    if (parsed.newsId && !selectedNews && newsList.length > 0) {
      const found = findMatchingNews(parsed.newsId, newsList);
      if (found) setSelectedNews(found);
    }
  }, [newsList.length]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const parsed = parseCurrentPath(window.location.pathname);
    if (parsed.adId && !selectedAd && classifiedList.length > 0) {
      const found = findMatchingAd(parsed.adId, classifiedList);
      if (found) setSelectedAd(found);
    }
  }, [classifiedList.length]);

  const handleRegisterBusiness = (data: RegisteredBusinessPayload) => {
    const initialProducts: StoreShowcaseProduct[] = [];
    const storeUid = userProfile?.uid || authUidRef.current;

    const newStore: RestaurantItem = {
      id: storeUid ? `rest-${storeUid}` : `rest-${Date.now()}`,
      approvalStatus: 'pending',
      slug: slugify(data.businessName),
      name: data.businessName,
      tag: data.category,
      rating: 5.0,
      time: data.businessMode === 'qr_menu' ? '20-30 dk' : 'Açık • Mağaza',
      deliveryFee: data.businessMode === 'qr_menu' ? 'Masada Sipariş' : 'Mağazada Deneme',
      minOrder: data.businessMode === 'qr_menu' ? 'QR Menü Aktif' : 'Yeni Sezon',
      image:
        data.image ||
        (data.businessMode === 'qr_menu'
          ? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80'),
      category: data.categoryKey,
      businessMode: data.businessMode,
      orderType: data.businessMode === 'qr_menu' ? 'online' : 'store_only',
      phone: data.phone,
      address: data.address,
      workingHours: data.workingHours,
      description: data.description,
      products: initialProducts,
      menu: initialProducts.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        discountPrice: p.discountPrice,
        desc: p.desc,
        image: p.image,
        category: p.category,
        inStock: p.inStock,
        stockStatus: p.stockStatus,
        stockCount: p.stockCount,
        sizes: p.sizes,
        badge: p.badge,
      })),
    };

    setRestaurantsList((prev) => {
      const filtered = prev.filter((r) => r.id !== newStore.id);
      return [newStore, ...filtered];
    });

    // Connect to Esnaf registration system
    const newMerchant: PendingMerchantItem = {
      id: storeUid ? `merch-${storeUid}` : `merch-${Date.now()}`,
      storeId: newStore.id,
      businessName: data.businessName,
      category: data.category,
      ownerName: data.ownerName,
      phone: data.phone,
      address: data.address,
      status: 'pending',
      date: 'Az önce',
    };
    setMerchantsList((prev) => [newMerchant, ...prev.filter((m) => m.id !== newMerchant.id)]);

    // Update or activate user profile as esnaf
    const updatedProfile: UserProfile = {
      name: (userProfile && userProfile.name) || data.ownerName || 'İşletme Sahibi',
      phone: data.phone || userProfile?.phone,
      email: userProfile?.email,
      role: 'esnaf',
      roleLabel: 'Esnaf / İşletme',
      businessName: data.businessName,
      businessCategory: data.category,
      businessAddress: data.address,
      businessMode: data.businessMode,
      businessApproved: false,
      loginMethod: userProfile?.loginMethod || 'form',
    };

    setUserProfile(updatedProfile);
    if (authUidRef.current) {
      saveProfile(authUidRef.current, { ...updatedProfile, businessApproved: false }).catch(() => {});
    }
    setIsLoggedIn(true);

    // Add user notification
    const notif: UserNotification = {
      id: `notif-biz-${Date.now()}`,
      type: 'sistem',
      title: `🏪 Esnaf Kaydınız Başarıyla Oluşturuldu!`,
      message: `"${data.businessName}" dükkanınız yönetim onayına gönderildi. Onaylandığında vitrinde herkese görünür olacak; panelinizden ürünlerinizi şimdiden hazırlayabilirsiniz.`,
      date: 'Az önce',
      read: false,
      badgeText: 'Esnaf Bağlandı',
      sender: 'Esnaf İşletme Masası',
      actionTab: 'yemek',
    };
    setUserNotifications((prev) => [notif, ...prev]);

    // Send Android push notification
    sendAndroidAppNotification({
      title: `🏪 Yeni Esnaf Katıldı: ${data.businessName}`,
      body: `${data.businessName} Mutlular Esnaf Vitrinine katıldı! İncelemek veya sipariş vermek için dokunun.`,
      type: 'duyuru',
      actionTab: 'yemek',
      badgeText: 'YENİ ESNAF',
      timestamp: Date.now(),
    });
  };

  const handleSyncStoreProducts = useCallback(
    (
      storeName: string,
      products: StoreShowcaseProduct[],
      mode: BusinessTypeMode
    ) => {
      setRestaurantsList((prev) => {
        const matchesAny = prev.some((r) => !!userProfile?.uid && r.ownerUid === userProfile.uid);

        let nextList = prev;
        if (matchesAny) {
          nextList = prev.map((r) => {
            const matches = !!userProfile?.uid && r.ownerUid === userProfile.uid;
            if (matches) {
              return {
                ...r,
                businessMode: mode,
                products,
                menu: products.map((p) => ({
                  id: p.id,
                  name: p.name,
                  price: p.price,
                  discountPrice: p.discountPrice,
                  desc: p.desc,
                  image: p.image,
                  category: p.category,
                  inStock: p.inStock,
                  stockStatus: p.stockStatus,
                  stockCount: p.stockCount,
                  sizes: p.sizes,
                  badge: p.badge,
                })),
              };
            }
            return r;
          });
        }

        return nextList;
      });
    },
    [userProfile?.uid, userProfile?.businessName]
  );

  const handleUpdateStoreDetails = useCallback(
    (details: {
      storeName: string;
      category: string;
      businessMode: BusinessTypeMode;
      phone: string;
      address: string;
      workingHours: string;
      description: string;
      image?: string;
    }) => {
      setRestaurantsList((prev) => {
        const updated = prev.map((r) => {
          const isTarget = !!userProfile?.uid && r.ownerUid === userProfile.uid;
          if (isTarget) {
            return {
              ...r,
              name: details.storeName,
              tag: details.category,
              category: details.businessMode === 'qr_menu' ? ('yemek' as const) : ('giyim' as const),
              businessMode: details.businessMode,
              orderType: (details.businessMode === 'qr_menu' ? 'online' : 'store_only') as 'online' | 'store_only',
              phone: details.phone,
              address: details.address,
              workingHours: details.workingHours,
              description: details.description,
              image: details.image || r.image,
            };
          }
          return r;
        });

        return updated;
      });

      setUserProfile((prev) => {
        if (!prev) return null;
        const next: UserProfile = {
          ...prev,
          businessName: details.storeName,
          businessCategory: details.category,
          businessAddress: details.address,
          businessMode: details.businessMode,
          phone: details.phone || prev.phone,
        };
        if (authUidRef.current) {
          saveProfile(authUidRef.current, next).catch(() => {});
        }
        return next;
      });
    },
    [userProfile?.uid, userProfile?.businessName]
  );

  const handleSyncStoreCampaigns = useCallback(
    (campaigns: any[]) => {
      if (!userProfile?.uid) return;
      setRestaurantsList((prev) =>
        prev.map((r) => (r.ownerUid === userProfile.uid ? { ...r, campaigns } : r))
      );
    },
    [userProfile?.uid]
  );

  const handleAdminUpdateAd = (updatedAd: ClassifiedItem) => {
    setClassifiedList((prev) =>
      prev.map((item) => (item.id === updatedAd.id ? updatedAd : item))
    );
  };

  const handleNewQuoteCreated = (newReq: {
    id: string;
    category: string;
    subCategory: string;
    urgency: string;
    desc: string;
    address: string;
    phone: string;
    createdAt: string;
  }) => {
    const formattedRequest: UserQuoteRequest = {
      id: newReq.id || `req-${Date.now()}`,
      category: newReq.category,
      subCategory: newReq.subCategory,
      status: 'beklemede',
      urgency: newReq.urgency,
      desc: newReq.desc,
      address: newReq.address,
      phone: newReq.phone,
      createdAt: 'Az önce',
      ownerName: userProfile?.name || 'Mahalle Sakini',
      offersCount: 0,
      offers: [],
    };
    setUserQuotes((prev) => [formattedRequest, ...prev]);

    // Add confirmation notification
    const notif: UserNotification = {
      id: `notif-quote-${Date.now()}`,
      type: 'teklif',
      title: `Teklif Talebiniz Yayında: ${newReq.subCategory}`,
      message: `"${newReq.category}" alanındaki talebiniz ustalara iletildi. Teklif geldiğinde bildirileceksiniz.`,
      date: 'Az önce',
      read: false,
      relatedId: formattedRequest.id,
      badgeText: 'İnceleniyor',
      sender: 'Mutlular Hizmet Havuzu',
      actionTab: 'tekliflerim',
    };
    setUserNotifications((prev) => [notif, ...prev]);

    // 1. Müşteri Bilgilendirme Bildirimi
    sendAndroidAppNotification({
      title: '📋 Teklif Talebiniz Alındı',
      body: `"${newReq.subCategory}" talebiniz ustalara iletildi. Teklif geldiğinde anlık bildirim alacaksınız.`,
      type: 'teklif',
      badgeText: 'İNCELENİYOR',
      actionTab: 'tekliflerim',
      timestamp: Date.now(),
    });

    // 2. Ustaya Talep Bildirimi (Özel Bildirim Simülasyonu)
    setTimeout(() => {
      sendAndroidAppNotification({
        title: `🔨 Yeni Usta Talebi: ${newReq.category}`,
        body: `"${newReq.subCategory}" için mahalleden yeni talep geldi (${newReq.urgency}). Teklif vermek için tıklayın.`,
        type: 'usta_talep',
        channelId: 'usta_talep',
        actionTab: 'hizmet',
        badgeText: 'YENİ TALEP',
        timestamp: Date.now(),
      });
    }, 1200);
  };

  const handleAcceptOffer = (requestId: string, offer: MasterOffer) => {
    setUserQuotes((prev) =>
      prev.map((q) =>
        q.id === requestId
          ? {
              ...q,
              status: 'tamamlandi' as const,
              acceptedOffer: offer,
            }
          : q
      )
    );

    // Add acceptance notification
    const notif: UserNotification = {
      id: `notif-accept-${Date.now()}`,
      type: 'teklif',
      title: `Teklif Kabul Edildi: ${offer.masterTitle}`,
      message: `${offer.price} tutarındaki teklifi kabul ettiniz. Ustanız adresinize yönlendirildi.`,
      date: 'Az önce',
      read: false,
      relatedId: requestId,
      badgeText: 'Anlaşıldı',
      sender: offer.masterTitle,
      actionTab: 'tekliflerim',
    };
    setUserNotifications((prev) => [notif, ...prev]);

    sendAndroidAppNotification({
      title: `🤝 Teklif Kabul Edildi: ${offer.price}`,
      body: `${offer.masterTitle} teklifinizi onayladınız. Usta adresinize yönlendirildi.`,
      type: 'teklif',
      badgeText: 'ONAYLANDI',
      actionTab: 'tekliflerim',
      timestamp: Date.now(),
    });
  };

  const handleCancelQuoteRequest = (requestId: string) => {
    setUserQuotes((prev) => prev.filter((q) => q.id !== requestId));
  };

  const handleUstaSubmitOffer = (offerData: {
    requestId: string;
    customerName: string;
    price: string;
    estimatedTime: string;
    message: string;
  }) => {
    // Teklifi talebin üzerine gerçekten kaydet (talep sahibi anında görür)
    if (myUid) {
      const offer: MasterOffer = {
        id: `offer-${Date.now()}-${myUid.slice(0, 5)}`,
        ustaUid: myUid,
        masterTitle: userProfile?.name || 'Usta',
        price: offerData.price,
        estimatedTime: offerData.estimatedTime,
        message: offerData.message || 'Usta güvencesiyle kaliteli ve garantili hizmet.',
        phone: userProfile?.phone,
      };
      updateDoc(fsDoc(db, 'plus_talepler', offerData.requestId), {
        offers: arrayUnion(offer),
        offersCount: increment(1),
        status: 'teklif-geldi',
      }).catch(() => {
        window.dispatchEvent(new CustomEvent('mp-sync-error', { detail: 'Teklif gönderilemedi. Yetkinizi ve bağlantınızı kontrol edin.' }));
      });
    }

    const notif: UserNotification = {
      id: `notif-usta-${Date.now()}`,
      type: 'teklif',
      title: `Teklifiniz İletildi: ${offerData.price}`,
      message: `${offerData.customerName} adlı sakinin talebine verdiğiniz ${offerData.price} tutarındaki teklif sisteme kaydedildi.`,
      date: 'Az önce',
      read: false,
      badgeText: 'Usta Teklifi',
      actionTab: 'tekliflerim',
      sender: userProfile?.name || 'Usta',
    };
    setUserNotifications((prev) => [notif, ...prev]);

    // Talepte bulunan kullanıcıya teklif bildirimi (Özel Bildirim)
    sendAndroidAppNotification({
      title: `💼 Ustanızdan Teklif Geldi! (${offerData.price})`,
      body: `${offerData.customerName || 'Sayın Mahalle Sakini'}, ${userProfile?.name || 'Usta'} teklif iletti: "${offerData.message || 'Teklif sunuldu.'}". İnceleyin.`,
      type: 'kullanici_teklif',
      channelId: 'kullanici_teklif',
      actionTab: 'tekliflerim',
      badgeText: 'YENİ TEKLİF',
      relatedId: offerData.requestId,
      timestamp: Date.now(),
    });
  };

  return (
    <div className="min-h-screen bg-neutral-200/90 text-neutral-800 flex flex-col items-center justify-start antialiased py-0 sm:py-4">
      {/* Senkron / yetki hata şeridi */}
      {syncError && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] max-w-[92vw] bg-rose-600 text-white text-[12px] font-bold px-4 py-2.5 rounded-2xl shadow-xl">
          {syncError}
        </div>
      )}
      {/* Top Preview Bar for Desktop */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-md px-4 py-1.5 mb-2 bg-neutral-900 text-white rounded-xl shadow-md text-xs font-semibold">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-rose-400" />
          <span>Mutlular Plus • Mobil Görünüm</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-neutral-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Şehrin Dijital Merkezi</span>
        </div>
      </div>

      {/* Main App Container */}
      <div className="w-full max-w-md bg-neutral-100 min-h-screen sm:min-h-[920px] sm:rounded-[36px] sm:shadow-2xl sm:border-[6px] sm:border-neutral-900 overflow-hidden flex flex-col relative transition-all duration-300">
        {/* Android Native Heads-Up Push Notification Banner */}
        <AndroidHeadsUpNotification
          onNavigateTab={(tab, subTab) => {
            if (tab === 'muhtar_paneli' || tab === 'muhtarlik') {
              setMuhtarlikInitialTab('basvurular');
              setIsMuhtarlikOpen(true);
            } else if (tab === 'canli_yayin') {
              setIsLiveStreamOpen(true);
            } else if (tab === 'vefat') {
              setIsVefatOpen(true);
            } else if (tab === 'tekliflerim') {
              setCurrentTab('profil');
              setProfileSubTab('tekliflerim');
            } else if (tab === 'hizmet') {
              setCurrentTab('hizmet');
            } else if (tab === 'haber' || tab === 'haberler') {
              setCurrentTab('haber');
            } else if (tab === 'alim_satim' || tab === 'alim-satim') {
              setCurrentTab('alim-satim');
            } else {
              setCurrentTab(tab as NavTab);
              if (subTab && (subTab === 'tekliflerim' || subTab === 'bildirimler' || subTab === 'profil')) {
                setProfileSubTab(subTab);
              }
            }
          }}
        />

        {/* Mobile App Header */}
        <Header
          currentTab={currentTab}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenProfile={() => setCurrentTab('profil')}
          onOpenMenu={() => setIsMenuOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenMuhtar={() => {
            setMuhtarlikInitialTab(currentRole === 'muhtar' ? 'basvurular' : 'iletisim');
            setIsMuhtarlikOpen(true);
          }}
          pendingMuhtarApplicationsCount={pendingMuhtarApplicationsCount}
          onGoHome={() => {
            setCurrentTab('anasayfa');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          isLoggedIn={isLoggedIn}
          userProfile={userProfile}
          unreadNotificationCount={unreadNotificationCount}
          onOpenExportCode={() => setIsExportCodeOpen(true)}
        />

        {/* Dynamic Screen Content */}
        <main className="flex-1 pb-24 overflow-y-auto">
          {currentTab === 'anasayfa' && (
            <div className="space-y-3.5 pb-6">
              {/* 1. Haber Vitrini (Görsel Ön Planda, Yazı Görseli Kapatmaz, Mutlular Plus Renkleri) */}
              <HaberVitrini
                newsList={newsList}
                onSelectNews={(news) => setSelectedNews(news)}
                onOpenBusinessRegister={() => setIsBusinessRegisterOpen(true)}
                onOpenLiveSupport={() => setIsLiveSupportOpen(true)}
                userProfile={userProfile}
                onOpenEsnafPaneli={() => setIsEsnafPaneliOpen(true)}
              />

              {/* 2. Arama Kutucuğu (Play Store & App Store kaldırılıp buraya taşındı) */}
              <HomepageSearchBar onSearch={handleOpenSearchWithQuery} />

              {/* 3. Category Tabs & Story Avatars */}
              <StoryCategories
                stories={storiesList}
                onSelectStory={(_s: StoryItem, index: number) => {
                  setSelectedStoryIndex(index);
                  setIsStoryViewerOpen(true);
                }}
                onOpenStoryShare={() => {
                  setStorySharePrefill(null);
                  setIsEsnafStoryShareOpen(true);
                }}
                onNavigateCanliTv={() => setIsLiveStreamOpen(true)}
                onNavigateCampus={() => setIsLiveStreamOpen(true)}
                onNavigateAll={() => {
                  setSelectedStoryIndex(0);
                  setIsStoryViewerOpen(true);
                }}
              />

              {/* 4. Popüler Hizmetler Grid */}
              <PopularServices
                services={POPULAR_SERVICES}
                onSelectService={handleSelectService}
                onViewAll={() => setIsSearchOpen(true)}
              />

              {/* 5. Promotional Car Classified Banner */}
              <PromoCarBanner
                onExploreCars={() => setCurrentTab('alim-satim')}
              />

              {/* 6. Mutlular Canlı TV (YouTube Canlı Yayın) Card */}
              <CampusCard
                onOpenCampus={() => setIsLiveStreamOpen(true)}
                onOpenCanliTv={() => setIsLiveStreamOpen(true)}
              />

              {/* 7. Kuponlar Section */}
              <CouponsSection onOpenCoupons={() => setIsCampaignOpen(true)} />

              {/* 8. Şehir Hizmetleri (E-Belediye, 112 Acil, Namaz, Bursakart, ASM, Muhtarlık) */}
              <CityServices
                onOpenBelediye={handleOpenBelediye}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
                onOpenPrayers={() => setIsPrayersOpen(true)}
                onOpenMuhtar={() => {
                  setMuhtarlikInitialTab(currentRole === 'muhtar' ? 'basvurular' : 'iletisim');
                  setIsMuhtarlikOpen(true);
                }}
                onOpenBus={() => setIsBusOpen(true)}
                onOpenSaglikOcagi={() => setIsSaglikOcagiOpen(true)}
                onOpenKesintiler={() => setIsKesintilerOpen(true)}
              />

              {/* 10. Resmi & Kurumsal (Mehmet Akif Mahalle Muhtarlığı İletişim Modülü) */}
              <OfficialSection
                onOpenMuhtar={() => {
                  setMuhtarlikInitialTab(currentRole === 'muhtar' ? 'basvurular' : 'iletisim');
                  setIsMuhtarlikOpen(true);
                }}
                onSelectItem={(title) => {
                  if (title === 'Etkinlikler') {
                    setIsDavetOpen(true);
                  } else if (title.includes('Muhtar')) {
                    setMuhtarlikInitialTab(currentRole === 'muhtar' ? 'basvurular' : 'iletisim');
                    setIsMuhtarlikOpen(true);
                  } else {
                    setGenericModalData({
                      isOpen: true,
                      title: `${title}`,
                      subtitle: 'Resmi Kurumlar & İletişim',
                      content: (
                        <p>
                          Bursa Osmangazi {title} bilgileri, çalışma saatleri ve resmi detaylarına kolayca ulaşın.
                        </p>
                      ),
                    });
                  }
                }}
                onViewAll={() => setIsSearchOpen(true)}
              />

              {/* 12. Hava Durumu Widget */}
              <WeatherWidget
                onShowFullForecast={() => {
                  setGenericModalData({
                    isOpen: true,
                    title: 'Mutlular 7 Günlük Hava Tahmini',
                    subtitle: 'Meteoroloji Genel Müdürlüğü Verileri',
                    content: (
                      <div className="space-y-2 text-[12px]">
                        <p>Hafta boyunca Mutlular ve çevresinde parçalı bulutlu ve ılık sonbahar havası beklenmektedir.</p>
                        <div className="p-2 bg-neutral-50 rounded-lg">Cuma: 25° / 8° Açık</div>
                        <div className="p-2 bg-neutral-50 rounded-lg">Cumartesi: 26° / 12° Güneşli</div>
                        <div className="p-2 bg-neutral-50 rounded-lg">Pazar: 23° / 11° Parçalı Bulutlu</div>
                      </div>
                    ),
                  });
                }}
              />

              {/* 13. Haberler & Kayıplar */}
              <NewsSection
                news={newsList}
                obituaries={obituaryList.filter((o) => o.status === 'approved')}
                onOpenNewsDetail={(n) => setSelectedNews(n)}
                onOpenAllNews={() => setSelectedNews(newsList[0])}
                onOpenVefat={() => setIsVefatOpen(true)}
              />

              {/* 14. Öne Çıkan İlanlar (Uno & Daire) */}
              <FeaturedClassifieds
                ads={classifiedList}
                onSelectAd={(ad) => setSelectedAd(ad)}
                onViewAll={() => setCurrentTab('alim-satim')}
              />

              {/* 15. İş Dünyası */}
              <JobsSection
                jobs={jobList}
                onApplyJob={handleApplyJob}
                onViewAll={() => setIsJobsModalOpen(true)}
                onOpenCreateJob={() => setIsJobsModalOpen(true)}
              />

              {/* 16. Esnaf & Mağazalar (Yemek, Giyim, Şarküteri vb.) */}
              <FoodSection
                restaurants={restaurantsList}
                title="Esnaf & Mağazalar"
                defaultMode={esnafSectionDefaultMode}
                userProfile={userProfile}
                onOpenEsnafPaneli={() => setIsEsnafPaneliOpen(true)}
                onOpenQrScanner={() => setIsQrScannerOpen(true)}
                onOrderRestaurant={(r, tableNo, mode) => {
                  setSelectedRestaurant(r);
                  if (tableNo) setSelectedTableForModal(tableNo);
                  if (mode) setSelectedModeForStoreModal(mode);
                }}
                onOpenParaPuan={() => setIsCreditOpen(true)}
                onOpenBusinessRegister={() => setIsBusinessRegisterOpen(true)}
                onViewAll={() => setCurrentTab('yemek')}
              />
            </div>
          )}

          {/* Haber Tab (Haber Vitrini & Haberler) */}
          {currentTab === 'haber' && (
            <HaberScreen
              newsList={newsList}
              obituaryList={obituaryList.filter((o) => o.status === 'approved')}
              onSelectNews={(news) => setSelectedNews(news)}
              onOpenNewsTip={() => setIsNewsTipOpen(true)}
            />
          )}

          {/* Alım Satım Tab (Exact Screenshot Layout) */}
          {currentTab === 'alim-satim' && (
            <AlimSatimScreen
              items={classifiedList}
              onSelectItem={(item) => setSelectedAd(item)}
              onOpenCreateAd={() => setIsMarketListingOpen(true)}
            />
          )}

          {/* MP Central Hub Tab */}
          {currentTab === 'mp-hub' && (
            <div className="p-4 space-y-4">
              <div className="text-center py-4 bg-gradient-to-b from-neutral-900 to-rose-950 text-white rounded-3xl shadow-lg p-5">
                <div className="w-14 h-14 rounded-2xl bg-white text-neutral-900 mx-auto flex items-center justify-center font-black text-2xl shadow-md mb-2">
                  <span>M</span>
                  <span className="text-rose-600">P</span>
                </div>
                <h2 className="text-lg font-black tracking-tight">MUTLULAR PLUS HUB</h2>
                <p className="text-[11px] text-white/80 font-medium mt-1">
                  Şehrin Tüm Dijital Servisleri Tek Bir Merkezde
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsQuoteWizardOpen(true)}
                  className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-xs text-left hover:border-amber-400 transition"
                >
                  <span className="text-xl">🛠️</span>
                  <div className="font-extrabold text-[13px] text-neutral-900 mt-1">Hizmet İste</div>
                  <div className="text-[10px] text-neutral-500">Usta bul & teklif al</div>
                </button>

                <button
                  onClick={() => setIsMarketListingOpen(true)}
                  className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-xs text-left hover:border-emerald-400 transition"
                >
                  <span className="text-xl">🛍️</span>
                  <div className="font-extrabold text-[13px] text-neutral-900 mt-1">İlan Ver</div>
                  <div className="text-[10px] text-neutral-500">Pazar, oto ve emlak vitrini</div>
                </button>

                <button
                  onClick={() => setIsEmergencyOpen(true)}
                  className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-xs text-left hover:border-rose-400 transition"
                >
                  <span className="text-xl">🚨</span>
                  <div className="font-extrabold text-[13px] text-neutral-900 mt-1">112 Acil</div>
                  <div className="text-[10px] text-neutral-500">Hızlı acil çağrı</div>
                </button>

                <button
                  onClick={() => setIsCreditOpen(true)}
                  className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-xs text-left hover:border-rose-400 transition"
                >
                  <span className="text-xl">🎁</span>
                  <div className="font-extrabold text-[13px] text-neutral-900 mt-1">Para Puan</div>
                  <div className="text-[10px] text-neutral-500">Bakiye & harcama</div>
                </button>

                <button
                  onClick={() => setIsBusOpen(true)}
                  className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-xs text-left hover:border-blue-400 transition"
                >
                  <span className="text-xl">🚌</span>
                  <div className="font-extrabold text-[13px] text-neutral-900 mt-1">Otobüs Saatleri</div>
                  <div className="text-[10px] text-neutral-500">Şehir içi seferler</div>
                </button>

                <button
                  onClick={() => setIsBusinessRegisterOpen(true)}
                  className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-xs text-left hover:border-amber-400 transition"
                >
                  <span className="text-xl">🏪</span>
                  <div className="font-extrabold text-[13px] text-neutral-900 mt-1">Esnaf Kayıt</div>
                  <div className="text-[10px] text-neutral-500">Dükkanını vitrine taşı</div>
                </button>

                <button
                  onClick={() => {
                    setVefatModalInitialTab('ilan-ver');
                    setIsVefatOpen(true);
                  }}
                  className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-xs text-left hover:border-neutral-900 transition group"
                >
                  <span className="text-xl">🕊️</span>
                  <div className="font-extrabold text-[13px] text-neutral-900 mt-1 group-hover:text-rose-600 transition">Vefat İlanı Ver</div>
                  <div className="text-[10px] text-neutral-500">Cenaze & taziye paylaş</div>
                </button>
              </div>
            </div>
          )}

          {/* Esnaf Tab */}
          {currentTab === 'yemek' && (
            <div className="p-3 space-y-3">
              <FoodSection
                restaurants={restaurantsList}
                title="Esnaf Vitrini & Çarşı"
                defaultMode={esnafSectionDefaultMode}
                userProfile={userProfile}
                onOpenEsnafPaneli={() => setIsEsnafPaneliOpen(true)}
                onOpenQrScanner={() => setIsQrScannerOpen(true)}
                onOrderRestaurant={(r, tableNo, mode) => {
                  setSelectedRestaurant(r);
                  if (tableNo) setSelectedTableForModal(tableNo);
                  if (mode) setSelectedModeForStoreModal(mode);
                }}
                onOpenParaPuan={() => setIsCreditOpen(true)}
                onOpenBusinessRegister={() => setIsBusinessRegisterOpen(true)}
              />
            </div>
          )}

          {/* Hizmet Tab (Hizmet Faaliyetleri & Teklif Sistemi) */}
          {currentTab === 'hizmet' && (
            <HizmetScreen
              onOpenQuoteWizard={() => {
                setQuotePrefill(null);
                setIsQuoteWizardOpen(true);
              }}
              onOpenQuoteWithService={(cat, subCat) => {
                setQuotePrefill({ category: cat, subCategory: subCat });
                setIsQuoteWizardOpen(true);
              }}
              onOpenLiveSupport={() => setIsLiveSupportOpen(true)}
            />
          )}

          {/* Profil Tab: Mutlular Plus Profil & Vasıf Merkezi */}
          {currentTab === 'profil' && (
            <div className="p-3 sm:p-4 space-y-3 pb-24">
              {/* Top Navigation Bar: Back to Home */}
              <div className="flex items-center justify-between pb-0.5">
                <button
                  onClick={() => {
                    setCurrentTab('anasayfa');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-700 hover:text-rose-600 active:scale-95 transition bg-white px-3 py-1.5 rounded-xl border border-neutral-200/90 shadow-2xs group"
                >
                  <Home className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
                  <span>← Anasayfaya Dön</span>
                </button>
                <span className="text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider">
                  Kullanıcı & Vasıf Alanı
                </span>
              </div>

              {/* Profile Segmented Sub-Tab Header */}
              <div className="bg-neutral-200/80 p-1 rounded-2xl flex items-center gap-1">
                <button
                  onClick={() => setProfileSubTab('profil')}
                  className={`flex-1 py-2 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 min-w-0 ${
                    profileSubTab === 'profil'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Profil</span>
                </button>

                <button
                  onClick={() => setProfileSubTab('tekliflerim')}
                  className={`flex-1 py-2 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 min-w-0 ${
                    profileSubTab === 'tekliflerim'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">Tekliflerim</span>
                  {userQuotes.some((q) => q.status === 'teklif-geldi') && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  )}
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded-full shrink-0">
                    {userQuotes.length}
                  </span>
                </button>

                <button
                  onClick={() => setProfileSubTab('bildirimler')}
                  className={`flex-1 py-2 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 min-w-0 relative ${
                    profileSubTab === 'bildirimler'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <div className="relative shrink-0">
                    <Bell className={`w-3.5 h-3.5 ${unreadNotificationCount > 0 ? 'text-rose-600' : 'text-neutral-600'}`} />
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-600 animate-pulse ring-2 ring-white" />
                    )}
                  </div>
                  <span className="truncate">Bildirimler</span>
                  {unreadNotificationCount > 0 && (
                    <span className="text-[9.5px] bg-rose-600 text-white font-extrabold px-1.5 py-0.2 rounded-full animate-pulse shadow-xs shrink-0">
                      {unreadNotificationCount}
                    </span>
                  )}
                </button>
              </div>

              {profileSubTab === 'bildirimler' ? (
                <BildirimMerkeziView
                  notifications={userNotifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onDeleteNotification={handleDeleteNotification}
                  onClearAll={handleClearAllNotifications}
                  onAddTestNotification={handleAddTestNotification}
                  onNavigateToQuotes={(relatedId) => {
                    setProfileSubTab('tekliflerim');
                  }}
                  onNavigateToClassifieds={() => {
                    setCurrentTab('alim-satim');
                  }}
                  onNavigateTab={(tab, subTab) => {
                    if (tab === 'muhtar_paneli' || tab === 'muhtarlik') {
                      setMuhtarlikInitialTab('basvurular');
                      setIsMuhtarlikOpen(true);
                    } else if (tab === 'canli_yayin') {
                      setIsLiveStreamOpen(true);
                    } else if (tab === 'vefat') {
                      setIsVefatOpen(true);
                    } else if (tab === 'tekliflerim') {
                      setCurrentTab('profil');
                      setProfileSubTab('tekliflerim');
                    } else if (tab === 'hizmet') {
                      setCurrentTab('hizmet');
                    } else if (tab === 'haber' || tab === 'haberler') {
                      setCurrentTab('haber');
                    } else if (tab === 'alim_satim' || tab === 'alim-satim') {
                      setCurrentTab('alim-satim');
                    } else {
                      setCurrentTab(tab as NavTab);
                      if (subTab && (subTab === 'tekliflerim' || subTab === 'bildirimler' || subTab === 'profil')) {
                        setProfileSubTab(subTab);
                      }
                    }
                  }}
                />
              ) : profileSubTab === 'tekliflerim' ? (
                <TekliflerimView
                  quotes={userQuotes}
                  onOpenCreateQuote={() => {
                    setQuotePrefill(null);
                    setIsQuoteWizardOpen(true);
                  }}
                  onAcceptOffer={handleAcceptOffer}
                  onCancelRequest={handleCancelQuoteRequest}
                />
              ) : (
                <>
                  {/* 1. Profile User Card */}
              <div className="bg-white rounded-3xl p-4 border border-neutral-200/90 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-neutral-900 to-rose-700 text-white flex items-center justify-center font-black text-xl shadow-md overflow-hidden">
                        {userProfile?.avatar && isLoggedIn ? (
                          <img
                            src={userProfile.avatar}
                            alt={userProfile.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{userName ? userName.charAt(0).toUpperCase() : 'M'}</span>
                        )}
                      </div>
                      {isLoggedIn && userProfile && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-neutral-200 flex items-center justify-center shadow-2xs">
                          {userProfile.loginMethod === 'google' ? (
                            <svg className="w-3 h-3" viewBox="0 0 24 24">
                              <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              />
                              <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              />
                              <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                              />
                              <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                              />
                            </svg>
                          ) : (
                            <PhoneCall className="w-2.5 h-2.5 text-rose-600" />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-black text-[15px] text-neutral-900 leading-tight truncate">
                        {isLoggedIn && userProfile ? userProfile.name : 'Misafir Kullanıcı'}
                      </h3>
                      <div className="text-[11px] text-neutral-500 font-medium truncate mt-0.5">
                        {isLoggedIn && userProfile
                          ? userProfile.email || userProfile.phone || 'Giriş yapıldı'
                          : 'Giriş yapılmadı'}
                      </div>
                      {/* Active Vasıf Pill */}
                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider flex items-center gap-1 ${
                            ROLE_CONFIGS[currentRole]?.badgeBg
                          } ${ROLE_CONFIGS[currentRole]?.badgeText} ${
                            ROLE_CONFIGS[currentRole]?.badgeBorder
                          }`}
                        >
                          <span>{ROLE_CONFIGS[currentRole]?.icon}</span>
                          <span>{ROLE_CONFIGS[currentRole]?.title}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {!isLoggedIn || !userProfile ? (
                    <button
                      onClick={() => setIsLoginOpen(true)}
                      className="bg-rose-600 text-white text-[12px] font-bold px-3.5 py-2 rounded-xl shadow-xs hover:bg-rose-700 active:scale-95 transition"
                    >
                      Giriş Yap
                    </button>
                  ) : (
                    <button
                      onClick={handleLogout}
                      className="text-neutral-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition flex items-center gap-1 text-[11px] font-bold"
                      title="Çıkış Yap"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Çıkış</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Aktif Hesap Rolü & Vasıf Bilgisi (Hesap hangi rol ile açıldı ise o aktif gözükür) */}
              <div className="bg-white rounded-3xl border border-neutral-200/90 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <div className="text-[11px] font-black text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-rose-600" />
                    <span>Tanımlı Hesap Rolü</span>
                  </div>
                  <span
                    className={`text-[9.5px] font-black px-2 py-0.5 rounded-md uppercase border ${
                      ROLE_CONFIGS[currentRole]?.badgeBg
                    } ${ROLE_CONFIGS[currentRole]?.badgeText} ${
                      ROLE_CONFIGS[currentRole]?.badgeBorder
                    }`}
                  >
                    Aktif
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-900 text-white flex items-start gap-3 shadow-sm">
                  <span className="text-2xl mt-0.5 shrink-0">{ROLE_CONFIGS[currentRole]?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-[13px] font-black text-white truncate">
                        {ROLE_CONFIGS[currentRole]?.title}
                      </h4>
                      <span className="text-[10px] text-emerald-400 font-bold shrink-0 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Aktif
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-300 font-medium mt-0.5">
                      {ROLE_CONFIGS[currentRole]?.desc}
                    </p>
                    <div className="mt-2 text-[10px] text-neutral-400 border-t border-neutral-800 pt-1.5 flex items-center justify-between">
                      <span>
                        {isLoggedIn
                          ? 'Hesap kayıtlı vasfınızla aktif durumdadır.'
                          : 'Giriş yaptığınızda hesap rolünüz otomatik yüklenir.'}
                      </span>
                      <button
                        onClick={() => setIsLoginOpen(true)}
                        className="text-rose-400 hover:text-rose-300 font-bold text-[10.5px] flex items-center gap-0.5 ml-2"
                      >
                        <span>Hesap Değiştir</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Aktif Vasıf Yetkileri & Özel Aksiyon Paneli */}
              <div className="bg-white rounded-3xl border border-neutral-200/90 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {ROLE_CONFIGS[currentRole]?.icon}
                    </span>
                    <div>
                      <h4 className="text-[13px] font-black text-neutral-900 leading-tight">
                        {ROLE_CONFIGS[currentRole]?.title} Yetkileri
                      </h4>
                      <p className="text-[10px] text-neutral-500 font-medium">
                        Bu vasıf ile kullanabileceğiniz özellikler
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[9.5px] font-black px-2 py-0.5 rounded-md uppercase border ${
                      ROLE_CONFIGS[currentRole]?.badgeBg
                    } ${ROLE_CONFIGS[currentRole]?.badgeText} ${
                      ROLE_CONFIGS[currentRole]?.badgeBorder
                    }`}
                  >
                    Aktif
                  </span>
                </div>

                {/* Permissions List */}
                <div className="grid grid-cols-2 gap-1.5">
                  {ROLE_CONFIGS[currentRole]?.permissions.map((perm, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 p-2 rounded-xl bg-neutral-50 text-[11px] font-bold text-neutral-800"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{perm}</span>
                    </div>
                  ))}
                </div>

                {/* Role Specific Fast Action Buttons */}
                <div className="pt-1 space-y-1.5">
                  {currentRole === 'mahalle-sakini' && (
                    <div className="space-y-2">
                      <button
                        onClick={() => setIsMahalleSakiniPaneliOpen(true)}
                        className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-neutral-900 text-white font-extrabold text-[12px] text-left transition flex items-center justify-between shadow-sm border border-emerald-500/40 hover:scale-[1.01] active:scale-98"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                            <Home className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[12px] font-black text-white flex items-center gap-1.5">
                              <span>Mahalle Sakini Dijital Yönetim Masası</span>
                              <span className="bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded uppercase">
                                TAM EKRAN
                              </span>
                            </div>
                            <div className="text-[10px] text-emerald-200/90 font-normal">
                              Muhtarlık taleplerim, usta tekliflerim, pazar ilanlarım ve mahalle rehberim
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-emerald-400" />
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setIsMahalleSakiniPaneliOpen(true)}
                          className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-[11px] text-left transition flex items-center justify-between border border-emerald-200"
                        >
                          <span>Taleplerimi & İlanlarımı Yönet</span>
                          <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
                        </button>
                        <button
                          onClick={() => setIsMarketListingOpen(true)}
                          className="p-2.5 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 font-bold text-[11px] text-left transition flex items-center justify-between border border-blue-200"
                        >
                          <span>Pazar İlanı Ver</span>
                          <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                      </div>
                    </div>
                  )}

                  {currentRole === 'esnaf' && (
                    <div className="space-y-2">
                      <button
                        onClick={() => setIsEsnafPaneliOpen(true)}
                        className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-950 via-neutral-900 to-amber-900 text-white font-extrabold text-[12px] text-left transition flex items-center justify-between shadow-sm border border-amber-500/40 hover:scale-[1.01] active:scale-98"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black">
                            <Store className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[12px] font-black text-white flex items-center gap-1.5">
                              <span>Mağaza & Vitrin Yönetim Paneli</span>
                              <span className="bg-amber-500 text-neutral-950 text-[8px] font-black px-1.5 py-0.2 rounded uppercase">
                                ESNAF
                              </span>
                            </div>
                            <div className="text-[10px] text-amber-200/90 font-normal">
                              Vitrin ürünleri, kampanyalar ve dükkan vitrini ekleyin
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-amber-400" />
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setIsCampaignOpen(true)}
                          className="p-2.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold text-[11px] text-left transition flex items-center justify-between"
                        >
                          <span>Kupon & İndirimler</span>
                          <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                        </button>
                        <button
                          onClick={() => setIsEsnafPaneliOpen(true)}
                          className="p-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] text-left transition flex items-center justify-between"
                        >
                          <span>Vitrin Ürünü Ekle</span>
                          <ChevronRight className="w-3.5 h-3.5 text-rose-600" />
                        </button>
                      </div>
                    </div>
                  )}

                  {currentRole === 'usta' && (
                    <div className="space-y-2">
                      <button
                        onClick={() => setIsUstaPaneliOpen(true)}
                        className="w-full p-3 rounded-2xl bg-gradient-to-r from-blue-950 via-neutral-900 to-blue-900 text-white font-extrabold text-[12px] text-left transition flex items-center justify-between shadow-sm border border-blue-500/40 hover:scale-[1.01] active:scale-98"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                            <Wrench className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[12px] font-black text-white flex items-center gap-1.5">
                              <span>Usta Yönetim Paneli</span>
                              <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded uppercase">
                                USTA
                              </span>
                            </div>
                            <div className="text-[10px] text-blue-200/90 font-normal">
                              Verdiğim teklifler ({userProfile?.activities?.length || 'Çoklu'} Faaliyet) ve açık talepler
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-blue-400" />
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setIsUstaPaneliOpen(true)}
                          className="p-2.5 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 font-bold text-[11px] text-left transition flex items-center justify-between"
                        >
                          <span>Verdiğim Teklifler</span>
                          <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => setIsUstaPaneliOpen(true)}
                          className="p-2.5 rounded-xl bg-indigo-50 text-indigo-800 hover:bg-indigo-100 font-bold text-[11px] text-left transition flex items-center justify-between"
                        >
                          <span>Faaliyet Alanlarım</span>
                          <ChevronRight className="w-3.5 h-3.5 text-indigo-600" />
                        </button>
                      </div>
                    </div>
                  )}

                  {currentRole === 'editor' && (
                    <div className="space-y-2">
                      <button
                        onClick={() => setIsEditorPanelOpen(true)}
                        className="w-full p-3 rounded-2xl bg-gradient-to-r from-purple-950 via-neutral-900 to-purple-900 text-white font-extrabold text-[12px] text-left transition flex items-center justify-between shadow-sm border border-purple-500/40 hover:scale-[1.01] active:scale-98"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[12px] font-black text-white flex items-center gap-1.5">
                              <span>Editör Denetim & Onay Masası</span>
                              <span className="bg-purple-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded uppercase">
                                YARDIMCI
                              </span>
                            </div>
                            <div className="text-[10px] text-purple-200/90 font-normal">
                              Yönetici tarafından atanan onaylama ve denetim görevleri
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-purple-400" />
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setIsEditorPanelOpen(true)}
                          className="p-2.5 rounded-xl bg-purple-50 text-purple-800 hover:bg-purple-100 font-bold text-[11px] text-left transition flex items-center justify-between"
                        >
                          <span>Bekleyen İlan & Esnaf</span>
                          <ChevronRight className="w-3.5 h-3.5 text-purple-600" />
                        </button>
                        <button
                          onClick={() => setIsLiveStreamOpen(true)}
                          className="p-2.5 rounded-xl bg-red-50 text-red-800 hover:bg-red-100 font-bold text-[11px] text-left transition flex items-center justify-between"
                        >
                          <span>Canlı Yayın Başlat</span>
                          <ChevronRight className="w-3.5 h-3.5 text-red-600" />
                        </button>
                      </div>
                    </div>
                  )}

                  {currentRole === 'yonetici' && (
                    <div className="space-y-2">
                      <button
                        onClick={() => setIsAdminOpen(true)}
                        className="w-full p-3 rounded-2xl bg-gradient-to-r from-neutral-950 to-rose-950 text-white hover:from-neutral-900 hover:to-rose-900 font-extrabold text-[12px] text-left transition flex items-center justify-between shadow-sm border border-rose-500/30"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[12px] font-black text-white flex items-center gap-1.5">
                              <span>Denetim, Yönetim & Editör Atama Paneli</span>
                              <span className="bg-rose-600 text-[8px] font-black px-1.5 py-0.2 rounded uppercase">
                                SÜPER ADMİN
                              </span>
                            </div>
                            <div className="text-[10px] text-neutral-300 font-normal">
                              İlan onayı, esnaf onayı, editör atama ve moderasyon
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-rose-400" />
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setIsAdminOpen(true)}
                          className="p-2.5 rounded-xl bg-rose-50 text-rose-800 hover:bg-rose-100 font-bold text-[11px] text-left transition flex items-center justify-between border border-rose-200"
                        >
                          <span>İlanları Onayla</span>
                          <ChevronRight className="w-3.5 h-3.5 text-rose-600" />
                        </button>
                        <button
                          onClick={() => setIsAdminOpen(true)}
                          className="p-2.5 rounded-xl bg-purple-50 text-purple-800 hover:bg-purple-100 font-bold text-[11px] text-left transition flex items-center justify-between border border-purple-200"
                        >
                          <span>Haber Gir / Sil</span>
                          <ChevronRight className="w-3.5 h-3.5 text-purple-600" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setIsAdminOpen(true)}
                          className="p-2.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold text-[11px] text-left transition flex items-center justify-between border border-amber-200"
                        >
                          <span>Yorumları Denetle</span>
                          <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                        </button>
                        <button
                          onClick={() => setIsBusinessRegisterOpen(true)}
                          className="p-2.5 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 font-bold text-[11px] text-left transition flex items-center justify-between"
                        >
                          <span>Esnaf Başvuruları</span>
                          <ChevronRight className="w-3.5 h-3.5 text-white/70" />
                        </button>
                      </div>
                    </div>
                  )}

                  {currentRole === 'muhtar' && (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setMuhtarlikInitialTab('basvurular');
                          setIsMuhtarlikOpen(true);
                        }}
                        className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-red-950 via-neutral-900 to-rose-950 text-white font-extrabold text-[12px] text-left transition flex items-center justify-between shadow-sm border border-red-500/40 hover:scale-[1.01] active:scale-98"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                            🏛️
                          </div>
                          <div>
                            <div className="text-[12px] font-black text-white flex items-center gap-1.5">
                              <span>Mahalle Muhtarlığı Resmi Yönetim Masası</span>
                              <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded uppercase">
                                RESMİ YETKİLİ
                              </span>
                            </div>
                            <div className="text-[10px] text-red-200/90 font-normal">
                              Gelen mahalle sakinleri başvuruları, tebligatlar ve resmi duyuru masası
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {pendingMuhtarApplicationsCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse">
                              {pendingMuhtarApplicationsCount} Bekleyen
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-red-400" />
                        </div>
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setMuhtarlikInitialTab('basvurular');
                            setIsMuhtarlikOpen(true);
                          }}
                          className="p-2.5 rounded-xl bg-red-50 text-red-800 hover:bg-red-100 font-bold text-[11px] text-left transition flex items-center justify-between border border-red-200"
                        >
                          <span>Gelen Başvuruları İncele</span>
                          <ChevronRight className="w-3.5 h-3.5 text-red-600" />
                        </button>
                        <button
                          onClick={() => {
                            setMuhtarlikInitialTab('talep');
                            setIsMuhtarlikOpen(true);
                          }}
                          className="p-2.5 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 font-bold text-[11px] text-left transition flex items-center justify-between"
                        >
                          <span>Resmi Bildirim Gir</span>
                          <ChevronRight className="w-3.5 h-3.5 text-white/70" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Menu & Cüzdan List */}
              <div className="bg-white rounded-3xl border border-neutral-200/90 divide-y divide-neutral-100 overflow-hidden shadow-xs">
                <div
                  onClick={() => setIsCreditOpen(true)}
                  className="p-3.5 flex items-center justify-between hover:bg-neutral-50 cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-[13px] font-bold text-neutral-800">
                      Para Puan & Cüzdan
                    </span>
                  </div>
                  <span className="text-[12px] font-extrabold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                    45.00 ₺
                  </span>
                </div>

                <div
                  onClick={() => setIsCampaignOpen(true)}
                  className="p-3.5 flex items-center justify-between hover:bg-neutral-50 cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-rose-600" />
                    <span className="text-[13px] font-bold text-neutral-800">
                      Kuponlarım & Kampanyalar
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </div>

                <div
                  onClick={() => setIsMarketListingOpen(true)}
                  className="p-3.5 flex items-center justify-between hover:bg-neutral-50 cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5">
                    <PlusCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-[13px] font-bold text-neutral-800">
                      Yeni İlan Ekle (Pazar / Vasıta / Emlak)
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </div>

                <div
                  onClick={() => setIsLiveSupportOpen(true)}
                  className="p-3.5 flex items-center justify-between hover:bg-neutral-50 cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-[13px] font-bold text-neutral-800">
                      Canlı Destek & WhatsApp Hattı
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </div>

                {/* Tekliflerim Menu Item */}
                <div
                  onClick={() => setProfileSubTab('tekliflerim')}
                  className="p-3.5 flex items-center justify-between hover:bg-neutral-50 cursor-pointer transition bg-amber-50/40"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="text-[13px] font-bold text-neutral-800 block">
                        Teklif Taleplerim (Hizmetler)
                      </span>
                      <span className="text-[10px] text-amber-800 font-semibold block">
                        {userQuotes.filter((q) => q.status === 'teklif-geldi').length} yeni usta teklifi hazır
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10.5px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                      {userQuotes.length} Talep
                    </span>
                    <ChevronRight className="w-4 h-4 text-amber-700" />
                  </div>
                </div>

                {/* Bildirim Merkezi Menu Item */}
                <div
                  onClick={() => setProfileSubTab('bildirimler')}
                  className="p-3.5 flex items-center justify-between hover:bg-neutral-50 cursor-pointer transition bg-rose-50/40"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <Bell className="w-4 h-4 text-rose-600" />
                      {unreadNotificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-600 animate-pulse ring-2 ring-white" />
                      )}
                    </div>
                    <div>
                      <span className="text-[13px] font-bold text-neutral-800 block">
                        Bildirim Merkezi
                      </span>
                      <span className="text-[10px] text-rose-700 font-semibold block">
                        {unreadNotificationCount > 0
                          ? `${unreadNotificationCount} yeni okunmamış bildirim var`
                          : 'Tüm bildirimleriniz okundu'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {unreadNotificationCount > 0 ? (
                      <span className="text-[10.5px] font-extrabold text-white bg-rose-600 px-2 py-0.5 rounded-full animate-pulse shadow-xs">
                        {unreadNotificationCount} Yeni
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                        {userNotifications.length}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-rose-700" />
                  </div>
                </div>

                {/* Account Switcher Button */}
                <div
                  onClick={() => setIsLoginOpen(true)}
                  className="p-3.5 flex items-center justify-between hover:bg-neutral-50 cursor-pointer transition text-neutral-700"
                >
                  <div className="flex items-center gap-2.5">
                    <LogIn className="w-4 h-4 text-neutral-600" />
                    <span className="text-[13px] font-bold">
                      Farklı Hesapla Giriş Yap (Google / Telefon)
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </div>
              </div>
                </>
              )}
            </div>
          )}
        </main>
        {/* Floating Docked Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          onTabChange={(tab) => {
            if (tab === 'mp-hub') {
              // MP tuşu aynı anda anasayfaya yönlendirir ve Hızlı İşlemler menüsünü açar
              setCurrentTab('anasayfa');
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setIsQuickActionOpen(true);
            } else {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        />

        {/* --- ALL MODALS INTEGRATED FROM MUTLULAR-HABER-GUNCEL ZIP --- */}
        <SearchModal
          isOpen={isSearchOpen}
          initialQuery={searchInitialQuery}
          classifieds={classifiedList}
          jobs={jobList}
          onClose={() => {
            setIsSearchOpen(false);
            setSearchInitialQuery('');
          }}
          onSelectResult={(type, item) => {
            if (type === 'restaurant') setSelectedRestaurant(item);
            else if (type === 'classified') setSelectedAd(item);
            else if (type === 'job') handleApplyJob(item);
            else if (type === 'service') handleSelectService(item);
          }}
        />

        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onSuccessLogin={handleSuccessLogin}
          onNotifyAdminMerchant={(m) => {
            const notif: UserNotification = {
              id: `notif-merch-${Date.now()}`,
              type: 'sistem',
              title: `Esnaf Başvurusu Alındı: ${m.businessName}`,
              message: `${m.businessName} işletmeniz için esnaf kayıt talebiniz yönetim onayına gönderildi.`,
              date: 'Az önce',
              read: false,
              badgeText: 'Esnaf Kaydı',
              sender: 'Yönetim Onay Masası',
            };
            setUserNotifications((prev) => [notif, ...prev]);
          }}
        />

        <BusinessRegisterModal
          isOpen={isBusinessRegisterOpen}
          onClose={() => setIsBusinessRegisterOpen(false)}
          userProfile={userProfile}
          onRegisterBusiness={handleRegisterBusiness}
          onOpenEsnafPaneli={() => setIsEsnafPaneliOpen(true)}
          onNavigateToVitrin={() => setCurrentTab('yemek')}
          onOpenStorePreview={(storeName, mode) => {
            const found = restaurantsList.find(
              (r) => r.name.toLowerCase() === storeName.toLowerCase()
            );
            if (found) {
              setSelectedRestaurant(found);
              setSelectedTableForModal(1);
              setSelectedModeForStoreModal(mode);
            } else {
              setCurrentTab('yemek');
            }
          }}
        />

        <LiveSupportModal
          isOpen={isLiveSupportOpen}
          onClose={() => setIsLiveSupportOpen(false)}
        />

        <SideDrawer
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onGoHome={() => {
            setCurrentTab('anasayfa');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          currentTab={currentTab}
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenPharmacy={() => setIsPharmacyOpen(true)}
          onOpenPrayers={() => setIsPrayersOpen(true)}
          onOpenCampus={() => setIsLiveStreamOpen(true)}
          onOpenCoupons={() => setIsCampaignOpen(true)}
          onOpenBus={() => setIsBusOpen(true)}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
          onOpenNewsTip={() => setIsNewsTipOpen(true)}
          onOpenDavet={() => setIsDavetOpen(true)}
          onOpenKursu={() => setIsKursuOpen(true)}
          onOpenLostFound={() => setIsLostFoundOpen(true)}
          onOpenLiveStream={() => setIsLiveStreamOpen(true)}
          onOpenCredit={() => setIsCreditOpen(true)}
          onOpenQuoteWizard={() => setIsQuoteWizardOpen(true)}
          onOpenMarketListing={() => setIsMarketListingOpen(true)}
          onOpenBusinessRegister={() => setIsBusinessRegisterOpen(true)}
          onOpenVefat={() => setIsVefatOpen(true)}
          onOpenBelediye={handleOpenBelediye}
          onOpenSaglikOcagi={() => setIsSaglikOcagiOpen(true)}
          onOpenMuhtarlik={() => setIsMuhtarlikOpen(true)}
          onOpenJobs={() => setIsJobsModalOpen(true)}
          onOpenAlimSatim={() => setCurrentTab('alim-satim')}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenProfile={() => setCurrentTab('profil')}
          isLoggedIn={isLoggedIn}
          userName={userProfile?.name}
          userProfile={userProfile}
          unreadNotificationCount={unreadNotificationCount}
          onOpenExportCode={() => setIsExportCodeOpen(true)}
        />

        <PharmacyModal
          isOpen={isPharmacyOpen}
          onClose={() => setIsPharmacyOpen(false)}
          onOpenSaglikOcagi={() => {
            setIsPharmacyOpen(false);
            setIsSaglikOcagiOpen(true);
          }}
        />

        {/* Osmangazi & Mutlular Aile Sağlığı Merkezleri (Sağlık Ocakları) Modalı */}
        <SaglikOcagiModal
          isOpen={isSaglikOcagiOpen}
          onClose={() => setIsSaglikOcagiOpen(false)}
          onOpenPharmacy={() => {
            setIsSaglikOcagiOpen(false);
            setIsPharmacyOpen(true);
          }}
        />

        {/* Mehmet Akif Mahalle Muhtarlığı İletişim & Hizmet Modalı */}
        <MuhtarlikModal
          isOpen={isMuhtarlikOpen}
          onClose={() => setIsMuhtarlikOpen(false)}
          onOpenSaglikOcagi={() => {
            setIsMuhtarlikOpen(false);
            setIsSaglikOcagiOpen(true);
          }}
          userProfile={userProfile}
          initialTab={muhtarlikInitialTab}
          applications={muhtarlikApplications}
          onNewApplication={handleNewMuhtarlikApplication}
          onUpdateApplicationStatus={handleUpdateMuhtarlikApplicationStatus}
        />

        {/* BUSKİ & UEDAŞ Canlı Su ve Elektrik Kesintileri Modalı */}
        <KesintilerModal
          isOpen={isKesintilerOpen}
          onClose={() => setIsKesintilerOpen(false)}
        />

        <PrayerTimesModal
          isOpen={isPrayersOpen}
          onClose={() => setIsPrayersOpen(false)}
        />

        <StoreDetailModal
          business={selectedRestaurant}
          initialTableNo={selectedTableForModal}
          initialMode={selectedModeForStoreModal}
          onClose={() => {
            setSelectedRestaurant(null);
            setSelectedTableForModal(1);
          }}
        />

        <QrMenuScannerModal
          isOpen={isQrScannerOpen}
          onClose={() => setIsQrScannerOpen(false)}
          restaurants={restaurantsList}
          onSelectRestaurantAndTable={(restaurant, tableNo) => {
            setSelectedRestaurant(restaurant);
            setSelectedTableForModal(tableNo);
            setSelectedModeForStoreModal('qr_menu');
          }}
        />

        <ClassifiedDetailModal
          ad={selectedAd}
          onClose={() => setSelectedAd(null)}
        />

        <NewsTipModal
          isOpen={isNewsTipOpen}
          onClose={() => setIsNewsTipOpen(false)}
        />

        <DavetModal
          isOpen={isDavetOpen}
          onClose={() => setIsDavetOpen(false)}
        />

        <KursuModal
          isOpen={isKursuOpen}
          onClose={() => setIsKursuOpen(false)}
        />

        <LostFoundModal
          isOpen={isLostFoundOpen}
          onClose={() => setIsLostFoundOpen(false)}
        />

        <CampaignModal
          isOpen={isCampaignOpen}
          onClose={() => setIsCampaignOpen(false)}
        />

        <EmergencyModal
          isOpen={isEmergencyOpen}
          onClose={() => setIsEmergencyOpen(false)}
        />

        <LiveStreamModal
          isOpen={isLiveStreamOpen}
          onClose={() => setIsLiveStreamOpen(false)}
        />

        <CreditModal
          isOpen={isCreditOpen}
          onClose={() => setIsCreditOpen(false)}
        />

        <QuoteWizardModal
          isOpen={isQuoteWizardOpen}
          onClose={() => {
            setIsQuoteWizardOpen(false);
            setQuotePrefill(null);
          }}
          prefillCategory={quotePrefill?.category}
          prefillSubCategory={quotePrefill?.subCategory}
          onRequestCreated={handleNewQuoteCreated}
        />

        <HomeUlasimModal
          isOpen={isBusOpen}
          onClose={() => setIsBusOpen(false)}
        />

        <MarketListingModal
          isOpen={isMarketListingOpen}
          onClose={() => setIsMarketListingOpen(false)}
          onSuccessAdd={handleAddNewAd}
        />

        <NewsDetailView
          news={selectedNews}
          onClose={() => setSelectedNews(null)}
        />

        <VefatModal
          isOpen={isVefatOpen}
          onClose={() => setIsVefatOpen(false)}
          obituaries={obituaryList}
          onAddNewObituary={handleAddNewObituary}
          onApproveObituary={handleApproveObituary}
          onRejectObituary={handleRejectObituary}
          onDeleteObituary={handleDeleteObituary}
          userProfile={userProfile}
          isLoggedIn={isLoggedIn}
          onOpenLogin={() => setIsLoginOpen(true)}
          initialTab={vefatModalInitialTab}
        />

        {/* Bursa Osmangazi Belediyesi E-Belediye & Online İşlemler Modalı */}
        <EBelediyeModal
          isOpen={isEBelediyeOpen}
          onClose={() => setIsEBelediyeOpen(false)}
          userProfile={userProfile}
          onAddNotification={(notif) => setUserNotifications((prev) => [notif, ...prev])}
        />

        <QuickActionSheet
          isOpen={isQuickActionOpen}
          onClose={() => setIsQuickActionOpen(false)}
          onGoHome={() => {
            setIsQuickActionOpen(false);
            setCurrentTab('anasayfa');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
          onOpenQuoteWizard={() => setIsQuoteWizardOpen(true)}
          onOpenMarketListing={() => setIsMarketListingOpen(true)}
          onOpenNewsTip={() => setIsNewsTipOpen(true)}
          onOpenPharmacy={() => setIsPharmacyOpen(true)}
          onOpenBus={() => setIsBusOpen(true)}
          onOpenDavet={() => setIsDavetOpen(true)}
          onOpenKursu={() => setIsKursuOpen(true)}
          onOpenBusinessRegister={() => setIsBusinessRegisterOpen(true)}
          onOpenCredit={() => setIsCreditOpen(true)}
          onOpenLiveStream={() => setIsLiveStreamOpen(true)}
          onOpenCoupons={() => setIsCampaignOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenVefat={(tab) => {
            setVefatModalInitialTab(tab || 'vitrin');
            setIsVefatOpen(true);
          }}
          onOpenBelediye={handleOpenBelediye}
          onOpenSaglikOcagi={() => setIsSaglikOcagiOpen(true)}
          onOpenKesintiler={() => setIsKesintilerOpen(true)}
          onOpenQrMenu={() => {
            setIsQuickActionOpen(false);
            setEsnafSectionDefaultMode('qr_menu');
            setCurrentTab('yemek');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenMagazalar={() => {
            setIsQuickActionOpen(false);
            setEsnafSectionDefaultMode('magaza_vitrini');
            setCurrentTab('yemek');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenQrScanner={() => {
            setIsQuickActionOpen(false);
            setIsQrScannerOpen(true);
          }}
          userProfile={userProfile}
          onOpenExportCode={() => {
            setIsQuickActionOpen(false);
            setIsExportCodeOpen(true);
          }}
        />

        {/* Yönetici Denetim & Yönetim Paneli Modalı */}
        <AdminPanelModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          classifiedList={classifiedList}
          newsList={newsList}
          obituaryList={obituaryList}
          onApproveAd={handleAdminApproveAd}
          onDeleteAd={handleAdminDeleteAd}
          onUpdateAd={handleAdminUpdateAd}
          onAddNewNews={handleAdminAddNewNews}
          onUpdateNews={handleAdminUpdateNews}
          onDeleteNews={handleAdminDeleteNews}
          onBroadcastNotification={(notif) => setAnnouncements((prev) => [notif, ...prev])}
          onApproveObituary={handleApproveObituary}
          onRejectObituary={handleRejectObituary}
          onDeleteObituary={handleDeleteObituary}
          merchantsList={merchantsList}
          onApproveMerchant={handleApproveMerchant}
          onRejectMerchant={handleRejectMerchant}
        />

        {/* Esnaf Mağaza & Vitrin Yönetim Paneli */}
        <EsnafPaneliModal
          isOpen={isEsnafPaneliOpen}
          onClose={() => setIsEsnafPaneliOpen(false)}
          userProfile={userProfile}
          ownStore={ownStore}
          onSyncStoreCampaigns={handleSyncStoreCampaigns}
          onOpenStorePreview={(storeData) => {
            setSelectedRestaurant(storeData);
            setSelectedTableForModal(1);
            setSelectedModeForStoreModal(storeData.businessMode || 'qr_menu');
          }}
          onOpenStoryShare={(prefill) => {
            setStorySharePrefill(prefill || null);
            setIsEsnafStoryShareOpen(true);
          }}
          onSyncStoreProducts={handleSyncStoreProducts}
          onUpdateStoreDetails={handleUpdateStoreDetails}
          onOpenJobs={() => setIsJobsModalOpen(true)}
        />

        {/* Tam Ekran Esnaf Hikaye İzleyici (Video & Görsel) */}
        <StoryViewerModal
          isOpen={isStoryViewerOpen}
          stories={storiesList}
          initialStoryIndex={selectedStoryIndex}
          onClose={() => setIsStoryViewerOpen(false)}
          onOpenStore={(storeNameOrId) => {
            setIsStoryViewerOpen(false);
            const foundStore = restaurantsList.find(
              (r) =>
                r.id === storeNameOrId ||
                r.name.toLowerCase().includes(storeNameOrId.toLowerCase())
            );
            if (foundStore) {
              setSelectedRestaurant(foundStore);
              setSelectedTableForModal(1);
              setSelectedModeForStoreModal(foundStore.businessMode || 'qr_menu');
            } else {
              setCurrentTab('yemek');
            }
          }}
        />

        {/* Esnaf Hikayede Paylaş Modalı */}
        <EsnafStoryShareModal
          isOpen={isEsnafStoryShareOpen}
          onClose={() => setIsEsnafStoryShareOpen(false)}
          onPublishStory={handlePublishEsnafStory}
          merchantName={userProfile?.businessName || userProfile?.name || 'Kayıtlı İşletme'}
          merchantCategory={userProfile?.businessCategory || 'Esnaf & Mağaza'}
          merchantPhone={userProfile?.phone || ''}
          merchantAddress={userProfile?.businessAddress || 'Mehmet Akif Mahallesi Osmangazi Bursa'}
          initialCampaignTitle={storySharePrefill?.title}
          initialBadge={storySharePrefill?.badge}
        />

        {/* Usta Yönetim Paneli (Verdiğim Teklifler & Hizmet Havuzu) */}
        <UstaPaneliModal
          isOpen={isUstaPaneliOpen}
          onClose={() => setIsUstaPaneliOpen(false)}
          userProfile={userProfile}
          quoteRequests={quotesAll}
          onOpenJobs={() => setIsJobsModalOpen(true)}
          onUstaSubmitOffer={handleUstaSubmitOffer}
        />

        {/* Editör Denetim & Onay Masası (Yönetici Atamalı Yardımcı) */}
        <EditorPanelModal
          isOpen={isEditorPanelOpen}
          onClose={() => setIsEditorPanelOpen(false)}
          userProfile={userProfile}
          classifiedList={classifiedList}
          newsList={newsList}
          obituaryList={obituaryList}
          merchantsList={merchantsList}
          onApproveAd={handleAdminApproveAd}
          onDeleteAd={handleAdminDeleteAd}
          onApproveObituary={handleApproveObituary}
          onRejectObituary={handleRejectObituary}
          onDeleteObituary={handleDeleteObituary}
          onApproveMerchant={(merchant) => handleApproveMerchant(typeof merchant === 'string' ? merchant : merchant.id)}
          onRejectMerchant={handleRejectMerchant}
        />

        {/* İş Dünyası & Eleman İlanları Modalı */}
        <JobsModal
          isOpen={isJobsModalOpen}
          onClose={() => setIsJobsModalOpen(false)}
          jobs={jobList}
          onAddNewJob={handleAddNewJob}
          onApplyJob={handleApplyJobToSystem}
          userProfile={userProfile}
        />

        {/* Mahalle Sakini Kişisel Yönetim Masası Modalı (Tam Ekran) */}
        <MahalleSakiniPaneliModal
          isOpen={isMahalleSakiniPaneliOpen}
          onClose={() => setIsMahalleSakiniPaneliOpen(false)}
          userProfile={userProfile}
          userQuotes={userQuotes}
          classifiedList={classifiedList}
          muhtarApplications={muhtarlikApplications}
          onOpenQuoteWizard={() => setIsQuoteWizardOpen(true)}
          onOpenMarketListing={() => setIsMarketListingOpen(true)}
          onOpenMuhtarRequest={() => {
            setMuhtarlikInitialTab('talep');
            setIsMuhtarlikOpen(true);
          }}
          onOpenKursu={() => setIsKursuOpen(true)}
          onOpenPharmacy={() => setIsPharmacyOpen(true)}
          onOpenKesintiler={() => setIsKesintilerOpen(true)}
          onOpenBelediye={handleOpenBelediye}
        />

        <ExportCodeModal
          isOpen={isExportCodeOpen}
          onClose={() => setIsExportCodeOpen(false)}
        />

        <GenericInfoModal
          isOpen={genericModalData.isOpen}
          onClose={() =>
            setGenericModalData((prev) => ({ ...prev, isOpen: false }))
          }
          title={genericModalData.title}
          subtitle={genericModalData.subtitle}
          content={genericModalData.content}
        />
      </div>
    </div>
  );
}
