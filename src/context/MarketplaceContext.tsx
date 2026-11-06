import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  UserRole,
  CampusLocation,
  Category,
  Store,
  StoreCategory,
  Product,
  CartItem,
  Order,
  OrderStatus,
  Review,
  AppNotification,
  Banner,
  StoreInvitation,
  PlatformSettings,
  StoreSubscription,
  AuditLog,
} from '../types/database';
import {
  INITIAL_LOCATIONS,
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_STORES,
  INITIAL_STORE_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_BANNERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_INVITATIONS,
  INITIAL_PLATFORM_SETTINGS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/seedData';

interface ProductSalesMetric {
  product: Product;
  unitsSold: number;
  ordersCount: number;
}

interface MarketplaceContextType {
  // Auth & User State
  currentUser: User | null;
  users: User[];
  loginByEmail: (email: string) => { success: boolean; error?: string };
  merchantLogin: (data: { identifier: string; password: string; rememberMe?: boolean }) => {
    success: boolean;
    error?: string;
    storeId?: string;
    mustChangePassword?: boolean;
  };
  merchantChangePassword: (data: { oldPassword?: string; newPassword: string }) => {
    success: boolean;
    error?: string;
  };
  adminIssueMerchantCredentials: (storeId: string) => {
    success: boolean;
    error?: string;
    credentials?: {
      storeName: string;
      storeCode: string;
      username: string;
      tempPassword?: string;
      loginUrl: string;
    };
  };
  adminLogin: (data: { identifier: string; password: string }) => {
    success: boolean;
    error?: string;
  };
  merchantSelfUpdateStore: (data: {
    name_ar?: string;
    description_ar?: string;
    activity_type_ar?: string;
    location_inside_campus?: string;
    contact_phone?: string;
    email?: string;
    logo_url?: string;
    cover_url?: string;
    username?: string;
    store_code?: string;
    new_password?: string;
    visibility_status?: 'active' | 'pause_orders' | 'closed_temp' | 'hidden';
  }) => { success: boolean; error?: string };
  merchantReplyToReview: (reviewId: string, reply: string) => { success: boolean; error?: string };
  updateStoreVisibility: (status: 'active' | 'pause_orders' | 'closed_temp' | 'hidden') => void;
  switchQuickAccount: (userId: string) => void;
  registerCustomer: (data: {
    full_name: string;
    email: string;
    phone: string;
    faculty_location_id: string;
    student_id_number?: string;
  }) => { success: boolean; error?: string };
  registerMerchantByInvite: (data: {
    token?: string;
    full_name: string;
    email: string;
    phone: string;
    store_name_en: string;
    store_name_ar: string;
    activity_type_ar: string;
    description_ar: string;
    location_inside_campus: string;
    working_hours?: string;
    logo_url?: string;
    cover_url?: string;
    category_id?: string;
  }) => { success: boolean; error?: string };
  logout: () => void;
  updateUserProfile: (updates: Partial<User>) => void;

  // Global Header Store Search
  headerSearchQuery: string;
  setHeaderSearchQuery: (q: string) => void;

  // Campus Location & Pickup Selection
  locations: CampusLocation[];
  selectedLocationId: string;
  selectedPickupPoint: string;
  setSelectedLocationId: (id: string) => void;
  setSelectedPickupPoint: (point: string) => void;

  // Catalog & Stores
  categories: Category[];
  stores: Store[];
  storeCategories: StoreCategory[];
  products: Product[];
  banners: Banner[];
  reviews: Review[];
  favoritesProductIds: string[];
  favoritesStoreIds: string[];
  toggleFavoriteProduct: (productId: string) => void;
  toggleFavoriteStore: (storeId: string) => void;

  // Real Computed Analytics & Sales
  getPlatformMostOrderedProducts: () => ProductSalesMetric[];
  getStoreMostOrderedProducts: (storeId: string) => ProductSalesMetric[];
  getSpecialOfferProducts: () => Product[];
  getStoreRatingStats: (storeId: string) => { average: number; count: number };
  getProductDiscountPercent: (product: Product) => number | null;
  getStoreById: (storeId: string) => Store | undefined;

  // Cart & Multi-Store Checkout
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (
    product: Product,
    quantity: number,
    selectedOptions: Record<string, string>,
    selectedOptionIds: Record<string, string>
  ) => { success: boolean; message: string };
  updateCartItemQuantity: (cartItemId: string, newQuantity: number) => { success: boolean; message?: string };
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  placeOrdersFromCart: (params: {
    fulfillmentByStore: Record<string, 'pickup' | 'campus_delivery'>;
    notesByStore: Record<string, string>;
    campusLocationAr: string;
    pickupPointAr: string;
  }) => { success: boolean; createdOrders?: Order[]; error?: string };

  // Orders & Reviews
  orders: Order[];
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string, rejectionReason?: string) => {
    success: boolean;
    error?: string;
  };
  submitReview: (params: {
    orderId: string;
    storeId: string;
    productId?: string;
    rating: number;
    comment: string;
  }) => { success: boolean; error?: string };

  // Notifications
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (notifId: string) => void;
  markAllNotificationsAsRead: () => void;

  // Merchant Actions (Strictly isolated to currentUser.store_id)
  saveMerchantProduct: (productData: Partial<Product> & { id?: string }) => { success: boolean; error?: string };
  deleteMerchantProduct: (productId: string) => { success: boolean; error?: string };
  updateMerchantStoreInfo: (updates: Partial<Store>) => { success: boolean; error?: string };
  addMerchantStoreCategory: (name_ar: string) => { success: boolean; error?: string };

  // Admin Actions (Strictly gated by admin/super_admin role)
  platformSettings: PlatformSettings;
  invitations: StoreInvitation[];
  subscriptions: StoreSubscription[];
  auditLogs: AuditLog[];
  adminUpdatePlatformSettings: (updates: Partial<PlatformSettings>) => void;
  adminCreateStoreInvitation: (data: {
    invited_email: string;
    proposed_store_name: string;
    category_id: string;
  }) => StoreInvitation | null;
  adminCreateOrUpdateStore: (storeData: Partial<Store> & { id?: string }) => void;
  adminChangeStoreStatus: (storeId: string, status: Store['status']) => void;
  adminDeleteStore: (storeId: string) => void;
  adminToggleProductVisibility: (productId: string, is_active: boolean) => void;
  adminSaveCategory: (catData: Partial<Category> & { id?: string }) => void;
  adminDeleteCategory: (catId: string) => void;
  adminSaveBanner: (bannerData: Partial<Banner> & { id?: string }) => void;
  adminDeleteBanner: (bannerId: string) => void;
  adminToggleUserStatus: (userId: string, is_active: boolean, role?: UserRole) => void;
  adminModerateReview: (reviewId: string, is_approved: boolean) => void;
  adminPurgeDemoData: () => void;
  adminRestoreDemoData: () => void;

  // Global Toast message
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

const STORAGE_KEY = 'campus_market_db_v3_presto_clean';
export const LIBYAN_SPIDER_CLOUD_API = 'https://api.kurofangs.id.ly/campus-market';

// Permanently purge any old v1/v2 cached keys from browser localStorage
try {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (
      k &&
      k.startsWith('campus_market_db') &&
      !k.startsWith(STORAGE_KEY)
    ) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
} catch {
  // ignore
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(value));
  } catch {
    // ignore storage quota errors
  }
}

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('users', INITIAL_USERS));
  const [currentUserId, setCurrentUserId] = useState<string | null>(() =>
    loadFromStorage('currentUserId', null)
  );
  const [locations] = useState<CampusLocation[]>(() => loadFromStorage('locations', INITIAL_LOCATIONS));
  const [selectedLocationId, setSelectedLocationId] = useState<string>(() =>
    loadFromStorage('selectedLocationId', 'loc-main')
  );
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<string>(() =>
    loadFromStorage('selectedPickupPoint', 'الساحة الرئيسية أمام المكتبة')
  );

  const [categories, setCategories] = useState<Category[]>(() =>
    loadFromStorage('categories', INITIAL_CATEGORIES)
  );
  const [stores, setStores] = useState<Store[]>(() => loadFromStorage('stores', INITIAL_STORES));
  const [storeCategories, setStoreCategories] = useState<StoreCategory[]>(() =>
    loadFromStorage('storeCategories', INITIAL_STORE_CATEGORIES)
  );
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage('products', INITIAL_PRODUCTS));
  const [orders, setOrders] = useState<Order[]>(() => loadFromStorage('orders', INITIAL_ORDERS));
  const [reviews, setReviews] = useState<Review[]>(() => loadFromStorage('reviews', INITIAL_REVIEWS));
  const [banners, setBanners] = useState<Banner[]>(() => loadFromStorage('banners', INITIAL_BANNERS));
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadFromStorage('notifications', INITIAL_NOTIFICATIONS)
  );
  const [invitations, setInvitations] = useState<StoreInvitation[]>(() =>
    loadFromStorage('invitations', INITIAL_INVITATIONS)
  );
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() =>
    loadFromStorage('platformSettings', INITIAL_PLATFORM_SETTINGS)
  );
  const [subscriptions, setSubscriptions] = useState<StoreSubscription[]>(() =>
    loadFromStorage('subscriptions', INITIAL_SUBSCRIPTIONS)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    loadFromStorage('auditLogs', INITIAL_AUDIT_LOGS)
  );

  // Favorites & Cart mapped per userId (or 'guest' when not logged in)
  const [favoritesByUser, setFavoritesByUser] = useState<Record<string, { products: string[]; stores: string[] }>>(() =>
    loadFromStorage('favoritesByUser', {})
  );

  const [cartsByUser, setCartsByUser] = useState<Record<string, CartItem[]>>(() =>
    loadFromStorage<Record<string, CartItem[]>>('cartsByUser', {})
  );

  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [cloudBooted, setCloudBooted] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3200);
  };

  // 1. Initial Cloud Hydration from Libyan Spider PostgreSQL (`kuro_cloud`)
  useEffect(() => {
    let isMounted = true;
    async function hydrateFromLibyanSpider() {
      try {
        const res = await fetch(`${LIBYAN_SPIDER_CLOUD_API}/api/state`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error('Cloud fetch failed');
        const data = await res.json();
        if (!isMounted || !data.ok) return;

        if (data.ok) {
          if (Array.isArray(data.stores)) setStores(data.stores);
          if (Array.isArray(data.products)) setProducts(data.products);
          if (Array.isArray(data.orders)) setOrders(data.orders);
          if (Array.isArray(data.reviews)) setReviews(data.reviews);

          const cols = data.collections || {};
          if (Array.isArray(cols.users) && cols.users.length > 0) setUsers(cols.users);
          if (Array.isArray(cols.categories) && cols.categories.length > 0) setCategories(cols.categories);
          if (Array.isArray(cols.storeCategories)) setStoreCategories(cols.storeCategories);
          if (Array.isArray(cols.banners) && cols.banners.length > 0) setBanners(cols.banners);
          if (Array.isArray(cols.notifications)) setNotifications(cols.notifications);
          if (Array.isArray(cols.invitations)) setInvitations(cols.invitations);
          if (cols.platformSettings) setPlatformSettings(cols.platformSettings);
          if (Array.isArray(cols.subscriptions)) setSubscriptions(cols.subscriptions);
          if (Array.isArray(cols.auditLogs)) setAuditLogs(cols.auditLogs);
          if (cols.favoritesByUser) setFavoritesByUser(cols.favoritesByUser);
          if (cols.cartsByUser) setCartsByUser(cols.cartsByUser);
        }
      } catch {
        // Fallback silently to local cache if offline
      } finally {
        if (isMounted) setCloudBooted(true);
      }
    }
    hydrateFromLibyanSpider();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Real-time Cloud Sync to Libyan Spider PostgreSQL whenever state changes
  useEffect(() => {
    if (!cloudBooted) return;
    const timer = setTimeout(() => {
      fetch(`${LIBYAN_SPIDER_CLOUD_API}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stores,
          products,
          orders,
          reviews,
          collections: {
            users,
            categories,
            storeCategories,
            banners,
            notifications,
            invitations,
            platformSettings,
            subscriptions,
            auditLogs,
            favoritesByUser,
            cartsByUser,
          },
        }),
      }).catch(() => {});
    }, 350);
    return () => clearTimeout(timer);
  }, [
    cloudBooted,
    stores,
    products,
    orders,
    reviews,
    users,
    categories,
    storeCategories,
    banners,
    notifications,
    invitations,
    platformSettings,
    subscriptions,
    auditLogs,
    favoritesByUser,
    cartsByUser,
  ]);

  // Sync to localStorage
  useEffect(() => saveToStorage('users', users), [users]);
  useEffect(() => saveToStorage('currentUserId', currentUserId), [currentUserId]);
  useEffect(() => saveToStorage('selectedLocationId', selectedLocationId), [selectedLocationId]);
  useEffect(() => saveToStorage('selectedPickupPoint', selectedPickupPoint), [selectedPickupPoint]);
  useEffect(() => saveToStorage('categories', categories), [categories]);
  useEffect(() => saveToStorage('stores', stores), [stores]);
  useEffect(() => saveToStorage('storeCategories', storeCategories), [storeCategories]);
  useEffect(() => saveToStorage('products', products), [products]);
  useEffect(() => saveToStorage('orders', orders), [orders]);
  useEffect(() => saveToStorage('reviews', reviews), [reviews]);
  useEffect(() => saveToStorage('banners', banners), [banners]);
  useEffect(() => saveToStorage('notifications', notifications), [notifications]);
  useEffect(() => saveToStorage('invitations', invitations), [invitations]);
  useEffect(() => saveToStorage('platformSettings', platformSettings), [platformSettings]);
  useEffect(() => saveToStorage('subscriptions', subscriptions), [subscriptions]);
  useEffect(() => saveToStorage('auditLogs', auditLogs), [auditLogs]);
  useEffect(() => saveToStorage('favoritesByUser', favoritesByUser), [favoritesByUser]);
  useEffect(() => saveToStorage('cartsByUser', cartsByUser), [cartsByUser]);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId && u.is_active) || null,
    [users, currentUserId]
  );

  const logAudit = (action: string, entity_type: string, entity_id: string, details: string) => {
    if (!currentUser) return;
    const entry: AuditLog = {
      id: `aud-${Date.now()}`,
      actor_user_id: currentUser.id,
      actor_name_ar: currentUser.full_name,
      actor_role: currentUser.role,
      action,
      entity_type,
      entity_id,
      details,
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  // Auth methods
  const loginByEmail = (email: string) => {
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) return { success: false, error: 'الحساب غير موجود. تأكد من البريد الإلكتروني.' };
    if (!found.is_active) return { success: false, error: 'هذا الحساب معطل من قبل الإدارة.' };
    setCurrentUserId(found.id);
    showToast(`مرحباً بك مجدداً، ${found.full_name}`);
    return { success: true };
  };

  const switchQuickAccount = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found && found.is_active) {
      setCurrentUserId(found.id);
      showToast(`تم التبديل إلى حساب: ${found.full_name}`, 'info');
    }
  };

  const registerCustomer = (data: {
    full_name: string;
    email: string;
    phone: string;
    faculty_location_id: string;
    student_id_number?: string;
  }) => {
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'البريد الإلكتروني مسجل مسبقاً.' };
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: data.email.trim(),
      phone: data.phone.trim(),
      full_name: data.full_name.trim(),
      role: 'customer',
      faculty_location_id: data.faculty_location_id,
      student_id_number: data.student_id_number,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    showToast('تم إنشاء حسابك الطلابي بنجاح!');
    return { success: true };
  };

  const merchantLogin = (data: {
    identifier: string;
    password: string;
    rememberMe?: boolean;
  }) => {
    const cleanId = data.identifier.trim().toLowerCase();
    const cleanPass = data.password.trim();

    if (!cleanId) {
      return { success: false, error: 'يرجى إدخال اسم المستخدم أو رمز المتجر.' };
    }
    if (!cleanPass) {
      return { success: false, error: 'يرجى إدخال كلمة المرور.' };
    }

    // Match merchant by username, email, store_id, or store_code
    const targetUser = users.find((u) => {
      if (u.role !== 'merchant') return false;
      if (u.username && u.username.toLowerCase() === cleanId) return true;
      if (u.email.toLowerCase() === cleanId) return true;
      if (u.store_id && u.store_id.toLowerCase() === cleanId) return true;
      const st = stores.find((s) => s.id === u.store_id);
      if (st && st.store_code && st.store_code.toLowerCase() === cleanId) return true;
      return false;
    });

    if (!targetUser) {
      return {
        success: false,
        error: 'اسم المستخدم أو رمز المتجر غير موجود. يرجى التحقق من بيانات الدخول.',
      };
    }

    if (!targetUser.is_active) {
      return {
        success: false,
        error: 'تم تعطيل هذا الحساب من قبل الإدارة. يرجى مراجعة إدارة الكلية.',
      };
    }

    // Check password (fallback to 123456 if none set initially)
    const validPassword = targetUser.password || '123456';
    if (cleanPass !== validPassword) {
      return {
        success: false,
        error: 'كلمة المرور غير صحيحة، يرجى التأكد وإعادة المحاولة.',
      };
    }

    const store = stores.find((s) => s.id === targetUser.store_id);
    if (store && store.status === 'suspended') {
      return {
        success: false,
        error: 'تم تعليق حساب هذا المتجر من قبل الإدارة، يرجى مراجعة إدارة الكلية.',
      };
    }

    const nowIso = new Date().toISOString();
    setUsers((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, last_login_at: nowIso } : u))
    );
    setCurrentUserId(targetUser.id);

    if (data.rememberMe) {
      try {
        localStorage.setItem('cm_merchant_remember', targetUser.id);
      } catch {
        // ignore
      }
    }

    showToast(`مرحباً بك في متجرك، ${targetUser.full_name}`, 'success');
    return {
      success: true,
      storeId: targetUser.store_id,
      mustChangePassword: targetUser.must_change_password ?? false,
    };
  };

  const merchantChangePassword = (data: {
    oldPassword?: string;
    newPassword: string;
  }) => {
    if (!currentUser || currentUser.role !== 'merchant') {
      return { success: false, error: 'غير مصرح' };
    }
    if (!data.newPassword || data.newPassword.length < 6) {
      return {
        success: false,
        error: 'كلمة المرور الجديدة يجب أن تتكون من 6 خانات أو أكثر.',
      };
    }
    if (data.oldPassword && currentUser.password && data.oldPassword !== currentUser.password) {
      return { success: false, error: 'كلمة المرور الحالية غير صحيحة.' };
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? { ...u, password: data.newPassword, must_change_password: false }
          : u
      )
    );
    showToast('تم تحديث كلمة مرور متجرك بنجاح!', 'success');
    return { success: true };
  };

  const adminLogin = (data: { identifier: string; password: string }) => {
    const cleanId = data.identifier.trim().toLowerCase();
    const cleanPass = data.password.trim();

    if (!cleanId || !cleanPass) {
      return { success: false, error: 'يرجى إدخال اسم المستخدم وكلمة المرور' };
    }

    const foundAdmin = users.find(
      (u) =>
        (u.role === 'admin' || u.role === 'super_admin') &&
        (u.email.toLowerCase() === cleanId || (u.username && u.username.toLowerCase() === cleanId))
    );

    if (!foundAdmin) {
      return { success: false, error: 'بيانات الدخول غير صحيحة أو ليس لديك صلاحية إدارة المنصة.' };
    }

    if (!foundAdmin.is_active) {
      return { success: false, error: 'تم تعطيل حساب المشرف هذا.' };
    }

    const validPass = foundAdmin.password || 'admin123';
    if (cleanPass !== validPass) {
      return { success: false, error: 'كلمة المرور غير صحيحة.' };
    }

    setCurrentUserId(foundAdmin.id);
    logAudit('تسجيل دخول المشرف', 'user', foundAdmin.id, 'تم الدخول إلى لوحة الإدارة الرئيسية');
    showToast(`مرحباً بك في لوحة الإدارة، ${foundAdmin.full_name}`, 'success');
    return { success: true };
  };

  const merchantSelfUpdateStore = (data: {
    name_ar?: string;
    description_ar?: string;
    activity_type_ar?: string;
    location_inside_campus?: string;
    contact_phone?: string;
    email?: string;
    logo_url?: string;
    cover_url?: string;
    username?: string;
    store_code?: string;
    new_password?: string;
    visibility_status?: 'active' | 'pause_orders' | 'closed_temp' | 'hidden';
  }) => {
    if (!currentUser || currentUser.role !== 'merchant' || !currentUser.store_id) {
      return { success: false, error: 'غير مصرح' };
    }
    const storeId = currentUser.store_id;
    const store = stores.find((s) => s.id === storeId);
    if (!store) return { success: false, error: 'المتجر غير موجود' };

    // Validate username uniqueness if modified
    if (data.username && data.username.trim()) {
      const cleanU = data.username.trim().toLowerCase();
      const conflict = users.find(
        (u) => u.id !== currentUser.id && u.username && u.username.toLowerCase() === cleanU
      );
      if (conflict) {
        return {
          success: false,
          error: 'اسم المستخدم هذا مستخدم بالفعل من قبل متجر آخر. يرجى اختيار اسم مستخدم مختلف.',
        };
      }
    }

    // Validate store_code uniqueness if modified
    if (data.store_code && data.store_code.trim()) {
      const cleanCode = data.store_code.trim().toUpperCase();
      const conflictStore = stores.find(
        (s) => s.id !== storeId && s.store_code && s.store_code.toUpperCase() === cleanCode
      );
      if (conflictStore) {
        return {
          success: false,
          error: 'رمز المتجر هذا مسجل بالفعل لمتجر آخر. يرجى اختيار رمز متجر فريد.',
        };
      }
    }

    // Update store
    setStores((prev) =>
      prev.map((s) => {
        if (s.id !== storeId) return s;
        return {
          ...s,
          name_ar: data.name_ar !== undefined ? data.name_ar : s.name_ar,
          name_en: data.name_ar !== undefined ? data.name_ar : s.name_en,
          description_ar:
            data.description_ar !== undefined ? data.description_ar : s.description_ar,
          activity_type_ar:
            data.activity_type_ar !== undefined ? data.activity_type_ar : s.activity_type_ar,
          location_inside_campus:
            data.location_inside_campus !== undefined
              ? data.location_inside_campus
              : s.location_inside_campus,
          contact_phone:
            data.contact_phone !== undefined ? data.contact_phone : s.contact_phone,
          logo_url: data.logo_url !== undefined ? data.logo_url : s.logo_url,
          cover_url: data.cover_url !== undefined ? data.cover_url : s.cover_url,
          store_code:
            data.store_code !== undefined ? data.store_code.trim().toUpperCase() : s.store_code,
          visibility_status:
            data.visibility_status !== undefined
              ? data.visibility_status
              : s.visibility_status,
        };
      })
    );

    // Update merchant user
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUser.id) return u;
        return {
          ...u,
          username:
            data.username !== undefined ? data.username.trim().toLowerCase() : u.username,
          email: data.email !== undefined ? data.email.trim() : u.email,
          phone:
            data.contact_phone !== undefined ? data.contact_phone.trim() : u.phone,
          password: data.new_password ? data.new_password : u.password,
          must_change_password: false,
        };
      })
    );

    logAudit(
      'تعديل ذاتي لبيانات المتجر',
      'store',
      storeId,
      `قام التاجر ${currentUser.full_name} بتحديث بيانات متجره`
    );
    showToast('تم حفظ وتحديث جميع بيانات متجرك بنجاح!', 'success');
    return { success: true };
  };

  const merchantReplyToReview = (reviewId: string, reply: string) => {
    if (!currentUser || currentUser.role !== 'merchant' || !currentUser.store_id) {
      return { success: false, error: 'غير مصرح' };
    }
    const storeId = currentUser.store_id;
    const rev = reviews.find((r) => r.id === reviewId);
    if (!rev || rev.store_id !== storeId) {
      return { success: false, error: 'لا يمكنك الرد على تقييم لمتجر آخر' };
    }

    const nowIso = new Date().toISOString();
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, merchant_reply: reply.trim(), merchant_replied_at: nowIso }
          : r
      )
    );
    showToast('تم نشر رد المتجر على التقييم بنجاح', 'success');
    return { success: true };
  };

  const updateStoreVisibility = (
    status: 'active' | 'pause_orders' | 'closed_temp' | 'hidden'
  ) => {
    if (!currentUser || currentUser.role !== 'merchant' || !currentUser.store_id) return;
    const storeId = currentUser.store_id;
    setStores((prev) =>
      prev.map((s) => (s.id === storeId ? { ...s, visibility_status: status } : s))
    );
    showToast('تم تحديث حالة ظهور المتجر', 'info');
  };

  const registerMerchantByInvite = (data: {
    token?: string;
    full_name: string;
    email: string;
    phone: string;
    store_name_en: string;
    store_name_ar: string;
    activity_type_ar: string;
    description_ar: string;
    location_inside_campus: string;
    working_hours?: string;
    logo_url?: string;
    cover_url?: string;
    category_id?: string;
  }) => {
    const cleanToken = (data.token || '').trim().toUpperCase();
    let matchedInv: StoreInvitation | undefined;

    if (cleanToken) {
      matchedInv = invitations.find(
        (i) => i.token.toUpperCase() === cleanToken && !i.is_used
      );
      if (!matchedInv) {
        return { success: false, error: 'رمز الدعوة غير صالح أو تم استخدامه مسبقاً.' };
      }
      if (new Date(matchedInv.expires_at) < new Date()) {
        return { success: false, error: 'انتهت صلاحية رمز الدعوة هذا.' };
      }
    }

    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'البريد الإلكتروني مسجل مسبقاً.' };
    }

    const newStoreId = `store-${Date.now()}`;
    const newUserId = `user-merch-${Date.now()}`;
    const storeCode = `STR-${Math.floor(1000 + Math.random() * 9000)}`;

    const rawSlug = (data.store_name_en || data.store_name_ar || `store_${Date.now()}`)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 16);
    const generatedUsername = `${rawSlug || 'store'}_${Math.floor(100 + Math.random() * 900)}`;
    const generatedPassword = `CM@${Math.floor(1000 + Math.random() * 9000)}`;

    // Requirement 7: Even if token exists, new stores start as pending until admin approves
    const storeStatus: Store['status'] = 'pending';

    const newStore: Store = {
      id: newStoreId,
      store_code: storeCode,
      owner_id: newUserId,
      name_en: (data.store_name_en || data.store_name_ar).trim(),
      name_ar: (data.store_name_ar || data.store_name_en).trim(),
      slug: (data.store_name_en || data.store_name_ar || `store-${Date.now()}`)
        .toLowerCase()
        .replace(/\s+/g, '-'),
      activity_type_ar: data.activity_type_ar.trim(),
      description_ar: data.description_ar.trim(),
      category_id: matchedInv?.category_id || data.category_id || 'cat-services',
      logo_url: (data.logo_url || '').trim(),
      cover_url: (data.cover_url || '').trim(),
      icon_bg_color: '#087E83',
      icon_type: 'sparkles',
      location_inside_campus: data.location_inside_campus.trim() || 'داخل الكلية',
      working_hours: undefined,
      is_open: true,
      supports_pickup: true,
      supports_delivery: true,
      delivery_fee_lyd: 3,
      contact_phone: data.phone.trim(),
      status: storeStatus,
      is_demo: false,
      views_count: 0,
      created_at: new Date().toISOString(),
    };

    const newMerchant: User = {
      id: newUserId,
      email: data.email.trim(),
      phone: data.phone.trim(),
      full_name: data.full_name.trim(),
      role: 'merchant',
      faculty_location_id: 'loc-main',
      store_id: newStoreId,
      username: generatedUsername,
      password: generatedPassword,
      must_change_password: true,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setStores((prev) => [...prev, newStore]);
    setUsers((prev) => [...prev, newMerchant]);
    if (matchedInv) {
      setInvitations((prev) =>
        prev.map((i) =>
          i.id === matchedInv!.id ? { ...i, is_used: true, used_by_user_id: newUserId } : i
        )
      );
    }
    setCurrentUserId(newUserId);
    showToast(
      'تم إرسال طلب إنشاء متجرك بنجاح! المتجر قيد المراجعة وسيظهر في المنصة فور اعتماده من الإدارة.',
      'success'
    );
    return { success: true };
  };

  const logout = () => {
    setCurrentUserId(null);
    showToast('تم تسجيل الخروج بنجاح', 'info');
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? { ...u, ...updates } : u)));
    showToast('تم حفظ بيانات الحساب بنجاح');
  };

  // Favorites
  const favoritesProductIds = useMemo(() => {
    if (!currentUser) return [];
    return favoritesByUser[currentUser.id]?.products || [];
  }, [currentUser, favoritesByUser]);

  const favoritesStoreIds = useMemo(() => {
    if (!currentUser) return [];
    return favoritesByUser[currentUser.id]?.stores || [];
  }, [currentUser, favoritesByUser]);

  const toggleFavoriteProduct = (productId: string) => {
    if (!currentUser) {
      showToast('يرجى تسجيل الدخول لحفظ المفضلة', 'error');
      return;
    }
    setFavoritesByUser((prev) => {
      const current = prev[currentUser.id] || { products: [], stores: [] };
      const exists = current.products.includes(productId);
      const nextProducts = exists
        ? current.products.filter((id) => id !== productId)
        : [...current.products, productId];
      showToast(exists ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة إلى المفضلة ❤️', 'info');
      return {
        ...prev,
        [currentUser.id]: { ...current, products: nextProducts },
      };
    });
  };

  const toggleFavoriteStore = (storeId: string) => {
    if (!currentUser) {
      showToast('يرجى تسجيل الدخول لحفظ المتجر في المفضلة', 'error');
      return;
    }
    setFavoritesByUser((prev) => {
      const current = prev[currentUser.id] || { products: [], stores: [] };
      const exists = current.stores.includes(storeId);
      const nextStores = exists
        ? current.stores.filter((id) => id !== storeId)
        : [...current.stores, storeId];
      showToast(exists ? 'تمت إزالة المتجر من المفضلة' : 'تم حفظ المتجر في المفضلة ❤️', 'info');
      return {
        ...prev,
        [currentUser.id]: { ...current, stores: nextStores },
      };
    });
  };

  const getStoreById = (storeId: string) => stores.find((s) => s.id === storeId);

  const getProductDiscountPercent = (product: Product): number | null => {
    if (product.old_price_lyd && product.old_price_lyd > product.price_lyd && product.old_price_lyd > 0) {
      return Math.round(((product.old_price_lyd - product.price_lyd) / product.old_price_lyd) * 100);
    }
    return null;
  };

  // =========================================================================
  // REAL SALES ANALYTICS ENGINE FOR "المنتجات الأكثر طلباً"
  // Strictly computed from completed orders, excluding cancelled/rejected,
  // excluding inactive/unavailable/out-of-stock products, and strictly scoped
  // per store when inside Store Details Page!
  // =========================================================================
  const getPlatformMostOrderedProducts = (): ProductSalesMetric[] => {
    const activeStoreIds = new Set(stores.filter((s) => s.status === 'active').map((s) => s.id));
    const completedOrders = orders.filter((o) => o.status === 'completed');

    const salesMap = new Map<string, { units: number; ordersCount: number }>();

    for (const ord of completedOrders) {
      if (!activeStoreIds.has(ord.store_id)) continue;
      for (const item of ord.items) {
        const current = salesMap.get(item.product_id) || { units: 0, ordersCount: 0 };
        salesMap.set(item.product_id, {
          units: current.units + item.quantity,
          ordersCount: current.ordersCount + 1,
        });
      }
    }

    const result: ProductSalesMetric[] = [];
    for (const [productId, stats] of salesMap.entries()) {
      const prod = products.find((p) => p.id === productId);
      if (
        prod &&
        prod.is_active &&
        prod.is_available_for_sale &&
        prod.stock_quantity > 0 &&
        activeStoreIds.has(prod.store_id)
      ) {
        result.push({
          product: prod,
          unitsSold: stats.units,
          ordersCount: stats.ordersCount,
        });
      }
    }

    return result.sort((a, b) => b.unitsSold - a.unitsSold || b.ordersCount - a.ordersCount);
  };

  const getStoreMostOrderedProducts = (storeId: string): ProductSalesMetric[] => {
    const store = stores.find((s) => s.id === storeId);
    if (!store || store.status !== 'active') return [];

    // Filter strictly to completed orders belonging to THIS storeId ONLY
    const storeCompletedOrders = orders.filter(
      (o) => o.store_id === storeId && o.status === 'completed'
    );

    const salesMap = new Map<string, { units: number; ordersCount: number }>();

    for (const ord of storeCompletedOrders) {
      for (const item of ord.items) {
        const current = salesMap.get(item.product_id) || { units: 0, ordersCount: 0 };
        salesMap.set(item.product_id, {
          units: current.units + item.quantity,
          ordersCount: current.ordersCount + 1,
        });
      }
    }

    const result: ProductSalesMetric[] = [];
    for (const [productId, stats] of salesMap.entries()) {
      const prod = products.find((p) => p.id === productId && p.store_id === storeId);
      if (prod && prod.is_active && prod.is_available_for_sale && prod.stock_quantity > 0) {
        result.push({
          product: prod,
          unitsSold: stats.units,
          ordersCount: stats.ordersCount,
        });
      }
    }

    return result.sort((a, b) => b.unitsSold - a.unitsSold || b.ordersCount - a.ordersCount);
  };

  const getSpecialOfferProducts = (): Product[] => {
    const activeStoreIds = new Set(stores.filter((s) => s.status === 'active').map((s) => s.id));
    return products.filter(
      (p) =>
        p.is_active &&
        p.is_available_for_sale &&
        p.stock_quantity > 0 &&
        activeStoreIds.has(p.store_id) &&
        p.old_price_lyd !== undefined &&
        p.old_price_lyd > p.price_lyd
    );
  };

  const getStoreRatingStats = (storeId: string) => {
    const approvedReviews = reviews.filter((r) => r.store_id === storeId && r.is_approved);
    if (approvedReviews.length === 0) {
      return { average: 0, count: 0 };
    }
    const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = Math.round((sum / approvedReviews.length) * 10) / 10;
    return { average: avg, count: approvedReviews.length };
  };

  // =========================================================================
  // SHOPPING CART & MULTI-STORE CHECKOUT ENGINE
  // =========================================================================
  const cartItems = useMemo(() => {
    if (!currentUser) return [];
    return cartsByUser[currentUser.id] || [];
  }, [currentUser, cartsByUser]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const addToCart = (
    product: Product,
    quantity: number,
    selectedOptions: Record<string, string>,
    selectedOptionIds: Record<string, string>
  ) => {
    if (!currentUser) {
      showToast('يرجى تسجيل الدخول لإضافة المنتجات إلى السلة', 'error');
      return { success: false, message: 'يرجى تسجيل الدخول أولاً' };
    }

    if (!product.is_active || !product.is_available_for_sale || product.stock_quantity <= 0) {
      showToast('عذراً، هذا المنتج غير متوفر حالياً', 'error');
      return { success: false, message: 'المنتج غير متوفر' };
    }

    // Check option-specific stock if variants exist
    for (const group of product.variant_groups) {
      const chosenOptId = selectedOptionIds[group.id];
      if (chosenOptId) {
        const opt = group.options.find((o) => o.id === chosenOptId);
        if (!opt || opt.stock_quantity < quantity) {
          showToast(`الكمية المطلوبة من الخيار (${opt?.label_ar || ''}) تتجاوز المخزون المتاح`, 'error');
          return { success: false, message: 'الكمية تتجاوز مخزون الخيار المحدد' };
        }
      }
    }

    const userCart = cartsByUser[currentUser.id] || [];
    const optionsKey = JSON.stringify(selectedOptionIds);
    const existingItem = userCart.find(
      (i) => i.product_id === product.id && JSON.stringify(i.selected_option_ids) === optionsKey
    );

    const newTotalQty = (existingItem ? existingItem.quantity : 0) + quantity;
    if (newTotalQty > product.stock_quantity) {
      showToast(`لا يمكن تجاوز الكمية المتوفرة في المخزون (${product.stock_quantity})`, 'error');
      return { success: false, message: 'الكمية تتجاوز المخزون' };
    }

    setCartsByUser((prev) => {
      const list = prev[currentUser.id] || [];
      if (existingItem) {
        return {
          ...prev,
          [currentUser.id]: list.map((item) =>
            item.id === existingItem.id ? { ...item, quantity: newTotalQty } : item
          ),
        };
      }
      const newItem: CartItem = {
        id: `ci-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        user_id: currentUser.id,
        product_id: product.id,
        store_id: product.store_id,
        quantity,
        selected_options: selectedOptions,
        selected_option_ids: selectedOptionIds,
      };
      return {
        ...prev,
        [currentUser.id]: [...list, newItem],
      };
    });

    showToast(`تمت إضافة "${product.name_ar}" إلى السلة 🛒`);
    return { success: true, message: 'تمت الإضافة بنجاح' };
  };

  const updateCartItemQuantity = (cartItemId: string, newQuantity: number) => {
    if (!currentUser) return { success: false };
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return { success: true };
    }

    const item = cartItems.find((i) => i.id === cartItemId);
    if (!item) return { success: false };

    const product = products.find((p) => p.id === item.product_id);
    if (!product) return { success: false };

    if (newQuantity > product.stock_quantity) {
      showToast(`الحد الأقصى المتوفر في المخزون هو ${product.stock_quantity}`, 'error');
      return { success: false, message: 'تجاوز المخزون' };
    }

    setCartsByUser((prev) => ({
      ...prev,
      [currentUser.id]: (prev[currentUser.id] || []).map((ci) =>
        ci.id === cartItemId ? { ...ci, quantity: newQuantity } : ci
      ),
    }));
    return { success: true };
  };

  const removeFromCart = (cartItemId: string) => {
    if (!currentUser) return;
    setCartsByUser((prev) => ({
      ...prev,
      [currentUser.id]: (prev[currentUser.id] || []).filter((ci) => ci.id !== cartItemId),
    }));
    showToast('تم حذف المنتج من السلة', 'info');
  };

  const clearCart = () => {
    if (!currentUser) return;
    setCartsByUser((prev) => ({ ...prev, [currentUser.id]: [] }));
  };

  // Multi-store checkout with real-time price & inventory re-verification
  const placeOrdersFromCart = (params: {
    fulfillmentByStore: Record<string, 'pickup' | 'campus_delivery'>;
    notesByStore: Record<string, string>;
    campusLocationAr: string;
    pickupPointAr: string;
  }) => {
    if (!currentUser) {
      return { success: false, error: 'يرجى تسجيل الدخول لإتمام الطلب.' };
    }
    if (cartItems.length === 0) {
      return { success: false, error: 'السلة فارغة.' };
    }

    // 1. Re-verify all items against live product & store state
    for (const ci of cartItems) {
      const prod = products.find((p) => p.id === ci.product_id);
      const store = stores.find((s) => s.id === ci.store_id);
      if (!prod || !prod.is_active || !prod.is_available_for_sale) {
        return {
          success: false,
          error: `المنتج "${prod?.name_ar || 'غير معروف'}" لم يعد متاحاً للبيع.`,
        };
      }
      if (!store || store.status !== 'active') {
        return {
          success: false,
          error: `المتجر "${store?.name_en || ''}" غير متاح لاستقبال الطلبات حالياً.`,
        };
      }
      if (ci.quantity > prod.stock_quantity) {
        return {
          success: false,
          error: `الكمية المطلوبة من "${prod.name_ar}" (${ci.quantity}) تتجاوز المتوفر حالياً (${prod.stock_quantity}).`,
        };
      }
    }

    // 2. Group items by store_id so each store gets an independent order
    const itemsByStore = new Map<string, CartItem[]>();
    for (const ci of cartItems) {
      const list = itemsByStore.get(ci.store_id) || [];
      list.push(ci);
      itemsByStore.set(ci.store_id, list);
    }

    const createdOrders: Order[] = [];
    const newNotifications: AppNotification[] = [];
    const stockDeductions = new Map<string, number>();

    for (const [storeId, storeCartItems] of itemsByStore.entries()) {
      const store = stores.find((s) => s.id === storeId)!;
      const fulfillment = params.fulfillmentByStore[storeId] || 'pickup';
      const deliveryFee = fulfillment === 'campus_delivery' ? store.delivery_fee_lyd : 0;

      let subtotal = 0;
      let discountTotal = 0;

      const orderItemsSnapshots = storeCartItems.map((ci) => {
        const prod = products.find((p) => p.id === ci.product_id)!;
        // Calculate variant modifier if any
        let modifier = 0;
        for (const vg of prod.variant_groups) {
          const optId = ci.selected_option_ids[vg.id];
          const opt = vg.options.find((o) => o.id === optId);
          if (opt) modifier += opt.price_modifier_lyd;
        }

        const unitPrice = prod.price_lyd + modifier;
        const oldUnitPrice = prod.old_price_lyd ? prod.old_price_lyd + modifier : undefined;
        const lineTotal = unitPrice * ci.quantity;
        subtotal += lineTotal;
        if (oldUnitPrice && oldUnitPrice > unitPrice) {
          discountTotal += (oldUnitPrice - unitPrice) * ci.quantity;
        }

        stockDeductions.set(prod.id, (stockDeductions.get(prod.id) || 0) + ci.quantity);

        return {
          id: `oi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          product_id: prod.id,
          product_name_snapshot: prod.name_ar,
          product_image_snapshot: prod.images[0],
          unit_price_snapshot_lyd: unitPrice,
          old_price_snapshot_lyd: oldUnitPrice,
          selected_options_snapshot: ci.selected_options,
          quantity: ci.quantity,
          line_total_lyd: lineTotal,
        };
      });

      const commissionRate =
        platformSettings.revenue_model === 'subscription'
          ? 0
          : platformSettings.commission_rate_percent;
      const commissionAmount = Math.round(((subtotal * commissionRate) / 100) * 100) / 100;
      const totalLyd = subtotal + deliveryFee;

      const orderNumber = `CM-${Math.floor(1000 + Math.random() * 9000)}`;
      const nowIso = new Date().toISOString();

      const newOrder: Order = {
        id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        order_number: orderNumber,
        customer_id: currentUser.id,
        customer_name_ar: currentUser.full_name,
        customer_phone: currentUser.phone,
        store_id: store.id,
        store_name_snapshot: store.name_en,
        status: 'pending_review',
        fulfillment_method: fulfillment,
        campus_location_ar: params.campusLocationAr,
        pickup_point_ar: params.pickupPointAr,
        customer_note: params.notesByStore[storeId] || undefined,
        items: orderItemsSnapshots,
        subtotal_lyd: subtotal,
        discount_total_lyd: discountTotal,
        delivery_fee_lyd: deliveryFee,
        platform_commission_lyd: commissionAmount,
        total_lyd: totalLyd,
        status_history: [
          {
            id: `sh-${Date.now()}`,
            status: 'pending_review',
            actor_user_id: currentUser.id,
            actor_role: currentUser.role,
            actor_name_ar: currentUser.full_name,
            note: 'تم تأكيد الطلب وإرساله للمتجر للمراجعة',
            created_at: nowIso,
          },
        ],
        is_demo: false,
        created_at: nowIso,
        updated_at: nowIso,
      };

      createdOrders.push(newOrder);

      // Customer Notification
      newNotifications.push({
        id: `notif-cust-${Date.now()}-${store.id}`,
        user_id: currentUser.id,
        title_ar: `تم استلام طلبك #${orderNumber} ✅`,
        message_ar: `تم إرسال طلبك إلى متجر ${store.name_en} بقيمة ${totalLyd} د.ل وهو الآن قيد المراجعة.`,
        type: 'order_update',
        related_order_id: newOrder.id,
        is_read: false,
        created_at: nowIso,
      });

      // Merchant Notification
      newNotifications.push({
        id: `notif-merch-${Date.now()}-${store.id}`,
        user_id: store.owner_id,
        title_ar: `طلب جديد #${orderNumber} 🔔`,
        message_ar: `وصلك طلب جديد من ${currentUser.full_name} بقيمة ${totalLyd} د.ل (${
          fulfillment === 'campus_delivery' ? 'توصيل داخل الكلية' : 'استلام من المتجر'
        }).`,
        type: 'merchant_order',
        related_order_id: newOrder.id,
        is_read: false,
        created_at: nowIso,
      });
    }

    // 3. Deduct inventory atomically
    setProducts((prev) =>
      prev.map((p) => {
        const deduct = stockDeductions.get(p.id);
        if (!deduct) return p;
        const nextStock = Math.max(0, p.stock_quantity - deduct);
        return {
          ...p,
          stock_quantity: nextStock,
          is_available_for_sale: nextStock > 0 ? p.is_available_for_sale : false,
        };
      })
    );

    // 4. Save orders, notifications, and clear cart
    setOrders((prev) => [...createdOrders, ...prev]);
    setNotifications((prev) => [...newNotifications, ...prev]);
    clearCart();
    showToast(`تم تأكيد طلبك بنجاح! (${createdOrders.map((o) => o.order_number).join(', ')})`);

    return { success: true, createdOrders };
  };

  // =========================================================================
  // ORDER STATUS LIFECYCLE & INVENTORY RESTORATION ON CANCEL/REJECT
  // =========================================================================
  const updateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    rejectionReason?: string
  ) => {
    if (!currentUser) return { success: false, error: 'غير مصرح' };

    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return { success: false, error: 'الطلب غير موجود' };

    // Permission check:
    // Customer can only cancel their own pending_review order
    if (currentUser.role === 'customer') {
      if (targetOrder.customer_id !== currentUser.id || newStatus !== 'cancelled') {
        return { success: false, error: 'لا تملك صلاحية تغيير حالة هذا الطلب.' };
      }
      if (targetOrder.status !== 'pending_review') {
        return { success: false, error: 'لا يمكن إلغاء الطلب بعد بدء تجهيزه.' };
      }
    }

    // Merchant can only update orders belonging to their own store
    if (currentUser.role === 'merchant') {
      if (targetOrder.store_id !== currentUser.store_id) {
        return { success: false, error: 'لا يمكنك تعديل طلبات متجر آخر!' };
      }
    }

    const nowIso = new Date().toISOString();
    const statusLabelsAr: Record<OrderStatus, string> = {
      pending_review: 'قيد المراجعة',
      accepted: 'مقبول',
      preparing: 'قيد التجهيز',
      ready_for_pickup: 'جاهز للاستلام',
      out_for_delivery: 'خرج للتوصيل',
      completed: 'مكتمل',
      rejected: 'مرفوض',
      cancelled: 'ملغي',
    };

    // Restore stock if transitioning to rejected or cancelled from a non-cancelled/rejected state
    if (
      (newStatus === 'rejected' || newStatus === 'cancelled') &&
      targetOrder.status !== 'rejected' &&
      targetOrder.status !== 'cancelled'
    ) {
      setProducts((prev) =>
        prev.map((p) => {
          const itemInOrder = targetOrder.items.find((i) => i.product_id === p.id);
          if (!itemInOrder) return p;
          return {
            ...p,
            stock_quantity: p.stock_quantity + itemInOrder.quantity,
            is_available_for_sale: true,
          };
        })
      );
    }

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: newStatus,
          rejection_reason: rejectionReason || o.rejection_reason,
          updated_at: nowIso,
          status_history: [
            ...o.status_history,
            {
              id: `sh-${Date.now()}`,
              status: newStatus,
              actor_user_id: currentUser.id,
              actor_role: currentUser.role,
              actor_name_ar: currentUser.full_name,
              note:
                rejectionReason ||
                note ||
                `تم تغيير حالة الطلب إلى: ${statusLabelsAr[newStatus]}`,
              created_at: nowIso,
            },
          ],
        };
      })
    );

    // Send notification to customer
    setNotifications((prev) => [
      {
        id: `notif-status-${Date.now()}`,
        user_id: targetOrder.customer_id,
        title_ar: `تحديث حالة الطلب #${targetOrder.order_number}`,
        message_ar: `أصبح طلبك من متجر ${targetOrder.store_name_snapshot} الآن في حالة: "${
          statusLabelsAr[newStatus]
        }"${rejectionReason ? ` (السبب: ${rejectionReason})` : ''}.`,
        type: 'order_update',
        related_order_id: targetOrder.id,
        is_read: false,
        created_at: nowIso,
      },
      ...prev,
    ]);

    showToast(`تم تحديث حالة الطلب #${targetOrder.order_number} إلى ${statusLabelsAr[newStatus]}`);
    return { success: true };
  };

  // Verified Reviews
  const submitReview = (params: {
    orderId: string;
    storeId: string;
    productId?: string;
    rating: number;
    comment: string;
  }) => {
    if (!currentUser) return { success: false, error: 'يرجى تسجيل الدخول أولاً' };
    const order = orders.find(
      (o) =>
        o.id === params.orderId &&
        o.customer_id === currentUser.id &&
        o.store_id === params.storeId &&
        o.status === 'completed'
    );
    if (!order) {
      return { success: false, error: 'يمكنك تقييم المتجر فقط بعد استلام طلب مكتمل منه.' };
    }
    const alreadyReviewed = reviews.some(
      (r) => r.order_id === params.orderId && r.user_id === currentUser.id
    );
    if (alreadyReviewed) {
      return { success: false, error: 'لقد قمت بتقييم هذا الطلب مسبقاً.' };
    }

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      order_id: params.orderId,
      store_id: params.storeId,
      product_id: params.productId,
      user_id: currentUser.id,
      user_name_ar: currentUser.full_name,
      rating: Math.max(1, Math.min(5, params.rating)),
      comment: params.comment.trim(),
      is_flagged: false,
      is_approved: true,
      created_at: new Date().toISOString(),
    };

    setReviews((prev) => [newRev, ...prev]);
    showToast('شكراً لك! تم نشر تقييمك بنجاح ⭐');
    return { success: true };
  };

  // Notifications
  const unreadNotificationsCount = useMemo(() => {
    if (!currentUser) return 0;
    return notifications.filter((n) => n.user_id === currentUser.id && !n.is_read).length;
  }, [currentUser, notifications]);

  const markNotificationAsRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) => (n.user_id === currentUser.id ? { ...n, is_read: true } : n))
    );
  };

  // =========================================================================
  // MERCHANT ACTIONS (Strictly isolated to currentUser.store_id)
  // =========================================================================
  const saveMerchantProduct = (productData: Partial<Product> & { id?: string }) => {
    if (!currentUser || (currentUser.role !== 'merchant' && currentUser.role !== 'super_admin')) {
      return { success: false, error: 'غير مصرح لك بإدارة المنتجات.' };
    }
    const targetStoreId =
      currentUser.role === 'merchant' ? currentUser.store_id : productData.store_id;
    if (!targetStoreId) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك.' };
    }

    if (productData.id) {
      const existing = products.find((p) => p.id === productData.id);
      if (!existing) return { success: false, error: 'المنتج غير موجود' };
      if (currentUser.role === 'merchant' && existing.store_id !== currentUser.store_id) {
        return { success: false, error: 'لا يمكنك تعديل منتج يخص متجراً آخر!' };
      }

      const prodStatus = productData.status || existing.status || 'available';
      const isAvailable = prodStatus === 'available' && (productData.stock_quantity ?? existing.stock_quantity) > 0;
      const isActive = prodStatus !== 'hidden' && prodStatus !== 'draft';

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productData.id
            ? ({
                ...p,
                ...productData,
                status: prodStatus,
                is_available_for_sale: isAvailable,
                is_active: isActive,
              } as Product)
            : p
        )
      );
      showToast('تم تحديث بيانات المنتج بنجاح');
      return { success: true };
    } else {
      const prodStatus = productData.status || 'available';
      const isAvailable = prodStatus === 'available' && Number(productData.stock_quantity ?? 20) > 0;
      const isActive = prodStatus !== 'hidden' && prodStatus !== 'draft';

      const newProd: Product = {
        id: `prod-${Date.now()}`,
        store_id: targetStoreId,
        category_id: productData.category_id || 'cat-stationery',
        store_category_id: productData.store_category_id,
        name_ar: productData.name_ar || 'منتج جديد',
        name_en: productData.name_en || '',
        description_ar: productData.description_ar || '',
        price_lyd: Number(productData.price_lyd) || 10,
        old_price_lyd: productData.old_price_lyd ? Number(productData.old_price_lyd) : undefined,
        images:
          productData.images && productData.images.length > 0
            ? productData.images
            : ['https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80'],
        variant_groups: productData.variant_groups || [],
        stock_quantity: Number(productData.stock_quantity ?? 20),
        status: prodStatus,
        colors: productData.colors || [],
        sizes: productData.sizes || [],
        custom_options: productData.custom_options || [],
        is_active: isActive,
        is_available_for_sale: isAvailable,
        sort_order: productData.sort_order ?? products.length + 1,
        is_demo: false,
        created_at: new Date().toISOString(),
      };
      setProducts((prev) => [newProd, ...prev]);
      showToast('تمت إضافة المنتج الجديد إلى متجرك بنجاح');
      return { success: true };
    }
  };

  const deleteMerchantProduct = (productId: string) => {
    if (!currentUser) return { success: false, error: 'غير مصرح' };
    const existing = products.find((p) => p.id === productId);
    if (!existing) return { success: false, error: 'المنتج غير موجود' };
    if (currentUser.role === 'merchant' && existing.store_id !== currentUser.store_id) {
      return { success: false, error: 'لا يمكنك حذف منتج متجر آخر!' };
    }
    // Soft-hide or delete while keeping historical order snapshots intact
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast('تم حذف المنتج من قائمة العرض (مع الاحتفاظ بسجل الطلبات السابقة)', 'info');
    return { success: true };
  };

  const updateMerchantStoreInfo = (updates: Partial<Store>) => {
    if (!currentUser || !currentUser.store_id) {
      return { success: false, error: 'غير مصرح' };
    }
    setStores((prev) =>
      prev.map((s) => (s.id === currentUser.store_id ? { ...s, ...updates } : s))
    );
    showToast('تم تحديث معلومات المتجر بنجاح');
    return { success: true };
  };

  const addMerchantStoreCategory = (name_ar: string) => {
    if (!currentUser || !currentUser.store_id) return { success: false, error: 'غير مصرح' };
    const newScat: StoreCategory = {
      id: `scat-${Date.now()}`,
      store_id: currentUser.store_id,
      name_ar: name_ar.trim(),
      sort_order: storeCategories.length + 1,
    };
    setStoreCategories((prev) => [...prev, newScat]);
    showToast('تمت إضافة التصنيف الداخلي للمتجر');
    return { success: true };
  };

  // =========================================================================
  // ADMIN & SUPER ADMIN ACTIONS
  // =========================================================================
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

  const adminUpdatePlatformSettings = (updates: Partial<PlatformSettings>) => {
    if (!isAdmin) return;
    setPlatformSettings((prev) => ({ ...prev, ...updates }));
    logAudit('تحديث الإعدادات المالية', 'platform_settings', '1', JSON.stringify(updates));
    showToast('تم تحديث إعدادات المنصة والإيرادات');
  };

  const adminCreateStoreInvitation = (data: {
    invited_email: string;
    proposed_store_name: string;
    category_id: string;
  }) => {
    if (!isAdmin || !currentUser) return null;
    const token = `INV-${Math.random().toString(36).substring(2, 7).toUpperCase()}-2026`;
    const newInv: StoreInvitation = {
      id: `inv-${Date.now()}`,
      token,
      invited_email: data.invited_email.trim(),
      proposed_store_name: data.proposed_store_name.trim(),
      category_id: data.category_id,
      created_by_admin_id: currentUser.id,
      is_used: false,
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    };
    setInvitations((prev) => [newInv, ...prev]);
    logAudit('إنشاء رابط دعوة تاجر', 'invitation', token, `دعوة لمتجر ${data.proposed_store_name}`);
    showToast(`تم إنشاء رمز دعوة التاجر: ${token}`);
    return newInv;
  };

  const adminCreateOrUpdateStore = (storeData: Partial<Store> & { id?: string }) => {
    if (!isAdmin) return;
    if (storeData.id) {
      setStores((prev) =>
        prev.map((s) => (s.id === storeData.id ? ({ ...s, ...storeData } as Store) : s))
      );
      logAudit('تعديل بيانات متجر', 'store', storeData.id, `تعديل متجر ${storeData.name_ar || storeData.name_en || ''}`);
      showToast('تم تحديث بيانات المتجر بنجاح');
    } else {
      const newStore: Store = {
        id: `store-${Date.now()}`,
        owner_id: storeData.owner_id || 'user-super-admin',
        name_en: storeData.name_en || storeData.name_ar || 'Campus Store',
        name_ar: storeData.name_ar || storeData.name_en || 'متجر جامعي جديد',
        slug: (storeData.name_en || storeData.name_ar || 'store').toLowerCase().replace(/\s+/g, '-'),
        activity_type_ar: storeData.activity_type_ar || 'منتجات وخدمات طلابية',
        description_ar: storeData.description_ar || 'متجر معتمد داخل الكلية.',
        category_id: storeData.category_id || 'cat-services',
        logo_url: (storeData.logo_url ?? '').trim(),
        cover_url: (storeData.cover_url ?? '').trim(),
        icon_bg_color: storeData.icon_bg_color || '#087E83',
        icon_type: storeData.icon_type || 'sparkles',
        location_inside_campus: storeData.location_inside_campus || 'داخل الكلية',
        is_open: storeData.is_open ?? true,
        supports_pickup: true,
        supports_delivery: true,
        delivery_fee_lyd: Number(storeData.delivery_fee_lyd ?? 3),
        contact_phone: storeData.contact_phone || '0910000000',
        status: storeData.status || 'active',
        is_demo: false,
        created_at: new Date().toISOString(),
      };
      setStores((prev) => [newStore, ...prev]);
      logAudit('إضافة متجر جديد', 'store', newStore.id, `إضافة متجر ${newStore.name_ar}`);
      showToast('تم إنشاء المتجر الجديد بنجاح');
    }
  };

  const adminChangeStoreStatus = (storeId: string, status: Store['status']) => {
    if (!isAdmin) return;
    setStores((prev) =>
      prev.map((s) => {
        if (s.id !== storeId) return s;
        const storeCode = s.store_code || `STR-${Math.floor(1000 + Math.random() * 9000)}`;
        return { ...s, status, store_code: storeCode };
      })
    );
    if (status === 'active') {
      const store = stores.find((s) => s.id === storeId);
      if (store) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === store.owner_id || u.store_id === storeId
              ? { ...u, is_active: true }
              : u
          )
        );
      }
    }
    logAudit('تغيير حالة متجر', 'store', storeId, `تغيير الحالة إلى ${status}`);
    showToast(status === 'active' ? 'تم قبول واعتماد المتجر بنجاح' : 'تم تحديث حالة المتجر');
  };

  const adminIssueMerchantCredentials = (storeId: string) => {
    if (!isAdmin) return { success: false, error: 'غير مصرح' };
    const store = stores.find((s) => s.id === storeId);
    if (!store) return { success: false, error: 'المتجر غير موجود' };
    const owner = users.find((u) => u.id === store.owner_id || u.store_id === storeId);

    const storeCode = store.store_code || `STR-${Math.floor(1000 + Math.random() * 9000)}`;
    const baseSlug = (store.slug || store.name_en || 'store')
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .toLowerCase();
    const username = owner?.username || `${baseSlug}_${Math.floor(100 + Math.random() * 900)}`;
    const tempPassword = `CM@${Math.floor(1000 + Math.random() * 9000)}`;

    if (!store.store_code) {
      setStores((prev) =>
        prev.map((s) => (s.id === storeId ? { ...s, store_code: storeCode } : s))
      );
    }

    if (owner) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === owner.id
            ? {
                ...u,
                username,
                password: tempPassword,
                must_change_password: true,
                role: 'merchant',
                store_id: storeId,
                is_active: true,
              }
            : u
        )
      );
    } else {
      const newOwner: User = {
        id: `user-merch-${Date.now()}`,
        email: `${username}@campusmarket.ly`,
        phone: store.contact_phone || '0910000000',
        full_name: store.name_ar,
        role: 'merchant',
        faculty_location_id: 'loc-main',
        store_id: storeId,
        username,
        password: tempPassword,
        must_change_password: true,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newOwner]);
    }

    logAudit(
      'إصدار بيانات دخول تاجر',
      'store',
      storeId,
      `تم إصدار بيانات دخول للمتجر ${store.name_ar} (المستخدم: ${username})`
    );
    showToast(`تم تجهيز بيانات دخول المتجر: ${username}`, 'success');

    return {
      success: true,
      credentials: {
        storeName: store.name_ar,
        storeCode,
        username,
        tempPassword,
        loginUrl: 'https://7ij0d.github.io/campus-market/#/merchant-login',
      },
    };
  };

  const adminDeleteStore = (storeId: string) => {
    if (!isAdmin) return;
    const target = stores.find((s) => s.id === storeId);
    setStores((prev) => prev.filter((s) => s.id !== storeId));
    setProducts((prev) => prev.filter((p) => p.store_id !== storeId));
    setStoreCategories((prev) => prev.filter((sc) => sc.store_id !== storeId));
    setReviews((prev) => prev.filter((r) => r.store_id !== storeId));
    logAudit('حذف متجر نهائياً', 'store', storeId, `تم حذف المتجر ${target?.name_ar || storeId} وجميع منتجاته`);
    showToast('تم حذف المتجر وجميع منتجاته نهائياً من المنصة', 'info');
  };

  const adminToggleProductVisibility = (productId: string, is_active: boolean) => {
    if (!isAdmin) return;
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, is_active } : p)));
    logAudit('تغيير ظهور منتج', 'product', productId, `is_active=${is_active}`);
    showToast(is_active ? 'تم تفعيل ظهور المنتج' : 'تم إخفاء المنتج المخالف');
  };

  const adminSaveCategory = (catData: Partial<Category> & { id?: string }) => {
    if (!isAdmin) return;
    if (catData.id) {
      setCategories((prev) =>
        prev.map((c) => (c.id === catData.id ? ({ ...c, ...catData } as Category) : c))
      );
      showToast('تم تعديل التصنيف');
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name_ar: catData.name_ar || 'تصنيف جديد',
        name_en: catData.name_en || 'New Category',
        slug: (catData.name_en || `cat-${Date.now()}`).toLowerCase().replace(/\s+/g, '-'),
        icon_name: catData.icon_name || 'Sparkles',
        color_bg: catData.color_bg || '#EAF3F4',
        color_text: catData.color_text || '#087E83',
        sort_order: Number(catData.sort_order ?? categories.length + 1),
        is_active: catData.is_active ?? true,
      };
      setCategories((prev) => [...prev, newCat]);
      showToast('تمت إضافة التصنيف بنجاح');
    }
  };

  const adminDeleteCategory = (catId: string) => {
    if (!isAdmin || catId === 'cat-all') return;
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    showToast('تم حذف التصنيف', 'info');
  };

  const adminSaveBanner = (bannerData: Partial<Banner> & { id?: string }) => {
    if (!isAdmin) return;
    if (bannerData.id) {
      setBanners((prev) =>
        prev.map((b) => (b.id === bannerData.id ? ({ ...b, ...bannerData } as Banner) : b))
      );
      showToast('تم تحديث البانر الإعلاني');
    } else {
      const newBan: Banner = {
        id: `ban-${Date.now()}`,
        title_ar: bannerData.title_ar || 'عنوان الإعلان الجديد',
        subtitle_ar: bannerData.subtitle_ar || 'وصف مختصر للعرض الجامعي',
        tags_ar: bannerData.tags_ar || 'عرض خاص',
        cta_text_ar: bannerData.cta_text_ar || 'تسوق الآن',
        target_link: bannerData.target_link || '/stores',
        image_url:
          bannerData.image_url ||
          'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
        start_date: bannerData.start_date || new Date().toISOString().slice(0, 10),
        end_date: bannerData.end_date,
        sort_order: Number(bannerData.sort_order ?? banners.length + 1),
        is_active: bannerData.is_active ?? true,
      };
      setBanners((prev) => [...prev, newBan]);
      showToast('تمت إضافة البانر الإعلاني بنجاح');
    }
  };

  const adminDeleteBanner = (bannerId: string) => {
    if (!isAdmin) return;
    setBanners((prev) => prev.filter((b) => b.id !== bannerId));
    showToast('تم حذف البانر الإعلاني', 'info');
  };

  const adminToggleUserStatus = (userId: string, is_active: boolean, role?: UserRole) => {
    if (!isAdmin) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, is_active, role: role ?? u.role } : u
      )
    );
    logAudit('تحديث حساب مستخدم', 'user', userId, `active=${is_active}, role=${role || ''}`);
    showToast('تم تحديث صلاحيات وحالة المستخدم');
  };

  const adminModerateReview = (reviewId: string, is_approved: boolean) => {
    if (!isAdmin) return;
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, is_approved } : r))
    );
    showToast(is_approved ? 'تم اعتماد التقييم' : 'تم إخفاء التقييم المخالف', 'info');
  };

  // Requirement 24: Demo data can be purged or replaced from Admin Dashboard
  const adminPurgeDemoData = () => {
    if (!isAdmin) return;
    setStores((prev) => prev.filter((s) => !s.is_demo));
    setProducts((prev) => prev.filter((p) => !p.is_demo));
    setOrders((prev) => prev.filter((o) => !o.is_demo));
    logAudit('حذف البيانات التجريبية', 'system', 'demo_data', 'تم مسح جميع المتاجر والمنتجات والطلبات التجريبية');
    showToast('تم حذف جميع البيانات التجريبية من قاعدة البيانات بنجاح', 'info');
  };

  const adminRestoreDemoData = () => {
    if (!isAdmin) return;
    setStores(INITIAL_STORES);
    setStoreCategories(INITIAL_STORE_CATEGORIES);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setReviews(INITIAL_REVIEWS);
    setBanners(INITIAL_BANNERS);
    logAudit('استعادة البيانات التجريبية', 'system', 'demo_data', 'تمت استعادة البيانات التجريبية الافتراضية');
    showToast('تمت استعادة البيانات التجريبية بنجاح');
  };

  return (
    <MarketplaceContext.Provider
      value={{
        currentUser,
        users,
        loginByEmail,
        merchantLogin,
        merchantChangePassword,
        merchantSelfUpdateStore,
        merchantReplyToReview,
        updateStoreVisibility,
        adminIssueMerchantCredentials,
        adminLogin,
        switchQuickAccount,
        registerCustomer,
        registerMerchantByInvite,
        logout,
        updateUserProfile,
        headerSearchQuery,
        setHeaderSearchQuery,
        locations,
        selectedLocationId,
        selectedPickupPoint,
        setSelectedLocationId,
        setSelectedPickupPoint,
        categories,
        stores,
        storeCategories,
        products,
        banners,
        reviews,
        favoritesProductIds,
        favoritesStoreIds,
        toggleFavoriteProduct,
        toggleFavoriteStore,
        getPlatformMostOrderedProducts,
        getStoreMostOrderedProducts,
        getSpecialOfferProducts,
        getStoreRatingStats,
        getProductDiscountPercent,
        getStoreById,
        cartItems,
        cartCount,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        placeOrdersFromCart,
        orders,
        updateOrderStatus,
        submitReview,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        saveMerchantProduct,
        deleteMerchantProduct,
        updateMerchantStoreInfo,
        addMerchantStoreCategory,
        platformSettings,
        invitations,
        subscriptions,
        auditLogs,
        adminUpdatePlatformSettings,
        adminCreateStoreInvitation,
        adminCreateOrUpdateStore,
        adminChangeStoreStatus,
        adminDeleteStore,
        adminToggleProductVisibility,
        adminSaveCategory,
        adminDeleteCategory,
        adminSaveBanner,
        adminDeleteBanner,
        adminToggleUserStatus,
        adminModerateReview,
        adminPurgeDemoData,
        adminRestoreDemoData,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) throw new Error('useMarketplace must be used within MarketplaceProvider');
  return ctx;
};
