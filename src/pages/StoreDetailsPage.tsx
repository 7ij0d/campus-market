import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Heart,
  Share2,
  Star,
  MapPin,
  Clock,
  Truck,
  Flame,
  LayoutGrid,
  List,
  Coffee,
  Printer,
  BookOpen,
  Shirt,
  Laptop,
  Utensils,
  Sparkles,
  GraduationCap,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/ProductCard';
import { Store } from '../types/database';

type StoreTab = 'products' | 'categories' | 'reviews' | 'about';
type ProductSort = 'default' | 'price_asc' | 'price_desc' | 'newest' | 'most_ordered';

export const StoreDetailsPage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const {
    stores,
    products,
    storeCategories,
    reviews,
    favoritesStoreIds,
    toggleFavoriteStore,
    getStoreMostOrderedProducts,
    getStoreRatingStats,
    showToast,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<StoreTab>('products');
  const [selectedStoreCategoryId, setSelectedStoreCategoryId] = useState<string>('all');
  const [sortOption, setSortOption] = useState<ProductSort>('default');
  const [gridMode, setGridMode] = useState<'grid' | 'compact'>('grid');

  const store = useMemo(
    () => stores.find((s) => s.id === storeId && s.status === 'active'),
    [stores, storeId]
  );

  // Internal categories belonging ONLY to this store
  const currentStoreCategories = useMemo(
    () =>
      storeCategories
        .filter((sc) => sc.store_id === storeId)
        .sort((a, b) => a.sort_order - b.sort_order),
    [storeCategories, storeId]
  );

  // STRICT ISOLATION: Most Ordered Products belonging ONLY to THIS store
  // Computed strictly from completed orders of this store
  const storeMostOrderedMetrics = useMemo(() => {
    if (!storeId) return [];
    return getStoreMostOrderedProducts(storeId);
  }, [storeId, getStoreMostOrderedProducts]);

  // All active & available products belonging ONLY to THIS store
  const allStoreProducts = useMemo(() => {
    if (!storeId) return [];
    const salesOrderMap = new Map<string, number>();
    storeMostOrderedMetrics.forEach((m, idx) => salesOrderMap.set(m.product.id, idx + 1));

    const filtered = products.filter(
      (p) =>
        p.store_id === storeId &&
        p.is_active &&
        p.is_available_for_sale &&
        p.stock_quantity > 0 &&
        (selectedStoreCategoryId === 'all' ||
          p.store_category_id === selectedStoreCategoryId)
    );

    const copy = [...filtered];
    switch (sortOption) {
      case 'price_asc':
        copy.sort((a, b) => a.price_lyd - b.price_lyd);
        break;
      case 'price_desc':
        copy.sort((a, b) => b.price_lyd - a.price_lyd);
        break;
      case 'newest':
        copy.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'most_ordered':
        copy.sort((a, b) => {
          const rankA = salesOrderMap.get(a.id) ?? 999;
          const rankB = salesOrderMap.get(b.id) ?? 999;
          return rankA - rankB;
        });
        break;
      default:
        copy.sort((a, b) => a.sort_order - b.sort_order);
        break;
    }

    return copy;
  }, [storeId, products, selectedStoreCategoryId, sortOption, storeMostOrderedMetrics]);

  // Approved reviews for THIS store only
  const storeReviews = useMemo(
    () =>
      reviews
        .filter((r) => r.store_id === storeId && r.is_approved)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
    [reviews, storeId]
  );

  if (!store) {
    return (
      <div className="min-h-screen bg-[#F8F7FC] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <p className="text-base font-extrabold text-slate-800">
          عذراً، هذا المتجر غير موجود أو غير نشط حالياً.
        </p>
        <button
          type="button"
          onClick={() => navigate('/stores')}
          className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold"
        >
          العودة إلى قائمة المتاجر
        </button>
      </div>
    );
  }

  const ratingStats = getStoreRatingStats(store.id);
  const isStoreFav = favoritesStoreIds.includes(store.id);

  const renderStoreEmblemIcon = (iconType: Store['icon_type']) => {
    switch (iconType) {
      case 'coffee':
        return <Coffee className="w-8 h-8 text-white stroke-[1.9]" />;
      case 'printer':
        return <Printer className="w-8 h-8 text-white stroke-[1.9]" />;
      case 'book':
        return <BookOpen className="w-8 h-8 text-white stroke-[1.9]" />;
      case 'hoodie':
        return <Shirt className="w-8 h-8 text-white stroke-[1.9]" />;
      case 'laptop':
        return <Laptop className="w-8 h-8 text-white stroke-[1.9]" />;
      case 'utensils':
        return <Utensils className="w-8 h-8 text-white stroke-[1.9]" />;
      default:
        return <Sparkles className="w-8 h-8 text-white stroke-[1.9]" />;
    }
  };

  const handleShareStore = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    showToast(`تم نسخ رابط متجر ${store.name_en} للمشاركة 🔗`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] pb-24">
      {/* 1. TOP NAVIGATION BAR (Matches Reference Screen 3: Back Chevron on Right, Share + Favorite on Left) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 h-13 py-2.5 flex items-center justify-between">
          {/* Right in RTL: Back Button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="رجوع"
            className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Left in RTL: Share & Favorite Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareStore}
              aria-label="مشاركة المتجر"
              className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => toggleFavoriteStore(store.id)}
              aria-label="إضافة المتجر للمفضلة"
              className="w-9 h-9 rounded-full bg-slate-50 hover:bg-rose-50 flex items-center justify-center text-slate-700 transition"
            >
              <Heart
                className={`w-4 h-4 ${
                  isStoreFav ? 'fill-rose-500 text-rose-500' : 'text-slate-700'
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-3 space-y-4">
        {/* 2. STORE HEADER CARD (Matches Reference Screen 3: Cover Photo + Overlapping Emblem + Info Badges + Tabs) */}
        <section className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-card">
          {/* Cover Banner */}
          <div className="relative h-36 sm:h-48 w-full bg-slate-900 overflow-hidden">
            <img
              src={store.cover_url}
              alt={store.name_en}
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />

            {/* Cover Brand Watermark matching reference */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none pb-4">
              <GraduationCap className="w-7 h-7 text-white/90 mb-0.5" />
              <span
                dir="ltr"
                className="font-en text-xl sm:text-2xl font-extrabold tracking-tight drop-shadow"
              >
                {store.name_en}
              </span>
            </div>
          </div>

          {/* Overlapping Circular Store Logo */}
          <div className="relative px-4 pb-1 flex flex-col items-center text-center">
            <div
              className="-mt-9 w-[72px] h-[72px] rounded-full border-4 border-white shadow-md flex items-center justify-center z-10"
              style={{ backgroundColor: store.icon_bg_color }}
            >
              {renderStoreEmblemIcon(store.icon_type)}
            </div>

            {/* Store Title & Description */}
            <h1
              dir="ltr"
              className="font-en text-xl font-extrabold text-slate-900 mt-2"
            >
              {store.name_en}
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5 max-w-md">
              {store.description_ar}
            </p>

            {/* Status Row: Rating on Right + Open Status Pill on Left (Matches Reference Screen 3) */}
            <div className="flex items-center justify-center flex-wrap gap-3 mt-3">
              {/* Rating Pill */}
              <div className="flex items-center gap-1 text-xs">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                {ratingStats.count > 0 ? (
                  <>
                    <span className="font-en font-extrabold text-slate-800">
                      {ratingStats.average.toFixed(1)}
                    </span>
                    <span className="text-slate-500 font-medium">
                      ({ratingStats.count} تقييم)
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400">متجر جديد</span>
                )}
              </div>

              {/* Open / Closed Green Badge */}
              {store.working_hours && (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    store.is_open
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      store.is_open ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  <span>{store.is_open ? 'مفتوح الآن' : 'مغلق الآن'}</span>
                </span>
              )}
            </div>

            {/* Store Metadata Pills Row (داخل الكلية | توصيل داخل الكلية | 08:00 - 18:00) */}
            <div className="flex items-center justify-center flex-wrap gap-2 mt-3 w-full">
              {store.location_inside_campus && (
                <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/70 text-[11px] font-semibold text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{store.location_inside_campus}</span>
                </div>
              )}

              {(store.supports_delivery || store.supports_pickup) && (
                <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/70 text-[11px] font-semibold text-slate-700">
                  <Truck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>
                    {store.supports_delivery
                      ? 'توصيل داخل الكلية'
                      : 'استلام من المتجر فقط'}
                  </span>
                </div>
              )}

              {store.working_hours && (
                <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/70 text-[11px] font-semibold text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span dir="ltr" className="font-en">
                    {store.working_hours}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 3. STORE TABS (المنتجات | التصنيفات | التقييمات | عن المتجر) */}
          <div className="grid grid-cols-4 border-t border-slate-100 mt-4 px-2">
            {(
              [
                { id: 'products', label: 'المنتجات' },
                { id: 'categories', label: 'التصنيفات' },
                {
                  id: 'reviews',
                  label: `التقييمات (${ratingStats.count})`,
                },
                { id: 'about', label: 'عن المتجر' },
              ] as const
            ).map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 text-xs font-extrabold relative transition-colors ${
                    active
                      ? 'text-brand-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                  {active && (
                    <span className="absolute bottom-0 inset-x-3 h-[3px] rounded-t-full bg-brand-600" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* TAB 1: PRODUCTS VIEW (Matches Reference Screen 3) */}
        {activeTab === 'products' && (
          <div className="space-y-5">
            {/* 4. MOST ORDERED PRODUCTS INSIDE THIS STORE ONLY (🔥 المنتجات الأكثر طلباً) */}
            {storeMostOrderedMetrics.length > 0 && (
              <section
                aria-label="المنتجات الأكثر طلباً داخل المتجر"
                className="space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-[#EF5350] fill-[#EF5350]" />
                    <h2 className="text-[15px] font-extrabold text-slate-900">
                      المنتجات الأكثر طلباً
                    </h2>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    خاص بـ {store.name_en}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {storeMostOrderedMetrics.map(({ product }) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      showStoreName={false}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 6. STORE INTERNAL CATEGORIES HORIZONTAL PILLS (Only shown if store has internal categories) */}
            {currentStoreCategories.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                <button
                  type="button"
                  onClick={() => setSelectedStoreCategoryId('all')}
                  className={`h-8 px-3.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                    selectedStoreCategoryId === 'all'
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200/80'
                  }`}
                >
                  الكل
                </button>
                {currentStoreCategories.map((scat) => {
                  const active = selectedStoreCategoryId === scat.id;
                  return (
                    <button
                      key={scat.id}
                      type="button"
                      onClick={() => setSelectedStoreCategoryId(scat.id)}
                      className={`h-8 px-3.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                        active
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200/80 hover:border-brand-200'
                      }`}
                    >
                      {scat.name_ar}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 5. ALL STORE PRODUCTS SECTION (جميع المنتجات) */}
            <section aria-label="جميع منتجات المتجر" className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-[15px] font-extrabold text-slate-900">
                  جميع المنتجات{' '}
                  <span className="font-en text-slate-500 font-bold">
                    ({allStoreProducts.length})
                  </span>
                </h2>

                {/* Left side in RTL: Sort Select + Grid/List Toggle Icons matching Reference Screen 3 */}
                <div className="flex items-center gap-2">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as ProductSort)}
                    aria-label="ترتيب المنتجات"
                    className="h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-brand-500"
                  >
                    <option value="default">الترتيب الافتراضي</option>
                    <option value="most_ordered">الأكثر طلباً</option>
                    <option value="price_asc">السعر: من الأقل للأعلى</option>
                    <option value="price_desc">السعر: من الأعلى للأقل</option>
                    <option value="newest">الأحدث</option>
                  </select>

                  <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setGridMode('grid')}
                      aria-label="عرض شبكي"
                      className={`p-1 rounded-md transition ${
                        gridMode === 'grid'
                          ? 'bg-brand-50 text-brand-600'
                          : 'text-slate-400'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setGridMode('compact')}
                      aria-label="عرض قائمة"
                      className={`p-1 rounded-md transition ${
                        gridMode === 'compact'
                          ? 'bg-brand-50 text-brand-600'
                          : 'text-slate-400'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {allStoreProducts.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 text-xs text-slate-400">
                  لا توجد منتجات متاحة في هذا التصنيف حالياً.
                </div>
              ) : (
                <div
                  className={
                    gridMode === 'grid'
                      ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'
                      : 'grid grid-cols-1 sm:grid-cols-2 gap-3'
                  }
                >
                  {allStoreProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      showStoreName={false}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 2: STORE CATEGORIES VIEW */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card space-y-3">
            <h2 className="text-sm font-extrabold text-slate-800">
              أقسام متجر {store.name_en}
            </h2>
            {currentStoreCategories.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                لم يقم المتجر بإضافة تصنيفات فرعية بعد.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentStoreCategories.map((scat) => {
                  const count = products.filter(
                    (p) =>
                      p.store_id === store.id &&
                      p.store_category_id === scat.id &&
                      p.is_active &&
                      p.is_available_for_sale
                  ).length;
                  return (
                    <button
                      key={scat.id}
                      type="button"
                      onClick={() => {
                        setSelectedStoreCategoryId(scat.id);
                        setActiveTab('products');
                      }}
                      className="p-3.5 rounded-xl border border-slate-100 hover:border-brand-300 bg-slate-50/70 flex items-center justify-between transition"
                    >
                      <span className="text-xs font-extrabold text-slate-800">
                        {scat.name_ar}
                      </span>
                      <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                        {count} منتج
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VERIFIED REVIEWS VIEW */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-slate-800">
                  تقييمات الطلبة الفعلية
                </h2>
                <p className="text-[11px] text-slate-400">
                  تُحتسب التقييمات فقط من الطلبات المكتملة والمستلمة داخل الكلية.
                </p>
              </div>
              {ratingStats.count > 0 && (
                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-en font-extrabold text-sm text-amber-900">
                    {ratingStats.average.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {storeReviews.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                لا توجد تقييمات منشورة لهذا المتجر حتى الآن.
              </p>
            ) : (
              <div className="space-y-3">
                {storeReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-800">
                          {rev.user_name_ar}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          مشترٍ موثق
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(rev.created_at).toLocaleDateString('ar-LY')}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    {rev.comment && (
                      <p className="text-xs text-slate-600 leading-relaxed pt-1">
                        {rev.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ABOUT STORE VIEW */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card space-y-4">
            <h2 className="text-sm font-extrabold text-slate-800">
              معلومات المتجر التفصيلية
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {store.description_ar}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] text-slate-400 font-bold">
                  الموقع داخل الحرم الجامعي
                </span>
                <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-600" />
                  {store.location_inside_campus}
                </p>
              </div>
              {store.working_hours && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] text-slate-400 font-bold">
                    ساعات العمل الرسمية
                  </span>
                  <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-brand-600" />
                    <span dir="ltr" className="font-en">
                      {store.working_hours}
                    </span>
                  </p>
                </div>
              )}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] text-slate-400 font-bold">
                  خيارات التسليم والتوصيل
                </span>
                <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-brand-600" />
                  {store.supports_pickup && store.supports_delivery
                    ? `استلام مباشر أو توصيل داخل الكلية (${store.delivery_fee_lyd} د.ل)`
                    : store.supports_delivery
                    ? `توصيل داخل الكلية (${store.delivery_fee_lyd} د.ل)`
                    : 'استلام مباشر من مقر المتجر'}
                </p>
              </div>
              {store.contact_phone && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] text-slate-400 font-bold">
                    رقم التواصل المباشر
                  </span>
                  <p
                    dir="ltr"
                    className="text-xs font-en font-extrabold text-slate-800 flex items-center justify-end gap-1.5"
                  >
                    <Phone className="w-4 h-4 text-brand-600" />
                    {store.contact_phone}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
