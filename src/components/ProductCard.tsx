import React from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
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

    // Pick first available default option for each variant group if any
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
      className="group bg-white rounded-2xl p-2.5 border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer flex flex-col justify-between relative"
    >
      {/* Product Image Box */}
      <div className="relative w-full aspect-[4/3.3] rounded-xl bg-[#F6F5FA] overflow-hidden mb-2.5 flex items-center justify-center">
        <img
          src={product.images[0]}
          alt={product.name_ar}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Discount Badge (Top Right in RTL, matching `-20%` coral pill in reference) */}
        {discountPercent !== null && discountPercent > 0 && (
          <span
            dir="ltr"
            className="absolute top-2 right-2 bg-[#EF5350] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm leading-tight"
          >
            -{discountPercent}%
          </span>
        )}

        {/* Favorite Button (Top Left in RTL, white circle with subtle outline heart) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavoriteProduct(product.id);
          }}
          aria-label="إضافة إلى المفضلة"
          className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/95 backdrop-blur-sm shadow-sm flex items-center justify-center text-slate-600 hover:text-rose-500 active:scale-95 transition"
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
            }`}
          />
        </button>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-white/95 text-slate-900 text-xs font-bold px-2.5 py-1 rounded-full">
              نفدت الكمية
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1 justify-between px-0.5">
        <div>
          <h3 className="text-[13.5px] font-bold text-slate-800 line-clamp-1 leading-snug text-right">
            {product.name_ar}
          </h3>

          {showStoreName && store && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/store/${store.id}`);
              }}
              className="text-[11px] font-medium text-brand-600 hover:underline mt-0.5 block text-right truncate max-w-full"
            >
              {store.name_en}
            </button>
          )}
        </div>

        {/* Bottom Price + Purple Cart Button Row (Matches Reference Screen 1 & 3) */}
        <div className="flex items-center justify-between gap-1.5 mt-2 pt-1">
          {/* Price Block (Right side in RTL) */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-[14px] font-extrabold text-brand-800 whitespace-nowrap">
              {product.price_lyd} <span className="text-[11px] font-bold">د.ل</span>
            </span>

            {product.old_price_lyd && product.old_price_lyd > product.price_lyd && (
              <span className="text-[11px] text-slate-400 line-through whitespace-nowrap">
                {product.old_price_lyd} د.ل
              </span>
            )}
          </div>

          {/* Compact Purple Rounded Cart Button (Left side in RTL) */}
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleQuickAddToCart}
            aria-label="إضافة إلى السلة"
            className={`h-8 px-3 rounded-lg flex items-center justify-center transition active:scale-95 shrink-0 ${
              isOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
            }`}
          >
            <ShoppingCart className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </div>
  );
};
