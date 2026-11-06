import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Store as StoreIcon,
  Package,
  ShoppingBag,
  Star,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Truck,
  Phone,
  Eye,
  EyeOff,
  Upload,
  Camera,
  Image as ImageIcon,
  AlertTriangle,
  Lock,
  ArrowRight,
  Sparkles,
  Bell,
  Check,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Product } from '../types/database';
import { STATUS_META } from './OrdersPage';
import { compressImageFile } from '../utils/imageUpload';

type MerchantTab =
  | 'overview'
  | 'store_info'
  | 'products'
  | 'orders'
  | 'reviews'
  | 'reports'
  | 'account_settings';

export const MerchantDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    users,
    switchQuickAccount,
    logout,
    stores,
    products,
    categories,
    storeCategories,
    orders,
    reviews,
    getStoreRatingStats,
    getStoreMostOrderedProducts,
    updateOrderStatus,
    saveMerchantProduct,
    deleteMerchantProduct,
    updateMerchantStoreInfo,
    addMerchantStoreCategory,
    merchantChangePassword,
    showToast,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<MerchantTab>('overview');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Product Add/Edit Modal
  const [editingProduct, setEditingProduct] = useState<
    (Partial<Product> & { id?: string }) | null
  >(null);
  const [newInternalCatName, setNewInternalCatName] = useState('');

  // Password Change Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Identified Merchant Store
  const merchantStore = useMemo(
    () => stores.find((s) => s.id === currentUser?.store_id),
    [stores, currentUser]
  );

  // Store Settings & Images State
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

  // Strict Data Isolation: Products strictly belonging to this store
  const myProducts = useMemo(() => {
    if (!merchantStore) return [];
    return products
      .filter((p) => p.store_id === merchantStore.id)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [products, merchantStore]);

  // Orders strictly belonging to this store
  const myOrders = useMemo(() => {
    if (!merchantStore) return [];
    return orders
      .filter((o) => o.store_id === merchantStore.id)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [orders, merchantStore]);

  // Reviews strictly belonging to this store
  const myReviews = useMemo(() => {
    if (!merchantStore) return [];
    return reviews.filter((r) => r.store_id === merchantStore.id && r.is_approved);
  }, [reviews, merchantStore]);

  const ratingStats = useMemo(() => {
    if (!merchantStore) return { average: 0, count: 0 };
    return getStoreRatingStats(merchantStore.id);
  }, [merchantStore, getStoreRatingStats]);

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

  // Handle image compression and uploads
  const handleUploadStoreLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 400, 400, 0.86);
      setStoreLogoUrl(dataUrl);
      updateMerchantStoreInfo({ logo_url: dataUrl });
      showToast('تم تحديث وحفظ صورة المتجر المصغرة بنجاح', 'success');
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
      updateMerchantStoreInfo({ cover_url: dataUrl });
      showToast('تم تحديث وحفظ صورة بانر المتجر بنجاح', 'success');
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

  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    saveMerchantProduct(editingProduct);
    setEditingProduct(null);
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('كلمة المرور وتأكيدها غير متطابقين.');
      return;
    }

    const res = merchantChangePassword({
      oldPassword: oldPassword.trim() || undefined,
      newPassword: newPassword.trim(),
    });

    if (res.success) {
      setPasswordSuccess('تم تغيير كلمة المرور بنجاح!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError(res.error || 'فشل تحديث كلمة المرور.');
    }
  };

  // If user is not authenticated as a merchant
  if (!currentUser || currentUser.role !== 'merchant' || !merchantStore) {
    const merchantAccounts = users.filter((u) => u.role === 'merchant');
    return (
      <div className="py-12 px-4 max-w-lg mx-auto text-center">
        <div className="bg-white rounded-[32px] p-8 border border-[#E5EAED] shadow-xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#EAF3F4] text-[#087E83] flex items-center justify-center mx-auto shadow-sm">
            <StoreIcon className="w-9 h-9 stroke-[1.8]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-[#18343B]">
              لوحة تحكم أصحاب المتاجر
            </h1>
            <p className="text-xs text-[#74838A] leading-relaxed">
              هذه الصفحة مخصصة للتجار المعتمدين في CampusMarket لإدارة منتجاتهم وصورهم ومتابعة طلبات الكلية.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={() => navigate('/merchant-login')}
              className="w-full h-12 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
            >
              <span>تسجيل دخول أصحاب المتاجر</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/register-store')}
              className="w-full h-11 rounded-full bg-white hover:bg-[#F8FAFC] border border-[#E5EAED] text-[#18343B] text-xs font-extrabold transition"
            >
              تقديم طلب إنشاء متجر جديد
            </button>
          </div>

          {merchantAccounts.length > 0 && (
            <div className="pt-4 border-t border-[#E5EAED] text-right space-y-2">
              <span className="text-[11px] font-bold text-[#74838A] block">
                حسابات تجار مسجلة على هذا الجهاز:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {merchantAccounts.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => switchQuickAccount(m.id)}
                    className="p-2.5 rounded-xl border border-[#DCEBED] bg-[#EAF3F4] hover:bg-[#DCEBED] transition text-xs font-bold text-[#087E83] text-right flex items-center justify-between"
                  >
                    <span>{m.full_name}</span>
                    <span className="text-[10px] text-[#74838A]">تبديل الحساب</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const filteredMerchantOrders =
    orderStatusFilter === 'all'
      ? myOrders
      : myOrders.filter((o) => o.status === orderStatusFilter);

  // Status Badge Helper
  const isPending = merchantStore.status === 'pending';
  const isSuspended = merchantStore.status === 'suspended';

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* First-time login mandatory password change warning */}
      {currentUser.must_change_password && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              هذه أول عملية دخول لحساب متجرك! يرجى تعيين كلمة مرور شخصية خاصة بك لحماية بيانات متجرك.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('account_settings')}
            className="px-4 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-extrabold shrink-0"
          >
            تغيير كلمة المرور الآن
          </button>
        </div>
      )}

      {/* Top Bar matching Image Header */}
      <header className="bg-white rounded-[28px] p-4 sm:p-5 border border-[#E5EAED] shadow-sm flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#087E83] text-white flex items-center justify-center">
            <StoreIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-[#18343B]">
              CampusMarket
            </h2>
            <span className="text-xs text-[#74838A] font-bold">
              لوحة تحكم المتجر
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Store open/close switch */}
          <button
            type="button"
            onClick={() =>
              updateMerchantStoreInfo({ is_open: !merchantStore.is_open })
            }
            className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition border ${
              merchantStore.is_open
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-zinc-100 text-zinc-600 border-zinc-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                merchantStore.is_open ? 'bg-emerald-500' : 'bg-zinc-400'
              }`}
            />
            <span>{merchantStore.is_open ? 'المتجر مفتوح' : 'المتجر مغلق'}</span>
          </button>

          {/* Preview Public Store Page */}
          <button
            type="button"
            onClick={() => navigate(`/store/${merchantStore.id}`)}
            className="px-4 py-1.5 rounded-full bg-[#F8FAFC] hover:bg-[#EAF3F4] text-[#087E83] border border-[#E5EAED] text-xs font-bold transition flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>معاينة صفحة المتجر</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout: Left Content + Right Sidebar matching media_1793975314831_ff72f18b.jpg */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* RIGHT SIDEBAR (Col 1-3 in 12-col grid, placed on right for RTL) */}
        <aside className="lg:col-span-3 lg:order-2 space-y-4">
          {/* Store Profile Card */}
          <div className="bg-white rounded-[28px] p-5 border border-[#E5EAED] shadow-sm text-center space-y-3">
            {/* Store Circular Logo with upload camera button */}
            <div className="relative w-20 h-20 mx-auto">
              {merchantStore.logo_url ? (
                <img
                  src={merchantStore.logo_url}
                  alt={merchantStore.name_ar}
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#087E83] p-0.5 bg-white shadow-xs"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#EAF3F4] text-[#087E83] flex items-center justify-center border-2 border-[#087E83] shadow-xs">
                  <StoreIcon className="w-9 h-9 stroke-[1.8]" />
                </div>
              )}

              {/* Camera Icon Overlay */}
              <label
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white flex items-center justify-center shadow-md cursor-pointer transition"
                title="تغيير صورة الشعار"
              >
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadStoreLogo}
                  className="hidden"
                />
              </label>
            </div>

            {/* Store Name and Active Badge matching image */}
            <div>
              <h3 className="text-base font-black text-[#18343B]">
                {merchantStore.name_ar || merchantStore.name_en}
              </h3>
              <div className="mt-1 flex items-center justify-center">
                {isPending ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-extrabold border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    بانتظار الاعتماد
                  </span>
                ) : isSuspended ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-50 text-rose-800 text-[11px] font-extrabold border border-rose-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    معلق
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-extrabold border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    مفعل
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Menu List matching image */}
          <nav className="bg-white rounded-[28px] p-3 border border-[#E5EAED] shadow-sm space-y-1">
            {[
              { id: 'overview', label: 'الرئيسية', icon: Home },
              { id: 'store_info', label: 'بيانات المتجر', icon: StoreIcon },
              {
                id: 'products',
                label: `المنتجات (${myProducts.length})`,
                icon: Package,
              },
              {
                id: 'orders',
                label: `الطلبات (${kpiStats.newOrders})`,
                icon: ShoppingBag,
              },
              {
                id: 'reviews',
                label: `التقييمات (${ratingStats.count})`,
                icon: Star,
              },
              { id: 'reports', label: 'إحصائيات', icon: BarChart3 },
              { id: 'account_settings', label: 'إعدادات الحساب', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id as MerchantTab)}
                  className={`w-full h-11 px-4 rounded-2xl text-xs font-extrabold flex items-center justify-between transition ${
                    isActive
                      ? 'bg-[#087E83] text-white shadow-xs'
                      : 'text-[#18343B] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}

            {/* Logout button */}
            <div className="pt-2 border-t border-[#E5EAED] mt-2">
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/merchant-login');
                }}
                className="w-full h-11 px-4 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* LEFT MAIN CONTENT AREA (Col 4-12 in 12-col grid) */}
        <main className="lg:col-span-9 lg:order-1 space-y-5">
          {/* TAB 1: OVERVIEW (الرئيسية) matching media_1793975314831_ff72f18b.jpg */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* 1. Welcome Card with store awning */}
              <div className="rounded-[28px] p-6 sm:p-7 bg-[#EAF3F4] border border-[#CDE3E6] flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden">
                <div className="w-20 h-20 rounded-2xl bg-white/80 backdrop-blur-xs text-[#087E83] flex items-center justify-center shrink-0 shadow-sm border border-white">
                  <StoreIcon className="w-10 h-10 stroke-[1.8]" />
                </div>
                <div className="text-center sm:text-right space-y-1">
                  <h2 className="text-xl font-black text-[#18343B]">
                    مرحبًا بك في لوحة متجرك
                  </h2>
                  <p className="text-xs sm:text-sm text-[#74838A] leading-relaxed">
                    قم بإدارة منتجاتك وطلباتك وتحديث بيانات متجرك بكل سهولة.
                  </p>
                </div>
              </div>

              {/* 2. 4 Stat KPI Cards matching the image */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {/* 1. زيارات المتجر */}
                <div className="bg-white rounded-2xl p-4 border border-[#E5EAED] shadow-xs text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-700 flex items-center justify-center mx-auto">
                    <Eye className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="text-[11px] font-bold text-[#74838A]">
                    زيارات المتجر
                  </div>
                  <div className="text-xl font-black text-[#18343B]">
                    {merchantStore.views_count ?? 12}
                  </div>
                </div>

                {/* 2. إجمالي المنتجات */}
                <div className="bg-white rounded-2xl p-4 border border-[#E5EAED] shadow-xs text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                    <Package className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="text-[11px] font-bold text-[#74838A]">
                    إجمالي المنتجات
                  </div>
                  <div className="text-xl font-black text-[#18343B]">
                    {myProducts.length}
                  </div>
                </div>

                {/* 3. إجمالي الطلبات */}
                <div className="bg-white rounded-2xl p-4 border border-[#E5EAED] shadow-xs text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="text-[11px] font-bold text-[#74838A]">
                    إجمالي الطلبات
                  </div>
                  <div className="text-xl font-black text-[#18343B]">
                    {myOrders.length}
                  </div>
                </div>

                {/* 4. التقييم */}
                <div className="bg-white rounded-2xl p-4 border border-[#E5EAED] shadow-xs text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                    <Star className="w-5 h-5 fill-amber-400 stroke-amber-500" />
                  </div>
                  <div className="text-[11px] font-bold text-[#74838A]">
                    التقييم
                  </div>
                  <div className="text-xl font-black text-[#18343B] flex items-center justify-center gap-1">
                    <span>{ratingStats.average > 0 ? ratingStats.average : '4.6'}</span>
                    <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                  </div>
                </div>
              </div>

              {/* 3. Section: إدارة المتجر (Store Management Card) matching image */}
              <div className="bg-white rounded-[28px] p-6 border border-[#E5EAED] shadow-card space-y-4">
                <h3 className="text-base font-black text-[#18343B]">
                  إدارة المتجر
                </h3>

                {/* Banner & Logo Visual Preview */}
                <div className="relative rounded-2xl overflow-hidden border border-[#E5EAED] bg-[#F8FAFC]">
                  {/* Wide Store Banner */}
                  <div className="w-full h-32 sm:h-44 bg-gradient-to-r from-[#087E83] to-[#36A6A6] relative flex items-center justify-center overflow-hidden">
                    {merchantStore.cover_url ? (
                      <img
                        src={merchantStore.cover_url}
                        alt="بانر المتجر"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-white/60 flex items-center gap-2 text-xs font-bold">
                        <ImageIcon className="w-6 h-6" />
                        <span>بانر المتجر العريض</span>
                      </div>
                    )}

                    {/* Camera Button for Banner */}
                    <label
                      className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center shadow-md cursor-pointer transition"
                      title="رفع أو تغيير بانر المتجر"
                    >
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadStoreCover}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Thumbnail & Info Bar inside Store Card */}
                  <div className="p-4 flex items-center justify-between flex-wrap gap-3 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 -mt-8 rounded-full border-2 border-white shadow-md overflow-hidden bg-white shrink-0">
                        {merchantStore.logo_url ? (
                          <img
                            src={merchantStore.logo_url}
                            alt="شعار المتجر"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#EAF3F4] text-[#087E83] flex items-center justify-center">
                            <StoreIcon className="w-7 h-7" />
                          </div>
                        )}
                        <label
                          className="absolute inset-0 bg-black/30 hover:bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition cursor-pointer"
                          title="تغيير الشعار"
                        >
                          <Camera className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadStoreLogo}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-[#18343B]">
                            {merchantStore.name_ar}
                          </h4>
                          <button
                            type="button"
                            onClick={() => setActiveTab('store_info')}
                            className="text-[#74838A] hover:text-[#087E83]"
                            title="تعديل بيانات المتجر"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[11px] text-[#74838A]">
                          {merchantStore.activity_type_ar} • {merchantStore.location_inside_campus}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isPending ? (
                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                          بانتظار الاعتماد
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                          مفعل
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4 Quick Action Buttons matching the reference image */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {/* Action 1: إضافة منتج جديد */}
                  <button
                    type="button"
                    onClick={() =>
                      setEditingProduct({
                        name_ar: '',
                        name_en: '',
                        description_ar: '',
                        price_lyd: 15,
                        stock_quantity: 20,
                        category_id: merchantStore.category_id,
                        store_category_id: myInternalCategories[0]?.id,
                        images: [''],
                        is_active: true,
                        is_available_for_sale: true,
                      })
                    }
                    className="p-3.5 rounded-2xl bg-[#F8FAFC] hover:bg-[#F0F7F7] border border-[#E5EAED] hover:border-[#087E83] text-center space-y-1.5 transition group"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#EAF3F4] text-[#087E83] flex items-center justify-center mx-auto group-hover:scale-110 transition">
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-extrabold text-[#18343B] block">
                      إضافة منتج جديد
                    </span>
                  </button>

                  {/* Action 2: إدارة المنتجات */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('products')}
                    className="p-3.5 rounded-2xl bg-[#F8FAFC] hover:bg-[#F0F7F7] border border-[#E5EAED] hover:border-[#087E83] text-center space-y-1.5 transition group"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#EAF3F4] text-[#087E83] flex items-center justify-center mx-auto group-hover:scale-110 transition">
                      <Package className="w-4 h-4 stroke-[2]" />
                    </div>
                    <span className="text-xs font-extrabold text-[#18343B] block">
                      إدارة المنتجات
                    </span>
                  </button>

                  {/* Action 3: إدارة الطلبات */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="p-3.5 rounded-2xl bg-[#F8FAFC] hover:bg-[#F0F7F7] border border-[#E5EAED] hover:border-[#087E83] text-center space-y-1.5 transition group"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#EAF3F4] text-[#087E83] flex items-center justify-center mx-auto group-hover:scale-110 transition">
                      <ShoppingBag className="w-4 h-4 stroke-[2]" />
                    </div>
                    <span className="text-xs font-extrabold text-[#18343B] block">
                      إدارة الطلبات
                    </span>
                  </button>

                  {/* Action 4: عرض التقييمات */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('reviews')}
                    className="p-3.5 rounded-2xl bg-[#F8FAFC] hover:bg-[#F0F7F7] border border-[#E5EAED] hover:border-[#087E83] text-center space-y-1.5 transition group"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#EAF3F4] text-[#087E83] flex items-center justify-center mx-auto group-hover:scale-110 transition">
                      <Star className="w-4 h-4 stroke-[2]" />
                    </div>
                    <span className="text-xs font-extrabold text-[#18343B] block">
                      عرض التقييمات
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STORE INFO & IMAGES (بيانات المتجر) */}
          {activeTab === 'store_info' && (
            <div className="bg-white rounded-[28px] p-6 border border-[#E5EAED] shadow-card space-y-5">
              <h3 className="text-base font-black text-[#18343B] border-b border-[#E5EAED] pb-3">
                تعديل بيانات المتجر وصوره
              </h3>

              {/* Upload Slots */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Thumbnail */}
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#18343B]">
                      صورة المتجر المصغرة (Thumbnail 1:1)
                    </span>
                    {storeLogoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setStoreLogoUrl('');
                          updateMerchantStoreInfo({ logo_url: '' });
                        }}
                        className="text-[11px] font-bold text-rose-600 hover:underline"
                      >
                        حذف
                      </button>
                    )}
                  </div>
                  <label className="w-full h-10 px-3 rounded-xl bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition">
                    <Upload className="w-4 h-4" />
                    <span>{storeLogoUrl ? 'تغيير الصورة' : 'رفع صورة مصغرة'}</span>
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

                {/* 2. Banner */}
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#18343B]">
                      بانر المتجر (Wide Banner 3:1)
                    </span>
                    {storeCoverUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setStoreCoverUrl('');
                          updateMerchantStoreInfo({ cover_url: '' });
                        }}
                        className="text-[11px] font-bold text-rose-600 hover:underline"
                      >
                        حذف
                      </button>
                    )}
                  </div>
                  <label className="w-full h-10 px-3 rounded-xl bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition">
                    <Upload className="w-4 h-4" />
                    <span>{storeCoverUrl ? 'تغيير البانر' : 'رفع بانر المتجر'}</span>
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

              {/* Text Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    الوصف المختصر للمتجر
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
                    موقع المتجر داخل الكلية
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
                    رقم الهاتف للتواصل
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-en"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    updateMerchantStoreInfo({
                      name_ar: storeName.trim(),
                      name_en: storeName.trim(),
                      activity_type_ar: storeActivity.trim(),
                      description_ar: storeDesc.trim(),
                      location_inside_campus: storeLoc.trim(),
                      contact_phone: storePhone.trim(),
                      logo_url: storeLogoUrl.trim(),
                      cover_url: storeCoverUrl.trim(),
                      delivery_fee_lyd: Number(storeDeliveryFee),
                    });
                    showToast('تم حفظ وتحديث بيانات المتجر بنجاح', 'success');
                  }}
                  className="w-full h-11 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs sm:text-sm font-extrabold shadow-sm transition"
                >
                  حفظ التعديلات
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS (المنتجات) */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="bg-white rounded-[28px] p-5 border border-[#E5EAED] shadow-card flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    value={newInternalCatName}
                    onChange={(e) => setNewInternalCatName(e.target.value)}
                    placeholder="اسم قسم داخلي بالمتجر..."
                    className="h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newInternalCatName.trim()) return;
                      addMerchantStoreCategory(newInternalCatName);
                      setNewInternalCatName('');
                    }}
                    className="h-10 px-4 rounded-xl bg-[#EAF3F4] text-[#087E83] text-xs font-bold hover:bg-[#DCEBED]"
                  >
                    + إضافة قسم
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
                      stock_quantity: 20,
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
                <div className="bg-white rounded-3xl p-10 text-center text-xs text-[#74838A] border border-[#E5EAED]">
                  لا توجد منتجات أو خدمات حالياً في متجرك. اضغط على "+ إضافة منتج أو خدمة" للبدء.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {myProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white rounded-2xl p-4 border border-[#E5EAED] shadow-sm flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {prod.images?.[0] ? (
                          <img
                            src={prod.images[0]}
                            alt={prod.name_ar}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 bg-[#F8FAFC]"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-[#F8FAFC] text-[#74838A] flex items-center justify-center shrink-0">
                            <Package className="w-7 h-7" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-xs font-extrabold text-[#18343B] truncate">
                            {prod.name_ar}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-black text-[#087E83]">
                              {prod.price_lyd} د.ل
                            </span>
                            <span className="text-[10px] text-[#74838A]">
                              المخزون: {prod.stock_quantity}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(prod)}
                          className="w-8 h-8 rounded-lg bg-[#F8FAFC] hover:bg-[#E5EAED] text-[#18343B] flex items-center justify-center"
                          title="تعديل المنتج"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('هل تريد حذف هذا المنتج نهائياً من متجرك؟')) {
                              deleteMerchantProduct(prod.id);
                            }
                          }}
                          className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center"
                          title="حذف المنتج"
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

          {/* TAB 4: ORDERS (الطلبات) */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Order Status Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'pending_review', label: 'طلبات جديدة' },
                  { id: 'preparing', label: 'قيد التجهيز' },
                  { id: 'ready_for_pickup', label: 'جاهزة للاستلام' },
                  { id: 'completed', label: 'مكتملة' },
                  { id: 'rejected', label: 'ملغية' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setOrderStatusFilter(st.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition ${
                      orderStatusFilter === st.id
                        ? 'bg-[#087E83] text-white shadow-xs'
                        : 'bg-white text-[#74838A] border border-[#E5EAED]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {filteredMerchantOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center text-xs text-[#74838A] border border-[#E5EAED]">
                  لا توجد طلبات تطابق هذا التصنيف حالياً.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMerchantOrders.map((ord) => {
                    const meta = STATUS_META[ord.status];
                    return (
                      <div
                        key={ord.id}
                        className="bg-white rounded-2xl p-4 border border-[#E5EAED] shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-[#18343B]">
                              طلب #{ord.order_number}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${meta?.badgeBg || 'bg-gray-100'} ${meta?.colorClass || 'text-gray-700'}`}
                            >
                              {meta?.label || ord.status}
                            </span>
                          </div>
                          <span className="text-xs font-black text-[#087E83]">
                            {ord.total_lyd} د.ل
                          </span>
                        </div>

                        <div className="text-xs text-[#74838A] space-y-1">
                          <div>العميل: {ord.customer_name_ar} ({ord.customer_phone})</div>
                          <div>طريقة الاستلام: {ord.fulfillment_method === 'pickup' ? 'استلام من المتجر' : 'توصيل داخل الكلية'}</div>
                        </div>

                        {/* Order Action Buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-[#E5EAED]">
                          {ord.status === 'pending_review' && (
                            <>
                              <button
                                type="button"
                                onClick={() => updateOrderStatus(ord.id, 'accepted')}
                                className="px-4 py-1.5 rounded-full bg-[#087E83] text-white text-xs font-extrabold hover:bg-[#06666A]"
                              >
                                قبول الطلب
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectingOrderId(ord.id)}
                                className="px-4 py-1.5 rounded-full bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100"
                              >
                                رفض الطلب
                              </button>
                            </>
                          )}
                          {ord.status === 'accepted' && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(ord.id, 'preparing')}
                              className="px-4 py-1.5 rounded-full bg-[#087E83] text-white text-xs font-extrabold"
                            >
                              بدء التجهيز
                            </button>
                          )}
                          {ord.status === 'preparing' && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(ord.id, 'ready_for_pickup')}
                              className="px-4 py-1.5 rounded-full bg-[#36A6A6] text-white text-xs font-extrabold"
                            >
                              جاهز للاستلام
                            </button>
                          )}
                          {ord.status === 'ready_for_pickup' && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(ord.id, 'completed')}
                              className="px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-extrabold"
                            >
                              تم التسليم للعميل
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: REVIEWS (التقييمات) */}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-[28px] p-6 border border-[#E5EAED] shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5EAED] pb-3">
                <h3 className="text-base font-black text-[#18343B]">
                  تقييمات الطلاب لمتجرك
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#18343B]">
                  <span>المتوسط: {ratingStats.average}</span>
                  <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                  <span className="text-[#74838A]">({ratingStats.count} تقييم)</span>
                </div>
              </div>

              {myReviews.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#74838A]">
                  لا توجد تقييمات معتمدة بعد لمتجرك. ستظهر هنا آراء وتقييمات الطلاب بعد استلام طلباتهم.
                </div>
              ) : (
                <div className="space-y-3">
                  {myReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#18343B]">
                          {rev.user_name_ar}
                        </span>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-[#74838A]">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: REPORTS & STATS (إحصائيات) */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-[28px] p-5 border border-[#E5EAED] shadow-card space-y-3">
                  <h4 className="text-sm font-black text-[#18343B]">
                    المنتجات الأكثر طلباً في متجرك
                  </h4>
                  {bestSellingMetrics.length === 0 ? (
                    <p className="text-xs text-[#74838A]">لا توجد مبيعات مكتملة بعد.</p>
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
                            {m.unitsSold} وحدة
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-[28px] p-5 border border-[#E5EAED] shadow-card space-y-3">
                  <h4 className="text-sm font-black text-[#18343B]">
                    المنتجات منخفضة المخزون
                  </h4>
                  {slowMovingProducts.length === 0 ? (
                    <p className="text-xs text-[#74838A]">المخزون متوفر بشكل ممتاز.</p>
                  ) : (
                    <div className="space-y-2">
                      {slowMovingProducts.slice(0, 5).map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] text-xs"
                        >
                          <span className="font-bold text-[#18343B]">{p.name_ar}</span>
                          <span className="text-[#74838A]">المتبقي: {p.stock_quantity}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: ACCOUNT SETTINGS & CREDENTIALS (إعدادات الحساب) */}
          {activeTab === 'account_settings' && (
            <div className="space-y-5">
              {/* Credentials Summary Box */}
              <div className="bg-white rounded-[28px] p-6 border border-[#E5EAED] shadow-card space-y-4">
                <h3 className="text-base font-black text-[#18343B] border-b border-[#E5EAED] pb-3">
                  بيانات حساب المتجر المستقلة
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED]">
                    <span className="text-[11px] font-bold text-[#74838A] block">
                      اسم المستخدم (Username)
                    </span>
                    <span className="font-black text-[#18343B] font-en text-sm mt-0.5 block">
                      {currentUser.username || 'لم يُحدد بعد'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED]">
                    <span className="text-[11px] font-bold text-[#74838A] block">
                      رمز المتجر الفريد (Store ID)
                    </span>
                    <span className="font-black text-[#087E83] font-en text-sm mt-0.5 block">
                      {merchantStore.store_code || merchantStore.id}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED]">
                    <span className="text-[11px] font-bold text-[#74838A] block">
                      البريد الإلكتروني للتاجر
                    </span>
                    <span className="font-semibold text-[#18343B] font-en mt-0.5 block">
                      {currentUser.email}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED]">
                    <span className="text-[11px] font-bold text-[#74838A] block">
                      رقم الهاتف
                    </span>
                    <span className="font-semibold text-[#18343B] font-en mt-0.5 block">
                      {currentUser.phone || merchantStore.contact_phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Change Password Form */}
              <div className="bg-white rounded-[28px] p-6 border border-[#E5EAED] shadow-card space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5EAED] pb-3">
                  <div>
                    <h3 className="text-base font-black text-[#18343B]">
                      تغيير كلمة المرور
                    </h3>
                    <p className="text-xs text-[#74838A] mt-0.5">
                      احرص على استخدام كلمة مرور قوية للحفاظ على أمان بيانات متجرك.
                    </p>
                  </div>
                  <Lock className="w-5 h-5 text-[#087E83]" />
                </div>

                {passwordError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleChangePasswordSubmit} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-bold text-[#18343B] mb-1">
                      كلمة المرور الحالية (إن وُجدت)
                    </label>
                    <input
                      type={showPasswordFields ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      dir="ltr"
                      className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-en"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#18343B] mb-1">
                      كلمة المرور الجديدة *
                    </label>
                    <input
                      type={showPasswordFields ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="6 خانات أو أكثر..."
                      dir="ltr"
                      className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-en"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#18343B] mb-1">
                      تأكيد كلمة المرور الجديدة *
                    </label>
                    <input
                      type={showPasswordFields ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="تأكيد كلمة المرور..."
                      dir="ltr"
                      className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-en"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showPass"
                      checked={showPasswordFields}
                      onChange={(e) => setShowPasswordFields(e.target.checked)}
                      className="w-4 h-4 rounded text-[#087E83]"
                    />
                    <label htmlFor="showPass" className="text-xs text-[#74838A] cursor-pointer">
                      إظهار كلمات المرور
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs sm:text-sm font-extrabold shadow-sm transition"
                  >
                    تحديث كلمة المرور
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-[#18343B]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveProductSubmit}
            className="bg-white w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto border border-[#E5EAED]"
          >
            <h3 className="text-base font-black text-[#18343B]">
              {editingProduct.id ? 'تعديل بيانات المنتج' : 'إضافة منتج أو خدمة للمتجر'}
            </h3>

            {/* Product Image */}
            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] space-y-2">
              <span className="text-xs font-extrabold text-[#18343B] block">
                صورة المنتج
              </span>
              <div className="flex items-center gap-3">
                {editingProduct.images?.[0] ? (
                  <img
                    src={editingProduct.images[0]}
                    alt="معاينة"
                    className="w-16 h-16 rounded-xl object-cover border border-[#E5EAED]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white border border-[#E5EAED] text-[#74838A] flex items-center justify-center">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                <div className="space-y-1.5 flex-1">
                  <label className="h-8 px-3 rounded-lg bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع صورة</span>
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
                    placeholder="أو رابط الصورة..."
                    className="w-full h-8 px-2.5 rounded-lg border border-[#E5EAED] text-[11px] font-en"
                  />
                </div>
              </div>
            </div>

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
                    setEditingProduct({
                      ...editingProduct,
                      name_ar: e.target.value,
                    })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-bold"
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
                  <option value="">عام (بدون قسم)</option>
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
                  className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-en font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#18343B] mb-1">
                  الكمية بالمخزون *
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
                  className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-en"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#18343B] mb-1">
                  الوصف والتفاصيل
                </label>
                <textarea
                  rows={2}
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
                className="flex-1 h-11 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs sm:text-sm font-extrabold"
              >
                حفظ المنتج
              </button>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="h-11 px-5 rounded-full border border-[#E5EAED] text-xs font-bold text-[#74838A]"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reject Order Modal */}
      {rejectingOrderId && (
        <div className="fixed inset-0 z-50 bg-[#18343B]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3">
            <h4 className="text-sm font-black text-[#18343B]">
              سبب رفض الطلب
            </h4>
            <input
              type="text"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="مثال: نفد المخزون / لا يمكن التوصيل الآن"
              className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  updateOrderStatus(
                    rejectingOrderId,
                    'rejected',
                    rejectionReason
                  );
                  setRejectingOrderId(null);
                  setRejectionReason('');
                }}
                className="flex-1 h-9 rounded-full bg-rose-600 text-white text-xs font-bold"
              >
                تأكيد الرفض
              </button>
              <button
                type="button"
                onClick={() => setRejectingOrderId(null)}
                className="h-9 px-4 rounded-full border border-[#E5EAED] text-xs text-[#74838A]"
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
