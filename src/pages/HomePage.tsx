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
  ChevronRight,
  LayoutGrid,
  Settings,
  Gamepad2,
  Shirt,
  BookOpen,
  Utensils,
  Watch,
  Flame,
  Tag,
  ShoppingBag,
  Store as StoreIcon,
  Heart,
  X,
  Check,
  Star,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/ProductCard';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cartCount,
    unreadNotificationsCount,
    favoritesProductIds,
    favoritesStoreIds,
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
    getStoreRatingStats,
  } = useMarketplace();

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

  const activeStores = useMemo(
    () => stores.filter((s) => s.status === 'active'),
    [stores]
  );

  // Real platform-wide most ordered products (or active products if no orders yet)
  const mostOrderedMetrics = useMemo(
    () => getPlatformMostOrderedProducts(),
    [getPlatformMostOrderedProducts]
  );

  const activeProducts = useMemo(() => {
    const activeStoreSet = new Set(activeStores.map((s) => s.id));
    return products.filter(
      (p) =>
        p.is_active &&
        p.is_available_for_sale &&
        p.stock_quantity > 0 &&
        activeStoreSet.has(p.store_id)
    );
  }, [products, activeStores]);

  // Display most ordered products if completed orders exist, otherwise newly added active products
  const displayedMostOrderedProducts = useMemo(() => {
    if (mostOrderedMetrics.length > 0) {
      return mostOrderedMetrics.map((m) => m.product);
    }
    return activeProducts;
  }, [mostOrderedMetrics, activeProducts]);

  // Real special offer products
  const specialOffers = useMemo(
    () => getSpecialOfferProducts(),
    [getSpecialOfferProducts]
  );

  // Filtered products when a specific category other than 'cat-all' is selected
  const categoryFilteredProducts = useMemo(() => {
    if (selectedCategoryId === 'cat-all') return null;
    return activeProducts.filter((p) => p.category_id === selectedCategoryId);
  }, [selectedCategoryId, activeProducts]);

  const totalFavs = favoritesProductIds.length + favoritesStoreIds.length;

  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutGrid':
        return <LayoutGrid className="w-6 h-6 stroke-[1.9]" />;
      case 'Settings':
        return <Settings className="w-6 h-6 stroke-[1.9]" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-6 h-6 stroke-[1.9]" />;
      case 'Shirt':
        return <Shirt className="w-6 h-6 stroke-[1.9]" />;
      case 'BookOpen':
        return <BookOpen className="w-6 h-6 stroke-[1.9]" />;
      case 'Utensils':
        return <Utensils className="w-6 h-6 stroke-[1.9]" />;
      case 'Watch':
        return <Watch className="w-6 h-6 stroke-[1.9]" />;
      default:
        return <LayoutGrid className="w-6 h-6 stroke-[1.9]" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* =====================================================================
          MOBILE & TABLET TOP HEADER (Hidden on Desktop where AppNavigation shows Top Header)
      ===================================================================== */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5EAED] shadow-header">
        <div className="px-4 py-3 flex items-center justify-between gap-2">
          {/* Right in RTL: Brand Logo + CampusMarket + سوق الكلية الجامعي */}
          <div
            onClick={() => setSelectedCategoryId('cat-all')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#087E83] flex items-center justify-center text-white shadow-2xs shrink-0">
              <GraduationCap className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="flex flex-col text-right">
              <span
                dir="ltr"
                className="font-en text-[17px] font-extrabold tracking-tight text-[#18343B] leading-none"
              >
                CampusMarket
              </span>
              <span className="text-[11px] font-bold text-[#74838A] mt-1 leading-none">
                سوق الكلية الجامعي
              </span>
            </div>
          </div>

          {/* Left in RTL: Cart + Notifications + Favorites + Profile Icons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => navigate('/cart')}
              aria-label="السلة"
              className="relative w-9 h-9 rounded-full bg-[#F8FAFC] border border-[#E5EAED] text-[#18343B] hover:text-[#087E83] flex items-center justify-center transition"
            >
              <ShoppingCart className="w-[18px] h-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -left-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#087E83] text-white text-[10px] font-extrabold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/favorites')}
              aria-label="المفضلة"
              className="relative w-9 h-9 rounded-full bg-[#F8FAFC] border border-[#E5EAED] text-[#18343B] hover:text-[#087E83] flex items-center justify-center transition"
            >
              <Heart className="w-[18px] h-[18px]" />
              {totalFavs > 0 && (
                <span className="absolute -top-1 -left-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#087E83] text-white text-[9px] font-extrabold flex items-center justify-center">
                  {totalFavs}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/notifications')}
              aria-label="الإشعارات"
              className="relative w-9 h-9 rounded-full bg-[#F8FAFC] border border-[#E5EAED] text-[#18343B] hover:text-[#087E83] flex items-center justify-center transition"
            >
              <Bell className="w-[18px] h-[18px]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-[#F3C95B] ring-2 ring-white" />
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/account')}
              aria-label="حسابي"
              className="w-9 h-9 rounded-full bg-[#EAF3F4] text-[#087E83] flex items-center justify-center transition font-bold text-xs"
            >
              <User className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 lg:px-0 space-y-6">
        {/* =====================================================================
            MOBILE SEARCH BAR & CAMPUS LOCATION SELECTOR (Hidden on Desktop where Header has it)
        ===================================================================== */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/search')}
            className="relative flex-1 h-11 pr-10 pl-4 rounded-full bg-white border border-[#E5EAED] text-right text-xs text-[#74838A] flex items-center shadow-2xs"
          >
            <Search className="w-4 h-4 text-[#74838A] absolute right-3.5 top-1/2 -translate-y-1/2" />
            <span className="truncate">ابحث عن متجر أو منتج أو خدمة...</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLocationModal(true)}
            className="h-11 px-3.5 rounded-full bg-white border border-[#E5EAED] shadow-2xs flex items-center gap-1.5 shrink-0 transition active:scale-95"
          >
            <MapPin className="w-4 h-4 text-[#087E83] shrink-0" />
            <span className="text-xs font-extrabold text-[#18343B] max-w-[92px] truncate">
              {currentLocation.name_ar}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#74838A] shrink-0" />
          </button>
        </div>

        {/* =====================================================================
            3. TURQUOISE CAMPUS HERO BANNER (Matches Reference Images 1, 2, 3)
        ===================================================================== */}
        {activeBanners.length > 0 && (
          <section aria-label="البانر الرئيسي">
            {(() => {
              const currentBanner =
                activeBanners[activeBannerIdx % activeBanners.length];
              return (
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-l from-[#A8DBDC] via-[#CBE8E9] to-[#E6F4F4] border border-[#C5E0E1] shadow-card min-h-[175px] sm:min-h-[220px] lg:min-h-[250px] flex items-center justify-between p-5 sm:p-8 lg:px-12">
                  {/* Subtle Campus Architectural Watermark Curves */}
                  <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-[#36A6A6]/15 pointer-events-none" />
                  <div className="absolute -top-12 left-1/3 w-48 h-48 rounded-full bg-white/40 pointer-events-none" />

                  {/* Right Side in RTL: Headline + Golden Underline Accent + Subtitle Pill + CTA */}
                  <div className="relative z-10 flex-1 max-w-[60%] sm:max-w-[56%] space-y-2.5 sm:space-y-3.5 text-right">
                    <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[#18343B] leading-snug">
                      {currentBanner.title_ar}
                    </h1>

                    {/* Golden Yellow Subtle Highlight Bar (#F3C95B) */}
                    <div className="w-24 sm:w-32 h-1.5 rounded-full bg-[#F3C95B]" />

                    <div className="inline-block bg-white/80 backdrop-blur-xs border border-white px-3.5 py-1.5 rounded-full shadow-2xs">
                      <p className="text-[11px] sm:text-xs lg:text-sm font-bold text-[#18343B]">
                        {currentBanner.subtitle_ar}
                      </p>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => navigate(currentBanner.target_link || '/stores')}
                        className="inline-flex items-center gap-1.5 bg-[#087E83] hover:bg-[#06666A] text-white font-extrabold text-xs sm:text-sm px-5 sm:px-7 py-2.5 rounded-full shadow-sm transition active:scale-95"
                      >
                        <span>{currentBanner.cta_text_ar}</span>
                        <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>

                  {/* Left Side in RTL: University Bag, Books, Coffee & Graduation Cap Illustration */}
                  <div className="relative z-10 w-[38%] sm:w-[40%] flex items-center justify-center">
                    <div className="relative w-32 h-32 sm:w-52 sm:h-44 lg:w-64 lg:h-52 flex items-center justify-center">
                      {/* Clean SVG Illustration of Turquoise Campus Bag + Books + Coffee matching Reference Image 1 & 2 */}
                      <svg
                        viewBox="0 0 260 200"
                        className="w-full h-full drop-shadow-md"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Soft Ground Shadow */}
                        <ellipse cx="130" cy="182" rx="105" ry="12" fill="#087E83" fillOpacity="0.18" />
                        {/* Turquoise Shopping/Campus Tote Bag */}
                        <path
                          d="M95 55C95 36 112 24 130 24C148 24 165 36 165 55"
                          stroke="#06666A"
                          strokeWidth="7"
                          strokeLinecap="round"
                        />
                        <rect
                          x="72"
                          y="52"
                          width="116"
                          height="118"
                          rx="16"
                          fill="#087E83"
                        />
                        <rect
                          x="80"
                          y="58"
                          width="100"
                          height="106"
                          rx="12"
                          fill="#0A8F95"
                        />
                        {/* Graduation Cap Icon on Bag */}
                        <path
                          d="M130 86L102 99L130 112L158 99L130 86Z"
                          fill="#E6F4F4"
                        />
                        <path
                          d="M112 106V122C112 127 120 132 130 132C140 132 148 127 148 122V106"
                          stroke="#E6F4F4"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                        <path
                          d="M156 100V120"
                          stroke="#F3C95B"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        {/* Stack of Academic Books on Left */}
                        <rect x="28" y="146" width="68" height="22" rx="5" fill="#06666A" />
                        <rect x="32" y="150" width="58" height="14" rx="2" fill="#FFFFFF" />
                        <rect x="34" y="126" width="62" height="20" rx="5" fill="#F3C95B" />
                        <rect x="38" y="130" width="52" height="12" rx="2" fill="#FFFDF7" />
                        {/* Campus Coffee Cup on Right */}
                        <path
                          d="M174 114H214L209 172H179L174 114Z"
                          fill="#FFFFFF"
                          stroke="#DCE7E9"
                          strokeWidth="2"
                        />
                        <rect x="175" y="130" width="38" height="22" rx="2" fill="#36A6A6" />
                        <rect x="170" y="104" width="48" height="10" rx="4" fill="#18343B" />
                      </svg>
                    </div>
                  </div>

                  {/* Desktop Left/Right Arrows matching Reference Image 2 */}
                  {activeBanners.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveBannerIdx(
                            (prev) =>
                              (prev - 1 + activeBanners.length) %
                              activeBanners.length
                          )
                        }
                        className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#18343B] items-center justify-center shadow-sm z-20"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveBannerIdx(
                            (prev) => (prev + 1) % activeBanners.length
                          )
                        }
                        className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#18343B] items-center justify-center shadow-sm z-20"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Pagination Dots at Bottom Center */}
                  <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-20">
                    {(activeBanners.length > 1 ? activeBanners : [1, 2, 3, 4]).map(
                      (_, idx) => (
                        <span
                          key={idx}
                          className={`h-2 rounded-full transition-all ${
                            idx === activeBannerIdx % 4
                              ? 'w-2.5 bg-[#087E83]'
                              : 'w-2 bg-white/80'
                          }`}
                        />
                      )
                    )}
                  </div>
                </div>
              );
            })()}
          </section>
        )}

        {/* =====================================================================
            4. MAIN CATEGORIES (الأقسام الرئيسية) — Matches Reference Image 2 & 3
        ===================================================================== */}
        <section aria-label="الأقسام الرئيسية" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-[#087E83]" />
              <h2 className="text-[15px] sm:text-base font-extrabold text-[#18343B]">
                الأقسام الرئيسية
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/stores')}
              className="text-xs font-extrabold text-[#087E83] hover:text-[#06666A] flex items-center gap-0.5"
            >
              <span>عرض الكل</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Responsive Category Cards Row (Wide Cards on Desktop, Compact Cards on Mobile) */}
          <div className="grid grid-cols-6 sm:grid-cols-6 lg:grid-cols-6 gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
            {activeCategories.slice(0, 6).map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center gap-2 transition-all border ${
                    isSelected
                      ? 'bg-[#087E83] text-white border-[#087E83] shadow-sm'
                      : 'bg-[#EAF3F4]/75 hover:bg-[#EAF3F4] text-[#18343B] border-[#E5EAED]'
                  }`}
                >
                  <div
                    className={`${
                      isSelected ? 'text-white' : 'text-[#087E83]'
                    }`}
                  >
                    {renderCategoryIcon(cat.icon_name)}
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs text-center leading-tight line-clamp-2 ${
                      isSelected
                        ? 'font-extrabold text-white'
                        : 'font-bold text-[#18343B]'
                    }`}
                  >
                    {cat.name_ar}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Filtered Category View when user clicks a specific category */}
        {categoryFilteredProducts !== null && (
          <section className="bg-white rounded-3xl p-5 border border-[#E5EAED] shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#18343B]">
                محتوى قسم:{' '}
                <span className="text-[#087E83]">
                  {
                    activeCategories.find((c) => c.id === selectedCategoryId)
                      ?.name_ar
                  }
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedCategoryId('cat-all')}
                className="text-xs font-bold text-[#087E83] hover:underline"
              >
                إظهار جميع الأقسام
              </button>
            </div>

            {categoryFilteredProducts.length === 0 ? (
              <div className="rounded-2xl bg-[#F0F7F7]/80 border border-[#E5EAED] py-10 px-4 text-center space-y-1.5">
                <ShoppingBag className="w-9 h-9 text-[#087E83] mx-auto stroke-[1.6]" />
                <p className="text-sm font-extrabold text-[#18343B]">
                  لا توجد منتجات حالياً
                </p>
                <p className="text-xs text-[#74838A]">
                  سيتم عرض المنتجات هنا فور إضافتها
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {categoryFilteredProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} showStoreName />
                ))}
              </div>
            )}
          </section>
        )}

        {/* =====================================================================
            5 & 6. MOST ORDERED PRODUCTS & SPECIAL OFFERS
            (Side-by-side 2-column layout on Desktop matching Reference Image 2,
             Stacked on Mobile matching Reference Image 3)
        ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* RIGHT COLUMN IN RTL: المنتجات الأكثر طلباً */}
          <section aria-label="المنتجات الأكثر طلباً" className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#087E83]" />
                <h2 className="text-[15px] sm:text-base font-extrabold text-[#18343B]">
                  المنتجات الأكثر طلباً
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/search')}
                className="text-xs font-extrabold text-[#087E83] hover:text-[#06666A] flex items-center gap-0.5"
              >
                <span>عرض الكل</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {displayedMostOrderedProducts.length === 0 ? (
              /* PROFESSIONAL EMPTY STATE (Matches Reference Image 2 & 3) */
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#F0F7F7] to-[#E6F1F2] border border-[#DCEAEB] py-12 px-6 text-center flex flex-col items-center justify-center min-h-[190px]">
                <div className="w-14 h-14 rounded-2xl bg-white/80 border border-[#C5E0E1] flex items-center justify-center text-[#087E83] mb-3 shadow-2xs">
                  <ShoppingBag className="w-7 h-7 stroke-[1.7]" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#18343B]">
                  لا توجد منتجات حالياً
                </h3>
                <p className="text-xs font-medium text-[#74838A] mt-1">
                  سيتم عرض المنتجات هنا فور إضافتها
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {displayedMostOrderedProducts.slice(0, 4).map((prod) => (
                  <ProductCard key={prod.id} product={prod} showStoreName />
                ))}
              </div>
            )}
          </section>

          {/* LEFT COLUMN IN RTL: العروض الخاصة */}
          <section aria-label="العروض الخاصة" className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#087E83]" />
                <h2 className="text-[15px] sm:text-base font-extrabold text-[#18343B]">
                  العروض الخاصة
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/search')}
                className="text-xs font-extrabold text-[#087E83] hover:text-[#06666A] flex items-center gap-0.5"
              >
                <span>عرض الكل</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {specialOffers.length === 0 ? (
              /* PROFESSIONAL EMPTY STATE (Matches Reference Image 2 & 3) */
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#F0F7F7] to-[#E6F1F2] border border-[#DCEAEB] py-12 px-6 text-center flex flex-col items-center justify-center min-h-[190px]">
                <div className="w-14 h-14 rounded-2xl bg-white/80 border border-[#C5E0E1] flex items-center justify-center text-[#087E83] mb-3 shadow-2xs">
                  <Tag className="w-7 h-7 stroke-[1.7]" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#18343B]">
                  لا توجد عروض حالياً
                </h3>
                <p className="text-xs font-medium text-[#74838A] mt-1">
                  تابعنا لمعرفة أحدث العروض
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {specialOffers.slice(0, 4).map((prod) => (
                  <ProductCard key={prod.id} product={prod} showStoreName />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* =====================================================================
            7. STORES SECTION ON HOME PAGE (قسم المتاجر — Matches Section 6 & 13)
        ===================================================================== */}
        <section aria-label="المتاجر" className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <StoreIcon className="w-4 h-4 text-[#087E83]" />
              <h2 className="text-[15px] sm:text-base font-extrabold text-[#18343B]">
                المتاجر
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/stores')}
              className="text-xs font-extrabold text-[#087E83] hover:text-[#06666A] flex items-center gap-0.5"
            >
              <span>عرض الكل</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeStores.length === 0 ? (
            <div className="rounded-3xl bg-white border border-[#E5EAED] shadow-card py-10 px-6 text-center flex flex-col items-center justify-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#F0F7F7] border border-[#C5E0E1] flex items-center justify-center text-[#087E83]">
                <StoreIcon className="w-7 h-7 stroke-[1.7]" />
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#18343B]">
                لا توجد متاجر حالياً
              </h3>
              <p className="text-xs text-[#74838A]">
                سيتم عرض المتاجر هنا فور إضافتها
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {activeStores.slice(0, 6).map((store) => {
                const ratingStats = getStoreRatingStats(store.id);
                return (
                  <div
                    key={store.id}
                    onClick={() => navigate(`/store/${store.id}`)}
                    className="bg-white rounded-2xl p-3.5 border border-[#E5EAED] shadow-card hover:shadow-card-hover transition cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={store.logo_url}
                        alt={store.name_ar || store.name_en}
                        className="w-14 h-14 rounded-2xl object-cover border border-[#E5EAED] shrink-0 bg-[#F8FAFC]"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-[#18343B] truncate">
                            {store.name_ar || store.name_en}
                          </h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              store.is_open
                                ? 'bg-[#EAF3F4] text-[#087E83]'
                                : 'bg-[#F8FAFC] text-[#74838A]'
                            }`}
                          >
                            {store.is_open ? 'مفتوح' : 'مغلق'}
                          </span>
                        </div>
                        <p className="text-xs text-[#74838A] truncate mt-0.5">
                          {store.description_ar || store.activity_type_ar}
                        </p>
                        {ratingStats.count > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-xs">
                            <Star className="w-3.5 h-3.5 text-[#F3C95B] fill-[#F3C95B]" />
                            <span className="font-en font-extrabold text-[#18343B]">
                              {ratingStats.average.toFixed(1)}
                            </span>
                            <span className="text-[#74838A] text-[11px]">
                              ({ratingStats.count})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-[#74838A] shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* MOBILE CAMPUS LOCATION MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-[#18343B]/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-xl border border-[#E5EAED]">
            <div className="flex items-center justify-between border-b border-[#E5EAED] pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#087E83]" />
                <h3 className="text-base font-extrabold text-[#18343B]">
                  اختيار الكلية وموقع الاستلام
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="w-8 h-8 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#74838A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

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
                        ? 'border-[#087E83] bg-[#F0F7F7] text-[#18343B]'
                        : 'border-[#E5EAED] text-[#18343B]'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-extrabold">{loc.name_ar}</p>
                      <p className="text-[11px] text-[#74838A]">{loc.campus_name_ar}</p>
                    </div>
                    {active && <Check className="w-4 h-4 text-[#087E83]" />}
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#74838A]">
                نقطة الاستلام داخل الكلية:
              </label>
              <select
                value={selectedPickupPoint}
                onChange={(e) => setSelectedPickupPoint(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-semibold text-[#18343B] bg-white"
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
              className="w-full h-11 rounded-xl bg-[#087E83] hover:bg-[#06666A] text-white font-bold text-xs transition"
            >
              تأكيد الموقع
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
