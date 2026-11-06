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
  BarChart3,
  DollarSign,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
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
    adminUpdatePlatformSettings,
    adminCreateStoreInvitation,
    adminCreateOrUpdateStore,
    adminChangeStoreStatus,
    adminToggleProductVisibility,
    saveMerchantProduct,
    deleteMerchantProduct,
    adminSaveCategory,
    adminDeleteCategory,
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
  const [invCatId, setInvCatId] = useState('cat-services');

  // Store Form State
  const [newStoreNameEn, setNewStoreNameEn] = useState('');
  const [newStoreActivity, setNewStoreActivity] = useState('');
  const [newStoreCat, setNewStoreCat] = useState('cat-services');

  // Direct Add Product / Service State
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('15');
  const [newProdOldPrice, setNewProdOldPrice] = useState('');
  const [newProdStoreId, setNewProdStoreId] = useState('');
  const [newProdCatId, setNewProdCatId] = useState('cat-services');
  const [newProdImage, setNewProdImage] = useState(
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80'
  );
  const [newProdDesc, setNewProdDesc] = useState('');

  // Category Form State
  const [catNameAr, setCatNameAr] = useState('');
  const [catIcon, setCatIcon] = useState('BookOpen');

  // Banner Form State
  const [banTitle, setBanTitle] = useState('');
  const [banSubtitle, setBanSubtitle] = useState('');
  const [banCta, setBanCta] = useState('تسوق الآن');
  const [banImg, setBanImg] = useState('/campus-market/banner-campus-hero.png');

  // Filters
  const [prodSearch, setProdSearch] = useState('');
  const [prodStoreFilter, setProdStoreFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const isAdmin =
    currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

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
            اضغط بالأسفل للدخول إلى لوحة الإدارة المركزية وإدارة المتاجر والمنتجات والخدمات والأقسام والبانرات:
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
                  لوحة التحكم
                </span>
                <h1 className="text-sm sm:text-base font-extrabold">
                  إدارة منصة CampusMarket
                </h1>
              </div>
              <p className="text-[11px] text-[#B9DDE0] mt-0.5">
                إدارة المتاجر • المنتجات والخدمات • الأقسام • البانرات والعروض • الطلبات
              </p>
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="mt-4 pt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-white/10">
          {(
            [
              { id: 'stores', label: `المتاجر (${stores.length})`, icon: StoreIcon },
              {
                id: 'products',
                label: `المنتجات والخدمات والعروض (${products.length})`,
                icon: Package,
              },
              { id: 'categories', label: 'الأقسام', icon: LayoutGrid },
              { id: 'banners', label: 'البانرات والإعلانات', icon: Megaphone },
              { id: 'orders', label: `الطلبات (${orders.length})`, icon: ShoppingBag },
              { id: 'analytics', label: 'الإحصائيات', icon: BarChart3 },
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
        {/* TAB: STORES & MERCHANT INVITATIONS */}
        {activeTab === 'stores' && (
          <div className="space-y-5">
            {/* Direct Add Store by Admin */}
            <section className="bg-white rounded-3xl p-5 border border-[#E5EAED] shadow-card space-y-3">
              <h2 className="text-sm font-extrabold text-[#18343B]">
                إضافة متجر جديد مباشرة إلى المنصة
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <input
                  type="text"
                  value={newStoreNameEn}
                  onChange={(e) => setNewStoreNameEn(e.target.value)}
                  placeholder="اسم المتجر..."
                  className="h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                />
                <input
                  type="text"
                  value={newStoreActivity}
                  onChange={(e) => setNewStoreActivity(e.target.value)}
                  placeholder="نوع النشاط..."
                  className="h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                />
                <select
                  value={newStoreCat}
                  onChange={(e) => setNewStoreCat(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-[#E5EAED] text-xs bg-white"
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
                  className="h-10 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-extrabold"
                >
                  + إضافة المتجر
                </button>
              </div>
            </section>

            {/* Merchant Invitation Generator */}
            <section className="bg-white rounded-3xl p-5 border border-[#E5EAED] shadow-card space-y-3">
              <div className="flex items-center gap-2 text-[#087E83]">
                <KeyRound className="w-4 h-4" />
                <h2 className="text-sm font-extrabold">
                  إنشاء رمز دعوة لصاحب متجر طالب
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
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
                <select
                  value={invCatId}
                  onChange={(e) => setInvCatId(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-[#E5EAED] text-xs bg-white"
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

            {/* All Stores List */}
            {stores.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center text-xs text-[#74838A] border border-[#E5EAED]">
                لا توجد متاجر مضافة حالياً. أضف أول متجر من النموذج أعلاه ليظهر فوراً في المنصة.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stores.map((st) => (
                  <div
                    key={st.id}
                    className="bg-white rounded-2xl p-4 border border-[#E5EAED] shadow-card flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={st.logo_url}
                        alt={st.name_en}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0 bg-[#F8FAFC]"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-[#18343B]">
                            {st.name_ar || st.name_en}
                          </h3>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              st.status === 'active'
                                ? 'bg-[#EAF3F4] text-[#087E83]'
                                : 'bg-[#F8FAFC] text-[#74838A]'
                            }`}
                          >
                            {st.status === 'active' ? 'معتمد ونشط' : 'موقوف'}
                          </span>
                        </div>
                        <p className="text-xs text-[#74838A]">{st.activity_type_ar}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {st.status === 'active' ? (
                        <button
                          type="button"
                          onClick={() => adminChangeStoreStatus(st.id, 'suspended')}
                          className="px-3 py-1.5 rounded-full bg-[#F8FAFC] border border-[#E5EAED] text-[#74838A] text-xs font-bold"
                        >
                          إيقاف مؤقت
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => adminChangeStoreStatus(st.id, 'active')}
                          className="px-3 py-1.5 rounded-full bg-[#087E83] text-white text-xs font-bold"
                        >
                          تفعيل
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: PRODUCTS, SERVICES & OFFERS */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Direct Add Product or Service from Admin */}
            <section className="bg-white rounded-3xl p-5 border border-[#E5EAED] shadow-card space-y-3">
              <h2 className="text-sm font-extrabold text-[#18343B]">
                إضافة منتج أو خدمة أو عرض خاص مباشرة
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
                  <select
                    value={newProdCatId}
                    onChange={(e) => setNewProdCatId(e.target.value)}
                    className="h-10 px-3 rounded-xl border border-[#E5EAED] text-xs bg-white"
                  >
                    {categories
                      .filter((c) => c.id !== 'cat-all')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          القسم: {c.name_ar}
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
                  <input
                    type="number"
                    min={0}
                    value={newProdOldPrice}
                    onChange={(e) => setNewProdOldPrice(e.target.value)}
                    placeholder="السعر قبل الخصم (اختياري للعروض)..."
                    className="h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                  />
                  <input
                    type="url"
                    dir="ltr"
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    placeholder="رابط الصورة..."
                    className="h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-en"
                  />
                  <input
                    type="text"
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    placeholder="وصف مختصر للمنتج أو الخدمة..."
                    className="sm:col-span-2 h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
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
                          newProdDesc.trim() || 'منتج / خدمة متوفرة داخل الكلية.',
                        price_lyd: Number(newProdPrice) || 10,
                        old_price_lyd: newProdOldPrice
                          ? Number(newProdOldPrice)
                          : undefined,
                        category_id: newProdCatId,
                        images: [newProdImage],
                        stock_quantity: 50,
                        is_active: true,
                        is_available_for_sale: true,
                      });
                      setNewProdName('');
                      setNewProdDesc('');
                      setNewProdOldPrice('');
                    }}
                    className="h-10 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-extrabold flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة العنصر للمنصة</span>
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

        {/* TAB: CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-4 border border-[#E5EAED] shadow-card flex items-center gap-2.5 flex-wrap">
              <input
                type="text"
                value={catNameAr}
                onChange={(e) => setCatNameAr(e.target.value)}
                placeholder="اسم القسم الجديد..."
                className="flex-1 min-w-[200px] h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
              />
              <select
                value={catIcon}
                onChange={(e) => setCatIcon(e.target.value)}
                className="h-10 px-3 rounded-xl border border-[#E5EAED] text-xs bg-white"
              >
                <option value="BookOpen">مستلزمات دراسية</option>
                <option value="Settings">خدمات</option>
                <option value="Gamepad2">إلكترونيات</option>
                <option value="Shirt">ملابس</option>
                <option value="Utensils">مأكولات ومشروبات</option>
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
                className="h-10 px-5 rounded-full bg-[#087E83] text-white text-xs font-extrabold"
              >
                + إضافة قسم
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl p-3.5 border border-[#E5EAED] shadow-card flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-extrabold text-[#18343B]">
                      {cat.name_ar}
                    </p>
                    <p className="text-[10px] text-[#74838A]">
                      الترتيب: {cat.sort_order}
                    </p>
                  </div>
                  {cat.id !== 'cat-all' && (
                    <button
                      type="button"
                      onClick={() => adminDeleteCategory(cat.id)}
                      className="p-2 rounded-lg bg-[#F8FAFC] text-[#74838A] hover:text-[#18343B]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: BANNERS MANAGEMENT */}
        {activeTab === 'banners' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-[#E5EAED] shadow-card space-y-3">
              <h2 className="text-sm font-extrabold text-[#18343B]">
                إضافة بانر إعلاني جديد للصفحة الرئيسية
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={banTitle}
                  onChange={(e) => setBanTitle(e.target.value)}
                  placeholder="العنوان الرئيسي للبانر..."
                  className="h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                />
                <input
                  type="text"
                  value={banSubtitle}
                  onChange={(e) => setBanSubtitle(e.target.value)}
                  placeholder="الوصف المختصر..."
                  className="h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                />
                <input
                  type="text"
                  value={banCta}
                  onChange={(e) => setBanCta(e.target.value)}
                  placeholder="نص الزر (تسوق الآن)..."
                  className="h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                />
                <input
                  type="text"
                  dir="ltr"
                  value={banImg}
                  onChange={(e) => setBanImg(e.target.value)}
                  placeholder="رابط الصورة..."
                  className="h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-en"
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
                className="h-10 px-5 rounded-full bg-[#087E83] text-white text-xs font-extrabold"
              >
                + نشر البانر
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
                      className="w-16 h-12 rounded-xl object-cover bg-[#087E83]"
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

        {/* TAB: ORDERS */}
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

        {/* TAB: ANALYTICS */}
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

        {/* TAB: USERS & REVIEWS */}
        {activeTab === 'users' && (
          <div className="space-y-5">
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

            {reviews.length > 0 && (
              <div className="bg-white rounded-3xl p-4 border border-[#E5EAED] shadow-card space-y-3">
                <h2 className="text-sm font-extrabold text-[#18343B]">
                  مراجعة التقييمات ({reviews.length})
                </h2>
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
              </div>
            )}
          </div>
        )}

        {/* TAB: FINANCE SETTINGS */}
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
    </div>
  );
};
