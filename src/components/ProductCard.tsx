import React from 'react';
import { Heart, ShoppingCart, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types/database';
import { useMarketplace } from '../context/MarketplaceContext';

interface ProductCardProps {
  product: Product;
  showStoreName?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showStoreName = false,
}) => {
  const navigate = useNavigate();
  const {
    favoritesProductIds,
    toggleFavoriteProduct,
    addToCart,
    getProductDiscountPercent,
    getStoreById,
  } = useMarketplace();

  const isFavorite = favoritesProductIds.includes(product.id);
  const discountPercent = getProductDiscountPercent(product);
  const store = showStoreName ? getStoreById(product.store_id) : undefined;
  const isOutOfStock = !product.is_available_for_sale || product.stock_quantity <= 0;

  const handleQuickAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;

    const defaultOptions: Record<string, string> = {};
    const defaultOptionIds: Record<string, string> = {};

    for (const group of product.variant_groups) {
      const availOpt = group.options.find((o) => o.stock_quantity > 0) || group.options[0];
      if (availOpt) {
        defaultOptions[group.name_ar] = availOpt.label_ar;
        defaultOptionIds[group.id] = availOpt.id;
      }
    }

    addToCart(product, 1, defaultOptions, defaultOptionIds);
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group bg-white rounded-2xl p-3 border border-[#E5EAED] shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer flex flex-col justify-between relative"
    >
      {/* Product Image Box */}
      <div className="relative w-full aspect-[4/3.2] rounded-xl bg-[#F8FAFC] overflow-hidden mb-2.5 flex items-center justify-center border border-[#E5EAED]/60">
        <img
          src={product.images[0]}
          alt={product.name_ar}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Discount Badge in Golden Yellow (#F3C95B) with Deep Navy text (#18343B) */}
        {discountPercent !== null && discountPercent > 0 && (
          <span
            dir="ltr"
            className="absolute top-2 right-2 bg-[#F3C95B] text-[#18343B] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs leading-tight"
          >
            -{discountPercent}%
          </span>
        )}

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavoriteProduct(product.id);
          }}
          aria-label="إضافة إلى المفضلة"
          className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs border border-[#E5EAED] shadow-2xs flex items-center justify-center text-[#74838A] hover:text-[#087E83] active:scale-95 transition"
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorite ? 'fill-[#087E83] text-[#087E83]' : 'text-[#74838A]'
            }`}
          />
        </button>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-[#18343B]/50 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-white text-[#18343B] text-xs font-extrabold px-3 py-1 rounded-full">
              غير متوفر حالياً
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1 justify-between px-0.5">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-1">
            <h3 className="text-[13.5px] font-extrabold text-[#18343B] line-clamp-1 leading-snug text-right">
              {product.name_ar}
            </h3>
          </div>

          {showStoreName && store && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/store/${store.id}`);
              }}
              className="text-[11px] font-bold text-[#087E83] hover:underline block text-right truncate max-w-full"
            >
              {store.name_ar || store.name_en}
            </button>
          )}

          {/* Availability & Variants Indicator */}
          <div className="flex items-center gap-2 text-[10.5px] text-[#74838A]">
            {!isOutOfStock ? (
              <span className="inline-flex items-center gap-1 text-[#087E83] font-bold">
                <CheckCircle2 className="w-3 h-3" />
                متوفر
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[#74838A] font-bold">
                <AlertCircle className="w-3 h-3" />
                نفد المخزون
              </span>
            )}
            {product.variant_groups.length > 0 && (
              <span>• خيارات متعددة</span>
            )}
          </div>
        </div>

        {/* Bottom Price + Turquoise Cart Button Row */}
        <div className="flex items-center justify-between gap-1.5 mt-2.5 pt-2 border-t border-[#E5EAED]/70">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-[14px] font-extrabold text-[#087E83] whitespace-nowrap">
              {product.price_lyd} <span className="text-[11px] font-bold">د.ل</span>
            </span>

            {product.old_price_lyd && product.old_price_lyd > product.price_lyd && (
              <span className="text-[11px] text-[#74838A] line-through whitespace-nowrap">
                {product.old_price_lyd} د.ل
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleQuickAddToCart}
            aria-label="إضافة إلى السلة"
            className={`h-8 px-3 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition active:scale-95 shrink-0 ${
              isOutOfStock
                ? 'bg-[#E5EAED] text-[#74838A] cursor-not-allowed'
                : 'bg-[#087E83] hover:bg-[#06666A] text-white shadow-2xs'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 stroke-[2.2]" />
            <span className="hidden sm:inline">أضف</span>
          </button>
        </div>
      </div>
    </div>
  );
};
