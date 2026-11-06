import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Store as StoreIcon,
  Users,
  Package,
  ShoppingBag,
  LayoutGrid,
  Megaphone,
  Tag,
  BarChart3,
  DollarSign,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Copy,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { STATUS_META } from './OrdersPage';
import { OrderStatus } from '../types/database';

type AdminTab =
  | 'analytics'
  | 'stores'
  | 'products'
  | 'orders'
  | 'users'
  | 'categories'
  | 'banners'
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
    getSpecialOfferProducts,
    adminUpdatePlatformSettings,
    adminCreateStoreInvitation,
    adminCreateOrUpdateStore,
    adminChangeStoreStatus,
    adminToggleProductVisibility,
    adminSaveCategory,
    adminDeleteCategory,
    adminSaveBanner,
    adminDeleteBanner,
    adminToggleUserStatus,
    adminModerateReview,
    adminPurgeDemoData,
    adminRestoreDemoData,
    updateOrderStatus,
    showToast,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');

  // Invitation Form State
  const [invEmail, setInvEmail] = useState('');
  const [invStoreName, setInvStoreName] = useState('');
  const [invCatId, setInvCatId] = useState('cat-services');

  // Store Form State
  const [newStoreNameEn, setNewStoreNameEn] = useState('');
  const [newStoreActivity, setNewStoreActivity] = useState('');
  const [newStoreCat, setNewStoreCat] = useState('cat-food');

  // Category Form State
  const [catNameAr, setCatNameAr] = useState('');
  const [catIcon, setCatIcon] = useState('BookOpen');

  // Banner Form State
  const [banTitle, setBanTitle] = useState('');
  const [banSubtitle, setBanSubtitle] = useState('');
  const [banCta, setBanCta] = useState('تسوق الآن');
  const [banImg, setBanImg] = useState(
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80'
  );

  // Filters
  const [prodSearch, setProdSearch] = useState('');
  const [prodStoreFilter, setProdStoreFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const isAdmin =
    currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

  // Platform-wide real metrics
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

    // Most active stores by completed order count
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

  const activeSpecialOffers = useMemo(
    () => getSpecialOfferProducts(),
    [getSpecialOfferProducts]
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F7FC] pb-24 px-4 pt-10">
        <div className="max-w-lg mx-auto bg-white rounded-3xl p-6 border border-slate-100 shadow-card text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-brand-300 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-base font-extrabold text-slate-900">
            هذه اللوحة مخصصة لإدارة المنصة فقط (Admin RBAC Guard)
          </h1>
          <p className="text-xs text-slate-500">
            أنت مسجل حالياً بحساب ({currentUser?.full_name || 'زائر'}). اضغط بالأسفل
            للتبديل الفوري إلى حساب المدير العام (Super Admin) لاختبار لوحة الإدارة:
          </p>
          <button
            type="button"
            onClick={() => switchQuickAccount('user-super-admin')}
            className="w-full h-11 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold shadow-sm"
          >
            التبديل إلى حساب إدارة المنصة (Super Admin)
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs font-bold text-slate-500 hover:underline block mx-auto"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FC] pb-28">
      {/* Top Executive Admin Bar */}
      <header className="sticky top-0 z-30 bg-[#0F111A] text-white border-b border-white/10 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
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
                <span className="text-[10px] font-extrabold bg-brand-600 px-2.5 py-0.5 rounded-full">
                  SUPER ADMIN
                </span>
                <h1 className="text-sm sm:text-base font-extrabold">
                  لوحة الإدارة المركزية — CampusMarket
                </h1>
              </div>
              <p className="text-[11px] text-slate-400">
                تحكم كامل في المتاجر، دعوات التجار، المنتجات، الطلبات، الإعلانات، والعمولات
              </p>
            </div>
          </div>

          {/* Demo Data Management Controls (Requirement 24) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={adminPurgeDemoData}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-200 text-[11px] font-bold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف البيانات التجريبية</span>
            </button>
            <button
              type="button"
              onClick={adminRestoreDemoData}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>استعادة البيانات التجريبية</span>
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-white/10">
          {(
            [
              { id: 'analytics', label: 'التقارير والإحصائيات', icon: BarChart3 },
              { id: 'stores', label: `المتاجر والدعوات (${stores.length})`, icon: StoreIcon },
              { id: 'products', label: `المنتجات والعروض (${products.length})`, icon: Package },
              { id: 'orders', label: `الطلبات (${orders.length})`, icon: ShoppingBag },
              { id: 'categories', label: 'الأقسام والتصنيفات', icon: LayoutGrid },
              { id: 'banners', label: 'الإعلانات والبانرات', icon: Megaphone },
              { id: 'users', label: `المستخدمون (${users.length})`, icon: Users },
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
                className={`px-3.5 py-3 text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap border-b-2 transition ${
                  active
                    ? 'border-brand-400 text-white bg-white/5'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-5 space-y-5">
        {/* TAB 1: ANALYTICS & REPORTS */}
        {activeTab === 'analytics' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card">
                <span className="text-[11px] font-bold text-slate-400">
                  إجمالي المبيعات المكتملة
                </span>
                <p className="text-xl font-extrabold text-brand-700 mt-1">
                  {platformStats.totalSalesLyd} د.ل
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card">
                <span className="text-[11px] font-bold text-slate-400">
                  إيرادات العمولات المحصلة
                </span>
                <p className="text-xl font-extrabold text-emerald-600 mt-1">
                  {platformStats.totalCommissionsLyd} د.ل
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card">
                <span className="text-[11px] font-bold text-slate-400">
                  إيرادات اشتراكات المتاجر
                </span>
                <p className="text-xl font-extrabold text-indigo-600 mt-1">
                  {platformStats.totalSubscriptionsLyd} د.ل
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card">
                <span className="text-[11px] font-bold text-slate-400">
                  المتاجر النشطة / الطلبات
                </span>
                <p className="text-xl font-extrabold text-slate-900 mt-1">
                  {platformStats.activeStoresCount} متجر • {platformStats.ordersCount} طلب
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Most Active Stores */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card space-y-3">
                <h2 className="text-sm font-extrabold text-slate-800">
                  أكثر المتاجر نشاطاً ومبيعاً
                </h2>
                {platformStats.mostActiveStores.length === 0 ? (
                  <p className="text-xs text-slate-400">لا توجد طلبات مكتملة بعد.</p>
                ) : (
                  <div className="space-y-2">
                    {platformStats.mostActiveStores.map((st, idx) => (
                      <div
                        key={st.storeName}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs"
                      >
                        <span className="font-en font-extrabold text-slate-800">
                          {idx + 1}. {st.storeName}
                        </span>
                        <span className="font-extrabold text-brand-700">
                          {st.salesLyd} د.ل ({st.ordersCount} طلب مكتمل)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Most Ordered Products Platform-wide */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card space-y-3">
                <h2 className="text-sm font-extrabold text-slate-800">
                  أكثر المنتجات طلباً على مستوى المنصة
                </h2>
                {mostOrderedPlatform.length === 0 ? (
                  <p className="text-xs text-slate-400">لا توجد بيانات مبيعات بعد.</p>
                ) : (
                  <div className="space-y-2">
                    {mostOrderedPlatform.map((m, idx) => (
                      <div
                        key={m.product.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs"
                      >
                        <span className="font-bold text-slate-800">
                          {idx + 1}. {m.product.name_ar}
                        </span>
                        <span className="font-extrabold text-brand-700">
                          {m.unitsSold} وحدة مباعة
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card space-y-3">
              <h2 className="text-sm font-extrabold text-slate-800">
                سجل العمليات الإدارية والأمان (Audit Logs)
              </h2>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs"
                  >
                    <div>
                      <span className="font-extrabold text-brand-700">
                        [{log.action}]
                      </span>{' '}
                      <span className="text-slate-700">{log.details}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.created_at).toLocaleString('ar-LY')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STORES & MERCHANT INVITATIONS */}
        {activeTab === 'stores' && (
          <div className="space-y-5">
            {/* Merchant Invitation Generator */}
            <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card space-y-3">
              <div className="flex items-center gap-2 text-brand-700">
                <KeyRound className="w-4 h-4" />
                <h2 className="text-sm font-extrabold">
                  إنشاء رابط / رمز دعوة خاص لصاحب متجر جديد
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <input
                  type="text"
                  value={invStoreName}
                  onChange={(e) => setInvStoreName(e.target.value)}
                  placeholder="اسم المتجر المقترح..."
                  className="h-10 px-3 rounded-xl border border-slate-200 text-xs"
                />
                <input
                  type="email"
                  value={invEmail}
                  onChange={(e) => setInvEmail(e.target.value)}
                  placeholder="البريد الإلكتروني للتاجر..."
                  className="h-10 px-3 rounded-xl border border-slate-200 text-xs"
                />
                <select
                  value={invCatId}
                  onChange={(e) => setInvCatId(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  {categories
                    .filter((c) => c.id !== 'cat-all')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name_ar}
                      </option>
                    ))}
                </select>
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
                  className="h-10 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold"
                >
                  توليد رمز دعوة تاجر
                </button>
              </div>

              {/* Active Invitations List */}
              <div className="space-y-2 pt-2">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-brand-50/50 border border-brand-100 text-xs"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        dir="ltr"
                        className="font-en font-extrabold bg-white px-2.5 py-1 rounded-lg border border-brand-200 text-brand-800"
                      >
                        {inv.token}
                      </span>
                      <span className="font-bold text-slate-800">
                        {inv.proposed_store_name} ({inv.invited_email})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          inv.is_used
                            ? 'bg-slate-200 text-slate-600'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {inv.is_used ? 'تم الاستخدام' : 'متاح للتسجيل'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(inv.token);
                          }
                          showToast(`تم نسخ رمز الدعوة: ${inv.token}`, 'info');
                        }}
                        className="p-1.5 rounded-lg bg-white text-slate-600 hover:text-brand-600"
                        title="نسخ رمز الدعوة"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Direct Add Store by Admin */}
            <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card space-y-3">
              <h2 className="text-sm font-extrabold text-slate-800">
                إضافة متجر مباشرة من الإدارة
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <input
                  type="text"
                  value={newStoreNameEn}
                  onChange={(e) => setNewStoreNameEn(e.target.value)}
                  placeholder="اسم المتجر (مثال: TechLab)"
                  className="h-10 px-3 rounded-xl border border-slate-200 text-xs"
                />
                <input
                  type="text"
                  value={newStoreActivity}
                  onChange={(e) => setNewStoreActivity(e.target.value)}
                  placeholder="نوع النشاط (مثال: إلكترونيات وصيانة)"
                  className="h-10 px-3 rounded-xl border border-slate-200 text-xs"
                />
                <select
                  value={newStoreCat}
                  onChange={(e) => setNewStoreCat(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  {categories
                    .filter((c) => c.id !== 'cat-all')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name_ar}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (!newStoreNameEn || !newStoreActivity) return;
                    adminCreateOrUpdateStore({
                      name_en: newStoreNameEn,
                      name_ar: newStoreNameEn,
                      activity_type_ar: newStoreActivity,
                      category_id: newStoreCat,
                      status: 'active',
                    });
                    setNewStoreNameEn('');
                    setNewStoreActivity('');
                  }}
                  className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold"
                >
                  + اعتماد وإضافة المتجر
                </button>
              </div>
            </section>

            {/* All Stores Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stores.map((st) => (
                <div
                  key={st.id}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={st.logo_url}
                      alt={st.name_en}
                      className="w-14 h-14 rounded-2xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-en text-sm font-extrabold text-slate-900">
                          {st.name_en}
                        </h3>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            st.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {st.status === 'active' ? 'معتمد ونشط' : 'موقوف'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{st.activity_type_ar}</p>
                      <p className="text-[11px] text-slate-400">
                        {st.location_inside_campus}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {st.status === 'active' ? (
                      <button
                        type="button"
                        onClick={() => adminChangeStoreStatus(st.id, 'suspended')}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold"
                      >
                        تعطيل
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => adminChangeStoreStatus(st.id, 'active')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                      >
                        تفعيل واعتماد
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTS & OFFERS MODERATION */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card flex items-center gap-3 flex-wrap">
              <input
                type="text"
                value={prodSearch}
                onChange={(e) => setProdSearch(e.target.value)}
                placeholder="ابحث عن منتج..."
                className="flex-1 min-w-[200px] h-10 px-3 rounded-xl border border-slate-200 text-xs"
              />
              <select
                value={prodStoreFilter}
                onChange={(e) => setProdStoreFilter(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="all">جميع المتاجر</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_en}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {products
                .filter(
                  (p) =>
                    (prodStoreFilter === 'all' || p.store_id === prodStoreFilter) &&
                    (!prodSearch ||
                      p.name_ar.toLowerCase().includes(prodSearch.toLowerCase()))
                )
                .map((prod) => {
                  const st = stores.find((s) => s.id === prod.store_id);
                  return (
                    <div
                      key={prod.id}
                      className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-card flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={prod.images[0]}
                          alt={prod.name_ar}
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                        <div className="min-w-0">
                          <h3 className="text-xs font-extrabold text-slate-900 truncate">
                            {prod.name_ar}
                          </h3>
                          <p className="text-[11px] font-bold text-brand-600">
                            متجر: {st?.name_en} • السعر: {prod.price_lyd} د.ل
                          </p>
                          <p className="text-[11px] text-slate-400">
                            المخزون: {prod.stock_quantity}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          adminToggleProductVisibility(prod.id, !prod.is_active)
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 ${
                          prod.is_active
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {prod.is_active ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>إخفاء مخالف</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>إظهار</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 4: ALL PLATFORM ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card flex items-center gap-3 flex-wrap">
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="ابحث برقم الطلب (مثال: CM-2605) أو اسم الطالب..."
                className="flex-1 min-w-[200px] h-10 px-3 rounded-xl border border-slate-200 text-xs"
              />
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="all">جميع الحالات</option>
                {Object.entries(STATUS_META).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

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
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card flex items-center justify-between flex-wrap gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          dir="ltr"
                          className="font-en text-xs font-extrabold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md"
                        >
                          #{ord.order_number}
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">
                          {ord.customer_name_ar} ← متجر {ord.store_name_snapshot}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        الإجمالي: {ord.total_lyd} د.ل • عمولة المنصة:{' '}
                        {ord.platform_commission_lyd} د.ل
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={ord.status}
                        onChange={(e) =>
                          updateOrderStatus(
                            ord.id,
                            e.target.value as OrderStatus,
                            'تحديث إداري من لوحة الإدارة'
                          )
                        }
                        className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
                      >
                        {Object.entries(STATUS_META).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 5: CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card flex items-center gap-2.5 flex-wrap">
              <input
                type="text"
                value={catNameAr}
                onChange={(e) => setCatNameAr(e.target.value)}
                placeholder="اسم القسم الجديد (مثال: أدوات طب الأسنان)..."
                className="flex-1 min-w-[200px] h-10 px-3 rounded-xl border border-slate-200 text-xs"
              />
              <select
                value={catIcon}
                onChange={(e) => setCatIcon(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="BookOpen">أيقونة كتاب</option>
                <option value="Settings">أيقونة خدمات</option>
                <option value="Gamepad2">أيقونة إلكترونيات</option>
                <option value="Shirt">أيقونة ملابس</option>
                <option value="Utensils">أيقونة مأكولات</option>
                <option value="Watch">أيقونة إكسسوارات</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  if (!catNameAr.trim()) return;
                  adminSaveCategory({
                    name_ar: catNameAr.trim(),
                    name_en: catNameAr.trim(),
                    icon_name: catIcon,
                  });
                  setCatNameAr('');
                }}
                className="h-10 px-4 rounded-xl bg-brand-600 text-white text-xs font-extrabold"
              >
                + إضافة قسم رئيسي
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-card flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">
                      {cat.name_ar}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      الترتيب: {cat.sort_order}
                    </p>
                  </div>
                  {cat.id !== 'cat-all' && (
                    <button
                      type="button"
                      onClick={() => adminDeleteCategory(cat.id)}
                      className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: BANNERS & ADS MANAGEMENT */}
        {activeTab === 'banners' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card space-y-3">
              <h2 className="text-sm font-extrabold text-slate-800">
                إضافة بانر إعلاني جديد للصفحة الرئيسية
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={banTitle}
                  onChange={(e) => setBanTitle(e.target.value)}
                  placeholder="العنوان الرئيسي للبانر..."
                  className="h-10 px-3 rounded-xl border border-slate-200 text-xs"
                />
                <input
                  type="text"
                  value={banSubtitle}
                  onChange={(e) => setBanSubtitle(e.target.value)}
                  placeholder="الوصف المختصر (مثال: قرطاسية • طباعة • إكسسوارات)..."
                  className="h-10 px-3 rounded-xl border border-slate-200 text-xs"
                />
                <input
                  type="text"
                  value={banCta}
                  onChange={(e) => setBanCta(e.target.value)}
                  placeholder="نص الزر (تسوق الآن)..."
                  className="h-10 px-3 rounded-xl border border-slate-200 text-xs"
                />
                <input
                  type="url"
                  dir="ltr"
                  value={banImg}
                  onChange={(e) => setBanImg(e.target.value)}
                  placeholder="رابط الصورة..."
                  className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-en"
                />
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
                className="h-10 px-5 rounded-xl bg-brand-600 text-white text-xs font-extrabold"
              >
                + نشر البانر الإعلاني
              </button>
            </div>

            <div className="space-y-3">
              {banners.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-card flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={b.image_url}
                      alt={b.title_ar}
                      className="w-16 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-900">
                        {b.title_ar}
                      </h3>
                      <p className="text-[11px] text-slate-500">{b.subtitle_ar}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        adminSaveBanner({ id: b.id, is_active: !b.is_active })
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                        b.is_active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {b.is_active ? 'نشط' : 'مخفي'}
                    </button>
                    <button
                      type="button"
                      onClick={() => adminDeleteBanner(b.id)}
                      className="p-2 rounded-xl bg-rose-50 text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: USERS & REVIEWS MODERATION */}
        {activeTab === 'users' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card space-y-3">
              <h2 className="text-sm font-extrabold text-slate-800">
                إدارة حسابات المستخدمين والأدوار
              </h2>
              <div className="space-y-2">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex-wrap gap-2"
                  >
                    <div>
                      <span className="font-extrabold text-slate-900">
                        {u.full_name}
                      </span>{' '}
                      <span className="text-slate-400">({u.email})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 font-extrabold">
                        {u.role}
                      </span>
                      {u.id !== currentUser?.id && (
                        <button
                          type="button"
                          onClick={() =>
                            adminToggleUserStatus(u.id, !u.is_active)
                          }
                          className={`px-3 py-1 rounded-lg font-bold ${
                            u.is_active
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {u.is_active ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Moderation */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card space-y-3">
              <h2 className="text-sm font-extrabold text-slate-800">
                مراجعة التقييمات والتعليقات ({reviews.length})
              </h2>
              <div className="space-y-2">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs"
                  >
                    <div>
                      <span className="font-extrabold text-slate-800">
                        {rev.user_name_ar} ({rev.rating}★):
                      </span>{' '}
                      <span className="text-slate-600">{rev.comment}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        adminModerateReview(rev.id, !rev.is_approved)
                      }
                      className={`px-3 py-1 rounded-lg font-bold ${
                        rev.is_approved
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {rev.is_approved ? 'إخفاء التعليق' : 'اعتماد التعليق'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: CONFIGURABLE FINANCIAL SETTINGS (Requirement 13) */}
        {activeTab === 'finance' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card max-w-2xl space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2.5">
              إعدادات نموذج الإيرادات والعمولات والاشتراكات
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
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
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold bg-white"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
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
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-extrabold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
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
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-extrabold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
