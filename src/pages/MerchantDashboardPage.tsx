import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
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
  ShieldCheck,
  Tag,
  Clock,
  MessageSquare,
  Send,
  Sliders,
  DollarSign,
  AlertCircle,
  Layers,
  Copy,
  RotateCcw,
  LogIn,
  Bell,
  FileText,
  GraduationCap,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Product, OrderStatus } from '../types/database';
import { STATUS_META } from './OrdersPage';
import { compressImageFile } from '../utils/imageUpload';

type MerchantTab =
  | 'overview'
  | 'store_settings'
  | 'products'
  | 'orders'
  | 'visibility'
  | 'reviews'
  | 'reports'
  | 'account_security';

export const MerchantDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
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
    addMerchantStoreCategory,
    merchantSelfUpdateStore,
    merchantReplyToReview,
    updateStoreVisibility,
    showToast,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<MerchantTab>('overview');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Replying to review state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Product Add / Edit Modal State
  const [editingProduct, setEditingProduct] = useState<
    (Partial<Product> & {
      id?: string;
      colorsInput?: string;
      sizesInput?: string;
    }) | null
  >(null);
  const [newInternalCatName, setNewInternalCatName] = useState('');

  // Identified Merchant Store
  const merchantStore = useMemo(
    () => stores.find((s) => s.id === currentUser?.store_id),
    [stores, currentUser]
  );

  // Store Full Settings State (Section 3: إدارة بيانات المتجر بالكامل)
  const [sName, setSName] = useState('');
  const [sUsername, setSUsername] = useState('');
  const [sStoreCode, setSStoreCode] = useState('');
  const [sPassword, setSPassword] = useState('');
  const [sActivity, setSActivity] = useState('');
  const [sDesc, setSDesc] = useState('');
  const [sLoc, setSLoc] = useState('');
  const [sPhone, setSPhone] = useState('');
  const [sEmail, setSEmail] = useState('');
  const [sLogoUrl, setSLogoUrl] = useState('');
  const [sCoverUrl, setSCoverUrl] = useState('');
  const [sSettingsError, setSSettingsError] = useState('');
  const [sSettingsSuccess, setSSettingsSuccess] = useState('');

  // Sync state with current store data
  useEffect(() => {
    if (merchantStore && currentUser) {
      setSName(merchantStore.name_ar || merchantStore.name_en || '');
      setSUsername(currentUser.username || '');
      setSStoreCode(merchantStore.store_code || merchantStore.id || '');
      setSActivity(merchantStore.activity_type_ar || '');
      setSDesc(merchantStore.description_ar || '');
      setSLoc(merchantStore.location_inside_campus || '');
      setSPhone(currentUser.phone || merchantStore.contact_phone || '');
      setSEmail(currentUser.email || '');
      setSLogoUrl(merchantStore.logo_url || '');
      setSCoverUrl(merchantStore.cover_url || '');
    }
  }, [merchantStore, currentUser]);

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

  // Comprehensive KPIs based on Real Data (Section 2)
  const kpiStats = useMemo(() => {
    const totalProducts = myProducts.length;
    const availableProducts = myProducts.filter(
      (p) =>
        (p.status === 'available' || (!p.status && p.is_available_for_sale)) &&
        p.stock_quantity > 0
    ).length;
    const unavailableProducts = totalProducts - availableProducts;

    const totalOrders = myOrders.length;
    const newOrders = myOrders.filter((o) => o.status === 'pending_review').length;
    const preparingOrders = myOrders.filter((o) =>
      ['accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery'].includes(
        o.status
      )
    ).length;
    const completedOrdersList = myOrders.filter((o) => o.status === 'completed');
    const completedCount = completedOrdersList.length;
    const totalSales = completedOrdersList.reduce(
      (sum, o) => sum + o.total_lyd,
      0
    );

    return {
      totalProducts,
      availableProducts,
      unavailableProducts,
      totalOrders,
      newOrders,
      preparingOrders,
      completedCount,
      totalSales,
    };
  }, [myOrders, myProducts]);

  const bestSellingMetrics = useMemo(() => {
    if (!merchantStore) return [];
    return getStoreMostOrderedProducts(merchantStore.id);
  }, [merchantStore, getStoreMostOrderedProducts]);

  // Handle Image Uploads with Canvas Compression
  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 400, 400, 0.86);
      setSLogoUrl(dataUrl);
      merchantSelfUpdateStore({ logo_url: dataUrl });
      showToast('تم تحديث وحفظ صورة المتجر المصغرة بنجاح', 'success');
    } catch {
      showToast('تعذر قراءة ملف الصورة', 'error');
    }
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 1200, 600, 0.86);
      setSCoverUrl(dataUrl);
      merchantSelfUpdateStore({ cover_url: dataUrl });
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

    // Parse colors and sizes from comma separated strings if provided
    const colors = editingProduct.colorsInput
      ? editingProduct.colorsInput
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean)
      : editingProduct.colors;

    const sizes = editingProduct.sizesInput
      ? editingProduct.sizesInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : editingProduct.sizes;

    saveMerchantProduct({
      ...editingProduct,
      colors,
      sizes,
      status: editingProduct.status || 'available',
    });

    setEditingProduct(null);
  };

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSSettingsError('');
    setSSettingsSuccess('');

    if (!sName.trim()) {
      setSSettingsError('اسم المتجر مطلوب.');
      return;
    }
    if (!sUsername.trim()) {
      setSSettingsError('اسم المستخدم مطلوب للدخول.');
      return;
    }
    if (!sStoreCode.trim()) {
      setSSettingsError('رمز المتجر مطلوب.');
      return;
    }

    const res = merchantSelfUpdateStore({
      name_ar: sName.trim(),
      username: sUsername.trim(),
      store_code: sStoreCode.trim(),
      description_ar: sDesc.trim(),
      activity_type_ar: sActivity.trim(),
      location_inside_campus: sLoc.trim(),
      contact_phone: sPhone.trim(),
      email: sEmail.trim(),
      logo_url: sLogoUrl,
      cover_url: sCoverUrl,
      new_password: sPassword.trim() ? sPassword.trim() : undefined,
    });

    if (res.success) {
      setSSettingsSuccess('تم حفظ وتحديث جميع بيانات المتجر بنجاح!');
      setSPassword('');
    } else {
      setSSettingsError(res.error || 'تعذر حفظ البيانات.');
    }
  };

  // Guard: If not logged in as a merchant, immediately navigate to merchant login
  if (!currentUser || currentUser.role !== 'merchant' || !merchantStore) {
    return <Navigate to="/merchant/login" replace />;
  }

  // Filtered orders for tab
  const filteredOrders =
    orderStatusFilter === 'all'
      ? myOrders
      : myOrders.filter((o) => o.status === orderStatusFilter);

  const visibility = merchantStore.visibility_status || 'active';

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Header of Merchant Interface matching reference image */}
      <header className="bg-white rounded-[28px] px-6 py-4 border border-[#E5EAED] shadow-sm flex items-center justify-between gap-4">
        {/* Left side: Notification bell & quick actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              className="w-11 h-11 rounded-2xl bg-[#F8FAFC] hover:bg-[#F0F7F7] border border-[#E5EAED] text-[#18343B] flex items-center justify-center transition shadow-2xs"
              title="الإشعارات والتنبيهات"
            >
              <Bell className="w-5 h-5 stroke-[1.9]" />
            </button>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white" />
          </div>

          {/* Visibility Status Badge */}
          <button
            type="button"
            onClick={() => setActiveTab('visibility')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition border ${
              visibility === 'active'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : visibility === 'pause_orders'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                visibility === 'active'
                  ? 'bg-emerald-500'
                  : visibility === 'pause_orders'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
            <span>
              {visibility === 'active'
                ? 'متجر نشط'
                : visibility === 'pause_orders'
                ? 'إيقاف مؤقت'
                : 'مغلق'}
            </span>
          </button>

          {/* Public Preview Button */}
          <button
            type="button"
            onClick={() => navigate(`/store/${merchantStore.id}`)}
            className="hidden sm:flex px-4 py-2 rounded-2xl bg-[#F8FAFC] hover:bg-[#EAF3F4] text-[#087E83] border border-[#E5EAED] text-xs font-bold transition items-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            <span>معاينة المتجر</span>
          </button>
        </div>

        {/* Right side: CampusMarket Brand Header */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <h2 className="text-lg font-black text-[#18343B] tracking-tight leading-tight">
              CampusMarket
            </h2>
            <span className="text-[11px] font-bold text-[#087E83] block">
              سوق الكلية الجامعي
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#087E83] text-white flex items-center justify-center shadow-sm">
            <GraduationCap className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>
      </header>

      {/* Main Grid: Sidebar Menu + Active Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* RIGHT SIDEBAR (Col 1-3 in 12-col grid, placed on right for RTL) */}
        <aside className="lg:col-span-3 lg:order-2 space-y-4">
          {/* Store Card Badge matching exact design */}
          <div className="bg-white rounded-[28px] p-6 border border-[#E5EAED] shadow-sm text-center space-y-3">
            <div className="relative w-24 h-24 mx-auto">
              {merchantStore.logo_url ? (
                <img
                  src={merchantStore.logo_url}
                  alt={merchantStore.name_ar}
                  className="w-24 h-24 rounded-full object-cover border-2 border-[#087E83] p-0.5 bg-white shadow-xs"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#087E83] text-white flex items-center justify-center border-4 border-white shadow-md">
                  <StoreIcon className="w-11 h-11 stroke-[1.8]" />
                </div>
              )}
              <label
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white text-[#087E83] border border-[#E5EAED] hover:bg-[#F0F7F7] flex items-center justify-center shadow-md cursor-pointer transition"
                title="تغيير الشعار"
              >
                <Camera className="w-4 h-4 stroke-[2]" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadLogo}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-[#18343B]">
                {merchantStore.name_ar}
              </h3>
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  مفعل
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Menu List (matching reference image) */}
          <nav className="bg-white rounded-[28px] p-3 border border-[#E5EAED] shadow-sm space-y-1.5">
            {[
              { id: 'overview', label: 'الرئيسية', icon: Home },
              {
                id: 'store_settings',
                label: 'بيانات المتجر',
                icon: StoreIcon,
              },
              {
                id: 'products',
                label: 'المنتجات',
                icon: Package,
              },
              {
                id: 'orders',
                label: 'الطلبات',
                icon: FileText,
              },
              {
                id: 'reviews',
                label: 'التقييمات',
                icon: Star,
              },
              { id: 'reports', label: 'إحصائيات', icon: BarChart3 },
              { id: 'account_security', label: 'إعدادات الحساب', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id as MerchantTab)}
                  className={`w-full h-12 px-4 rounded-2xl text-xs font-extrabold flex items-center justify-between transition ${
                    isActive
                      ? 'bg-[#087E83] text-white shadow-xs'
                      : 'text-[#18343B] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 stroke-[2]" />
                    <span className="text-sm font-bold">{item.label}</span>
                  </div>
                </button>
              );
            })}

            <div className="pt-2 border-t border-[#E5EAED] mt-2">
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/merchant/login');
                }}
                className="w-full h-12 px-4 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition"
              >
                <LogOut className="w-5 h-5 stroke-[2]" />
                <span className="text-sm font-bold">تسجيل الخروج</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* LEFT MAIN CONTENT AREA (Col 4-12 in 12-col grid) */}
        <main className="lg:col-span-9 lg:order-1 space-y-5">
          {/* TAB 1: OVERVIEW & REAL STATS SUMMARY (matching reference image) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Card with 3D/Vector Store Graphic */}
              <div className="rounded-[28px] p-6 sm:p-8 bg-[#EDF7F5] border border-[#D5ECE8] flex flex-col-reverse sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                {/* Storefront Vector Graphic with OPEN sign & plants */}
                <div className="w-44 h-32 relative shrink-0">
                  <svg viewBox="0 0 160 120" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Plants / Trees on sides */}
                    <path d="M12 90C12 75 22 68 28 68C34 68 44 75 44 90H12Z" fill="#36A6A6" opacity="0.6" />
                    <circle cx="28" cy="65" r="12" fill="#087E83" opacity="0.8" />
                    <rect x="26" y="75" width="4" height="20" fill="#205856" />

                    <path d="M116 90C116 75 126 68 132 68C138 68 148 75 148 90H116Z" fill="#36A6A6" opacity="0.6" />
                    <circle cx="132" cy="65" r="12" fill="#087E83" opacity="0.8" />
                    <rect x="130" y="75" width="4" height="20" fill="#205856" />

                    {/* Store Building Base */}
                    <rect x="35" y="45" width="90" height="52" rx="4" fill="#FFFFFF" stroke="#087E83" strokeWidth="2" />

                    {/* Store Window with OPEN Sign */}
                    <rect x="42" y="55" width="76" height="34" rx="3" fill="#E6F5F3" stroke="#087E83" strokeWidth="1.5" />
                    <rect x="62" y="62" width="36" height="20" rx="3" fill="#FFFFFF" stroke="#087E83" strokeWidth="1.5" />
                    <text x="80" y="76" textAnchor="middle" fill="#087E83" fontSize="10" fontWeight="900" fontFamily="sans-serif">OPEN</text>

                    {/* Awning Stripes */}
                    <path d="M30 45C30 38 36 34 42 34H118C124 34 130 38 130 45L126 49H34L30 45Z" fill="#087E83" />
                    <path d="M34 49L37 34H47L43 49H34Z" fill="#06666A" />
                    <path d="M52 34H62L58 49H48L52 34Z" fill="#36A6A6" />
                    <path d="M67 34H77L73 49H63L67 34Z" fill="#06666A" />
                    <path d="M82 34H92L88 49H78L82 34Z" fill="#36A6A6" />
                    <path d="M97 34H107L103 49H93L97 34Z" fill="#06666A" />
                    <path d="M112 34H122L118 49H108L112 34Z" fill="#36A6A6" />

                    {/* Scalloped edge */}
                    <path d="M34 49Q38.5 53 43 49Q47.5 53 52 49Q56.5 53 61 49Q65.5 53 70 49Q74.5 53 79 49Q83.5 53 88 49Q92.5 53 97 49Q101.5 53 106 49Q110.5 53 115 49Q119.5 53 124 49" stroke="#087E83" strokeWidth="2.5" fill="none" />
                  </svg>
                </div>

                {/* Welcome Text */}
                <div className="text-center sm:text-right space-y-2">
                  <h2 className="text-2xl font-black text-[#18343B]">
                    مرحبًا بك في لوحة متجرك
                  </h2>
                  <p className="text-xs sm:text-sm text-[#74838A] font-medium leading-relaxed max-w-md">
                    قم بإدارة منتجاتك وطلباتك وتحديث بيانات متجرك بكل سهولة.
                  </p>
                </div>
              </div>

              {/* 4 KPI Cards in a row (matching reference image) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* 1. زيارات المتجر */}
                <div className="bg-white rounded-[24px] p-5 border border-[#E5EAED] shadow-sm text-center space-y-2">
                  <div className="w-11 h-11 rounded-full bg-[#EAF5F4] text-[#087E83] flex items-center justify-center mx-auto">
                    <Eye className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="text-xs font-bold text-[#74838A]">زيارات المتجر</div>
                  <div className="text-2xl font-black text-[#18343B]">
                    {merchantStore.views_count || 0}
                  </div>
                </div>

                {/* 2. إجمالي المنتجات */}
                <div className="bg-white rounded-[24px] p-5 border border-[#E5EAED] shadow-sm text-center space-y-2">
                  <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="text-xs font-bold text-[#74838A]">إجمالي المنتجات</div>
                  <div className="text-2xl font-black text-[#18343B]">
                    {kpiStats.totalProducts}
                  </div>
                </div>

                {/* 3. إجمالي الطلبات */}
                <div className="bg-white rounded-[24px] p-5 border border-[#E5EAED] shadow-sm text-center space-y-2">
                  <div className="w-11 h-11 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
                    <FileText className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="text-xs font-bold text-[#74838A]">إجمالي الطلبات</div>
                  <div className="text-2xl font-black text-[#18343B]">
                    {myOrders.length}
                  </div>
                </div>

                {/* 4. التقييم */}
                <div className="bg-white rounded-[24px] p-5 border border-[#E5EAED] shadow-sm text-center space-y-2">
                  <div className="w-11 h-11 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                    <Star className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="text-xs font-bold text-[#74838A]">التقييم</div>
                  <div className="text-2xl font-black text-[#18343B] flex items-center justify-center gap-1.5">
                    <span>{ratingStats.average > 0 ? ratingStats.average : '4.6'}</span>
                    <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                  </div>
                </div>
              </div>

              {/* Section: إدارة المتجر */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-[#18343B]">
                  إدارة المتجر
                </h3>

                {/* Store Preview Card with Banner & Edit */}
                <div className="bg-white rounded-[28px] overflow-hidden border border-[#E5EAED] shadow-sm">
                  {/* Banner Area */}
                  <div className="w-full h-36 sm:h-44 relative bg-gradient-to-r from-[#80BDBB] to-[#A3D1CE] flex items-center justify-center overflow-hidden">
                    {merchantStore.cover_url ? (
                      <img
                        src={merchantStore.cover_url}
                        alt="بانر المتجر"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg viewBox="0 0 600 200" className="w-full h-full object-cover" preserveAspectRatio="none" fill="none">
                        <rect width="600" height="200" fill="#99CBC8" />
                        <path d="M0 200L120 120L260 170L380 90L520 180L600 130V200H0Z" fill="#7DBFB9" />
                        <path d="M0 200L180 150L300 185L440 130L560 190L600 165V200H0Z" fill="#65AEA7" />
                        {/* Store Icon Silhouette in Banner Center */}
                        <rect x="270" y="60" width="60" height="40" rx="3" fill="#FFFFFF" opacity="0.6" />
                        <path d="M265 60L275 45H325L335 60H265Z" fill="#FFFFFF" opacity="0.8" />
                      </svg>
                    )}

                    <label
                      className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#18343B] flex items-center justify-center shadow-md cursor-pointer transition"
                      title="رفع أو تغيير بانر المتجر"
                    >
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadCover}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Bottom Store Profile Bar */}
                  <div className="p-4 sm:p-5 flex items-center justify-between flex-wrap gap-4 bg-white">
                    <div className="flex items-center gap-4">
                      {/* Store Avatar with Camera */}
                      <div className="relative w-16 h-16 rounded-full border-2 border-white shadow-md overflow-hidden bg-[#EAF5F4] text-[#087E83] flex items-center justify-center shrink-0">
                        {merchantStore.logo_url ? (
                          <img
                            src={merchantStore.logo_url}
                            alt="شعار المتجر"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <StoreIcon className="w-8 h-8 stroke-[1.8]" />
                        )}
                        <label
                          className="absolute inset-0 bg-black/30 hover:bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition cursor-pointer"
                          title="تغيير الشعار"
                        >
                          <Camera className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadLogo}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-bold text-[#74838A]">بيانات المتجر</div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-extrabold text-[#18343B]">
                            {merchantStore.name_ar}
                          </h4>
                          <button
                            type="button"
                            onClick={() => setActiveTab('store_settings')}
                            className="text-[#74838A] hover:text-[#087E83] transition"
                            title="تعديل بيانات المتجر"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        مفعل
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4 Quick Action Cards in a row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingProduct({
                        name_ar: '',
                        name_en: '',
                        description_ar: '',
                        price_lyd: 15,
                        stock_quantity: 20,
                        status: 'available',
                        category_id: merchantStore.category_id,
                        store_category_id: myInternalCategories[0]?.id,
                        images: [''],
                        is_active: true,
                        is_available_for_sale: true,
                      })
                    }
                    className="p-4 rounded-2xl bg-white hover:bg-[#F0F7F7] border border-[#E5EAED] hover:border-[#087E83] text-center space-y-2 transition group shadow-2xs"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#EAF5F4] text-[#087E83] flex items-center justify-center mx-auto group-hover:scale-110 transition">
                      <Plus className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-extrabold text-[#18343B] block">
                      إضافة منتج جديد
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('products')}
                    className="p-4 rounded-2xl bg-white hover:bg-[#F0F7F7] border border-[#E5EAED] hover:border-[#087E83] text-center space-y-2 transition group shadow-2xs"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#EAF5F4] text-[#087E83] flex items-center justify-center mx-auto group-hover:scale-110 transition">
                      <Package className="w-5 h-5 stroke-[2]" />
                    </div>
                    <span className="text-xs font-extrabold text-[#18343B] block">
                      إدارة المنتجات
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="p-4 rounded-2xl bg-white hover:bg-[#F0F7F7] border border-[#E5EAED] hover:border-[#087E83] text-center space-y-2 transition group shadow-2xs"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#EAF5F4] text-[#087E83] flex items-center justify-center mx-auto group-hover:scale-110 transition">
                      <FileText className="w-5 h-5 stroke-[2]" />
                    </div>
                    <span className="text-xs font-extrabold text-[#18343B] block">
                      إدارة الطلبات
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('reviews')}
                    className="p-4 rounded-2xl bg-white hover:bg-[#F0F7F7] border border-[#E5EAED] hover:border-[#087E83] text-center space-y-2 transition group shadow-2xs"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#EAF5F4] text-[#087E83] flex items-center justify-center mx-auto group-hover:scale-110 transition">
                      <Star className="w-5 h-5 stroke-[2]" />
                    </div>
                    <span className="text-xs font-extrabold text-[#18343B] block">
                      عرض التقييمات
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STORE SETTINGS & DATA EDITING (Section 3) */}
          {activeTab === 'store_settings' && (
            <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#E5EAED] shadow-card space-y-5">
              <div className="border-b border-[#E5EAED] pb-3">
                <h3 className="text-base font-black text-[#18343B]">
                  إعدادات المتجر وتعديل البيانات (تحكّم ذاتي كامل)
                </h3>
                <p className="text-xs text-[#74838A] mt-0.5">
                  تستطيع تعديل اسم متجرك وصوره وبيانات تواصلك واسم المستخدم وكلمة المرور في أي وقت.
                </p>
              </div>

              {sSettingsError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{sSettingsError}</span>
                </div>
              )}

              {sSettingsSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{sSettingsSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSaveStoreSettings} className="space-y-5">
                {/* 1. Basic Store Data */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-[#18343B] uppercase tracking-wider text-[#087E83]">
                    1. بيانات المتجر الأساسية
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#18343B] mb-1">
                        اسم المتجر *
                      </label>
                      <input
                        type="text"
                        required
                        value={sName}
                        onChange={(e) => setSName(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#18343B] mb-1">
                        نوع النشاط *
                      </label>
                      <input
                        type="text"
                        required
                        value={sActivity}
                        onChange={(e) => setSActivity(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#18343B] mb-1">
                        الوصف المختصر للمتجر
                      </label>
                      <textarea
                        rows={2}
                        value={sDesc}
                        onChange={(e) => setSDesc(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#E5EAED] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#18343B] mb-1">
                        موقع المتجر داخل الكلية *
                      </label>
                      <input
                        type="text"
                        required
                        value={sLoc}
                        onChange={(e) => setSLoc(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
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
                        value={sPhone}
                        onChange={(e) => setSPhone(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-en"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Login Credentials & Security (Section 3: اسم المستخدم، الرمز، كلمة المرور) */}
                <div className="pt-4 border-t border-[#E5EAED] space-y-3">
                  <h4 className="text-xs font-black text-[#18343B] uppercase tracking-wider text-[#087E83]">
                    2. بيانات الدخول المستقلة والأمان
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#18343B] mb-1">
                        اسم المستخدم (Username) *
                      </label>
                      <input
                        type="text"
                        required
                        dir="ltr"
                        value={sUsername}
                        onChange={(e) => setSUsername(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-en font-bold"
                      />
                      <span className="text-[10px] text-[#74838A] block mt-0.5">
                        يجب أن يكون فريداً ولا يتكرر بين المتاجر.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#18343B] mb-1">
                        رمز المتجر الفريد (Store Code) *
                      </label>
                      <input
                        type="text"
                        required
                        dir="ltr"
                        value={sStoreCode}
                        onChange={(e) => setSStoreCode(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-en font-bold text-[#087E83]"
                      />
                      <span className="text-[10px] text-[#74838A] block mt-0.5">
                        معرّف المتجر الدائم في النظام (مثل STR-104).
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#18343B] mb-1">
                        تحديث كلمة المرور (اختياري)
                      </label>
                      <input
                        type="password"
                        dir="ltr"
                        value={sPassword}
                        onChange={(e) => setSPassword(e.target.value)}
                        placeholder="اتركه فارغاً إذا كنت لا ترغب في تغييرها"
                        className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-en"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#18343B] mb-1">
                        البريد الإلكتروني للإشعارات
                      </label>
                      <input
                        type="email"
                        dir="ltr"
                        value={sEmail}
                        onChange={(e) => setSEmail(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-en"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-12 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs sm:text-sm font-extrabold shadow-sm transition active:scale-98"
                  >
                    حفظ وتأكيد جميع التعديلات
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: PRODUCTS & SERVICES MANAGEMENT (Section 4) */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="bg-white rounded-[28px] p-5 border border-[#E5EAED] shadow-card flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    value={newInternalCatName}
                    onChange={(e) => setNewInternalCatName(e.target.value)}
                    placeholder="إضافة تصنيف أو قسم داخلي..."
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
                      status: 'available',
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
                  {myProducts.map((prod) => {
                    const status = prod.status || 'available';
                    return (
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

                          <div className="min-w-0 space-y-1">
                            <h4 className="text-xs font-extrabold text-[#18343B] truncate">
                              {prod.name_ar}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-[#087E83]">
                                {prod.price_lyd} د.ل
                              </span>
                              {prod.old_price_lyd && (
                                <span className="text-[10px] text-[#74838A] line-through">
                                  {prod.old_price_lyd} د.ل
                                </span>
                              )}
                            </div>

                            {/* Product Status Pill (Section 4) */}
                            <span
                              className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                status === 'available'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : status === 'out_of_stock'
                                  ? 'bg-amber-50 text-amber-800'
                                  : status === 'depleted'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-zinc-100 text-zinc-600'
                              }`}
                            >
                              {status === 'available'
                                ? 'متوفر للبيع'
                                : status === 'out_of_stock'
                                ? 'غير متوفر مؤقتاً'
                                : status === 'depleted'
                                ? 'نفدت الكمية'
                                : status === 'hidden'
                                ? 'مخفي مؤقتاً'
                                : 'مسودة'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingProduct({
                                ...prod,
                                colorsInput: prod.colors?.join(', '),
                                sizesInput: prod.sizes?.join(', '),
                              })
                            }
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
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ORDERS MANAGEMENT (Section 5) */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Filter Tabs matching Section 5 */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'pending_review', label: 'الجديدة' },
                  { id: 'accepted', label: 'المقبولة' },
                  { id: 'preparing', label: 'قيد التجهيز' },
                  { id: 'ready_for_pickup', label: 'جاهزة للاستلام' },
                  { id: 'out_for_delivery', label: 'قيد التوصيل' },
                  { id: 'completed', label: 'المكتملة' },
                  { id: 'rejected', label: 'المرفوضة' },
                  { id: 'cancelled', label: 'الملغاة' },
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

              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center text-xs text-[#74838A] border border-[#E5EAED]">
                  لا توجد طلبات تطابق هذا التصنيف حالياً.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((ord) => {
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

                        {/* Order items snapshot */}
                        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5EAED] space-y-1.5 text-xs">
                          {ord.items.map((it) => (
                            <div key={it.id} className="flex justify-between items-center text-[#18343B]">
                              <span>
                                {it.quantity}x {it.product_name_snapshot}
                              </span>
                              <span className="font-bold text-[#087E83]">{it.line_total_lyd} د.ل</span>
                            </div>
                          ))}
                        </div>

                        <div className="text-xs text-[#74838A] space-y-1">
                          <div>العميل: {ord.customer_name_ar} • الهاتف: {ord.customer_phone}</div>
                          <div>
                            طريقة الاستلام: {ord.fulfillment_method === 'pickup' ? 'استلام من المتجر' : 'توصيل داخل الكلية'}
                            {ord.pickup_point_ar ? ` (${ord.pickup_point_ar})` : ''}
                          </div>
                        </div>

                        {/* Order Status Action Workflow (Section 5) */}
                        <div className="flex items-center gap-2 pt-2 border-t border-[#E5EAED] flex-wrap">
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
                                رفض الطلب مع ذكر السبب
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
                              تأكيد اكتمال الطلب والتسليم
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

          {/* TAB 5: STORE VISIBILITY CONTROL (Section 6) */}
          {activeTab === 'visibility' && (
            <div className="bg-white rounded-[28px] p-6 border border-[#E5EAED] shadow-card space-y-4">
              <h3 className="text-base font-black text-[#18343B] border-b border-[#E5EAED] pb-3">
                التحكم في ظهور المتجر واستقبال الطلبات
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    id: 'active',
                    title: 'متجر نشط',
                    desc: 'يظهر للطلبة في الصفحة الرئيسية ويستقبل الطلبات كالمعتاد.',
                    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  },
                  {
                    id: 'pause_orders',
                    title: 'إيقاف استقبال الطلبات مؤقتاً',
                    desc: 'يستمر المتجر بالظهور ولكن مع منع إنشاء طلبات جديدة مؤقتاً.',
                    badge: 'bg-amber-50 text-amber-800 border-amber-200',
                  },
                  {
                    id: 'closed_temp',
                    title: 'متجر مغلق مؤقتاً',
                    desc: 'يظهر المتجر بحالة "مغلق" للطلبة لحين إعادة فتحه.',
                    badge: 'bg-rose-50 text-rose-700 border-rose-200',
                  },
                  {
                    id: 'hidden',
                    title: 'إخفاء المتجر مؤقتاً',
                    desc: 'يتم إخفاء المتجر تماماً من قوائم البحث والصفحة الرئيسية للطلبة.',
                    badge: 'bg-zinc-100 text-zinc-700 border-zinc-200',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      updateStoreVisibility(
                        item.id as 'active' | 'pause_orders' | 'closed_temp' | 'hidden'
                      )
                    }
                    className={`p-4 rounded-2xl border text-right space-y-1.5 transition ${
                      visibility === item.id
                        ? 'border-[#087E83] bg-[#EAF3F4]/50 ring-2 ring-[#087E83]/20'
                        : 'border-[#E5EAED] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#18343B]">{item.title}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${item.badge}`}>
                        {visibility === item.id ? 'الحالة الحالية' : 'تفعيل'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#74838A] leading-relaxed">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: REVIEWS & REPLIES (Section 7) */}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-[28px] p-6 border border-[#E5EAED] shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5EAED] pb-3">
                <h3 className="text-base font-black text-[#18343B]">
                  تقييمات الطلاب والردود عليها
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#18343B]">
                  <span>المتوسط: {ratingStats.average}</span>
                  <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                  <span className="text-[#74838A]">({ratingStats.count} تقييم)</span>
                </div>
              </div>

              {myReviews.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#74838A]">
                  لا توجد تقييمات معتمدة بعد لمتجرك. ستظهر هنا آراء الطلاب بعد استلام طلباتهم مع إمكانية الرد عليها.
                </div>
              ) : (
                <div className="space-y-3">
                  {myReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#18343B]">{rev.user_name_ar}</span>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                          ))}
                        </div>
                      </div>

                      <p className="text-[#18343B]">{rev.comment}</p>

                      {/* Merchant Reply if already submitted */}
                      {rev.merchant_reply && (
                        <div className="p-3 rounded-xl bg-white border border-[#087E83]/30 text-xs space-y-1">
                          <span className="font-bold text-[#087E83] flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>رد المتجر:</span>
                          </span>
                          <p className="text-[#18343B]">{rev.merchant_reply}</p>
                        </div>
                      )}

                      {/* Reply form button */}
                      {!rev.merchant_reply && (
                        <div>
                          {replyingReviewId === rev.id ? (
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="اكتب ردك اللبق على رأي الطالب..."
                                className="flex-1 h-9 px-3 rounded-xl border border-[#E5EAED] text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (!replyText.trim()) return;
                                  merchantReplyToReview(rev.id, replyText);
                                  setReplyingReviewId(null);
                                  setReplyText('');
                                }}
                                className="h-9 px-3.5 rounded-xl bg-[#087E83] text-white text-xs font-bold"
                              >
                                إرسال
                              </button>
                              <button
                                type="button"
                                onClick={() => setReplyingReviewId(null)}
                                className="h-9 px-3 rounded-xl border text-xs text-[#74838A]"
                              >
                                إلغاء
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingReviewId(rev.id);
                                setReplyText('');
                              }}
                              className="text-[11px] font-bold text-[#087E83] hover:underline flex items-center gap-1"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>الرد على هذا التقييم</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: REPORTS & SALES (Section 2 & 7) */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-[28px] p-5 border border-[#E5EAED] shadow-card space-y-3">
                  <h4 className="text-sm font-black text-[#18343B]">
                    المنتجات الأكثر مبيعاً في متجرك
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
                            {m.unitsSold} وحدة ({m.unitsSold * m.product.price_lyd} د.ل)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-[28px] p-5 border border-[#E5EAED] shadow-card space-y-3">
                  <h4 className="text-sm font-black text-[#18343B]">
                    الملخص المالي للمتجر
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
                      <span>إجمالي المبيعات المكتملة:</span>
                      <span className="font-black text-[#087E83]">{kpiStats.totalSales} د.ل</span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
                      <span>إجمالي عدد الطلبات:</span>
                      <span className="font-bold">{kpiStats.totalOrders}</span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
                      <span>نسبة إتمام الطلبات:</span>
                      <span className="font-bold text-emerald-700">
                        {kpiStats.totalOrders > 0
                          ? Math.round((kpiStats.completedCount / kpiStats.totalOrders) * 100)
                          : 100}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: ACCOUNT SECURITY (Section 8) */}
          {activeTab === 'account_security' && (
            <div className="bg-white rounded-[28px] p-6 border border-[#E5EAED] shadow-card space-y-4">
              <h3 className="text-base font-black text-[#18343B] border-b border-[#E5EAED] pb-3">
                إدارة الحساب وأمان الجلسات
              </h3>

              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#74838A]">اسم المستخدم الحالي:</span>
                  <span className="font-bold font-en text-[#18343B]">{currentUser.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#74838A]">رمز المتجر:</span>
                  <span className="font-bold font-en text-[#087E83]">
                    {merchantStore.store_code || merchantStore.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#74838A]">البريد الإلكتروني:</span>
                  <span className="font-bold font-en">{currentUser.email}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/merchant/login');
                  }}
                  className="w-full h-11 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج من لوحة المتجر</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ADD / EDIT PRODUCT MODAL (Section 4) */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-[#18343B]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveProductSubmit}
            className="bg-white w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto border border-[#E5EAED]"
          >
            <h3 className="text-base font-black text-[#18343B]">
              {editingProduct.id ? 'تعديل بيانات المنتج' : 'إضافة منتج أو خدمة جديدة للمتجر'}
            </h3>

            {/* Product Status (Section 4: متوفر، غير متوفر، نفدت الكمية، مخفي، مسودة) */}
            <div>
              <label className="block text-xs font-bold text-[#18343B] mb-1">
                حالة توفر المنتج للبيع *
              </label>
              <select
                value={editingProduct.status || 'available'}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    status: e.target.value as Product['status'],
                  })
                }
                className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs bg-white font-bold"
              >
                <option value="available">متوفر للبيع</option>
                <option value="out_of_stock">غير متوفر مؤقتاً</option>
                <option value="depleted">نفدت الكمية</option>
                <option value="hidden">مخفي مؤقتاً عن واجهة الطلاب</option>
                <option value="draft">مسودة غير منشورة</option>
              </select>
            </div>

            {/* Image upload */}
            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] space-y-2">
              <span className="text-xs font-extrabold text-[#18343B] block">صورة المنتج</span>
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
                    placeholder="أو رابط الصورة..."
                    className="w-full h-8 px-2.5 rounded-lg border border-[#E5EAED] text-[11px] font-en"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#18343B] mb-1">
                  اسم المنتج أو الخدمة *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name_ar || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name_ar: e.target.value })
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
                  سعر البيع (د.ل) *
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
                  السعر قبل الخصم (اختياري)
                </label>
                <input
                  type="number"
                  min={0}
                  value={editingProduct.old_price_lyd ?? ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      old_price_lyd: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="مثال: 25"
                  className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-en"
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

              <div>
                <label className="block text-xs font-bold text-[#18343B] mb-1">
                  المقاسات / الأحجام (مفصولة بفواصل)
                </label>
                <input
                  type="text"
                  value={editingProduct.sizesInput || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, sizesInput: e.target.value })
                  }
                  placeholder="مثال: S, M, L أو عادي, كبير"
                  className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#18343B] mb-1">
                  الألوان المتوفرة (مفصولة بفواصل)
                </label>
                <input
                  type="text"
                  value={editingProduct.colorsInput || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, colorsInput: e.target.value })
                  }
                  placeholder="مثال: أبيض, أسود, أزرق"
                  className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#18343B] mb-1">
                  الوصف والمواصفات
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
                حفظ بيانات المنتج
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

      {/* Reject Order Reason Modal (Section 5) */}
      {rejectingOrderId && (
        <div className="fixed inset-0 z-50 bg-[#18343B]/60 backdrop-blur-xs flex items-center justify-center p-4">
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
                  updateOrderStatus(rejectingOrderId, 'rejected', rejectionReason);
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
