import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Store as StoreIcon } from 'lucide-react';
import { Store } from '../types/database';
import { useMarketplace } from '../context/MarketplaceContext';

interface StoreCardProps {
  store: Store;
  previewMode?: boolean;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, previewMode = false }) => {
  const navigate = useNavigate();
  const { favoritesStoreIds, toggleFavoriteStore, getStoreRatingStats } =
    useMarketplace();

  const [bannerError, setBannerError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const isFav = favoritesStoreIds.includes(store.id);
  const ratingStats = getStoreRatingStats(store.id);

  const hasValidBanner = Boolean(store.cover_url && store.cover_url.trim() && !bannerError);
  const hasValidLogo = Boolean(store.logo_url && store.logo_url.trim() && !logoError);

  const handleCardClick = () => {
    if (previewMode) return;
    navigate(`/store/${store.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group bg-white rounded-[24px] border border-[#E5EAED] shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden ${
        previewMode ? '' : 'cursor-pointer'
      }`}
    >
      {/* Top Store Banner Area */}
      <div className="relative h-40 sm:h-48 w-full bg-gradient-to-l from-[#087E83] to-[#36A6A6] overflow-hidden">
        {hasValidBanner ? (
          <img
            src={store.cover_url}
            alt={store.name_ar || store.name_en}
            onError={() => setBannerError(true)}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          /* Professional Default Banner Fallback if merchant hasn't uploaded a banner yet */
          <div className="w-full h-full flex flex-col items-center justify-center text-white/90 px-4 text-center select-none bg-gradient-to-l from-[#087E83] via-[#1B8E93] to-[#36A6A6]">
            <StoreIcon className="w-10 h-10 mb-1.5 opacity-80" strokeWidth={1.6} />
            <span className="text-sm font-extrabold tracking-wide">
              {store.name_ar || store.name_en || 'متجر جامعي'}
            </span>
            {store.activity_type_ar && (
              <span className="text-[11px] text-white/80 mt-0.5">
                {store.activity_type_ar}
              </span>
            )}
          </div>
        )}

        {/* Favorite Heart Button (Top-Left like Reference Image) */}
        {!previewMode && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavoriteStore(store.id);
            }}
            aria-label="حفظ المتجر في المفضلة"
            className="absolute top-3.5 left-3.5 w-9 h-9 rounded-full bg-white/95 backdrop-blur-xs shadow-sm flex items-center justify-center text-[#18343B] hover:scale-105 active:scale-95 transition"
          >
            <Heart
              className={`w-4 h-4 ${
                isFav ? 'fill-rose-500 text-rose-500' : 'text-[#18343B]'
              }`}
            />
          </button>
        )}

        {/* Circular Store Thumbnail / Logo (Bottom-Right inside Banner like Reference Image) */}
        <div className="absolute bottom-3 right-4 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white p-1 shadow-md border-2 border-white flex items-center justify-center overflow-hidden">
          {hasValidLogo ? (
            <img
              src={store.logo_url}
              alt={store.name_ar || store.name_en}
              onError={() => setLogoError(true)}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-[#EAF3F4] text-[#087E83] flex items-center justify-center">
              <StoreIcon className="w-6 h-6" strokeWidth={2} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Store Details Row (Store Name + Rating on Right, Open/Closed Pill on Left) */}
      <div className="px-5 py-3.5 flex items-center justify-between gap-3 bg-white">
        {/* Right Side: Store Name & Real Rating */}
        <div className="min-w-0 text-right">
          <h3 className="text-base sm:text-lg font-extrabold text-[#18343B] truncate group-hover:text-[#087E83] transition-colors">
            {store.name_ar || store.name_en}
          </h3>

          <div className="flex items-center gap-1.5 mt-1">
            {ratingStats.count > 0 ? (
              <>
                <Star className="w-4 h-4 fill-[#F3C95B] text-[#F3C95B] shrink-0" />
                <span className="font-en text-xs sm:text-sm font-extrabold text-[#18343B]">
                  {ratingStats.average.toFixed(1)}
                </span>
                <span className="font-en text-xs text-[#74838A]">
                  ({ratingStats.count})
                </span>
              </>
            ) : (
              <>
                <Star className="w-3.5 h-3.5 text-[#74838A] shrink-0" />
                <span className="text-xs font-bold text-[#74838A]">
                  لا توجد تقييمات بعد
                </span>
              </>
            )}
          </div>
        </div>

        {/* Left Side: Open / Closed Status Badge */}
        <div className="shrink-0">
          {store.is_open ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>مفتوح الآن</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-extrabold">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>مغلق الآن</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
