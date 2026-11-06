import React, { useState, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  ShieldCheck,
  Store as StoreIcon,
  Users,
  Package,
  ShoppingBag,
  Megaphone,
  BarChart3,
  DollarSign,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  Copy,
  Edit3,
  Upload,
  CheckCircle2,
  XCircle,
  X,
  LogIn,
  ExternalLink,
  RefreshCw,
  Search,
  Sliders,
  Check,
  UserCheck,
  Camera,
  Image as ImageIcon,
  Lock,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { STATUS_META } from './OrdersPage';
import { OrderStatus, Store } from '../types/database';
import { StoreCard } from '../components/StoreCard';
import { compressImageFile } from '../utils/imageUpload';

type AdminTab =
  | 'stores'
  | 'products'
  | 'banners'
  | 'orders'
  | 'analytics'
  | 'users'
  | 'finance';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    users,
    switchQuickAccount,
    stores,
    products,
    categories,
    orders,
    banners,
    reviews,
    invitations,
    platformSettings,
    subscriptions,
    auditLogs,
    getPlatformMostOrderedProducts,
    adminUpdatePlatformSettings,
    adminCreateStoreInvitation,
    adminCreateOrUpdateStore,
    adminChangeStoreStatus,
    adminIssueMerchantCredentials,
    adminFullUpdateStoreAndMerchant,
    adminDirectCreateStoreAndMerchant,
    adminImpersonateStore,
    getStoreMerchantUser,
    adminDeleteStore,
    adminToggleProductVisibility,
    saveMerchantProduct,
    deleteMerchantProduct,
    adminSaveBanner,
    adminDeleteBanner,
    adminToggleUserStatus,
    adminModerateReview,
    updateOrderStatus,
    showToast,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<AdminTab>('stores');

  // Invitation Form State
  const [invEmail, setInvEmail] = useState('');
  const [invStoreName, setInvStoreName] = useState('');
  const [invCatId] = useState('cat-services');

  // Add / Edit Store Form State (with Thumbnail + Banner Upload & Preview)
  const [editingStore, setEditingStore] = useState<
    (Partial<Store> & { id?: string }) | null
  >(null);

  // Store Search & Status Filters for Super Admin
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [storeStatusFilter, setStoreStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');

  // Comprehensive Store & Merchant Full Edit Modal State
  const [editingStoreFull, setEditingStoreFull] = useState<{
    storeId: string;
    name_ar: string;
    name_en: string;
    activity_type_ar: string;
    description_ar: string;
    location_inside_campus: string;
    contact_phone: string;
    category_id: string;
    logo_url: string;
    cover_url: string;
    store_code: string;
    status: Store['status'];
    visibility_status: 'active' | 'pause_orders' | 'closed_temp' | 'hidden';
    username: string;
    new_password: string;
    owner_full_name: string;
    owner_email: string;
    owner_phone: string;
    is_account_active: boolean;
  } | null>(null);

  // Direct Store & Merchant Creation Modal State
  const [isCreatingStoreModal, setIsCreatingStoreModal] = useState(false);
  const [newStoreForm, setNewStoreForm] = useState({
    name_ar: '',
    name_en: '',
    activity_type_ar: '',
    description_ar: '',
    location_inside_campus: 'داخل الكلية',
    contact_phone: '',
    category_id: 'cat-services',
    logo_url: '',
    cover_url: '',
    store_code: '',
    owner_full_name: '',
    owner_email: '',
    username: '',
    password: '',
    status: 'active' as Store['status'],
  });

  const openEditStoreFullModal = (st: Store) => {
    const owner = getStoreMerchantUser(st.id);
    setEditingStoreFull({
      storeId: st.id,
      name_ar: st.name_ar,
      name_en: st.name_en || st.name_ar,
      activity_type_ar: st.activity_type_ar || '',
      description_ar: st.description_ar || '',
      location_inside_campus: st.location_inside_campus || 'داخل الكلية',
      contact_phone: st.contact_phone || owner?.phone || '',
      category_id: st.category_id || 'cat-services',
      logo_url: st.logo_url || '',
      cover_url: st.cover_url || '',
      store_code: st.store_code || '',
      status: st.status,
      visibility_status: st.visibility_status || 'active',
      username: owner?.username || '',
      new_password: '',
      owner_full_name: owner?.full_name || st.name_ar,
      owner_email: owner?.email || '',
      owner_phone: owner?.phone || st.contact_phone || '',
      is_account_active: owner?.is_active ?? true,
    });
  };

  const handleEditStoreLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingStoreFull) return;
    try {
      const dataUrl = await compressImageFile(file, 400, 400, 0.86);
      setEditingStoreFull({ ...editingStoreFull, logo_url: dataUrl });
    } catch {
      showToast('تعذر قراءة الصورة المصغرة', 'error');
    }
  };

  const handleEditStoreCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingStoreFull) return;
    try {
      const dataUrl = await compressImageFile(file, 1200, 600, 0.86);
      setEditingStoreFull({ ...editingStoreFull, cover_url: dataUrl });
    } catch {
      showToast('تعذر قراءة صورة البانر', 'error');
    }
  };

  const handleNewStoreLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 400, 400, 0.86);
      setNewStoreForm((prev) => ({ ...prev, logo_url: dataUrl }));
    } catch {
      showToast('تعذر قراءة الصورة المصغرة', 'error');
    }
  };

  const handleNewStoreCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 1200, 600, 0.86);
      setNewStoreForm((prev) => ({ ...prev, cover_url: dataUrl }));
    } catch {
      showToast('تعذر قراءة صورة البانر', 'error');
    }
  };

  // Issued Merchant Credentials Modal
  const [issuedCredentials, setIssuedCredentials] = useState<{
    storeName: string;
    storeCode: string;
    username: string;
    tempPassword?: string;
    loginUrl: string;
  } | null>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // Direct Add Product / Service State
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('15');
  const [newProdStoreId, setNewProdStoreId] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');

  // Banner Form State
  const [banTitle, setBanTitle] = useState('');
  const [banSubtitle, setBanSubtitle] = useState('');
  const [banCta, setBanCta] = useState('اكتشف المتاجر');
  const [banImg, setBanImg] = useState('/campus-market/banner-campus-art.jpg');

  // Filters
  const [prodSearch, setProdSearch] = useState('');
  const [prodStoreFilter, setProdStoreFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const isAdmin =
    currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

  const pendingStoresCount = useMemo(
    () => stores.filter((s) => s.status === 'pending').length,
    [stores]
  );

  const platformStats = useMemo(() => {
    const activeStoresCount = stores.filter((s) => s.status === 'active').length;
    const completedOrders = orders.filter((o) => o.status === 'completed');
    const totalSalesLyd = completedOrders.reduce((s, o) => s + o.total_lyd, 0);
    const totalCommissionsLyd = completedOrders.reduce(
      (s, o) => s + o.platform_commission_lyd,
      0
    );
    const totalSubscriptionsLyd = subscriptions
      .filter((sub) => sub.status === 'active')
      .reduce((s, sub) => s + sub.amount_lyd, 0);

    const storeActivityMap = new Map<
      string,
      { storeName: string; ordersCount: number; salesLyd: number }
    >();
    for (const ord of completedOrders) {
      const cur = storeActivityMap.get(ord.store_id) || {
        storeName: ord.store_name_snapshot,
        ordersCount: 0,
        salesLyd: 0,
      };
      cur.ordersCount += 1;
      cur.salesLyd += ord.total_lyd;
      storeActivityMap.set(ord.store_id, cur);
    }

    const mostActiveStores = Array.from(storeActivityMap.values()).sort(
      (a, b) => b.salesLyd - a.salesLyd
    );

    return {
      usersCount: users.length,
      activeStoresCount,
      productsCount: products.length,
      ordersCount: orders.length,
      completedOrdersCount: completedOrders.length,
      totalSalesLyd,
      totalCommissionsLyd: Math.round(totalCommissionsLyd * 100) / 100,
      totalSubscriptionsLyd,
      mostActiveStores,
    };
  }, [users, stores, products, orders, subscriptions]);

  const mostOrderedPlatform = useMemo(
    () => getPlatformMostOrderedProducts(),
    [getPlatformMostOrderedProducts]
  );

  const filteredAdminStores = useMemo(() => {
    return stores.filter((st) => {
      if (storeStatusFilter !== 'all') {
        if (storeStatusFilter === 'active' && st.status !== 'active') return false;
        if (storeStatusFilter === 'pending' && st.status !== 'pending') return false;
        if (storeStatusFilter === 'suspended' && (st.status === 'active' || st.status === 'pending'))
          return false;
      }
      if (storeSearchQuery.trim()) {
        const q = storeSearchQuery.trim().toLowerCase();
        const owner = getStoreMerchantUser(st.id);
        const matchName =
          (st.name_ar && st.name_ar.toLowerCase().includes(q)) ||
          (st.name_en && st.name_en.toLowerCase().includes(q));
        const matchCode = st.store_code && st.store_code.toLowerCase().includes(q);
        const matchUser = owner?.username && owner.username.toLowerCase().includes(q);
        const matchOwner = owner?.full_name && owner.full_name.toLowerCase().includes(q);
        const matchPhone = st.contact_phone && st.contact_phone.includes(q);
        return matchName || matchCode || matchUser || matchOwner || matchPhone;
      }
      return true;
    });
  }, [stores, storeStatusFilter, storeSearchQuery, users]);

  const handleStoreLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingStore) return;
    try {
      const dataUrl = await compressImageFile(file, 400, 400, 0.86);
      setEditingStore({ ...editingStore, logo_url: dataUrl });
    } catch {
      showToast('تعذر قراءة الصورة المصغرة', 'error');
    }
  };

  const handleStoreCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingStore) return;
    try {
      const dataUrl = await compressImageFile(file, 1200, 600, 0.86);
      setEditingStore({ ...editingStore, cover_url: dataUrl });
    } catch {
      showToast('تعذر قراءة صورة البانر', 'error');
    }
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 1200, 500, 0.86);
      setBanImg(dataUrl);
    } catch {
      showToast('تعذر قراءة صورة البانر', 'error');
    }
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 800, 800, 0.85);
      setNewProdImage(dataUrl);
    } catch {
      showToast('تعذر قراءة صورة المنتج', 'error');
    }
  };

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="space-y-5">
      {/* Top Executive Admin Bar */}
      <header className="bg-[#18343B] text-white rounded-3xl p-4 sm:p-5 border border-[#087E83]/30 shadow-card">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              title="العودة للمتجر"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold bg-[#087E83] px-2.5 py-0.5 rounded-full">
                  لوحة الإدارة
                </span>
                <h1 className="text-sm sm:text-base font-extrabold">
                  إدارة منصة CampusMarket
                </h1>
              </div>
              <p className="text-[11px] text-[#B9DDE0] mt-0.5">
                إدارة المتاجر وطلبات الاشتراك • الصور المصغرة والبانرات • المنتجات والخدمات • البانر الرئيسي
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setNewStoreForm({
                name_ar: '',
                name_en: '',
                activity_type_ar: '',
                description_ar: '',
                location_inside_campus: 'داخل الكلية',
                contact_phone: '',
                category_id: categories[0]?.id || 'cat-services',
                logo_url: '',
                cover_url: '',
                store_code: `STR-${Math.floor(1000 + Math.random() * 9000)}`,
                owner_full_name: '',
                owner_email: '',
                username: `store_${Math.floor(100 + Math.random() * 900)}`,
                password: `CM@${Math.floor(1000 + Math.random() * 9000)}`,
                status: 'active',
              });
              setIsCreatingStoreModal(true);
            }}
            className="px-4 py-2 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ إنشاء متجر وحساب تاجر جديد</span>
          </button>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="mt-4 pt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-white/10">
          {(
            [
              {
                id: 'stores',
                label: `المتاجر (${stores.length})${
                  pendingStoresCount > 0 ? ` • ${pendingStoresCount} طلب جديد` : ''
                }`,
                icon: StoreIcon,
              },
              {
                id: 'products',
                label: `المنتجات والخدمات (${products.length})`,
                icon: Package,
              },
              { id: 'banners', label: 'البانر الرئيسي', icon: Megaphone },
              { id: 'orders', label: `الطلبات (${orders.length})`, icon: ShoppingBag },
              { id: 'users', label: `المستخدمون والتقييمات`, icon: Users },
              { id: 'analytics', label: 'الإحصائيات', icon: BarChart3 },
              { id: 'finance', label: 'الإعدادات المالية', icon: DollarSign },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition ${
                  active
                    ? 'bg-[#087E83] text-white'
                    : 'text-[#B9DDE0] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      <main className="space-y-5">
        {/* TAB 1: STORES, SUBSCRIPTION REQUESTS & INVITATIONS */}
        {activeTab === 'stores' && (
          <div className="space-y-5">
            {/* Merchant Invitation Generator */}
            <section className="bg-white rounded-3xl p-5 border border-[#E5EAED] shadow-card space-y-3">
              <div className="flex items-center gap-2 text-[#087E83]">
                <KeyRound className="w-4 h-4" />
                <h2 className="text-sm font-extrabold">
                  إصدار رمز دعوة خاص لصاحب متجر جديد
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  value={invStoreName}
                  onChange={(e) => setInvStoreName(e.target.value)}
                  placeholder="اسم المتجر المقترح..."
                  className="h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                />
                <input
                  type="email"
                  value={invEmail}
                  onChange={(e) => setInvEmail(e.target.value)}
                  placeholder="البريد الإلكتروني للتاجر..."
                  className="h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!invStoreName || !invEmail) return;
                    adminCreateStoreInvitation({
                      invited_email: invEmail,
                      proposed_store_name: invStoreName,
                      category_id: invCatId,
                    });
                    setInvStoreName('');
                    setInvEmail('');
                  }}
                  className="h-10 rounded-full bg-[#18343B] hover:bg-[#087E83] text-white text-xs font-extrabold transition"
                >
                  توليد رمز الدعوة
                </button>
              </div>

              {invitations.length > 0 && (
                <div className="space-y-2 pt-2">
                  {invitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#EAF3F4] border border-[#DCEBED] text-xs"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          dir="ltr"
                          className="font-en font-extrabold bg-white px-2.5 py-1 rounded-lg border border-[#DCEBED] text-[#087E83]"
                        >
                          {inv.token}
                        </span>
                        <span className="font-bold text-[#18343B]">
                          {inv.proposed_store_name} ({inv.invited_email})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(inv.token);
                          }
                          showToast(`تم نسخ رمز الدعوة: ${inv.token}`, 'info');
                        }}
                        className="p-1.5 rounded-lg bg-white text-[#087E83]"
                        title="نسخ رمز الدعوة"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Super Admin Store Filters & Search Bar */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E5EAED] shadow-card space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: `جميع المتاجر (${stores.length})` },
                    {
                      id: 'active',
                      label: `المعتمدة والنشطة (${
                        stores.filter((s) => s.status === 'active').length
                      })`,
                    },
                    {
                      id: 'pending',
                      label: `طلبات جديدة (${pendingStoresCount})`,
                    },
                    {
                      id: 'suspended',
                      label: `الموقوفة (${
                        stores.filter((s) => s.status !== 'active' && s.status !== 'pending')
                          .length
                      })`,
                    },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() =>
                        setStoreStatusFilter(
                          filter.id as 'all' | 'active' | 'pending' | 'suspended'
                        )
                      }
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                        storeStatusFilter === filter.id
                          ? 'bg-[#087E83] text-white shadow-xs'
                          : 'bg-[#F8FAFC] text-[#74838A] hover:text-[#18343B] border border-[#E5EAED]'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNewStoreForm({
                      name_ar: '',
                      name_en: '',
                      activity_type_ar: '',
                      description_ar: '',
                      location_inside_campus: 'داخل الكلية',
                      contact_phone: '',
                      category_id: categories[0]?.id || 'cat-services',
                      logo_url: '',
                      cover_url: '',
                      store_code: `STR-${Math.floor(1000 + Math.random() * 9000)}`,
                      owner_full_name: '',
                      owner_email: '',
                      username: `store_${Math.floor(100 + Math.random() * 900)}`,
                      password: `CM@${Math.floor(1000 + Math.random() * 9000)}`,
                      status: 'active',
                    });
                    setIsCreatingStoreModal(true);
                  }}
                  className="px-4 py-2 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>إضافة متجر وحساب تاجر</span>
                </button>
              </div>

              {/* Search Stores Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#74838A] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={storeSearchQuery}
                  onChange={(e) => setStoreSearchQuery(e.target.value)}
                  placeholder="ابحث باسم المتجر، اسم المستخدم، رمز المتجر، رقم الهاتف، أو اسم المالك..."
                  className="w-full h-11 pr-10 pl-10 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] focus:bg-white focus:border-[#087E83] text-xs sm:text-sm font-semibold outline-none transition"
                />
                {storeSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setStoreSearchQuery('')}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74838A] hover:text-[#18343B]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* All Stores List (Pending & Active & Suspended) */}
            {filteredAdminStores.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center space-y-3 border border-[#E5EAED] shadow-card">
                <StoreIcon className="w-10 h-10 text-[#087E83] mx-auto stroke-[1.7]" />
                <p className="text-sm font-extrabold text-[#18343B]">
                  {storeSearchQuery.trim()
                    ? 'لا توجد متاجر مطابقة لبحثك'
                    : 'لا توجد متاجر في هذا التصنيف حالياً'}
                </p>
                <p className="text-xs text-[#74838A]">
                  يمكنك الضغط على زر "إضافة متجر وحساب تاجر" لإنشاء متجر وحساب مباشرة.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredAdminStores.map((st) => {
                  const merchantUser = getStoreMerchantUser(st.id);
                  const storeProductsCount = products.filter((p) => p.store_id === st.id).length;
                  const storeOrdersCount = orders.filter((o) => o.store_id === st.id).length;

                  return (
                    <div
                      key={st.id}
                      className="bg-white rounded-3xl p-5 border border-[#E5EAED] shadow-card space-y-4 hover:border-[#087E83]/40 transition"
                    >
                      {/* Live Store Card Preview */}
                      <StoreCard store={st} />

                      {/* Store & Linked Merchant Credentials Badge */}
                      <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] space-y-2 text-xs">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[#18343B]">رمز المتجر:</span>
                            <span className="font-mono font-black text-[#087E83] bg-white px-2 py-0.5 rounded-lg border border-[#E5EAED]">
                              {st.store_code || st.id}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#74838A]">حساب التاجر:</span>
                            <span className="font-mono font-extrabold text-[#18343B] bg-white px-2 py-0.5 rounded-lg border border-[#E5EAED]">
                              @{merchantUser?.username || 'بدون_حساب'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] text-[#74838A] pt-1 border-t border-[#E5EAED]/60">
                          <div>
                            المالك: <strong className="text-[#18343B]">{merchantUser?.full_name || st.name_ar}</strong>{' '}
                            {st.contact_phone ? `(${st.contact_phone})` : ''}
                          </div>
                          <div>
                            المنتجات: <strong className="text-[#087E83]">{storeProductsCount}</strong> • الطلبات: <strong className="text-[#087E83]">{storeOrdersCount}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Admin Controls for this Store */}
                      <div className="pt-2 border-t border-[#E5EAED] flex items-center justify-between flex-wrap gap-2">
                        {/* Status Badge */}
                        <span
                          className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                            st.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : st.status === 'pending'
                              ? 'bg-[#FDF8E7] text-[#18343B] border border-[#F3C95B]'
                              : 'bg-rose-50 text-rose-600 border border-rose-200'
                          }`}
                        >
                          {st.status === 'active'
                            ? 'معتمد ونشط'
                            : st.status === 'pending'
                            ? 'بانتظار الموافقة'
                            : 'موقوف / معطل'}
                        </span>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Impersonate Button (الدخول كصاحب متجر) */}
                          <button
                            type="button"
                            onClick={() => {
                              const res = adminImpersonateStore(st.id);
                              if (res.success) {
                                navigate('/merchant');
                              }
                            }}
                            className="px-3 py-1.5 rounded-full bg-[#18343B] hover:bg-[#22444C] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition active:scale-95"
                            title="الدخول إلى لوحة هذا المتجر كتاجر وتعديل منتجاته وطلباته"
                          >
                            <LogIn className="w-3.5 h-3.5 stroke-[2.2] text-[#F3C95B]" />
                            <span>دخول كتاجر</span>
                          </button>

                          {/* Quick Toggle Status */}
                          {st.status !== 'active' ? (
                            <button
                              type="button"
                              onClick={() => {
                                adminChangeStoreStatus(st.id, 'active');
                                const res = adminIssueMerchantCredentials(st.id);
                                if (res.success && res.credentials) {
                                  setIssuedCredentials(res.credentials);
                                }
                              }}
                              className="px-3 py-1.5 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-extrabold flex items-center gap-1 shadow-2xs transition"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>اعتماد</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => adminChangeStoreStatus(st.id, 'suspended')}
                              className="px-3 py-1.5 rounded-full bg-[#F8FAFC] border border-[#E5EAED] hover:bg-rose-50 hover:text-rose-600 text-[#74838A] text-xs font-bold flex items-center gap-1 transition"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>إيقاف</span>
                            </button>
                          )}

                          {/* Credentials Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const res = adminIssueMerchantCredentials(st.id);
                              if (res.success && res.credentials) {
                                setIssuedCredentials(res.credentials);
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-full bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 text-xs font-bold flex items-center gap-1"
                            title="إظهار بيانات الدخول وكلمة المرور"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>بيانات الدخول</span>
                          </button>

                          {/* Comprehensive Full Edit Modal Trigger */}
                          <button
                            type="button"
                            onClick={() => openEditStoreFullModal(st)}
                            className="p-2 rounded-full bg-[#EAF3F4] hover:bg-[#D5EAE9] text-[#087E83] transition"
                            title="تعديل شامل لبيانات المتجر واسم المستخدم وكلمة المرور والصور"
                          >
                            <Edit3 className="w-4 h-4 stroke-[2]" />
                          </button>

                          {/* Delete Store */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف متجر "${st.name_ar}" نهائياً؟`)) {
                                adminDeleteStore(st.id);
                              }
                            }}
                            className="p-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                            title="حذف المتجر نهائياً"
                          >
                            <Trash2 className="w-4 h-4 stroke-[2]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRODUCTS & SERVICES */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <section className="bg-white rounded-3xl p-5 border border-[#E5EAED] shadow-card space-y-3">
              <h2 className="text-sm font-extrabold text-[#18343B]">
                إضافة منتج أو خدمة إلى متجر
              </h2>
              {stores.length === 0 ? (
                <p className="text-xs text-[#74838A]">
                  يرجى إضافة متجر واحد على الأقل من تبويب "المتاجر" أولاً لربط المنتجات أو الخدمات به.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="اسم المنتج أو الخدمة..."
                    className="h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                  />
                  <select
                    value={newProdStoreId || stores[0]?.id || ''}
                    onChange={(e) => setNewProdStoreId(e.target.value)}
                    className="h-10 px-3 rounded-xl border border-[#E5EAED] text-xs bg-white"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        متجر: {s.name_ar || s.name_en}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="السعر (د.ل)..."
                    className="h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <label className="h-10 px-3 rounded-xl bg-[#EAF3F4] text-[#087E83] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع صورة</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProductImageUpload}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={newProdImage}
                      onChange={(e) => setNewProdImage(e.target.value)}
                      placeholder="أو رابط الصورة..."
                      className="flex-1 h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-en"
                    />
                  </div>
                  <input
                    type="text"
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    placeholder="وصف مختصر للمنتج أو الخدمة..."
                    className="h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const targetStore = newProdStoreId || stores[0]?.id;
                      if (!newProdName.trim() || !targetStore) return;
                      saveMerchantProduct({
                        store_id: targetStore,
                        name_ar: newProdName.trim(),
                        name_en: newProdName.trim(),
                        description_ar:
                          newProdDesc.trim() || 'متوفر داخل المتجر.',
                        price_lyd: Number(newProdPrice) || 10,
                        category_id: categories[1]?.id || 'cat-services',
                        images: newProdImage ? [newProdImage] : [],
                        stock_quantity: 50,
                        is_active: true,
                        is_available_for_sale: true,
                      });
                      setNewProdName('');
                      setNewProdDesc('');
                      setNewProdImage('');
                    }}
                    className="h-10 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-extrabold flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة للمتجر</span>
                  </button>
                </div>
              )}
            </section>

            <div className="bg-white rounded-3xl p-4 border border-[#E5EAED] shadow-card flex items-center gap-3 flex-wrap">
              <input
                type="text"
                value={prodSearch}
                onChange={(e) => setProdSearch(e.target.value)}
                placeholder="ابحث عن منتج أو خدمة..."
                className="flex-1 min-w-[200px] h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
              />
              <select
                value={prodStoreFilter}
                onChange={(e) => setProdStoreFilter(e.target.value)}
                className="h-10 px-3 rounded-xl border border-[#E5EAED] text-xs bg-white"
              >
                <option value="all">جميع المتاجر</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_ar || s.name_en}
                  </option>
                ))}
              </select>
            </div>

            {products.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center text-xs text-[#74838A] border border-[#E5EAED]">
                لا توجد منتجات أو خدمات مضافة حالياً.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {products
                  .filter(
                    (p) =>
                      (prodStoreFilter === 'all' ||
                        p.store_id === prodStoreFilter) &&
                      (!prodSearch ||
                        p.name_ar
                          .toLowerCase()
                          .includes(prodSearch.toLowerCase()))
                  )
                  .map((prod) => {
                    const st = stores.find((s) => s.id === prod.store_id);
                    return (
                      <div
                        key={prod.id}
                        className="bg-white rounded-2xl p-3.5 border border-[#E5EAED] shadow-card flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={prod.images[0]}
                            alt={prod.name_ar}
                            className="w-14 h-14 rounded-xl object-cover bg-[#F8FAFC]"
                          />
                          <div className="min-w-0">
                            <h3 className="text-xs font-extrabold text-[#18343B] truncate">
                              {prod.name_ar}
                            </h3>
                            <p className="text-[11px] font-bold text-[#087E83]">
                              {st?.name_ar || st?.name_en} • {prod.price_lyd} د.ل
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              adminToggleProductVisibility(
                                prod.id,
                                !prod.is_active
                              )
                            }
                            className="px-3 py-1.5 rounded-full bg-[#F8FAFC] border border-[#E5EAED] text-[#18343B] text-xs font-bold flex items-center gap-1"
                          >
                            {prod.is_active ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>إخفاء</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>إظهار</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMerchantProduct(prod.id)}
                            className="p-2 rounded-full bg-[#F8FAFC] border border-[#E5EAED] text-[#74838A]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MAIN HERO BANNER MANAGEMENT */}
        {activeTab === 'banners' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-[#E5EAED] shadow-card space-y-3">
              <h2 className="text-sm font-extrabold text-[#18343B]">
                إضافة أو تحديث البانر الرئيسي للصفحة الرئيسية
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={banTitle}
                  onChange={(e) => setBanTitle(e.target.value)}
                  placeholder="العبارة التسويقية (مثال: كل احتياجاتك الجامعية في مكان واحد)..."
                  className="h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                />
                <input
                  type="text"
                  value={banSubtitle}
                  onChange={(e) => setBanSubtitle(e.target.value)}
                  placeholder="الوصف المختصر (مثال: منتجات • خدمات • مستلزمات دراسية)..."
                  className="h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                />
                <input
                  type="text"
                  value={banCta}
                  onChange={(e) => setBanCta(e.target.value)}
                  placeholder="نص الزر (اكتشف المتاجر)..."
                  className="h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                />
                <div className="flex items-center gap-2">
                  <label className="h-10 px-3 rounded-xl bg-[#EAF3F4] text-[#087E83] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع صورة بانر</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerImageUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={banImg}
                    onChange={(e) => setBanImg(e.target.value)}
                    placeholder="أو رابط الصورة..."
                    className="flex-1 h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-en"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!banTitle || !banSubtitle) return;
                  adminSaveBanner({
                    title_ar: banTitle,
                    subtitle_ar: banSubtitle,
                    cta_text_ar: banCta,
                    image_url: banImg,
                  });
                  setBanTitle('');
                  setBanSubtitle('');
                }}
                className="h-10 px-5 rounded-full bg-[#087E83] text-white text-xs font-extrabold"
              >
                + نشر البانر في الصفحة الرئيسية
              </button>
            </div>

            <div className="space-y-3">
              {banners.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl p-3.5 border border-[#E5EAED] shadow-card flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={b.image_url}
                      alt={b.title_ar}
                      className="w-20 h-12 rounded-xl object-cover bg-[#D4F1F4]"
                    />
                    <div>
                      <h3 className="text-xs font-extrabold text-[#18343B]">
                        {b.title_ar}
                      </h3>
                      <p className="text-[11px] text-[#74838A]">{b.subtitle_ar}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        adminSaveBanner({ id: b.id, is_active: !b.is_active })
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                        b.is_active
                          ? 'bg-[#EAF3F4] text-[#087E83]'
                          : 'bg-[#F8FAFC] text-[#74838A]'
                      }`}
                    >
                      {b.is_active ? 'نشط' : 'مخفي'}
                    </button>
                    <button
                      type="button"
                      onClick={() => adminDeleteBanner(b.id)}
                      className="p-2 rounded-full bg-[#F8FAFC] text-[#74838A]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-4 border border-[#E5EAED] shadow-card flex items-center gap-3 flex-wrap">
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="ابحث برقم الطلب أو اسم الطالب..."
                className="flex-1 min-w-[200px] h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
              />
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-xl border border-[#E5EAED] text-xs bg-white"
              >
                <option value="all">جميع الحالات</option>
                {Object.entries(STATUS_META).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center text-xs text-[#74838A] border border-[#E5EAED]">
                لا توجد طلبات مسجلة حالياً.
              </div>
            ) : (
              <div className="space-y-3">
                {orders
                  .filter(
                    (o) =>
                      (orderStatusFilter === 'all' ||
                        o.status === orderStatusFilter) &&
                      (!orderSearch ||
                        o.order_number
                          .toLowerCase()
                          .includes(orderSearch.toLowerCase()) ||
                        o.customer_name_ar
                          .toLowerCase()
                          .includes(orderSearch.toLowerCase()))
                  )
                  .map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white rounded-2xl p-4 border border-[#E5EAED] shadow-card flex items-center justify-between flex-wrap gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            dir="ltr"
                            className="font-en text-xs font-extrabold bg-[#EAF3F4] text-[#087E83] px-2 py-0.5 rounded-md"
                          >
                            #{ord.order_number}
                          </span>
                          <span className="text-xs font-extrabold text-[#18343B]">
                            {ord.customer_name_ar} ← {ord.store_name_snapshot}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#74838A]">
                          الإجمالي: {ord.total_lyd} د.ل
                        </p>
                      </div>

                      <select
                        value={ord.status}
                        onChange={(e) =>
                          updateOrderStatus(
                            ord.id,
                            e.target.value as OrderStatus,
                            'تحديث من لوحة الإدارة'
                          )
                        }
                        className="h-9 px-3 rounded-xl border border-[#E5EAED] text-xs font-bold bg-[#F8FAFC]"
                      >
                        {Object.entries(STATUS_META).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: USERS & REVIEWS MODERATION */}
        {activeTab === 'users' && (
          <div className="space-y-5">
            <div className="bg-white rounded-3xl p-4 border border-[#E5EAED] shadow-card space-y-3">
              <h2 className="text-sm font-extrabold text-[#18343B]">
                مراجعة التقييمات ({reviews.length})
              </h2>
              {reviews.length === 0 ? (
                <p className="text-xs text-[#74838A]">
                  لا توجد تقييمات مسجلة حتى الآن.
                </p>
              ) : (
                <div className="space-y-2">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] text-xs"
                    >
                      <div>
                        <span className="font-extrabold text-[#18343B]">
                          {rev.user_name_ar} ({rev.rating}★):
                        </span>{' '}
                        <span className="text-[#74838A]">{rev.comment}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          adminModerateReview(rev.id, !rev.is_approved)
                        }
                        className="px-3 py-1 rounded-lg font-bold bg-white border border-[#E5EAED] text-[#087E83]"
                      >
                        {rev.is_approved ? 'إخفاء' : 'اعتماد'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-4 border border-[#E5EAED] shadow-card space-y-3">
              <h2 className="text-sm font-extrabold text-[#18343B]">
                إدارة حسابات المستخدمين
              </h2>
              <div className="space-y-2">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E5EAED] text-xs flex-wrap gap-2"
                  >
                    <div>
                      <span className="font-extrabold text-[#18343B]">
                        {u.full_name}
                      </span>{' '}
                      <span className="text-[#74838A]">({u.email})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-[#EAF3F4] text-[#087E83] font-extrabold">
                        {u.role}
                      </span>
                      {u.id !== currentUser?.id && (
                        <button
                          type="button"
                          onClick={() =>
                            adminToggleUserStatus(u.id, !u.is_active)
                          }
                          className="px-3 py-1 rounded-lg font-bold bg-white border border-[#E5EAED] text-[#18343B]"
                        >
                          {u.is_active ? 'إيقاف' : 'تفعيل'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-[#E5EAED] shadow-card">
                <span className="text-[11px] font-bold text-[#74838A]">
                  إجمالي المبيعات المكتملة
                </span>
                <p className="text-xl font-extrabold text-[#087E83] mt-1">
                  {platformStats.totalSalesLyd} د.ل
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-[#E5EAED] shadow-card">
                <span className="text-[11px] font-bold text-[#74838A]">
                  المتاجر المعتمدة
                </span>
                <p className="text-xl font-extrabold text-[#18343B] mt-1">
                  {platformStats.activeStoresCount}
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-[#E5EAED] shadow-card">
                <span className="text-[11px] font-bold text-[#74838A]">
                  المنتجات والخدمات
                </span>
                <p className="text-xl font-extrabold text-[#18343B] mt-1">
                  {platformStats.productsCount}
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-[#E5EAED] shadow-card">
                <span className="text-[11px] font-bold text-[#74838A]">
                  إجمالي الطلبات
                </span>
                <p className="text-xl font-extrabold text-[#087E83] mt-1">
                  {platformStats.ordersCount}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-4 border border-[#E5EAED] shadow-card space-y-3">
                <h2 className="text-sm font-extrabold text-[#18343B]">
                  أكثر المتاجر نشاطاً
                </h2>
                {platformStats.mostActiveStores.length === 0 ? (
                  <p className="text-xs text-[#74838A]">لا توجد طلبات مكتملة بعد.</p>
                ) : (
                  <div className="space-y-2">
                    {platformStats.mostActiveStores.map((st, idx) => (
                      <div
                        key={st.storeName}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] text-xs"
                      >
                        <span className="font-extrabold text-[#18343B]">
                          {idx + 1}. {st.storeName}
                        </span>
                        <span className="font-extrabold text-[#087E83]">
                          {st.salesLyd} د.ل ({st.ordersCount} طلب)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-3xl p-4 border border-[#E5EAED] shadow-card space-y-3">
                <h2 className="text-sm font-extrabold text-[#18343B]">
                  أكثر المنتجات طلباً
                </h2>
                {mostOrderedPlatform.length === 0 ? (
                  <p className="text-xs text-[#74838A]">لا توجد بيانات مبيعات بعد.</p>
                ) : (
                  <div className="space-y-2">
                    {mostOrderedPlatform.map((m, idx) => (
                      <div
                        key={m.product.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] text-xs"
                      >
                        <span className="font-bold text-[#18343B]">
                          {idx + 1}. {m.product.name_ar}
                        </span>
                        <span className="font-extrabold text-[#087E83]">
                          {m.unitsSold} مباع
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {auditLogs.length > 0 && (
              <div className="bg-white rounded-3xl p-4 border border-[#E5EAED] shadow-card space-y-3">
                <h2 className="text-sm font-extrabold text-[#18343B]">
                  سجل العمليات الإدارية
                </h2>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] text-xs"
                    >
                      <div>
                        <span className="font-extrabold text-[#087E83]">
                          [{log.action}]
                        </span>{' '}
                        <span className="text-[#18343B]">{log.details}</span>
                      </div>
                      <span className="text-[10px] text-[#74838A]">
                        {new Date(log.created_at).toLocaleString('ar-LY')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: FINANCE SETTINGS */}
        {activeTab === 'finance' && (
          <div className="bg-white rounded-3xl p-5 border border-[#E5EAED] shadow-card max-w-2xl space-y-4">
            <h2 className="text-sm font-extrabold text-[#18343B] border-b border-[#E5EAED] pb-2.5">
              إعدادات نموذج الإيرادات والعمولات والاشتراكات
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#18343B] mb-1">
                  نموذج الإيرادات المعتمد في المنصة:
                </label>
                <select
                  value={platformSettings.revenue_model}
                  onChange={(e) =>
                    adminUpdatePlatformSettings({
                      revenue_model: e.target.value as
                        | 'commission'
                        | 'subscription'
                        | 'hybrid',
                    })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-bold bg-white"
                >
                  <option value="commission">نسبة عمولة على الطلبات فقط</option>
                  <option value="subscription">اشتراك شهري للمتاجر فقط</option>
                  <option value="hybrid">
                    نموذج هجين (عمولة على الطلبات + اشتراك دوري للمتاجر)
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    نسبة عمولة المنصة على كل طلب (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    step={0.5}
                    value={platformSettings.commission_rate_percent}
                    onChange={(e) =>
                      adminUpdatePlatformSettings({
                        commission_rate_percent: Number(e.target.value),
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-extrabold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    قيمة الاشتراك الشهري للمتجر (د.ل)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={platformSettings.monthly_subscription_lyd}
                    onChange={(e) =>
                      adminUpdatePlatformSettings({
                        monthly_subscription_lyd: Number(e.target.value),
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-extrabold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* SUPER ADMIN COMPREHENSIVE STORE & MERCHANT FULL EDIT MODAL */}
      {editingStoreFull && (
        <div className="fixed inset-0 z-50 bg-[#18343B]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-2xl rounded-[32px] p-5 sm:p-7 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto border border-[#E5EAED] animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E5EAED] pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#EAF3F4] text-[#087E83] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#18343B]">
                    لوحة تحكم المشرف — تعديل المتجر والحساب
                  </h3>
                  <p className="text-xs text-[#74838A]">
                    {editingStoreFull.name_ar} (رمز المتجر: {editingStoreFull.store_code || editingStoreFull.storeId})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingStoreFull(null)}
                className="w-9 h-9 rounded-full bg-[#F8FAFC] hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-[#74838A] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Live Preview Card */}
            <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E5EAED] space-y-2">
              <span className="text-[11px] font-black text-[#087E83] block">
                معاينة مباشرة لشكل المتجر في المنصة:
              </span>
              <StoreCard
                previewMode
                store={{
                  id: editingStoreFull.storeId,
                  owner_id: 'merchant',
                  name_ar: editingStoreFull.name_ar || 'اسم المتجر',
                  name_en: editingStoreFull.name_en || editingStoreFull.name_ar,
                  slug: 'preview',
                  activity_type_ar: editingStoreFull.activity_type_ar || 'نشاط المتجر',
                  description_ar: editingStoreFull.description_ar,
                  category_id: editingStoreFull.category_id,
                  logo_url: editingStoreFull.logo_url,
                  cover_url: editingStoreFull.cover_url,
                  icon_bg_color: '#087E83',
                  icon_type: 'sparkles',
                  location_inside_campus: editingStoreFull.location_inside_campus,
                  is_open: true,
                  supports_pickup: true,
                  supports_delivery: true,
                  delivery_fee_lyd: 3,
                  contact_phone: editingStoreFull.contact_phone,
                  status: editingStoreFull.status,
                  store_code: editingStoreFull.store_code,
                  is_demo: false,
                  created_at: new Date().toISOString(),
                }}
              />
            </div>

            {/* SECTION 1: STORE PROFILE & DETAILS */}
            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-black text-[#087E83] uppercase tracking-wider flex items-center gap-1.5">
                <StoreIcon className="w-4 h-4" />
                <span>1. بيانات وهوية المتجر</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    اسم المتجر (بالعربية) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStoreFull.name_ar}
                    onChange={(e) =>
                      setEditingStoreFull({
                        ...editingStoreFull,
                        name_ar: e.target.value,
                        name_en: e.target.value,
                      })
                    }
                    placeholder="مثال: قرطاسية التفوق..."
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-bold text-[#18343B] focus:border-[#087E83] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    نوع النشاط التجاري *
                  </label>
                  <input
                    type="text"
                    value={editingStoreFull.activity_type_ar}
                    onChange={(e) =>
                      setEditingStoreFull({
                        ...editingStoreFull,
                        activity_type_ar: e.target.value,
                      })
                    }
                    placeholder="مثال: مكتبة وطباعة / كافيه ومشروبات..."
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-bold text-[#18343B] focus:border-[#087E83] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    رمز المتجر الفريد (Store Code) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      dir="ltr"
                      value={editingStoreFull.store_code}
                      onChange={(e) =>
                        setEditingStoreFull({
                          ...editingStoreFull,
                          store_code: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="STR-104"
                      className="flex-1 h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-mono font-black text-[#087E83] focus:border-[#087E83] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditingStoreFull({
                          ...editingStoreFull,
                          store_code: `STR-${Math.floor(1000 + Math.random() * 9000)}`,
                        })
                      }
                      className="px-3 h-10 rounded-xl bg-[#F8FAFC] border border-[#E5EAED] text-xs font-bold text-[#18343B] hover:bg-[#EAF3F4]"
                      title="توليد رمز تلقائي"
                    >
                      توليد
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    الموقع داخل الحرم الجامعي
                  </label>
                  <input
                    type="text"
                    value={editingStoreFull.location_inside_campus}
                    onChange={(e) =>
                      setEditingStoreFull({
                        ...editingStoreFull,
                        location_inside_campus: e.target.value,
                      })
                    }
                    placeholder="مثال: مبنى كلية الهندسة - الدور الأرضي"
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-semibold text-[#18343B] focus:border-[#087E83] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    وصف المتجر ونبذة عنه
                  </label>
                  <textarea
                    rows={2}
                    value={editingStoreFull.description_ar}
                    onChange={(e) =>
                      setEditingStoreFull({
                        ...editingStoreFull,
                        description_ar: e.target.value,
                      })
                    }
                    placeholder="وصف مختصر يظهر للطلاب عن منتجات المتجر..."
                    className="w-full p-2.5 rounded-xl border border-[#E5EAED] text-xs font-medium text-[#18343B] focus:border-[#087E83] outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: MERCHANT ACCOUNT & CREDENTIALS */}
            <div className="space-y-3 pt-2 border-t border-[#E5EAED]">
              <h4 className="text-xs font-black text-[#087E83] uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                <span>2. حساب التاجر وبيانات الدخول المستقلة</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    اسم المستخدم (Username للدخول) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      dir="ltr"
                      value={editingStoreFull.username}
                      onChange={(e) =>
                        setEditingStoreFull({
                          ...editingStoreFull,
                          username: e.target.value.toLowerCase(),
                        })
                      }
                      placeholder="store_lama"
                      className="w-full h-10 pr-3 pl-3 rounded-xl border border-[#E5EAED] text-xs font-mono font-bold text-[#18343B] focus:border-[#087E83] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    كلمة المرور الجديدة (أو اتركها فارغة دون تغيير)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      dir="ltr"
                      value={editingStoreFull.new_password}
                      onChange={(e) =>
                        setEditingStoreFull({
                          ...editingStoreFull,
                          new_password: e.target.value,
                        })
                      }
                      placeholder="•••••••• أو كلمة مرور جديدة"
                      className="flex-1 h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-mono font-bold text-[#18343B] focus:border-[#087E83] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditingStoreFull({
                          ...editingStoreFull,
                          new_password: `CM@${Math.floor(1000 + Math.random() * 9000)}`,
                        })
                      }
                      className="px-2.5 h-10 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-bold shrink-0"
                      title="توليد كلمة مرور عشوائية فورية"
                    >
                      توليد عشوائي
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    اسم صاحب المتجر (المالك)
                  </label>
                  <input
                    type="text"
                    value={editingStoreFull.owner_full_name}
                    onChange={(e) =>
                      setEditingStoreFull({
                        ...editingStoreFull,
                        owner_full_name: e.target.value,
                      })
                    }
                    placeholder="اسم التاجر الرباعي..."
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-semibold text-[#18343B] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    رقم هاتف المتجر / التاجر
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={editingStoreFull.contact_phone}
                    onChange={(e) =>
                      setEditingStoreFull({
                        ...editingStoreFull,
                        contact_phone: e.target.value,
                        owner_phone: e.target.value,
                      })
                    }
                    placeholder="0910000000"
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-bold text-[#18343B] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: STORE LOGO & COVER BANNER */}
            <div className="space-y-3 pt-2 border-t border-[#E5EAED]">
              <h4 className="text-xs font-black text-[#087E83] uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                <span>3. صور المتجر والشعار (مع المعاينة الحية)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Logo Upload */}
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#18343B]">
                      الشعار الدائري للمتجر
                    </span>
                    {editingStoreFull.logo_url && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingStoreFull({ ...editingStoreFull, logo_url: '' })
                        }
                        className="text-[11px] text-rose-600 font-bold hover:underline"
                      >
                        حذف
                      </button>
                    )}
                  </div>
                  <label className="w-full h-9 px-3 rounded-xl bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition">
                    <Camera className="w-3.5 h-3.5" />
                    <span>رفع شعار من الجهاز</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditStoreLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editingStoreFull.logo_url}
                    onChange={(e) =>
                      setEditingStoreFull({
                        ...editingStoreFull,
                        logo_url: e.target.value,
                      })
                    }
                    placeholder="أو ضع رابط صورة الشعار..."
                    className="w-full h-8 px-2.5 rounded-lg border border-[#E5EAED] bg-white text-[11px] font-mono"
                  />
                </div>

                {/* Banner Upload */}
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#18343B]">
                      صورة البانر العريض
                    </span>
                    {editingStoreFull.cover_url && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingStoreFull({ ...editingStoreFull, cover_url: '' })
                        }
                        className="text-[11px] text-rose-600 font-bold hover:underline"
                      >
                        حذف
                      </button>
                    )}
                  </div>
                  <label className="w-full h-9 px-3 rounded-xl bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition">
                    <Camera className="w-3.5 h-3.5" />
                    <span>رفع بانر من الجهاز</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditStoreCoverUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editingStoreFull.cover_url}
                    onChange={(e) =>
                      setEditingStoreFull({
                        ...editingStoreFull,
                        cover_url: e.target.value,
                      })
                    }
                    placeholder="أو ضع رابط صورة البانر..."
                    className="w-full h-8 px-2.5 rounded-lg border border-[#E5EAED] bg-white text-[11px] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: STORE STATUS & CONTROLS */}
            <div className="space-y-3 pt-2 border-t border-[#E5EAED]">
              <h4 className="text-xs font-black text-[#087E83] uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4" />
                <span>4. حالة اعتماد المتجر والظهور</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    حالة اعتماد المتجر
                  </label>
                  <select
                    value={editingStoreFull.status}
                    onChange={(e) =>
                      setEditingStoreFull({
                        ...editingStoreFull,
                        status: e.target.value as Store['status'],
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-bold text-[#18343B] bg-white outline-none"
                  >
                    <option value="active">مفعل ومعتمد (نشط)</option>
                    <option value="pending">قيد المراجعة (بانتظار الموافقة)</option>
                    <option value="suspended">موقوف / معطل</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    حالة استقبال الطلبات
                  </label>
                  <select
                    value={editingStoreFull.visibility_status}
                    onChange={(e) =>
                      setEditingStoreFull({
                        ...editingStoreFull,
                        visibility_status: e.target.value as any,
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-bold text-[#18343B] bg-white outline-none"
                  >
                    <option value="active">يستقبل الطلبات بشكل طبيعي</option>
                    <option value="pause_orders">إيقاف مؤقت للطلبات</option>
                    <option value="closed_temp">مغلق مؤقتاً</option>
                    <option value="hidden">مخفي من القوائم</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    حالة حساب التاجر
                  </label>
                  <select
                    value={editingStoreFull.is_account_active ? 'active' : 'inactive'}
                    onChange={(e) =>
                      setEditingStoreFull({
                        ...editingStoreFull,
                        is_account_active: e.target.value === 'active',
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-bold text-[#18343B] bg-white outline-none"
                  >
                    <option value="active">حساب نشط ومصرح له بالدخول</option>
                    <option value="inactive">حساب معطل وممنوع من الدخول</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-[#E5EAED]">
              <button
                type="button"
                onClick={() => {
                  if (!editingStoreFull.name_ar.trim()) {
                    showToast('يرجى إدخال اسم المتجر', 'error');
                    return;
                  }
                  const res = adminFullUpdateStoreAndMerchant(editingStoreFull);
                  if (res.success) {
                    setEditingStoreFull(null);
                  } else {
                    showToast(res.error || 'تعذر حفظ البيانات', 'error');
                  }
                }}
                className="flex-1 h-12 rounded-full bg-[#087E83] hover:bg-[#06666A] active:scale-98 text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>حفظ التعديلات في قاعدة البيانات فورياً</span>
              </button>

              <button
                type="button"
                onClick={() => setEditingStoreFull(null)}
                className="px-6 h-12 rounded-full bg-[#F8FAFC] border border-[#E5EAED] text-[#74838A] hover:text-[#18343B] text-xs font-bold transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPER ADMIN DIRECT CREATE STORE & MERCHANT ACCOUNT MODAL */}
      {isCreatingStoreModal && (
        <div className="fixed inset-0 z-50 bg-[#18343B]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-xl rounded-[32px] p-5 sm:p-7 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto border border-[#E5EAED] animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E5EAED] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#087E83] text-white flex items-center justify-center">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#18343B]">
                    إنشاء متجر وحساب تاجر جديد
                  </h3>
                  <p className="text-xs text-[#74838A]">
                    إضافة المتجر وتعيين بيانات الدخول الخاصة به مباشرة
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreatingStoreModal(false)}
                className="w-9 h-9 rounded-full bg-[#F8FAFC] hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-[#74838A] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newStoreForm.name_ar.trim() || !newStoreForm.username.trim() || !newStoreForm.password.trim()) {
                  showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
                  return;
                }
                const res = adminDirectCreateStoreAndMerchant(newStoreForm);
                if (res.success) {
                  setIsCreatingStoreModal(false);
                } else {
                  showToast(res.error || 'فشل إنشاء المتجر', 'error');
                }
              }}
              className="space-y-4"
            >
              {/* Store Basic Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    اسم المتجر *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStoreForm.name_ar}
                    onChange={(e) =>
                      setNewStoreForm({
                        ...newStoreForm,
                        name_ar: e.target.value,
                        name_en: e.target.value,
                      })
                    }
                    placeholder="مثال: متجر لاما للقرطاسية"
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-bold text-[#18343B] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    نوع النشاط التجاري *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStoreForm.activity_type_ar}
                    onChange={(e) =>
                      setNewStoreForm({
                        ...newStoreForm,
                        activity_type_ar: e.target.value,
                      })
                    }
                    placeholder="مثال: أدوات طبية / قرطاسية / خدمات"
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-bold text-[#18343B] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    اسم صاحب المتجر (المالك) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStoreForm.owner_full_name}
                    onChange={(e) =>
                      setNewStoreForm({
                        ...newStoreForm,
                        owner_full_name: e.target.value,
                      })
                    }
                    placeholder="اسم التاجر الرباعي..."
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-semibold text-[#18343B] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    required
                    value={newStoreForm.contact_phone}
                    onChange={(e) =>
                      setNewStoreForm({
                        ...newStoreForm,
                        contact_phone: e.target.value,
                      })
                    }
                    placeholder="0910000000"
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-bold text-[#18343B] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    اسم المستخدم (Username للدخول) *
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    required
                    value={newStoreForm.username}
                    onChange={(e) =>
                      setNewStoreForm({
                        ...newStoreForm,
                        username: e.target.value.toLowerCase(),
                      })
                    }
                    placeholder="store_username"
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-mono font-bold text-[#18343B] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    رمز المتجر (Store Code) *
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    required
                    value={newStoreForm.store_code}
                    onChange={(e) =>
                      setNewStoreForm({
                        ...newStoreForm,
                        store_code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="STR-104"
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-mono font-black text-[#087E83] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    كلمة المرور الأولية للتاجر *
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    required
                    value={newStoreForm.password}
                    onChange={(e) =>
                      setNewStoreForm({
                        ...newStoreForm,
                        password: e.target.value,
                      })
                    }
                    placeholder="CM@XXXX"
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-mono font-black text-[#18343B] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    البريد الإلكتروني للتاجر
                  </label>
                  <input
                    type="email"
                    dir="ltr"
                    value={newStoreForm.owner_email}
                    onChange={(e) =>
                      setNewStoreForm({
                        ...newStoreForm,
                        owner_email: e.target.value,
                      })
                    }
                    placeholder="merchant@campusmarket.ly"
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-semibold text-[#18343B] outline-none"
                  />
                </div>
              </div>

              {/* Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] space-y-1.5">
                  <span className="text-[11px] font-bold text-[#18343B] block">شعار المتجر</span>
                  <label className="w-full h-9 rounded-xl bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                    <Camera className="w-3.5 h-3.5" />
                    <span>رفع شعار</span>
                    <input type="file" accept="image/*" onChange={handleNewStoreLogoUpload} className="hidden" />
                  </label>
                </div>

                <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] space-y-1.5">
                  <span className="text-[11px] font-bold text-[#18343B] block">بانر المتجر</span>
                  <label className="w-full h-9 rounded-xl bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                    <Camera className="w-3.5 h-3.5" />
                    <span>رفع بانر</span>
                    <input type="file" accept="image/*" onChange={handleNewStoreCoverUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-[#E5EAED]">
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-full bg-[#087E83] hover:bg-[#06666A] active:scale-98 text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>إنشاء وتفعيل المتجر والحساب فورياً</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCreatingStoreModal(false)}
                  className="px-6 h-12 rounded-full bg-[#F8FAFC] border border-[#E5EAED] text-[#74838A] hover:text-[#18343B] text-xs font-bold transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISSUED MERCHANT CREDENTIALS MODAL */}
      {issuedCredentials && (
        <div className="fixed inset-0 z-50 bg-[#18343B]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 sm:p-7 border border-[#E5EAED] shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shadow-xs">
                  <KeyRound className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#18343B]">
                    بيانات دخول صاحب المتجر
                  </h3>
                  <p className="text-xs text-[#74838A]">
                    {issuedCredentials.storeName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIssuedCredentials(null);
                  setCopiedCreds(false);
                }}
                className="w-8 h-8 rounded-full bg-[#F8FAFC] hover:bg-[#E5EAED] text-[#74838A] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-[#E5EAED] pb-2">
                <span className="text-[#74838A] font-bold">اسم المستخدم (Username):</span>
                <span className="font-black text-[#18343B] font-en text-sm">
                  {issuedCredentials.username}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-[#E5EAED] pb-2">
                <span className="text-[#74838A] font-bold">رمز المتجر الفريد (Store ID):</span>
                <span className="font-black text-[#087E83] font-en text-sm">
                  {issuedCredentials.storeCode}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-[#E5EAED] pb-2">
                <span className="text-[#74838A] font-bold">كلمة المرور المؤقتة:</span>
                <span className="font-black text-rose-600 font-en text-sm bg-rose-50 px-2 py-0.5 rounded-md">
                  {issuedCredentials.tempPassword}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[#74838A] font-bold">صفحة الدخول:</span>
                <span className="font-bold text-[#087E83] font-en text-[11px]">
                  /#/merchant-login
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#74838A] leading-relaxed">
              * سيُطلب من التاجر تغيير كلمة المرور هذه إلى كلمة مرور شخصية عند أول تسجيل دخول له. انسخ هذه البيانات وسلمها لصاحب المتجر.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const clipText = `مرحباً بك في CampusMarket!\nتم اعتماد متجرك (${issuedCredentials.storeName}). إليك بيانات الدخول الخاصة بمتجرك:\n- اسم المستخدم: ${issuedCredentials.username}\n- رمز المتجر: ${issuedCredentials.storeCode}\n- كلمة المرور: ${issuedCredentials.tempPassword}\n\nرابط تسجيل الدخول:\n${issuedCredentials.loginUrl}`;
                  navigator.clipboard.writeText(clipText);
                  setCopiedCreds(true);
                  setTimeout(() => setCopiedCreds(false), 2500);
                }}
                className="flex-1 h-11 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition"
              >
                {copiedCreds ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>تم نسخ البيانات بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ بيانات الدخول للتاجر</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIssuedCredentials(null);
                  setCopiedCreds(false);
                }}
                className="px-5 h-11 rounded-full bg-[#F8FAFC] border border-[#E5EAED] text-xs font-bold text-[#74838A]"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
