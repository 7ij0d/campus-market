import React, { useState, useMemo } from 'react';
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
  Clock,
  Truck,
  Phone,
  ArrowRight,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Product, OrderStatus } from '../types/database';
import { STATUS_META } from './OrdersPage';

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
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<MerchantTab>('overview');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Product Form Modal State
  const [editingProduct, setEditingProduct] = useState<
    (Partial<Product> & { id?: string }) | null
  >(null);
  const [newInternalCatName, setNewInternalCatName] = useState('');

  const merchantStore = useMemo(
    () => stores.find((s) => s.id === currentUser?.store_id),
    [stores, currentUser]
  );

  // Strictly isolated products belonging ONLY to this merchant's store
  const myProducts = useMemo(() => {
    if (!merchantStore) return [];
    return products
      .filter((p) => p.store_id === merchantStore.id)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [products, merchantStore]);

  // Strictly isolated orders belonging ONLY to this merchant's store
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

  // Real metrics computed strictly from database state
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
    const avgOrderValue =
      completedCount > 0
        ? Math.round((totalRevenue / completedCount) * 10) / 10
        : 0;
    const activeProds = myProducts.filter(
      (p) => p.is_active && p.is_available_for_sale && p.stock_quantity > 0
    ).length;
    const outOfStockProds = myProducts.filter(
      (p) => !p.is_available_for_sale || p.stock_quantity <= 0
    ).length;

    return {
      totalOrders,
      newOrders,
      preparingOrders,
      completedCount,
      totalRevenue,
      avgOrderValue,
      activeProds,
      outOfStockProds,
    };
  }, [myOrders, myProducts]);

  const bestSellingMetrics = useMemo(() => {
    if (!merchantStore) return [];
    return getStoreMostOrderedProducts(merchantStore.id);
  }, [merchantStore, getStoreMostOrderedProducts]);

  // Least moving products in this store
  const slowMovingProducts = useMemo(() => {
    const soldSet = new Set(bestSellingMetrics.map((m) => m.product.id));
    return myProducts.filter((p) => !soldSet.has(p.id));
  }, [myProducts, bestSellingMetrics]);

  // Store Settings Form State
  const [storeNameEn, setStoreNameEn] = useState(merchantStore?.name_en || '');
  const [storeActivity, setStoreActivity] = useState(
    merchantStore?.activity_type_ar || ''
  );
  const [storeDesc, setStoreDesc] = useState(
    merchantStore?.description_ar || ''
  );
  const [storeLoc, setStoreLoc] = useState(
    merchantStore?.location_inside_campus || ''
  );
  const [storeHours, setStoreHours] = useState(
    merchantStore?.working_hours || ''
  );
  const [storePhone, setStorePhone] = useState(
    merchantStore?.contact_phone || ''
  );
  const [storeDeliveryFee, setStoreDeliveryFee] = useState(
    merchantStore?.delivery_fee_lyd ?? 3
  );

  // If currentUser is not a merchant, show role guard with instant 1-click switch to a merchant account
  if (!currentUser || currentUser.role !== 'merchant' || !merchantStore) {
    const merchantAccounts = users.filter((u) => u.role === 'merchant');
    return (
      <div className="min-h-screen bg-[#F8F7FC] pb-24 px-4 pt-10">
        <div className="max-w-lg mx-auto bg-white rounded-3xl p-6 border border-slate-100 shadow-card text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Briefcase className="w-7 h-7" />
          </div>
          <h1 className="text-base font-extrabold text-slate-900">
            هذه الصفحة مخصصة لأصحاب المتاجر فقط (Merchant RBAC Guard)
          </h1>
          <p className="text-xs text-slate-500">
            أنت مسجل حالياً بحساب ({currentUser?.full_name || 'زائر'}). يمكنك التبديل
            الفوري لأي من حسابات المتاجر التالية لاختبار لوحة التاجر المعزولة:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-right">
            {merchantAccounts.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => switchQuickAccount(m.id)}
                className="p-3 rounded-xl border border-brand-200 bg-brand-50/50 hover:bg-brand-100 transition text-xs font-extrabold text-brand-900"
              >
                دخول كـ: {m.full_name}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs font-bold text-slate-500 hover:underline pt-2 block mx-auto"
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

  return (
    <div className="min-h-screen bg-[#F8F7FC] pb-28">
      {/* Top Merchant Header */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
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
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold bg-brand-600 px-2 py-0.5 rounded-full">
                  لوحة التاجر
                </span>
                <h1 dir="ltr" className="font-en text-base font-extrabold">
                  {merchantStore.name_en}
                </h1>
              </div>
              <p className="text-[11px] text-slate-400">
                {merchantStore.activity_type_ar} • صلاحيات معزولة لهذا المتجر فقط
              </p>
            </div>
          </div>

          {/* Open / Closed Live Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                updateMerchantStoreInfo({ is_open: !merchantStore.is_open })
              }
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition ${
                merchantStore.is_open
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  merchantStore.is_open ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
              <span>
                {merchantStore.is_open ? 'المتجر مفتوح الآن' : 'المتجر مغلق'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`/store/${merchantStore.id}`)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold"
            >
              معاينة متجري
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-white/10">
          {(
            [
              { id: 'overview', label: 'نظرة عامة', icon: Briefcase },
              {
                id: 'orders',
                label: `الطلبات (${kpiStats.newOrders} جديد)`,
                icon: ShoppingBag,
              },
              {
                id: 'products',
                label: `المنتجات (${myProducts.length})`,
                icon: Package,
              },
              { id: 'settings', label: 'إعدادات المتجر', icon: Settings },
              { id: 'reports', label: 'التقارير والمبيعات', icon: BarChart3 },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-3 text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap border-b-2 transition ${
                  active
                    ? 'border-brand-400 text-white bg-white/5'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-5 space-y-5">
        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* 8 Real KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card">
                <span className="text-[11px] font-bold text-slate-400">
                  إجمالي المبيعات المكتملة
                </span>
                <p className="text-xl font-extrabold text-brand-700 mt-1">
                  {kpiStats.totalRevenue} د.ل
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card">
                <span className="text-[11px] font-bold text-slate-400">
                  الطلبات الجديدة (قيد المراجعة)
                </span>
                <p className="text-xl font-extrabold text-amber-600 mt-1">
                  {kpiStats.newOrders}
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card">
                <span className="text-[11px] font-bold text-slate-400">
                  طلبات قيد التجهيز والتوصيل
                </span>
                <p className="text-xl font-extrabold text-blue-600 mt-1">
                  {kpiStats.preparingOrders}
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card">
                <span className="text-[11px] font-bold text-slate-400">
                  الطلبات المكتملة
                </span>
                <p className="text-xl font-extrabold text-emerald-600 mt-1">
                  {kpiStats.completedCount} / {kpiStats.totalOrders}
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card">
                <span className="text-[11px] font-bold text-slate-400">
                  المنتجات النشطة والمتاحة
                </span>
                <p className="text-xl font-extrabold text-slate-900 mt-1">
                  {kpiStats.activeProds}
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card">
                <span className="text-[11px] font-bold text-slate-400">
                  منتجات غير متوفرة / نفدت
                </span>
                <p className="text-xl font-extrabold text-rose-600 mt-1">
                  {kpiStats.outOfStockProds}
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card">
                <span className="text-[11px] font-bold text-slate-400">
                  متوسط قيمة الطلب
                </span>
                <p className="text-xl font-extrabold text-slate-900 mt-1">
                  {kpiStats.avgOrderValue} د.ل
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card">
                <span className="text-[11px] font-bold text-slate-400">
                  أفضل منتج مبيعاً
                </span>
                <p className="text-sm font-extrabold text-brand-700 mt-1.5 truncate">
                  {bestSellingMetrics[0]?.product.name_ar || 'لا توجد مبيعات بعد'}
                </p>
              </div>
            </div>

            {/* Best Selling Products in Store */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-slate-800">
                  أفضل المنتجات مبيعاً في {merchantStore.name_en} (من الطلبات المكتملة)
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  إدارة المنتجات
                </button>
              </div>

              {bestSellingMetrics.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  لا توجد طلبات مكتملة لاحتساب الأكثر مبيعاً حتى الآن.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {bestSellingMetrics.map(({ product, unitsSold, ordersCount }) => (
                    <div
                      key={product.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={product.images[0]}
                          alt={product.name_ar}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-slate-900 truncate">
                            {product.name_ar}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {product.price_lyd} د.ل • المخزون: {product.stock_quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-left shrink-0">
                        <span className="block text-xs font-extrabold text-brand-700">
                          {unitsSold} مباع
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {ordersCount} طلبات
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
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
                  className={`h-9 px-3.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
                    orderStatusFilter === st.id
                      ? 'bg-brand-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {filteredMerchantOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-slate-100">
                لا توجد طلبات ضمن هذه الحالة.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMerchantOrders.map((ord) => {
                  const meta = STATUS_META[ord.status];
                  return (
                    <div
                      key={ord.id}
                      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card space-y-3"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            dir="ltr"
                            className="font-en text-xs font-extrabold bg-brand-50 text-brand-700 px-2.5 py-1 rounded-lg"
                          >
                            #{ord.order_number}
                          </span>
                          <span className="text-xs font-extrabold text-slate-900">
                            الطالب: {ord.customer_name_ar}
                          </span>
                          <a
                            href={`tel:${ord.customer_phone}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md"
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

                      {/* Order Items */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ord.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={item.product_image_snapshot}
                                alt={item.product_name_snapshot}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-extrabold text-slate-800">
                                  {item.product_name_snapshot} × {item.quantity}
                                </p>
                                {Object.keys(item.selected_options_snapshot)
                                  .length > 0 && (
                                  <p className="text-[10px] text-slate-500">
                                    {Object.entries(
                                      item.selected_options_snapshot
                                    )
                                      .map(([k, v]) => `${k}: ${v}`)
                                      .join(' | ')}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="font-extrabold">
                              {item.line_total_lyd} د.ل
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-600 pt-1">
                        <div className="flex items-center gap-3">
                          <span className="font-bold flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-brand-600" />
                            {ord.fulfillment_method === 'campus_delivery'
                              ? `توصيل إلى: ${ord.campus_location_ar} (${ord.pickup_point_ar})`
                              : 'استلام مباشر من المتجر'}
                          </span>
                          {ord.customer_note && (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold">
                              ملاحظة: {ord.customer_note}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-extrabold text-slate-900">
                          الإجمالي: {ord.total_lyd} د.ل
                        </span>
                      </div>

                      {/* Merchant Status Action Buttons */}
                      <div className="flex items-center justify-end flex-wrap gap-2 pt-2 border-t border-slate-100">
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
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>قبول الطلب</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectingOrderId(ord.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-extrabold flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>رفض الطلب مع ذكر السبب</span>
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
                            className="px-3.5 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-extrabold"
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
                              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-extrabold"
                            >
                              تحديد كـ جاهز للاستلام
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
                                className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-extrabold"
                              >
                                خرج للتوصيل داخل الكلية
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
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold"
                          >
                            تأكيد التسليم وإكمال الطلب ✅
                          </button>
                        )}
                      </div>

                      {/* Inline Reject Reason Input */}
                      {rejectingOrderId === ord.id && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2">
                          <input
                            type="text"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="اكتب سبب رفض الطلب لإشعار الطالب..."
                            className="flex-1 h-9 px-3 rounded-lg bg-white border border-rose-200 text-xs"
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
                            className="px-3 h-9 rounded-lg bg-rose-600 text-white text-xs font-extrabold"
                          >
                            تأكيد الرفض
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectingOrderId(null)}
                            className="px-2.5 h-9 rounded-lg bg-white text-slate-600 text-xs font-bold"
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

        {/* TAB 3: PRODUCTS & INVENTORY MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Internal Categories Bar + Add Product Button */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  value={newInternalCatName}
                  onChange={(e) => setNewInternalCatName(e.target.value)}
                  placeholder="اسم تصنيف داخلي جديد..."
                  className="h-9 px-3 rounded-xl border border-slate-200 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newInternalCatName.trim()) return;
                    addMerchantStoreCategory(newInternalCatName);
                    setNewInternalCatName('');
                  }}
                  className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  + إضافة تصنيف للمتجر
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
                    images: [
                      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
                    ],
                    is_active: true,
                    is_available_for_sale: true,
                  })
                }
                className="h-10 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج جديد</span>
              </button>
            </div>

            {/* Products Table / Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {myProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-card flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={prod.images[0]}
                      alt={prod.name_ar}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100"
                    />
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-extrabold text-slate-900 truncate">
                          {prod.name_ar}
                        </h3>
                        {!prod.is_active && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                            مخفي
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-extrabold text-brand-700">
                        {prod.price_lyd} د.ل{' '}
                        {prod.old_price_lyd && (
                          <span className="text-[10px] text-slate-400 line-through">
                            {prod.old_price_lyd} د.ل
                          </span>
                        )}
                      </p>
                      <p
                        className={`text-[11px] font-bold ${
                          prod.stock_quantity > 5
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}
                      >
                        المخزون المتاح: {prod.stock_quantity} قطعة
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
                      title={prod.is_active ? 'إخفاء المنتج' : 'إظهار المنتج'}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
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
                      title="تعديل المنتج"
                      className="w-8 h-8 rounded-lg bg-brand-50 hover:bg-brand-100 flex items-center justify-center text-brand-700"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteMerchantProduct(prod.id)}
                      title="حذف المنتج"
                      className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 flex items-center justify-center text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: STORE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card max-w-2xl space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2.5">
              إدارة معلومات وإعدادات المتجر
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  اسم المتجر (بالإنجليزية)
                </label>
                <input
                  type="text"
                  value={storeNameEn}
                  onChange={(e) => setStoreNameEn(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-en"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  نوع النشاط
                </label>
                <input
                  type="text"
                  value={storeActivity}
                  onChange={(e) => setStoreActivity(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  وصف المتجر
                </label>
                <textarea
                  rows={2}
                  value={storeDesc}
                  onChange={(e) => setStoreDesc(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  الموقع داخل الكلية
                </label>
                <input
                  type="text"
                  value={storeLoc}
                  onChange={(e) => setStoreLoc(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  ساعات العمل الرسمية
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={storeHours}
                  onChange={(e) => setStoreHours(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-en"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  رقم التواصل
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-en"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  رسوم التوصيل داخل الكلية (د.ل)
                </label>
                <input
                  type="number"
                  min={0}
                  value={storeDeliveryFee}
                  onChange={(e) => setStoreDeliveryFee(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                updateMerchantStoreInfo({
                  name_en: storeNameEn,
                  activity_type_ar: storeActivity,
                  description_ar: storeDesc,
                  location_inside_campus: storeLoc,
                  working_hours: storeHours,
                  contact_phone: storePhone,
                  delivery_fee_lyd: storeDeliveryFee,
                })
              }
              className="px-6 h-10 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold"
            >
              حفظ تعديلات المتجر
            </button>
          </div>
        )}

        {/* TAB 5: MERCHANT REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card space-y-3">
                <h3 className="text-sm font-extrabold text-slate-800">
                  المنتجات الأكثر مبيعاً (حسب الكميات المباعة فعلياً)
                </h3>
                {bestSellingMetrics.length === 0 ? (
                  <p className="text-xs text-slate-400">لا توجد بيانات مبيعات بعد.</p>
                ) : (
                  <div className="space-y-2">
                    {bestSellingMetrics.map((m, idx) => (
                      <div
                        key={m.product.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs"
                      >
                        <span className="font-bold text-slate-800">
                          {idx + 1}. {m.product.name_ar}
                        </span>
                        <span className="font-extrabold text-brand-700">
                          {m.unitsSold} وحدة ({m.unitsSold * m.product.price_lyd} د.ل)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card space-y-3">
                <h3 className="text-sm font-extrabold text-slate-800">
                  المنتجات الأقل حركة
                </h3>
                {slowMovingProducts.length === 0 ? (
                  <p className="text-xs text-emerald-600 font-bold">
                    جميع منتجاتك حققت مبيعات نشطة!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {slowMovingProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs"
                      >
                        <span className="font-bold text-slate-700">{p.name_ar}</span>
                        <span className="text-slate-400">
                          0 مبيعات مكتملة • المخزون: {p.stock_quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ADD / EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveProductSubmit}
            className="bg-white w-full max-w-lg rounded-3xl p-5 space-y-3.5 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-base font-extrabold text-slate-900">
              {editingProduct.id ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للمتجر'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم المنتج (بالعربية)
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name_ar || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name_ar: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  التصنيف الداخلي بالمتجر
                </label>
                <select
                  value={editingProduct.store_category_id || ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      store_category_id: e.target.value,
                    })
                  }
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="">بدون تصنيف فرعي</option>
                  {myInternalCategories.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name_ar}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  السعر الحالي (د.ل)
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
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  السعر قبل الخصم (اختياري لتفعيل عرض)
                </label>
                <input
                  type="number"
                  min={0}
                  value={editingProduct.old_price_lyd || ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      old_price_lyd: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="اتركه فارغاً إن لم يوجد خصم"
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الكمية المتوفرة في المخزون
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
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  القسم العام في المنصة
                </label>
                <select
                  value={editingProduct.category_id || 'cat-food'}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      category_id: e.target.value,
                    })
                  }
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  {categories
                    .filter((c) => c.id !== 'cat-all')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name_ar}
                      </option>
                    ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رابط صورة المنتج
                </label>
                <input
                  type="url"
                  dir="ltr"
                  value={editingProduct.images?.[0] || ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      images: [e.target.value],
                    })
                  }
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-en"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  وصف المنتج
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
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 h-10 rounded-xl bg-brand-600 text-white text-xs font-extrabold"
              >
                حفظ المنتج
              </button>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 h-10 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
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
