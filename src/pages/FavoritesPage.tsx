import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowRight, Store as StoreIcon, ChevronLeft } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/ProductCard';

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, stores, favoritesProductIds, favoritesStoreIds } =
    useMarketplace();

  const favProducts = useMemo(
    () => products.filter((p) => favoritesProductIds.includes(p.id)),
    [products, favoritesProductIds]
  );

  const favStores = useMemo(
    () => stores.filter((s) => favoritesStoreIds.includes(s.id)),
    [stores, favoritesStoreIds]
  );

  return (
    <div className="space-y-4">
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5EAED] shadow-header">
        <div className="px-4 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-[#F8FAFC] border border-[#E5EAED] flex items-center justify-center text-[#18343B]"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <h1 className="text-base font-extrabold text-[#18343B]">المفضلة</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="px-4 lg:px-0 pt-2 lg:pt-0 space-y-5">
        {favStores.length === 0 && favProducts.length === 0 ? (
          <div className="bg-white rounded-3xl py-16 px-6 text-center border border-[#E5EAED] shadow-card max-w-xl mx-auto my-4 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#F0F7F7] border border-[#C5E0E1] text-[#087E83] flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 stroke-[1.7]" />
            </div>
            <h2 className="text-lg font-extrabold text-[#18343B]">
              لا توجد عناصر في المفضلة حالياً
            </h2>
            <p className="text-xs sm:text-sm text-[#74838A]">
              يمكنك حفظ المتاجر والمنتجات التي تهمك للوصول إليها بسرعة.
            </p>
            <button
              type="button"
              onClick={() => navigate('/stores')}
              className="mt-2 h-11 px-6 rounded-full bg-[#087E83] text-white text-xs font-extrabold"
            >
              تصفح المتاجر
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {favStores.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-extrabold text-[#18343B]">
                  المتاجر المفضلة ({favStores.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {favStores.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => navigate(`/store/${st.id}`)}
                      className="bg-white p-3.5 rounded-2xl border border-[#E5EAED] shadow-card flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#EAF3F4] text-[#087E83] flex items-center justify-center">
                          <StoreIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xs font-extrabold text-[#18343B]">
                            {st.name_ar || st.name_en}
                          </h3>
                          <p className="text-[11px] text-[#74838A]">
                            {st.activity_type_ar}
                          </p>
                        </div>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-[#74838A]" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {favProducts.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-extrabold text-[#18343B]">
                  المنتجات المفضلة ({favProducts.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {favProducts.map((prod) => (
                    <ProductCard key={prod.id} product={prod} showStoreName />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
