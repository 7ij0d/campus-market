import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/ProductCard';
import { StoreCard } from '../components/StoreCard';

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
    <div className="space-y-5">
      <h1 className="text-lg sm:text-xl font-extrabold text-[#18343B]">
        المفضلة
      </h1>

      {favStores.length === 0 && favProducts.length === 0 ? (
        <div className="bg-white rounded-[28px] py-14 px-6 text-center border border-[#E5EAED] shadow-card max-w-xl mx-auto space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#EAF3F4] text-[#087E83] flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 stroke-[1.7]" />
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-[#18343B]">
            لا توجد عناصر في المفضلة حالياً
          </h2>
          <p className="text-xs sm:text-sm text-[#74838A]">
            يمكنك حفظ المتاجر التي تهمك للوصول إليها بسرعة.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-2 h-11 px-6 rounded-full bg-[#087E83] text-white text-xs font-extrabold"
          >
            استكشف المتاجر
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {favStores.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-extrabold text-[#18343B]">
                المتاجر المفضلة ({favStores.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {favStores.map((st) => (
                  <StoreCard key={st.id} store={st} />
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
    </div>
  );
};
