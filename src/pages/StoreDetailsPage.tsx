import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Heart,
  Share2,
  Star,
  MapPin,
  Clock,
  Flame,
  LayoutGrid,
  Store as StoreIcon,
  Image as ImageIcon,
  ShoppingBag,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/ProductCard';

type StoreTab = 'products' | 'categories' | 'reviews' | 'about';

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

  const store = useMemo(
    () => stores.find((s) => s.id === storeId && s.status === 'active'),
    [stores, storeId]
  );

  const currentStoreCategories = useMemo(
    () =>
      storeCategories
        .filter((sc) => sc.store_id === storeId)
        .sort((a, b) => a.sort_order - b.sort_order),
    [storeCategories, storeId]
  );

  // Strictly isolated Most Ordered Products for THIS store
  const storeMostOrderedMetrics = useMemo(() => {
    if (!storeId) return [];
    return getStoreMostOrderedProducts(storeId);
  }, [storeId, getStoreMostOrderedProducts]);

  // All active products for THIS store
  const allStoreProducts = useMemo(() => {
    if (!storeId) return [];
    return products
      .filter(
        (p) =>
          p.store_id === storeId &&
          p.is_active &&
          p.is_available_for_sale &&
          p.stock_quantity > 0 &&
          (selectedStoreCategoryId === 'all' ||
            p.store_category_id === selectedStoreCategoryId)
      )
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [storeId, products, selectedStoreCategoryId]);

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

  const ratingStats = store
    ? getStoreRatingStats(store.id)
    : { average: 0, count: 0 };
  const isStoreFav = store ? favoritesStoreIds.includes(store.id) : false;

  const handleShareStore = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    showToast('تم نسخ رابط المتجر للمشاركة', 'info');
  };

  return (
    <div className="space-y-4">
      {/* Top Action Header (Matches Reference Image 3 Screen 3) */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5EAED]">
        <div className="px-4 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="رجوع"
            className="w-9 h-9 rounded-full bg-[#F8FAFC] border border-[#E5EAED] flex items-center justify-center text-[#18343B]"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareStore}
              aria-label="مشاركة"
              className="w-9 h-9 rounded-full bg-[#F8FAFC] border border-[#E5EAED] flex items-center justify-center text-[#18343B]"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {store && (
              <button
                type="button"
                onClick={() => toggleFavoriteStore(store.id)}
                aria-label="المفضلة"
                className="w-9 h-9 rounded-full bg-[#F8FAFC] border border-[#E5EAED] flex items-center justify-center text-[#18343B]"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isStoreFav
                      ? 'fill-[#087E83] text-[#087E83]'
                      : 'text-[#18343B]'
                  }`}
                />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 lg:px-0 pt-2 lg:pt-0 space-y-5">
        {/* STORE HEADER CARD (Matches Reference Image 3 Screen 3) */}
        <section className="bg-white rounded-3xl overflow-hidden border border-[#E5EAED] shadow-card">
          {/* Cover Image or Clean Cover Placeholder (`صورة الغلاف`) */}
          <div className="relative h-36 sm:h-48 w-full bg-[#D7E3E5] overflow-hidden flex flex-col items-center justify-center text-[#5B767C]">
            {store?.cover_url ? (
              <img
                src={store.cover_url}
                alt={store.name_ar || store.name_en}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-1.5 pb-4">
                <ImageIcon className="w-7 h-7 stroke-[1.6]" />
                <span className="text-xs font-bold">صورة الغلاف</span>
              </div>
            )}
          </div>

          {/* Overlapping Store Avatar + Store Info */}
          <div className="relative px-4 pb-2 flex flex-col items-center text-center">
            <div className="-mt-10 w-20 h-20 rounded-full border-4 border-white bg-[#EAF3F4] shadow-sm flex items-center justify-center overflow-hidden z-10 text-[#087E83]">
              {store?.logo_url ? (
                <img
                  src={store.logo_url}
                  alt={store.name_ar || store.name_en}
                  className="w-full h-full object-cover"
                />
              ) : (
                <StoreIcon className="w-8 h-8 stroke-[1.8]" />
              )}
            </div>

            <h1 className="text-lg sm:text-xl font-extrabold text-[#18343B] mt-2">
              {store ? store.name_ar || store.name_en : 'اسم المتجر'}
            </h1>
            <p className="text-xs font-medium text-[#74838A] mt-0.5 max-w-md">
              {store
                ? store.description_ar || store.activity_type_ar
                : 'وصف مختصر عن المتجر...'}
            </p>

            {/* Status & Rating Row (Matches Reference Image 3 Screen 3) */}
            <div className="flex items-center justify-center flex-wrap gap-3 mt-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold ${
                  store?.is_open
                    ? 'bg-[#EAF3F4] text-[#087E83]'
                    : 'bg-[#F1F5F6] text-[#18343B]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    store?.is_open ? 'bg-[#087E83]' : 'bg-[#18343B]'
                  }`}
                />
                <span>{store?.is_open ? 'مفتوح الآن' : 'مغلق حالياً'}</span>
              </span>

              <div className="flex items-center gap-1 text-xs">
                <Star className="w-4 h-4 text-[#F3C95B] fill-[#F3C95B]" />
                <span className="font-en font-extrabold text-[#18343B]">
                  {ratingStats.average.toFixed(1)}
                </span>
                <span className="font-en text-[#74838A]">
                  ({ratingStats.count})
                </span>
              </div>
            </div>

            {/* Working Hours & Location Pills (`ساعات العمل` | `داخل الكلية`) */}
            <div className="grid grid-cols-2 gap-2.5 max-w-sm w-full mt-3.5">
              <div className="h-10 px-3 rounded-full bg-white border border-[#E5EAED] flex items-center justify-center gap-1.5 text-xs font-bold text-[#18343B]">
                <Clock className="w-4 h-4 text-[#087E83] shrink-0" />
                <span>{store?.working_hours || 'ساعات العمل'}</span>
              </div>
              <div className="h-10 px-3 rounded-full bg-white border border-[#E5EAED] flex items-center justify-center gap-1.5 text-xs font-bold text-[#18343B]">
                <MapPin className="w-4 h-4 text-[#087E83] shrink-0" />
                <span className="truncate">
                  {store?.location_inside_campus || 'داخل الكلية'}
                </span>
              </div>
            </div>
          </div>

          {/* 4 Tabs: المنتجات | التصنيفات | التقييمات | عن المتجر */}
          <div className="grid grid-cols-4 border-t border-[#E5EAED] mt-4 px-2">
            {(
              [
                { id: 'products', label: 'المنتجات' },
                { id: 'categories', label: 'التصنيفات' },
                { id: 'reviews', label: 'التقييمات' },
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
                      ? 'text-[#087E83]'
                      : 'text-[#74838A] hover:text-[#18343B]'
                  }`}
                >
                  {tab.label}
                  {active && (
                    <span className="absolute bottom-0 inset-x-4 h-[3px] rounded-t-full bg-[#087E83]" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* TAB 1: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-5">
            {/* Most Ordered Inside Store (المنتجات الأكثر طلباً) */}
            <section className="space-y-2.5">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#F3C95B] fill-[#F3C95B]" />
                <h2 className="text-[15px] font-extrabold text-[#18343B]">
                  المنتجات الأكثر طلباً
                </h2>
              </div>

              {storeMostOrderedMetrics.length === 0 ? (
                <div className="rounded-2xl bg-[#EBEFF2]/80 border border-[#E5EAED] py-8 px-4 text-center flex flex-col items-center justify-center space-y-1.5">
                  <ShoppingBag className="w-8 h-8 text-[#087E83] stroke-[1.7]" />
                  <p className="text-xs sm:text-sm font-extrabold text-[#18343B]">
                    لا توجد منتجات حالياً
                  </p>
                  <p className="text-[11px] text-[#74838A]">
                    سيتم عرض المنتجات بعد إضافتها
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {storeMostOrderedMetrics.map(({ product }) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      showStoreName={false}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* All Store Products (جميع المنتجات) */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-extrabold text-[#18343B]">
                  جميع المنتجات
                </h2>
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#18343B]">
                  <LayoutGrid className="w-4 h-4 text-[#087E83]" />
                  <span className="font-en">({allStoreProducts.length})</span>
                </div>
              </div>

              {allStoreProducts.length === 0 ? (
                <div className="rounded-2xl bg-[#EBEFF2]/80 border border-[#E5EAED] py-10 px-4 text-center flex flex-col items-center justify-center space-y-1.5">
                  <ShoppingBag className="w-8 h-8 text-[#087E83] stroke-[1.7]" />
                  <p className="text-xs sm:text-sm font-extrabold text-[#18343B]">
                    لا توجد منتجات أو خدمات حالياً
                  </p>
                  <p className="text-[11px] text-[#74838A]">
                    سيتم عرض المحتوى هنا فور إضافته
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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

        {/* TAB 2: STORE INTERNAL CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-3xl p-6 border border-[#E5EAED] shadow-card text-center">
            {currentStoreCategories.length === 0 ? (
              <div className="py-6 space-y-1.5">
                <LayoutGrid className="w-8 h-8 text-[#087E83] mx-auto" />
                <p className="text-sm font-extrabold text-[#18343B]">
                  لا توجد تصنيفات فرعية حالياً
                </p>
                <p className="text-xs text-[#74838A]">
                  سيتم عرض تصنيفات المتجر هنا فور إضافتها
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
                {currentStoreCategories.map((scat) => (
                  <button
                    key={scat.id}
                    type="button"
                    onClick={() => {
                      setSelectedStoreCategoryId(scat.id);
                      setActiveTab('products');
                    }}
                    className="p-3.5 rounded-2xl border border-[#E5EAED] hover:border-[#087E83] bg-[#F8FAFC] flex items-center justify-between"
                  >
                    <span className="text-xs font-extrabold text-[#18343B]">
                      {scat.name_ar}
                    </span>
                    <span className="text-xs font-bold text-[#087E83]">
                      عرض المنتجات
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl p-6 border border-[#E5EAED] shadow-card">
            {storeReviews.length === 0 ? (
              <div className="py-6 text-center space-y-1.5">
                <Star className="w-8 h-8 text-[#087E83] mx-auto" />
                <p className="text-sm font-extrabold text-[#18343B]">
                  لا توجد تقييمات حالياً
                </p>
                <p className="text-xs text-[#74838A]">
                  تظهر التقييمات الفعلية هنا بعد إتمام الطلبات
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {storeReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#18343B]">
                        {rev.user_name_ar}
                      </span>
                      <span className="text-[11px] text-[#74838A]">
                        {new Date(rev.created_at).toLocaleDateString('ar-LY')}
                      </span>
                    </div>
                    <p className="text-xs text-[#74838A]">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ABOUT STORE */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-3xl p-6 border border-[#E5EAED] shadow-card space-y-3">
            <h2 className="text-sm font-extrabold text-[#18343B]">عن المتجر</h2>
            <p className="text-xs text-[#74838A] leading-relaxed">
              {store?.description_ar || 'لا تتوفر تفاصيل إضافية حالياً.'}
            </p>
            {store?.contact_phone && (
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#087E83]">
                <Phone className="w-4 h-4" />
                <span dir="ltr">{store.contact_phone}</span>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
