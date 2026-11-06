import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
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
      <div className="py-16 px-6 text-center space-y-4 bg-white rounded-3xl border border-[#E5EAED] shadow-card max-w-lg mx-auto my-6">
        <p className="text-base font-extrabold text-[#18343B]">
          لا توجد بيانات لهذا المنتج حالياً
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 rounded-full bg-[#087E83] text-white text-xs font-extrabold"
        >
          العودة
        </button>
      </div>
    );
  }

  const isFavorite = favoritesProductIds.includes(product.id);
  const discountPercent = getProductDiscountPercent(product);

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
    <div className="space-y-4">
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5EAED]">
        <div className="px-4 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-[#F8FAFC] border border-[#E5EAED] flex items-center justify-center text-[#18343B]"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <h1 className="text-sm font-extrabold text-[#18343B] truncate max-w-[200px]">
            {product.name_ar}
          </h1>
          <button
            type="button"
            onClick={() => toggleFavoriteProduct(product.id)}
            className="w-9 h-9 rounded-full bg-[#F8FAFC] border border-[#E5EAED] flex items-center justify-center text-[#18343B]"
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorite ? 'fill-[#087E83] text-[#087E83]' : 'text-[#18343B]'
              }`}
            />
          </button>
        </div>
      </header>

      <main className="px-4 lg:px-0 pt-2 lg:pt-0 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <div className="relative aspect-[4/3.4] w-full rounded-3xl bg-white border border-[#E5EAED] shadow-card overflow-hidden">
            <img
              src={product.images[activeImageIdx] || product.images[0]}
              alt={product.name_ar}
              className="w-full h-full object-cover"
            />
            {discountPercent !== null && discountPercent > 0 && (
              <span
                dir="ltr"
                className="absolute top-3 right-3 bg-[#F3C95B] text-[#18343B] text-xs font-extrabold px-3 py-1 rounded-full shadow-2xs"
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
                  className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition shrink-0 ${
                    activeImageIdx === idx
                      ? 'border-[#087E83]'
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

        <div className="bg-white rounded-3xl p-5 border border-[#E5EAED] shadow-card space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => navigate(`/store/${store.id}`)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF3F4] text-[#087E83] text-xs font-extrabold transition"
              >
                <StoreIcon className="w-3.5 h-3.5" />
                <span>{store.name_ar || store.name_en}</span>
              </button>

              {category && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F8FAFC] border border-[#E5EAED] text-[#74838A] text-[11px] font-bold">
                  <Tag className="w-3 h-3 text-[#087E83]" />
                  {category.name_ar}
                </span>
              )}
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-[#18343B]">
                {product.name_ar}
              </h2>

              <div className="flex items-baseline gap-2.5 mt-2">
                <span className="text-2xl font-extrabold text-[#087E83]">
                  {finalUnitPrice} <span className="text-sm">د.ل</span>
                </span>
                {finalOldPrice && finalOldPrice > finalUnitPrice && (
                  <span className="text-sm text-[#74838A] line-through">
                    {finalOldPrice} د.ل
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#74838A] leading-relaxed bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E5EAED]">
              {product.description_ar}
            </p>

            {product.variant_groups.map((group) => (
              <div key={group.id} className="space-y-2">
                <label className="block text-xs font-extrabold text-[#18343B]">
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
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'border-[#087E83] bg-[#087E83] text-white'
                            : optOut
                            ? 'border-[#E5EAED] bg-[#F8FAFC] text-[#74838A] line-through'
                            : 'border-[#E5EAED] bg-white text-[#18343B] hover:border-[#36A6A6]'
                        }`}
                      >
                        <span>{opt.label_ar}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div>
              {isOutOfStock ? (
                <div className="inline-flex items-center gap-1.5 text-[#74838A] bg-[#F8FAFC] border border-[#E5EAED] px-3 py-1.5 rounded-xl text-xs font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>غير متوفر حالياً</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-[#087E83] bg-[#EAF3F4] px-3 py-1.5 rounded-xl text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>متوفر ({effectiveStock})</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5EAED] flex items-center gap-3">
            <div className="flex items-center bg-[#F8FAFC] border border-[#E5EAED] rounded-xl p-1">
              <button
                type="button"
                disabled={isOutOfStock || quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-lg bg-white text-[#18343B] flex items-center justify-center disabled:opacity-40"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-en font-extrabold text-sm text-[#18343B]">
                {quantity}
              </span>
              <button
                type="button"
                disabled={isOutOfStock || quantity >= effectiveStock}
                onClick={() => setQuantity((q) => Math.min(effectiveStock, q + 1))}
                className="w-9 h-9 rounded-lg bg-white text-[#18343B] flex items-center justify-center disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAdd}
              className={`flex-1 h-11 rounded-full font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-98 ${
                isOutOfStock
                  ? 'bg-[#E5EAED] text-[#74838A] cursor-not-allowed'
                  : 'bg-[#087E83] hover:bg-[#06666A] text-white shadow-sm'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>إضافة إلى السلة • {finalUnitPrice * quantity} د.ل</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
