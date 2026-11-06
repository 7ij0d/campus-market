import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Heart,
  ShoppingCart,
  Store as StoreIcon,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const ProductDetailsPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const {
    products,
    stores,
    categories,
    favoritesProductIds,
    toggleFavoriteProduct,
    addToCart,
    getProductDiscountPercent,
  } = useMarketplace();

  const product = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId]
  );

  const store = useMemo(
    () => stores.find((s) => s.id === product?.store_id),
    [stores, product]
  );

  const category = useMemo(
    () => categories.find((c) => c.id === product?.category_id),
    [categories, product]
  );

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptionIds, setSelectedOptionIds] = useState<Record<string, string>>({});

  // Initialize default available option per variant group
  useEffect(() => {
    if (!product) return;
    const initialIds: Record<string, string> = {};
    for (const group of product.variant_groups) {
      const firstAvail =
        group.options.find((o) => o.stock_quantity > 0) || group.options[0];
      if (firstAvail) {
        initialIds[group.id] = firstAvail.id;
      }
    }
    setSelectedOptionIds(initialIds);
    setQuantity(1);
  }, [product]);

  if (!product || !store) {
    return (
      <div className="min-h-screen bg-[#F8F7FC] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <p className="text-base font-extrabold text-slate-800">
          المنتج المطلوب غير موجود.
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold"
        >
          العودة
        </button>
      </div>
    );
  }

  const isFavorite = favoritesProductIds.includes(product.id);
  const discountPercent = getProductDiscountPercent(product);

  // Calculate price modifier and option stock constraint
  let priceModifier = 0;
  let effectiveStock = product.stock_quantity;
  const selectedLabels: Record<string, string> = {};

  for (const group of product.variant_groups) {
    const chosenId = selectedOptionIds[group.id];
    const opt = group.options.find((o) => o.id === chosenId);
    if (opt) {
      priceModifier += opt.price_modifier_lyd;
      effectiveStock = Math.min(effectiveStock, opt.stock_quantity);
      selectedLabels[group.name_ar] = opt.label_ar;
    }
  }

  const finalUnitPrice = product.price_lyd + priceModifier;
  const finalOldPrice = product.old_price_lyd
    ? product.old_price_lyd + priceModifier
    : undefined;

  const isOutOfStock =
    !product.is_active ||
    !product.is_available_for_sale ||
    effectiveStock <= 0;

  const handleAdd = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedLabels, selectedOptionIds);
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] pb-28">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-extrabold text-slate-800 truncate max-w-[200px]">
            {product.name_ar}
          </h1>
          <button
            type="button"
            onClick={() => toggleFavoriteProduct(product.id)}
            className="w-9 h-9 rounded-full bg-slate-50 hover:bg-rose-50 flex items-center justify-center text-slate-700"
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-700'
              }`}
            />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Image Gallery Column */}
        <div className="space-y-3">
          <div className="relative aspect-[4/3.5] w-full rounded-3xl bg-white border border-slate-100 shadow-card overflow-hidden">
            <img
              src={product.images[activeImageIdx] || product.images[0]}
              alt={product.name_ar}
              className="w-full h-full object-cover"
            />
            {discountPercent !== null && discountPercent > 0 && (
              <span
                dir="ltr"
                className="absolute top-3 right-3 bg-[#EF5350] text-white text-xs font-extrabold px-3 py-1 rounded-full shadow"
              >
                -{discountPercent}%
              </span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                    activeImageIdx === idx
                      ? 'border-brand-600 shadow-xs'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name_ar} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Options Column */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Store & Category Pill Row */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => navigate(`/store/${store.id}`)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-extrabold transition"
              >
                <StoreIcon className="w-3.5 h-3.5" />
                <span className="font-en">{store.name_en}</span>
              </button>

              {category && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                  <Tag className="w-3 h-3" />
                  {category.name_ar}
                </span>
              )}
            </div>

            {/* Product Title & Price */}
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                {product.name_ar}
              </h2>
              {product.name_en && (
                <p dir="ltr" className="font-en text-xs text-slate-400 text-right">
                  {product.name_en}
                </p>
              )}

              <div className="flex items-baseline gap-2.5 mt-2">
                <span className="text-2xl font-extrabold text-brand-700">
                  {finalUnitPrice} <span className="text-sm">د.ل</span>
                </span>
                {finalOldPrice && finalOldPrice > finalUnitPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    {finalOldPrice} د.ل
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-100">
              {product.description_ar}
            </p>

            {/* Variant Groups (Sizes, Colors, Options) */}
            {product.variant_groups.map((group) => (
              <div key={group.id} className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-700">
                  {group.name_ar}:
                </label>
                <div className="flex flex-wrap gap-2">
                  {group.options.map((opt) => {
                    const isSelected = selectedOptionIds[group.id] === opt.id;
                    const optOut = opt.stock_quantity <= 0;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSelectedOptionIds((prev) => ({
                            ...prev,
                            [group.id]: opt.id,
                          }));
                          if (quantity > opt.stock_quantity && opt.stock_quantity > 0) {
                            setQuantity(opt.stock_quantity);
                          }
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'border-brand-600 bg-brand-600 text-white shadow-xs'
                            : optOut
                            ? 'border-slate-200 bg-slate-100 text-slate-400 line-through'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300'
                        }`}
                      >
                        <span>{opt.label_ar}</span>
                        {opt.price_modifier_lyd > 0 && (
                          <span className="text-[10px] opacity-90">
                            (+{opt.price_modifier_lyd} د.ل)
                          </span>
                        )}
                        {optOut && (
                          <span className="text-[10px] text-rose-500 font-extrabold no-underline">
                            (نفد)
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Stock Availability Indicator */}
            <div className="flex items-center justify-between pt-1">
              {isOutOfStock ? (
                <div className="inline-flex items-center gap-1.5 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl text-xs font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>هذا الخيار غير متوفر في المخزون حالياً</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>الكمية المتاحة في المخزون: {effectiveStock}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quantity Selector + Add to Cart CTA */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            {/* Quantity Stepper */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1">
              <button
                type="button"
                disabled={isOutOfStock || quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-lg bg-white text-slate-700 flex items-center justify-center disabled:opacity-40 shadow-2xs"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-en font-extrabold text-sm text-slate-800">
                {quantity}
              </span>
              <button
                type="button"
                disabled={isOutOfStock || quantity >= effectiveStock}
                onClick={() => setQuantity((q) => Math.min(effectiveStock, q + 1))}
                className="w-9 h-9 rounded-lg bg-white text-slate-700 flex items-center justify-center disabled:opacity-40 shadow-2xs"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAdd}
              className={`flex-1 h-11 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-98 ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>
                {isOutOfStock
                  ? 'نفدت الكمية من المخزون'
                  : `إضافة إلى السلة • ${finalUnitPrice * quantity} د.ل`}
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
