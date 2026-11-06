import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
    return (
      <div className="py-10 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-3xl p-6 border border-[#E5EAED] shadow-card text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#EAF3F4] text-[#087E83] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-base font-extrabold text-[#18343B]">
            لوحة تحكم إدارة المنصة — CampusMarket
          </h1>
          <p className="text-xs text-[#74838A]">
            اضغط بالأسفل للدخول إلى لوحة الإدارة المركزية وإدارة المتاجر وصورها والمنتجات والبانر الرئيسي:
          </p>
          <button
            type="button"
            onClick={() => switchQuickAccount('user-super-admin')}
            className="w-full h-11 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-extrabold shadow-xs"
          >
            الدخول كمدير المنصة (Admin)
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs font-bold text-[#74838A] hover:underline block mx-auto"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
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
            onClick={() =>
              setEditingStore({
                name_ar: '',
                name_en: '',
                activity_type_ar: '',
                description_ar: '',
                location_inside_campus: 'داخل الكلية',
                contact_phone: '',
                logo_url: '',
                cover_url: '',
                status: 'active',
                is_open: true,
              })
            }
            className="px-4 py-2 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة متجر جديد</span>
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

            {/* All Stores List (Pending & Active & Suspended) */}
            {stores.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center space-y-3 border border-[#E5EAED] shadow-card">
                <StoreIcon className="w-10 h-10 text-[#087E83] mx-auto stroke-[1.7]" />
                <p className="text-sm font-extrabold text-[#18343B]">
                  لا توجد متاجر مسجلة حالياً
                </p>
                <p className="text-xs text-[#74838A]">
                  اضغط على زر "إضافة متجر جديد" في الأعلى لإضافة متجر مع صورته المصغرة وبانره الخاص.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {stores.map((st) => (
                  <div
                    key={st.id}
                    className="bg-white rounded-3xl p-4 border border-[#E5EAED] shadow-card space-y-3"
                  >
                    {/* Live Store Card Preview */}
                    <StoreCard store={st} />

                    {/* Admin Controls for this Store */}
                    <div className="pt-2 border-t border-[#E5EAED] flex items-center justify-between flex-wrap gap-2">
                      <span
                        className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                          st.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : st.status === 'pending'
                            ? 'bg-[#FDF8E7] text-[#18343B] border border-[#F3C95B]'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {st.status === 'active'
                          ? 'معتمد ويظهر في الرئيسية'
                          : st.status === 'pending'
                          ? 'طلب اشتراك جديد (بانتظار الموافقة)'
                          : 'موقوف / مرفوض'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {st.status !== 'active' && (
                          <button
                            type="button"
                            onClick={() => adminChangeStoreStatus(st.id, 'active')}
                            className="px-3.5 py-1.5 rounded-full bg-[#087E83] text-white text-xs font-extrabold flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>قبول واعتماد</span>
                          </button>
                        )}

                        {st.status === 'active' && (
                          <button
                            type="button"
                            onClick={() => adminChangeStoreStatus(st.id, 'suspended')}
                            className="px-3 py-1.5 rounded-full bg-[#F8FAFC] border border-[#E5EAED] text-[#74838A] text-xs font-bold flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>إيقاف</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setEditingStore(st)}
                          className="p-2 rounded-full bg-[#EAF3F4] text-[#087E83]"
                          title="تعديل بيانات وصور المتجر"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => adminDeleteStore(st.id)}
                          className="p-2 rounded-full bg-rose-50 text-rose-600"
                          title="حذف المتجر نهائياً"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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

      {/* ADD / EDIT STORE MODAL (With Thumbnail, Wide Banner Upload & Live Preview) */}
      {editingStore && (
        <div className="fixed inset-0 z-50 bg-[#18343B]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 space-y-4 shadow-xl max-h-[92vh] overflow-y-auto border border-[#E5EAED]">
            <div className="flex items-center justify-between border-b border-[#E5EAED] pb-3">
              <h3 className="text-base font-extrabold text-[#18343B]">
                {editingStore.id ? 'تعديل بيانات وصور المتجر' : 'إضافة متجر جديد إلى المنصة'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingStore(null)}
                className="w-8 h-8 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#74838A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Store Card Preview */}
            <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E5EAED] space-y-2">
              <span className="text-[11px] font-extrabold text-[#087E83] block">
                معاينة بطاقة المتجر في الصفحة الرئيسية:
              </span>
              <StoreCard
                previewMode
                store={{
                  id: editingStore.id || 'preview',
                  owner_id: editingStore.owner_id || 'user-super-admin',
                  name_ar: editingStore.name_ar || 'اسم المتجر',
                  name_en: editingStore.name_en || editingStore.name_ar || 'اسم المتجر',
                  slug: 'preview',
                  activity_type_ar: editingStore.activity_type_ar || 'نشاط المتجر',
                  description_ar: editingStore.description_ar || '',
                  category_id: 'cat-services',
                  logo_url: editingStore.logo_url || '',
                  cover_url: editingStore.cover_url || '',
                  icon_bg_color: '#087E83',
                  icon_type: 'sparkles',
                  location_inside_campus:
                    editingStore.location_inside_campus || 'داخل الكلية',
                  is_open: editingStore.is_open ?? true,
                  supports_pickup: true,
                  supports_delivery: true,
                  delivery_fee_lyd: 3,
                  contact_phone: editingStore.contact_phone || '',
                  status: 'active',
                  is_demo: false,
                  created_at: new Date().toISOString(),
                }}
              />
            </div>

            {/* Thumbnail & Banner Uploads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#18343B]">
                    صورة المتجر المصغرة
                  </span>
                  {editingStore.logo_url && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingStore({ ...editingStore, logo_url: '' })
                      }
                      className="text-[11px] text-rose-600 font-bold"
                    >
                      حذف
                    </button>
                  )}
                </div>
                <label className="w-full h-9 px-3 rounded-xl bg-[#087E83] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع صورة مصغرة</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleStoreLogoUpload}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={editingStore.logo_url || ''}
                  onChange={(e) =>
                    setEditingStore({ ...editingStore, logo_url: e.target.value })
                  }
                  placeholder="أو رابط الصورة المصغرة..."
                  className="w-full h-8 px-2.5 rounded-lg border border-[#E5EAED] bg-white text-[11px] font-en"
                />
              </div>

              <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#18343B]">
                    صورة بانر المتجر
                  </span>
                  {editingStore.cover_url && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingStore({ ...editingStore, cover_url: '' })
                      }
                      className="text-[11px] text-rose-600 font-bold"
                    >
                      حذف
                    </button>
                  )}
                </div>
                <label className="w-full h-9 px-3 rounded-xl bg-[#087E83] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع بانر المتجر</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleStoreCoverUpload}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={editingStore.cover_url || ''}
                  onChange={(e) =>
                    setEditingStore({ ...editingStore, cover_url: e.target.value })
                  }
                  placeholder="أو رابط بانر المتجر..."
                  className="w-full h-8 px-2.5 rounded-lg border border-[#E5EAED] bg-white text-[11px] font-en"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#18343B] mb-1">
                  اسم المتجر *
                </label>
                <input
                  type="text"
                  value={editingStore.name_ar || ''}
                  onChange={(e) =>
                    setEditingStore({
                      ...editingStore,
                      name_ar: e.target.value,
                      name_en: e.target.value,
                    })
                  }
                  placeholder="اسم المتجر..."
                  className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#18343B] mb-1">
                  نوع النشاط *
                </label>
                <input
                  type="text"
                  value={editingStore.activity_type_ar || ''}
                  onChange={(e) =>
                    setEditingStore({
                      ...editingStore,
                      activity_type_ar: e.target.value,
                    })
                  }
                  placeholder="مثال: مأكولات ومشروبات / مكتبة وقرطاسية"
                  className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#18343B] mb-1">
                  وصف المتجر
                </label>
                <input
                  type="text"
                  value={editingStore.description_ar || ''}
                  onChange={(e) =>
                    setEditingStore({
                      ...editingStore,
                      description_ar: e.target.value,
                    })
                  }
                  placeholder="وصف مختصر للمتجر..."
                  className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#18343B] mb-1">
                  موقع المتجر داخل الجامعة
                </label>
                <input
                  type="text"
                  value={editingStore.location_inside_campus || ''}
                  onChange={(e) =>
                    setEditingStore({
                      ...editingStore,
                      location_inside_campus: e.target.value,
                    })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!editingStore.name_ar?.trim()) return;
                  adminCreateOrUpdateStore(editingStore);
                  setEditingStore(null);
                }}
                className="flex-1 h-11 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs sm:text-sm font-extrabold"
              >
                حفظ بيانات المتجر
              </button>
              <button
                type="button"
                onClick={() => setEditingStore(null)}
                className="px-6 h-11 rounded-full bg-[#F8FAFC] border border-[#E5EAED] text-[#74838A] text-xs font-bold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
