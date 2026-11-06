import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Bell,
  ShoppingCart,
  GraduationCap,
  Search,
  MapPin,
  ChevronDown,
  ChevronLeft,
  LayoutGrid,
  Settings,
  Gamepad2,
  Shirt,
  BookOpen,
  Utensils,
  Watch,
  Flame,
  Tag,
  X,
  Store as StoreIcon,
  Check,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/ProductCard';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    cartCount,
    unreadNotificationsCount,
    locations,
    selectedLocationId,
    selectedPickupPoint,
    setSelectedLocationId,
    setSelectedPickupPoint,
    banners,
    categories,
    products,
    stores,
    getPlatformMostOrderedProducts,
    getSpecialOfferProducts,
  } = useMarketplace();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('cat-all');
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const activeBanners = useMemo(
    () =>
      banners
        .filter((b) => b.is_active)
        .sort((a, b) => a.sort_order - b.sort_order),
    [banners]
  );

  // Auto-advance banner every 6 seconds if multiple exist
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  const currentLocation =
    locations.find((l) => l.id === selectedLocationId) || locations[0];

  const activeCategories = useMemo(
    () =>
      categories
        .filter((c) => c.is_active)
        .sort((a, b) => a.sort_order - b.sort_order),
    [categories]
  );

  // Real platform-wide most ordered products
  const mostOrderedMetrics = useMemo(
    () => getPlatformMostOrderedProducts(),
    [getPlatformMostOrderedProducts]
  );

  // Real special offer products
  const specialOffers = useMemo(
    () => getSpecialOfferProducts(),
    [getSpecialOfferProducts]
  );

  // Live search results across active products and active stores
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const activeStoreSet = new Set(
      stores.filter((s) => s.status === 'active').map((s) => s.id)
    );

    const matchedProducts = products.filter(
      (p) =>
        p.is_active &&
        p.is_available_for_sale &&
        activeStoreSet.has(p.store_id) &&
        (p.name_ar.toLowerCase().includes(q) ||
          (p.name_en && p.name_en.toLowerCase().includes(q)) ||
          p.description_ar.toLowerCase().includes(q))
    );

    const matchedStores = stores.filter(
      (s) =>
        s.status === 'active' &&
        (s.name_en.toLowerCase().includes(q) ||
          s.name_ar.toLowerCase().includes(q) ||
          s.activity_type_ar.toLowerCase().includes(q) ||
          s.description_ar.toLowerCase().includes(q))
    );

    return { matchedProducts, matchedStores };
  }, [searchQuery, products, stores]);

  // Filtered products when a specific category other than 'cat-all' is selected
  const categoryFilteredProducts = useMemo(() => {
    if (selectedCategoryId === 'cat-all') return null;
    const activeStoreSet = new Set(
      stores.filter((s) => s.status === 'active').map((s) => s.id)
    );
    return products.filter(
      (p) =>
        p.is_active &&
        p.is_available_for_sale &&
        p.stock_quantity > 0 &&
        activeStoreSet.has(p.store_id) &&
        p.category_id === selectedCategoryId
    );
  }, [selectedCategoryId, products, stores]);

  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutGrid':
        return <LayoutGrid className="w-5 h-5" />;
      case 'Settings':
        return <Settings className="w-5 h-5" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-5 h-5" />;
      case 'Shirt':
        return <Shirt className="w-5 h-5" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5" />;
      case 'Utensils':
        return <Utensils className="w-5 h-5" />;
      case 'Watch':
        return <Watch className="w-5 h-5" />;
      default:
        return <LayoutGrid className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] pb-24">
      {/* 1. COMPACT HEADER (Exact match to Reference Screen 1) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-header">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          {/* Right Side in RTL: Brand Identity (Logo + CampusMarket + سوق الكلية الجامعي) */}
          <div
            onClick={() => {
              setSelectedCategoryId('cat-all');
              setSearchQuery('');
            }}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <GraduationCap className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="flex flex-col text-right">
              <span
                dir="ltr"
                className="font-en text-[17px] font-extrabold tracking-tight text-brand-800 leading-none"
              >
                CampusMarket
              </span>
              <span className="text-[11.5px] font-semibold text-slate-500 mt-1 leading-none">
                سوق الكلية الجامعي
              </span>
            </div>
          </div>

          {/* Left Side in RTL: Cart + Notifications + Account Icons */}
          <div className="flex items-center gap-2">
            {/* Cart Button */}
            <button
              type="button"
              onClick={() => navigate('/cart')}
              aria-label="السلة"
              className="relative w-9 h-9 rounded-full bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-700 flex items-center justify-center transition"
            >
              <ShoppingCart className="w-[19px] h-[19px]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Notifications Button */}
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              aria-label="الإشعارات"
              className="relative w-9 h-9 rounded-full bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-700 flex items-center justify-center transition"
            >
              <Bell className="w-[19px] h-[19px]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            {/* Profile Avatar Button */}
            <button
              type="button"
              onClick={() => navigate('/account')}
              aria-label="حسابي"
              className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 hover:bg-brand-200 flex items-center justify-center transition font-bold text-xs"
            >
              {currentUser ? (
                <User className="w-[19px] h-[19px] fill-brand-700/20" />
              ) : (
                <User className="w-[19px] h-[19px]" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-3.5 space-y-5">
        {/* 2. SEARCH BAR & CAMPUS LOCATION SELECTOR ROW (Exact match to Reference Screen 1) */}
        <div className="flex items-center gap-2.5">
          {/* Search Input (Right side in RTL) */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن منتج أو متجر..."
              className="w-full h-11 pr-10 pl-8 rounded-full bg-white border border-slate-200/80 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 shadow-sm transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Campus Location Selector Pill (Left side in RTL: داخل الكلية) */}
          <button
            type="button"
            onClick={() => setShowLocationModal(true)}
            className="h-11 px-3.5 rounded-full bg-white border border-slate-200/80 hover:border-brand-300 shadow-sm flex items-center gap-1.5 shrink-0 transition active:scale-95"
          >
            <MapPin className="w-4 h-4 text-brand-600 fill-brand-100 shrink-0" />
            <span className="text-xs font-bold text-slate-700 max-w-[95px] sm:max-w-[150px] truncate">
              {currentLocation.name_ar}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>
        </div>

        {/* LIVE SEARCH RESULTS OVERLAY VIEW */}
        {searchResults ? (
          <div className="space-y-5 bg-white rounded-2xl p-4 border border-slate-100 shadow-card">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-800">
                نتائج البحث عن: &ldquo;{searchQuery}&rdquo;
              </h2>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-brand-600 font-bold hover:underline"
              >
                إغلاق البحث
              </button>
            </div>

            {searchResults.matchedStores.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-500">
                  المتاجر المطابقة ({searchResults.matchedStores.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {searchResults.matchedStores.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => navigate(`/store/${st.id}`)}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-brand-200 bg-slate-50/60 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={st.logo_url}
                          alt={st.name_en}
                          className="w-11 h-11 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-en font-bold text-sm text-slate-800">
                            {st.name_en}
                          </p>
                          <p className="text-xs text-slate-500">{st.activity_type_ar}</p>
                        </div>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-500">
                المنتجات والخدمات ({searchResults.matchedProducts.length})
              </h3>
              {searchResults.matchedProducts.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  لا توجد منتجات مطابقة لبحثك حالياً.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {searchResults.matchedProducts.map((prod) => (
                    <ProductCard key={prod.id} product={prod} showStoreName />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* 3. PROMOTIONAL PURPLE BANNER (Matches Reference Screen 1) */}
            {activeBanners.length > 0 && (
              <section aria-label="الإعلانات الجامعية">
                {(() => {
                  const currentBanner =
                    activeBanners[activeBannerIdx % activeBanners.length];
                  return (
                    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-l from-[#5B21B6] via-[#7C3AED] to-[#9333EA] text-white shadow-card min-h-[152px] sm:min-h-[180px] flex items-center justify-between p-4 sm:p-6">
                      {/* Decorative soft glow circles */}
                      <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
                      <div className="absolute -bottom-10 left-1/3 w-28 h-28 rounded-full bg-brand-300/20 pointer-events-none" />

                      {/* Right side in RTL: Text + CTA Button */}
                      <div className="relative z-10 flex-1 max-w-[62%] sm:max-w-[60%] space-y-1.5 text-right">
                        <h2 className="text-base sm:text-xl font-extrabold leading-snug">
                          {currentBanner.title_ar}
                        </h2>
                        <p className="text-[11.5px] sm:text-xs text-brand-100 font-medium">
                          {currentBanner.subtitle_ar}
                        </p>
                        <div className="pt-1.5">
                          <button
                            type="button"
                            onClick={() => navigate(currentBanner.target_link)}
                            className="inline-flex items-center gap-1 bg-white text-brand-700 hover:bg-brand-50 font-extrabold text-xs px-4 py-2 rounded-full shadow-sm transition active:scale-95"
                          >
                            <span>{currentBanner.cta_text_ar}</span>
                            <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>

                      {/* Left side in RTL: University Items Illustration / Image */}
                      <div className="relative z-10 w-[36%] sm:w-[34%] flex items-center justify-center">
                        <div className="relative w-28 h-28 sm:w-36 sm:h-32 rounded-2xl overflow-hidden border-2 border-white/25 shadow-lg bg-brand-900/30">
                          <img
                            src={currentBanner.image_url}
                            alt={currentBanner.title_ar}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-1.5 right-1.5 bg-brand-700/90 backdrop-blur-sm text-white p-1.5 rounded-lg shadow">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      {/* Pagination Dots at Bottom Center */}
                      {activeBanners.length > 1 && (
                        <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5 z-20">
                          {activeBanners.map((b, idx) => (
                            <button
                              key={b.id}
                              type="button"
                              aria-label={`إعلان ${idx + 1}`}
                              onClick={() => setActiveBannerIdx(idx)}
                              className={`h-1.5 rounded-full transition-all ${
                                idx === activeBannerIdx % activeBanners.length
                                  ? 'w-4 bg-white'
                                  : 'w-1.5 bg-white/45'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </section>
            )}

            {/* 4. MAIN CATEGORIES HORIZONTAL ROW (Matches Reference Screen 1) */}
            <section aria-label="الأقسام الرئيسية" className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <LayoutGrid className="w-4 h-4 text-brand-600" />
                  <h2 className="text-[15px] font-extrabold text-slate-800">
                    الأقسام الرئيسية
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/stores')}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
                >
                  <span>عرض الكل</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-start gap-3 overflow-x-auto no-scrollbar pb-1 pt-0.5">
                {activeCategories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
                    >
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-brand-600 text-white shadow-md scale-105 ring-2 ring-brand-300'
                            : 'bg-white text-brand-600 border border-slate-100 shadow-sm group-hover:border-brand-200'
                        }`}
                        style={
                          !isSelected
                            ? {
                                backgroundColor: cat.color_bg,
                                color: cat.color_text,
                              }
                            : undefined
                        }
                      >
                        {renderCategoryIcon(cat.icon_name)}
                      </div>
                      <span
                        className={`text-[11.5px] max-w-[68px] text-center leading-tight line-clamp-2 ${
                          isSelected
                            ? 'font-extrabold text-brand-700'
                            : 'font-semibold text-slate-700'
                        }`}
                      >
                        {cat.name_ar}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Category Filter Results View (if user clicked a specific category chip) */}
            {categoryFilteredProducts !== null && (
              <section className="space-y-3 bg-white p-3.5 rounded-2xl border border-brand-100 shadow-card">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-slate-800">
                    منتجات قسم:{' '}
                    <span className="text-brand-600">
                      {activeCategories.find((c) => c.id === selectedCategoryId)?.name_ar}
                    </span>{' '}
                    ({categoryFilteredProducts.length})
                  </h2>
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId('cat-all')}
                    className="text-xs font-bold text-slate-500 hover:text-brand-600"
                  >
                    إظهار الكل
                  </button>
                </div>

                {categoryFilteredProducts.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    لا توجد منتجات متاحة في هذا القسم حالياً.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {categoryFilteredProducts.map((prod) => (
                      <ProductCard key={prod.id} product={prod} showStoreName />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* 5. MOST ORDERED PRODUCTS PLATFORM-WIDE (المنتجات الأكثر طلباً) */}
            {mostOrderedMetrics.length > 0 && (
              <section aria-label="المنتجات الأكثر طلباً" className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-brand-600 fill-brand-500" />
                    <h2 className="text-[15px] font-extrabold text-slate-800">
                      المنتجات الأكثر طلباً
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/stores')}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
                  >
                    <span>عرض الكل</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {mostOrderedMetrics.slice(0, 4).map(({ product }) => (
                    <ProductCard key={product.id} product={product} showStoreName />
                  ))}
                </div>
              </section>
            )}

            {/* 6. SPECIAL OFFERS SECTION (عروض خاصة) */}
            {specialOffers.length > 0 && (
              <section aria-label="عروض خاصة" className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-brand-600" />
                    <h2 className="text-[15px] font-extrabold text-slate-800">
                      عروض خاصة
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/stores')}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
                  >
                    <span>عرض الكل</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Promotional Offer Highlight Strip + 2-Column Offer Products Grid */}
                <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-brand-700 via-brand-600 to-purple-500 p-3.5 text-white flex items-center justify-between shadow-sm">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                      خصومات الطلبة الحصرية
                    </span>
                    <h3 className="text-sm font-extrabold pt-0.5">
                      وفّر حتى 25% على المستلزمات والقهوة والملابس الجامعية
                    </h3>
                  </div>
                  <StoreIcon className="w-8 h-8 text-white/80 shrink-0" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {specialOffers.map((prod) => (
                    <ProductCard key={prod.id} product={prod} showStoreName />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* CAMPUS LOCATION & PICKUP POINT MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-600" />
                <h3 className="text-base font-extrabold text-slate-800">
                  تحديد الموقع داخل الكلية
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-600">
                اختر الكلية أو الحرم الجامعي:
              </label>
              <div className="space-y-2">
                {locations.map((loc) => {
                  const active = loc.id === selectedLocationId;
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        setSelectedLocationId(loc.id);
                        if (loc.pickup_points.length > 0) {
                          setSelectedPickupPoint(loc.pickup_points[0]);
                        }
                      }}
                      className={`w-full p-3 rounded-xl border text-right flex items-center justify-between transition ${
                        active
                          ? 'border-brand-600 bg-brand-50/60 text-brand-900'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-extrabold">{loc.name_ar}</p>
                        <p className="text-[11px] text-slate-500">{loc.campus_name_ar}</p>
                      </div>
                      {active && <Check className="w-4 h-4 text-brand-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600">
                نقطة الاستلام / التوصيل المفضلة داخل الكلية:
              </label>
              <select
                value={selectedPickupPoint}
                onChange={(e) => setSelectedPickupPoint(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-brand-600"
              >
                {currentLocation.pickup_points.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowLocationModal(false)}
              className="w-full h-11 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition"
            >
              تأكيد الموقع
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
