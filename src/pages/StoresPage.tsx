import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Store as StoreIcon } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { StoreCard } from '../components/StoreCard';

export const StoresPage: React.FC = () => {
  const navigate = useNavigate();
  const { stores, headerSearchQuery } = useMarketplace();

  const filteredStores = useMemo(() => {
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-[#18343B]">
            جميع المتاجر
          </h1>
          <p className="text-xs text-[#74838A]">
            اختر المتجر لتصفح منتجاته وخدماته المتوفرة داخل الكلية
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/account?become_merchant=1')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-extrabold transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>كن تاجراً في CampusMarket</span>
        </button>
      </div>

      {filteredStores.length === 0 ? (
        <div className="bg-white rounded-[28px] py-14 px-6 border border-[#E5EAED] shadow-card text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#EAF3F4] text-[#087E83] flex items-center justify-center mx-auto">
            <StoreIcon className="w-8 h-8" strokeWidth={1.8} />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base sm:text-lg font-extrabold text-[#18343B]">
              لا توجد متاجر حالياً
            </h2>
            <p className="text-xs sm:text-sm text-[#74838A]">
              سيتم عرض المتاجر هنا فور إضافتها واعتمادها
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/account?become_merchant=1')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs sm:text-sm font-extrabold shadow-xs transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>كن تاجراً في CampusMarket</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {filteredStores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}
    </div>
  );
};
