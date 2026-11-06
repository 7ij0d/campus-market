import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Store as StoreIcon } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { StoreCard } from '../components/StoreCard';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const storesSectionRef = useRef<HTMLDivElement>(null);
  const { stores, banners, headerSearchQuery } = useMarketplace();

  const activeBanners = useMemo(
    () => banners.filter((b) => b.is_active).sort((a, b) => a.sort_order - b.sort_order),
    [banners]
  );

  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const currentBanner = activeBanners[currentBannerIdx] || activeBanners[0];

  // Active approved stores filtered by header search query (if any)
  const visibleStores = useMemo(() => {
    const q = headerSearchQuery.trim().toLowerCase();
    return stores
      .filter((s) => s.status === 'active')
      .filter((s) => {
        if (!q) return true;
        return (
          (s.name_ar && s.name_ar.toLowerCase().includes(q)) ||
          (s.name_en && s.name_en.toLowerCase().includes(q)) ||
          (s.activity_type_ar && s.activity_type_ar.toLowerCase().includes(q)) ||
          (s.description_ar && s.description_ar.toLowerCase().includes(q))
        );
      });
  }, [stores, headerSearchQuery]);

  const handlePrevBanner = () => {
    if (activeBanners.length <= 1) return;
    setCurrentBannerIdx((prev) =>
      prev === 0 ? activeBanners.length - 1 : prev - 1
    );
  };

  const handleNextBanner = () => {
    if (activeBanners.length <= 1) return;
    setCurrentBannerIdx((prev) => (prev + 1) % activeBanners.length);
  };

  const scrollToStores = () => {
    storesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* 1. Main Hero Banner (Compact, responsive, matches reference image) */}
      <section className="relative rounded-[28px] overflow-hidden bg-gradient-to-l from-[#D4F1F4] via-[#BCE8EC] to-[#9ADCE2] border border-[#CBE8EC] shadow-card">
        <div className="relative z-10 px-6 sm:px-12 py-5 sm:py-7 min-h-[165px] sm:min-h-[210px] flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Right Side: Marketing Copy & CTA Button */}
          <div className="text-center sm:text-right space-y-2 sm:space-y-2.5 max-w-md z-10">
            <h1 className="text-xl sm:text-2xl md:text-[28px] font-extrabold text-[#18343B] leading-snug">
              {currentBanner?.title_ar || 'كل احتياجاتك الجامعية في مكان واحد'}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-[#18343B]/80">
              {currentBanner?.subtitle_ar ||
                'منتجات • خدمات • مستلزمات دراسية والمزيد'}
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={scrollToStores}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs sm:text-sm font-extrabold shadow-sm transition active:scale-95"
              >
                <span>{currentBanner?.cta_text_ar || 'اكتشف المتاجر'}</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Left Side: Banner Visual Artwork */}
          <div className="w-48 sm:w-72 md:w-80 h-28 sm:h-40 shrink-0 flex items-center justify-center overflow-hidden rounded-2xl">
            <img
              src={
                currentBanner?.image_url ||
                '/campus-market/banner-campus-art.jpg'
              }
              alt="CampusMarket"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  '/campus-market/banner-campus-art.jpg';
              }}
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>
        </div>

        {/* Left & Right Banner Navigation Arrows */}
        <button
          type="button"
          onClick={handlePrevBanner}
          aria-label="البانر السابق"
          className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#18343B] shadow-sm items-center justify-center transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={handleNextBanner}
          aria-label="البانر التالي"
          className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#18343B] shadow-sm items-center justify-center transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Bottom Pagination Dots */}
        <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5 z-20">
          {(activeBanners.length > 0 ? activeBanners : [{ id: 'default' }]).map(
            (b, idx) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setCurrentBannerIdx(idx)}
                aria-label={`بانر ${idx + 1}`}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentBannerIdx
                    ? 'bg-[#087E83] scale-110'
                    : 'bg-white/80'
                }`}
              />
            )
          )}
        </div>
      </section>

      {/* 2. Stores Grid Directly Below Banner (Presto Libya Style — Stores Only) */}
      <section ref={storesSectionRef} className="pt-1">
        {visibleStores.length === 0 ? (
          <div className="bg-white rounded-[28px] py-14 px-6 border border-[#E5EAED] shadow-card text-center max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#EAF3F4] text-[#087E83] flex items-center justify-center mx-auto">
              <StoreIcon className="w-8 h-8" strokeWidth={1.8} />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-extrabold text-[#18343B]">
                {headerSearchQuery.trim()
                  ? 'لا توجد متاجر مطابقة لبحثك'
                  : 'لا توجد متاجر حالياً'}
              </h2>
              <p className="text-xs sm:text-sm text-[#74838A]">
                {headerSearchQuery.trim()
                  ? 'جرّب البحث باسم متجر آخر'
                  : 'سيتم عرض المتاجر المشتركة هنا مباشرة فور إضافتها واعتمادها'}
              </p>
            </div>

            {!headerSearchQuery.trim() && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/account?become_merchant=1')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs sm:text-sm font-extrabold shadow-xs transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>اشترك بمتجرك في CampusMarket</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Mobile: 1-column vertical list | Tablet & Laptop: 2-column grid matching Reference Image */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {visibleStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
