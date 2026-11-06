import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Package,
  ShoppingBag,
  Settings,
  BarChart3,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Truck,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Product } from '../types/database';
import { STATUS_META } from './OrdersPage';
import { StoreCard } from '../components/StoreCard';
import { compressImageFile } from '../utils/imageUpload';

type MerchantTab = 'overview' | 'orders' | 'products' | 'settings' | 'reports';

export const MerchantDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    users,
    switchQuickAccount,
    stores,
    products,
    categories,
    storeCategories,
    orders,
    getStoreMostOrderedProducts,
    updateOrderStatus,
    saveMerchantProduct,
    deleteMerchantProduct,
    updateMerchantStoreInfo,
    addMerchantStoreCategory,
    showToast,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<MerchantTab>('settings');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [editingProduct, setEditingProduct] = useState<
    (Partial<Product> & { id?: string }) | null
  >(null);
  const [newInternalCatName, setNewInternalCatName] = useState('');

  const merchantStore = useMemo(
    () => stores.find((s) => s.id === currentUser?.store_id),
    [stores, currentUser]
  );

  // Store Settings & Images State (Section 6 & 7)
  const [storeName, setStoreName] = useState(
    merchantStore?.name_ar || merchantStore?.name_en || ''
  );
  const [storeActivity, setStoreActivity] = useState(
    merchantStore?.activity_type_ar || ''
  );
  const [storeDesc, setStoreDesc] = useState(
    merchantStore?.description_ar || ''
  );
  const [storeLoc, setStoreLoc] = useState(
    merchantStore?.location_inside_campus || ''
  );
  const [storePhone, setStorePhone] = useState(
    merchantStore?.contact_phone || ''
  );
  const [storeDeliveryFee, setStoreDeliveryFee] = useState(
    merchantStore?.delivery_fee_lyd ?? 3
  );
  const [storeLogoUrl, setStoreLogoUrl] = useState(
    merchantStore?.logo_url || ''
  );
  const [storeCoverUrl, setStoreCoverUrl] = useState(
    merchantStore?.cover_url || ''
  );

  useEffect(() => {
    if (merchantStore) {
      setStoreName(merchantStore.name_ar || merchantStore.name_en || '');
      setStoreActivity(merchantStore.activity_type_ar || '');
      setStoreDesc(merchantStore.description_ar || '');
      setStoreLoc(merchantStore.location_inside_campus || '');
      setStorePhone(merchantStore.contact_phone || '');
      setStoreDeliveryFee(merchantStore.delivery_fee_lyd ?? 3);
      setStoreLogoUrl(merchantStore.logo_url || '');
      setStoreCoverUrl(merchantStore.cover_url || '');
    }
  }, [merchantStore]);

  const myProducts = useMemo(() => {
    if (!merchantStore) return [];
    return products
      .filter((p) => p.store_id === merchantStore.id)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [products, merchantStore]);

  const myOrders = useMemo(() => {
    if (!merchantStore) return [];
    return orders
      .filter((o) => o.store_id === merchantStore.id)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [orders, merchantStore]);

  const myInternalCategories = useMemo(() => {
    if (!merchantStore) return [];
    return storeCategories.filter((sc) => sc.store_id === merchantStore.id);
  }, [storeCategories, merchantStore]);

  const kpiStats = useMemo(() => {
    const totalOrders = myOrders.length;
    const newOrders = myOrders.filter((o) => o.status === 'pending_review').length;
    const preparingOrders = myOrders.filter((o) =>
      ['accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery'].includes(
        o.status
      )
    ).length;
    const completedOrdersList = myOrders.filter((o) => o.status === 'completed');
    const completedCount = completedOrdersList.length;
    const totalRevenue = completedOrdersList.reduce(
      (sum, o) => sum + o.total_lyd,
      0
    );
    const activeProds = myProducts.filter(
      (p) => p.is_active && p.is_available_for_sale && p.stock_quantity > 0
    ).length;

    return {
      totalOrders,
      newOrders,
      preparingOrders,
      completedCount,
      totalRevenue,
      activeProds,
    };
  }, [myOrders, myProducts]);

  const bestSellingMetrics = useMemo(() => {
    if (!merchantStore) return [];
    return getStoreMostOrderedProducts(merchantStore.id);
  }, [merchantStore, getStoreMostOrderedProducts]);

  const slowMovingProducts = useMemo(() => {
    const soldSet = new Set(bestSellingMetrics.map((m) => m.product.id));
    return myProducts.filter((p) => !soldSet.has(p.id));
  }, [myProducts, bestSellingMetrics]);

  if (!currentUser || currentUser.role !== 'merchant' || !merchantStore) {
    const merchantAccounts = users.filter((u) => u.role === 'merchant');
    return (
      <div className="py-10 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-3xl p-6 border border-[#E5EAED] shadow-card text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#EAF3F4] text-[#087E83] flex items-center justify-center mx-auto">
            <Briefcase className="w-7 h-7" />
          </div>
          <h1 className="text-base font-extrabold text-[#18343B]">
            لوحة صاحب المتجر
          </h1>
          <p className="text-xs text-[#74838A]">
            هذه الصفحة مخصصة لأصحاب المتاجر المسجلين في المنصة لإدارة صور المتجر والمنتجات والطلبات.
          </p>
          {merchantAccounts.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 text-right">
              {merchantAccounts.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => switchQuickAccount(m.id)}
                  className="p-3 rounded-xl border border-[#DCEBED] bg-[#EAF3F4] hover:bg-[#DCEBED] transition text-xs font-extrabold text-[#087E83]"
                >
                  دخول كـ: {m.full_name}
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/account?become_merchant=1')}
              className="w-full h-11 rounded-full bg-[#087E83] text-white text-xs font-extrabold"
            >
              اشترك بمتجرك في CampusMarket
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs font-bold text-[#74838A] hover:underline pt-2 block mx-auto"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  const filteredMerchantOrders =
    orderStatusFilter === 'all'
      ? myOrders
      : myOrders.filter((o) => o.status === orderStatusFilter);

  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    saveMerchantProduct(editingProduct);
    setEditingProduct(null);
  };

  const handleUploadStoreLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 400, 400, 0.86);
      setStoreLogoUrl(dataUrl);
      showToast('تم تجهيز الصورة المصغرة — اضغط حفظ التعديلات لاعتمادها', 'info');
    } catch {
      showToast('تعذر قراءة ملف الصورة', 'error');
    }
  };

  const handleUploadStoreCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 1200, 600, 0.86);
      setStoreCoverUrl(dataUrl);
      showToast('تم تجهيز بانر المتجر — اضغط حفظ التعديلات لاعتماده', 'info');
    } catch {
      showToast('تعذر قراءة ملف البانر', 'error');
    }
  };

  const handleUploadProductImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;
    try {
      const dataUrl = await compressImageFile(file, 800, 800, 0.85);
      setEditingProduct({ ...editingProduct, images: [dataUrl] });
    } catch {
      showToast('تعذر قراءة صورة المنتج', 'error');
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Merchant Header */}
      <header className="bg-[#18343B] text-white rounded-3xl p-4 sm:p-5 border border-[#087E83]/30 shadow-card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              title="العودة لواجهة المتسوق"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold bg-[#087E83] px-2.5 py-0.5 rounded-full">
                  لوحة صاحب المتجر
                </span>
                <h1 className="text-base font-extrabold">
                  {merchantStore.name_ar || merchantStore.name_en}
                </h1>
                {merchantStore.status === 'pending' && (
                  <span className="text-[10px] font-extrabold bg-[#F3C95B] text-[#18343B] px-2.5 py-0.5 rounded-full">
                    بانتظار اعتماد الإدارة
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#B9DDE0] mt-0.5">
                {merchantStore.activity_type_ar} • إدارة صور المتجر والمنتجات والطلبات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                updateMerchantStoreInfo({ is_open: !merchantStore.is_open })
              }
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition ${
                merchantStore.is_open
                  ? 'bg-[#087E83] text-white'
                  : 'bg-white/10 text-[#B9DDE0]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  merchantStore.is_open ? 'bg-[#F3C95B]' : 'bg-[#74838A]'
                }`}
              />
              <span>
                {merchantStore.is_open ? 'المتجر مفتوح الآن' : 'المتجر مغلق الآن'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`/store/${merchantStore.id}`)}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold"
            >
              معاينة صفحة متجري
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-4 pt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-white/10">
          {(
            [
              { id: 'settings', label: 'صور وبيانات المتجر', icon: ImageIcon },
              {
                id: 'products',
                label: `المنتجات والخدمات (${myProducts.length})`,
                icon: Package,
              },
              {
                id: 'orders',
                label: `الطلبات (${kpiStats.newOrders})`,
                icon: ShoppingBag,
              },
              { id: 'overview', label: 'نظرة عامة', icon: Briefcase },
              { id: 'reports', label: 'التقارير', icon: BarChart3 },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition ${
                  active
                    ? 'bg-[#087E83] text-white'
                    : 'text-[#B9DDE0] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      <main className="space-y-5">
        {/* TAB: STORE IMAGES & SETTINGS (Section 6 & 7) */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Right Column: Live Store Images & Info Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-[#E5EAED] shadow-card space-y-5">
              <h2 className="text-sm sm:text-base font-extrabold text-[#18343B] border-b border-[#E5EAED] pb-3">
                إدارة صور المتجر (الصورة المصغرة والبانر) والبيانات الأساسية
              </h2>

              {/* Store Thumbnail & Wide Banner Upload Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Store Thumbnail (Logo) */}
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#18343B]">
                      أ. صورة المتجر المصغرة
                    </span>
                    {storeLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setStoreLogoUrl('')}
                        className="text-[11px] font-bold text-rose-600 flex items-center gap-1 hover:underline"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف الصورة</span>
                      </button>
                    )}
                  </div>

                  <label className="w-full h-10 px-3 rounded-xl bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition">
                    <Upload className="w-4 h-4" />
                    <span>{storeLogoUrl ? 'تغيير الصورة المصغرة' : 'رفع صورة مصغرة'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadStoreLogo}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    dir="ltr"
                    value={storeLogoUrl}
                    onChange={(e) => setStoreLogoUrl(e.target.value)}
                    placeholder="أو الصق رابط الصورة المصغرة..."
                    className="w-full h-9 px-3 rounded-xl border border-[#E5EAED] bg-white text-xs font-en"
                  />
                </div>

                {/* 2. Store Wide Banner */}
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#18343B]">
                      ب. صورة بانر المتجر
                    </span>
                    {storeCoverUrl && (
                      <button
                        type="button"
                        onClick={() => setStoreCoverUrl('')}
                        className="text-[11px] font-bold text-rose-600 flex items-center gap-1 hover:underline"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف البانر</span>
                      </button>
                    )}
                  </div>

                  <label className="w-full h-10 px-3 rounded-xl bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition">
                    <Upload className="w-4 h-4" />
                    <span>{storeCoverUrl ? 'تغيير بانر المتجر' : 'رفع بانر المتجر'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadStoreCover}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    dir="ltr"
                    value={storeCoverUrl}
                    onChange={(e) => setStoreCoverUrl(e.target.value)}
                    placeholder="أو الصق رابط بانر المتجر..."
                    className="w-full h-9 px-3 rounded-xl border border-[#E5EAED] bg-white text-xs font-en"
                  />
                </div>
              </div>

              {/* Store Text Info Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    اسم المتجر
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    نوع النشاط
                  </label>
                  <input
                    type="text"
                    value={storeActivity}
                    onChange={(e) => setStoreActivity(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    وصف المتجر المختصر
                  </label>
                  <textarea
                    rows={2}
                    value={storeDesc}
                    onChange={(e) => setStoreDesc(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E5EAED] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    موقع المتجر داخل الجامعة
                  </label>
                  <input
                    type="text"
                    value={storeLoc}
                    onChange={(e) => setStoreLoc(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    رقم التواصل
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-en"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    رسوم التوصيل داخل الكلية (د.ل)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={storeDeliveryFee}
                    onChange={(e) => setStoreDeliveryFee(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  updateMerchantStoreInfo({
                    name_ar: storeName,
                    name_en: storeName,
                    activity_type_ar: storeActivity,
                    description_ar: storeDesc,
                    location_inside_campus: storeLoc,
                    contact_phone: storePhone,
                    delivery_fee_lyd: storeDeliveryFee,
                    logo_url: storeLogoUrl,
                    cover_url: storeCoverUrl,
                  })
                }
                className="w-full sm:w-auto px-8 h-11 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs sm:text-sm font-extrabold shadow-xs transition"
              >
                حفظ الصور وبيانات المتجر
              </button>
            </div>

            {/* Left Column: Live Preview of Store Card before saving */}
            <div className="lg:col-span-5 space-y-3">
              <div className="bg-white rounded-3xl p-5 border border-[#E5EAED] shadow-card space-y-3">
                <h3 className="text-sm font-extrabold text-[#18343B]">
                  معاينة بطاقة متجرك في الصفحة الرئيسية قبل الحفظ:
                </h3>
                <p className="text-xs text-[#74838A]">
                  هكذا سيظهر متجرك للطلاب في الصفحة الرئيسية:
                </p>
                <StoreCard
                  previewMode
                  store={{
                    ...merchantStore,
                    name_ar: storeName || merchantStore.name_ar,
                    name_en: storeName || merchantStore.name_en,
                    activity_type_ar: storeActivity,
                    description_ar: storeDesc,
                    logo_url: storeLogoUrl,
                    cover_url: storeCoverUrl,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: PRODUCTS & SERVICES */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-4 border border-[#E5EAED] shadow-card flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  value={newInternalCatName}
                  onChange={(e) => setNewInternalCatName(e.target.value)}
                  placeholder="اسم قسم داخلي جديد بالمتجر..."
                  className="h-9 px-3 rounded-xl border border-[#E5EAED] text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newInternalCatName.trim()) return;
                    addMerchantStoreCategory(newInternalCatName);
                    setNewInternalCatName('');
                  }}
                  className="h-9 px-3 rounded-xl bg-[#EAF3F4] text-[#087E83] text-xs font-bold"
                >
                  + إضافة قسم داخلي للمتجر
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingProduct({
                    name_ar: '',
                    name_en: '',
                    description_ar: '',
                    price_lyd: 15,
                    old_price_lyd: undefined,
                    stock_quantity: 25,
                    category_id: merchantStore.category_id,
                    store_category_id: myInternalCategories[0]?.id,
                    images: [''],
                    is_active: true,
                    is_available_for_sale: true,
                  })
                }
                className="h-10 px-5 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج أو خدمة</span>
              </button>
            </div>

            {myProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center text-xs text-[#74838A] border border-[#E5EAED]">
                لا توجد منتجات أو خدمات حالياً في متجرك. اضغط على "إضافة منتج أو خدمة" للبدء.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {myProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl p-3.5 border border-[#E5EAED] shadow-card flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={prod.images[0]}
                        alt={prod.name_ar}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 bg-[#F8FAFC]"
                      />
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-extrabold text-[#18343B] truncate">
                            {prod.name_ar}
                          </h3>
                          {!prod.is_active && (
                            <span className="text-[10px] bg-[#F8FAFC] text-[#74838A] px-2 py-0.5 rounded-full font-bold">
                              مخفي
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-extrabold text-[#087E83]">
                          {prod.price_lyd} د.ل
                        </p>
                        <p className="text-[11px] font-bold text-[#74838A]">
                          المخزون المتاح: {prod.stock_quantity}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          saveMerchantProduct({
                            id: prod.id,
                            is_active: !prod.is_active,
                          })
                        }
                        className="w-8 h-8 rounded-lg bg-[#F8FAFC] flex items-center justify-center text-[#74838A]"
                      >
                        {prod.is_active ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProduct(prod)}
                        className="w-8 h-8 rounded-lg bg-[#EAF3F4] flex items-center justify-center text-[#087E83]"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMerchantProduct(prod.id)}
                        className="w-8 h-8 rounded-lg bg-[#F8FAFC] flex items-center justify-center text-[#74838A]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'جميع الطلبات' },
                { id: 'pending_review', label: 'قيد المراجعة' },
                { id: 'accepted', label: 'مقبول' },
                { id: 'preparing', label: 'قيد التجهيز' },
                { id: 'ready_for_pickup', label: 'جاهز للاستلام' },
                { id: 'out_for_delivery', label: 'خرج للتوصيل' },
                { id: 'completed', label: 'مكتمل' },
                { id: 'rejected', label: 'مرفوض' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setOrderStatusFilter(st.id)}
                  className={`h-9 px-3.5 rounded-full text-xs font-extrabold whitespace-nowrap transition ${
                    orderStatusFilter === st.id
                      ? 'bg-[#087E83] text-white'
                      : 'bg-white text-[#74838A] border border-[#E5EAED]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {filteredMerchantOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center text-xs text-[#74838A] border border-[#E5EAED]">
                لا توجد طلبات حالياً.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMerchantOrders.map((ord) => {
                  const meta = STATUS_META[ord.status];
                  return (
                    <div
                      key={ord.id}
                      className="bg-white rounded-3xl p-4 border border-[#E5EAED] shadow-card space-y-3"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#E5EAED] pb-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            dir="ltr"
                            className="font-en text-xs font-extrabold bg-[#EAF3F4] text-[#087E83] px-2.5 py-1 rounded-lg"
                          >
                            #{ord.order_number}
                          </span>
                          <span className="text-xs font-extrabold text-[#18343B]">
                            {ord.customer_name_ar}
                          </span>
                          <a
                            href={`tel:${ord.customer_phone}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#087E83] bg-[#EAF3F4] px-2 py-0.5 rounded-md"
                          >
                            <Phone className="w-3 h-3" />
                            <span dir="ltr">{ord.customer_phone}</span>
                          </a>
                        </div>

                        <span
                          className={`text-xs font-extrabold px-3 py-1 rounded-full border ${meta.badgeBg} ${meta.colorClass}`}
                        >
                          {meta.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ord.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-[#F8FAFC] border border-[#E5EAED] text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={item.product_image_snapshot}
                                alt={item.product_name_snapshot}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <p className="font-extrabold text-[#18343B]">
                                {item.product_name_snapshot} × {item.quantity}
                              </p>
                            </div>
                            <span className="font-extrabold text-[#087E83]">
                              {item.line_total_lyd} د.ل
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-[#74838A] pt-1">
                        <span className="font-bold flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-[#087E83]" />
                          {ord.fulfillment_method === 'campus_delivery'
                            ? `توصيل إلى: ${ord.campus_location_ar} (${ord.pickup_point_ar})`
                            : 'استلام مباشر من المتجر'}
                        </span>
                        <span className="text-sm font-extrabold text-[#18343B]">
                          الإجمالي: {ord.total_lyd} د.ل
                        </span>
                      </div>

                      <div className="flex items-center justify-end flex-wrap gap-2 pt-2 border-t border-[#E5EAED]">
                        {ord.status === 'pending_review' && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                updateOrderStatus(
                                  ord.id,
                                  'accepted',
                                  'تم قبول الطلب من قبل المتجر'
                                )
                              }
                              className="px-4 py-1.5 rounded-full bg-[#087E83] text-white text-xs font-extrabold flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>قبول الطلب</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectingOrderId(ord.id)}
                              className="px-4 py-1.5 rounded-full bg-[#F8FAFC] border border-[#E5EAED] text-[#74838A] text-xs font-extrabold flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>اعتذار عن الطلب</span>
                            </button>
                          </>
                        )}

                        {ord.status === 'accepted' && (
                          <button
                            type="button"
                            onClick={() =>
                              updateOrderStatus(
                                ord.id,
                                'preparing',
                                'بدأ المتجر في تجهيز الطلب'
                              )
                            }
                            className="px-4 py-1.5 rounded-full bg-[#087E83] text-white text-xs font-extrabold"
                          >
                            بدء التجهيز
                          </button>
                        )}

                        {ord.status === 'preparing' && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                updateOrderStatus(
                                  ord.id,
                                  'ready_for_pickup',
                                  'الطلب جاهز للاستلام من المتجر'
                                )
                              }
                              className="px-4 py-1.5 rounded-full bg-[#087E83] text-white text-xs font-extrabold"
                            >
                              جاهز للاستلام
                            </button>
                            {ord.fulfillment_method === 'campus_delivery' && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateOrderStatus(
                                    ord.id,
                                    'out_for_delivery',
                                    'خرج المندوب لتوصيل الطلب داخل الكلية'
                                  )
                                }
                                className="px-4 py-1.5 rounded-full bg-[#36A6A6] text-white text-xs font-extrabold"
                              >
                                خرج للتوصيل
                              </button>
                            )}
                          </>
                        )}

                        {(ord.status === 'ready_for_pickup' ||
                          ord.status === 'out_for_delivery') && (
                          <button
                            type="button"
                            onClick={() =>
                              updateOrderStatus(
                                ord.id,
                                'completed',
                                'تم تسليم الطلب وإتمام العملية بنجاح'
                              )
                            }
                            className="px-4 py-1.5 rounded-full bg-[#087E83] text-white text-xs font-extrabold"
                          >
                            تأكيد التسليم وإكمال الطلب
                          </button>
                        )}
                      </div>

                      {rejectingOrderId === ord.id && (
                        <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] flex items-center gap-2">
                          <input
                            type="text"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="اكتب سبب الاعتذار لإشعار الطالب..."
                            className="flex-1 h-9 px-3 rounded-xl bg-white border border-[#E5EAED] text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              updateOrderStatus(
                                ord.id,
                                'rejected',
                                undefined,
                                rejectionReason || 'المنتج غير متاح حالياً'
                              );
                              setRejectingOrderId(null);
                              setRejectionReason('');
                            }}
                            className="px-3 h-9 rounded-xl bg-[#18343B] text-white text-xs font-extrabold"
                          >
                            تأكيد
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectingOrderId(null)}
                            className="px-2.5 h-9 rounded-xl bg-white text-[#74838A] text-xs font-bold"
                          >
                            إلغاء
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-[#E5EAED] shadow-card">
              <span className="text-[11px] font-bold text-[#74838A]">
                إجمالي المبيعات المكتملة
              </span>
              <p className="text-xl font-extrabold text-[#087E83] mt-1">
                {kpiStats.totalRevenue} د.ل
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E5EAED] shadow-card">
              <span className="text-[11px] font-bold text-[#74838A]">
                الطلبات الجديدة
              </span>
              <p className="text-xl font-extrabold text-[#18343B] mt-1">
                {kpiStats.newOrders}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E5EAED] shadow-card">
              <span className="text-[11px] font-bold text-[#74838A]">
                قيد التجهيز والتوصيل
              </span>
              <p className="text-xl font-extrabold text-[#36A6A6] mt-1">
                {kpiStats.preparingOrders}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E5EAED] shadow-card">
              <span className="text-[11px] font-bold text-[#74838A]">
                المنتجات النشطة
              </span>
              <p className="text-xl font-extrabold text-[#18343B] mt-1">
                {kpiStats.activeProds}
              </p>
            </div>
          </div>
        )}

        {/* TAB: REPORTS */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-4 border border-[#E5EAED] shadow-card space-y-3">
              <h3 className="text-sm font-extrabold text-[#18343B]">
                المنتجات الأكثر مبيعاً في المتجر
              </h3>
              {bestSellingMetrics.length === 0 ? (
                <p className="text-xs text-[#74838A]">لا توجد بيانات مبيعات بعد.</p>
              ) : (
                <div className="space-y-2">
                  {bestSellingMetrics.map((m, idx) => (
                    <div
                      key={m.product.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] text-xs"
                    >
                      <span className="font-bold text-[#18343B]">
                        {idx + 1}. {m.product.name_ar}
                      </span>
                      <span className="font-extrabold text-[#087E83]">
                        {m.unitsSold} وحدة ({m.unitsSold * m.product.price_lyd} د.ل)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-4 border border-[#E5EAED] shadow-card space-y-3">
              <h3 className="text-sm font-extrabold text-[#18343B]">
                المنتجات الأقل حركة
              </h3>
              {slowMovingProducts.length === 0 ? (
                <p className="text-xs text-[#74838A]">لا توجد بيانات حالياً.</p>
              ) : (
                <div className="space-y-2">
                  {slowMovingProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] text-xs"
                    >
                      <span className="font-bold text-[#18343B]">{p.name_ar}</span>
                      <span className="text-[#74838A]">
                        المخزون: {p.stock_quantity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ADD / EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-[#18343B]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveProductSubmit}
            className="bg-white w-full max-w-lg rounded-3xl p-5 space-y-3.5 shadow-xl max-h-[90vh] overflow-y-auto border border-[#E5EAED]"
          >
            <h3 className="text-base font-extrabold text-[#18343B]">
              {editingProduct.id ? 'تعديل بيانات العنصر' : 'إضافة منتج أو خدمة للمتجر'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#18343B] mb-1">
                  اسم المنتج / الخدمة *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name_ar || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name_ar: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#18343B] mb-1">
                  القسم الداخلي بالمتجر
                </label>
                <select
                  value={editingProduct.store_category_id || ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      store_category_id: e.target.value,
                    })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs bg-white"
                >
                  <option value="">بدون قسم فرعي</option>
                  {myInternalCategories.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name_ar}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#18343B] mb-1">
                  السعر (د.ل) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={editingProduct.price_lyd ?? 10}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      price_lyd: Number(e.target.value),
                    })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#18343B] mb-1">
                  الكمية المتوفرة *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={editingProduct.stock_quantity ?? 20}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      stock_quantity: Number(e.target.value),
                    })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-xs font-bold text-[#18343B]">
                  صورة المنتج / الخدمة
                </label>
                <div className="flex items-center gap-2">
                  <label className="h-9 px-4 rounded-xl bg-[#087E83] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع صورة من الجهاز</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadProductImage}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editingProduct.images?.[0] || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        images: [e.target.value],
                      })
                    }
                    placeholder="أو الصق رابط الصورة..."
                    className="flex-1 h-9 px-3 rounded-xl border border-[#E5EAED] text-xs font-en"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#18343B] mb-1">
                  وصف المنتج / الخدمة *
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingProduct.description_ar || ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description_ar: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-[#E5EAED] text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 h-10 rounded-full bg-[#087E83] text-white text-xs font-extrabold"
              >
                حفظ
              </button>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-5 h-10 rounded-full bg-[#F8FAFC] border border-[#E5EAED] text-[#74838A] text-xs font-bold"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
