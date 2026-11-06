import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Heart,
  Share2,
  Star,
  MapPin,
  Clock,
  LayoutGrid,
  Store as StoreIcon,
  ShoppingBag,
  Phone,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/ProductCard';

type StoreTab = 'products' | 'categories' | 'reviews' | 'about';

export const StoreDetailsPage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const {
    currentUser,
    stores,
    products,
    storeCategories,
    orders,
    reviews,
    favoritesStoreIds,
    toggleFavoriteStore,
    getStoreRatingStats,
    submitReview,
    showToast,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<StoreTab>('products');
  const [selectedStoreCategoryId, setSelectedStoreCategoryId] = useState<string>('all');

  // Review Form State
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  const store = useMemo(
    () =>
      stores.find(
        (s) =>
          s.id === storeId &&
          (s.status === 'active' ||
            currentUser?.role === 'super_admin' ||
            currentUser?.role === 'admin' ||
            currentUser?.store_id === s.id)
      ),
    [stores, storeId, currentUser]
  );

  const currentStoreCategories = useMemo(
    () =>
      storeCategories
        .filter((sc) => sc.store_id === storeId)
        .sort((a, b) => a.sort_order - b.sort_order),
    [storeCategories, storeId]
  );

  // All active products & services for THIS store
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

  // Check if current user has an eligible completed order from this store to rate
  const eligibleOrderForReview = useMemo(() => {
    if (!currentUser || !storeId) return undefined;
    const completedForStore = orders.filter(
      (o) =>
        o.customer_id === currentUser.id &&
        o.store_id === storeId &&
        o.status === 'completed'
    );
    return completedForStore.find(
      (ord) =>
        !reviews.some(
          (r) => r.order_id === ord.id && r.user_id === currentUser.id
        )
    );
  }, [currentUser, storeId, orders, reviews]);

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

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!store || !eligibleOrderForReview) return;
    const res = submitReview({
      orderId: eligibleOrderForReview.id,
      storeId: store.id,
      rating: reviewRating,
      comment: reviewComment.trim() || 'تجربة ممتازة',
    });
    if (res.success) {
      setReviewComment('');
      setReviewRating(5);
    }
  };

  if (!store) {
    return (
      <div className="bg-white rounded-[28px] py-14 px-6 border border-[#E5EAED] shadow-card text-center max-w-lg mx-auto space-y-4">
        <StoreIcon className="w-10 h-10 text-[#087E83] mx-auto" />
        <h2 className="text-base font-extrabold text-[#18343B]">
          المتجر غير متوفر حالياً
        </h2>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-full bg-[#087E83] text-white text-xs font-extrabold"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5EAED] text-xs font-extrabold text-[#18343B] hover:border-[#087E83] transition shadow-2xs"
        >
          <ArrowRight className="w-4 h-4 text-[#087E83]" />
          <span>العودة للمتاجر</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareStore}
            aria-label="مشاركة"
            className="w-10 h-10 rounded-full bg-white border border-[#E5EAED] flex items-center justify-center text-[#18343B] hover:border-[#087E83] transition"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => toggleFavoriteStore(store.id)}
            aria-label="المفضلة"
            className="w-10 h-10 rounded-full bg-white border border-[#E5EAED] flex items-center justify-center text-[#18343B] hover:border-[#087E83] transition"
          >
            <Heart
              className={`w-4 h-4 ${
                isStoreFav ? 'fill-rose-500 text-rose-500' : 'text-[#18343B]'
              }`}
            />
          </button>
        </div>
      </div>

      {/* STORE HEADER CARD (Banner + Thumbnail + Name + Rating + Description + Hours + Location) */}
      <section className="bg-white rounded-[28px] overflow-hidden border border-[#E5EAED] shadow-card">
        {/* 1. Store Wide Banner */}
        <div className="relative h-44 sm:h-60 w-full bg-gradient-to-l from-[#087E83] via-[#1B8E93] to-[#36A6A6] overflow-hidden flex flex-col items-center justify-center text-white">
          {store.cover_url && store.cover_url.trim() ? (
            <img
              src={store.cover_url}
              alt={store.name_ar || store.name_en}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1.5 pb-6 text-white/90">
              <StoreIcon className="w-10 h-10 stroke-[1.6]" />
              <span className="text-sm font-extrabold">
                {store.name_ar || store.name_en}
              </span>
            </div>
          )}
        </div>

        {/* 2. Store Circular Thumbnail + 3. Store Name + 4. Rating + 5. Description + 6. Working Hours + 7. Location */}
        <div className="relative px-4 sm:px-6 pb-4 flex flex-col items-center text-center">
          <div className="-mt-12 w-24 h-24 rounded-full border-4 border-white bg-[#EAF3F4] shadow-md flex items-center justify-center overflow-hidden z-10 text-[#087E83]">
            {store.logo_url && store.logo_url.trim() ? (
              <img
                src={store.logo_url}
                alt={store.name_ar || store.name_en}
                className="w-full h-full object-cover"
              />
            ) : (
              <StoreIcon className="w-10 h-10 stroke-[1.8]" />
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-[#18343B] mt-2.5">
            {store.name_ar || store.name_en}
          </h1>

          <p className="text-xs sm:text-sm font-medium text-[#74838A] mt-1 max-w-lg">
            {store.description_ar || store.activity_type_ar}
          </p>

          {/* Status & Real Rating Row */}
          <div className="flex items-center justify-center flex-wrap gap-3 mt-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold ${
                store.is_open
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  store.is_open ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span>{store.is_open ? 'مفتوح الآن' : 'مغلق الآن'}</span>
            </span>

            <div className="flex items-center gap-1.5 text-xs bg-[#F8FAFC] border border-[#E5EAED] px-3.5 py-1 rounded-full">
              {ratingStats.count > 0 ? (
                <>
                  <Star className="w-4 h-4 text-[#F3C95B] fill-[#F3C95B]" />
                  <span className="font-en font-extrabold text-[#18343B]">
                    {ratingStats.average.toFixed(1)}
                  </span>
                  <span className="font-en text-[#74838A]">
                    ({ratingStats.count} تقييم)
                  </span>
                </>
              ) : (
                <>
                  <Star className="w-3.5 h-3.5 text-[#74838A]" />
                  <span className="font-bold text-[#74838A]">
                    لا توجد تقييمات بعد
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Campus Location Pill */}
          <div className="max-w-md w-full mt-4">
            <div className="h-10 px-4 rounded-full bg-[#F8FAFC] border border-[#E5EAED] flex items-center justify-center gap-2 text-xs font-bold text-[#18343B]">
              <MapPin className="w-4 h-4 text-[#087E83] shrink-0" />
              <span className="truncate">
                الموقع: {store.location_inside_campus || 'داخل الكلية'}
              </span>
            </div>
          </div>
        </div>

        {/* Store Tabs */}
        <div className="grid grid-cols-4 border-t border-[#E5EAED] mt-2 px-2">
          {(
            [
              { id: 'products', label: 'المنتجات والخدمات' },
              { id: 'categories', label: 'أقسام المتجر' },
              { id: 'reviews', label: `التقييمات (${ratingStats.count})` },
              { id: 'about', label: 'عن المتجر' },
            ] as const
          ).map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 text-xs font-extrabold relative transition-colors ${
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

      {/* 8. Store Products & Services Section (Only inside Store Page!) */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {currentStoreCategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setSelectedStoreCategoryId('all')}
                className={`h-9 px-4 rounded-full text-xs font-extrabold whitespace-nowrap transition ${
                  selectedStoreCategoryId === 'all'
                    ? 'bg-[#087E83] text-white'
                    : 'bg-white border border-[#E5EAED] text-[#18343B]'
                }`}
              >
                الكل
              </button>
              {currentStoreCategories.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setSelectedStoreCategoryId(sc.id)}
                  className={`h-9 px-4 rounded-full text-xs font-extrabold whitespace-nowrap transition ${
                    selectedStoreCategoryId === sc.id
                      ? 'bg-[#087E83] text-white'
                      : 'bg-white border border-[#E5EAED] text-[#18343B]'
                  }`}
                >
                  {sc.name_ar}
                </button>
              ))}
            </div>
          )}

          {allStoreProducts.length === 0 ? (
            <div className="bg-white rounded-[28px] py-12 px-6 border border-[#E5EAED] shadow-card text-center flex flex-col items-center justify-center space-y-2">
              <ShoppingBag className="w-9 h-9 text-[#087E83] stroke-[1.7]" />
              <p className="text-sm font-extrabold text-[#18343B]">
                لا توجد منتجات أو خدمات مضافة في هذا المتجر حالياً
              </p>
              <p className="text-xs text-[#74838A]">
                سيتم عرض منتجات وخدمات المتجر هنا فور إضافتها من قبل صاحب المتجر
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {allStoreProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  showStoreName={false}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STORE INTERNAL CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-[28px] p-6 border border-[#E5EAED] shadow-card text-center">
          {currentStoreCategories.length === 0 ? (
            <div className="py-6 space-y-1.5">
              <LayoutGrid className="w-8 h-8 text-[#087E83] mx-auto" />
              <p className="text-sm font-extrabold text-[#18343B]">
                لا توجد أقسام فرعية داخلية حالياً
              </p>
              <p className="text-xs text-[#74838A]">
                جميع منتجات المتجر معروضة في تبويب المنتجات والخدمات
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
                    استعراض
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: REAL STORE REVIEWS & RATING SUBMISSION */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {eligibleOrderForReview && (
            <form
              onSubmit={handleReviewSubmit}
              className="bg-white rounded-[28px] p-5 border border-[#087E83]/30 shadow-card space-y-3"
            >
              <h3 className="text-sm font-extrabold text-[#18343B]">
                أضف تقييمك لتجربتك مع {store.name_ar || store.name_en} (طلب #{eligibleOrderForReview.order_number})
              </h3>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= reviewRating
                          ? 'fill-[#F3C95B] text-[#F3C95B]'
                          : 'text-[#E5EAED]'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-extrabold text-[#18343B] mr-2">
                  {reviewRating} من 5
                </span>
              </div>
              <textarea
                rows={2}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="اكتب رأيك في منتجات وخدمة المتجر..."
                className="w-full p-3 rounded-2xl border border-[#E5EAED] text-xs outline-none focus:border-[#087E83]"
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#087E83] text-white text-xs font-extrabold"
              >
                نشر التقييم
              </button>
            </form>
          )}

          <div className="bg-white rounded-[28px] p-6 border border-[#E5EAED] shadow-card">
            {storeReviews.length === 0 ? (
              <div className="py-6 text-center space-y-1.5">
                <Star className="w-8 h-8 text-[#087E83] mx-auto" />
                <p className="text-sm font-extrabold text-[#18343B]">
                  لا توجد تقييمات بعد
                </p>
                <p className="text-xs text-[#74838A]">
                  تظهر التقييمات الفعلية هنا بعد تجربة الطلب من المتجر
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {storeReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-[#18343B]">
                          {rev.user_name_ar}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating
                                  ? 'fill-[#F3C95B] text-[#F3C95B]'
                                  : 'text-[#E5EAED]'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
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
        </div>
      )}

      {/* TAB 4: ABOUT STORE */}
      {activeTab === 'about' && (
        <div className="bg-white rounded-[28px] p-6 border border-[#E5EAED] shadow-card space-y-3">
          <h2 className="text-sm font-extrabold text-[#18343B]">عن المتجر</h2>
          <p className="text-xs sm:text-sm text-[#74838A] leading-relaxed">
            {store.description_ar || 'لا تتوفر تفاصيل إضافية حالياً.'}
          </p>
          <div className="pt-2 space-y-2 text-xs text-[#18343B]">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#087E83]" />
              <span>الموقع: {store.location_inside_campus || 'داخل الكلية'}</span>
            </div>
            {store.contact_phone && (
              <div className="flex items-center gap-2 font-bold text-[#087E83]">
                <Phone className="w-4 h-4" />
                <a href={`tel:${store.contact_phone}`} dir="ltr">
                  {store.contact_phone}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
